"use client";

import { useState, useEffect } from "react";
import { cbtApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentCbtExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.studentProfile?.id) {
      fetchExams(user.studentProfile.id);
    }
  }, [router]);

  const fetchExams = async (studentId: string) => {
    setIsLoading(true);
    try {
      const res = await cbtApi.getStudentExams(studentId);
      setExams(res.data);
    } catch (err) {
      console.error("Failed to fetch exams", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getExamStatus = (exam: any) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);
    const attempt = exam.attempts?.[0];

    if (attempt?.status === 'SUBMITTED') return 'COMPLETED';
    if (now < start) return 'UPCOMING';
    if (now > end) return 'EXPIRED';
    return 'LIVE';
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student/dashboard" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600">computer</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">CBT Portal</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available Assessments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">NEET Ready Practice</h2>
            <p className="text-indigo-100 font-medium text-sm leading-relaxed max-w-md">
              Take simulated mock tests designed to match the NTA NEET pattern. Get real-time feedback and detailed error analysis.
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[180px] text-white/10 select-none pointer-events-none">
            history_edu
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Checking available tests...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">sentiment_dissatisfied</span>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No exams assigned to your batch yet</p>
            </div>
          ) : (
            exams.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <div key={exam.id} className={`bg-white rounded-3xl border transition-all p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${status === 'LIVE' ? 'border-indigo-500 shadow-lg shadow-indigo-50' : 'border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${status === 'LIVE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      <span className="material-symbols-outlined text-3xl">assignment</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{exam.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {exam.duration} Minutes
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">quiz</span>
                          {exam.totalMarks} Marks
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {new Date(exam.startTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-col items-center gap-3">
                    {status === 'LIVE' && (
                      <Link href={`/student/cbt/test/${exam.id}`} className="w-full md:w-40 h-12 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
                        Start Exam
                      </Link>
                    )}
                    {status === 'COMPLETED' && (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Attempted</span>
                        <Link href={`/student/cbt/result/${exam.attempts[0].id}`} className="text-sm font-bold text-indigo-600 hover:underline">
                          View Analysis
                        </Link>
                      </div>
                    )}
                    {status === 'UPCOMING' && (
                      <span className="px-4 py-2 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-100">
                        Starts {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {status === 'EXPIRED' && (
                      <span className="px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        Missed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
