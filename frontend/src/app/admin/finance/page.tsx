"use client";

import { useState, useEffect, Suspense } from "react";
import { financeApi, settingsApi } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { exportToCSV } from "@/lib/utils";

function AdminFinanceContent() {
  const [dues, setDues] = useState<any[]>([]);
  const [filteredDues, setFilteredDues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [recording, setRecording] = useState(false);
  const [selectedFees, setSelectedFees] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [mercyReason, setMercyReason] = useState("");
  const [userRole, setUserRole] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleExport = () => {
    const exportData = filteredDues.map(d => ({
      "Student Name": d.student.user.name,
      "Registration No": d.student.regNo || "N/A",
      "Fee Type": d.type,
      "Month/Details": d.month || "Academic",
      "Principal Amount": d.amount,
      "Late Fee": d.lateFee,
      "Total Due": d.amount + d.lateFee,
      "Due Date": new Date(d.dueDate).toLocaleDateString(),
      "Status": d.status
    }));
    exportToCSV(exportData, "Financial_Dues");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
  }, []);

  useEffect(() => {
    const fetchDues = async () => {
      try {
        const res = await financeApi.getAllPending();
        setDues(res.data);
        setFilteredDues(res.data);

        // Pre-select student if provided in URL
        const preSelectRegNo = searchParams.get("regNo");
        const preSelectFeeId = searchParams.get("feeId");
        
        if (preSelectRegNo) {
          setSearchQuery(preSelectRegNo);
          if (preSelectFeeId) {
            const fee = res.data.find((f: any) => f.id === preSelectFeeId);
            if (fee) setSelectedFees([fee]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dues", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDues();
  }, [searchParams]);

  useEffect(() => {
    let result = dues;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        (d.student.user.name && d.student.user.name.toLowerCase().includes(q)) || 
        (d.student.regNo && d.student.regNo.toLowerCase().includes(q))
      );
    }

    if (batchFilter !== "ALL") {
      result = result.filter(d => d.courseId === batchFilter);
    }

    if (typeFilter !== "ALL") {
      result = result.filter(d => d.type === typeFilter);
    }

    setFilteredDues(result);
  }, [searchQuery, batchFilter, typeFilter, dues]);

  const batches = Array.from(new Set(dues.map(d => JSON.stringify({ id: d.courseId, name: d.course.name })))).map(s => JSON.parse(s));

  const toggleFeeSelection = (fee: any) => {
    setSelectedFees(prev => {
      const isSelected = prev.find(f => f.id === fee.id);
      if (isSelected) {
        return prev.filter(f => f.id !== fee.id);
      } else {
        // Only allow selecting fees from the same student
        if (prev.length > 0 && prev[0].studentId !== fee.studentId) {
          return [fee];
        }
        return [...prev, fee];
      }
    });
  };

  const handleWaiveLateFee = async (feeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Mercy granted! Waive the entire late fine for this student?")) return;
    try {
      await settingsApi.waiveLateFee(feeId);
      const res = await financeApi.getAllPending();
      setDues(res.data);
      setFilteredDues(res.data);
    } catch (err) {
      alert("Failed to waive late fee.");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFees.length === 0) return;

    // Special confirmation for MERCY mode
    if (paymentMode === 'MERCY') {
      const totalRemaining = selectedFees.reduce((sum, f) => {
        const gross = f.amount + (f.lateFee || 0);
        const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
        return sum + Math.max(0, gross - paid);
      }, 0);
      const confirmed = confirm(
        `⚠️ MERCY WAIVER — IRREVERSIBLE ACTION\n\n` +
        `You are about to write off ₹${totalRemaining.toLocaleString()} in dues for ${selectedFees[0].student?.user?.name || 'this student'}.\n\n` +
        `Reason: "${mercyReason || 'No reason provided'}"\n\n` +
        `This will mark the selected fee(s) as PAID via MERCY and cannot be undone.\nProceed?`
      );
      if (!confirmed) return;
    }

    setRecording(true);
    try {
      const payRes = await financeApi.payFee({
        feeIds: selectedFees.map(f => f.id),
        studentId: selectedFees[0].studentId,
        amount: amount,
        paymentMode,
        transactionId: paymentMode === 'MERCY' ? `MERCY-WAIVER: ${mercyReason}` : transactionId
      });
      if (paymentMode === 'MERCY') {
        alert("✅ Mercy Waiver recorded. Fee(s) written off.");
      } else {
        alert("Payment recorded successfully!");
        if (confirm("View Receipt?")) {
          router.push(`/receipt/${payRes.data.payments[0].id}`);
        }
      }
      setAmount("");
      setTransactionId("");
      setMercyReason("");
      setSelectedFees([]);
      setPaymentMode("CASH");
      const res = await financeApi.getAllPending();
      setDues(res.data);
    } catch (err) {
      alert("Failed to record payment");
    } finally {
      setRecording(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center">
          <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-black text-primary tracking-tight">Financial Treasury</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/finance/other-income" className="bg-emerald-50 text-emerald-600 border-2 border-emerald-100 px-4 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">account_balance</span>
            Income & Inv.
          </Link>
          <button onClick={handleExport} className="bg-white text-slate-600 border-2 border-slate-200 px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search by Name or Reg No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
          </div>
          <div className="flex gap-3">
            <select 
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11"
            >
              <option value="ALL">All Batches</option>
              {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11"
            >
              <option value="ALL">All Types</option>
              <option value="ACADEMIC">Academic</option>
              <option value="HOSTEL">Hostel</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">payments</span>
            Active Dues & Installments
          </h2>

          {/* Live Summary Strip */}
          {!isLoading && dues.length > 0 && (() => {
            const todayMid = new Date(); todayMid.setHours(0,0,0,0);
            let overdueAmt = 0, futureAmt = 0;
            dues.forEach(f => {
              const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
              const rem = Math.max(0, (f.amount + (f.lateFee || 0)) - paid);
              if (new Date(f.dueDate) <= todayMid) overdueAmt += rem;
              else futureAmt += rem;
            });
            return (
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">🔴 Overdue</p>
                  <p className="text-lg font-black text-red-600">₹{overdueAmt.toLocaleString()}</p>
                  <p className="text-[8px] text-red-400 font-bold">{dues.filter(f => new Date(f.dueDate) <= todayMid).length} fees</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">🔵 Upcoming</p>
                  <p className="text-lg font-black text-blue-600">₹{futureAmt.toLocaleString()}</p>
                  <p className="text-[8px] text-blue-400 font-bold">{dues.filter(f => new Date(f.dueDate) > todayMid).length} fees</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">⚡ Total Outstanding</p>
                  <p className="text-lg font-black text-white">₹{(overdueAmt + futureAmt).toLocaleString()}</p>
                  <p className="text-[8px] text-slate-400 font-bold">{dues.length} fees</p>
                </div>
              </div>
            );
          })()}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : (
            filteredDues.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredDues.map(fee => {
                  const isSelected = selectedFees.some(f => f.id === fee.id);
                  const isFuture = new Date(fee.dueDate) > today;
                  return (
                    <div 
                      key={fee.id} 
                      onClick={() => toggleFeeSelection(fee)}
                      className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10' : 'border-slate-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                            {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-black text-slate-900">{fee.student.user.name}</p>
                              <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${fee.type === 'HOSTEL' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {fee.type}
                              </span>
                              {fee.month && (
                                <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {fee.month}
                                </span>
                              )}
                              {isFuture && (
                                <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">upcoming</span>
                                  Future
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{fee.course.name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-black ${fee.status === 'PARTIAL' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                          {fee.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="pl-8">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Remaining Balance</p>
                          {(() => {
                            const gross = fee.amount + (fee.lateFee || 0);
                            const paid = (fee.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                            const remaining = Math.max(0, gross - paid);
                            return (
                              <>
                                <p className="text-xl font-black text-primary">₹{remaining.toLocaleString()}</p>
                                {paid > 0 && (
                                  <p className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block font-black mt-0.5">
                                    ₹{paid.toLocaleString()} Paid · ₹{gross.toLocaleString()} Total
                                  </p>
                                )}
                              </>
                            );
                          })()}
                          {fee.lateFee > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block animate-bounce">
                                Incl. ₹{fee.lateFee} Late Fine
                              </p>
                              {userRole === 'SUPER_ADMIN' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleWaiveLateFee(fee.id, e)}
                                  className="text-[9px] font-bold text-slate-500 hover:text-red-600 bg-slate-100 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[10px]">money_off</span>
                                  Waive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold italic">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                          {isFuture && <p className="text-[9px] text-emerald-500 font-black uppercase">Early Payment Allowed</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">person_search</span>
                <h3 className="text-slate-900 font-black">No Pending Dues</h3>
                <p className="text-sm text-slate-500 mt-1">All accounts are cleared or no fees match your filters.</p>
              </div>
            )
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 px-1">Record Payment</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
            {selectedFees.length > 0 ? (
              <form onSubmit={handleRecordPayment} className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Selected Dues ({selectedFees.length})</p>
                  <div className="space-y-1">
                    {selectedFees.map(f => {
                      const gross = f.amount + (f.lateFee || 0);
                      const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                      const remaining = Math.max(0, gross - paid);
                      return (
                        <div key={f.id} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{f.type} {f.month ? `(${f.month})` : ''}</span>
                          <div className="text-right">
                            <span className="font-black text-primary">₹{remaining.toLocaleString()}</span>
                            {f.lateFee > 0 && <span className="text-[9px] text-red-600 ml-1 font-black">+₹{f.lateFee} Fine</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Total Remaining</p>
                    <p className="text-lg font-black text-primary">₹{selectedFees.reduce((sum, f) => {
                      const gross = f.amount + (f.lateFee || 0);
                      const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                      return sum + Math.max(0, gross - paid);
                    }, 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Amount <span className="text-slate-400 normal-case font-medium">(partial allowed)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-bold text-slate-400">₹</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-12 pl-8 pr-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-primary"
                      placeholder={selectedFees.reduce((sum, f) => {
                        const gross = f.amount + (f.lateFee || 0);
                        const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                        return sum + Math.max(0, gross - paid);
                      }, 0).toString()}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">* Leave blank to pay the full remaining balance</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Mode</label>
                  <select 
                    value={paymentMode}
                    onChange={(e) => { setPaymentMode(e.target.value); setAmount(""); }}
                    className={`w-full h-12 px-4 rounded-xl border focus:ring-2 outline-none transition-all ${
                      paymentMode === 'MERCY'
                        ? 'border-purple-400 bg-purple-50 text-purple-800 font-black focus:ring-purple-300'
                        : 'border-slate-200 focus:ring-primary'
                    }`}
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="ONLINE">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    {userRole === 'SUPER_ADMIN' && (
                      <option value="MERCY">⚡ Mercy Waiver (Write-Off)</option>
                    )}
                  </select>
                  {paymentMode === 'MERCY' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <p className="text-[9px] font-black text-purple-700 uppercase tracking-widest mb-1">⚠️ MERCY MODE ACTIVE</p>
                      <p className="text-[9px] text-purple-600">
                        This will <strong>write off</strong> the selected fee(s) without collecting any money.
                        The full remaining balance will be waived. This action is <strong>irreversible</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {paymentMode === 'MERCY' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-600 uppercase tracking-widest text-[10px]">Reason for Mercy Waiver *</label>
                    <textarea
                      value={mercyReason}
                      onChange={(e) => setMercyReason(e.target.value)}
                      rows={3}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 focus:ring-2 focus:ring-purple-300 outline-none transition-all font-medium text-sm text-purple-900 resize-none"
                      placeholder="e.g. Financial hardship, scholarship waiver, principal approval..."
                    />
                    <p className="text-[9px] text-purple-400 font-medium italic">* Required — this reason will be logged against the student's ledger</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Transaction / Ref No</label>
                    <input 
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                      placeholder="e.g. UTR123456789"
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic">* Leave blank for auto-generation</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={recording || (paymentMode === 'MERCY' && !mercyReason.trim())}
                  className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                    paymentMode === 'MERCY'
                      ? 'bg-purple-600 hover:bg-purple-800 text-white'
                      : 'bg-primary hover:bg-black text-white'
                  }`}
                >
                  {recording
                    ? "Processing..."
                    : paymentMode === 'MERCY'
                    ? "⚡ Grant Mercy Waiver"
                    : "Confirm Multi-Payment"}
                  <span className="material-symbols-outlined">{paymentMode === 'MERCY' ? 'volunteer_activism' : 'payments'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-200 text-6xl mb-4">account_balance_wallet</span>
                <p className="text-slate-400 text-sm font-medium">Select one or more dues from the list to record a payment.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminFinance() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    }>
      <AdminFinanceContent />
    </Suspense>
  );
}
