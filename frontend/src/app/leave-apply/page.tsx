"use client";

import { useState } from "react";
import Link from "next/link";
import { leaveApi } from "@/lib/api";

export default function LeaveApplicationPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    regNo: "",
    guardianName: "",
    guardianPhone: "",
    reason: "",
    destination: "",
    startDate: "",
    endDate: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("Return date cannot be before departure date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await leaveApi.apply(form);
      setResult(res.data);
      setStep("success");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 flex flex-col">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 text-white/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">school</span>
          </div>
          <span className="font-black text-white tracking-tight">Rankers' Platform</span>
        </div>
        <Link href="/" className="text-xs font-bold hover:text-white transition-colors">← Back to Home</Link>
      </nav>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {step === "form" ? (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-slate-800 px-8 py-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">luggage</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">Leave Application</h1>
                    <p className="text-sm opacity-70">For Students of Rankers' Platform</p>
                  </div>
                </div>
                <p className="text-xs bg-white/10 rounded-xl p-3 font-medium opacity-90">
                  📋 Fill in all the details below. Your application will be reviewed by the admin and you will be notified.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Registration Number */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Student Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RP-2026-0001"
                    value={form.regNo}
                    onChange={e => f("regNo", e.target.value.toUpperCase())}
                    className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-bold text-slate-800 transition-all font-mono"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Found on your admission card or ID card</p>
                </div>

                {/* Guardian Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Father / Mother name"
                      value={form.guardianName}
                      onChange={e => f("guardianName", e.target.value)}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Guardian Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={form.guardianPhone}
                      onChange={e => f("guardianPhone", e.target.value)}
                      maxLength={10}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800 transition-all"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Departure Date *</label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={form.startDate}
                      onChange={e => f("startDate", e.target.value)}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-bold text-slate-800 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Return Date *</label>
                    <input
                      type="date"
                      required
                      min={form.startDate || today}
                      value={form.endDate}
                      onChange={e => f("endDate", e.target.value)}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-bold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                {/* Days badge */}
                {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
                    <span className="material-symbols-outlined text-primary text-lg">event</span>
                    <p className="text-sm font-black text-primary">
                      {Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s) of leave
                    </p>
                  </div>
                )}

                {/* Destination */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Destination / Going To *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home — Kolkata, West Bengal"
                    value={form.destination}
                    onChange={e => f("destination", e.target.value)}
                    className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800 transition-all"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Reason for Leave *</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {["Medical Emergency", "Family Function", "Personal Work"].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => f("reason", r)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${form.reason === r ? "border-primary bg-primary text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the reason in detail..."
                    value={form.reason}
                    onChange={e => f("reason", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800 resize-none transition-all"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    <p className="text-sm font-bold text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
                >
                  {isSubmitting
                    ? <><span className="animate-spin material-symbols-outlined">progress_activity</span> Submitting...</>
                    : <><span className="material-symbols-outlined">send</span> Submit Application</>
                  }
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                  By submitting, you confirm all information is accurate. False applications may result in disciplinary action.
                </p>
              </form>
            </div>

          ) : (
            /* Success State */
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <span className="material-symbols-outlined text-emerald-600 text-5xl">check_circle</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900">Application Submitted!</h2>
              <p className="text-slate-500 mt-2">Your leave request is under review.</p>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mt-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Application ID</span>
                  <span className="font-black text-primary text-xs font-mono">{result?.applicationId?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Student</span>
                  <span className="font-black text-slate-800 text-sm">{result?.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Status</span>
                  <span className="font-black text-amber-600 bg-amber-100 px-3 py-0.5 rounded-full text-[10px] uppercase">Pending Review</span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-blue-700">
                  📞 The admin will contact you on the provided phone number once the application is reviewed. Please keep your phone reachable.
                </p>
              </div>

              <button
                onClick={() => { setStep("form"); setForm({ regNo: "", guardianName: "", guardianPhone: "", reason: "", destination: "", startDate: "", endDate: "" }); setResult(null); }}
                className="mt-8 w-full h-12 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Submit Another Application
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-white/40 text-[10px] font-bold">
        © {new Date().getFullYear()} Rankers' Platform — ERP System
      </footer>
    </div>
  );
}
