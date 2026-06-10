"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const typeParam = searchParams.get('type');
    if (typeParam === 'staff') {
      setLoginType('staff');
    }
  }, [searchParams]);

  // When switching tabs, clear errors and inputs (optional)
  const handleTabSwitch = (type: 'student' | 'staff') => {
    setLoginType(type);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      
      // Strict Role Check based on active tab
      if (loginType === 'student') {
        if (user.role !== "STUDENT") {
          setError("Management Access Detected. Please use the Staff Terminal.");
          setIsLoading(false);
          return;
        }
      } else {
        if (user.role === "STUDENT") {
          setError("Unauthorized Access. This portal is for Management & Staff only.");
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;

      if (loginType === 'student') {
        router.push("/student/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const isStudent = loginType === 'student';

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden transition-colors duration-700 ${isStudent ? 'bg-slate-50' : 'bg-[#0a0a0b]'}`}>
      
      {/* Background Elements */}
      {isStudent ? (
        <div className="absolute inset-0 z-0 transition-opacity duration-700 opacity-100">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px]"></div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 transition-opacity duration-700 opacity-100">
          <div className="absolute inset-0 z-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }}>
          </div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        </div>
      )}

      <div className={`relative z-10 w-full max-w-[480px] transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
        
        {/* Toggle Switch */}
        <div className={`flex items-center p-1.5 mb-8 rounded-full border transition-colors duration-500 mx-auto w-max ${isStudent ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.03] border-white/10 backdrop-blur-xl'}`}>
          <button 
            onClick={() => handleTabSwitch('student')}
            className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isStudent ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
            Student
          </button>
          <button 
            onClick={() => handleTabSwitch('staff')}
            className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!isStudent ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>
            Staff
          </button>
        </div>

        <div className={`border rounded-[48px] p-10 md:p-12 transition-all duration-700 ${isStudent ? 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50' : 'backdrop-blur-2xl bg-white/[0.02] border-white/5 shadow-3xl'}`}>
          
          <div className="flex flex-col items-center mb-10 text-center">
             {isStudent ? (
               <>
                 <div className="w-20 h-20 bg-indigo-50 rounded-3xl p-4 mb-6 border border-indigo-100 shadow-sm transition-all">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Student Login</h1>
                 <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Your Academic Portal Awaits</p>
               </>
             ) : (
               <>
                 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 transition-all">
                    <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
                 </div>
                 <h1 className="text-3xl font-black text-white tracking-tighter text-center mb-2">ERP Command Center</h1>
                 <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Management & Staff Authorization</p>
               </>
             )}
          </div>

          {error && (
            <div className={`mb-8 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 transition-colors ${isStudent ? 'bg-amber-50 border border-amber-100 text-amber-700' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              <span className="material-symbols-outlined text-[18px]">
                {error.includes('Management') || error.includes('Unauthorized') ? 'lock_person' : 'error'}
              </span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase px-2 ${isStudent ? 'text-slate-400 tracking-[0.2em]' : 'text-slate-500 tracking-widest'}`}>
                {isStudent ? 'Registered Email' : 'Admin Email'}
              </label>
              <div className="relative">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${isStudent ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-14 md:h-16 pl-14 pr-6 rounded-2xl md:rounded-3xl font-bold outline-none transition-all ${isStudent ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white placeholder:text-slate-300' : 'bg-white/[0.03] border border-white/10 text-white focus:border-indigo-500/50 focus:bg-white/[0.05] placeholder:text-slate-600'}`}
                  placeholder={isStudent ? "john@example.com" : "admin@rankers.edu"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className={`text-[10px] font-black uppercase ${isStudent ? 'text-slate-400 tracking-[0.2em]' : 'text-slate-500 tracking-widest'}`}>Password</label>
                {isStudent && (
                  <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Forgot?</Link>
                )}
              </div>
              <div className="relative">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${isStudent ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="material-symbols-outlined">key</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-14 md:h-16 pl-14 pr-16 rounded-2xl md:rounded-3xl font-bold outline-none transition-all ${isStudent ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white placeholder:text-slate-300' : 'bg-white/[0.03] border border-white/10 text-white focus:border-indigo-500/50 focus:bg-white/[0.05] placeholder:text-slate-600'}`}
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${isStudent ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 mt-10 ${isStudent ? 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100' : 'bg-white text-slate-950 hover:bg-indigo-50'}`}
            >
              {isLoading ? (
                <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isStudent ? 'border-white/30 border-t-white' : 'border-slate-950/30 border-t-slate-950'}`} />
              ) : (
                <>
                  {isStudent ? 'Enter Portal' : 'Access Terminal'}
                  <span className="material-symbols-outlined">{isStudent ? 'chevron_right' : 'vpn_key'}</span>
                </>
              )}
            </button>
          </form>

          {isStudent && (
            <div className="mt-12 text-center border-t border-slate-50 pt-8">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                New Student?{" "}
                <Link href="/admission" className="text-indigo-600 hover:underline ml-2">
                  Apply for Admission
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Global Footer / Support Links */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
           <Link href="/" className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isStudent ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-white'}`}>
              Back to Home
           </Link>
           <Link href="/support" className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isStudent ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-white'}`}>
              Technical Support & Helpdesk
           </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b]" />}>
      <LoginContent />
    </Suspense>
  );
}
