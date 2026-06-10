"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const studentMenu = [
  { icon: "luggage",       label: "Apply for Leave",    href: "/leave-apply",  desc: "Submit a leave application" },
  { icon: "manage_search", label: "Track Leave Status", href: "/leave-status", desc: "Check application status" },
  { icon: "bar_chart",     label: "My Results",         href: "/results",      desc: "View your exam results" },
];

export default function Header({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transparent) { setScrolled(true); return; }
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setStudentMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { name: "About",   href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Results", href: "/results" },
    { name: "Faculty", href: "/faculty" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 h-[72px] flex items-center px-6 md:px-10 z-[100] transition-all duration-500 ${
        scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
      }`}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105" />
          <div className="hidden sm:block">
            <p className="text-base font-black tracking-tight leading-none text-amber-500">RANKERS'</p>
            <p className="text-[7px] font-black uppercase tracking-[0.35em] text-white/50 mt-0.5">PLATFORM</p>
          </div>
        </Link>

        {/* Desktop Nav — centered */}
        <nav className="hidden lg:flex items-center gap-6 mx-auto">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65 hover:text-amber-400 transition-colors whitespace-nowrap">
              {link.name}
            </Link>
          ))}

          <Link href="/apply"
            className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 hover:text-white transition-colors whitespace-nowrap">
            Admissions
          </Link>

          {/* Students Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setStudentMenuOpen(!studentMenuOpen)}
              className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] transition-colors whitespace-nowrap ${
                studentMenuOpen ? "text-amber-400" : "text-white/65 hover:text-amber-400"
              }`}>
              Students
              <span className={`material-symbols-outlined text-base leading-none transition-transform duration-200 ${studentMenuOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>

            {studentMenuOpen && (
              <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-68 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[200]">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student & Guardian Portal</p>
                </div>
                {studentMenu.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setStudentMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-primary/5 transition-colors group border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-base">{item.icon}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-black text-slate-900 text-xs">{item.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-xs group-hover:text-primary transition-colors flex-shrink-0">arrow_forward_ios</span>
                  </Link>
                ))}
                <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 flex items-center justify-between gap-4">
                  <p className="text-[9px] font-bold text-amber-700 whitespace-nowrap">📞 Need help?</p>
                  <a href="tel:+918436571588" className="text-[9px] font-black text-amber-700 hover:underline whitespace-nowrap">+91 84365 71588</a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-2.5 ml-auto lg:ml-0 flex-shrink-0">
          <Link href="/login"
            className="hidden sm:inline-flex items-center h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/25 hover:bg-white/10 transition-all whitespace-nowrap">
            Login
          </Link>
          <Link href="/apply"
            className="inline-flex items-center h-9 px-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/25 hover:bg-white transition-all active:scale-95 whitespace-nowrap">
            Apply Now
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-white flex-shrink-0">
            <span className="material-symbols-outlined text-xl">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[90] bg-slate-950 transition-transform duration-500 lg:hidden ${mobileMenuOpen ? "translate-y-0" : "-translate-y-full"} overflow-y-auto`}>
        <div className="flex flex-col items-center justify-start min-h-full gap-5 p-10 pt-28">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-black uppercase tracking-[0.2em] text-white hover:text-amber-500 transition-colors">
              {link.name}
            </Link>
          ))}
          <Link href="/apply" onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-black uppercase tracking-[0.2em] text-amber-500">
            Admissions
          </Link>

          <div className="w-full border-t border-white/10 pt-5 mt-2">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest text-center mb-4">Student & Guardian</p>
            {studentMenu.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-white/5 transition-colors mb-1.5">
                <div className="w-9 h-9 bg-white/10 text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                </div>
                <div>
                  <p className="font-black text-white text-sm">{item.label}</p>
                  <p className="text-[9px] text-white/40">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-4 w-full px-10">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center h-12 w-full rounded-full border border-white/20 text-white font-black uppercase tracking-widest text-sm">
              Student Login
            </Link>
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center h-12 w-full rounded-full border border-white/5 text-slate-400 hover:text-white hover:border-white/20 font-black uppercase tracking-widest text-sm transition-all">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
