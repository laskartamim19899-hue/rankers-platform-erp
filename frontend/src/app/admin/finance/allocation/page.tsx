"use client";

import { useState, useEffect } from "react";
import { studentApi, academicApi, financeApi } from "@/lib/api";
import Link from "next/link";

export default function FeeAllocation() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);

  const [type, setType] = useState("ACADEMIC");
  const [month, setMonth] = useState("MAY");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, courseRes] = await Promise.all([
          studentApi.getAll(),
          academicApi.getCourses()
        ]);
        setStudents(studentRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAllocate = async () => {
    if (selectedStudents.length === 0 || !selectedCourse || !amount || !dueDate) {
      alert("Please fill all required fields");
      return;
    }

    setAllocating(true);
    try {
      await financeApi.allocate({
        studentIds: selectedStudents,
        courseId: selectedCourse,
        amount,
        type,
        month: type === 'HOSTEL' ? month : null,
        dueDate
      });
      alert("Fees allocated successfully!");
      setSelectedStudents([]);
    } catch (err) {
      alert("Failed to allocate fees");
    } finally {
      setAllocating(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/finance" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Fee Allocation Engine</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Target Selection */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              1. Select Students
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <select 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary/20 outline-none"
                  onChange={(e) => {
                    if (e.target.value === 'ALL') {
                      setSelectedStudents(students.map((s: any) => s.id));
                    } else {
                      const filtered = students.filter((s: any) => s.courses.some((c: any) => c.courseId === e.target.value));
                      setSelectedStudents(filtered.map((s: any) => s.id));
                    }
                  }}
                >
                  <option value="">Filter by Course/Batch</option>
                  <option value="ALL">All Students</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-[400px] overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-50">
                {students.map((student: any) => (
                  <div key={student.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStudents([...selectedStudents, student.id]);
                        else setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-sm font-black text-slate-800">{student.user.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.regNo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{selectedStudents.length} Students Selected</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fee Configuration */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              2. Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fee Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setType('ACADEMIC')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${type === 'ACADEMIC' ? 'border-primary bg-primary text-white' : 'border-slate-100 text-slate-400'}`}
                  >
                    Academic
                  </button>
                  <button 
                    onClick={() => setType('HOSTEL')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${type === 'HOSTEL' ? 'border-primary bg-primary text-white' : 'border-slate-100 text-slate-400'}`}
                  >
                    Hostel
                  </button>
                </div>
              </div>

              {type === 'HOSTEL' && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Target Month</label>
                  <select 
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  >
                    {['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Academic Head</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Select Course/Batch</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="e.g. 25000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Due Date</label>
                <input 
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <button 
                onClick={handleAllocate}
                disabled={allocating}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {allocating ? 'Processing...' : (
                  <>
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Execute Allocation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
