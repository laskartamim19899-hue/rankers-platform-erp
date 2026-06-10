"use client";
import { useState, useEffect } from "react";
import { guestApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentMonth = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;

export default function GuestTeacherPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [tab, setTab] = useState<"register" | "pay">("register");

  // Register form
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rSubject, setRSubject] = useState("");
  const [rQual, setRQual] = useState("");
  const [rRate, setRRate] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Payment form
  const [month, setMonth] = useState(currentMonth);
  const [classesHeld, setClassesHeld] = useState("");
  const [ratePerClass, setRatePerClass] = useState("");
  const [allowances, setAllowances] = useState("0");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paying, setPaying] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try { const r = await guestApi.getAll(); setTeachers(r.data); }
    catch { } finally { setIsLoading(false); }
  };

  const handleSelect = async (t: any) => {
    setSelected(t);
    setEditMode(false);
    // Pre-fill profile fields
    setRName(t.name); setRPhone(t.phone || ""); setREmail(t.email || "");
    setRSubject(t.subject); setRQual(t.qualification || ""); setRRate(t.ratePerClass.toString());
    // Pre-fill rate in pay form
    setRatePerClass(t.ratePerClass.toString());
    // Load history
    const r = await guestApi.getHistory(t.id);
    setHistory(r.data);
    setTotalPaid(r.data.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.totalAmount, 0));
    setTab("pay");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editMode && selected) {
        await guestApi.update(selected.id, { name: rName, phone: rPhone, email: rEmail, subject: rSubject, qualification: rQual, ratePerClass: rRate });
        alert("Updated!");
      } else {
        await guestApi.create({ name: rName, phone: rPhone, email: rEmail, subject: rSubject, qualification: rQual, ratePerClass: rRate });
        alert("Guest teacher registered!");
        setRName(""); setRPhone(""); setREmail(""); setRSubject(""); setRQual(""); setRRate("");
      }
      fetchAll();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("WIPE TEACHER DATA? This will permanently delete the teacher profile, ALL payment history, and ALL associated ledger/expense records. This cannot be undone! Proceed?")) return;
    try { await guestApi.remove(id); setSelected(null); fetchAll(); }
    catch { alert("Failed to wipe teacher data."); }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setPaying(true);
    try {
      const res = await guestApi.pay({ guestTeacherId: selected.id, month, classesHeld, ratePerClass, allowances, paymentMode, transactionId, remarks });
      alert("Payment done! Opening slip...");
      router.push(`/guest-slip/${res.data.id}`);
    } catch { alert("Failed to process payment"); }
    finally { setPaying(false); }
  };

  const handleDeletePayment = async (pid: string) => {
    console.log("Attempting to delete guest payment:", pid);
    if (!confirm("Delete this payment record? All financial ledger entries will also be removed. Proceed?")) return;
    try {
      const res = await guestApi.deletePayment(pid);
      console.log("Delete success:", res.data);
      if (selected) { 
        const r = await guestApi.getHistory(selected.id); 
        setHistory(r.data); 
        setTotalPaid(r.data.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.totalAmount, 0));
      }
    } catch (err: any) { 
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete payment record. Please check your network or permissions."); 
    }
  };

  const classAmt = parseFloat(classesHeld || "0") * parseFloat(ratePerClass || "0");
  const total = classAmt + parseFloat(allowances || "0");
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600">person_apron</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Guest Teacher Payment</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Per-Class Payment System</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setSelected(null); setEditMode(false); setTab("register"); setRName(""); setRPhone(""); setREmail(""); setRSubject(""); setRQual(""); setRRate(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          New Guest Teacher
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Teacher List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or subject..."
              className="w-full h-10 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between">
              <h2 className="font-black text-slate-800 text-sm">Guest Teachers</h2>
              <span className="text-[10px] text-slate-400 font-bold">{filtered.length} registered</span>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-slate-200">person_apron</span>
                <p className="text-slate-400 font-bold text-sm mt-2">No guest teachers yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filtered.map(t => (
                  <button key={t.id} onClick={() => handleSelect(t)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-orange-50 transition-colors ${selected?.id === t.id ? "bg-orange-50 border-l-4 border-orange-500" : ""}`}>
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg flex-shrink-0">
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{t.subject}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-orange-600">₹{t.ratePerClass}/class</p>
                      <p className="text-[9px] text-slate-400 font-bold">{t.payments?.length || 0} payments</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-5">
          {!selected && tab !== "register" ? (
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">person_search</span>
              <p className="font-black text-slate-400 text-lg">Select a Guest Teacher</p>
              <p className="text-slate-400 text-sm mt-1">or add a new one from the header</p>
            </div>
          ) : (
            <>
              {/* If a teacher is selected, show their header card */}
              {selected && (
                <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-2xl p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-2xl">
                      {selected.name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{selected.name}</h2>
                      <p className="text-white/70 text-xs font-bold">{selected.subject} · {selected.qualification || "Guest Faculty"}</p>
                      <p className="text-amber-100 text-sm font-black mt-1">₹{selected.ratePerClass}/class</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-3xl font-black">₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-3">
                <button onClick={() => setTab("register")}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === "register" ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300"}`}>
                  <span className="material-symbols-outlined text-sm mr-1 align-middle">person_add</span>
                  {selected && editMode ? "Edit Profile" : "Register / Edit"}
                </button>
                <button onClick={() => setTab("pay")} disabled={!selected}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === "pay" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 disabled:opacity-40"}`}>
                  <span className="material-symbols-outlined text-sm mr-1 align-middle">payments</span>
                  Process Payment
                </button>
              </div>

              {/* Register / Edit Form */}
              {tab === "register" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-600">person_apron</span>
                      {selected ? "Edit Guest Teacher" : "Register New Guest Teacher"}
                    </h3>
                    {selected && (
                      <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-black uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">delete</span> Delete
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                      <input value={rName} onChange={e => setRName(e.target.value)} required
                        placeholder="e.g. Dr. Arif Hossain"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject *</label>
                      <input value={rSubject} onChange={e => setRSubject(e.target.value)} required
                        placeholder="e.g. Physics, Organic Chemistry"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                      <input value={rPhone} onChange={e => setRPhone(e.target.value)}
                        placeholder="Mobile number"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-medium text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                      <input type="email" value={rEmail} onChange={e => setREmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-medium text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualification</label>
                      <input value={rQual} onChange={e => setRQual(e.target.value)}
                        placeholder="e.g. M.Sc. Physics, MBBS"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-medium text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Per Class (₹) *</label>
                      <input type="number" value={rRate} onChange={e => { setRRate(e.target.value); if (!selected) setRatePerClass(e.target.value); }} required
                        placeholder="e.g. 800"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-black text-orange-700 text-lg" />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" disabled={saving}
                        className="w-full h-12 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all disabled:opacity-50">
                        {saving ? "Saving..." : selected ? "Update Profile" : "Register Guest Teacher"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Form */}
              {tab === "pay" && selected && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">calculate</span>
                    Process Class-Based Payment
                  </h3>
                  <form onSubmit={handlePay} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Month *</label>
                      <select value={month} onChange={e => setMonth(e.target.value)} required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm">
                        {MONTHS.flatMap(m => [new Date().getFullYear()-1, new Date().getFullYear()].map(y => `${m} ${y}`)).map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    {/* The key fields */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. of Classes Held *</label>
                      <input type="number" min="1" value={classesHeld} onChange={e => setClassesHeld(e.target.value)} required
                        placeholder="e.g. 12"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-700 text-2xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Per Class (₹) *</label>
                      <input type="number" value={ratePerClass} onChange={e => setRatePerClass(e.target.value)} required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-orange-700 text-xl" />
                    </div>

                    {/* Live Calculation display */}
                    <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-4 grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Classes × Rate</p>
                        <p className="text-lg font-black text-slate-700">{classesHeld || "0"} × ₹{ratePerClass || "0"}</p>
                      </div>
                      <div className="border-x border-slate-200">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Amount</p>
                        <p className="text-lg font-black text-emerald-600">₹{classAmt.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                        <p className="text-2xl font-black text-orange-600">₹{total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Other Allowances (₹) — Optional</label>
                      <input type="number" value={allowances} onChange={e => setAllowances(e.target.value)}
                        placeholder="Travel, DA, etc."
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-blue-700" />
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
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</label>
                        <input value={transactionId} onChange={e => setTransactionId(e.target.value)}
                          placeholder="UTR / Reference No."
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-sm" />
                      </div>
                    )}
                    <div className={`space-y-1 ${paymentMode !== "CASH" ? "" : "md:col-span-2"}`}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</label>
                      <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional note..."
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-sm" />
                    </div>

                    <div className="md:col-span-2">
                      <button type="submit" disabled={paying}
                        className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                        <span className="material-symbols-outlined">receipt_long</span>
                        {paying ? "Processing..." : `Pay ₹${total.toLocaleString('en-IN')} & Generate Slip`}
                      </button>
                    </div>
                  </form>

                  {/* Payment History */}
                  {history.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-black text-slate-700 text-sm mb-3 uppercase tracking-widest border-t border-slate-100 pt-5">Payment History</h4>
                      <div className="space-y-2">
                        {history.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{p.month}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{p.classesHeld} classes × ₹{p.ratePerClass} · {p.paymentMode}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-black text-emerald-600">₹{p.totalAmount.toLocaleString('en-IN')}</p>
                                {p.allowances > 0 && <p className="text-[9px] text-blue-500 font-bold">+₹{p.allowances} allowance</p>}
                              </div>
                              <Link href={`/guest-slip/${p.id}`} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all" title="View Slip">
                                <span className="material-symbols-outlined text-sm">print</span>
                              </Link>
                               <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDeletePayment(p.id); }} 
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
