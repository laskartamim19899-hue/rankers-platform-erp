"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { studentApi, academicApi } from "@/lib/api";

export default function ReportCardGenerator() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [academicData, setAcademicData] = useState<any>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [termName, setTermName] = useState("Half-Yearly Examination");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await studentApi.getAll();
      const activeStudents = res.data.filter((s: any) => s.status === 'APPROVED');
      setStudents(activeStudents);
      setFilteredStudents(activeStudents);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredStudents(students.filter(s => 
        s.user.name.toLowerCase().includes(q) || 
        s.regNo?.toLowerCase().includes(q)
      ));
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAcademicData(selectedStudent.id);
    } else {
      setAcademicData(null);
    }
  }, [selectedStudent]);

  const fetchStudentAcademicData = async (studentId: string) => {
    setIsFetchingData(true);
    try {
      // Also fetch student details with results via getById to get full includes
      const [summaryRes, studentDetailRes] = await Promise.all([
        academicApi.getSummary(studentId),
        academicApi.getTests(),
      ]);
      setAcademicData(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch academic data", err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const renderReportCard = () => {
    if (!selectedStudent || !academicData) return null;

    // Backend returns: { attendance: { totalDays, presentDays, percentage }, results: [...] }
    const results: any[] = academicData.results || [];
    const attendanceStats = academicData.attendance || { presentDays: 0, totalDays: 0, percentage: '0' };
    const totalMarksObtained = results.reduce((acc: number, r: any) => acc + r.marksObtained, 0);
    const totalMaxMarks = results.reduce((acc: number, r: any) => acc + r.test.maxMarks, 0);
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const overallGrade = getGrade(overallPercentage);

    return (
      <div id="printable-report-card" className="bg-white mx-auto w-[210mm] min-h-[297mm] shadow-2xl p-[15mm] border border-slate-200 print:shadow-none print:border-none print:w-full print:p-0 print:m-0 relative bg-white">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" className="w-96 h-96 object-contain grayscale" alt="" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6 mb-8">
            <div className="flex items-center gap-6">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Rankers' Platform</h1>
                <p className="text-slate-500 font-bold tracking-widest text-sm mt-1 uppercase">Excellence in Education</p>
                <p className="text-slate-400 text-xs mt-1">Diamond Harbour, South 24 Pgs, WB</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-6 py-2 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-sm">
                Report Card
              </div>
              <p className="text-slate-800 font-bold text-lg mt-3 uppercase">{termName}</p>
              <p className="text-slate-400 text-xs font-bold mt-1">Academic Session: 2026-2027</p>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/50">
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-1 text-slate-500 font-bold w-32 uppercase text-[10px] tracking-widest">Student Name</td><td className="py-1 font-black text-slate-900 text-base">{selectedStudent.user.name}</td></tr>
                  <tr><td className="py-1 text-slate-500 font-bold w-32 uppercase text-[10px] tracking-widest">Registration No</td><td className="py-1 font-bold text-slate-700">{selectedStudent.regNo}</td></tr>
                  <tr><td className="py-1 text-slate-500 font-bold w-32 uppercase text-[10px] tracking-widest">Course</td><td className="py-1 font-bold text-slate-700">{selectedStudent.courses?.[0]?.course?.name || 'N/A'}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/50">
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-1 text-slate-500 font-bold w-32 uppercase text-[10px] tracking-widest">Guardian Name</td><td className="py-1 font-bold text-slate-700">{selectedStudent.guardianName}</td></tr>
                  <tr><td className="py-1 text-slate-500 font-bold w-32 uppercase text-[10px] tracking-widest">Date of Birth</td><td className="py-1 font-bold text-slate-700">{new Date(selectedStudent.dob).toLocaleDateString()}</td></tr>
                  <tr><td className="py-1 text-slate-500 font-bold w-32 uppercase text-[10px] tracking-widest">Attendance</td><td className="py-1 font-bold text-slate-700">{attendanceStats.presentDays}/{attendanceStats.totalDays} Days ({attendanceStats.percentage}%)</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Marks Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="border border-slate-900 px-4 py-3 text-left text-xs font-black uppercase tracking-widest">Subject / Test Name</th>
                  <th className="border border-slate-900 px-4 py-3 text-center text-xs font-black uppercase tracking-widest w-32">Date</th>
                  <th className="border border-slate-900 px-4 py-3 text-center text-xs font-black uppercase tracking-widest w-24">Max Marks</th>
                  <th className="border border-slate-900 px-4 py-3 text-center text-xs font-black uppercase tracking-widest w-24">Obtained</th>
                  <th className="border border-slate-900 px-4 py-3 text-center text-xs font-black uppercase tracking-widest w-24">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-slate-900 px-4 py-8 text-center text-slate-500 font-bold">No examination records found for this term.</td>
                  </tr>
                ) : (
                  results.map((r: any, idx: number) => {
                    const pct = (r.marksObtained / r.test.maxMarks) * 100;
                    return (
                      <tr key={idx}>
                        <td className="border border-slate-900 px-4 py-3 font-bold text-slate-800">{r.test.title}</td>
                        <td className="border border-slate-900 px-4 py-3 text-center text-sm font-medium text-slate-600">{new Date(r.test.date).toLocaleDateString()}</td>
                        <td className="border border-slate-900 px-4 py-3 text-center font-bold text-slate-800">{r.test.maxMarks}</td>
                        <td className="border border-slate-900 px-4 py-3 text-center font-black text-slate-900">{r.marksObtained}</td>
                        <td className="border border-slate-900 px-4 py-3 text-center font-black text-slate-900">{getGrade(pct)}</td>
                      </tr>
                    );
                  })
                )}
                {/* Total Row */}
                {results.length > 0 && (
                  <tr className="bg-slate-50">
                    <td colSpan={2} className="border border-slate-900 px-4 py-4 text-right font-black uppercase tracking-widest text-slate-900">Grand Total</td>
                    <td className="border border-slate-900 px-4 py-4 text-center font-black text-slate-900">{totalMaxMarks}</td>
                    <td className="border border-slate-900 px-4 py-4 text-center font-black text-slate-900 text-lg">{totalMarksObtained}</td>
                    <td className="border border-slate-900 px-4 py-4 text-center font-black text-slate-900 text-lg">{overallGrade}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Performance Summary & Remarks */}
          <div className="grid grid-cols-2 gap-8 mb-16">
            <div className="border border-slate-900 p-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Overall Percentage</h4>
              <p className="text-5xl font-black text-slate-900">{overallPercentage.toFixed(1)}<span className="text-2xl text-slate-400">%</span></p>
            </div>
            <div className="border border-slate-900 p-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Class Teacher Remarks</h4>
              <div className="w-full border-b border-dashed border-slate-400 mt-8"></div>
              <div className="w-full border-b border-dashed border-slate-400 mt-8"></div>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-12">
            <div className="text-center w-48">
              <div className="border-t-2 border-slate-900 pt-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Parent's Signature</p>
              </div>
            </div>
            <div className="text-center w-48">
              <div className="border-t-2 border-slate-900 pt-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Teacher's Signature</p>
              </div>
            </div>
            <div className="text-center w-48">
              {/* Optional: Add a digital signature image here in the future */}
              <div className="h-16 flex items-end justify-center pb-2">
                <span className="font-yesteryear text-3xl text-slate-800 opacity-50">Signed</span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Principal's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 print:bg-white print:p-0">
      
      {/* Hide controls when printing */}
      <div className="print:hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
          <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-indigo-500 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
            <span className="material-symbols-outlined text-sm">assignment</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight mr-auto">Report Card Engine</h1>
          
          {selectedStudent && academicData && (
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print Report
            </button>
          )}
        </header>

        <main className="max-w-7xl mx-auto p-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Control Panel */}
            <div className="lg:col-span-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Student</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input 
                    type="text" 
                    placeholder="Search by name or reg no..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && filteredStudents.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50 p-2 space-y-1">
                      {filteredStudents.map(student => (
                        <div 
                          key={student.id} 
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchQuery(""); // hide dropdown
                          }}
                          className="p-3 rounded-lg cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                        >
                          <p className="font-black text-slate-800 text-sm">{student.user.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{student.regNo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Term / Exam Name</label>
                <input 
                  type="text" 
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Report Card Preview Render */}
      <div className="px-6 pb-20 print:px-0 print:pb-0">
        {!selectedStudent ? (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 border-dashed p-20 text-center print:hidden">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">description</span>
            <p className="text-slate-400 font-bold">Search and select a student to generate their report card.</p>
          </div>
        ) : isFetchingData ? (
          <div className="max-w-4xl mx-auto py-20 text-center print:hidden">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 mx-auto"></div>
            <p className="text-slate-400 font-bold mt-4">Generating layout...</p>
          </div>
        ) : (
          <div className="flex justify-center">
             {renderReportCard()}
          </div>
        )}
      </div>

    </div>
  );
}
