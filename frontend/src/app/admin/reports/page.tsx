"use client";

import { useState, useEffect } from "react";
import { reportApi } from "@/lib/api";
import Link from "next/link";

export default function AdminReports() {
  const [finance, setFinance] = useState<any>(null);
  const [academic, setAcademic] = useState<any>(null);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finRes, acadRes, payrollRes] = await Promise.all([
          reportApi.getFinanceSummary(),
          reportApi.getAcademicAnalytics(),
          reportApi.getPayrollReport()
        ]);
        setFinance(finRes.data);
        setAcademic(acadRes.data);
        setPayroll(payrollRes.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">
      <header className="bg-white border-b border-slate-200 h-16 flex justify-between items-center px-6 sticky top-0 z-50 print:hidden">
        <div className="flex items-center">
          <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-black text-primary tracking-tight">Institutional Intelligence</h1>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export Full Report
        </button>
      </header>

      {/* Print-only Header */}
      <div className="hidden print:flex flex-col items-center justify-center p-12 border-b-4 border-primary mb-12">
        <img src="/logo.png" alt="Logo" className="h-20 w-auto mb-4" />
        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Institutional Performance Report</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Rankers' Platform • {new Date().toLocaleDateString()} • CONFIDENTIAL</p>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8 print:p-0">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Students</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-black text-primary">{academic?.totalStudents || 0}</p>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">LIVE</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Collection</p>
            <p className="text-4xl font-black text-emerald-600">₹{finance?.collected?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-red-500 transition-all cursor-pointer">
            <Link href="/admin/reports/defaulters">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Defaulter Tracking</p>
              <div className="flex justify-between items-end">
                <p className="text-4xl font-black text-red-600">₹{finance?.pending?.toLocaleString() || 0}</p>
                <span className="material-symbols-outlined text-red-600 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Index</p>
            <p className="text-4xl font-black text-primary">{academic?.averageScore?.toFixed(1) || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
          {/* Finance Report */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Revenue Stream Audit</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Last 5 Verified Transactions</p>
            </div>
            <div className="p-8 space-y-6">
              {finance?.recentPayments?.length > 0 ? finance.recentPayments.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{p.student.user.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{p.paymentMode} • {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-emerald-600">+ ₹{p.amount.toLocaleString()}</p>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 font-bold uppercase">No Recent Transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Academic Stats */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Attendance Distribution</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-Batch Institutional Discipline</p>
            </div>
            <div className="p-12 flex flex-col items-center justify-center space-y-12">
              <div className="flex gap-20 text-center">
                {academic?.attendanceStats?.map((stat: any) => (
                  <div key={stat.status} className="space-y-2">
                    <p className={`text-5xl font-black ${stat.status === 'PRESENT' ? 'text-emerald-600' : 'text-red-600'}`}>{stat._count._all}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-full">{stat.status}</p>
                  </div>
                ))}
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <span>Presence Ratio</span>
                  <span className="text-primary">{((academic?.attendanceStats?.find((s: any) => s.status === 'PRESENT')?._count._all || 0) / (academic?.totalStudents || 1) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden flex shadow-inner p-1">
                  {academic?.attendanceStats?.map((stat: any, i: number) => (
                    <div 
                      key={i}
                      className={`${stat.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-red-500'} h-full rounded-full transition-all first:mr-1`}
                      style={{ width: `${(stat._count._all / (academic?.totalStudents || 1)) * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium italic text-center max-w-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                This snapshot represents the real-time engagement of the student body across all active academic batches.
              </p>
            </div>
          </div>

          {/* Daily Payroll Report */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none lg:col-span-2">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Staff Payroll Register</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Salary Disbursal Breakdown</p>
              </div>
              <button onClick={() => {
                const exportData = payroll.flatMap((day: any) => day.records.map((r: any) => ({
                  "Date": new Date(r.date).toLocaleDateString(),
                  "Payee / Staff": r.payeeName || "N/A",
                  "Description": r.description || "Salary",
                  "Amount": r.amount
                })));
                import('@/lib/utils').then(m => m.exportToCSV(exportData, "Daily_Payroll_Report"));
              }} className="bg-white text-slate-600 border-2 border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">download</span> CSV
              </button>
            </div>
            <div className="p-8">
              {payroll && payroll.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payroll.map((day: any) => (
                    <div key={day.date} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-black text-slate-700">{new Date(day.date).toLocaleDateString()}</p>
                        <p className="font-black text-primary">₹{day.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        {day.records.map((r: any) => (
                          <div key={r.id} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-bold">{r.payeeName || "Staff Member"}</span>
                            <span className="text-slate-400">₹{r.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 font-bold uppercase">No Payroll Records Found</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Disclaimer for Printing */}
        <div className="hidden print:block text-center pt-24 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Generated by Rankers' Platform ERP Suite • All Rights Reserved © 2026
          </p>
        </div>
      </main>

      <style jsx>{`
        @media print {
          @page { margin: 20mm; }
          .bg-slate-50 { background-color: white !important; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 8px !important; }
          header { display: none !important; }
        }
      `}</style>
    </div>
  );
}
