"use client";
import { useState, useEffect } from "react";
import { salaryApi, userApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentMonth = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;

const designationColors: Record<string, string> = {
  TEACHER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
  ACCOUNTANT: "bg-emerald-100 text-emerald-700",
  PEON: "bg-amber-100 text-amber-700",
  OTHER: "bg-slate-100 text-slate-600",
};

export default function SalaryManagement() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [view, setView] = useState<"list" | "profile" | "disburse">("list");
  const [search, setSearch] = useState("");

  // Profile form
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Disburse form
  const [month, setMonth] = useState(currentMonth);
  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("0");
  const [deductions, setDeductions] = useState("0");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await salaryApi.getAll();
      setStaff(res.data);
    } catch { } finally { setIsLoading(false); }
  };

  const handleSelectStaff = async (s: any) => {
    setSelectedStaff(s);
    if (s.staffProfile?.id) {
      const res = await salaryApi.getHistory(s.staffProfile.id);
      setSalaryHistory(res.data);
      const total = res.data.filter((r: any) => r.status === 'PAID').reduce((sum: number, r: any) => sum + r.netSalary, 0);
      setTotalPaid(total);
    } else {
      setSalaryHistory([]);
      setTotalPaid(0);
    }
    // Pre-fill profile form
    setDesignation(s.staffProfile?.designation || "");
    setDepartment(s.staffProfile?.department || "");
    setBaseSalary(s.staffProfile?.baseSalary?.toString() || "");
    setBankAccount(s.staffProfile?.bankAccount || "");
    setIfscCode(s.staffProfile?.ifscCode || "");
    // Pre-fill disburse from profile
    setBasicSalary(s.staffProfile?.baseSalary?.toString() || "");
    setView("profile");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await salaryApi.upsertProfile({ userId: selectedStaff.id, designation, department, baseSalary, bankAccount, ifscCode });
      alert("Profile saved!");
      fetchStaff();
    } catch { alert("Failed to save profile"); }
    finally { setIsSubmitting(false); }
  };

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff?.staffProfile?.id) { alert("Please save the staff profile first!"); return; }
    setIsSubmitting(true);
    try {
      const res = await salaryApi.disburse({
        staffProfileId: selectedStaff.staffProfile.id,
        month, basicSalary, allowances, deductions,
        paymentMode, transactionId, remarks
      });
      alert("Salary disbursed! Opening salary slip...");
      router.push(`/salary-slip/${res.data.id}`);
    } catch { alert("Failed to disburse salary"); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Delete this salary record?")) return;
    try {
      await salaryApi.deleteRecord(id);
      if (selectedStaff?.staffProfile?.id) {
        const res = await salaryApi.getHistory(selectedStaff.staffProfile.id);
        setSalaryHistory(res.data);
      }
    } catch { alert("Failed to delete"); }
  };

  const net = parseFloat(basicSalary || "0") + parseFloat(allowances || "0") - parseFloat(deductions || "0");
  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-600">payments</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Staff Salary Management</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payroll & Disbursement System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-200">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          {currentMonth}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT PANEL — Staff List ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none text-sm font-medium"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-slate-800 text-sm">Staff Members</h2>
              <span className="text-[10px] font-bold text-slate-400">{filtered.length} found</span>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" /></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <button key={s.id} onClick={() => handleSelectStaff(s)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-violet-50 transition-colors ${selectedStaff?.id === s.id ? "bg-violet-50 border-l-4 border-violet-500" : ""}`}>
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center font-black text-violet-700 text-sm overflow-hidden flex-shrink-0">
                      {s.photoUrl ? <img src={`http://localhost:5000${s.photoUrl}`} className="w-full h-full object-cover" alt="" /> : s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{s.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.staffProfile ? (
                        <p className="text-xs font-black text-emerald-600">₹{s.staffProfile.baseSalary?.toLocaleString('en-IN')}</p>
                      ) : (
                        <span className="text-[9px] text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-full">Setup</span>
                      )}
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center py-8 text-slate-400 font-bold text-sm">No staff found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lg:col-span-2 space-y-5">
          {!selectedStaff ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">person_search</span>
              <p className="font-black text-slate-400 text-lg">Select a Staff Member</p>
              <p className="text-sm text-slate-400 mt-1">Choose from the list to manage salary</p>
            </div>
          ) : (
            <>
              {/* Staff Header Card */}
              <div className="bg-gradient-to-br from-violet-900 to-slate-900 rounded-2xl p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-2xl overflow-hidden">
                    {selectedStaff.photoUrl ? <img src={`http://localhost:5000${selectedStaff.photoUrl}`} className="w-full h-full object-cover" alt="" /> : selectedStaff.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{selectedStaff.name}</h2>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{selectedStaff.email}</p>
                    {selectedStaff.staffProfile && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block ${designationColors[selectedStaff.staffProfile.designation] || designationColors.OTHER}`}>
                        {selectedStaff.staffProfile.designation} · {selectedStaff.staffProfile.department || selectedStaff.role}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Paid (YTD)</p>
                  <p className="text-3xl font-black text-amber-400">₹{totalPaid.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Tab Buttons */}
              <div className="flex gap-3">
                <button onClick={() => setView("profile")}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${view === "profile" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                  <span className="material-symbols-outlined text-sm mr-1 align-middle">manage_accounts</span>
                  Profile & Setup
                </button>
                <button onClick={() => setView("disburse")}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${view === "disburse" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
                  <span className="material-symbols-outlined text-sm mr-1 align-middle">payments</span>
                  Disburse Salary
                </button>
              </div>

              {/* Profile Setup Form */}
              {view === "profile" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-600">badge</span>
                    Staff Salary Profile
                  </h3>
                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation *</label>
                      <select value={designation} onChange={e => setDesignation(e.target.value)} required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none font-bold text-sm">
                        <option value="">-- Select --</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="PEON">Peon / Support</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                      <input value={department} onChange={e => setDepartment(e.target.value)}
                        placeholder="e.g. Physics, Biology, Admin"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none font-medium text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Monthly Salary (₹) *</label>
                      <input type="number" value={baseSalary} onChange={e => { setBaseSalary(e.target.value); setBasicSalary(e.target.value); }} required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none font-black text-violet-700 text-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Account No.</label>
                      <input value={bankAccount} onChange={e => setBankAccount(e.target.value)}
                        placeholder="Account number"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none font-medium text-sm" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
                      <input value={ifscCode} onChange={e => setIfscCode(e.target.value)}
                        placeholder="e.g. SBIN0001234"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none font-medium text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" disabled={isSubmitting}
                        className="w-full h-12 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-violet-700 transition-all disabled:opacity-50">
                        {isSubmitting ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </form>

                  {/* Salary History */}
                  {salaryHistory.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-black text-slate-700 text-sm mb-3 uppercase tracking-widest">Salary History</h4>
                      <div className="space-y-2">
                        {salaryHistory.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{r.month}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{r.paymentMode} · {new Date(r.paidAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-black text-emerald-600">₹{r.netSalary.toLocaleString('en-IN')}</p>
                              <Link href={`/salary-slip/${r.id}`} className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm">print</span>
                              </Link>
                              <button onClick={() => handleDeleteRecord(r.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Disburse Form */}
              {view === "disburse" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">account_balance_wallet</span>
                    Disburse Monthly Salary
                  </h3>
                  <form onSubmit={handleDisburse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Month *</label>
                      <select value={month} onChange={e => setMonth(e.target.value)} required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm">
                        {MONTHS.map(m => {
                          const yr = new Date().getFullYear();
                          return [yr-1, yr].flatMap(y => [`${m} ${y}`]);
                        }).flat().map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Salary (₹) *</label>
                      <input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-700 text-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances (₹)</label>
                      <input type="number" value={allowances} onChange={e => setAllowances(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-blue-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions (₹)</label>
                      <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-red-700" />
                    </div>
                    {/* Live Net Salary */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary (Auto)</label>
                      <div className="h-12 px-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 flex items-center font-black text-emerald-700 text-xl">
                        ₹{net.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode *</label>
                      <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm">
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>
                    {paymentMode !== "CASH" && (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID / Reference</label>
                        <input value={transactionId} onChange={e => setTransactionId(e.target.value)}
                          placeholder="UTR / Transaction Number"
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-sm" />
                      </div>
                    )}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</label>
                      <input value={remarks} onChange={e => setRemarks(e.target.value)}
                        placeholder="Optional note..."
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" disabled={isSubmitting || !selectedStaff?.staffProfile}
                        className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                        <span className="material-symbols-outlined">payments</span>
                        {isSubmitting ? "Processing..." : "Disburse & Generate Slip"}
                      </button>
                      {!selectedStaff?.staffProfile && (
                        <p className="text-center text-xs text-amber-600 font-bold mt-2">⚠ Save the staff profile first before disbursing salary.</p>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
