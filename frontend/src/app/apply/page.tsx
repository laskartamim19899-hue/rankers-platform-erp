"use client";

import { useState } from "react";
import Link from "next/link";
import { inquiryApi } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicInquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    guardianName: "",
    dob: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    schoolName: "",
    courseInterest: "NEET"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inquiryApi.apply(formData);
      setSubmitted(true);
    } catch (err) {
      alert("Submission failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6 pt-32">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Application Received!</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Thank you for your interest in Rankers' Platform. Our academic counselors will contact you on 
              <span className="text-amber-600 font-black px-1"> {formData.phone} </span> 
              within 24 hours.
            </p>
            <Link href="/" className="block w-full py-4 bg-slate-950 text-amber-500 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl">Back to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto py-32 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start">
          
          {/* Info Side */}
          <div className="lg:col-span-2 space-y-8 pt-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                  Target NEET 2028
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  Target NEET 2027 (Freshers)
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">Start Your Journey to <span className="text-amber-500 italic">Success.</span></h2>
              <div className="text-slate-500 font-medium text-lg leading-relaxed space-y-2">
                <p>XI (Sc.) batch starts <span className="text-amber-600 font-black">2nd May 2026</span></p>
                <p>NEET Freshers starts <span className="text-slate-900 font-black">10th May 2026</span></p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              {[
                { icon: "verified", text: "Expert Faculty from Top Institutions" },
                { icon: "home_work", text: "Premium Residential Facilities" },
                { icon: "analytics", text: "Regular Performance Tracking" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-slate-950 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-950/20 space-y-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="space-y-1 relative z-10">
                <h3 className="text-2xl font-black text-amber-500">Admission Inquiry</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Complete the form for a priority callback</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Student Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Enter student name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Guardian Name</label>
                  <input required type="text" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Enter guardian name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer">
                    <option value="Male" className="bg-slate-900">Male</option>
                    <option value="Female" className="bg-slate-900">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="10-digit number" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="example@mail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Address</label>
                  <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="City, State" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Interested Course</label>
                  <select value={formData.courseInterest} onChange={(e) => setFormData({...formData, courseInterest: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer">
                    <option value="NEET" className="bg-slate-900">NEET</option>
                    <option value="JEE" className="bg-slate-900">JEE</option>
                    <option value="BOARD WITH NEET" className="bg-slate-900">BOARD WITH NEET</option>
                    <option value="CRASH COURSE" className="bg-slate-900">CRASH COURSE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 relative z-10">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all active:scale-[0.98] shadow-xl shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Inquiry..." : "Submit Application"}
                </button>
                <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">By submitting, you agree to our contact policy</p>
              </div>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
