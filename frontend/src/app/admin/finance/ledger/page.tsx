"use client";

import { useState, useRef } from "react";
import { financeApi } from "@/lib/api";
import Link from "next/link";

export default function StudentLedger() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"fees" | "transactions">("fees");
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSelected(null);
    setSearched(true);
    try {
      const res = await financeApi.ledgerSearch(query.trim());
      setResults(res.data);
      if (res.data.length === 1) setSelected(res.data[0]);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const paymentModeIcon: Record<string, string> = {
    CASH: "payments", UPI: "qr_code_scanner", ONLINE: "account_balance", CHEQUE: "receipt_long"
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 gap-4">
        <Link href="/admin/finance" className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-black text-primary tracking-tight leading-none">Student Financial Ledger</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Fee & Transaction History</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-3">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">manage_search</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Student Name or Registration Number (e.g. RP-2026-0001)..."
                className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-primary text-sm font-medium shadow-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? (
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined">search</span>
              )}
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Multiple Results Picker */}
        {results.length > 1 && !selected && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{results.length} Students Found — Select One</p>
            </div>
            <div className="divide-y divide-slate-50">
              {results.map((r: any) => (
                <button
                  key={r.student.id}
                  onClick={() => setSelected(r)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-lg">
                      {r.student.user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{r.student.user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.student.regNo} • {r.student.courses[0]?.course?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-red-600">₹{r.summary.totalRemaining.toLocaleString()} due</p>
                    <p className="text-[10px] text-emerald-600 font-bold">₹{r.summary.totalPaid.toLocaleString()} paid</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searched && !isSearching && results.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
            <span className="material-symbols-outlined text-slate-200 text-6xl">person_search</span>
            <h3 className="text-slate-900 font-black mt-4">No Student Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try a different name or registration number.</p>
          </div>
        )}

        {/* Ledger View */}
        {selected && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Student Profile Card */}
            <div className="bg-gradient-to-br from-primary to-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-primary/20">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-black flex-shrink-0">
                  {selected.student.user.name[0]}
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selected.student.user.name}</h2>
                      <p className="text-sm font-bold opacity-70 uppercase tracking-widest mt-1">{selected.student.regNo || "Reg. Pending"}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selected.student.courses.map((c: any) => (
                          <span key={c.courseId} className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {c.batch?.name ? `${c.batch.name} • ` : ""}{c.course?.name}
                          </span>
                        ))}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selected.student.status === "APPROVED" ? "bg-emerald-500/30" : "bg-amber-500/30"}`}>
                          {selected.student.status}
                        </span>
                        {selected.student.isResidential && (
                          <span className="bg-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Residential</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => { setSelected(null); setResults([]); setSearched(false); setQuery(""); }}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                    <div>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Guardian</p>
                      <p className="font-black">{selected.student.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Phone</p>
                      <p className="font-black">{selected.student.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Email</p>
                      <p className="font-bold text-xs truncate">{selected.student.user.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Date of Birth</p>
                      <p className="font-black">{fmtDate(selected.student.dob)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Gender</p>
                      <p className="font-black capitalize">{selected.student.gender}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Enrolled</p>
                      <p className="font-black">{fmtDate(selected.student.user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Allocated</p>
                <p className="text-2xl font-black text-slate-900">₹{selected.summary.totalAllocated.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 text-center shadow-sm">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-2xl font-black text-emerald-700">₹{selected.summary.totalPaid.toLocaleString()}</p>
              </div>
              <div className={`rounded-2xl border p-5 text-center shadow-sm ${selected.summary.totalRemaining > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selected.summary.totalRemaining > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {selected.summary.totalRemaining > 0 ? "Outstanding Due" : "Fully Cleared"}
                </p>
                <p className={`text-2xl font-black ${selected.summary.totalRemaining > 0 ? "text-red-700" : "text-emerald-700"}`}>
                  ₹{selected.summary.totalRemaining.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm">
              {[
                { key: "fees", label: "Fee Breakdown", icon: "receipt" },
                { key: "transactions", label: "Transaction History", icon: "history" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.key ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-primary"}`}
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Fee Breakdown Tab */}
            {activeTab === "fees" && (
              <div className="space-y-6">
                {/* Academic Fees */}
                {selected.academicFees.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">school</span>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">Academic Fees</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Yearly Course Fee</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {["Course", "Due Date", "Base Amount", "Late Fine", "Total", "Paid", "Remaining", "Status"].map(h => (
                              <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selected.academicFees.map((f: any) => (
                            <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 text-xs font-bold text-slate-800">{f.course.name}</td>
                              <td className="px-4 py-4 text-xs text-slate-500">{fmtDate(f.dueDate)}</td>
                              <td className="px-4 py-4 text-xs font-black text-slate-800">₹{f.amount.toLocaleString()}</td>
                              <td className="px-4 py-4 text-xs font-bold text-orange-600">{f.lateFee > 0 ? `₹${f.lateFee}` : "—"}</td>
                              <td className="px-4 py-4 text-xs font-black text-slate-900">₹{(f.amount + (f.lateFee || 0)).toLocaleString()}</td>
                              <td className="px-4 py-4 text-xs font-black text-emerald-600">₹{f.totalPaid.toLocaleString()}</td>
                              <td className="px-4 py-4 text-xs font-black text-red-600">₹{f.remaining.toLocaleString()}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${f.status === "PAID" ? "bg-emerald-100 text-emerald-700" : f.status === "PARTIAL" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                                  {f.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Hostel Fees */}
                {selected.hostelFees.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">bed</span>
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900">Hostel Fees</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Residential Charges</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold">
                          {selected.hostelFees.filter((f: any) => f.status === "PAID").length}/{selected.hostelFees.length} months cleared
                        </p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {["Month", "Due Date", "Amount", "Late Fine", "Total", "Paid", "Remaining", "Status"].map(h => (
                              <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selected.hostelFees.map((f: any) => (
                            <tr key={f.id} className={`transition-colors ${f.status === "PENDING" ? "hover:bg-red-50/30" : f.status === "PARTIAL" ? "hover:bg-orange-50/30" : "hover:bg-emerald-50/30"}`}>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">{f.month}</span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(f.dueDate)}</td>
                              <td className="px-4 py-3 text-xs font-black text-slate-800">₹{f.amount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-xs font-bold text-orange-600">{f.lateFee > 0 ? `₹${f.lateFee}` : "—"}</td>
                              <td className="px-4 py-3 text-xs font-black text-slate-900">₹{(f.amount + (f.lateFee || 0)).toLocaleString()}</td>
                              <td className="px-4 py-3 text-xs font-black text-emerald-600">₹{f.totalPaid.toLocaleString()}</td>
                              <td className="px-4 py-3 text-xs font-black text-red-600">₹{f.remaining.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${f.status === "PAID" ? "bg-emerald-100 text-emerald-700" : f.status === "PARTIAL" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                                  {f.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selected.academicFees.length === 0 && selected.hostelFees.length === 0 && (
                  <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                    <span className="material-symbols-outlined text-slate-200 text-6xl">receipt_long</span>
                    <p className="font-black text-slate-400 mt-4">No Fees Allocated Yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === "transactions" && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900">Payment Transactions</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selected.transactions.length} records found</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Total ₹{selected.summary.totalPaid.toLocaleString()} Collected
                  </span>
                </div>

                {selected.transactions.length === 0 ? (
                  <div className="p-16 text-center">
                    <span className="material-symbols-outlined text-slate-200 text-6xl">receipt</span>
                    <p className="font-black text-slate-400 mt-4">No Payments Made Yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {selected.transactions.map((txn: any, idx: number) => (
                      <div key={txn.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">
                              {paymentModeIcon[txn.paymentMode] || "payments"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black text-slate-900">₹{txn.amount.toLocaleString()}</p>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${txn.feeType === "HOSTEL" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                {txn.feeType} {txn.feeMonth ? `• ${txn.feeMonth}` : ""}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{txn.paymentMode}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              TXN: <span className="text-primary font-black">{txn.transactionId || "—"}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black text-slate-700">{fmtDate(txn.date)}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{fmtTime(txn.date)}</p>
                          <Link href={`/receipt/${txn.id}`} className="text-[9px] text-primary font-black hover:underline uppercase tracking-wider">
                            View Receipt →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searched && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">manage_search</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Student Ledger Lookup</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Search by student name or registration number to view their complete fee schedule and payment history.</p>
            <div className="flex justify-center gap-6 mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span> Academic Fees</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">bed</span> Hostel Fees</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">history</span> All Transactions</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
