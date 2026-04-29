"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({ token, newPassword });
      alert("Password reset successfully! Please login with your new password.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-4" />
          <h1 className="text-2xl font-black text-primary tracking-tighter">Set New Password</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Use the token you received to set a new password</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Reset Token</label>
            <input 
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-black tracking-widest text-center"
              placeholder="PASTE TOKEN HERE"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New Password</label>
            <input 
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Complete Password Reset"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
