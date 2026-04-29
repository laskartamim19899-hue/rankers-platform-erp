"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { studentApi } from "@/lib/api";

export default function StudentProfile() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  const fetchStudent = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getById(params.id as string);
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to fetch student", err);
    } finally {
      setIsLoading(false);
    }
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
        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${student.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          {student.status}
        </div>
      </header>

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
