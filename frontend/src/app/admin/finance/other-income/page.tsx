"use client";

import { useState, useEffect, Suspense } from "react";
import { otherIncomeApi } from "@/lib/api";
import Link from "next/link";
import { exportToCSV } from "@/lib/utils";

function IncomeInvestmentsContent() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("INVESTMENT");
  const [amount, setAmount] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState("ONLINE");
  const [transactionId, setTransactionId] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await otherIncomeApi.getAll();
      setIncomes(res.data);
      setFilteredIncomes(res.data);
    } catch (err) {
      console.error("Failed to fetch incomes", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = incomes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        (i.receivedFrom && i.receivedFrom.toLowerCase().includes(q)) ||
        (i.transactionId && i.transactionId.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== "ALL") {
      result = result.filter(i => i.category === categoryFilter);
    }
    setFilteredIncomes(result);
  }, [searchQuery, categoryFilter, incomes]);

  const handleExport = () => {
    const exportData = filteredIncomes.map(i => ({
      "Date": new Date(i.date).toLocaleDateString(),
      "Title": i.title,
      "Category": i.category,
      "Amount": i.amount,
      "Received From": i.receivedFrom || "N/A",
      "Mode": i.paymentMode,
      "Transaction ID": i.transactionId || "N/A",
      "Description": i.description || "N/A"
    }));
    exportToCSV(exportData, "Income_and_Investments");
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      alert("Please fill required fields (Title, Amount)");
      return;
    }
    setIsSubmitting(true);
    try {
      await otherIncomeApi.create({
        title,
        category,
        amount,
        receivedFrom,
        date,
        paymentMode,
        transactionId,
        description
      });
      alert("Record added successfully!");
      setTitle("");
      setAmount("");
      setReceivedFrom("");
      setTransactionId("");
      setDescription("");
      fetchIncomes();
    } catch (err) {
      alert("Failed to add record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    try {
      await otherIncomeApi.delete(id);
      fetchIncomes();
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const totalAmount = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance" className="text-slate-400 hover:text-primary transition-colors flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Income & Investments</h1>
          </div>
        </div>
        <button onClick={handleExport} className="bg-white text-slate-600 border-2 border-slate-200 px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Add New Record
          </h2>
          <form onSubmit={handleAddIncome} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. CSR Grant" className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm bg-white">
                  <option value="INVESTMENT">Investment</option>
                  <option value="DONATION">Donation</option>
                  <option value="SPONSORSHIP">Sponsorship</option>
                  <option value="SCRAP_SALE">Scrap Sale</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (₹) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0" step="0.01" className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-emerald-600 text-lg" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Received From</label>
              <input type="text" value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)} placeholder="e.g. John Doe / XYZ Corp" className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm bg-white">
                  <option value="ONLINE">Online/Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ref / Txn ID</label>
                <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full h-12 px-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-4 mt-1 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm resize-none" placeholder="Optional notes..."></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full h-14 mt-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? "Saving..." : "Save Record"}
              {!isSubmitting && <span className="material-symbols-outlined text-lg">save</span>}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              Records Log
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm shadow-sm"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11 shadow-sm"
              >
                <option value="ALL">All Categories</option>
                <option value="INVESTMENT">Investment</option>
                <option value="DONATION">Donation</option>
                <option value="SPONSORSHIP">Sponsorship</option>
                <option value="SCRAP_SALE">Scrap Sale</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-600 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-emerald-600/20">
              <div className="relative z-10">
                <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-1">Total Filtered Amount</p>
                <h3 className="text-3xl font-black tracking-tight">₹{totalAmount.toLocaleString()}</h3>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-white opacity-10">account_balance_wallet</span>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden flex items-center">
               <div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Record Count</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">{filteredIncomes.length} <span className="text-sm text-slate-400 font-medium">transactions</span></h3>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600"></div>
              </div>
            ) : filteredIncomes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Received From</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncomes.map((i) => (
                      <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-700">{new Date(i.date).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{i.paymentMode}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-slate-900">{i.title}</p>
                          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {i.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-slate-700">{i.receivedFrom || "-"}</p>
                          {i.transactionId && <p className="text-[10px] text-slate-400 font-mono mt-0.5">Txn: {i.transactionId}</p>}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="text-sm font-black text-emerald-600">₹{i.amount.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => handleDelete(i.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors mx-auto opacity-0 group-hover:opacity-100">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
                </div>
                <h3 className="text-slate-800 font-black">No Records Found</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">You haven't added any income or investment records yet, or none match your filters.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default function IncomeInvestments() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600"></div>
      </div>
    }>
      <IncomeInvestmentsContent />
    </Suspense>
  );
}
