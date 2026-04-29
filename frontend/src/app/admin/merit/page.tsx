"use client";

import { useState, useEffect } from "react";
import { meritApi } from "@/lib/api";
import Link from "next/link";
import { exportToCSV } from "@/lib/utils";

const TIER_CONFIG: Record<string, { label: string; color: string; badge: string; icon: string }> = {
  MERIT_A: { label: "Merit A — Gold", color: "text-amber-600", badge: "bg-amber-50 border-amber-300 text-amber-700", icon: "emoji_events" },
  MERIT_B: { label: "Merit B — Silver", color: "text-slate-500", badge: "bg-slate-50 border-slate-300 text-slate-600", icon: "workspace_premium" },
  MERIT_C: { label: "Merit C — Bronze", color: "text-orange-600", badge: "bg-orange-50 border-orange-300 text-orange-700", icon: "military_tech" },
  NONE: { label: "No Scholarship", color: "text-slate-400", badge: "bg-slate-50 border-slate-200 text-slate-400", icon: "person" },
};

export default function MeritPage() {
  const [board, setBoard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [filterTier, setFilterTier] = useState("ALL");
  const [printStudent, setPrintStudent] = useState<any>(null);

  const handleExport = () => {
    const exportData = filtered.map(s => ({
      "Rank": s.rank,
      "Student Name": s.user?.name,
      "Registration No": s.regNo,
      "Course": s.courses?.[0]?.course?.name || "N/A",
      "Total Marks": `${s.totalMarks}/${s.maxPossible}`,
      "Percentage": `${s.percentage}%`,
      "Scholarship Tier": s.scholarshipTier || "NONE"
    }));
    exportToCSV(exportData, "Merit_Leaderboard");
  };

  const fetchBoard = () => {
    setIsLoading(true);
    meritApi.getBoard().then(r => setBoard(r.data)).catch(console.error).finally(() => setIsLoading(false));
  };
  useEffect(fetchBoard, []);

  const handleAutoAssign = async () => {
    if (!confirm("Auto-assign scholarship tiers based on current test scores?")) return;
    setIsAssigning(true);
    try {
      await meritApi.autoAssign();
      fetchBoard();
      alert("✅ Scholarship tiers auto-assigned!");
    } catch { alert("Failed to assign tiers"); }
    finally { setIsAssigning(false); }
  };

  const handleManualTier = async (studentId: string, tier: string) => {
    try {
      await meritApi.updateTier(studentId, tier);
      setBoard(board.map(s => s.id === studentId ? { ...s, scholarshipTier: tier } : s));
    } catch { alert("Failed to update tier"); }
  };

  const filtered = filterTier === "ALL" ? board : board.filter(s => (s.scholarshipTier || "NONE") === filterTier);

  const meritACount = board.filter(s => s.scholarshipTier === "MERIT_A").length;
  const meritBCount = board.filter(s => s.scholarshipTier === "MERIT_B").length;
  const meritCCount = board.filter(s => s.scholarshipTier === "MERIT_C").length;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Print Certificate Overlay */}
      {printStudent && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:block">
          
          <style>{`
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body * { visibility: hidden; }
              #certificate-wrapper, #certificate-wrapper * { visibility: visible; }
              #certificate-wrapper { 
                position: absolute; left: 0; top: 0; width: 100%; height: 100%; 
                display: flex; align-items: center; justify-content: center; 
                background: white !important; margin: 0 !important; padding: 0 !important;
              }
              .cert-box {
                width: 280mm !important; height: 190mm !important;
                margin: 0 !important; box-shadow: none !important;
                -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:rounded-none print:max-h-none print:max-w-none">
            
            {/* Scrollable Certificate Area */}
            <div id="certificate-wrapper" className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
              <div className="cert-box bg-white w-full max-w-[280mm] aspect-[1.414/1] relative" style={{ fontFamily: 'Georgia, serif', textAlign: 'center', border: '8px double #d97706', padding: '4%', borderRadius: '12px', background: 'linear-gradient(135deg, #fffbeb 0%, #fff 50%, #fffbeb 100%)' }}>
                <p style={{ fontSize: 'clamp(8px, 1.5vw, 12px)', fontWeight: 900, letterSpacing: '0.4em', color: '#92400e', textTransform: 'uppercase', marginBottom: '2%' }}>Certificate of Academic Merit</p>
                <img src="/logo.png" alt="Logo" className="h-10 sm:h-16 mx-auto mb-2 sm:mb-4 object-contain" />
                <h1 style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, color: '#1e3a8a', marginBottom: '1%', letterSpacing: '-0.5px' }}>Rankers' Platform</h1>
                <p style={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#64748b', marginBottom: '4%' }}>This is to certify that</p>
                <h2 style={{ fontSize: 'clamp(24px, 5vw, 44px)', fontWeight: 900, color: '#d97706', marginBottom: '1%', letterSpacing: '-1px' }}>{printStudent.user?.name}</h2>
                <p style={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#64748b', marginBottom: '1%' }}>Registration No: <strong>{printStudent.regNo}</strong></p>
                <p style={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#64748b', marginBottom: '4%' }}>{printStudent.courses?.[0]?.course?.name}</p>
                
                <div style={{ background: '#1e3a8a', color: 'white', padding: '2% 5%', borderRadius: '12px', display: 'inline-block', marginBottom: '3%' }}>
                  <p style={{ fontSize: 'clamp(8px, 1.2vw, 11px)', letterSpacing: '0.3em', marginBottom: '2%', opacity: 0.7 }}>HAS BEEN AWARDED</p>
                  <p style={{ fontSize: 'clamp(16px, 3vw, 28px)', fontWeight: 900 }}>{TIER_CONFIG[printStudent.scholarshipTier || 'NONE']?.label}</p>
                  <p style={{ fontSize: 'clamp(10px, 1.5vw, 14px)', opacity: 0.8 }}>Performance: {printStudent.percentage}% | Rank #{printStudent.rank}</p>
                </div>
                
                <p style={{ fontSize: 'clamp(9px, 1.2vw, 12px)', color: '#94a3b8', marginTop: '1%' }}>Issued on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: '8%', left: '10%', right: '10%' }}>
                  <div style={{ textAlign: 'center', width: '25%' }}>
                    <div style={{ borderTop: '2px solid #1e3a8a', paddingTop: '8px' }}><p style={{ fontSize: 'clamp(9px, 1.2vw, 12px)', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Principal</p></div>
                  </div>
                  <div style={{ textAlign: 'center', width: '25%' }}>
                    <div style={{ borderTop: '2px solid #1e3a8a', paddingTop: '8px' }}><p style={{ fontSize: 'clamp(9px, 1.2vw, 12px)', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Director</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-slate-100 bg-white print:hidden">
              <button onClick={() => setPrintStudent(null)} className="w-full sm:w-1/3 h-12 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => window.print()} className="w-full sm:flex-1 h-12 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                <span className="material-symbols-outlined text-xl">print</span> Print High-Res Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><span className="material-symbols-outlined text-amber-600">emoji_events</span></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Merit & Scholarship Board</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance Rankings & Tier Management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="bg-white text-slate-600 border-2 border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-amber-600 hover:text-amber-600 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            CSV
          </button>
          <button onClick={handleAutoAssign} disabled={isAssigning} className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
            {isAssigning ? <span className="material-symbols-outlined text-sm animate-spin">sync</span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
            {isAssigning ? "Assigning..." : "Auto-Assign Tiers"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Ranked</p>
            <p className="text-3xl font-black text-primary">{board.length}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">🥇 Merit A</p>
            <p className="text-3xl font-black text-amber-600">{meritACount}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">🥈 Merit B</p>
            <p className="text-3xl font-black text-slate-600">{meritBCount}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">🥉 Merit C</p>
            <p className="text-3xl font-black text-orange-600">{meritCCount}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["ALL", "MERIT_A", "MERIT_B", "MERIT_C", "NONE"].map(tier => (
            <button key={tier} onClick={() => setFilterTier(tier)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterTier === tier ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary'}`}>
              {tier === "ALL" ? "All Students" : TIER_CONFIG[tier]?.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-black text-slate-900">Performance Leaderboard</h2>
            <span className="text-xs font-bold text-slate-400">{filtered.length} students</span>
          </div>
          {isLoading ? (
            <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500 mx-auto"></div></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((student) => {
                const tier = TIER_CONFIG[student.scholarshipTier || "NONE"];
                const isTopThree = student.rank <= 3;
                return (
                  <div key={student.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${isTopThree ? 'bg-amber-50/30' : ''}`}>
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${student.rank === 1 ? 'bg-amber-500 text-white' : student.rank === 2 ? 'bg-slate-400 text-white' : student.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {student.rank <= 3 ? ['🥇', '🥈', '🥉'][student.rank - 1] : `#${student.rank}`}
                    </div>
                    {/* Student info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-slate-900">{student.user?.name}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tier.badge}`}>{tier.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold">{student.regNo} • {student.courses?.[0]?.course?.name}</p>
                    </div>
                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-black ${student.percentage >= 80 ? 'text-emerald-600' : student.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{student.percentage}%</p>
                      <p className="text-xs text-slate-400 font-bold">{student.totalMarks}/{student.maxPossible} marks</p>
                    </div>
                    {/* Score Bar */}
                    <div className="w-24 hidden md:block">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${student.percentage >= 80 ? 'bg-emerald-500' : student.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${student.percentage}%` }} />
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select value={student.scholarshipTier || "NONE"} onChange={e => handleManualTier(student.id, e.target.value)}
                        className="text-[10px] font-black h-8 px-2 border border-slate-200 rounded-lg outline-none uppercase">
                        {Object.keys(TIER_CONFIG).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {student.scholarshipTier && student.scholarshipTier !== "NONE" && (
                        <button onClick={() => setPrintStudent(student)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all" title="Print Certificate">
                          <span className="material-symbols-outlined text-sm">workspace_premium</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200">emoji_events</span>
                  <p className="text-slate-400 font-bold mt-4">No students match this filter.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
