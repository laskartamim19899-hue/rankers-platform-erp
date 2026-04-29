"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { studentApi, academicApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const admissionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  guardianName: z.string().min(2, "Guardian name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string(),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Full address is required"),
  schoolName: z.string().min(2, "Previous school name is required"),
  madhyamikMarks: z.string().min(1, "Madhyamik marks required"),
  hsMarksPhysics: z.string().optional(),
  hsMarksChemistry: z.string().optional(),
  hsMarksBiology: z.string().optional(),
  prevNeetMarks: z.string().optional(),
  courseId: z.string().optional(),
  batchId: z.string().min(1, "Target Batch is required"),
  isResidential: z.boolean().default(false),
  academicFee: z.string().min(1, "Academic fee is required"),
  monthlyHostelFee: z.string().optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

export default function AdmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await academicApi.getBatches();
        setBatches(res.data);
      } catch (err) {
        console.error("Failed to fetch batches", err);
      }
    };
    fetchBatches();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      gender: "Male",
      isResidential: false,
    },
  });

  const isResidential = watch("isResidential");

  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await studentApi.create({
        ...data,
        batchId: data.batchId
      });
      alert("Registration Successful! Student added to database.");
      router.push("/admin/students");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-inter">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 h-20 flex items-center px-8 sticky top-0 z-50">
        <Link href="/admin/students" className="mr-6 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain mr-6" />
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">Official Registration</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Office Use Only • Direct Enrollment</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Personal & Academic */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Section: Personal Info */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Student Personal Record
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</label>
                    <input {...register("name")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="Enter full name" />
                    {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Name</label>
                    <input {...register("guardianName")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="Father/Mother name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone / WhatsApp</label>
                    <input {...register("phone")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="10-digit number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input {...register("email")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                    <input type="date" {...register("dob")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                    <select {...register("gender")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none bg-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Address</label>
                    <textarea {...register("address")} className="w-full p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none h-24" placeholder="Full address..." />
                  </div>
                </div>
              </div>

              {/* Section: Academic Background */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                  Academic Records
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last School Name</label>
                    <input {...register("schoolName")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Madhyamik Score (%)</label>
                    <input {...register("madhyamikMarks")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="Overall %" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prev NEET Marks</label>
                    <input {...register("prevNeetMarks")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="Optional" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">HS Science Marks (Optional)</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-300">Physics</label><input {...register("hsMarksPhysics")} className="w-full h-10 px-3 rounded-lg border border-slate-100 bg-slate-50 font-bold" /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-300">Chemistry</label><input {...register("hsMarksChemistry")} className="w-full h-10 px-3 rounded-lg border border-slate-100 bg-slate-50 font-bold" /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-300">Biology</label><input {...register("hsMarksBiology")} className="w-full h-10 px-3 rounded-lg border border-slate-100 bg-slate-50 font-bold" /></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Enrollment & Fees */}
            <div className="space-y-8">
              
              {/* Section: Batch Selection */}
              <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/20">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Program Enrollment
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-60">Target Batch</label>
                    <select 
                      {...register("batchId")}
                      className="w-full h-12 px-4 rounded-xl bg-white/20 border border-white/20 font-black outline-none focus:bg-white focus:text-primary transition-all appearance-none"
                    >
                      <option value="">Select Batch...</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.course?.name})</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl">
                    <input type="checkbox" {...register("isResidential")} id="res" className="w-5 h-5 rounded border-none bg-white/20 text-white" />
                    <label htmlFor="res" className="text-xs font-black">Residential (Hostel)</label>
                  </div>
                </div>
              </div>

              {/* Section: Financial setup */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  Financial Setup
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Academic Fee (₹)</label>
                    <input type="number" {...register("academicFee")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-black text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Total package amount" />
                  </div>
                  {isResidential && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Hostel Fee (₹)</label>
                      <input type="number" {...register("monthlyHostelFee")} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-black text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Per month" />
                    </div>
                  )}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-tight leading-relaxed">
                      * Fees will be allocated automatically upon admin approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Complete Admission"}
              </button>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

