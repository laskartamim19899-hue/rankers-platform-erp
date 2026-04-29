"use client";

import { useState, useEffect } from "react";
import api, { studentApi, academicApi } from "@/lib/api";
import Link from "next/link";

export default function AdminAcademicsResults() {
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Test Form State
  const [testTitle, setTestTitle] = useState("");
  const [testType, setTestType] = useState("WEEKLY");
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testMaxMarks, setTestMaxMarks] = useState("720");

  // Result Entry State
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentRes, testRes] = await Promise.all([
        studentApi.getAll(),
        academicApi.getTests()
      ]);
      setStudents(studentRes.data);
      setTests(testRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await academicApi.createTest({
        title: testTitle,
        type: testType,
        date: testDate,
        maxMarks: testMaxMarks
      });
      alert("Test scheduled successfully!");
      setTestTitle("");
      fetchData(); // Refresh test list
    } catch (err) {
      alert("Failed to schedule test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest || !selectedStudent || !marksObtained) {
      alert("Please fill all result fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await academicApi.addTestResult({
        testId: selectedTest,
        studentId: selectedStudent,
        marksObtained
      });
      alert("Result recorded successfully!");
      setMarksObtained("");
      setSelectedStudent("");
    } catch (err) {
      alert("Failed to record result. Does a result for this test already exist?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/academics" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Examination Control</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Create Test Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">event_note</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Schedule New Test</h2>
            </div>
            
            <form onSubmit={handleCreateTest} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Test Title</label>
                <input 
                  type="text" 
                  required
                  value={testTitle}
                  onChange={e => setTestTitle(e.target.value)}
                  placeholder="e.g. Mock Test #09 (Full Syllabus)"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Test Type</label>
                  <select 
                    value={testType}
                    onChange={e => setTestType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="WEEKLY">Weekly Test</option>
                    <option value="MOCK">Mock Exam</option>
                    <option value="DPP">Daily Practice Paper</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date</label>
                  <input 
                    type="date" 
                    required
                    value={testDate}
                    onChange={e => setTestDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Max Marks</label>
                <input 
                  type="number" 
                  required
                  value={testMaxMarks}
                  onChange={e => setTestMaxMarks(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 mt-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Schedule Test
              </button>
            </form>
          </div>

          {/* Result Entry Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined">fact_check</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Record Result</h2>
            </div>
            
            <form onSubmit={handleAddResult} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Select Test</label>
                <select 
                  required
                  value={selectedTest}
                  onChange={e => setSelectedTest(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">-- Choose Exam --</option>
                  {tests.map(test => (
                    <option key={test.id} value={test.id}>{test.title} ({test.type}) - Max: {test.maxMarks}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Select Student</label>
                <select 
                  required
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.user.name} ({student.regNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Marks Obtained</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={marksObtained}
                    onChange={e => setMarksObtained(e.target.value)}
                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-black text-primary text-lg"
                  />
                  <span className="absolute right-4 top-3 font-bold text-slate-400">Pts</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting || isLoading}
                className="w-full h-12 mt-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Save Result
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
