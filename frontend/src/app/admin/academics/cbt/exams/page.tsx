"use client";

import { useState, useEffect } from "react";
import { cbtApi, academicApi } from "@/lib/api";
import Link from "next/link";

export default function ManageExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("180");
  const [totalMarks, setTotalMarks] = useState("720");
  const [positiveMarks, setPositiveMarks] = useState("4");
  const [negativeMarks, setNegativeMarks] = useState("1");
  const [examPattern, setExamPattern] = useState("STANDARD");
  const [selectedQuestions, setSelectedQuestions] = useState<{id: string, section: string}[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [examRes, questionRes, batchRes] = await Promise.all([
        cbtApi.getExams(),
        cbtApi.getQuestions(),
        academicApi.getBatches()
      ]);
      setExams(examRes.data);
      setQuestions(questionRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev => {
      const exists = prev.find(q => q.id === id);
      if (exists) return prev.filter(q => q.id !== id);
      return [...prev, { id, section: 'A' }]; // Default to Section A
    });
  };

  const updateSection = (id: string, section: string) => {
    setSelectedQuestions(prev => prev.map(q => q.id === id ? { ...q, section } : q));
  };

  const toggleBatch = (id: string) => {
    setSelectedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question");
      return;
    }
    if (selectedBatches.length === 0) {
      alert("Please select at least one batch");
      return;
    }

    setIsSubmitting(true);
    try {
      await cbtApi.createExam({
        title,
        startTime,
        endTime,
        duration,
        totalMarks,
        positiveMarks,
        negativeMarks,
        examPattern,
        questionIds: selectedQuestions.map((q, index) => ({ id: q.id, order: index, section: q.section })),
        batchIds: selectedBatches
      });
      alert("Exam scheduled successfully!");
      setTitle("");
      setStartTime("");
      setEndTime("");
      setSelectedQuestions([]);
      setSelectedBatches([]);
      fetchData();
    } catch (err) {
      alert("Failed to create exam");
    } finally {
      setIsSubmitting(false);
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
              <span className="material-symbols-outlined text-emerald-600">schedule_send</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Exam Management</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Schedule & Monitor Tests</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Create Exam Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">event_available</span>
              Schedule Test
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Exam Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. NEET Mock Test #12"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Start Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">End Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Duration (min)</label>
                  <input 
                    type="number" 
                    required
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Exam Pattern</label>
                  <select 
                    value={examPattern}
                    onChange={e => setExamPattern(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold bg-white"
                  >
                    <option value="STANDARD">Standard Pattern</option>
                    <option value="NEET_NTA">NEET NTA Pattern</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Max Marks</label>
                  <input 
                    type="number" 
                    required
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-primary"
                  />
                </div>
              </div>

              {/* Question Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Select Questions ({selectedQuestions.length})</label>
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-50">
                  {questions.map(q => {
                    const isSelected = selectedQuestions.find(sq => sq.id === q.id);
                    return (
                      <div key={q.id} className="p-3 flex items-center gap-3 hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={!!isSelected}
                          onChange={() => toggleQuestion(q.id)}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{q.content}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase">{q.subject} • {q.difficulty}</p>
                        </div>
                        {isSelected && (
                          <div className="flex gap-1">
                            <button 
                              type="button"
                              onClick={() => updateSection(q.id, 'A')}
                              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${isSelected.section === 'A' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >A</button>
                            <button 
                              type="button"
                              onClick={() => updateSection(q.id, 'B')}
                              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${isSelected.section === 'B' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >B</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Batch Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Target Batches</label>
                <div className="flex flex-wrap gap-2">
                  {batches.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBatch(b.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedBatches.includes(b.id) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-lg">rocket_launch</span>}
                Launch Exam
              </button>
            </form>
          </div>
        </div>

        {/* Exams List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 leading-tight">Live & Scheduled Exams</h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exams.length} Exams</span>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-12 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Exams...</p>
                </div>
              ) : exams.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No exams scheduled
                </div>
              ) : (
                exams.map((exam) => (
                  <div key={exam.id} className="p-8 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">{exam.title}</h3>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                            {new Date(exam.startTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <span className="material-symbols-outlined text-[16px]">timer</span>
                            {exam.duration} mins
                          </span>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${new Date(exam.endTime) < new Date() ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700 animate-pulse'}`}>
                        {new Date(exam.endTime) < new Date() ? 'Completed' : 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-lg font-black text-slate-900">{exam._count.questions}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-lg font-black text-slate-900">{exam._count.attempts}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attempts</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-lg font-black text-slate-900">{exam.totalMarks}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Marks</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {exam.batches.map((b: any) => (
                        <span key={b.id} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100">{b.name}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
