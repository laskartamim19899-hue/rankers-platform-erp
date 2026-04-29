"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const toppers = [
  { name: "Ahmed Kabir",   rank: "AIR 45",       exam: "NEET 2025",    college: "AIIMS Delhi" },
  { name: "Sanya Mirza",   rank: "AIR 112",       exam: "JEE Adv 2025", college: "IIT Bombay" },
  { name: "Rahul Sharma",  rank: "99.8 %tile",    exam: "JEE Main",     college: "NIT Trichy" },
  { name: "Fatima Bi",     rank: "AIR 89",        exam: "NEET 2024",    college: "MAMC Delhi" },
];

const stats = [
  { label: "MBBS Selections",  val: "450+", icon: "medical_services" },
  { label: "IIT/NIT Admits",   val: "280+", icon: "engineering" },
  { label: "State Ranks",      val: "12",   icon: "military_tech" },
  { label: "Top 1%ile (JEE)",  val: "85",   icon: "workspace_premium" },
];

function PctBar({ pct }: { pct: number }) {
  const color = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5">
      <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export default function ResultsPage() {
  const [regNo, setRegNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      const res = await axios.get(`${API}/academic/results/public/${encodeURIComponent(regNo.trim().toUpperCase())}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "No student found with this Registration Number.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-white">
      <Header transparent={true} />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 px-6 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/6 blur-[120px] rounded-full" />
          <span className="relative z-10 text-amber-500 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Institutional Glory</span>
          <h1 className="relative z-10 text-5xl md:text-8xl font-black leading-tight tracking-tighter mt-3">Wall of Fame.</h1>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-24 space-y-24">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl text-center group hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <h4 className="text-3xl md:text-5xl font-black text-white mb-2">{s.val}</h4>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Toppers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toppers.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center space-y-5 hover:bg-white/10 transition-all group hover:-translate-y-2 duration-500">
                <div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center border-4 border-amber-500/20 group-hover:border-amber-500 transition-all">
                  <span className="material-symbols-outlined text-4xl text-amber-500">person</span>
                </div>
                <div>
                  <h3 className="text-xl font-black">{t.name}</h3>
                  <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest mt-1">{t.rank}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{t.exam}</p>
                  <p className="text-sm font-medium mt-1">{t.college}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── MY RESULTS LOOKUP ── */}
          <div id="my-results" className="scroll-mt-24">
            <div className="text-center mb-10">
              <span className="text-amber-500 font-black uppercase text-[10px] tracking-[0.4em]">Student Portal</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3">Check Your Results.</h2>
              <p className="text-white/40 mt-3 max-w-xl mx-auto">Enter your Registration Number to view your personal exam scores and attendance record.</p>
            </div>

            <div className="max-w-2xl mx-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">badge</span>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={e => setRegNo(e.target.value.toUpperCase())}
                    placeholder="Enter Registration Number (e.g. RP-2026-0001)"
                    className="w-full h-14 pl-12 pr-4 bg-white/10 border border-white/15 rounded-2xl outline-none focus:border-amber-500 text-white font-black font-mono placeholder:text-white/30 placeholder:font-normal transition-all text-sm"
                  />
                </div>
                <button type="submit" disabled={loading || !regNo.trim()}
                  className="h-14 px-7 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 flex items-center gap-2 shadow-xl shadow-amber-500/20 whitespace-nowrap flex-shrink-0">
                  {loading
                    ? <><span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> Checking...</>
                    : <><span className="material-symbols-outlined text-sm">search</span> View Results</>
                  }
                </button>
              </form>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                  <span className="material-symbols-outlined text-red-400 text-2xl">error</span>
                  <p className="text-sm font-bold text-red-300">{error}</p>
                </div>
              )}

              {/* Result Card */}
              {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Profile Banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-lg">
                      {result.studentName[0]}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">{result.studentName}</p>
                      <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">{result.regNo}</p>
                      <p className="text-white/50 text-xs mt-0.5">{result.batch ? `${result.batch} • ` : ""}{result.course || "—"}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[9px] font-black text-white/40 uppercase">Attendance</p>
                      <p className={`text-2xl font-black ${Number(result.attendance.percentage) >= 75 ? "text-emerald-400" : "text-red-400"}`}>
                        {result.attendance.percentage}%
                      </p>
                      <p className="text-[9px] text-white/30">{result.attendance.present}/{result.attendance.total} days</p>
                    </div>
                  </div>

                  {/* Test Results */}
                  {result.results.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
                      <span className="material-symbols-outlined text-white/20 text-5xl">quiz</span>
                      <p className="text-white/40 font-bold mt-3">No test results recorded yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{result.results.length} Test Result{result.results.length > 1 ? "s" : ""}</p>
                        <p className="text-[10px] font-black text-amber-400">
                          Avg: {result.results.filter((r: any) => r.percentage).length > 0
                            ? (result.results.filter((r: any) => r.percentage).reduce((s: number, r: any) => s + Number(r.percentage), 0) / result.results.filter((r: any) => r.percentage).length).toFixed(1)
                            : "—"}%
                        </p>
                      </div>
                      <div className="divide-y divide-white/5">
                        {result.results.map((r: any, i: number) => {
                          const pct = r.percentage ? Number(r.percentage) : null;
                          const badge = pct !== null
                            ? pct >= 75 ? { label: "Excellent", cls: "bg-emerald-500/20 text-emerald-400" }
                              : pct >= 50 ? { label: "Good", cls: "bg-amber-500/20 text-amber-400" }
                                : { label: "Needs Work", cls: "bg-red-500/20 text-red-400" }
                            : null;
                          return (
                            <div key={i} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-black text-white text-sm">{r.testName}</p>
                                    {badge && (
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                                    )}
                                    <span className="text-[9px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full uppercase">{r.testType || "Test"}</span>
                                  </div>
                                  <p className="text-[10px] text-white/40 font-medium mt-0.5">{fmtDate(r.testDate)}</p>
                                  {pct !== null && <PctBar pct={pct} />}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xl font-black text-white">{r.marksObtained}</p>
                                  {r.totalMarks && (
                                    <p className="text-[10px] text-white/40">/ {r.totalMarks}</p>
                                  )}
                                  {pct !== null && (
                                    <p className={`text-sm font-black mt-0.5 ${pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400"}`}>{pct}%</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <section className="bg-white text-slate-950 rounded-[3rem] p-12 md:p-24 text-center space-y-8 shadow-2xl shadow-amber-500/10">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Will You Be Next?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Join the ranks of India's most successful students. Admissions are currently open for 2026 batches.</p>
            <Link href="/apply" className="inline-flex h-16 px-12 bg-slate-950 text-amber-500 rounded-2xl items-center justify-center font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl">
              Start Your Journey →
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
