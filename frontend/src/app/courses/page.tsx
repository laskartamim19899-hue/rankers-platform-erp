"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CoursesPage() {
  const courses = [
    { name: "NEET Elite (Class XI Sc.)", duration: "Target NEET 2028", target: "Class 11th Students", fee: "₹45,000/yr", desc: "Intensive integrated program for medical aspirants. Batch starts 2nd May 2026." },
    { name: "NEET Freshers", duration: "Target NEET 2027", target: "Class 12th / Droppers", fee: "₹50,000/yr", desc: "Focused curriculum for freshers aiming for top medical colleges. Classes start 10th May 2026." },
    { name: "JEE Prime", duration: "2 Years", target: "Class 11th Students", fee: "₹48,000/yr", desc: "Designed for future engineers. Focuses on advanced problem solving and conceptual physics." },
    { name: "NEET/JEE Crash Course", duration: "45 Days", target: "Class 12th Passed", fee: "₹12,000", desc: "A rapid revision power-pack with 50+ mock tests and strategic shortcut techniques." },
    { name: "Foundation Batch", duration: "1 Year", target: "Class 9th & 10th", fee: "₹25,000/yr", desc: "Building the roots of logical thinking and scientific temperament for future competitive exams." }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-slate-950 py-20 px-6 md:px-12 text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Academic Programs</h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Choose a program tailored to your academic goals and career aspirations.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:shadow-amber-500/5 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <span className="material-symbols-outlined text-3xl md:text-4xl">school</span>
                  </div>
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">{course.fee}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{course.name}</h3>
                <div className="flex gap-4 mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-4">{course.duration}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.target}</span>
                </div>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">{course.desc}</p>
                <Link href="/apply" className="inline-flex items-center gap-2 bg-slate-950 text-amber-500 px-8 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-500 hover:text-slate-950 transition-all">
                  Apply for this course
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
