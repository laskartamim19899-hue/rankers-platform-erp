"use client";

import { useState, useEffect } from "react";
import { studentApi } from "@/lib/api";
import Link from "next/link";

export default function AdmissionsApproval() {
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getPending();
      setPendingStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch pending students", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this student? This will generate their unique Registration Number.")) return;
    
    setIsApproving(id);
    try {
      await studentApi.approve(id);
      alert("Student approved successfully!");
      fetchPending();
    } catch (err) {
      alert("Failed to approve student.");
    } finally {
      setIsApproving(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Admissions Approval</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Pending Applications</h2>
              <p className="text-xs text-slate-500">Review and approve new student registrations</p>
            </div>
            <div className="bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200">
              {pendingStudents.length} Pending
            </div>
          </div>

          {isLoading ? (
            <div className="p-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            </div>
          ) : pendingStudents.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <p className="font-bold text-slate-800">No pending applications</p>
              <p className="text-sm text-slate-500">All student registrations have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch/Course</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                            {student.user.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{student.user.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Applied on {new Date(student.user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {student.courses?.map((sc: any) => (
                            <span key={sc.course.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">
                              {sc.course.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-700 font-medium">{student.phone}</p>
                        <p className="text-xs text-slate-400">{student.user.email}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleApprove(student.id)}
                          disabled={isApproving === student.id}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isApproving === student.id ? "Approving..." : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
