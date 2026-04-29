"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/api";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEACHER"
  });

  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    fetchStaff();
  }, [router]);

  const fetchStaff = async () => {
    try {
      const res = await userApi.getStaff();
      setStaff(res.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.createStaff(formData);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "TEACHER" });
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create staff account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await userApi.deleteStaff(id);
      fetchStaff();
    } catch (err) {
      alert("Failed to delete staff member");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-inter pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-primary tracking-tight">Staff & Roles</h1>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button 
            onClick={() => setShowModal(true)}
            className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add New Staff
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary border border-slate-200">
                  {member.name[0]}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    member.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                    member.role === 'ACCOUNTANT' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{member.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{member.email}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added {new Date(member.createdAt).toLocaleDateString()}</span>
                  {currentUser?.role === "SUPER_ADMIN" && (
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-primary tracking-tight">Create Staff Account</h2>
              <button onClick={() => setShowModal(false)} className="material-symbols-outlined text-slate-400">close</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                  placeholder="e.g. Dr. Salman Khan"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Address</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                  placeholder="name@rankersplatform.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Login Password</label>
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                  placeholder="Min. 8 characters"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Assign Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TEACHER', 'ACCOUNTANT', 'ADMIN'].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.role === role ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200 hover:border-primary'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? "Creating Account..." : "Confirm & Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
