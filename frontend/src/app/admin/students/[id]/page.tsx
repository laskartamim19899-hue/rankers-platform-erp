"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { studentApi, academicApi, financeApi } from "@/lib/api";

function StudentProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  useEffect(() => {
    if (searchParams.get('action') === 'promote') {
      setIsEnrollModalOpen(true);
    }
  }, [searchParams]);

  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [enrollData, setEnrollData] = useState({
    courseId: "",
    batchId: "",
    academicFee: "",
    monthlyHostelFee: "",
    isResidential: false
  });

  useEffect(() => {
    if (params.id) {
      fetchStudent();
      fetchAcademicData();
    }
  }, [params.id]);

  const fetchAcademicData = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        academicApi.getCourses(),
        academicApi.getBatches()
      ]);
      setCourses(cRes.data);
      setBatches(bRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudent = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getById(params.id as string);
      setStudent(res.data);
      setEnrollData(prev => ({ ...prev, isResidential: res.data.isResidential }));
    } catch (err) {
      console.error("Failed to fetch student", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData.courseId || !enrollData.batchId) return alert("Select Course and Batch");
    try {
      await studentApi.enroll(params.id as string, enrollData);
      alert("Student promoted/enrolled successfully!");
      setIsEnrollModalOpen(false);
      fetchStudent();
    } catch (err) { alert("Failed to enroll/promote student"); }
  };

  const [activeTab, setActiveTab] = useState("PERSONAL");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ feeId: "", amount: "", paymentMode: "CASH", referenceNumber: "", remarks: "" });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.feeId || !paymentData.amount) return alert("Select fee and enter amount");
    if (paymentData.paymentMode === "MERCY" && !paymentData.remarks) return alert("Reason is mandatory for Mercy Waiver");
    try {
      const isConfirmed = paymentData.paymentMode === "MERCY" ? confirm(`Are you absolutely sure you want to WAIVE ₹${paymentData.amount}? This cannot be undone.`) : true;
      if (!isConfirmed) return;
      await financeApi.recordPayment({
        studentId: params.id as string,
        feeId: paymentData.feeId,
        amount: Number(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        referenceNumber: paymentData.referenceNumber || "WEB",
        remarks: paymentData.remarks
      });
      alert("Transaction processed successfully!");
      setIsPaymentModalOpen(false);
      setPaymentData({ feeId: "", amount: "", paymentMode: "CASH", referenceNumber: "", remarks: "" });
      fetchStudent();
    } catch (err) { alert("Failed to process transaction"); }
  };

  let totalOverdue = 0;
  let totalUpcoming = 0;
  let totalOutstanding = 0;
  if (student) {
    student.fees?.forEach((fee: any) => {
      const isOverdue = new Date(fee.dueDate) <= new Date();
      const feePaid = student.payments?.filter((p:any) => p.feeId === fee.id).reduce((s:number, p:any) => s + p.amount, 0) || 0;
      const gross = fee.amount + (fee.lateFee || 0);
      const remaining = Math.max(0, gross - feePaid);
      if (remaining > 0) {
        totalOutstanding += remaining;
        if (isOverdue) totalOverdue += remaining;
        else totalUpcoming += remaining;
      }
    });
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  if (!student) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Student Not Found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/students" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight mr-auto">Academic Intelligence</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
          >
            Promote / Enroll New
          </button>
          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${student.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {student.status}
          </div>
        </div>
      </header>

      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-primary p-8 text-white">
              <h2 className="text-2xl font-black tracking-tight">Promote or Enroll</h2>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-1">Configure Next Academic Period</p>
            </div>
            <form onSubmit={handleEnroll} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Course</label>
                  <select 
                    required
                    value={enrollData.courseId}
                    onChange={(e) => setEnrollData({...enrollData, courseId: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Batch</label>
                  <select 
                    required
                    value={enrollData.batchId}
                    onChange={(e) => setEnrollData({...enrollData, batchId: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  >
                    <option value="">Select Batch</option>
                    {batches.filter(b => b.courseId === enrollData.courseId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Academic Fee (₹)</label>
                    <input 
                      type="number" required placeholder="50000"
                      value={enrollData.academicFee}
                      onChange={(e) => setEnrollData({...enrollData, academicFee: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Hostel (₹)</label>
                    <input 
                      type="number" placeholder="5000"
                      value={enrollData.monthlyHostelFee}
                      onChange={(e) => setEnrollData({...enrollData, monthlyHostelFee: e.target.value})}
                      disabled={!enrollData.isResidential}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary/20">Confirm Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`p-8 text-white ${paymentData.paymentMode === 'MERCY' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
              <h2 className="text-2xl font-black tracking-tight">{paymentData.paymentMode === 'MERCY' ? 'Mercy Waiver' : 'Record Transaction'}</h2>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-1">Process Fee Ledger Update</p>
            </div>
            <form onSubmit={handlePayment} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Fee Target</label>
                  <select 
                    required
                    value={paymentData.feeId}
                    onChange={(e) => {
                      const feeId = e.target.value;
                      const f = student.fees?.find((fee:any) => fee.id === feeId);
                      if (f) {
                        const paid = student.payments?.filter((p:any) => p.feeId === f.id).reduce((s:number, p:any) => s + p.amount, 0) || 0;
                        setPaymentData(prev => ({...prev, feeId, amount: String(Math.max(0, f.amount - paid))}));
                      } else {
                        setPaymentData(prev => ({...prev, feeId}));
                      }
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="">Select Pending Fee...</option>
                    {student.fees?.filter((f:any) => {
                      const p = student.payments?.filter((px:any)=>px.feeId===f.id).reduce((s:number,px:any)=>s+px.amount,0)||0;
                      return f.amount > p;
                    }).map((f:any) => (
                      <option key={f.id} value={f.id}>{f.type} {f.month ? `(${f.month})` : ''} - ₹{Math.max(0, f.amount - (student.payments?.filter((px:any)=>px.feeId===f.id).reduce((s:number,px:any)=>s+px.amount,0)||0))} Due</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Action Mode</label>
                    <select 
                      value={paymentData.paymentMode}
                      onChange={(e) => setPaymentData({...paymentData, paymentMode: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    >
                      <option value="CASH">CASH</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                      <option value="UPI">UPI</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="MERCY">MERCY WAIVER</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                    <input 
                      type="number" required
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{paymentData.paymentMode === 'MERCY' ? 'Waiver Reason (Mandatory)' : 'Reference / Remarks'}</label>
                  <input 
                    type="text"
                    value={paymentData.remarks}
                    onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})}
                    placeholder={paymentData.paymentMode === 'MERCY' ? "Explain why this fee is waived..." : "Txn ID / Note"}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className={`flex-1 h-12 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${paymentData.paymentMode === 'MERCY' ? 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-700' : 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700'}`}>Confirm Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6">
        {/* Profile Banner */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm mb-8 overflow-hidden relative">
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="w-40 h-40 rounded-[2rem] bg-slate-100 flex items-center justify-center text-6xl font-black text-slate-300 border-4 border-white shadow-xl">
              {student.user?.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{student.user?.name || "Student"}</h2>
                <span className="px-4 py-1 bg-blue-50 text-primary border border-blue-100 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                  {student.regNo || "REGISTRATION PENDING"}
                </span>
                {totalOutstanding > 0 && (
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${totalOverdue > 0 ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {totalOverdue > 0 ? `🔴 OVERDUE: ₹${totalOverdue.toLocaleString()}` : `Total Dues: ₹${totalOutstanding.toLocaleString()}`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {student.courses.map((c: any) => (
                  <span key={c.courseId} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    {c.course.name} {c.batch ? `(${c.batch.name})` : ''}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-6 mt-8 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">phone</span>
                  <span className="text-xs font-bold text-slate-600">{student.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="text-xs font-bold text-slate-600">{student.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-xs">{student.address}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  if (!confirm(`Are you sure you want to mark this student as ${student.status === 'INACTIVE' ? 'Active' : 'Inactive'}?`)) return;
                  try {
                    const newStatus = student.status === 'INACTIVE' ? 'APPROVED' : 'INACTIVE';
                    await studentApi.update(student.id, { status: newStatus });
                    alert(`Student marked as ${newStatus}`);
                    fetchStudent();
                  } catch (err) { alert("Failed to update status"); }
                }}
                className={`px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  student.status === 'INACTIVE' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {student.status === 'INACTIVE' ? 'Mark Active' : 'Mark Inactive'}
              </button>
              <Link 
                href={`/admin/students/approval-success/${student.id}`}
                className="px-8 h-12 bg-white text-primary border-2 border-primary/20 hover:border-primary rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Registration Page
              </Link>
            </div>
          </div>
          {/* Abstract circles */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-3xl mb-8 overflow-x-auto shadow-sm no-scrollbar">
          {[
            { id: "PERSONAL", label: "Identity & Personal", icon: "person" },
            { id: "ACADEMIC", label: "Academic Records", icon: "school" },
            { id: "FINANCIAL", label: "Fee Intelligence", icon: "payments" },
            { id: "SERVICES", label: "Hostel & Services", icon: "bed" },
            { id: "DOCUMENTS", label: "Leave & Records", icon: "description" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "PERSONAL" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-primary flex items-center justify-center material-symbols-outlined text-sm">account_circle</span>
                  Family & Contact
                </h3>
                <div className="space-y-6">
                  <DetailItem label="Guardian Name" value={student.guardianName} />
                  <DetailItem label="Date of Birth" value={new Date(student.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
                  <DetailItem label="Gender" value={student.gender} />
                  <DetailItem label="Permanent Address" value={student.address} />
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center material-symbols-outlined text-sm">history_edu</span>
                  Previous Schooling
                </h3>
                <div className="space-y-6">
                  <DetailItem label="Last School Name" value={student.schoolName || "N/A"} />
                  <div className="grid grid-cols-2 gap-6">
                    <DetailItem label="Madhyamik %" value={`${student.madhyamikMarks || '0'}%`} />
                    <DetailItem label="Previous NEET" value={student.prevNeetMarks || "N/A"} />
                  </div>
                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                    <DetailItem label="HS Physics" value={student.hsMarksPhysics || "N/A"} />
                    <DetailItem label="HS Chemistry" value={student.hsMarksChemistry || "N/A"} />
                    <DetailItem label="HS Biology" value={student.hsMarksBiology || "N/A"} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ACADEMIC" && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8">Examination Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Title</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {student.results?.map((r: any) => (
                        <tr key={r.id} className="group">
                          <td className="py-4 font-bold text-slate-900">{r.test?.title || "Unknown Test"}</td>
                          <td className="py-4"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{r.test?.type || "General"}</span></td>
                          <td className="py-4 text-xs font-bold text-slate-400">{r.test?.date ? new Date(r.test.date).toLocaleDateString() : "N/A"}</td>
                          <td className="py-4 text-right">
                            <span className="font-black text-primary">{r.marksObtained}</span>
                            <span className="text-[10px] text-slate-300 font-bold ml-1">/ {r.test?.maxMarks || "—"}</span>
                          </td>
                        </tr>
                      ))}
                      {(!student.results || student.results.length === 0) && (
                        <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No examination records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8">Attendance Intelligence</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present</p>
                    <p className="text-3xl font-black text-emerald-700">{student.attendances?.filter((a: any) => a.status === 'PRESENT').length || 0}</p>
                  </div>
                  <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Absent</p>
                    <p className="text-3xl font-black text-rose-700">{student.attendances?.filter((a: any) => a.status === 'ABSENT').length || 0}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {student.attendances?.slice(0, 10).map((a: any) => (
                        <tr key={a.id}>
                          <td className="py-4 text-xs font-bold text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-slate-400">{a.remarks || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "FINANCIAL" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Total Fee Liability</p>
                  <p className="text-3xl font-black tracking-tighter">₹{(student.fees?.reduce((acc: number, f: any) => acc + f.amount, 0) || 0).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-3xl font-black tracking-tighter">₹{(student.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0).toLocaleString()}</p>
                </div>
                <div className="bg-red-600 p-6 rounded-[2rem] text-white shadow-xl shadow-red-600/20 relative overflow-hidden">
                  <p className="text-[9px] font-black opacity-80 uppercase tracking-widest mb-1">🔴 Overdue Dues</p>
                  <p className="text-3xl font-black tracking-tighter">₹{totalOverdue.toLocaleString()}</p>
                </div>
                <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                  <p className="text-[9px] font-black opacity-80 uppercase tracking-widest mb-1">🔵 Upcoming Dues</p>
                  <p className="text-3xl font-black tracking-tighter">₹{totalUpcoming.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-black text-slate-900">Fee Ledger</h3>
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
                    >
                      Record / Waive
                    </button>
                  </div>
                  <div className="space-y-4">
                    {student.fees?.map((f: any) => {
                      const isOverdue = new Date(f.dueDate) <= new Date();
                      const paid = student.payments?.filter((p:any) => p.feeId === f.id).reduce((s:number, p:any) => s + p.amount, 0) || 0;
                      const remaining = Math.max(0, f.amount - paid);
                      return (
                      <div key={f.id} className={`p-4 rounded-2xl border flex justify-between items-center ${remaining > 0 ? (isOverdue ? 'border-red-100 bg-red-50/50' : 'border-blue-50 bg-blue-50/30') : 'border-emerald-50 bg-emerald-50/50'}`}>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{f.type} FEE</p>
                          <p className="text-[10px] font-bold text-slate-400">{f.month ? `Month: ${f.month}` : f.course?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-black ${remaining > 0 ? (isOverdue ? 'text-red-600' : 'text-blue-600') : 'text-emerald-600'}`}>₹{f.amount.toLocaleString()}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${remaining > 0 ? (isOverdue ? 'text-red-500' : 'text-blue-500') : 'text-emerald-500'}`}>
                            {remaining > 0 ? `₹${remaining.toLocaleString()} DUE` : 'PAID IN FULL'}
                          </span>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-8">Payment History</h3>
                  <div className="space-y-4">
                    {student.payments?.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-2xl border border-slate-50 bg-white shadow-sm flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center material-symbols-outlined text-sm">check_circle</div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{p.paymentMode}</p>
                            <p className="text-[10px] font-bold text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">₹{p.amount.toLocaleString()}</p>
                          <Link href={`/receipt/${p.id}`} className="text-[8px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:underline">View Receipt</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "SERVICES" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8">Residential Intelligence</h3>
                {student.hostelAlloc ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-blue-50 text-primary flex items-center justify-center material-symbols-outlined text-4xl">bed</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Allocated Room</p>
                        <h4 className="text-3xl font-black text-slate-900">{student.hostelAlloc.hostel?.roomNumber || "N/A"}</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                      <DetailItem label="Join Date" value={new Date(student.hostelAlloc.joinDate).toLocaleDateString()} />
                      <DetailItem label="Hostel Status" value="ACTIVE" />
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200">hotel</span>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest mt-4">Not Enrolled in Hostel</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8">Inventory Issued</h3>
                <div className="space-y-4">
                  {student.inventoryIssues?.map((issue: any) => (
                    <div key={issue.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase">{issue.item?.name || "Inventory Item"}</p>
                        <p className="text-[10px] font-bold text-slate-400">Due: {new Date(issue.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${issue.returnedOn ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {issue.returnedOn ? 'Returned' : 'In Possession'}
                      </span>
                    </div>
                  ))}
                  {(!student.inventoryIssues || student.inventoryIssues.length === 0) && (
                    <div className="py-12 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No items issued</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "DOCUMENTS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8">Leave Passes</h3>
                <div className="space-y-4">
                  {student.leavePasses?.map((lp: any) => (
                    <div key={lp.id} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{lp.reason}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">To: {lp.destination}</p>
                        </div>
                        <span className="text-[10px] font-black text-primary bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{lp.passNo}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] text-slate-400 font-bold">
                          {new Date(lp.startDate).toLocaleDateString()} — {new Date(lp.endDate).toLocaleDateString()}
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          lp.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {lp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!student.leavePasses || student.leavePasses.length === 0) && (
                    <div className="py-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No leave records found</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8">Issued Certificates</h3>
                <div className="space-y-4">
                  {student.certificates?.map((cert: any) => (
                    <div key={cert.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{cert.type} CERTIFICATE</p>
                        <p className="text-[10px] font-bold text-slate-400">Ref: {cert.referenceNumber}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-500">{new Date(cert.issueDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {(!student.certificates || student.certificates.length === 0) && (
                    <div className="py-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No certificates issued</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function StudentProfile() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
      <StudentProfileContent />
    </Suspense>
  );
}
