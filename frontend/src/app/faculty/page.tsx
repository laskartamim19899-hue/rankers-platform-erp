"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function FacultyPage() {
  const departments = [
    {
      name: "Physics Department",
      faculty: [
        { name: "Tamim Laskar", role: "Physics Mentor", qualification: "Pursuing MBBS at NRSMC&H" },
        { name: "Sahanawaj Alam", role: "Engineering Physics", qualification: "Engineering at JU" },
      ]
    },
    {
      name: "Chemistry Department",
      faculty: [
        { name: "Sk Golam Rasul", role: "Chemistry Faculty", qualification: "Pursuing MBBS at CNMC" },
        { name: "Amirul Molla", role: "Chemistry Associate", qualification: "Pursuing MBBS at DHGMC&H" },
      ]
    },
    {
      name: "Biology Department",
      faculty: [
        { name: "Sk Jannat Ali", role: "Biology Mentor", qualification: "Pursuing MBBS at CNMC" },
        { name: "Abu Saeed Mondol", role: "Biology Faculty", qualification: "Pursuing MBBS at DHGMC&H" },
        { name: "Israt Parveen", role: "Biology Associate", qualification: "Pursuing MBBS at NRSMC&H" },
        { name: "Rebeka Sultana", role: "Biology Faculty", qualification: "Pursuing MBBS at RGKARMC & H" },
      ]
    },
    {
      name: "Mathematics Department",
      faculty: [
        { name: "Mehedi Hasan", role: "Mathematics Lead", qualification: "B.Tech" },
        { name: "Ruhul Amin", role: "Advanced Math", qualification: "B.Tech (JU)" },
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-slate-950 py-20 px-6 md:px-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full"></div>
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <span className="text-amber-500 font-black uppercase text-[10px] tracking-[0.4em]">Expert Mentorship</span>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Teacher Panel</h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Our faculty members are high-achievers from prestigious medical and engineering colleges, dedicated to shaping the next generation of Rankers.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto p-6 md:p-12 py-20 space-y-24">
          {departments.map((dept, dIdx) => (dept.faculty.length > 0 &&
            <div key={dIdx} className="space-y-12">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{dept.name}</h3>
                <div className="flex-grow h-px bg-slate-200"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {dept.faculty.map((m, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-20 h-20 bg-slate-50 rounded-full mb-6 flex items-center justify-center text-slate-300 border-2 border-slate-100 group-hover:border-amber-500 transition-colors">
                       <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">{m.name}</h4>
                      <p className="text-amber-600 font-black uppercase text-[10px] tracking-widest mt-1">{m.role}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide leading-relaxed">
                          {m.qualification}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Admission CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
           <div className="bg-slate-950 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-amber-500/5 blur-[100px]"></div>
             <div className="relative z-10 space-y-8">
               <div className="flex flex-col md:flex-row justify-center gap-4">
                 <span className="px-6 py-2 bg-amber-500 text-slate-950 rounded-full font-black uppercase text-xs tracking-widest">Target NEET 2028</span>
                 <span className="px-6 py-2 bg-white text-slate-950 rounded-full font-black uppercase text-xs tracking-widest">Target NEET 2027 (Freshers)</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black">Admission Open 2026-27</h2>
               <div className="space-y-2">
                 <p className="text-white/40 font-medium text-lg">Batch starting from <span className="text-amber-500 font-black">2nd May 2026</span></p>
                 <p className="text-white/40 font-medium text-lg">NEET Freshers starting from <span className="text-amber-500 font-black">10th May 2026</span></p>
               </div>
               <Link href="/apply" className="inline-flex h-16 px-12 bg-white text-slate-950 rounded-2xl items-center justify-center font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl">
                 Apply Now
               </Link>
             </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
