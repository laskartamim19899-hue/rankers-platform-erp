"use client";

import { useState, useEffect, Suspense } from "react";
import { reportApi } from "@/lib/api";
import Link from "next/link";
import { exportToCSV } from "@/lib/utils";

function CollectionReportContent() {
  const [payments, setPayments] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<any>({
    totalCollected: 0,
    academicCollected: 0,
    hostelCollected: 0,
    lateFeesCollected: 0,
    paymentModeBreakdown: { CASH: 0, UPI: 0, ONLINE: 0, CHEQUE: 0 },
    monthlyTrend: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [courseId, setCourseId] = useState("ALL");
  const [paymentMode, setPaymentMode] = useState("ALL");
  const [month, setMonth] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Tab State: "ledger" | "academic" | "hostel"
  const [activeTab, setActiveTab] = useState<"ledger" | "academic" | "hostel">("ledger");

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (type !== "ALL") params.type = type;
      if (courseId !== "ALL") params.courseId = courseId;
      if (paymentMode !== "ALL") params.paymentMode = paymentMode;
      if (month !== "ALL") params.month = month;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await reportApi.getCollectionReport(params);
      setPayments(res.data.payments);
      setAggregates(res.data.aggregates);
    } catch (err) {
      console.error("Failed to fetch collection report", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced/Triggered search when parameters change
  useEffect(() => {
    fetchCollections();
  }, [type, courseId, paymentMode, month, startDate, endDate]);

  // Handle Search submit / click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCollections();
  };

  const handleClearFilters = () => {
    setSearch("");
    setType("ALL");
    setCourseId("ALL");
    setPaymentMode("ALL");
    setMonth("ALL");
    setStartDate("");
    setEndDate("");
  };

  // Get unique courses dynamically from payments
  const courses = Array.from(
    new Set(
      payments
        .filter(p => p.fee?.course)
        .map(p => JSON.stringify({ id: p.fee.courseId, name: p.fee.course.name }))
    )
  ).map((s: string) => JSON.parse(s));

  // Export Filtered Collections to CSV
  const handleExport = () => {
    const exportData = payments.map(p => ({
      "Transaction Date": new Date(p.date).toLocaleString(),
      "Student Name": p.student?.user?.name || "N/A",
      "Reg No": p.student?.regNo || "N/A",
      "Fee Type": p.fee?.type || "N/A",
      "Hostel Month": p.fee?.month || "N/A",
      "Course": p.fee?.course?.name || "N/A",
      "Collected Amount": p.amount,
      "Payment Mode": p.paymentMode || "N/A",
      "Transaction Reference": p.transactionId || "N/A"
    }));
    exportToCSV(exportData, `Fees_Collection_Report_${activeTab.toUpperCase()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const hostelMonths = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">
      {/* Header Panel */}
      <header className="bg-white border-b border-slate-200 h-16 flex justify-between items-center px-6 sticky top-0 z-50 print:hidden">
        <div className="flex items-center">
          <Link href="/admin/reports" className="mr-4 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-lg font-black text-primary tracking-tight">Collection Audit Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">Rankers' Treasury Registry</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white text-slate-600 border-2 border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print Report
          </button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:flex flex-col items-center justify-center p-12 border-b-4 border-primary mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Treasury Collections Performance Report</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Rankers' Platform Institutional ERP • Confidential Audit Ledger</p>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6 print:p-0">
        {/* KPI Treasury Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
          {/* Card 1: Total Treasury Collection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Collections</p>
            <p className="text-3xl font-black text-emerald-600">₹{aggregates.totalCollected.toLocaleString()}</p>
            <div className="absolute right-4 bottom-4 text-emerald-100 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-5xl">payments</span>
            </div>
          </div>

          {/* Card 2: Academic Collections */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Collections</p>
            <p className="text-3xl font-black text-blue-600">₹{aggregates.academicCollected.toLocaleString()}</p>
            <div className="absolute right-4 bottom-4 text-blue-100 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-5xl">school</span>
            </div>
          </div>

          {/* Card 3: Hostel Collections */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hostel Collections</p>
            <p className="text-3xl font-black text-amber-600">₹{aggregates.hostelCollected.toLocaleString()}</p>
            <div className="absolute right-4 bottom-4 text-amber-100 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-5xl">bed</span>
            </div>
          </div>

          {/* Card 4: Late Fees Penalty Audit */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fines & Penalties Recovered</p>
            <p className="text-3xl font-black text-red-600">₹{aggregates.lateFeesCollected.toLocaleString()}</p>
            <div className="absolute right-4 bottom-4 text-red-100 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-5xl">gavel</span>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm print:hidden">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="relative md:col-span-2">
                <input 
                  type="text" 
                  placeholder="Search student name or Reg No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
              </div>

              {/* Fee Type Filter */}
              <div>
                <select 
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === "ACADEMIC") {
                      setMonth("ALL");
                      setActiveTab("academic");
                    } else if (e.target.value === "HOSTEL") {
                      setActiveTab("hostel");
                    } else {
                      setActiveTab("ledger");
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11"
                >
                  <option value="ALL">All Fee Categories</option>
                  <option value="ACADEMIC">Academic Fees Only</option>
                  <option value="HOSTEL">Hostel Fees Only</option>
                </select>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11"
                >
                  <option value="ALL">All Payment Modes</option>
                  <option value="CASH">Cash Only</option>
                  <option value="UPI">UPI / GPay Only</option>
                  <option value="ONLINE">Bank Transfer / NetBanking</option>
                  <option value="CHEQUE">Cheque Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {/* Dynamic Batch / Course Filter */}
              <div>
                <select 
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11"
                >
                  <option value="ALL">All Batches</option>
                  {courses.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Monthly Hostel Period Filter (Enabled if Hostel Type is Selected) */}
              <div>
                <select 
                  value={month}
                  disabled={type === "ACADEMIC"}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none h-11 disabled:opacity-50"
                >
                  <option value="ALL">All Hostel Cycles</option>
                  {hostelMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-12">From</span>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none h-11 w-full"
                />
              </div>

              {/* End Date */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-8">To</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none h-11 w-full"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={handleClearFilters}
                className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                Clear All Filters
              </button>
              <button 
                type="submit"
                className="bg-primary text-white px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Apply Search & Filters
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Interactive Tab Switcher */}
        <div className="flex border-b border-slate-200 print:hidden">
          <button
            onClick={() => {
              setActiveTab("ledger");
              setType("ALL");
            }}
            className={`px-6 py-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "ledger"
                ? "border-primary text-primary bg-white rounded-t-2xl font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-sm">list_alt</span>
            Unified Registry Ledger
          </button>
          <button
            onClick={() => {
              setActiveTab("academic");
              setType("ACADEMIC");
            }}
            className={`px-6 py-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "academic"
                ? "border-primary text-primary bg-white rounded-t-2xl font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-sm">school</span>
            Academic Fees Audit
          </button>
          <button
            onClick={() => {
              setActiveTab("hostel");
              setType("HOSTEL");
            }}
            className={`px-6 py-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "hostel"
                ? "border-primary text-primary bg-white rounded-t-2xl font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-sm">bed</span>
            Monthly Hostel Audit
          </button>
        </div>

        {/* Main Data Registry Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center print:px-0">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                {activeTab === "ledger" && "Unified Ledger Registry"}
                {activeTab === "academic" && "Academic Fees Collection Register"}
                {activeTab === "hostel" && "Monthly Hostel Collection Register"}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Showing {payments.length} Verified Ledger Entry Cases
              </p>
            </div>
            <div className="text-right print:hidden">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                System Live & Audited
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fetching Treasury Archives...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Classification</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt / Reference</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Collected (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">
                          {new Date(p.date).toLocaleDateString()}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                          {new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-900">{p.student?.user?.name}</p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Reg: {p.student?.regNo || "N/A"}
                          </span>
                          {p.fee?.course?.name && (
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                              • {p.fee.course.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fee Classification */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                            p.fee?.type === 'HOSTEL' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {p.fee?.type || "ACADEMIC"}
                          </span>
                          {p.fee?.month && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">
                              {p.fee.month}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Base Fee: ₹{p.fee?.amount?.toLocaleString() || "0"}
                        </p>
                      </td>

                      {/* Receipt / Reference */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            {p.paymentMode || "CASH"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {p.transactionId ? `[${p.transactionId}]` : "Auto Txn"}
                          </span>
                        </div>
                        <Link 
                          href={`/receipt/${p.id}`}
                          className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest mt-1 inline-block print:hidden"
                        >
                          View Receipt Link
                        </Link>
                      </td>

                      {/* Collected Amount */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-lg font-black text-emerald-600">
                          ₹{p.amount.toLocaleString()}
                        </p>
                        {p.fee?.lateFee > 0 && (
                          <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                            Incl. Penalty Collection
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl text-center space-y-4">
              <span className="material-symbols-outlined text-slate-300 text-6xl">receipt_long</span>
              <div>
                <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">No Collections Found</h3>
                <p className="text-xs text-slate-400 mt-1">No transaction records match the specified search filters.</p>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Clear Search Parameters
              </button>
            </div>
          )}
        </div>

        {/* Footer Audit Signature */}
        <div className="hidden print:block text-center pt-24 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Audit Ledger Generated by Rankers' Platform Institutional ERP • All Rights Reserved © 2026
          </p>
        </div>
      </main>

      <style jsx>{`
        @media print {
          @page { margin: 15mm; }
          .bg-slate-50 { background-color: white !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th { border-bottom: 2px solid #1a1c1e !important; }
          td { border-bottom: 1px solid #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
}

export default function CollectionReport() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    }>
      <CollectionReportContent />
    </Suspense>
  );
}
