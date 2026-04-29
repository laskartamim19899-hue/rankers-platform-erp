"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api, { academicApi, timetableApi } from "@/lib/api";
import { exportToCSV } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ABSENT:  "bg-red-50 text-red-700 border-red-200",
  LATE:    "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AttendanceReport() {
  const [batches, setBatches]             = useState<any[]>([]);
  const [slots, setSlots]                 = useState<any[]>([]);
  const [summary, setSummary]             = useState<any[]>([]);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [hasSearched, setHasSearched]     = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  // Filters
  const [batchId, setBatchId]   = useState("");
  const [slotId, setSlotId]     = useState("");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState(new Date().toISOString().split("T")[0]);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    academicApi.getBatches().then(r => setBatches(r.data)).catch(() => {});
  }, []);

  // Fetch slots when batch changes
  useEffect(() => {
    if (!batchId) { setSlots([]); return; }
    timetableApi.getByBatch(batchId)
      .then(r => setSlots(r.data?.slots || []))
      .catch(() => setSlots([]));
  }, [batchId]);

  const fetchReport = async (overrides?: { batchId?: string; slotId?: string; from?: string; to?: string }) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSummary([]);
    setHasSearched(true);
    try {
      const params: Record<string, string> = {};
      const b = overrides?.batchId !== undefined ? overrides.batchId : batchId;
      const sl = overrides?.slotId  !== undefined ? overrides.slotId  : slotId;
      const f = overrides?.from     !== undefined ? overrides.from     : from;
      const t = overrides?.to       !== undefined ? overrides.to       : to;
      if (b)  params.batchId = b;
      if (sl) params.slotId  = sl;
      if (f)  params.from    = f;
      if (t)  params.to      = t;

      const res = await api.get("/academic/attendance/report", { params });
      setSummary(res.data.summary || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Unknown error";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const rows: any[] = [];
    for (const s of summary) {
      for (const r of s.records) {
        rows.push({
          "Student Name":   s.name,
          "Batch":          s.batch,
          "Course":         s.course,
          "Date":           new Date(r.date).toLocaleDateString("en-IN"),
          "Class / Slot":   r.slot,
          "Status":         r.status,
          "Attendance %":   s.percentage
        });
      }
    }
    exportToCSV(rows, `Attendance_Report_${new Date().toISOString().split("T")[0]}`);
  };

  const overallPresent = summary.reduce((a, s) => a + s.present, 0);
  const overallTotal   = summary.reduce((a, s) => a + s.total, 0);
  const overallPct     = overallTotal > 0 ? ((overallPresent / overallTotal) * 100).toFixed(1) : "—";

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/academics" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-600">bar_chart</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Attendance Report</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">General & Class-Level Analysis</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={summary.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Filter Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Batch */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Batch</label>
              <select
                value={batchId}
                onChange={e => { setBatchId(e.target.value); setSlotId(""); }}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.course?.name}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Type</label>
              <select
                value={slotId}
                onChange={e => setSlotId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">All Types</option>
                <option value="GENERAL">General (Daily)</option>
                {slots.map(s => (
                  <option key={s.id} value={s.id}>{s.subject} ({s.startTime}-{s.endTime}) — {s.day}</option>
                ))}
              </select>
            </div>

            {/* From */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">From Date</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>

            {/* To */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">To Date</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>

            {/* Generate */}
            <button
              onClick={() => fetchReport()}
              disabled={isLoading}
              className="h-11 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Generate"}
            </button>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        {summary.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Students",      val: summary.length,  icon: "group",         color: "text-blue-600 bg-blue-50" },
              { label: "Total Records", val: totalRecords,    icon: "event_note",    color: "text-violet-600 bg-violet-50" },
              { label: "Avg Attendance",val: `${overallPct}%`,icon: "percent",       color: "text-emerald-600 bg-emerald-50" },
              { label: "Below 75%",     val: summary.filter(s => parseFloat(s.percentage) < 75).length, icon: "warning", color: "text-red-600 bg-red-50" },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{card.val}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Student Rows ── */}
        {summary.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900">Student-wise Breakdown</h3>
              <span className="text-xs font-bold text-slate-400">{summary.length} students</span>
            </div>
            <div className="divide-y divide-slate-50">
              {summary.map(s => {
                const pct = parseFloat(s.percentage);
                const pctColor = pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600";
                const barColor = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-500";
                const isExpanded = expandedId === s.studentId;

                return (
                  <div key={s.studentId}>
                    {/* Row */}
                    <div
                      className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : s.studentId)}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-black text-primary flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>

                      {/* Name + Batch */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{s.batch} • {s.course}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-center">
                        <div><p className="text-sm font-black text-emerald-600">{s.present}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Present</p></div>
                        <div><p className="text-sm font-black text-red-500">{s.absent}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Absent</p></div>
                        <div><p className="text-sm font-black text-amber-500">{s.late}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Late</p></div>
                        <div><p className="text-sm font-black text-slate-700">{s.total}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Total</p></div>
                      </div>

                      {/* Progress bar + % */}
                      <div className="w-32 flex-shrink-0">
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-black ${pctColor}`}>{s.percentage}%</span>
                          {pct < 75 && <span className="text-[9px] font-black text-red-500 uppercase">Low</span>}
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(parseFloat(s.percentage), 100)}%` }} />
                        </div>
                      </div>

                      {/* Expand chevron */}
                      <span className={`material-symbols-outlined text-slate-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                    </div>

                    {/* Expanded Records */}
                    {isExpanded && (
                      <div className="px-6 pb-4 bg-slate-50 border-t border-slate-100">
                        <div className="overflow-x-auto mt-3 rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Class / Slot</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {s.records.map((r: any) => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-bold text-slate-700">{new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", weekday: "short" })}</td>
                                  <td className="px-4 py-3 text-slate-500 font-medium">{r.slot}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${STATUS_COLOR[r.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                      {r.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && errorMsg && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-red-300">error</span>
            <p className="mt-3 font-black text-red-600 text-sm">Failed to Load Report</p>
            <p className="text-xs text-red-400 mt-1 font-mono">{errorMsg}</p>
            <button onClick={() => fetchReport()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all">
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !errorMsg && hasSearched && summary.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-slate-200">event_busy</span>
            <p className="mt-4 font-black text-slate-500 text-sm">No Attendance Records Found</p>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              No attendance was marked for the selected batch, type, and date range.
              Make sure you have taken attendance on the <strong>Attendance Control</strong> page first.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <a
                href="/admin/academics"
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
              >Take Attendance Now</a>
              <button
                onClick={() => fetchReport()}
                className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >Refresh Report</button>
            </div>
          </div>
        )}

        {/* Initial state */}
        {!isLoading && !errorMsg && !hasSearched && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-slate-200">bar_chart</span>
            <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-sm">Set Filters & Generate</p>
            <p className="text-xs text-slate-300 mt-1">Choose a batch, date range and click Generate</p>
          </div>
        )}

      </main>
    </div>
  );
}
