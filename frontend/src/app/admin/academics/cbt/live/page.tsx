"use client";

import { useState, useEffect } from "react";
import { cbtApi } from "@/lib/api";
import Link from "next/link";

export default function LiveProctoring() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLiveAttempts();
    const interval = setInterval(fetchLiveAttempts, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLiveAttempts = async () => {
    try {
      const res = await cbtApi.getLiveAttempts();
      setAttempts(res.data);
    } catch (err) {
      console.error("Failed to fetch live attempts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminate = async (id: string) => {
    if (!confirm("Are you sure you want to forcibly terminate this student's exam?")) return;
    try {
      await cbtApi.terminateAttempt(id);
      fetchLiveAttempts();
    } catch (err) {
      alert("Failed to terminate attempt");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/academics/cbt" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 animate-pulse">sensors</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Live Proctoring</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Exam Surveillance</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">System Online • Auto-Syncing</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-black text-slate-900">{attempts.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Students</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-black text-red-600">{attempts.filter(a => a.securityAlerts > 0).length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Security Warnings Issued</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-black text-indigo-600">
                {attempts.length > 0 ? Math.round(attempts.reduce((acc, a) => acc + (a._count?.responses || 0), 0) / attempts.length) : 0}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg. Qns Completed</p>
           </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Exam / Subject</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5">Security Status</th>
                <th className="px-8 py-5">Last Activity</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connecting to session stream...</p>
                  </td>
                </tr>
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No active exam sessions found</p>
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                           {attempt.student.user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{attempt.student.user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attempt.student.regNo || 'NO REG'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{attempt.exam.title}</p>
                      <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">{attempt.exam.title.split(' ')[0]}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-32">
                         <div className="flex justify-between text-[10px] font-bold mb-1.5">
                            <span>{attempt._count?.responses || 0} Ans</span>
                            <span className="text-slate-400">{Math.round(((attempt._count?.responses || 0) / 180) * 100)}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${((attempt._count?.responses || 0) / 180) * 100}%` }} />
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {attempt.securityAlerts > 0 ? (
                        <div className="flex items-center gap-2 text-red-600">
                           <span className="material-symbols-outlined text-sm">warning</span>
                           <span className="text-xs font-black uppercase tracking-wider">{attempt.securityAlerts} Tab Switches</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600">
                           <span className="material-symbols-outlined text-sm">verified_user</span>
                           <span className="text-xs font-black uppercase tracking-wider">Secure Session</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-medium text-slate-600">
                         {new Date(attempt.lastHeartbeat).toLocaleTimeString()}
                       </p>
                       <p className="text-[9px] text-emerald-500 font-bold uppercase">Active Now</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => handleTerminate(attempt.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                       >
                         <span className="material-symbols-outlined text-lg">block</span>
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
