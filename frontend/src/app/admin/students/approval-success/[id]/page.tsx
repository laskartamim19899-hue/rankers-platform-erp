"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { studentApi, settingsApi } from "@/lib/api";
import Link from "next/link";

export default function RegistrationConfirmation() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, setRes] = await Promise.all([
          studentApi.getById(id as string),
          settingsApi.get()
        ]);
        setStudent(sRes.data);
        setSettings(setRes.data);
      } catch (err) {
        console.error("Failed to fetch details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-300">STUDENT NOT FOUND</h2>
        <Link href="/admin/students" className="mt-4 inline-block text-primary font-bold">Back to Database</Link>
      </div>
    </div>
  );

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 print:p-0 print:bg-white">
      {/* Control Panel (Hidden on Print) */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.push('/admin/students')}
          className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Students
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print Confirmation
          </button>
        </div>
      </div>

      {/* Confirmation Document */}
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">
        {/* Decorative Header */}
        <div className="bg-primary p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Admission<br/>Confirmed</h1>
                <p className="mt-4 text-xs font-bold opacity-70 uppercase tracking-[0.2em]">Rankers' Platform Intelligence Suite</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Date of Issue</p>
                <p className="text-sm font-bold">{dateStr}</p>
              </div>
            </div>
          </div>
          {/* Abstract circles */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        <div className="p-12 space-y-12">
          {/* Success Message */}
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-emerald-500">verified</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registration Complete</h2>
            <p className="text-slate-500 mt-2 font-medium">The student has been successfully approved and added to the official institutional records.</p>
          </div>

          {/* Primary ID Card Style Info */}
          <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 bg-white rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center text-5xl font-black text-slate-200 uppercase">
                {student.user?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Registration ID</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{student.regNo || "PENDING"}</h3>
                <h4 className="text-xl font-bold text-slate-600 mt-2">{student.user?.name || "Student"}</h4>
              </div>
            </div>
          </div>

          {/* Enrollment Details */}
          <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-12">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Course Details</p>
              <div className="space-y-4">
                {student.courses?.map((c: any) => (
                  <div key={c.courseId}>
                    <p className="text-sm font-black text-slate-900">{c.course.name}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{c.batch?.name || "Unassigned Batch"}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Student Info</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Guardian</p>
                  <p className="text-sm font-bold text-slate-700">{student.guardianName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Contact</p>
                  <p className="text-sm font-bold text-slate-700">{student.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Instructions */}
          <div className="pt-12 border-t border-slate-100">
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-amber-500">info</span>
                <div>
                  <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Next Steps</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                    Please provide this registration number to the student. They can now use this ID for all future academic and financial interactions, including fee payments and attendance tracking.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Institutional Seal</p>
                <div className="w-24 h-24 border-2 border-slate-100 rounded-full flex items-center justify-center opacity-30">
                  <span className="text-[8px] font-bold text-center">RANKERS<br/>PLATFORM</span>
                </div>
              </div>
              <div className="text-right space-y-6">
                <div className="w-48 border-b-2 border-slate-900 ml-auto"></div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Registrar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { padding: 0; background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      `}} />
    </div>
  );
}
