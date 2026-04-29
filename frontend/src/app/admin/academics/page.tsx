"use client";

import { useState, useEffect, useCallback } from "react";
import api, { studentApi, academicApi, timetableApi } from "@/lib/api";
import Link from "next/link";
import { exportToCSV } from "@/lib/utils";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | null;

export default function AdminAcademics() {
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, unmarked: 0 });

  const handleExport = () => {
    const exportData = filteredStudents.map(student => ({
      "Student Name": student.user.name,
      "Registration No": student.regNo,
      "Course": student.courses?.[0]?.course?.name || "N/A",
      "Date": attendanceDate,
      "Status": attendanceMap[student.id] || "UNMARKED"
    }));
    exportToCSV(exportData, `Attendance_${attendanceDate}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, batchRes] = await Promise.all([
          studentApi.getAll(),
          academicApi.getBatches()
        ]);
        setStudents(studentRes.data.filter((s: any) => s.status === "APPROVED"));
        setBatches(batchRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch timetable slots based on batch and date
  useEffect(() => {
    setSelectedSlot("");      // reset slot when batch/date changes
    setAttendanceMap({});     // clear attendance board
    if (!selectedBatch || !attendanceDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        const res = await timetableApi.getByBatch(selectedBatch);
        const allSlots = res.data?.slots || [];

        // Parse date in local timezone to get correct day-of-week
        const [y, m, d] = attendanceDate.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayOfWeek = days[dateObj.getDay()];

        const filtered = allSlots.filter((s: any) => s.day === dayOfWeek);
        setAvailableSlots(filtered);
      } catch (err) {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [selectedBatch, attendanceDate]);

  // Also clear attendance board when slot changes
  useEffect(() => {
    setAttendanceMap({});
  }, [selectedSlot]);

  // Recalculate summary whenever attendance map changes
  useEffect(() => {
    const present = Object.values(attendanceMap).filter(v => v === "PRESENT").length;
    const absent = Object.values(attendanceMap).filter(v => v === "ABSENT").length;
    const late = Object.values(attendanceMap).filter(v => v === "LATE").length;
    const unmarked = students.length - present - absent - late;
    setSummary({ present, absent, late, unmarked });
  }, [attendanceMap, students]);

  const handleMarkAttendance = useCallback(async (studentId: string, status: string) => {
    if (!selectedBatch) {
      alert("Please select a batch first");
      return;
    }
    setSavingId(studentId);
    try {
      await api.post("/academic/attendance", {
        studentId,
        batchId: selectedBatch,
        date: attendanceDate,
        status,
        timetableSlotId: selectedSlot || undefined
      });
      setAttendanceMap(prev => ({ ...prev, [studentId]: status as AttendanceStatus }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to mark attendance";
      alert(message);
    } finally {
      setSavingId(null);
    }
  }, [selectedBatch, attendanceDate, selectedSlot]);

  const handleMarkAll = async (status: "PRESENT" | "ABSENT") => {
    if (!selectedBatch) { alert("Select a batch first"); return; }
    const unmarked = students.filter(s => !attendanceMap[s.id]);
    for (const student of unmarked) {
      await handleMarkAttendance(student.id, status);
    }
  };

  const filteredStudents = selectedBatch
    ? students.filter(s => s.courses?.some((c: any) => c.batchId === selectedBatch))
    : students;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600">how_to_reg</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Attendance Control</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Class Schedule Roll-Call</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="bg-white text-slate-600 border-2 border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            CSV
          </button>
          <Link href="/admin/academics/report" className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-all active:scale-95 shadow-lg shadow-violet-200">
            <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            Attendance Report
          </Link>
          <Link href="/admin/academics/results" className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Manage Exams & Results
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Batch *</label>
              <select
                value={selectedBatch}
                onChange={(e) => { setSelectedBatch(e.target.value); setAttendanceMap({}); }}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
              >
                <option value="">-- All Students --</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.course?.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => { setAttendanceDate(e.target.value); setAttendanceMap({}); }}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Class Slot</label>
              <select
                value={selectedSlot}
                onChange={(e) => { setSelectedSlot(e.target.value); setAttendanceMap({}); }}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
              >
                <option value="">-- Daily General --</option>
                {availableSlots.map(s => <option key={s.id} value={s.id}>{s.subject} ({s.startTime} - {s.endTime})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bulk Actions</label>
              <div className="flex gap-2">
                <button onClick={() => handleMarkAll("PRESENT")} className="flex-1 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-black hover:bg-emerald-600 hover:text-white transition-all">
                  All Present
                </button>
                <button onClick={() => handleMarkAll("ABSENT")} className="flex-1 h-12 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-black hover:bg-red-600 hover:text-white transition-all">
                  All Absent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Summary Bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Present", count: summary.present, color: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            { label: "Absent", count: summary.absent, color: "bg-red-500", bg: "bg-red-50 border-red-200 text-red-700" },
            { label: "Late", count: summary.late, color: "bg-amber-500", bg: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "Unmarked", count: summary.unmarked, color: "bg-slate-300", bg: "bg-slate-50 border-slate-200 text-slate-500" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
              <p className="text-2xl font-black">{count}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
              <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden mt-2">
                <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${students.length > 0 ? (count / students.length) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Roll-Call Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-black text-slate-900">Student Roll-Call</h2>
            <span className="text-xs font-bold text-slate-400">{filteredStudents.length} students</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                  <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark Attendance</th>
                  <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student, idx) => {
                  const status = attendanceMap[student.id];
                  const isSaving = savingId === student.id;
                  return (
                    <tr key={student.id} className={`transition-colors ${status === "PRESENT" ? "bg-emerald-50/40" : status === "ABSENT" ? "bg-red-50/40" : status === "LATE" ? "bg-amber-50/40" : "hover:bg-slate-50"}`}>
                      <td className="px-6 py-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-primary text-sm border border-slate-200 overflow-hidden">
                            {student.user.photoUrl
                              ? <img src={`http://localhost:5000${student.user.photoUrl}`} className="w-full h-full object-cover" alt="" />
                              : student.user.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.user.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{student.regNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-500 font-medium text-xs">{student.courses?.[0]?.course?.name || "—"}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-center gap-2">
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                          ) : (
                            <>
                              <button onClick={() => handleMarkAttendance(student.id, "PRESENT")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${status === "PRESENT" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"}`}>
                                ✓ Present
                              </button>
                              <button onClick={() => handleMarkAttendance(student.id, "LATE")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${status === "LATE" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white"}`}>
                                ⏰ Late
                              </button>
                              <button onClick={() => handleMarkAttendance(student.id, "ABSENT")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${status === "ABSENT" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-600 hover:text-white"}`}>
                                ✗ Absent
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {status ? (
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${status === "PRESENT" ? "bg-emerald-100 text-emerald-700" : status === "ABSENT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-black uppercase">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
