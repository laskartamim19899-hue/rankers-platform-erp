"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { communicationApi, inquiryApi, reportApi, studentApi } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await studentApi.searchByRegNo(searchQuery);
      setSearchResult(res.data);
    } catch (err) {
      alert("Student not found");
    } finally {
      setIsSearching(false);
    }
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [pendingRes, inquiriesRes, announcementsRes] = await Promise.all([
          studentApi.getPending(),
          inquiryApi.getAll(),
          communicationApi.getAnnouncements()
        ]);
        
        const newNotifs = [
          ...pendingRes.data.map((s: any) => ({ 
            id: `p-${s.id}`, 
            text: `New Registration: ${s.user.name}`, 
            type: 'ADMISSION', 
            link: '/admin/students/pending' 
          })),
          ...inquiriesRes.data.filter((i: any) => i.status === 'NEW').map((i: any) => ({ 
            id: `i-${i.id}`, 
            text: `Inquiry from ${i.name}`, 
            type: 'INQUIRY', 
            link: '/admin/inquiries' 
          })),
          ...announcementsRes.data.slice(0, 3).map((a: any) => ({
            id: `a-${a.id}`,
            text: `Blast: ${a.title}`,
            type: 'ANNOUNCEMENT',
            link: '/admin/announcements'
          }))
        ];
        setNotifications(newNotifs);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    if (userData.role === "STUDENT") {
      router.push("/student/dashboard");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await reportApi.getFinanceSummary();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    
    fetchStats();
    fetchNotifications();

    // Poll every 30 seconds so LIVE count badge stays accurate
    const liveInterval = setInterval(fetchStats, 30_000);
    return () => clearInterval(liveInterval);
  }, [router]);

  const getFullUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col pb-20 md:pb-0">
      {/* TopAppBar */}
      <header className="bg-white dark:bg-slate-950 text-primary dark:text-blue-400 font-inter text-sm font-semibold tracking-tight border-b border-slate-200 dark:border-slate-800 transition-all flex justify-between items-center px-4 h-14 w-full sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Rankers' Platform Logo" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="material-symbols-outlined p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer relative"
          >
            notifications
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800 py-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-6 py-2 border-b border-slate-50 dark:border-slate-800 mb-2 flex justify-between items-center">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Notifications</h3>
                <span className="text-[10px] font-bold text-primary">{notifications.length} New</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <Link 
                    key={n.id} 
                    href={n.link}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      n.type === 'ADMISSION' ? 'bg-amber-50 text-amber-600' : 
                      n.type === 'ANNOUNCEMENT' ? 'bg-purple-50 text-purple-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {n.type === 'ADMISSION' ? 'person_add' : 
                         n.type === 'ANNOUNCEMENT' ? 'campaign' :
                         'mail'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">{n.text}</p>
                  </Link>
                )) : (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">notifications_off</span>
                    <p className="text-xs text-slate-400 font-bold uppercase">All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <Link href="/profile" className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4 ml-2 group cursor-pointer">
            <div className="text-right">
              <p className="text-[10px] leading-tight text-slate-500 uppercase tracking-widest font-bold">
                {user?.name?.split(' ')[0]}'s
              </p>
              <p className="text-xs font-bold text-on-background group-hover:text-primary transition-colors">Identity</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary border border-slate-200 group-hover:border-primary transition-all overflow-hidden">
              {user?.photoUrl ? (
                <img src={getFullUrl(user.photoUrl)!} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'A'
              )}
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-h1 text-primary text-3xl font-bold mb-1">Administrative Intelligence</h1>
            <p className="font-body-md text-slate-500">
              Real-time oversight of institutional health and academic performance.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Link href="/admin/academics/cbt" className="bg-indigo-600 text-white px-6 h-12 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-200 hover:bg-indigo-700">
              <span className="material-symbols-outlined text-[18px]">computer</span>
              CBT System
            </Link>
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                placeholder="Search Reg No (e.g. 1, 2...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm group-hover:shadow-md"
              />
              <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <button type="submit" className="hidden">Search</button>
            </form>
            <Link href="/admission" className="bg-primary text-on-primary px-6 h-12 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 hover:bg-slate-800">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Admission
            </Link>
          </div>
        </div>

        {/* Search Results Modal-like section */}
        {searchResult && (
          <div className="mb-8 bg-white rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black overflow-hidden">
                  {searchResult.user.photoUrl ? (
                    <img src={getFullUrl(searchResult.user.photoUrl)!} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    searchResult.user.name[0]
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black">{searchResult.user.name}</h2>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{searchResult.regNo} • {searchResult.courses[0]?.course.name}</p>
                </div>
              </div>
              <button onClick={() => setSearchResult(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-sm text-primary">phone</span>
                    <span className="text-sm font-bold">{searchResult.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-sm text-primary">mail</span>
                    <span className="text-sm font-bold">{searchResult.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-sm text-primary">person</span>
                    <span className="text-sm font-bold">Guardian: {searchResult.guardianName}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                    All Pending Dues
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded">All Pending & Future</span>
                </div>
                <div className="space-y-3">
                  {searchResult.fees.length > 0 ? searchResult.fees.map((fee: any) => {
                    const isOverdue = new Date(fee.dueDate) <= new Date();
                    const paid = (fee.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                    const gross = fee.amount + (fee.lateFee || 0);
                    const remaining = Math.max(0, gross - paid);
                    return (
                      <div key={fee.id} className={`bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm ${isOverdue ? 'border-red-200' : 'border-blue-100'}`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-black text-slate-900">{fee.type} FEE</p>
                            {isOverdue ? (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">OVERDUE</span>
                            ) : (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">UPCOMING</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fee.month || 'ACADEMIC'} • DUE {new Date(fee.dueDate).toLocaleDateString()}</p>
                          {fee.status === 'PARTIAL' && (
                            <p className="text-[9px] text-orange-600 font-black uppercase mt-0.5">Partial Payment Made</p>
                          )}
                          {fee.lateFee > 0 && (
                            <p className="text-[9px] text-red-500 font-black mt-0.5">+₹{fee.lateFee} late fine</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${isOverdue ? 'text-red-600' : 'text-blue-700'}`}>₹{remaining.toLocaleString()}</p>
                          {paid > 0 && <p className="text-[9px] text-emerald-600 font-bold">₹{paid.toLocaleString()} paid</p>}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-6">
                      <p className="text-sm font-black text-emerald-600 uppercase">✅ No Pending Dues — All Clear!</p>
                    </div>
                  )}
                </div>
                {searchResult.fees.length > 0 && (() => {
                  const today = new Date();
                  let overdueTotal = 0;
                  let futureTotal = 0;
                  searchResult.fees.forEach((f: any) => {
                    const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                    const remaining = Math.max(0, (f.amount + (f.lateFee || 0)) - paid);
                    if (new Date(f.dueDate) <= today) overdueTotal += remaining;
                    else futureTotal += remaining;
                  });
                  return (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-red-500 uppercase">🔴 Overdue Now</p>
                        <p className="text-sm font-black text-red-600">₹{overdueTotal.toLocaleString()}</p>
                      </div>
                      {futureTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-blue-500 uppercase">🔵 Future Upcoming</p>
                          <p className="text-sm font-black text-blue-600">₹{futureTotal.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-600 uppercase">Total Outstanding</p>
                        <p className="text-xl font-black text-slate-900">₹{(overdueTotal + futureTotal).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Link href={`/admin/finance`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Go to Treasury</Link>
            </div>
          </div>
        )}

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Stat 1 - Live Student Count */}
          <Link href="/admin/students" className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                  LIVE COUNT
                </span>
                {stats?.hostelStudents != null && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                    🏠 {stats.hostelStudents} Hostel
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-label-caps text-[12px] font-semibold tracking-wider uppercase mb-1">
                Active Students
              </p>
              <h2 className="text-3xl font-bold text-primary">
                {stats?.liveActiveStudents?.toLocaleString() ?? stats?.totalStudents?.toLocaleString() ?? 0}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                View All <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </p>
            </div>
          </Link>
          {/* Stat 2 */}
          <Link href="/admin/reports/collections" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                Live Flow <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-label-caps text-[12px] font-semibold tracking-wider uppercase mb-1">
                Fees Collected
              </p>
              <h2 className="text-3xl font-bold text-primary">₹{stats?.collected?.toLocaleString() || 0}</h2>
            </div>
          </Link>
          {/* Stat 3 */}
          <Link href="/admin/reports/defaulters" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-red-500 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-50 text-red-700 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                Tracking <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-label-caps text-[12px] font-semibold tracking-wider uppercase mb-1">
                Overdue Dues
              </p>
              <h2 className="text-3xl font-bold text-red-600">₹{(stats?.pendingOverdue ?? stats?.pending ?? 0).toLocaleString()}</h2>
              {stats?.totalOutstanding != null && stats.totalOutstanding !== stats?.pendingOverdue && (
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  Total Outstanding: ₹{stats.totalOutstanding.toLocaleString()}
                </p>
              )}
            </div>
          </Link>
          {/* Stat 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary-fixed text-tertiary rounded-lg">
                <span className="material-symbols-outlined">star</span>
              </div>
              <span className="text-slate-500 font-bold text-xs">Top 5% Avg.</span>
            </div>
            <div>
              <p className="text-slate-500 font-label-caps text-[12px] font-semibold tracking-wider uppercase mb-1">
                Top Performers
              </p>
              <h2 className="text-3xl font-bold text-primary">
                {stats?.topPerformers?.toLocaleString() || 0} <span className="text-body-md font-normal text-slate-400">Students</span>
              </h2>
            </div>
          </div>
          {/* Stat 5 - Reserve Fund */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div className="text-right">
                <span className="text-purple-600 font-bold text-[10px] bg-purple-50 px-2 py-0.5 rounded-full block mb-1">
                  {stats?.reserveFund?.percentage || 60}% of Academics
                </span>
                <span className="text-slate-400 font-bold text-[8px] uppercase tracking-widest block">
                  ₹{stats?.reserveFund?.spent?.toLocaleString() || 0} Used
                </span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-label-caps text-[12px] font-semibold tracking-wider uppercase mb-1">
                Reserve Available
              </p>
              <h2 className="text-3xl font-bold text-purple-600">₹{stats?.reserveFund?.available?.toLocaleString() || 0}</h2>
            </div>
          </div>
          {/* Stat 6 - General Fund */}
          <div className={`bg-white p-5 rounded-2xl border ${stats?.generalFund?.available < 0 ? 'border-red-200 bg-red-50/10' : 'border-slate-200'} shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stats?.generalFund?.available < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                <span className="material-symbols-outlined">{stats?.generalFund?.available < 0 ? 'warning' : 'account_balance'}</span>
              </div>
              <div className="text-right">
                {stats?.generalFund?.available < 0 ? (
                  <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded-full block mb-1 animate-pulse">
                    Deficit Alert
                  </span>
                ) : (
                  <span className="text-slate-600 font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded-full block mb-1">
                    Operating Fund
                  </span>
                )}
                <span className="text-slate-400 font-bold text-[8px] uppercase tracking-widest block">
                  ₹{stats?.generalFund?.spent?.toLocaleString() || 0} Used
                </span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-label-caps text-[12px] font-semibold tracking-wider uppercase mb-1">
                General Fund Available
              </p>
              <h2 className={`text-3xl font-bold ${stats?.generalFund?.available < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                {stats?.generalFund?.available < 0 
                  ? `-₹${Math.abs(stats.generalFund.available).toLocaleString()}` 
                  : `₹${stats?.generalFund?.available?.toLocaleString() || 0}`}
              </h2>
            </div>
          </div>
        </div>

        {/* Charts & Activity Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Line Chart: Revenue */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary">Revenue Growth</h3>
              <select className="text-xs font-semibold border border-slate-200 rounded-lg py-1 px-3 bg-slate-50 outline-none">
                <option>Last 6 Months</option>
                <option>Current Year</option>
              </select>
            </div>
            {/* Dynamic Chart Visualization */}
            <div className="relative h-64 w-full flex flex-col justify-end">
              <div className="absolute inset-0 flex flex-col justify-between py-2 border-l border-b border-slate-100">
                <div className="w-full border-t border-slate-50 h-px"></div>
                <div className="w-full border-t border-slate-50 h-px"></div>
                <div className="w-full border-t border-slate-50 h-px"></div>
                <div className="w-full border-t border-slate-50 h-px"></div>
              </div>
              <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {(() => {
                  if (!stats?.revenueOverTime || stats.revenueOverTime.length === 0) return null;
                  const maxAmt = Math.max(...stats.revenueOverTime.map((r: any) => r.amount), 1);
                  const points = stats.revenueOverTime.map((r: any, i: number) => {
                    const x = (i / Math.max(stats.revenueOverTime.length - 1, 1)) * 800;
                    const y = 200 - ((r.amount / maxAmt) * 160); // max height is 160
                    return `${x},${y}`;
                  });
                  const pathD = `M${points.join(' L')}`;
                  const areaD = `${pathD} L800,200 L0,200 Z`;
                  return (
                    <>
                      <path d={areaD} fill="url(#line-grad)"></path>
                      <path d={pathD} fill="none" stroke="#00236f" strokeLinecap="round" strokeWidth="3"></path>
                      {points.map((p: string, i: number) => {
                        const [x, y] = p.split(',');
                        return <circle key={i} cx={x} cy={y} fill="#00236f" r="4"></circle>
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 px-2 uppercase tracking-tighter">
                {stats?.revenueOverTime?.map((r: any, idx: number) => (
                  <span key={idx}>{r.month}</span>
                ))}
                {(!stats?.revenueOverTime || stats.revenueOverTime.length === 0) && <span>No data</span>}
              </div>
            </div>
          </div>
          {/* Bar Chart: Batch Distribution */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-6">Batch Distribution</h3>
            <div className="space-y-6">
              {stats?.batchDistribution?.map((batch: any, i: number) => {
                const colors = ['bg-primary', 'bg-on-primary-container', 'bg-secondary', 'bg-tertiary'];
                const total = stats?.totalStudents || 1;
                const percentage = Math.round((batch.count / total) * 100) || 0;
                return (
                  <div key={batch.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">{batch.name}</span>
                      <span className="text-sm font-bold text-primary">{batch.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-8 rounded-xl overflow-hidden flex">
                      <div className={`${colors[i % colors.length]} h-full`} style={{ width: `${percentage}%` }} title={`${percentage}%`}></div>
                    </div>
                  </div>
                );
              })}
              {(!stats?.batchDistribution || stats.batchDistribution.length === 0) && (
                <p className="text-sm text-slate-400">No batches available.</p>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center italic">"Live Batch Utilization Overview"</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-label-caps text-slate-500 uppercase tracking-widest text-[10px] font-semibold">
              Operations
            </h4>
            <Link href="/admin/academics/cbt" className="w-full flex items-center justify-between p-4 bg-indigo-600 border border-indigo-500 rounded-xl hover:bg-indigo-700 transition-colors group cursor-pointer text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 text-white rounded-lg group-hover:bg-white/20">
                  <span className="material-symbols-outlined">computer</span>
                </div>
                <div>
                  <span className="font-bold text-sm block">CBT Exam Engine</span>
                  <span className="text-[10px] text-indigo-100 font-black uppercase tracking-widest">NTA/NEET Mock Test Manager</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">chevron_right</span>
            </Link>
            <Link href="/admin/transactions" className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors group cursor-pointer shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-lg">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <span className="font-bold text-sm block">Financial Master Ledger</span>
                  <span className="text-[10px] text-primary/70 font-black uppercase tracking-widest">Real-time Balance: LIVE</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/50">chevron_right</span>
            </Link>
            <Link href="/admin/students" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-100">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm block">Student Intelligence</span>
                  <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Master Database & Enrollment</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/reports" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-variant text-blue-700 rounded-lg group-hover:bg-blue-100">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <span className="font-semibold text-sm">Institutional Analytics</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/finance/allocation" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-indigo-700 rounded-lg group-hover:bg-indigo-100">
                  <span className="material-symbols-outlined">assignment_add</span>
                </div>
                <span className="font-semibold text-sm">Bulk Fee Allocation</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/expenses" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-700 rounded-lg group-hover:bg-red-100">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <span className="font-semibold text-sm">Expenses & Vouchers</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/finance" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="font-semibold text-sm">Record Fees & Income</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/finance/other-income" className="w-full flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Income & Investments</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Add Misc. Revenue</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-500">chevron_right</span>
            </Link>
            <Link href="/admin/finance/ledger" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-100">
                  <span className="material-symbols-outlined">manage_search</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Student Ledger</span>
                  <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Fee & Transaction History</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/academics" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100">
                  <span className="material-symbols-outlined">how_to_reg</span>
                </div>
                <span className="font-semibold text-sm">Mark Daily Attendance</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/hostel" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-700 rounded-lg group-hover:bg-slate-100">
                  <span className="material-symbols-outlined">bed</span>
                </div>
                <span className="font-semibold text-sm">Hostel & Room Allocation</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/leave" className="w-full flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-200">
                  <span className="material-symbols-outlined">luggage</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Leave Management</span>
                  <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Issue & Track Student Leaves</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-amber-400">chevron_right</span>
            </Link>
            <Link href="/admin/timetable" className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-200">
                  <span className="material-symbols-outlined">calendar_view_week</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Timetable Manager</span>
                  <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Weekly Schedule Builder</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-blue-400">chevron_right</span>
            </Link>
            <Link href="/admin/inventory" className="w-full flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-200">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Inventory & Library</span>
                  <span className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Stock & Issue Tracker</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-purple-400">chevron_right</span>
            </Link>
            <Link href="/admin/reports" className="w-full flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg group-hover:bg-teal-200">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Institutional Reports</span>
                  <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest">Analytics & Payroll</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-teal-400">chevron_right</span>
            </Link>
            <Link href="/admin/merit" className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-300 rounded-xl hover:bg-yellow-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg group-hover:bg-yellow-200">
                  <span className="material-symbols-outlined">emoji_events</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Merit & Scholarship Board</span>
                  <span className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">Rankings & Certificates</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-yellow-500">chevron_right</span>
            </Link>
            <Link href="/admin/announcements" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-700 rounded-lg group-hover:bg-orange-100">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <span className="font-semibold text-sm">Institutional Bulletin</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/inquiries" className="w-full flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-200">
                  <span className="material-symbols-outlined">contact_mail</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Admission Inquiries</span>
                  <span className="text-[10px] text-rose-600 font-black uppercase tracking-widest">Lead & Prospect Tracking</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-rose-400">chevron_right</span>
            </Link>
            <Link href="/admin/academic/report-cards" className="w-full flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-200">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Report Card Engine</span>
                  <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Generate A4 Results</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-indigo-400">chevron_right</span>
            </Link>
            <Link href="/admin/communication/whatsapp" className="w-full flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">WhatsApp Notification</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">CRM & Mass Messaging</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-400">chevron_right</span>
            </Link>
            <Link href="/admin/settings" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-700 rounded-lg group-hover:bg-slate-100">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <span className="font-semibold text-sm">Institution Settings</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <Link href="/admin/staff-hub" className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer text-white shadow-xl shadow-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 text-white rounded-lg group-hover:bg-white/20">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Unified Staff Hub</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">HR, Regular & Guest Payroll</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">chevron_right</span>
            </Link>
            <Link href="/admin/transport" className="w-full flex items-center justify-between p-4 bg-cyan-50 border border-cyan-200 rounded-xl hover:bg-cyan-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg group-hover:bg-cyan-200">
                  <span className="material-symbols-outlined">directions_bus</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Transport Management</span>
                  <span className="text-[10px] text-cyan-600 font-black uppercase tracking-widest">Vehicles, Routes & Allocations</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-cyan-400">chevron_right</span>
            </Link>
            <Link href="/admin/certificates" className="w-full flex items-center justify-between p-4 bg-fuchsia-50 border border-fuchsia-200 rounded-xl hover:bg-fuchsia-100 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-fuchsia-100 text-fuchsia-700 rounded-lg group-hover:bg-fuchsia-200">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <div>
                  <span className="font-semibold text-sm block">Document & Certificate Hub</span>
                  <span className="text-[10px] text-fuchsia-600 font-black uppercase tracking-widest">Issue TCs, Bonafides, etc.</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-fuchsia-400">chevron_right</span>
            </Link>
          </div>
          {/* Recent Activity Feed */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary">Recent Stream</h3>
              <button className="text-xs text-secondary font-bold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {stats?.recentStream?.map((item: any, idx: number) => {
                const timeAgo = (dateStr: string) => {
                  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
                  if (diff < 1) return 'Just now';
                  if (diff < 60) return `${diff} mins ago`;
                  const hours = Math.floor(diff / 60);
                  if (hours < 24) return `${hours} hrs ago`;
                  return `${Math.floor(hours / 24)} days ago`;
                };

                if (item.type === 'ENROLLMENT') {
                  const student = item.data;
                  return (
                    <div key={`enroll-${student.id}`} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                        <span className="material-symbols-outlined text-slate-500">person_add</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <p className="text-sm">
                            <span className="font-bold text-primary">{student.user.name}</span> enrolled in{" "}
                            <span className="font-semibold">
                              {student.courses?.[0]?.batch?.name ? `${student.courses[0].batch.name} (${student.courses[0].course?.name})` : student.courses?.[0]?.course?.name || 'a course'}
                            </span>
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{timeAgo(item.date)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Reg No: {student.regNo}</p>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'PAYMENT') {
                  const payment = item.data;
                  return (
                    <div key={`pay-${payment.id}`} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <p className="text-sm">
                            <span className="font-bold text-primary">Fee Payment Received</span> for{" "}
                            <span className="font-semibold">{payment.student?.user?.name || 'Student'}</span>
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{timeAgo(item.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">
                            ₹{payment.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">via {payment.paymentMode}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              
              {(!stats?.recentStream || stats.recentStream.length === 0) && (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-slate-400 font-medium">No recent activity found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full py-8 mt-auto opacity-80 hover:opacity-100 transition-all duration-150 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-inter text-xs text-slate-500 font-bold">
            © 2026 Rankers' Platform. Institutional ERP Suite v2.1
          </p>
          <div className="flex gap-6">
            <Link className="font-inter text-xs text-slate-500 hover:text-primary font-bold uppercase tracking-widest transition-colors" href="/privacy-policy">
              Privacy
            </Link>
            <Link className="font-inter text-xs text-slate-500 hover:text-primary font-bold uppercase tracking-widest transition-colors" href="/terms-of-service">
              Terms
            </Link>
            <Link className="font-inter text-xs text-slate-500 hover:text-primary font-bold uppercase tracking-widest transition-colors" href="/faculty">
              Faculty
            </Link>
            <Link className="font-inter text-xs text-slate-500 hover:text-primary font-bold uppercase tracking-widest transition-colors" href="/support">
              Support
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <Link href="/admin/dashboard" className="flex flex-col items-center justify-center bg-surface-variant dark:bg-slate-800 text-on-surface-variant dark:text-slate-100 rounded-xl px-3 py-1 tap-highlight-transparent active:scale-90 transition-transform">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-inter text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/admin/students" className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-3 py-1 hover:text-secondary dark:hover:text-blue-300 tap-highlight-transparent active:scale-90 transition-transform">
          <span className="material-symbols-outlined">school</span>
          <span className="font-inter text-[10px] font-medium">Academics</span>
        </Link>
        <Link href="/admin/finance" className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-3 py-1 hover:text-secondary dark:hover:text-blue-300 tap-highlight-transparent active:scale-90 transition-transform">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-inter text-[10px] font-medium">Finance</span>
        </Link>
        <Link href="/admin/academics/cbt" className="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 px-3 py-1 hover:text-indigo-800 tap-highlight-transparent active:scale-90 transition-transform font-bold">
          <span className="material-symbols-outlined">computer</span>
          <span className="font-inter text-[10px] font-medium">CBT</span>
        </Link>
        <Link href="/admin/announcements" className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-3 py-1 hover:text-secondary dark:hover:text-blue-300 tap-highlight-transparent active:scale-90 transition-transform">
          <span className="material-symbols-outlined">campaign</span>
          <span className="font-inter text-[10px] font-medium">Connect</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-3 py-1 hover:text-secondary dark:hover:text-blue-300 tap-highlight-transparent active:scale-90 transition-transform">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="font-inter text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
