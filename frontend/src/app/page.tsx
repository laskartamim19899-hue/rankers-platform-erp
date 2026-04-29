"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const stats = [
  { label: "Total Selections", value: 2500, suffix: "+" },
  { label: "Success Rate", value: 98, suffix: "%" },
  { label: "Expert Faculty", value: 45, suffix: "+" },
  { label: "State Ranks", value: 15, suffix: "" },
];

const features = [
  { icon: "school", title: "Elite Pedagogy", desc: "Conceptual deep-dives led by IITians and Doctors with decades of teaching excellence." },
  { icon: "edit_square", title: "Daily Practice", desc: "Structured DPP sheets and weekly mock tests to build exam-ready reflexes." },
  { icon: "timer", title: "War-Room Tests", desc: "Simulated exam environments under real pressure to train mental resilience." },
  { icon: "analytics", title: "AI Analytics", desc: "Data-driven performance tracking to identify and patch every academic gap." },
  { icon: "home", title: "Premium Hostel", desc: "Separate, disciplined residential campuses for boys and girls." },
  { icon: "groups", title: "Small Batches", desc: "Strict student-to-teacher ratios for personalized attention every session." },
];

const faqs = [
  { q: "What is the admission process for 2026?", a: "Fill the online inquiry form, attend a counseling session, and take our basic aptitude test to find the best batch for your profile." },
  { q: "Do you have separate hostels for boys and girls?", a: "Yes — fully secured, separate residential blocks with 24/7 supervision, healthy meals, and a disciplined deeni environment." },
  { q: "Is scholarship available?", a: "Yes. We offer up to 100% scholarships through the Rankers' Talent Hunt exam based on merit and financial need." },
  { q: "How do deeni values fit with academic coaching?", a: "We maintain dedicated prayer times and moral education alongside academics — producing toppers who are grounded in character." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const c0 = useCountUp(stats[0].value, 2000, statsVisible);
  const c1 = useCountUp(stats[1].value, 2000, statsVisible);
  const c2 = useCountUp(stats[2].value, 2000, statsVisible);
  const c3 = useCountUp(stats[3].value, 2000, statsVisible);
  const counts = [c0, c1, c2, c3];

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white overflow-x-hidden font-sans">
      <Header transparent={true} />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="/campus.png" alt="" className="w-full h-full object-cover opacity-20 scale-110" style={{animation:"slowZoom 25s ease-in-out infinite alternate"}} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/40 via-[#0a0a0f]/70 to-[#0a0a0f]" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Admissions Open · Batch Starting 2nd May 2026
          </div>

          <h1 className="text-6xl sm:text-8xl lg:text-[120px] font-black leading-[0.88] tracking-tighter mb-8">
            ELEVATE TO<br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 bg-clip-text text-transparent">RANKERS.</span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            West Bengal's premier residential coaching institute for <span className="text-white font-bold">NEET</span> &amp; <span className="text-white font-bold">JEE</span> aspirants — where discipline meets excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="group h-16 px-10 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl shadow-amber-500/25">
              Begin Application
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
            <Link href="/courses" className="h-16 px-10 border border-white/15 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 backdrop-blur-sm transition-all">
              <span className="material-symbols-outlined">school</span>
              Explore Courses
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 flex flex-col items-center gap-2 opacity-40">
            <span className="text-[9px] uppercase tracking-[0.4em]">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ── */}
      <section ref={statsRef} className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className="group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{s.label}</p>
              <p className="text-5xl md:text-6xl font-black text-amber-500 mb-1 tabular-nums group-hover:scale-105 transition-transform">{counts[i]}{s.suffix}</p>
              <div className="w-8 h-0.5 bg-amber-500/30 mx-auto mt-3" />
            </div>
          ))}
        </div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="py-28 px-6 bg-[#0d0d14] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"radial-gradient(circle, #f59e0b 1px, transparent 1px)",backgroundSize:"40px 40px"}} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-amber-500 font-black uppercase text-[10px] tracking-[0.4em]">Our Pedagogy</span>
            <h2 className="text-4xl md:text-6xl font-black mt-3">The Rankers' <span className="text-amber-500 italic">Edge.</span></h2>
            <p className="text-white/30 mt-4 max-w-xl mx-auto">A multi-pillar system engineered to produce consistent top performers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-amber-500/30 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <h4 className="font-black text-white text-lg mb-3 uppercase tracking-wide">{f.title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="py-28 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-amber-600 font-black uppercase text-[10px] tracking-[0.4em]">Enrolment 2026-27</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mt-2 leading-tight">Structured<br />Training Tracks.</h2>
            </div>
            <Link href="/courses" className="px-8 py-4 bg-slate-900 text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl">
              View All Curriculums
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "NEET Elite", tag: "Pre-Medical", desc: "Intensive 2-year integrated program for class XI & XII focused on Biology, Physics & Chemistry mastery.", color: "from-slate-900 to-slate-800", accent: "text-amber-400" },
              { name: "JEE Prime", tag: "Engineering", desc: "Advanced Mathematics & Physics curriculum designed for top-tier IIT/NIT engineering aspirations.", color: "from-amber-600 to-amber-500", accent: "text-white" },
              { name: "Crash Course", tag: "45-Day Sprint", desc: "Strategic rapid-revision program for students targeting immediate entrance exam excellence.", color: "from-amber-500 to-amber-400", accent: "text-slate-900" },
            ].map((c, i) => (
              <div key={i} className={`bg-gradient-to-br ${c.color} rounded-3xl p-8 text-white flex flex-col justify-between min-h-[320px] hover:-translate-y-2 transition-all duration-500 shadow-xl`}>
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${c.accent} opacity-70`}>{c.tag}</span>
                  <h4 className="text-3xl font-black mt-3 mb-4">{c.name}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{c.desc}</p>
                </div>
                <Link href="/apply" className="mt-8 w-full h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
                  Enquire Now →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6 bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-amber-500 font-black uppercase text-[10px] tracking-[0.4em]">Success Stories</span>
            <h2 className="text-4xl md:text-6xl font-black mt-3">Voice of Our <span className="text-amber-500 italic">Achievers.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Zaid Ali", rank: "AIR 45 · NEET 2024", text: "The discipline at Rankers' is unmatched. Faculty didn't just teach biology — they taught me to think under pressure." },
              { name: "Sara Sheikh", rank: "IIT Bombay · 2024", text: "Transitioning from boards to JEE was seamless thanks to the structured curriculum and the focused hostel environment." },
              { name: "Omar Farooq", rank: "99.9 Percentile · JEE", text: "The mock tests and personalized doubt sessions were the key. I walked into the exam hall with zero anxiety." },
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl border border-white/8 bg-white/[0.04] hover:border-amber-500/30 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-5">
                    {"★★★★★".split("").map((s, j) => <span key={j} className="text-sm">{s}</span>)}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed italic">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/8">
                  <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black">{t.name[0]}</div>
                  <div>
                    <p className="font-black text-sm text-white">{t.name}</p>
                    <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest">{t.rank}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPUS GALLERY ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="text-amber-600 font-black uppercase text-[10px] tracking-[0.4em]">Campus Experience</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mt-2 leading-tight">Beyond the<br />Classroom.</h2>
            </div>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">State-of-the-art infrastructure meets a disciplined, peaceful academic ecosystem in Diamond Harbour.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[500px] md:h-[700px]">
            <div className="md:col-span-7 rounded-3xl relative overflow-hidden group">
              <img src="/campus.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Campus" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="text-white text-2xl font-black">Modern Residential Campus</p>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mt-1">Diamond Harbour, South 24 Pgs</p>
              </div>
            </div>
            <div className="md:col-span-5 grid grid-rows-2 gap-4">
              <div className="rounded-3xl relative overflow-hidden group">
                <img src="/library.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Library" />
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-bold text-sm p-6 text-center backdrop-blur-sm">
                  Well-stocked library for deep-focus study sessions.
                </div>
              </div>
              <div className="rounded-3xl relative overflow-hidden group bg-amber-500">
                <img src="/dining.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Dining" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-bold text-sm p-6 text-center backdrop-blur-sm">
                  Hygienic, nutritious meals designed for student wellbeing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-28 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Got Questions?</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3">Frequently Asked <span className="text-amber-600">Questions.</span></h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-slate-50 transition-colors">
                  <span className="font-black text-slate-800">{faq.q}</span>
                  <span className={`material-symbols-outlined text-amber-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden p-12 md:p-20 shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <img src="/success.png" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-[80px]" />
            <div className="relative z-10 max-w-2xl">
              <span className="text-amber-500 font-black uppercase text-[10px] tracking-[0.4em]">Join the Legacy</span>
              <h2 className="text-4xl md:text-7xl font-black text-white mt-4 leading-tight">Trust Built on <br /><span className="text-amber-500 italic">Proven Results.</span></h2>
              <p className="text-white/40 mt-6 text-lg leading-relaxed">Join thousands of students who transformed their futures through Rankers' Platform since 2015.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link href="/apply" className="px-8 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all text-center">
                  Apply Now →
                </Link>
                <Link href="/results" className="px-8 py-4 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all text-center">
                  View Wall of Fame
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* WhatsApp FAB */}
      <a href="https://wa.me/918388022153" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[150] w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 hover:scale-110 transition-all group">
        <span className="material-symbols-outlined text-white text-3xl">chat</span>
        <div className="absolute right-full mr-4 px-4 py-2 bg-white text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-slate-100">
          Chat with Counselor
        </div>
      </a>

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
