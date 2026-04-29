"use client";

import { useState, useEffect } from "react";
import { expenseApi } from "@/lib/api";
import Link from "next/link";

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("OPERATIONAL");
  const [amount, setAmount] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await expenseApi.getAll();
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await expenseApi.create({ title, category, amount, description, payeeName, purpose });
      alert("Expense recorded and voucher generated!");
      setTitle("");
      setAmount("");
      setPayeeName("");
      setPurpose("");
      setDescription("");
      fetchExpenses();
    } catch (err) {
      alert("Failed to record expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) return;
    try {
      await expenseApi.delete(id);
      fetchExpenses();
    } catch (err) {
      alert("Failed to delete expense. Only Admins can perform this action.");
    }
  };

  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Institutional Expenditure</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Record Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-slate-800 mb-6">New Expense Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                <input 
                  type="text" required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Electricity Bill Oct"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="OPERATIONAL">Operational</option>
                  <option value="SALARY">Staff Salary</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                <input 
                  type="number" required value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-black text-emerald-600"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid To (Payee Name)</label>
                <input 
                  type="text" required value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  placeholder="e.g. John Doe / Vendor Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purpose of Expense</label>
                <input 
                  type="text" required value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  placeholder="e.g. Salary Payment / Lab Equipment"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-xs"
                  placeholder="Optional details..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Authorize Payment"}
                <span className="material-symbols-outlined">verified_user</span>
              </button>
            </form>
          </div>
        </div>

        {/* Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-black text-slate-800">Expenditure Ledger</h2>
            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Dispute Mode Active</span>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>
          ) : (
            <div className="space-y-4">
              {expenses.map(ex => (
                <div key={ex.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">receipt_long</span>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{ex.title}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{ex.category} • {new Date(ex.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-black text-red-600">- ₹{ex.amount.toLocaleString()}</p>
                      <Link 
                        href={`/voucher/${ex.id}`}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                      >
                        Voucher PDF
                      </Link>
                    </div>
                    {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                      <button 
                        onClick={() => handleDelete(ex.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Dispute Entry"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
