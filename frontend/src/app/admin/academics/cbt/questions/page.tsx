"use client";

import { useState, useEffect, useRef } from "react";
import { cbtApi } from "@/lib/api";
import Link from "next/link";
import BulkUploadModal from "./BulkUploadModal";

export default function QuestionBank() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Form State
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("PHYSICS");
  const [topic, setTopic] = useState("");
  const [subTopic, setSubTopic] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState("");

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // MathJax Typesetting for Live Preview
  useEffect(() => {
    if ((window as any).MathJax && previewRef.current) {
      (window as any).MathJax.typesetPromise([previewRef.current]).catch(() => {});
    }
  }, [content, options]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await cbtApi.getQuestions();
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to fetch questions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleCorrectOption = (id: string) => {
    setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === id })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const correctOpt = options.find(o => o.isCorrect);
    if (!correctOpt) {
      alert("Please select a correct option");
      return;
    }

    setIsSubmitting(true);
    try {
      await cbtApi.createQuestion({
        content,
        subject,
        topic,
        subTopic,
        difficulty,
        options,
        correctOption: correctOpt.id,
        explanation
      });
      alert("Question added to bank!");
      setContent("");
      setTopic("");
      setSubTopic("");
      setExplanation("");
      setOptions(options.map(o => ({ ...o, text: '', isCorrect: false })));
      fetchQuestions();
    } catch (err) {
      alert("Failed to add question");
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
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600">quiz</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Question Bank</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage MCQ Inventory</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowBulkModal(true)}
          className="h-10 px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">publish</span>
          Bulk Upload Excel
        </button>
      </header>

      {showBulkModal && (
        <BulkUploadModal 
          onSuccess={fetchQuestions}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Add Question Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">add_circle</span>
              New Question
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Subject</label>
                  <select 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                  >
                    <option value="PHYSICS">Physics</option>
                    <option value="CHEMISTRY">Chemistry</option>
                    <option value="BIOLOGY">Biology</option>
                    <option value="MATHS">Maths</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Topic</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Thermodynamics"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Sub-Topic</label>
                  <input 
                    type="text" 
                    value={subTopic}
                    onChange={e => setSubTopic(e.target.value)}
                    placeholder="e.g. Heat Transfer"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Content (LaTeX Preview Active)</label>
                <textarea 
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="e.g. Find $x$ if $x^2 + 2x + 1 = 0$"
                  className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
                />
                <div ref={previewRef} className="mt-3 p-4 bg-slate-900 text-white rounded-xl text-sm min-h-[60px] border border-slate-800 font-medium">
                  {content || <span className="text-slate-600 italic">Live preview of your question...</span>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Options & Correct Answer</label>
                {options.map((opt) => (
                  <div key={opt.id} className="flex gap-3 items-center">
                    <button 
                      type="button"
                      onClick={() => handleCorrectOption(opt.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {opt.id}
                    </button>
                    <input 
                      type="text" 
                      required
                      value={opt.text}
                      onChange={e => handleOptionChange(opt.id, e.target.value)}
                      placeholder={`Option ${opt.id}...`}
                      className="flex-grow h-10 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Explanation (Optional)</label>
                <textarea 
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  className="w-full h-20 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-lg">save</span>}
                Commit to Bank
              </button>
            </form>
          </div>
        </div>

        {/* Question List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">Question Inventory</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total {questions.length} items</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search bank..." 
                  className="h-10 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-12 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Library...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Bank is empty. Start adding or upload an Excel.
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-8 hover:bg-slate-50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider">{q.subject}</span>
                        {q.topic && <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">{q.topic}</span>}
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600' : q.difficulty === 'HARD' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{q.difficulty}</span>
                      </div>
                      <button className="text-slate-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <p className="text-slate-900 font-bold text-lg leading-relaxed mb-6">{q.content}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {q.options.map((opt: any) => (
                        <div key={opt.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${opt.id === q.correctOption ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${opt.id === q.correctOption ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {opt.id}
                          </span>
                          <span className={`text-sm font-bold ${opt.id === q.correctOption ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {opt.text}
                          </span>
                        </div>
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
