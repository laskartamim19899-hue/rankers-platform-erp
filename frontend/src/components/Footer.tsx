"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-24 pb-12 px-6 md:px-8 text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12 mb-24">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <img src="/logo.png" className="h-10 w-auto brightness-0 invert" />
            <h4 className="text-lg font-black text-amber-500 tracking-tighter">RANKERS' PLATFORM</h4>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            Empowering dreams through elite academic structures and deeni values. Rankers' Platform is more than an institution—it's a launchpad for future leaders.
          </p>
        </div>
        
        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Quick Navigation</h5>
          <div className="flex flex-col gap-4">
            {[
              { name: "About Us", href: "/about" },
              { name: "Our Faculty", href: "/faculty" },
              { name: "Course Catalog", href: "/courses" },
              { name: "Wall of Fame", href: "/results" },
              { name: "Admissions", href: "/apply" },
              { name: "Privacy Policy", href: "/privacy-policy" }
            ].map(link => (
              <Link key={link.name} href={link.href} className="text-sm font-medium text-white/40 hover:text-amber-500 transition-colors">{link.name}</Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Student & Guardian</h5>
          <div className="flex flex-col gap-4">
            <Link href="/leave-apply" className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-amber-500 transition-colors group">
              <span className="material-symbols-outlined text-sm group-hover:text-amber-500 text-white/20">luggage</span>
              Apply for Leave
            </Link>
            <Link href="/leave-status" className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-amber-500 transition-colors group">
              <span className="material-symbols-outlined text-sm group-hover:text-amber-500 text-white/20">manage_search</span>
              Track Leave Status
            </Link>
            <Link href="/results" className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-amber-500 transition-colors group">
              <span className="material-symbols-outlined text-sm group-hover:text-amber-500 text-white/20">bar_chart</span>
              Academic Results
            </Link>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-2">Guardian Helpline</p>
            <a href="tel:+918436571588" className="text-amber-400 font-black text-sm hover:text-amber-300 transition-colors">+91 84365 71588</a>
          </div>
        </div>

        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Contact Hub</h5>
          <div className="flex flex-col gap-4 text-sm font-medium text-white/40">
            <div className="flex gap-4 items-start">
              <span className="material-symbols-outlined text-amber-500">location_on</span>
              <span className="leading-relaxed">Near Diamond Harbour Court, Diamond Harbour, South 24 Pgs, 743331</span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="material-symbols-outlined text-amber-500">call</span>
              <div className="flex flex-col">
                <span>+91 84365 71588</span>
                <a href="https://wa.me/918388022153" target="_blank" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
                   +91 83880 22153
                   <span className="material-symbols-outlined text-xs">chat</span>
                </a>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="material-symbols-outlined text-amber-500">mail</span>
              <span className="break-all">rankersplatformofficial@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Social Pulse</h5>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=61574374902586" target="_blank" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer shadow-lg"><span className="material-symbols-outlined text-lg">share</span></a>
            <a href="https://www.instagram.com/rankersplatform?igsh=ZmswczZsbGN0ZWZm" target="_blank" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer shadow-lg"><span className="material-symbols-outlined text-lg">camera</span></a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">© 2026 RANKERS' PLATFORM. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-2 opacity-30 grayscale brightness-200">
           <span className="text-[10px] font-black uppercase tracking-widest mr-4 hidden sm:block">Technology Partner:</span>
           <img src="/next.svg" className="h-4 w-auto" />
        </div>
      </div>
    </footer>
  );
}
