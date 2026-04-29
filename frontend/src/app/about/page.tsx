"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-slate-950 py-20 px-6 md:px-12 text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Our Legacy of Excellence</h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Founded in 2015, Rankers' Platform was established with a singular vision: to bridge the gap between traditional deeni values and modern competitive academic excellence.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
              <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">visibility</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Our Vision</h3>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">To be the global benchmark for value-integrated education, where academic brilliance and moral integrity go hand in hand.</p>
            </div>
            <div className="p-8 bg-slate-950 text-white rounded-[2.5rem] space-y-4 shadow-2xl shadow-slate-950/20">
              <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-amber-500">Our Mission</h3>
              <p className="text-white/70 font-medium text-sm md:text-base leading-relaxed">Empowering every student with structured pedagogy, advanced technology, and a disciplined environment to secure top ranks.</p>
            </div>
          </div>

          <section className="py-24 border-t border-slate-100">
            <div className="text-center mb-16 space-y-4">
              <span className="text-amber-600 font-black uppercase text-[10px] tracking-[0.4em]">Infrastructure</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">Elite Facilities.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: "Residential Campus", img: "/campus.png", desc: "Premium hostels with separate blocks for boys and girls." },
                 { title: "Digital Library", img: "/library.png", desc: "A quiet, well-stocked resource center for self-study." },
                 { title: "Dining Excellence", img: "/dining.png", desc: "Hygienic and nutritious meals prepared by expert chefs." }
               ].map((item, i) => (
                 <div key={i} className="group space-y-6">
                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative">
                       <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                       <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors"></div>
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">{item.title}</h4>
                       <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="py-24 border-t border-slate-100">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 relative">
                   <div className="aspect-video bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-5xl">play_arrow</span>
                         </div>
                      </div>
                      <div className="absolute bottom-8 left-8 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                         <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Enterprise Suite</p>
                         <p className="text-white text-sm font-bold">Parent & Student Portal</p>
                      </div>
                   </div>
                </div>
                <div className="order-1 lg:order-2 space-y-8">
                   <div className="space-y-4">
                      <span className="text-amber-600 font-black uppercase text-[10px] tracking-[0.4em]">Future-Ready Campus</span>
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Digital Transparency <br/>for Parents.</h2>
                   </div>
                   <p className="text-slate-500 font-medium text-lg leading-relaxed">
                      Our advanced ERP suite ensures that parents stay connected with their child's progress in real-time. From attendance to test analytics, everything is a click away.
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      {[
                        { title: "Real-time Attendance", icon: "how_to_reg" },
                        { title: "Performance Analytics", icon: "query_stats" },
                        { title: "Digital Fee Portal", icon: "payments" },
                        { title: "Instant Notifications", icon: "notifications_active" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <span className="material-symbols-outlined text-amber-500">{item.icon}</span>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{item.title}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </section>

          <section className="py-12 border-t border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-12">Why "Rankers' Platform"?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: "Expert Mentorship", text: "Our faculty consists of IITians and Doctors who understand the pulse of competitive exams.", icon: "school" },
                 { title: "Deeni Environment", text: "Located Near Diamond Harbour Court, providing a peaceful atmosphere for focused study.", icon: "mosque" },
                 { title: "Personalized Growth", text: "With limited batch sizes, every student receives the individual attention they deserve.", icon: "person" }
               ].map((item, idx) => (
                 <div key={idx} className="space-y-4">
                   <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">{item.icon}</span>
                   </div>
                   <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">{item.title}</h4>
                   <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
