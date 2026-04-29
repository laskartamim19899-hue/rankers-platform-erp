"use client";

import { useState, useEffect } from "react";
import { financeApi } from "@/lib/api";
import Link from "next/link";

export default function DefaultersReport() {
  const [dues, setDues] = useState<any[]>([]);
  const [filteredDues, setFilteredDues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const fetchDues = async () => {
      try {
        const res = await financeApi.getAllDues();
        setDues(res.data);
        setFilteredDues(res.data);
      } catch (err) {
        console.error("Failed to fetch defaulters", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDues();
  }, []);

  useEffect(() => {
    let result = dues;
    if (batchFilter !== "ALL") {
      result = result.filter(d => d.courseId === batchFilter);
    }
    if (typeFilter !== "ALL") {
      result = result.filter(d => d.type === typeFilter);
    }
    setFilteredDues(result);
  }, [batchFilter, typeFilter, dues]);

  const batches = Array.from(new Set(dues.map(d => JSON.stringify({ id: d.courseId, name: d.course.name })))).map(s => JSON.parse(s));

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">
      <header className="bg-white border-b border-slate-200 h-16 flex justify-between items-center px-6 sticky top-0 z-50 print:hidden">
        <div className="flex items-center">
          <Link href="/admin/reports" className="mr-4 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-black text-primary tracking-tight">Institutional Defaulters Tracking</h1>
        </div>
        <div className="flex gap-4">
          <select 
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
          >
            <option value="ALL">All Batches</option>
            {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="ACADEMIC">Academic Only</option>
            <option value="HOSTEL">Hostel Only</option>
          </select>
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
        <h1 className="text-3xl font-black uppercase tracking-tighter">Outstanding Dues Track Report</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Rankers' Platform Institutional ERP • Confidential</p>
      </div>

      <main className="max-w-7xl mx-auto p-6 print:p-0">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center print:px-0">
            <div>
              <h2 className="text-lg font-black text-slate-800">Defaulter Audit List</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Outstanding: {filteredDues.length} Cases</p>
              <p className="text-sm font-black text-red-600 mt-1">
                ₹{filteredDues.reduce((sum: number, d: any) => {
                  const gross = d.amount + (d.lateFee || 0);
                  const paid = (d.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                  return sum + Math.max(0, gross - paid);
                }, 0).toLocaleString()} Total Remaining
              </p>
            </div>
            <div className="text-right print:hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status: Unpaid</span>
              <div className="h-2 w-24 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Minimum Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount Due (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDues.map((due: any) => (
                  <tr key={due.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">{due.student.user.name}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{due.student.regNo}</span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">• {due.course.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-800">{due.student.guardianName}</p>
                      <p className="text-xs text-primary font-black mt-0.5">{due.student.phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${due.type === 'HOSTEL' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {due.type}
                        </span>
                        {due.month && <span className="text-[9px] font-black text-slate-400">{due.month}</span>}
                      </div>
                      <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">Due: {new Date(due.dueDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {(() => {
                        const gross = due.amount + (due.lateFee || 0);
                        const paid = (due.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
                        const remaining = Math.max(0, gross - paid);
                        return (
                          <>
                            <p className="text-lg font-black text-red-600">₹{remaining.toLocaleString()}</p>
                            {paid > 0 && (
                              <p className="text-[9px] font-black text-emerald-600 mt-0.5">₹{paid.toLocaleString()} paid</p>
                            )}
                            {due.lateFee > 0 && (
                              <p className="text-[9px] font-black text-orange-500">₹{due.lateFee} late fine incl.</p>
                            )}
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{due.status}</p>
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
