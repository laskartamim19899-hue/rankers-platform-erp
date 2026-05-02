"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { studentApi, academicApi } from "@/lib/api";

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  if (!student) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Student Not Found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/students" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight mr-auto">Academic Profile</h1>
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

      <main className="max-w-5xl mx-auto p-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-300">
                  {student.user.name.charAt(0)}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900">{student.user.name}</h2>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">
                    {student.regNo || "REGISTRATION PENDING"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    {student.courses.map((c: any) => (
                      <span key={c.courseId} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        {c.batch ? <span className="text-primary">{c.batch.name}</span> : null}
                        {c.batch ? "•" : ""} {c.course.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Personal Details</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div><p className="text-[10px] font-black text-slate-300 uppercase">Guardian Name</p><p className="font-bold text-slate-800">{student.guardianName}</p></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase">Date of Birth</p><p className="font-bold text-slate-800">{new Date(student.dob).toLocaleDateString()}</p></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase">Gender</p><p className="font-bold text-slate-800 uppercase">{student.gender}</p></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase">Residential</p><p className="font-bold text-slate-800">{student.isResidential ? 'Yes' : 'No'}</p></div>
                <div className="col-span-2"><p className="text-[10px] font-black text-slate-300 uppercase">Address</p><p className="font-bold text-slate-800">{student.address}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Academic Background</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div className="col-span-2"><p className="text-[10px] font-black text-slate-300 uppercase">Previous School</p><p className="font-bold text-slate-800">{student.schoolName || "N/A"}</p></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase">Madhyamik Marks</p><p className="font-bold text-slate-800">{student.madhyamikMarks}%</p></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase">Previous NEET</p><p className="font-bold text-slate-800">{student.prevNeetMarks || "N/A"}</p></div>
              </div>
            </div>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="space-y-6">
            <div className="bg-primary rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">phone</span>
                  <span className="font-black tracking-tight">{student.phone}</span>
                </div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="font-bold text-xs truncate">{student.user.email}</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-white/20 hover:bg-white/30 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                Send WhatsApp
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financial Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-500">Total Fees</p>
                  <p className="font-black text-slate-900">₹{student.fees.reduce((acc: number, f: any) => acc + f.amount, 0).toLocaleString()}</p>
                </div>
                <Link href={`/admin/finance?search=${student.regNo || student.user.name}`} className="block w-full py-3 bg-slate-50 text-center rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                  Manage Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StudentProfile() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
      <StudentProfileContent />
    </Suspense>
  );
}
