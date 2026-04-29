"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { studentApi, financeApi, academicApi, communicationApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [academic, setAcademic] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const fetchData = async () => {
      try {
        if (user.studentProfile?.id) {
          const [profileRes, feesRes, academicRes, annRes] = await Promise.all([
            studentApi.getById(user.studentProfile.id),
            financeApi.getFees(user.studentProfile.id),
            academicApi.getSummary(user.studentProfile.id),
            communicationApi.getAnnouncements('STUDENTS')
          ]);
          setStudentData(profileRes.data);
          setFees(feesRes.data);
          setAcademic(academicRes.data);
          setAnnouncements(annRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getFullUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  const student = studentData || {
    user: { name: "Arjun Sharma" },
    regNo: "RP-2024-8842",
    courses: [{ course: { name: "Grade 12 - Medical" } }],
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col pb-20 md:pb-0">
      {/* TopAppBar */}
      <header className="bg-white flex justify-between items-center px-4 h-14 w-full sticky top-0 border-b border-slate-200 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Rankers' Platform Logo" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-on-surface">{student.user.name}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{student.regNo}</p>
          </div>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary border border-outline-variant hover:border-primary transition-all cursor-pointer overflow-hidden">
            {student.user.photoUrl ? (
              <img src={getFullUrl(student.user.photoUrl)!} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              student.user.name[0]
            )}
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Profile Header Section */}
        <div className="mb-8 p-6 bg-white border border-outline-variant rounded-xl flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-surface-container-high overflow-hidden bg-slate-100 flex items-center justify-center">
               {student.user.photoUrl ? (
                <img src={getFullUrl(student.user.photoUrl)!} alt="Student Photo" className="w-full h-full object-cover" />
               ) : (
                <span className="text-3xl font-black text-primary">{student.user.name[0]}</span>
               )}
            </div>
            <div className="absolute bottom-0 right-0 bg-secondary text-white p-1 rounded-full border-2 border-white">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="font-h1 text-primary text-3xl font-bold">{student.user?.name}</h1>
            <p className="font-body-md text-slate-500 flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="material-symbols-outlined text-sm">id_card</span>
              Reg No: <span className="font-semibold text-on-surface">{student.regNo}</span>
            </p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-[12px] font-semibold uppercase tracking-wider rounded-full">
                {student.courses?.[0]?.course?.name || "No Active Course"}
              </span>
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[12px] font-semibold uppercase tracking-wider rounded-full">
                Scholarship Tier A
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">Current Standing</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-secondary">Top 5%</span>
            </div>
          </div>
        </div>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Academic Fee Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="text-secondary font-bold text-xs flex items-center bg-secondary/10 px-2 py-0.5 rounded-full">
                Next Due: {fees.length > 0 ? new Date(fees[0].dueDate).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider mb-1">
                Pending Academic Fees
              </p>
              <h2 className="text-2xl font-bold text-primary">
                ₹{fees.reduce((acc, f) => f.status !== 'PAID' ? acc + f.amount : acc, 0).toLocaleString()}
              </h2>
            </div>
          </div>
          
          {/* Scholarship Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-secondary transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 text-secondary rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider mb-1">
                Scholarship Savings
              </p>
              <h2 className="text-2xl font-bold text-secondary">₹45,000</h2>
            </div>
          </div>
        </div>

        {/* Bento Grid Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Academic Progress (Spans 8 cols) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <span className="material-symbols-outlined text-surface-tint mb-2">event</span>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Next Test Date</p>
              </div>
              <div className="mt-4">
                <p className="text-xl font-bold">
                  {academic?.lastTest?.test?.date ? new Date(academic.lastTest.test.date).toLocaleDateString() : "TBD"}
                </p>
                <p className="text-[12px] text-error font-medium">
                  {academic?.lastTest?.test?.title || "No Upcoming Tests"}
                </p>
              </div>
            </div>
            <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <span className="material-symbols-outlined text-secondary mb-2">grade</span>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Last Score</p>
              </div>
              <div className="mt-4">
                <p className="text-xl font-bold">
                  {academic?.lastTest?.marksObtained || 0}
                  <span className="text-sm text-slate-400">/{academic?.lastTest?.test?.maxMarks || 0}</span>
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: `${(academic?.lastTest?.marksObtained / academic?.lastTest?.test?.maxMarks) * 100 || 0}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <span className="material-symbols-outlined text-tertiary-container mb-2">calendar_today</span>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Attendance %</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <p className="text-xl font-bold">{academic?.attendance?.percentage || 0}%</p>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${academic?.attendance?.percentage >= 85 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                  {academic?.attendance?.percentage >= 85 ? 'ON TRACK' : 'LOW'}
                </span>
              </div>
            </div>

            {/* Detailed Analytics Placeholder/Card */}
            <div className="sm:col-span-3 bg-white border border-outline-variant p-6 rounded-xl overflow-hidden relative min-h-[200px] flex items-end">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <img
                  alt="Background Chart"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEYqFaBnPtsljl26lMWCfeuavbWEuNJxK1n1Jxch9Hsg5U2n_oNFP6xM0GJXBTTFYSI1QLmBfB2H6jzKAqfsPdnqDFXUysewaMG7HpOqfO8PGPnCG6f-Mx60Y-vp65zpAIHn5GijYropnwQ6e2gxRLSTNYX7G-NrWQg7EXQJ41PuYQNY_bqadAYPmJKbGXQMZYmzMN9jGiDEedGpFZulvofF9o8pxSVej6GfxJwIKkYf5lcVyWin4hVX627boiDKPsWFFcoByyDpU7"
                />
              </div>
              <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-1">Performance Insight</h3>
                  <p className="text-sm text-slate-600 max-w-md">
                    Your strong suit is Biological Sciences. Focus on Organic Chemistry mechanisms this week.
                  </p>
                </div>
                <button className="bg-primary text-white px-6 py-2.5 rounded-full text-[12px] font-semibold uppercase tracking-wider hover:bg-primary-container transition-all active:scale-95 shrink-0 cursor-pointer">
                  VIEW ANALYTICS report
                </button>
              </div>
            </div>
          </div>

          {/* Financial Summary (Spans 4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                Finance Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[12px] font-semibold uppercase tracking-wider">
                  <span className="text-slate-500">Fees Paid</span>
                  <span className="text-primary font-bold">₹1,20,000 / ₹1,80,000</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "66.6%" }}></div>
                </div>
                <div className="p-4 bg-white/60 rounded-lg border border-white/80">
                  <p className="text-[12px] text-slate-600 mb-1">Next Installment due by 15th Nov</p>
                  <p className="text-xl font-bold">₹60,000</p>
                </div>
                <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer">
                  Pay Now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Notice Board */}
            <div className="bg-white border border-outline-variant p-6 rounded-xl flex-grow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">campaign</span>
                  Notice Board
                </h3>
                <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {announcements.length} NEW
                </span>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {announcements.length > 0 ? (
                  announcements.map((ann: any) => (
                    <div key={ann.id} className={`group border-l-4 ${ann.type === 'URGENT' ? 'border-error' : 'border-secondary'} pl-3 py-1 cursor-pointer`}>
                      <p className={`text-[12px] font-bold mb-0.5 ${ann.type === 'URGENT' ? 'text-error' : 'text-secondary'}`}>
                        {ann.type}
                      </p>
                      <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {ann.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 opacity-40">
                    <p className="text-xs font-bold">No new updates</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-12">
            <h3 className="text-xl font-bold text-primary mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                className="flex items-center gap-4 p-4 bg-white border border-outline-variant rounded-xl hover:border-surface-tint hover:bg-surface-container-low transition-all group"
                href="#"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <span className="font-semibold text-on-surface">View Result</span>
              </a>
              <a
                className="flex items-center gap-4 p-4 bg-white border border-outline-variant rounded-xl hover:border-surface-tint hover:bg-surface-container-low transition-all group"
                href="#"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">download</span>
                </div>
                <span className="font-semibold text-on-surface">Download Notes</span>
              </a>
              <a
                className="flex items-center gap-4 p-4 bg-white border border-outline-variant rounded-xl hover:border-surface-tint hover:bg-surface-container-low transition-all group"
                href="#"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <span className="font-semibold text-on-surface">Hostel Status</span>
              </a>
              <a
                className="flex items-center gap-4 p-4 bg-white border border-outline-variant rounded-xl hover:border-surface-tint hover:bg-surface-container-low transition-all group"
                href="#"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <span className="font-semibold text-on-surface">Help Desk</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-slate-50 border-t border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="font-black text-primary uppercase tracking-tighter">Rankers' Platform</p>
            <p className="font-inter text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 Institutional Excellence Suite
            </p>
          </div>
          <div className="flex gap-6">
            <Link className="font-inter text-xs font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors" href="/privacy-policy">
              Privacy
            </Link>
            <Link className="font-inter text-xs font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors" href="/terms-of-service">
              Terms
            </Link>
            <Link className="font-inter text-xs font-black text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors" href="/support">
              Support
            </Link>
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <button className="flex flex-col items-center justify-center bg-surface-variant text-on-surface-variant rounded-xl px-3 py-1 tap-highlight-transparent active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
          <span className="font-inter text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 px-3 py-1 tap-highlight-transparent active:scale-90 transition-transform hover:text-secondary">
          <span className="material-symbols-outlined">school</span>
          <span className="font-inter text-[10px] font-medium">Academics</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 px-3 py-1 tap-highlight-transparent active:scale-90 transition-transform hover:text-secondary">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-inter text-[10px] font-medium">Finance</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 px-3 py-1 tap-highlight-transparent active:scale-90 transition-transform hover:text-secondary">
          <span className="material-symbols-outlined">forum</span>
          <span className="font-inter text-[10px] font-medium">Connect</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 px-3 py-1 tap-highlight-transparent active:scale-90 transition-transform hover:text-secondary">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="font-inter text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}
