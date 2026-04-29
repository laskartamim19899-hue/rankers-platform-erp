"use client";

import { useState } from "react";
import Link from "next/link";
import { leaveApi } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string; desc: string }> = {
  PENDING:  { label: "Pending Review",  color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-300", icon: "schedule",      desc: "Your application is awaiting admin review." },
  APPROVED: { label: "Approved ✓",      color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-300",icon: "verified",      desc: "Leave has been approved and pass issued." },
  REJECTED: { label: "Rejected",        color: "text-red-700",    bg: "bg-red-50",     border: "border-red-300",   icon: "cancel",        desc: "Application was not approved. Contact admin for details." },
  RETURNED: { label: "Returned",        color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-300",  icon: "check_circle",  desc: "Student has returned from leave." },
};

export default function LeaveStatusPage() {
  const [regNo, setRegNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await leaveApi.checkStatus(regNo.trim().toUpperCase());
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "No student found. Check the registration number.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const getLeaveStatus = (app: any) => {
    if (app.status === "REJECTED") return STATUS_CONFIG.REJECTED;
    if (app.status === "RETURNED") return STATUS_CONFIG.RETURNED;
    if (app.status === "PENDING")  return STATUS_CONFIG.PENDING;
    // APPROVED — check if on leave or upcoming or overdue
    const now = new Date();
    const start = new Date(app.startDate);
    const end = new Date(app.endDate);
    if (end < now) return { ...STATUS_CONFIG.APPROVED, label: "Overdue Return", color: "text-red-700", bg: "bg-red-50", border: "border-red-300", icon: "warning", desc: "Student has not returned by the scheduled date." };
    if (start <= now) return { ...STATUS_CONFIG.APPROVED, label: "Currently on Leave", color: "text-emerald-700", icon: "flight_takeoff", desc: "Student is currently on approved leave." };
    return { ...STATUS_CONFIG.APPROVED, label: "Approved — Upcoming", icon: "event_available", desc: "Leave is approved. Departure date is approaching." };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/80 to-slate-800 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 text-white/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">school</span>
          </div>
          <span className="font-black text-white tracking-tight">Rankers' Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/leave-apply" className="text-xs font-black text-amber-400 hover:text-amber-300 transition-colors border border-amber-400/40 px-4 py-2 rounded-xl hover:bg-amber-400/10">
            + Apply for Leave
          </Link>
          <Link href="/" className="text-xs font-bold hover:text-white transition-colors">← Home</Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl space-y-6">

          {/* Search Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">manage_search</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black">Leave Status Tracker</h1>
                  <p className="text-sm opacity-60">Check your application status anytime</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCheck} className="p-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Enter Student Registration Number
              </label>
              <div className="flex gap-3">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">badge</span>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={e => setRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. RP-2026-0001"
                    className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 rounded-2xl outline-none focus:border-primary font-black text-slate-800 tracking-wider transition-all font-mono text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !regNo.trim()}
                  className="h-14 px-7 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
                >
                  {loading
                    ? <><span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> Checking...</>
                    : <><span className="material-symbols-outlined text-sm">search</span> Check</>
                  }
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Found on your admission card or ID card</p>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-white rounded-2xl p-6 border-2 border-red-100 flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">error</span>
              </div>
              <div>
                <p className="font-black text-red-700">Not Found</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Student Banner */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0">
                  {result.studentName[0]}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg">{result.studentName}</p>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{result.regNo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{result.applications.length} application(s) found</p>
                </div>
              </div>

              {result.applications.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xl">
                  <span className="material-symbols-outlined text-slate-200 text-5xl">luggage</span>
                  <p className="font-bold text-slate-500 mt-4">No leave applications found for this student.</p>
                  <Link href="/leave-apply" className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Apply Now
                  </Link>
                </div>
              ) : (
                result.applications.map((app: any) => {
                  const cfg = getLeaveStatus(app);
                  const days = Math.ceil((new Date(app.endDate).getTime() - new Date(app.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <div key={app.id} className={`bg-white rounded-2xl border-2 ${cfg.border} shadow-xl overflow-hidden`}>
                      {/* Status Bar */}
                      <div className={`${cfg.bg} px-6 py-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${cfg.color} text-2xl`}>{cfg.icon}</span>
                          <div>
                            <p className={`font-black ${cfg.color} text-sm`}>{cfg.label}</p>
                            <p className={`text-[10px] font-medium ${cfg.color} opacity-70`}>{cfg.desc}</p>
                          </div>
                        </div>
                        {app.status === "APPROVED" && (
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Pass No</p>
                            <p className="font-black text-primary text-xs font-mono">{app.passNo}</p>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="px-6 py-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{app.destination}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{days} day{days > 1 ? "s" : ""}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Departure</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{fmtDate(app.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Return By</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{fmtDate(app.endDate)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                          <p className="font-medium text-slate-600 text-sm mt-0.5 italic">"{app.reason}"</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applied On</p>
                          <p className="font-bold text-slate-700 text-xs mt-0.5">{fmtDate(app.issuedAt)}</p>
                        </div>
                        {app.returnedAt && (
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Returned On</p>
                            <p className="font-bold text-emerald-700 text-xs mt-0.5">{fmtDate(app.returnedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Help Card */}
          {!result && !error && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-white/60 text-sm space-y-3">
              <p className="font-black text-white/80 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">info</span>
                How to check your status
              </p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2"><span className="text-amber-400 font-black">1.</span> Enter your ward's Registration Number (e.g. RP-2026-0001)</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 font-black">2.</span> Click "Check" to see all leave applications</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 font-black">3.</span> Applications show Pending / Approved / Rejected status</li>
              </ul>
              <Link href="/leave-apply" className="inline-flex items-center gap-2 mt-2 text-amber-400 hover:text-amber-300 transition-colors font-black text-xs">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Submit a new application →
              </Link>
            </div>
          )}

        </div>
      </main>

      <footer className="text-center py-6 text-white/30 text-[10px] font-bold">
        © {new Date().getFullYear()} Rankers' Platform — ERP System
      </footer>
    </div>
  );
}
