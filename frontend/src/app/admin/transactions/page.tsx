"use client";

import { useState, useEffect } from "react";
import { transactionApi, financeApi, expenseApi } from "@/lib/api";
import Link from "next/link";

const MODE_ICON: Record<string, string> = {
  CASH: "payments", UPI: "qr_code_scanner", ONLINE: "account_balance", CHEQUE: "receipt_long"
};

export default function TransactionLedger() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");

  // TXN Verifier state
  const [txnQuery, setTxnQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [showVerifier, setShowVerifier] = useState(false);

  const fetchData = async () => {
    try {
      const res = await transactionApi.getHistory();
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch transaction history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role);
    fetchData();
  }, []);

  const handleDelete = async (txn: any) => {
    if (!confirm(`Are you sure you want to delete this ${txn.type} entry?\n\n${txn.title}\nAmount: ₹${txn.amount.toLocaleString()}\n\nThis action cannot be undone.`)) return;
    
    setDeletingId(txn.id);
    try {
      if (txn.type === "INCOME") {
        await financeApi.deletePayment(txn.id);
      } else {
        await expenseApi.delete(txn.id);
      }
      // Trigger a small delay for "smoothness" and to ensure DB consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchData();
      alert("Transaction deleted successfully.");
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Failed to delete transaction: ${err?.response?.data?.message || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnQuery.trim()) return;
    setVerifying(true);
    setVerified(null);
    setVerifyError("");
    try {
      const res = await transactionApi.verify(txnQuery.trim());
      setVerified(res.data);
    } catch (err: any) {
      setVerifyError(err?.response?.data?.message || "Transaction not found. Check the ID and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-black text-primary tracking-tight">Financial Master Ledger</h1>
        </div>
        <button
          onClick={() => { setShowVerifier(!showVerifier); setVerified(null); setVerifyError(""); setTxnQuery(""); }}
          className={`flex items-center gap-2 px-5 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${showVerifier ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary hover:bg-primary hover:text-white"}`}
        >
          <span className="material-symbols-outlined text-sm">verified</span>
          Verify Transaction
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">

        {/* ── TRANSACTION VERIFIER PANEL ── */}
        {showVerifier && (
          <div className="bg-white rounded-3xl border-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-primary to-slate-800 px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
                <div>
                  <h2 className="text-xl font-black">Transaction Verification Portal</h2>
                  <p className="text-xs opacity-70 font-bold uppercase tracking-widest">Enter a Transaction ID to verify its authenticity and details</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleVerify} className="flex gap-3">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">tag</span>
                  <input
                    type="text"
                    value={txnQuery}
                    onChange={(e) => setTxnQuery(e.target.value)}
                    placeholder="Enter Transaction ID (e.g. TXN-1745812345678 or UTR1234567)"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-primary text-sm font-medium transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifying || !txnQuery.trim()}
                  className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
                >
                  {verifying
                    ? <><span className="animate-spin material-symbols-outlined">progress_activity</span> Verifying...</>
                    : <><span className="material-symbols-outlined">search</span> Verify</>
                  }
                </button>
              </form>

              {/* Error */}
              {verifyError && (
                <div className="mt-6 flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl p-5 animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">cancel</span>
                  </div>
                  <div>
                    <p className="font-black text-red-700">Verification Failed</p>
                    <p className="text-sm text-red-600 mt-0.5">{verifyError}</p>
                  </div>
                </div>
              )}

              {/* Verified Result */}
              {verified && (
                <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Status Banner */}
                  <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                      <span className="material-symbols-outlined text-3xl">verified</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-black text-emerald-700 text-lg">✓ Transaction Verified</p>
                      <p className="text-xs text-emerald-600 font-bold font-mono mt-0.5">{verified.transactionId}</p>
                    </div>
                    <Link
                      href={`/receipt/${verified.lineItems[0]?.paymentId}`}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                    >
                      <span className="material-symbols-outlined text-sm">receipt</span>
                      Print Receipt
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Student Details */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span> Student Details
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xl">
                            {verified.student.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{verified.student.name}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{verified.student.regNo}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {[
                            ["Course", `${verified.student.batch ? verified.student.batch + " • " : ""}${verified.student.course}`],
                            ["Guardian", verified.student.guardianName],
                            ["Phone", verified.student.phone],
                            ["Email", verified.student.email],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
                              <p className="text-xs font-bold text-slate-700 truncate">{val || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Payment Meta */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">receipt_long</span> Payment Details
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <span className="material-symbols-outlined text-sm">{MODE_ICON[verified.paymentMode] || "payments"}</span>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Payment Mode</p>
                            <p className="font-black text-slate-900">{verified.paymentMode}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Date</p>
                            <p className="text-xs font-black text-slate-800">{fmtDate(verified.date)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Time</p>
                            <p className="text-xs font-black text-slate-800">{fmtTime(verified.date)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Payments</p>
                            <p className="text-xs font-black text-slate-800">{verified.paymentCount} fee(s)</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Total Amount</p>
                            <p className="text-lg font-black text-emerald-700">₹{verified.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Line Items Covered by This Transaction</p>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Fee Type", "Month", "Course", "Due Date", "Amount Paid"].map(h => (
                            <th key={h} className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {verified.lineItems.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${item.feeType === "HOSTEL" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                {item.feeType}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs font-bold text-slate-600">{item.feeMonth || "—"}</td>
                            <td className="px-5 py-3 text-xs font-bold text-slate-800">{item.courseName}</td>
                            <td className="px-5 py-3 text-xs text-slate-500">{fmtDate(item.dueDate)}</td>
                            <td className="px-5 py-3 text-sm font-black text-emerald-700">₹{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50">
                          <td colSpan={4} className="px-5 py-3 text-xs font-black text-emerald-700 uppercase tracking-widest text-right">Total Verified</td>
                          <td className="px-5 py-3 text-lg font-black text-emerald-700">₹{verified.totalAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BALANCE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Net Institution Balance</p>
              <h2 className="text-4xl font-black">₹{data?.summary?.balance?.toLocaleString()}</h2>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10">account_balance</span>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-emerald-500 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Income (Fees)</p>
              <h2 className="text-2xl font-black text-emerald-600">₹{data?.summary?.totalIncome?.toLocaleString()}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full self-start">
              <span className="material-symbols-outlined text-sm">trending_up</span> Live Cashflow
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-red-500 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outflow (Expenses)</p>
              <h2 className="text-2xl font-black text-red-600">₹{data?.summary?.totalExpense?.toLocaleString()}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full self-start">
              <span className="material-symbols-outlined text-sm">trending_down</span> Managed
            </div>
          </div>
        </div>

        {/* ── TRANSACTION TABLE ── */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">Unified Transaction History</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase">{data?.transactions?.length || 0} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Date & Time", "Description", "Category", "Reference / TXN ID", "Amount (₹)", "Action"].map(h => (
                    <th key={h} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.transactions?.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-700">{new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{new Date(txn.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${txn.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                          <span className="material-symbols-outlined text-sm">{txn.type === "INCOME" ? "south_west" : "north_east"}</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{txn.title}</p>
                          <p className="text-[9px] text-slate-500 truncate max-w-[180px]">{txn.subtitle || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${txn.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {txn.reference && txn.reference !== "VOUCHER" ? (
                        <button
                          onClick={() => { setTxnQuery(txn.reference); setShowVerifier(true); setVerified(null); setVerifyError(""); }}
                          className="font-mono text-[9px] text-primary font-black bg-primary/5 hover:bg-primary hover:text-white px-2 py-1 rounded-lg transition-all max-w-[140px] truncate block"
                          title={`Verify ${txn.reference}`}
                        >
                          {txn.reference}
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">VOUCHER</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-sm font-black ${txn.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>
                        {txn.type === "INCOME" ? "+" : "-"} ₹{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{txn.mode}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {txn.type === "INCOME" ? (
                          <Link href={`/receipt/${txn.id}`} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">receipt</span> Receipt
                          </Link>
                        ) : (
                          <Link href={`/voucher/${txn.id}`} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">description</span> Voucher
                          </Link>
                        )}
                        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                          <button 
                            onClick={() => handleDelete(txn)} 
                            disabled={deletingId === txn.id}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${deletingId === txn.id ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"}`}
                            title="Delete"
                          >
                            {deletingId === txn.id ? (
                              <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">delete</span>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
