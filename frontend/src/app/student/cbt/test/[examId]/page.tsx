"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { cbtApi } from "@/lib/api";
declare global {
  interface Window {
    MathJax: any;
  }
}

type QuestionStatus = "NOT_VISITED" | "NOT_ANSWERED" | "ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED_FOR_REVIEW";

export default function CbtTestPlayer() {
  const { examId } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [responses, setResponses] = useState<Record<string, { option: string | null, status: QuestionStatus }>>({});
  const [student, setStudent] = useState<any>(null);

  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Security: Fullscreen & Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isLoading) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= 3) {
            handleSubmit(true); // Auto-submit on 3rd warning
          } else {
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "r")) ||
        e.key === "F5" || e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading]);

  // Heartbeat & Security Reporting
  useEffect(() => {
    if (!attempt?.id || isLoading) return;

    const interval = setInterval(() => {
      cbtApi.heartbeat(attempt.id).catch(() => {});
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [attempt?.id, isLoading]);

  // Report security alerts immediately
  useEffect(() => {
    if (warnings > 0 && attempt?.id) {
      cbtApi.heartbeat(attempt.id, 1).catch(() => {});
    }
  }, [warnings, attempt?.id]);

  const fetchExamData = useCallback(async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setStudent(user);

    try {
      const res = await cbtApi.startAttempt(user.studentProfile.id, examId as string);
      const { exam, attempt } = res.data;
      setExam(exam);
      setAttempt(attempt);
      setQuestions(exam.questions);
      
      // Calculate remaining time
      const startTime = new Date(attempt.startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const total = exam.duration * 60;
      setTimeLeft(Math.max(0, total - elapsed));

      // Initialize responses from attempt data if resuming
      const initialResponses: any = {};
      exam.questions.forEach((q: any) => {
        const resp = attempt.responses.find((r: any) => r.questionId === q.questionId);
        initialResponses[q.questionId] = {
          option: resp?.selectedOption || null,
          status: resp ? (resp.selectedOption ? "ANSWERED" : "NOT_ANSWERED") : "NOT_VISITED"
        };
      });
      setResponses(initialResponses);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load exam", err);
      alert("Failed to start exam. Check if you have already submitted.");
      router.push("/student/cbt");
    }
  }, [examId, router]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  // Timer Logic
  useEffect(() => {
    if (timeLeft > 0 && !isLoading) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, isLoading]);

  const handleSelectOption = (optionId: string) => {
    const qId = questions[currentIndex].questionId;
    const isSectionB = questions[currentIndex].section === 'B';
    const subject = questions[currentIndex].question.subject;

    if (isSectionB && !responses[qId].option) {
       const sectionBAttempts = Object.values(responses).filter((r, idx) => 
         questions[idx]?.section === 'B' && 
         questions[idx]?.question?.subject === subject && 
         r.option
       ).length;

       if (sectionBAttempts >= 10) {
         alert("You have already attempted 10 questions in Section B of this subject. Please clear an existing response to answer this one.");
         return;
       }
    }

    setResponses(prev => ({
      ...prev,
      [qId]: { ...prev[qId], option: optionId }
    }));
  };

  const updateStatus = (status: QuestionStatus) => {
    const qId = questions[currentIndex].questionId;
    const currentResp = responses[qId];
    
    let nextStatus = status;
    if (status === "MARKED_FOR_REVIEW" && currentResp.option) {
      nextStatus = "ANSWERED_AND_MARKED_FOR_REVIEW";
    } else if (status === "ANSWERED" && !currentResp.option) {
      nextStatus = "NOT_ANSWERED";
    }

    setResponses(prev => ({
      ...prev,
      [qId]: { ...prev[qId], status: nextStatus }
    }));

    // Autosave to backend
    cbtApi.saveResponse({
      attemptId: attempt.id,
      questionId: qId,
      selectedOption: currentResp.option,
      timeSpent: 0 // Track time later
    });
  };

  const handleSaveAndNext = () => {
    updateStatus("ANSWERED");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    updateStatus("MARKED_FOR_REVIEW");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const qId = questions[currentIndex].questionId;
    setResponses(prev => ({
      ...prev,
      [qId]: { ...prev[qId], option: null, status: "NOT_ANSWERED" }
    }));
    cbtApi.saveResponse({
      attemptId: attempt.id,
      questionId: qId,
      selectedOption: null,
      timeSpent: 0
    });
  };

  const handleSubmit = async (isAuto = false) => {
    if (isAuto || window.confirm("Are you sure you want to submit the exam?")) {
      try {
        await cbtApi.submitExam(attempt.id);
        if (!isAuto) alert("Exam submitted successfully!");
        router.push(`/student/cbt/result/${attempt.id}`);
      } catch (err) {
        if (!isAuto) alert("Submission failed. Please try again.");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Preparing your exam environment...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex]?.question;
  const currentResponse = responses[questions[currentIndex]?.questionId];

  return (
    <div className="h-screen flex flex-col bg-[#f0f0f0] font-sans overflow-hidden select-none">
      <Script 
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        strategy="lazyOnload"
      />
      {/* NTA Header */}
      <header className="bg-white border-b border-slate-300 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-2 rounded-lg font-black text-sm">CBT</div>
          <div>
            <h1 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{exam.title}</h1>
            <p className="text-[10px] text-slate-400 font-bold">NEET Pattern Assessment</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <span className="material-symbols-outlined text-red-600">timer</span>
            <span className="text-xl font-black text-red-600 font-mono w-24 text-center">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
               <p className="text-xs font-bold text-slate-700">{student?.user?.name}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student?.regNo}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
               <img src={student?.user?.photoUrl ? `http://localhost:5000${student.user.photoUrl}` : 'https://api.dicebear.com/7.x/initials/svg?seed=' + student?.user?.name} alt="" />
             </div>
          </div>
        </div>
      </header>

      {/* Security Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Security Violation!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Switching tabs or windows is strictly prohibited. Your exam will be <b>automatically submitted</b> after 3 warnings.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase">Warning Count:</span>
              <span className="text-2xl font-black text-red-600">{warnings}/3</span>
            </div>
            <button 
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full h-14 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Resume My Exam
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Side: Question Area */}
        <div className="flex-grow flex flex-col bg-white overflow-hidden border-r border-slate-300">
          
          {/* Subject Tabs */}
          <div className="bg-slate-50 border-b border-slate-300 flex px-6 py-2 gap-2 overflow-x-auto shrink-0">
            {Array.from(new Set(questions.map(q => q.question.subject))).map(sub => (
               <button 
                key={sub as string} 
                onClick={() => {
                  const firstIdx = questions.findIndex(q => q.question.subject === sub);
                  if (firstIdx !== -1) setCurrentIndex(firstIdx);
                }}
                className={`px-6 py-2 text-[11px] whitespace-nowrap font-black uppercase tracking-widest rounded-lg border-b-2 transition-all ${currentQuestion.subject === sub ? 'bg-indigo-600 text-white border-indigo-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}
               >
                 {sub as string}
               </button>
            ))}
          </div>

          {/* Question Display */}
          <div className="flex-grow p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-black">
                    Question No. {currentIndex + 1}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${questions[currentIndex]?.section === 'B' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    Section {questions[currentIndex]?.section || 'A'}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  {questions[currentIndex]?.section === 'B' && (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Section B Attempts</span>
                      <span className="text-xs font-black text-amber-600">
                        {Object.values(responses).filter((r, idx) => questions[idx]?.section === 'B' && questions[idx]?.question?.subject === questions[currentIndex]?.question?.subject && r.option).length} / 10
                      </span>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Correct: +{exam.positiveMarks}</span>
                    <span className="text-[10px] font-black text-red-500 uppercase">Wrong: -{exam.negativeMarks}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-bold text-slate-900 leading-relaxed mb-8 whitespace-pre-wrap">
                  {currentQuestion.content}
                </h2>
                
                {currentQuestion.imageUrl && (
                  <div className="mb-8 p-4 border border-slate-200 rounded-2xl bg-slate-50">
                    <img src={`http://localhost:5000${currentQuestion.imageUrl}`} alt="Question diagram" className="max-h-64 object-contain mx-auto" />
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-10">
                {currentQuestion.options.map((opt: any) => (
                  <button 
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-6 transition-all active:scale-[0.99] ${currentResponse.option === opt.id ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${currentResponse.option === opt.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {opt.id}
                    </div>
                    <span className={`font-bold text-lg ${currentResponse.option === opt.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>
                    {currentResponse.option === opt.id && (
                      <span className="material-symbols-outlined ml-auto text-indigo-600">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <footer className="h-20 bg-slate-50 border-t border-slate-300 flex items-center justify-between px-8 shrink-0">
             <div className="flex gap-4">
                <button 
                  onClick={handleMarkForReviewAndNext}
                  className="h-12 px-6 bg-amber-50 text-amber-700 border-2 border-amber-200 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-all"
                >
                  Mark for Review & Next
                </button>
                <button 
                  onClick={handleClearResponse}
                  className="h-12 px-6 bg-white text-slate-500 border-2 border-slate-200 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
                >
                  Clear Response
                </button>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="h-12 px-8 bg-white text-slate-700 border-2 border-slate-300 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all disabled:opacity-30"
                >
                  Previous
                </button>
                <button 
                  onClick={handleSaveAndNext}
                  className="h-12 px-10 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Save & Next
                </button>
             </div>
          </footer>
        </div>

        {/* Right Side: Palette Sidebar */}
        <aside className="w-[350px] bg-slate-50 flex flex-col shrink-0">
          
          {/* Status Legends */}
          <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-300">
             {[
               { label: "Answered", count: Object.values(responses).filter(r => r.status === "ANSWERED").length, color: "bg-emerald-600" },
               { label: "Not Answered", count: Object.values(responses).filter(r => r.status === "NOT_ANSWERED").length, color: "bg-red-500" },
               { label: "Not Visited", count: Object.values(responses).filter(r => r.status === "NOT_VISITED").length, color: "bg-slate-100 border border-slate-300" },
               { label: "Review", count: Object.values(responses).filter(r => r.status === "MARKED_FOR_REVIEW").length, color: "bg-indigo-600 rounded-full" },
             ].map(stat => (
               <div key={stat.label} className="flex items-center gap-2">
                 <div className={`w-5 h-5 ${stat.color} text-[10px] text-white flex items-center justify-center font-bold`}>{stat.count}</div>
                 <span className="text-[10px] font-black text-slate-500 uppercase">{stat.label}</span>
               </div>
             ))}
          </div>

          <div className="p-6 flex-grow flex flex-col overflow-hidden">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Question Palette</h3>
             
             <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-5 gap-3 h-0">
                {questions.map((q, idx) => {
                  const resp = responses[q.questionId];
                  let bg = "bg-slate-100 text-slate-500 border border-slate-300";
                  if (resp.status === "ANSWERED") bg = "bg-emerald-600 text-white";
                  if (resp.status === "NOT_ANSWERED") bg = "bg-red-500 text-white";
                  if (resp.status === "MARKED_FOR_REVIEW") bg = "bg-indigo-600 text-white rounded-full";
                  if (resp.status === "ANSWERED_AND_MARKED_FOR_REVIEW") bg = "bg-indigo-600 text-white rounded-full relative after:content-['✓'] after:absolute after:-top-1 after:-right-1 after:bg-emerald-500 after:w-3 after:h-3 after:rounded-full after:text-[8px] after:flex after:items-center after:justify-center";
                  
                  return (
                    <button 
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-black transition-all hover:scale-110 ${currentIndex === idx ? 'ring-2 ring-indigo-600 ring-offset-2' : ''} ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-300">
             <button 
               onClick={() => handleSubmit(false)}
               className="w-full h-14 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
             >
               Submit Exam
             </button>
          </div>

        </aside>
      </div>

      <style jsx global>{`
        body { overflow: hidden; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1; }
      `}</style>
    </div>
  );
}
