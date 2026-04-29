"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { studentApi } from "@/lib/api";

export default function EditStudent() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  const fetchStudent = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getById(params.id as string);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch student", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await studentApi.update(params.id as string, formData);
      alert("Student updated successfully!");
      router.push(`/admin/students/${params.id}`);
    } catch (err) {
      alert("Failed to update student");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href={`/admin/students/${params.id}`} className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Edit Student Profile</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6 mt-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name (User)</label>
                <input 
                  type="text" 
                  value={formData.user.name} 
                  disabled
                  className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                <textarea 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary h-32"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Name</label>
                <input 
                  type="text" 
                  value={formData.guardianName} 
                  onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Name</label>
                <input 
                  type="text" 
                  value={formData.schoolName} 
                  onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-primary text-white px-10 h-12 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
