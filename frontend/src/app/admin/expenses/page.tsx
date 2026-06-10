"use client";

import { useState, useEffect } from "react";
import { expenseApi } from "@/lib/api";
import Link from "next/link";

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("STAFF_SALARY");
  const [amount, setAmount] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fundSource, setFundSource] = useState("GENERAL");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [showCatMgr, setShowCatMgr] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const res = await expenseApi.getAllCategories();
      setCategories(res.data);
      // Set default if current category is not in list or empty
      if (res.data.length > 0 && (category === "STAFF_SALARY" || !category)) {
        setCategory(res.data[0].name);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      await expenseApi.addCategory(newCatName);
      setNewCatName("");
      fetchCategories();
    } catch (err) {
      alert("Failed to add category. Name might already exist.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? Expenses in this category will remain, but the category option will be removed.")) return;
    try {
      await expenseApi.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await expenseApi.create({ title, category, amount, description, payeeName, purpose, fundSource, date });
      alert("Expense recorded and voucher generated!");
      setTitle("");
      setAmount("");
      setPayeeName("");
      setPurpose("");
      setFundSource("GENERAL");
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

  const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
      'OPERATIONAL': 'Operational',
      'SALARY': 'Staff Salary',
      'MARKETING': 'Marketing',
      'OTHER': 'Other'
    };
    // If it's in our map, return friendly name, otherwise return the name as is (properly formatted)
    if (map[cat]) return map[cat];
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center px-8 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Expenditure</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Financial Outflow & Asset Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Quick Stats Dashboard */}
        {!isLoading && expenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Expenditure</p>
              <p className="text-3xl font-black text-slate-900">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Velocity</p>
              <p className="text-3xl font-black text-primary">₹{expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recent Activity</p>
              <p className="text-3xl font-black text-emerald-600">{expenses.length} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Entries</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Record Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-900">New Entry</h2>
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">add</span>
                </span>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" required value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-700"
                    placeholder="Electricity, Rent, etc."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                      <button 
                        type="button"
                        onClick={() => setShowCatMgr(!showCatMgr)}
                        className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-all"
                      >
                        {showCatMgr ? "Close" : "Setup"}
                      </button>
                    )}
                  </div>
                  
                  {showCatMgr && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                    <div className="p-4 bg-slate-900 rounded-2xl space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="NAME"
                          className="flex-1 h-10 px-4 text-xs rounded-xl bg-white/10 text-white outline-none uppercase font-bold placeholder:text-white/30"
                        />
                        <button 
                          type="button"
                          onClick={handleAddCategory}
                          className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                          <div key={c.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg group">
                            <span className="text-[10px] font-black text-white/70">{c.name}</span>
                            <button type="button" onClick={() => handleDeleteCategory(c.id)} className="text-white/20 hover:text-red-400">
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary outline-none transition-all font-black text-slate-700 cursor-pointer"
                  >
                    {categories.length > 0 ? categories.map(c => (
                      <option key={c.id} value={c.name}>{formatCategory(c.name)}</option>
                    )) : (
                      <>
                        <option value="STAFF_SALARY">Staff Salary</option>
                        <option value="TEACHER_SALARY">Teacher Salary</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OTHERS">Others</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
                  <input 
                    type="date" required value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                    <input 
                      type="number" required value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all font-black text-emerald-600"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
                    <select 
                      value={fundSource}
                      onChange={(e) => setFundSource(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-blue-600 cursor-pointer"
                    >
                      <option value="GENERAL">General</option>
                      <option value="RESERVE">Reserve</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payee Details</label>
                  <input 
                    type="text" required value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary outline-none transition-all font-bold"
                    placeholder="Recipient Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Purpose</label>
                  <input 
                    type="text" required value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary outline-none transition-all font-bold"
                    placeholder="Reason for payment"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20"
                >
                  {isSubmitting ? "Processing..." : "Confirm & Pay"}
                  <span className="material-symbols-outlined">payments</span>
                </button>
              </form>
            </div>
          </div>

          {/* Ledger */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center px-2">
              <div>
                <h2 className="text-xl font-black text-slate-900">Transaction Ledger</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Historical Financial Log</p>
              </div>
              {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Audit Active</span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-r-4 border-r-transparent" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Ledger...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <span className="material-symbols-outlined text-4xl">receipt_long</span>
                </div>
                <h3 className="text-xl font-black text-slate-400">No Transactions Found</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">Begin by authorizing institutional payments from the side panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {expenses.map(ex => (
                  <div key={ex.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{ex.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">{formatCategory(ex.category)}</span>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(ex.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${ex.fundSource === 'RESERVE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{ex.fundSource} FUND</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-2xl font-black text-red-600 tracking-tighter">- ₹{ex.amount.toLocaleString()}</p>
                        <Link 
                          href={`/voucher/${ex.id}`}
                          className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline mt-1"
                        >
                          <span className="material-symbols-outlined text-sm">print</span> View Voucher
                        </Link>
                      </div>
                      
                      {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                        <button 
                          onClick={() => handleDelete(ex.id)}
                          className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
