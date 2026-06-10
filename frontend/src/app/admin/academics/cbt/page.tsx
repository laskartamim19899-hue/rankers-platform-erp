"use client";

import Link from "next/link";

export default function CbtAdminDashboard() {
  const stats = [
    { label: "Total Questions", count: "1,240", icon: "quiz", color: "bg-blue-50 text-blue-600" },
    { label: "Active Exams", count: "12", icon: "timer", color: "bg-emerald-50 text-emerald-600" },
    { label: "Student Attempts", count: "850+", icon: "groups", color: "bg-violet-50 text-violet-600" },
    { label: "Avg. Accuracy", count: "68%", icon: "trending_up", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/academics" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600">computer</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">CBT Exam Engine</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NTA/NEET Practice Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4 relative z-10`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 relative z-10">{stat.count}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link href="/admin/academics/cbt/questions" className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">add_circle</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Question Bank</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Manage MCQ library with LaTeX and image support. Physics, Chemistry, Biology & Math.
                </p>
              </Link>

              <Link href="/admin/academics/cbt/exams" className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100 transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">schedule_send</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Schedule Exams</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Plan, schedule and assign mock tests to batches. Real-time NTA pattern delivery.
                </p>
              </Link>
            </div>

            {/* Active Monitoring */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Exam Monitoring
                </h2>
                <Link href="/admin/academics/cbt/live" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Live Dashboard</Link>
              </div>
              <div className="divide-y divide-slate-50">
                {[1, 2].map((i) => (
                  <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">person_play</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">NEET Sunday Mock #{10 + i}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Batch: Alpha + Helix • {i * 12 + 5} Active Students • Ends in 1h 45m
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-black text-emerald-600">Avg. Progress: {65 + i * 5}%</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">In Sync</p>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center border border-slate-100">
                        <span className="material-symbols-outlined text-lg">monitoring</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Intelligence */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full" />
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6">Bank Distribution</h3>
              <div className="space-y-6">
                {[
                  { label: "Biology", count: 450, color: "bg-emerald-500", total: 1000 },
                  { label: "Physics", count: 320, color: "bg-blue-500", total: 1000 },
                  { label: "Chemistry", count: 280, color: "bg-amber-500", total: 1000 },
                  { label: "Maths", count: 190, color: "bg-red-500", total: 1000 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>{item.label}</span>
                      <span className="text-slate-400">{item.count} qns</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${(item.count / 1000) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Full Bank Audit
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">System Health</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase">Server Latency</p>
                  <p className="text-sm font-bold text-emerald-600">24ms - Optimal</p>
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <p className="text-[10px] font-medium text-indigo-900 leading-relaxed">
                  Real-time synchronization active. All {stats[1].count} live exams are currently streaming responses to the database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
