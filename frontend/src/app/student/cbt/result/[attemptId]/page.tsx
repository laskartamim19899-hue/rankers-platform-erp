"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { cbtApi } from "@/lib/api";
import Link from "next/link";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CbtResultPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await cbtApi.getAttemptResult(attemptId as string);
      setAttempt(res.data);
    } catch (err) {
      console.error("Failed to fetch result", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RANKERS' PLATFORM", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("CBT PERFORMANCE SCORECARD", 20, 28);
    
    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(attempt.student.user.name, 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Registration No: ${attempt.student.regNo || 'N/A'}`, 20, 62);
    doc.text(`Exam: ${attempt.exam.title}`, 20, 68);
    doc.text(`Date: ${new Date(attempt.submitTime).toLocaleDateString()}`, 20, 74);

    // Score Summary
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(140, 50, 50, 30, 3, 3, "F");
    doc.setFontSize(10);
    doc.text("TOTAL SCORE", 145, 60);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${attempt.score}`, 145, 72);
    doc.setFontSize(8);
    doc.text(`/ ${attempt.exam.totalMarks}`, 175, 72);

    // Subject Table
    (doc as any).autoTable({
      startY: 90,
      head: [['Subject', 'Correct', 'Incorrect', 'Accuracy', 'Score']],
      body: subjectStats.map((s: any) => [
        s.name,
        s.correct,
        (s.total - s.correct), // This is simplified for the PDF
        `${s.accuracy}%`,
        s.score
      ]),
      headStyles: { fillStyle: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`${attempt.student.user.name}_Result_${attempt.exam.title}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Analysis...</p>
      </div>
    );
  }

  if (!attempt) return <div>Result not found</div>;

  const totalQuestions = attempt.exam.questions.length;
  const answered = attempt.responses.filter((r: any) => r.selectedOption).length;
  const correct = attempt.responses.filter((r: any) => r.isCorrect).length;
  const wrong = answered - correct;
  const accuracy = answered > 0 ? ((correct / answered) * 100).toFixed(1) : "0";

  // Calculate subject-wise stats
  const subjects = ["PHYSICS", "CHEMISTRY", "BIOLOGY", "MATHS"];
  const subjectStats = subjects.map(sub => {
    const subQuestions = attempt.exam.questions.filter((eq: any) => eq.question.subject === sub);
    if (subQuestions.length === 0) return null;
    
    const subResponses = attempt.responses.filter((r: any) => 
      subQuestions.some((sq: any) => sq.questionId === r.questionId)
    );
    
    const subCorrect = subResponses.filter((r: any) => r.isCorrect).length;
    const subAnswered = subResponses.filter((r: any) => r.selectedOption).length;
    const subScore = (subCorrect * attempt.exam.positiveMarks) - ((subAnswered - subCorrect) * attempt.exam.negativeMarks);
    const subMax = subQuestions.length * attempt.exam.positiveMarks;
    
    return {
      name: sub,
      correct: subCorrect,
      total: subQuestions.length,
      score: subScore,
      max: subMax,
      accuracy: subAnswered > 0 ? ((subCorrect / subAnswered) * 100).toFixed(0) : 0
    };
  }).filter(Boolean);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student/cbt" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-600">analytics</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Performance Analysis</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attempt.exam.title}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={downloadPDF}
          className="h-10 px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <span className="material-symbols-outlined text-sm">download_for_offline</span>
          Download Scorecard
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Score Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <circle 
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * (attempt.score / attempt.exam.totalMarks))}
                className="text-indigo-600 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-black text-slate-900">{attempt.score}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out of {attempt.exam.totalMarks}</p>
            </div>
          </div>

          <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
            {[
              { label: "Accuracy", value: `${accuracy}%`, color: "text-indigo-600" },
              { label: "Correct", value: correct, color: "text-emerald-600" },
              { label: "Incorrect", value: wrong, color: "text-red-500" },
              { label: "Skipped", value: totalQuestions - answered, color: "text-slate-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50 p-6 rounded-2xl">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-wise Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {subjectStats.map((sub: any) => (
             <div key={sub.name} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">{sub.name}</h3>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{sub.accuracy}% ACCURACY</span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black text-slate-900">{sub.score}</span>
                  <span className="text-sm font-bold text-slate-400">/ {sub.max}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(sub.score / sub.max) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Correct: {sub.correct}</span>
                  <span>Total: {sub.total}</span>
                </div>
             </div>
           ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 px-2">Question-wise Breakdown</h2>
          <div className="grid grid-cols-1 gap-4">
            {attempt.exam.questions.map((eq: any, idx: number) => {
              const resp = attempt.responses.find((r: any) => r.questionId === eq.questionId);
              const q = eq.question;
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${!resp?.selectedOption ? 'bg-slate-200' : resp.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${!resp?.selectedOption ? 'bg-slate-100 text-slate-500' : resp.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {!resp?.selectedOption ? 'Skipped' : resp.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-slate-900 font-bold mb-6">{q.content}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt: any) => {
                      const isSelected = resp?.selectedOption === opt.id;
                      const isCorrect = opt.id === q.correctOption;
                      
                      let border = "border-slate-100";
                      let bg = "bg-white";
                      if (isSelected) {
                        border = isCorrect ? "border-emerald-500" : "border-red-500";
                        bg = isCorrect ? "bg-emerald-50" : "bg-red-50";
                      } else if (isCorrect) {
                        border = "border-emerald-500";
                        bg = "bg-emerald-50/30";
                      }

                      return (
                        <div key={opt.id} className={`p-4 rounded-xl border-2 flex items-center gap-4 ${border} ${bg}`}>
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 text-slate-400'}`}>
                            {opt.id}
                          </span>
                          <span className="text-sm font-bold text-slate-700">{opt.text}</span>
                          {isCorrect && <span className="material-symbols-outlined text-emerald-600 text-sm ml-auto">check_circle</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Explanation</p>
                      <p className="text-sm text-indigo-900 font-medium">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
