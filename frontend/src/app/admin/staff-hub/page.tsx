"use client";
import { useState, useEffect } from "react";
import { userApi, salaryApi, guestApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Shared Constants ---
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentMonth = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;

const designationColors: Record<string, string> = {
  TEACHER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
  ACCOUNTANT: "bg-emerald-100 text-emerald-700",
  PEON: "bg-amber-100 text-amber-700",
  OTHER: "bg-slate-100 text-slate-600",
};

export default function UnifiedStaffHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"staff" | "payroll" | "guest">("staff");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/login"); return; }
    setCurrentUser(JSON.parse(userStr));
  }, [router]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Universal Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-sm">groups</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Unified Staff Hub</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">HR, Roles & Payroll</p>
            </div>
          </div>
        </div>

        {/* Master Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
          <button onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">badge</span>
            Staff & Roles
          </button>
          <button onClick={() => setActiveTab("payroll")}
            className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'payroll' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-400 hover:text-violet-600'}`}>
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">payments</span>
            Regular Payroll
          </button>
          <button onClick={() => setActiveTab("guest")}
            className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'guest' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-400 hover:text-orange-600'}`}>
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">person_apron</span>
            Guest Teachers
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === "staff" && <StaffRolesTab currentUser={currentUser} />}
        {activeTab === "payroll" && <StaffPayrollTab />}
        {activeTab === "guest" && <GuestTeacherTab />}
      </main>
    </div>
  );
}

// ====================================================================================
// TAB 1: REGULAR STAFF & ROLES (Account Creation)
// ====================================================================================
function StaffRolesTab({ currentUser }: { currentUser: any }) {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "TEACHER" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchStaff(); }, []);
  const fetchStaff = async () => { try { const res = await userApi.getStaff(); setStaff(res.data); } catch { } finally { setIsLoading(false); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await userApi.createStaff(formData);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "TEACHER" });
      fetchStaff();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to create staff account"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    try { await userApi.deleteStaff(id); fetchStaff(); } catch { alert("Failed to delete"); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-slate-800" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-800">Institution Staff Accounts</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage login access, emails, and roles for regular employees.</p>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button onClick={() => setShowModal(true)} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Add Staff
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-800 border border-slate-200 text-xl">
                {member.name[0]}
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                member.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                member.role === 'ACCOUNTANT' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>{member.role}</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-900 leading-tight">{member.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{member.email}</p>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added {new Date(member.createdAt).toLocaleDateString()}</span>
                {currentUser?.role === "SUPER_ADMIN" && (
                  <button onClick={() => handleDelete(member.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Staff Account</h2>
              <button onClick={() => setShowModal(false)} className="material-symbols-outlined text-slate-400">close</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-medium" placeholder="e.g. Dr. Salman Khan" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-medium" placeholder="name@rankersplatform.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Login Password</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-medium" placeholder="Min. 8 characters" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Assign Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TEACHER', 'ACCOUNTANT', 'ADMIN'].map(role => (
                    <button key={role} type="button" onClick={() => setFormData({...formData, role})}
                      className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.role === role ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-900'}`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg">
                {isSubmitting ? "Creating..." : "Confirm & Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================================================
// TAB 2: REGULAR STAFF PAYROLL
// ====================================================================================
function StaffPayrollTab() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [view, setView] = useState<"list" | "profile" | "disburse">("list");
  const [search, setSearch] = useState("");

  const [designation, setDesignation] = useState(""); const [department, setDepartment] = useState(""); const [baseSalary, setBaseSalary] = useState(""); const [bankAccount, setBankAccount] = useState(""); const [ifscCode, setIfscCode] = useState("");
  const [month, setMonth] = useState(currentMonth); const [basicSalary, setBasicSalary] = useState(""); const [allowances, setAllowances] = useState("0"); const [deductions, setDeductions] = useState("0"); const [paymentMode, setPaymentMode] = useState("CASH"); const [transactionId, setTransactionId] = useState(""); const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => { fetchStaff(); }, []);
  const fetchStaff = async () => { setIsLoading(true); try { const res = await salaryApi.getAll(); setStaff(res.data); } catch { } finally { setIsLoading(false); } };

  const handleSelectStaff = async (s: any) => {
    setSelectedStaff(s);
    if (s.staffProfile?.id) {
      const res = await salaryApi.getHistory(s.staffProfile.id);
      setSalaryHistory(res.data);
      setTotalPaid(res.data.filter((r: any) => r.status === 'PAID').reduce((sum: number, r: any) => sum + r.netSalary, 0));
    } else { setSalaryHistory([]); setTotalPaid(0); }
    setDesignation(s.staffProfile?.designation || ""); setDepartment(s.staffProfile?.department || ""); setBaseSalary(s.staffProfile?.baseSalary?.toString() || ""); setBankAccount(s.staffProfile?.bankAccount || ""); setIfscCode(s.staffProfile?.ifscCode || "");
    setBasicSalary(s.staffProfile?.baseSalary?.toString() || "");
    setView("profile");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try { await salaryApi.upsertProfile({ userId: selectedStaff.id, designation, department, baseSalary, bankAccount, ifscCode }); alert("Profile saved!"); fetchStaff(); }
    catch { alert("Failed to save profile"); } finally { setIsSubmitting(false); }
  };

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedStaff?.staffProfile?.id) { alert("Save profile first!"); return; }
    setIsSubmitting(true);
    try {
      const res = await salaryApi.disburse({ staffProfileId: selectedStaff.staffProfile.id, month, basicSalary, allowances, deductions, paymentMode, transactionId, remarks });
      alert("Salary disbursed!"); router.push(`/salary-slip/${res.data.id}`);
    } catch { alert("Failed to disburse"); } finally { setIsSubmitting(false); }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Delete this salary record?")) return;
    try { await salaryApi.deleteRecord(id); if (selectedStaff?.staffProfile?.id) { const res = await salaryApi.getHistory(selectedStaff.staffProfile.id); setSalaryHistory(res.data); } }
    catch { alert("Failed to delete"); }
  };

  const net = parseFloat(basicSalary || "0") + parseFloat(allowances || "0") - parseFloat(deductions || "0");
  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none text-sm font-medium" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center"><h2 className="font-black text-slate-800 text-sm">Staff Payroll DB</h2><span className="text-[10px] font-bold text-slate-400">{filtered.length} found</span></div>
          {isLoading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div> : (
            <div className="divide-y divide-slate-50">
              {filtered.map(s => (
                <button key={s.id} onClick={() => handleSelectStaff(s)} className={`w-full flex items-center gap-3 p-4 text-left hover:bg-violet-50 transition-colors ${selectedStaff?.id === s.id ? "bg-violet-50 border-l-4 border-violet-500" : ""}`}>
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-black text-sm flex-shrink-0">{s.name[0]}</div>
                  <div className="flex-1 min-w-0"><p className="font-black text-slate-900 text-sm truncate">{s.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{s.role}</p></div>
                  <div className="text-right flex-shrink-0">{s.staffProfile ? <p className="text-xs font-black text-emerald-600">₹{s.staffProfile.baseSalary?.toLocaleString()}</p> : <span className="text-[9px] text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-full">Setup</span>}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-5">
        {!selectedStaff ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">person_search</span><p className="font-black text-slate-400 text-lg">Select a Staff Member</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-violet-900 to-slate-900 rounded-2xl p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl">{selectedStaff.name[0]}</div>
                <div><h2 className="text-xl font-black">{selectedStaff.name}</h2><p className="text-white/50 text-xs font-bold uppercase tracking-widest">{selectedStaff.email}</p></div>
              </div>
              <div className="text-right"><p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Paid (YTD)</p><p className="text-3xl font-black text-amber-400">₹{totalPaid.toLocaleString()}</p></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setView("profile")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${view === "profile" ? "bg-violet-600 text-white shadow-lg" : "bg-white border text-slate-600"}`}>Profile & Setup</button>
              <button onClick={() => setView("disburse")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${view === "disburse" ? "bg-emerald-600 text-white shadow-lg" : "bg-white border text-slate-600"}`}>Disburse Salary</button>
            </div>

            {view === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation *</label><select value={designation} onChange={e=>setDesignation(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none font-bold text-sm"><option value="">-- Select --</option><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option><option value="ACCOUNTANT">Accountant</option><option value="PEON">Peon</option><option value="OTHER">Other</option></select></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label><input value={department} onChange={e=>setDepartment(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Monthly (₹) *</label><input type="number" value={baseSalary} onChange={e=>{setBaseSalary(e.target.value); setBasicSalary(e.target.value);}} required className="w-full h-12 px-4 rounded-xl border outline-none font-black text-violet-700 text-lg" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Account No.</label><input value={bankAccount} onChange={e=>setBankAccount(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>
                  <div className="space-y-1 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label><input value={ifscCode} onChange={e=>setIfscCode(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>
                  <button type="submit" disabled={isSubmitting} className="col-span-2 w-full h-12 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-sm">{isSubmitting ? "Saving..." : "Save Profile"}</button>
                </form>

                {salaryHistory.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-black text-slate-700 text-sm mb-3 uppercase tracking-widest">Salary History</h4>
                    <div className="space-y-2">{salaryHistory.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div><p className="font-black text-slate-800 text-sm">{r.month}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{r.paymentMode} · {new Date(r.paidAt).toLocaleDateString()}</p></div>
                        <div className="flex items-center gap-3"><p className="font-black text-emerald-600">₹{r.netSalary.toLocaleString()}</p><Link href={`/salary-slip/${r.id}`} className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">print</span></Link><button onClick={() => handleDeleteRecord(r.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button></div>
                      </div>
                    ))}</div>
                  </div>
                )}
              </div>
            )}

            {view === "disburse" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <form onSubmit={handleDisburse} className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Month *</label><select value={month} onChange={e=>setMonth(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none font-bold text-sm">{MONTHS.map(m=>{const yr=new Date().getFullYear();return [yr-1, yr].flatMap(y=>[`${m} ${y}`]);}).flat().map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Salary (₹) *</label><input type="number" value={basicSalary} onChange={e=>setBasicSalary(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none font-black text-emerald-700 text-lg" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances (₹)</label><input type="number" value={allowances} onChange={e=>setAllowances(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-black text-blue-700" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions (₹)</label><input type="number" value={deductions} onChange={e=>setDeductions(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-black text-red-700" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary (Auto)</label><div className="h-12 px-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 flex items-center font-black text-emerald-700 text-xl">₹{net.toLocaleString()}</div></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode *</label><select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-bold text-sm"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="UPI">UPI</option></select></div>
                  {paymentMode !== "CASH" && <div className="space-y-1 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</label><input value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>}
                  <div className="space-y-1 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</label><input value={remarks} onChange={e=>setRemarks(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>
                  <div className="col-span-2"><button type="submit" disabled={isSubmitting || !selectedStaff?.staffProfile} className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm">{isSubmitting ? "Processing..." : "Disburse & Generate Slip"}</button></div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ====================================================================================
// TAB 3: GUEST TEACHERS (Per-Class Payment)
// ====================================================================================
function GuestTeacherTab() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [tab, setTab] = useState<"register" | "pay">("register");

  const [rName, setRName] = useState(""); const [rPhone, setRPhone] = useState(""); const [rEmail, setREmail] = useState(""); const [rSubject, setRSubject] = useState(""); const [rQual, setRQual] = useState(""); const [rRate, setRRate] = useState("");
  const [editMode, setEditMode] = useState(false); const [saving, setSaving] = useState(false);
  
  const [month, setMonth] = useState(currentMonth); const [classesHeld, setClassesHeld] = useState(""); const [ratePerClass, setRatePerClass] = useState(""); const [allowances, setAllowances] = useState("0"); const [paymentMode, setPaymentMode] = useState("CASH"); const [transactionId, setTransactionId] = useState(""); const [remarks, setRemarks] = useState("");
  const [paying, setPaying] = useState(false); const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => { setIsLoading(true); try { const r = await guestApi.getAll(); setTeachers(r.data); } catch { } finally { setIsLoading(false); } };

  const handleSelect = async (t: any) => {
    setSelected(t); setEditMode(false);
    setRName(t.name); setRPhone(t.phone || ""); setREmail(t.email || ""); setRSubject(t.subject); setRQual(t.qualification || ""); setRRate(t.ratePerClass.toString()); setRatePerClass(t.ratePerClass.toString());
    const r = await guestApi.getHistory(t.id); setHistory(r.data); setTotalPaid(r.data.filter((p:any)=>p.status==='PAID').reduce((s:number,p:any)=>s+p.totalAmount,0)); setTab("pay");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editMode && selected) { await guestApi.update(selected.id, { name: rName, phone: rPhone, email: rEmail, subject: rSubject, qualification: rQual, ratePerClass: rRate }); alert("Updated!"); }
      else { await guestApi.create({ name: rName, phone: rPhone, email: rEmail, subject: rSubject, qualification: rQual, ratePerClass: rRate }); alert("Registered!"); setRName(""); setRPhone(""); setREmail(""); setRSubject(""); setRQual(""); setRRate(""); }
      fetchAll();
    } catch { alert("Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => { 
    if (!confirm("WIPE TEACHER DATA? This will permanently delete the teacher profile, ALL payment history, and ALL associated ledger/expense records. This cannot be undone! Proceed?")) return; 
    try { 
      await guestApi.remove(id); 
      setSelected(null); 
      fetchAll(); 
    } catch { 
      alert("Failed to wipe teacher data."); 
    } 
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setPaying(true);
    try { const res = await guestApi.pay({ guestTeacherId: selected.id, month, classesHeld, ratePerClass, allowances, paymentMode, transactionId, remarks }); alert("Payment done!"); router.push(`/guest-slip/${res.data.id}`); }
    catch { alert("Failed"); } finally { setPaying(false); }
  };

  const handleDeletePayment = async (pid: string) => {
    if (!confirm("Delete payment record and ledger entry?")) return;
    try {
      await guestApi.deletePayment(pid);
      if (selected) { 
        const r = await guestApi.getHistory(selected.id); 
        setHistory(r.data); 
        setTotalPaid(r.data.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.totalAmount, 0));
      }
    } catch (err: any) { 
      alert(err.response?.data?.message || "Failed to delete"); 
    }
  };

  const classAmt = parseFloat(classesHeld || "0") * parseFloat(ratePerClass || "0");
  const total = classAmt + parseFloat(allowances || "0");
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-1 space-y-4">
        <button onClick={() => { setSelected(null); setEditMode(false); setTab("register"); setRName(""); setRPhone(""); setREmail(""); setRSubject(""); setRQual(""); setRRate(""); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md"><span className="material-symbols-outlined text-sm">add</span> New Guest Teacher</button>
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full h-10 px-4 rounded-xl border border-slate-200 outline-none text-sm font-medium" /></div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between"><h2 className="font-black text-slate-800 text-sm">Guest DB</h2><span className="text-[10px] text-slate-400 font-bold">{filtered.length} found</span></div>
          {isLoading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" /></div> : (
            <div className="divide-y divide-slate-50">
              {filtered.map(t => (
                <button key={t.id} onClick={() => handleSelect(t)} className={`w-full flex items-center gap-3 p-4 text-left hover:bg-orange-50 transition-colors ${selected?.id===t.id?"bg-orange-50 border-l-4 border-orange-500":""}`}>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg flex-shrink-0">{t.name[0]}</div>
                  <div className="flex-1 min-w-0"><p className="font-black text-slate-900 text-sm truncate">{t.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{t.subject}</p></div>
                  <div className="text-right flex-shrink-0"><p className="text-xs font-black text-orange-600">₹{t.ratePerClass}/cls</p></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-5">
        {!selected && tab !== "register" ? (
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 text-center"><span className="material-symbols-outlined text-6xl text-slate-200 mb-4">person_search</span><p className="font-black text-slate-400 text-lg">Select a Guest Teacher</p></div>
        ) : (
          <>
            {selected && (
              <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-2xl p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">{selected.name[0]}</div><div><h2 className="text-xl font-black">{selected.name}</h2><p className="text-white/70 text-xs font-bold">{selected.subject}</p><p className="text-amber-100 text-sm font-black mt-1">₹{selected.ratePerClass}/class</p></div></div>
                <div className="text-right"><p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Paid</p><p className="text-3xl font-black">₹{totalPaid.toLocaleString()}</p></div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={()=>setTab("register")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab==="register"?"bg-orange-600 text-white shadow-lg":"bg-white border text-slate-600"}`}>{selected && editMode ? "Edit Profile" : "Register / Edit"}</button>
              <button onClick={()=>setTab("pay")} disabled={!selected} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab==="pay"?"bg-emerald-600 text-white shadow-lg":"bg-white border text-slate-600 disabled:opacity-40"}`}>Process Payment</button>
            </div>

            {tab === "register" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-5"><h3 className="font-black text-slate-800">Guest Teacher Profile</h3>{selected && <button onClick={()=>handleDelete(selected.id)} className="text-red-500 text-xs font-black uppercase tracking-widest flex items-center"><span className="material-symbols-outlined text-sm">delete</span> Delete</button>}</div>
                <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label><input value={rName} onChange={e=>setRName(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-orange-400 font-bold text-sm" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject *</label><input value={rSubject} onChange={e=>setRSubject(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-orange-400 font-bold text-sm" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label><input value={rPhone} onChange={e=>setRPhone(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Per Class (₹) *</label><input type="number" value={rRate} onChange={e=>{setRRate(e.target.value); if(!selected)setRatePerClass(e.target.value);}} required className="w-full h-12 px-4 rounded-xl border outline-none font-black text-orange-700 text-lg" /></div>
                  <div className="col-span-2"><button type="submit" disabled={saving} className="w-full h-12 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-sm">{saving ? "Saving..." : selected ? "Update Profile" : "Register Guest Teacher"}</button></div>
                </form>
              </div>
            )}

            {tab === "pay" && selected && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <form onSubmit={handlePay} className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Month *</label><select value={month} onChange={e=>setMonth(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none font-bold text-sm">{MONTHS.flatMap(m=>[new Date().getFullYear()-1,new Date().getFullYear()].map(y=>`${m} ${y}`)).map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. of Classes *</label><input type="number" min="1" value={classesHeld} onChange={e=>setClassesHeld(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none font-black text-emerald-700 text-2xl" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Per Class (₹) *</label><input type="number" value={ratePerClass} onChange={e=>setRatePerClass(e.target.value)} required className="w-full h-12 px-4 rounded-xl border outline-none font-black text-orange-700 text-xl" /></div>
                  
                  <div className="col-span-2 bg-slate-50 rounded-2xl border p-4 grid grid-cols-3 gap-3 text-center">
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Classes × Rate</p><p className="text-lg font-black text-slate-700">{classesHeld||"0"} × ₹{ratePerClass||"0"}</p></div>
                    <div className="border-x"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Amt</p><p className="text-lg font-black text-emerald-600">₹{classAmt.toLocaleString()}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p><p className="text-2xl font-black text-orange-600">₹{total.toLocaleString()}</p></div>
                  </div>

                  <div className="space-y-1 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances (₹)</label><input type="number" value={allowances} onChange={e=>setAllowances(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-bold text-blue-700" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode *</label><select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-bold text-sm"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank</option><option value="UPI">UPI</option></select></div>
                  {paymentMode !== "CASH" && <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Txn ID</label><input value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>}
                  <div className={`space-y-1 ${paymentMode !== "CASH" ? "" : "col-span-2"}`}><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</label><input value={remarks} onChange={e=>setRemarks(e.target.value)} className="w-full h-12 px-4 rounded-xl border outline-none font-medium text-sm" /></div>
                  
                  <div className="col-span-2"><button type="submit" disabled={paying} className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm">{paying ? "Processing..." : `Pay ₹${total.toLocaleString()} & Generate Slip`}</button></div>
                </form>

                {history.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-black text-slate-700 text-sm mb-3 uppercase tracking-widest border-t border-slate-100 pt-5">Payment History</h4>
                    <div className="space-y-2">{history.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                        <div><p className="font-black text-slate-800 text-sm">{p.month}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{p.classesHeld} classes × ₹{p.ratePerClass}</p></div>
                        <div className="flex items-center gap-3"><p className="font-black text-emerald-600">₹{p.totalAmount.toLocaleString()}</p><Link href={`/guest-slip/${p.id}`} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white"><span className="material-symbols-outlined text-sm">print</span></Link><button type="button" onClick={(e) => { e.stopPropagation(); handleDeletePayment(p.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"><span className="material-symbols-outlined text-sm">delete</span></button></div>
                      </div>
                    ))}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
