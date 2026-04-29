"use client";

import { useState, useEffect } from "react";
import { timetableApi, academicApi } from "@/lib/api";
import Link from "next/link";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABELS: Record<string, string> = { MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday", SAT: "Saturday", SUN: "Sunday" };
const SUBJECTS = ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Revision", "DPP Test", "Mock Test", "Break", "Physical Education"];

export default function TimetablePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [timetable, setTimetable] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ day: "MON", startTime: "09:00", endTime: "10:30", subject: "Physics", teacherName: "", roomNo: "" });

  useEffect(() => {
    academicApi.getBatches().then(r => setBatches(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    setIsLoading(true);
    timetableApi.getByBatch(selectedBatch).then(r => {
      setTimetable(r.data);
      setSlots(r.data?.slots || []);
    }).catch(() => setSlots([])).finally(() => setIsLoading(false));
  }, [selectedBatch]);

  const handleAddSlot = () => {
    setSlots([...slots, { ...form, id: `new_${Date.now()}` }]);
    setForm({ day: "MON", startTime: "09:00", endTime: "10:30", subject: "Physics", teacherName: "", roomNo: "" });
    setShowAdd(false);
  };

  const handleRemoveSlot = (id: string) => setSlots(slots.filter(s => s.id !== id));

  const handleSave = async () => {
    if (!selectedBatch) return;
    setIsSaving(true);
    try {
      const cleanSlots = slots.map(({ id, timetableId, ...s }) => s);
      await timetableApi.upsert({ batchId: selectedBatch, slots: cleanSlots });
      alert("✅ Timetable saved successfully!");
      timetableApi.getByBatch(selectedBatch).then(r => setSlots(r.data?.slots || []));
    } catch (e) { alert("Failed to save"); }
    finally { setIsSaving(false); }
  };

  const slotsForDay = (day: string) => slots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const subjectColor: Record<string, string> = {
    "Physics": "bg-blue-50 border-blue-200 text-blue-800",
    "Chemistry": "bg-purple-50 border-purple-200 text-purple-800",
    "Biology": "bg-green-50 border-green-200 text-green-800",
    "Mathematics": "bg-orange-50 border-orange-200 text-orange-800",
    "DPP Test": "bg-red-50 border-red-200 text-red-800",
    "Mock Test": "bg-red-100 border-red-300 text-red-900",
    "Break": "bg-slate-50 border-slate-200 text-slate-400",
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><span className="material-symbols-outlined text-blue-600">calendar_view_week</span></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Timetable Manager</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weekly Schedule Builder</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="h-10 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-700 focus:ring-2 focus:ring-primary/20">
            <option value="">-- Select Batch --</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.course?.name}</option>)}
          </select>
          {selectedBatch && (
            <>
              <button onClick={() => setShowAdd(true)} className="h-10 px-4 flex items-center gap-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                <span className="material-symbols-outlined text-sm">add</span> Add Slot
              </button>
              <button onClick={handleSave} disabled={isSaving} className="h-10 px-5 flex items-center gap-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                {isSaving ? <span className="material-symbols-outlined text-sm animate-spin">sync</span> : <span className="material-symbols-outlined text-sm">save</span>}
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => window.print()} className="h-10 px-4 flex items-center gap-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all print:hidden">
                <span className="material-symbols-outlined text-sm">print</span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!selectedBatch ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6"><span className="material-symbols-outlined text-4xl text-blue-500">calendar_view_week</span></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Select a Batch</h2>
            <p className="text-slate-400 font-medium">Choose a batch from the dropdown to view or build its timetable.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>
        ) : (
          <>
            {/* Print Header */}
            <div className="hidden print:block text-center mb-8 pb-6 border-b-2 border-primary">
              <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-3" />
              <h2 className="text-3xl font-black text-primary">Weekly Timetable</h2>
              <p className="text-sm text-slate-500 font-bold">{batches.find(b => b.id === selectedBatch)?.name} — {batches.find(b => b.id === selectedBatch)?.course?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {DAYS.map(day => (
                <div key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-primary text-white flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase tracking-widest">{DAY_LABELS[day]}</h3>
                    <span className="text-xs opacity-60">{slotsForDay(day).length} classes</span>
                  </div>
                  <div className="p-3 space-y-2 min-h-[120px]">
                    {slotsForDay(day).length === 0 ? (
                      <div className="flex items-center justify-center h-16 text-slate-300">
                        <span className="text-xs font-bold uppercase tracking-widest">No classes</span>
                      </div>
                    ) : slotsForDay(day).map(slot => (
                      <div key={slot.id} className={`p-3 rounded-xl border flex justify-between items-start ${subjectColor[slot.subject] || 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <div>
                          <p className="font-black text-sm">{slot.subject}</p>
                          <p className="text-[11px] font-bold mt-0.5 opacity-70">{slot.startTime} – {slot.endTime}</p>
                          {slot.teacherName && <p className="text-[10px] opacity-60 mt-0.5">👤 {slot.teacherName}</p>}
                          {slot.roomNo && <p className="text-[10px] opacity-60">🚪 Room {slot.roomNo}</p>}
                        </div>
                        <button onClick={() => handleRemoveSlot(slot.id)} className="p-1 rounded-lg hover:bg-black/10 transition-colors print:hidden">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add Slot Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-xl">Add Timetable Slot</h2>
              <button onClick={() => setShowAdd(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Day</label>
                  <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none font-bold">
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none font-bold">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Time</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Time</label>
                  <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Teacher (optional)</label>
                  <input type="text" placeholder="Teacher name" value={form.teacherName} onChange={e => setForm({ ...form, teacherName: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Room No. (optional)</label>
                  <input type="text" placeholder="e.g. 101" value={form.roomNo} onChange={e => setForm({ ...form, roomNo: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-11 border-2 border-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button onClick={handleAddSlot} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Add Slot</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white !important; font-size: 12px; }
          header, button, .print\\:hidden { display: none !important; }
          .bg-slate-50 { background: white !important; }
          main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          /* Force 4 columns so 7 days fit perfectly in 2 rows */
          .grid { 
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important; 
            gap: 8px !important; 
          }
          /* Prevent cards from breaking across pages */
          .grid > div {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 0 !important;
          }
          .shadow-sm { box-shadow: none !important; }
          .border { border-color: #e2e8f0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Slightly smaller text to ensure fit */
          h2 { font-size: 20px !important; margin-bottom: 4px !important; }
          h3 { font-size: 12px !important; }
          p { margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
