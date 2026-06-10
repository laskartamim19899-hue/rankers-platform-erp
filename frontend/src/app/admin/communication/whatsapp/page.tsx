"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { studentApi, financeApi, academicApi } from "@/lib/api";

export default function WhatsAppNotificationEngine() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [template, setTemplate] = useState("FEE_REMINDER");

  // Fee state
  const [loadingFees, setLoadingFees] = useState(false);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [customFeeAmount, setCustomFeeAmount] = useState("");

  // Result state
  const [loadingResults, setLoadingResults] = useState(false);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [customTestName, setCustomTestName] = useState("");
  const [customMarks, setCustomMarks] = useState("");

  // Custom
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await studentApi.getAll();
      const active = res.data.filter((s: any) => s.status === "APPROVED");
      setStudents(active);
      setFilteredStudents(active);
    } catch { } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredStudents(students.filter(s =>
        s.user.name.toLowerCase().includes(q) ||
        s.regNo?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      ));
    } else setFilteredStudents(students);
  }, [searchQuery, students]);

  // Fetch dues + results when student selected
  const handleSelectStudent = useCallback(async (student: any) => {
    setSelectedStudent(student);
    setSelectedFee(null);
    setCustomFeeAmount("");
    setSelectedResult(null);
    setCustomTestName("");
    setCustomMarks("");
    setStudentFees([]);
    setStudentResults([]);

    // Fetch fees
    setLoadingFees(true);
    try {
      const res = await financeApi.getFees(student.id);
      const fees: any[] = res.data || [];
      // Calculate remaining for each fee
      const pending = fees
        .filter((f: any) => f.status === "PENDING" || f.status === "PARTIAL")
        .map((f: any) => {
          const paid = (f.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
          const gross = f.amount + (f.lateFee || 0);
          const remaining = Math.max(0, gross - paid);
          return { ...f, remaining, paid };
        })
        .filter((f: any) => f.remaining > 0);
      setStudentFees(pending);
    } catch { } finally { setLoadingFees(false); }

    // Fetch results
    setLoadingResults(true);
    try {
      const res = await academicApi.getSummary(student.id);
      const results: any[] = (res.data?.results || []).sort((a: any, b: any) =>
        new Date(b.test?.date || 0).getTime() - new Date(a.test?.date || 0).getTime()
      );
      setStudentResults(results);
    } catch { } finally { setLoadingResults(false); }
  }, []);

  // Auto-fill when fee selected
  const handleFeeSelect = (fee: any) => {
    setSelectedFee(fee);
    setCustomFeeAmount(String(fee.remaining));
  };

  // Auto-fill when result selected
  const handleResultSelect = (result: any) => {
    setSelectedResult(result);
    setCustomTestName(result.test?.name || "");
    setCustomMarks(`${result.marksObtained}/${result.test?.totalMarks || "?"}`);
  };

  const generateMessage = () => {
    if (!selectedStudent) return "Please select a student first.";
    const parentName = selectedStudent.guardianName || "Parent/Guardian";
    const studentName = selectedStudent.user.name;

    switch (template) {
      case "FEE_REMINDER": {
        const amt = customFeeAmount || "[Amount / পরিমাণ]";
        const feeLabel = selectedFee
          ? `${selectedFee.type === "HOSTEL" ? "Hostel / হোস্টেল" : "Academic / একাডেমিক"} Fee / ফি${selectedFee.month ? ` (${selectedFee.month})` : ""} — Due / বকেয়া তারিখ ${new Date(selectedFee.dueDate).toLocaleDateString("en-IN")}`
          : "pending fee / বকেয়া ফি";
        const lateLine = selectedFee?.lateFee > 0 ? `\n\u26A0\uFE0F A late fine of ₹${selectedFee.lateFee} has been added. / বিলম্ব জরিমানা হিসেবে ₹${selectedFee.lateFee} যোগ করা হয়েছে।` : "";
        return `Dear / প্রিয় ${parentName},\n\nThis is a gentle reminder from *Rankers' Platform* regarding the outstanding *${feeLabel}* of *₹${amt}* for your ward, *${studentName}* (${selectedStudent.regNo}).\n*Rankers' Platform* থেকে জানানো হচ্ছে যে, আপনার সন্তান *${studentName}* (${selectedStudent.regNo})-এর *${feeLabel}* বাবদ *₹${amt}* বকেয়া রয়েছে।${lateLine}\n\nKindly settle the dues at the earliest to avoid any inconvenience.\nঅনুগ্রহ করে যত দ্রুত সম্ভব বকেয়া পরিশোধ করুন।\n\n\uD83D\uDCDE Contact / যোগাযোগ: Admin Office / অ্যাডমিন অফিস\n\uD83C\uDFEB Rankers' Platform\n\nThank you / ধন্যবাদ,\n*Rankers' Platform Admin*`;
      }
      case "ABSENT_ALERT":
        return `Dear / প্রিয় ${parentName},\n\nThis is to inform you that your ward, *${studentName}* (${selectedStudent.regNo}), was *absent* from classes today (${new Date().toLocaleDateString("en-IN")}).\nআপনাকে জানানো হচ্ছে যে, আপনার সন্তান *${studentName}* (${selectedStudent.regNo}) আজকের (${new Date().toLocaleDateString("en-IN")}) ক্লাসে *অনুপস্থিত* ছিল।\n\nPlease ensure regular attendance for better academic performance. If this was due to an emergency, kindly submit a leave application.\nভালো ফলাফলের জন্য নিয়মিত উপস্থিতি নিশ্চিত করুন। জরুরি কারণে অনুপস্থিত থাকলে ছুটির আবেদন জমা দিন।\n\nRegards / ধন্যবাদ,\n*Rankers' Platform Academic Team*`;
      case "RESULT_ALERT": {
        const test = customTestName || "[Test Name / পরীক্ষার নাম]";
        const marks = customMarks || "[Marks / নম্বর]";
        const perf = selectedResult
          ? Number(selectedResult.marksObtained) / Number(selectedResult.test?.totalMarks || 1) >= 0.75
            ? "Excellent performance! \uD83C\uDF1F Keep it up! / চমৎকার ফলাফল! এভাবেই এগিয়ে যাও!"
            : Number(selectedResult.marksObtained) / Number(selectedResult.test?.totalMarks || 1) >= 0.5
              ? "Good effort! Encourage them to aim higher. \uD83D\uDCDA / ভালো চেষ্টা! তাকে আরও উপরে লক্ষ্য রাখতে উৎসাহিত করুন।"
              : "We encourage more focused preparation for upcoming tests. \uD83D\uDCAA / আসন্ন পরীক্ষার জন্য আরও মনোযোগী প্রস্তুতির পরামর্শ দেওয়া হচ্ছে।"
          : "";
        return `Dear / প্রিয় ${parentName},\n\nWe are sharing the results of *${studentName}* (${selectedStudent.regNo}) for the recent *${test}* examination.\n*${studentName}* (${selectedStudent.regNo})-এর সাম্প্রতিক *${test}* পরীক্ষার ফলাফল শেয়ার করা হচ্ছে।\n\n\uD83D\uDCCA *Score / প্রাপ্ত নম্বর: ${marks}*\n${perf}\n\nFor detailed performance analysis, please visit the admin portal or contact us.\nবিস্তারিত বিশ্লেষণের জন্য অ্যাডমিন পোর্টাল পরিদর্শন করুন অথবা আমাদের সাথে যোগাযোগ করুন।\n\nRegards / ধন্যবাদ,\n*Rankers' Platform Academic Team*`;
      }
      case "CUSTOM":
        return customMessage || `Dear / প্রিয় ${parentName},\n\n[Type your custom message here / এখানে আপনার কাস্টম বার্তা লিখুন]\n\nRegards / ধন্যবাদ,\nRankers' Platform`;
      default:
        return "";
    }
  };

  const handleSend = () => {
    if (!selectedStudent) return alert("Select a student first!");
    const msg = generateMessage();
    let phone = selectedStudent.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const feeTypeLabel = (f: any) =>
    `${f.type === "HOSTEL" ? "🏠 Hostel" : "🎓 Academic"}${f.month ? ` — ${f.month}` : ""} • ₹${f.remaining.toLocaleString()} due`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">
          <span className="material-symbols-outlined text-sm">chat</span>
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight mr-auto">WhatsApp Notification Engine</h1>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Auto-Fetch Enabled</span>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Student Selector */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Recipient</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Name, reg no or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-1.5">
              {isLoading ? (
                <div className="text-center p-8 text-slate-400 font-bold text-sm">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center p-8 text-slate-400 font-bold text-sm">No students found.</div>
              ) : filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${selectedStudent?.id === student.id ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${selectedStudent?.id === student.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {student.user.name[0]}
                    </div>
                    <div>
                      <p className={`font-black text-sm ${selectedStudent?.id === student.id ? "text-emerald-700" : "text-slate-800"}`}>{student.user.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.regNo} • {student.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Message Configurator */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Template Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Message Type</h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: "FEE_REMINDER", icon: "payments", label: "Fee Due", color: "red" },
                  { id: "ABSENT_ALERT", icon: "person_off", label: "Absent", color: "amber" },
                  { id: "RESULT_ALERT", icon: "grade", label: "Results", color: "blue" },
                  { id: "CUSTOM", icon: "edit_note", label: "Custom", color: "slate" },
                ].map(t => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-4 rounded-2xl cursor-pointer text-center transition-all border-2 ${template === t.id ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"}`}
                  >
                    <span className="material-symbols-outlined block text-2xl mb-1">{t.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">tune</span>
                {template === "FEE_REMINDER" ? "Fee Details — Auto Fetched" :
                  template === "RESULT_ALERT" ? "Result Details — Auto Fetched" :
                    template === "CUSTOM" ? "Custom Message" : "No Extra Input Needed"}
              </h2>

              {/* FEE_REMINDER */}
              {template === "FEE_REMINDER" && (
                <div className="space-y-4">
                  {!selectedStudent ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200">
                      <span className="material-symbols-outlined text-slate-300 text-3xl">person_search</span>
                      <p className="text-sm font-bold text-slate-400">Select a student to auto-load their pending dues</p>
                    </div>
                  ) : loadingFees ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                      <span className="animate-spin material-symbols-outlined text-emerald-500">progress_activity</span>
                      <p className="text-sm font-bold text-emerald-600">Fetching pending dues...</p>
                    </div>
                  ) : studentFees.length === 0 ? (
                    <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                      <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
                      <p className="text-sm font-bold text-emerald-700">No pending dues for this student. All clear! ✅</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{studentFees.length} pending fee(s) found — select one:</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {studentFees.map((fee: any) => (
                          <div
                            key={fee.id}
                            onClick={() => handleFeeSelect(fee)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedFee?.id === fee.id ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${fee.type === "HOSTEL" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                <span className="material-symbols-outlined text-sm">{fee.type === "HOSTEL" ? "bed" : "school"}</span>
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-800">
                                  {fee.type === "HOSTEL" ? "Hostel Fee" : "Academic Fee"}
                                  {fee.month ? ` — ${fee.month}` : ""}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold">Due: {new Date(fee.dueDate).toLocaleDateString("en-IN")}{fee.lateFee > 0 ? ` • +₹${fee.lateFee} late fine` : ""}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-red-600">₹{fee.remaining.toLocaleString()}</p>
                              {fee.paid > 0 && <p className="text-[9px] text-emerald-600 font-bold">₹{fee.paid.toLocaleString()} paid</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount in Message (auto-filled, editable)</label>
                        <input
                          type="number"
                          value={customFeeAmount}
                          onChange={(e) => setCustomFeeAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* RESULT_ALERT */}
              {template === "RESULT_ALERT" && (
                <div className="space-y-4">
                  {!selectedStudent ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200">
                      <span className="material-symbols-outlined text-slate-300 text-3xl">person_search</span>
                      <p className="text-sm font-bold text-slate-400">Select a student to auto-load their recent test results</p>
                    </div>
                  ) : loadingResults ? (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                      <span className="animate-spin material-symbols-outlined text-blue-500">progress_activity</span>
                      <p className="text-sm font-bold text-blue-600">Fetching test results...</p>
                    </div>
                  ) : studentResults.length === 0 ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200">
                      <span className="material-symbols-outlined text-slate-300 text-2xl">quiz</span>
                      <p className="text-sm font-bold text-slate-400">No test results found. Enter manually below.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{studentResults.length} test result(s) found — select one:</p>
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {studentResults.map((result: any) => {
                          const pct = result.test?.totalMarks ? Math.round((result.marksObtained / result.test.totalMarks) * 100) : 0;
                          return (
                            <div
                              key={result.id}
                              onClick={() => handleResultSelect(result)}
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedResult?.id === result.id ? "border-blue-400 bg-blue-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
                            >
                              <div>
                                <p className="text-xs font-black text-slate-800">{result.test?.name || "Unnamed Test"}</p>
                                <p className="text-[9px] text-slate-400 font-bold">
                                  {result.test?.date ? new Date(result.test.date).toLocaleDateString("en-IN") : "—"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-blue-700">{result.marksObtained}/{result.test?.totalMarks || "?"}</p>
                                <p className={`text-[9px] font-black ${pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <div className="flex gap-4 pt-1">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Test Name (auto-filled)</label>
                      <input type="text" value={customTestName} onChange={(e) => setCustomTestName(e.target.value)} placeholder="e.g. Unit Test 1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Marks (auto-filled)</label>
                      <input type="text" value={customMarks} onChange={(e) => setCustomMarks(e.target.value)} placeholder="e.g. 45/50" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM */}
              {template === "CUSTOM" && (
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your full message here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
                />
              )}

              {/* ABSENT — no input */}
              {template === "ABSENT_ALERT" && (
                <div className="flex items-center gap-3 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
                  <p className="text-sm font-bold text-amber-700">Message auto-generated with today's date. Just select a student and send!</p>
                </div>
              )}
            </div>

            {/* Live Preview + Send */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Preview</h2>
              <div className="bg-[#e9f5e1] rounded-2xl p-5 relative min-h-[140px]">
                <div className="absolute top-5 -left-2 w-4 h-4 bg-[#e9f5e1] border-l border-t border-green-200 transform -rotate-45"></div>
                <p className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-sm relative z-10">
                  {generateMessage()}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedStudent ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {selectedStudent ? selectedStudent.user.name[0] : <span className="material-symbols-outlined text-sm">person</span>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sending to Guardian</p>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedStudent?.guardianName || "No one selected"}{" "}
                      <span className="opacity-50 font-normal">({selectedStudent?.phone || "..."})</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!selectedStudent}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Send via WhatsApp
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
