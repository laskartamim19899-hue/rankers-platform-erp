"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { studentApi, academicApi, inquiryApi } from "@/lib/api";

export default function AddStudent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get("inquiryId");

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "welcome123", // default password
    phone: "",
    address: "",
    gender: "Male",
    dob: "",
    guardianName: "",
    schoolName: "",
    madhyamikMarks: "",
    prevNeetMarks: "",
    isResidential: "false",
    primaryCourseId: "",
    academicFee: "",
    monthlyHostelFee: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const courseRes = await academicApi.getCourses();
      setCourses(courseRes.data);

      if (inquiryId) {
        // Fetch inquiry to auto-fill
        const inqRes = await inquiryApi.getAll();
        const inquiry = inqRes.data.find((i: any) => i.id === inquiryId);
        if (inquiry) {
          setFormData(prev => ({
            ...prev,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            address: inquiry.address,
            gender: inquiry.gender,
            dob: new Date(inquiry.dob).toISOString().split('T')[0],
            guardianName: inquiry.guardianName,
            schoolName: inquiry.schoolName || "",
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryCourseId) {
      alert("Please select a course.");
      return;
    }
    
    setIsLoading(true);
    try {
      await studentApi.create({
        ...formData,
        madhyamikMarks: parseFloat(formData.madhyamikMarks) || 0,
        prevNeetMarks: formData.prevNeetMarks ? parseFloat(formData.prevNeetMarks) : null,
        isResidential: formData.isResidential === "true"
      });
      
      if (inquiryId) {
        await inquiryApi.updateStatus(inquiryId, 'REGISTERED');
      }
      
      alert("Student enrolled successfully!");
      router.push("/admin/students");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add student.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/inquiries" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight mr-auto">
          {inquiryId ? "Register from Inquiry" : "Enroll New Student"}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Name</label>
                <input required type="text" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email (Login ID)</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Academic Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous School Name</label>
                <input required type="text" value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Madhyamik Marks (%)</label>
                <input required type="number" step="0.1" value={formData.madhyamikMarks} onChange={(e) => setFormData({...formData, madhyamikMarks: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prev NEET Marks (Optional)</label>
                <input type="number" value={formData.prevNeetMarks} onChange={(e) => setFormData({...formData, prevNeetMarks: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Enrollment & Fees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Course Selection</label>
                <select required value={formData.primaryCourseId} onChange={(e) => setFormData({...formData, primaryCourseId: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors">
                  <option value="">Select a Course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Academic Fee</label>
                <input required type="number" value={formData.academicFee} onChange={(e) => setFormData({...formData, academicFee: e.target.value})} placeholder="e.g. 50000" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Is Residential Student?</label>
                <select value={formData.isResidential} onChange={(e) => setFormData({...formData, isResidential: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors">
                  <option value="false">No (Day Scholar)</option>
                  <option value="true">Yes (Hosteler)</option>
                </select>
              </div>
              {formData.isResidential === "true" && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Hostel Fee</label>
                  <input required type="number" value={formData.monthlyHostelFee} onChange={(e) => setFormData({...formData, monthlyHostelFee: e.target.value})} placeholder="e.g. 5000" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:border-primary transition-colors" />
                  <p className="text-[10px] text-slate-400">This generates 12 monthly fee slips.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {isLoading ? "Processing..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
