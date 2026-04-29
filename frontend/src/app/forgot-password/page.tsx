"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.forgotPassword({ email });
      setMessage("A recovery token has been sent to your registered email address.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-4" />
          <h1 className="text-2xl font-black text-primary tracking-tighter">Recover Access</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Enter your email to receive a password reset token</p>
        </div>

        {message && (
          <div className="mb-6 p-6 bg-emerald-50 text-emerald-700 rounded-2xl text-center border border-emerald-100">
            <span className="material-symbols-outlined text-4xl mb-3 block">mark_email_read</span>
            <p className="text-sm font-bold leading-relaxed">{message}</p>
            <Link href="/reset-password" name="reset-password-btn" className="mt-6 inline-block w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              I have my token
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Generate Reset Token"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
