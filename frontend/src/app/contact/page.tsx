"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-slate-950 py-20 px-6 md:px-12 text-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Get in Touch</h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Our experts are ready to guide you towards your academic goals.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 py-20 md:py-32">
          <div className="space-y-12">
            <div className="space-y-10">
               <div className="flex gap-6 items-start">
                 <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                   <span className="material-symbols-outlined text-2xl">location_on</span>
                 </div>
                 <div>
                   <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Corporate Campus</h4>
                   <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">Near Diamond Harbour Court, Diamond Harbour, South 24 Pgs, 743331</p>
                 </div>
               </div>

               <div className="flex gap-6 items-start">
                 <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                   <span className="material-symbols-outlined text-2xl">call</span>
                 </div>
                 <div>
                   <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Admission Hotline</h4>
                   <div className="flex flex-col gap-1">
                     <p className="text-slate-500 font-medium">+91 84365 71588</p>
                     <a href="https://wa.me/918388022153" target="_blank" className="text-emerald-600 font-black flex items-center gap-2 hover:text-amber-500 transition-colors">
                       +91 83880 22153 (WhatsApp)
                       <span className="material-symbols-outlined text-xs">chat</span>
                     </a>
                   </div>
                 </div>
               </div>

               <div className="flex gap-6 items-start">
                 <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                   <span className="material-symbols-outlined text-2xl">mail</span>
                 </div>
                 <div>
                   <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Email Enquiries</h4>
                   <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed break-all">rankersplatformofficial@gmail.com</p>
                 </div>
               </div>
            </div>

            <div className="pt-12 border-t border-slate-100">
               <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-6">Office Hours</h5>
               <p className="text-slate-500 font-medium">Monday — Sunday: 10:00 AM to 5:00 PM</p>
            </div>
          </div>

          <div className="bg-slate-950 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl shadow-slate-950/20">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Your Name</label>
                  <input type="text" className="w-full h-14 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="e.g. Rahul" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="text" className="w-full h-14 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="+91..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" className="w-full h-14 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Your Message</label>
                <textarea className="w-full h-32 p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full h-16 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                Send Enquiry
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
