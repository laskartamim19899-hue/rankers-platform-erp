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
  batchId: z.string().min(1, "Target Batch is required"),
  isResidential: z.boolean().default(false),
  academicFee: z.string().min(1, "Academic fee is required"),
  monthlyHostelFee: z.string().optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

export default function AdmissionForm() {
  const [step, setStep] = useState(1);
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
    trigger,
    formState: { errors },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      gender: "Male",
      isResidential: false,
    },
  });

  const isResidential = watch("isResidential");

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["name", "guardianName", "dob", "phone", "email", "address"];
    if (step === 2) fieldsToValidate = ["schoolName", "madhyamikMarks"];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await studentApi.create(data);
      alert("Application Submitted! Welcome to the platform.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-inter overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-50/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-emerald-50/50 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 h-24 flex items-center px-10 sticky top-0 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/login" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-white hover:shadow-lg">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Enrollment</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">New Academic Session 2024-25</p>
          </div>
        </div>
        <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain hidden md:block" />
      </header>

      <main className="relative z-10 max-w-4xl mx-auto p-6 mt-10">
        
        {/* Progress Bar */}
        <div className="mb-12 relative px-4">
           <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2"></div>
           <div className="absolute top-1/2 left-0 h-[2px] bg-indigo-600 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
           
           <div className="relative flex justify-between">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 z-10 ${step >= s ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                      {step > s ? <span className="material-symbols-outlined">check</span> : s}
                   </div>
                   <span className={`text-[10px] font-black uppercase mt-3 tracking-widest transition-colors ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {s === 1 ? 'Identity' : s === 2 ? 'Academic' : 'Enrollment'}
                   </span>
                </div>
              ))}
           </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 text-red-600 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined">error</span>
            </div>
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-[48px] border border-slate-200 p-10 md:p-16 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Personal Records</h2>
                  <p className="text-slate-500 font-medium">Tell us about yourself to begin your journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input {...register("name")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="John Doe" />
                    {errors.name && <p className="text-red-500 text-[10px] font-bold px-4">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Guardian Name</label>
                    <input {...register("guardianName")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="Father/Mother Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp Number</label>
                    <input {...register("phone")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="10-digit number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input {...register("email")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="name@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                    <input type="date" {...register("dob")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
                    <div className="flex gap-4">
                      {['Male', 'Female'].map(g => (
                         <label key={g} className="flex-grow">
                           <input type="radio" {...register("gender")} value={g} className="peer hidden" />
                           <div className="h-16 rounded-3xl border border-slate-200 bg-slate-50/50 flex items-center justify-center font-bold peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-700 cursor-pointer transition-all">
                             {g}
                           </div>
                         </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Permanent Address</label>
                    <textarea {...register("address")} className="w-full p-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none h-32" placeholder="Street, Village, Dist, State, PIN" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Previous Performance</h2>
                  <p className="text-slate-500 font-medium">We value your dedication and past achievements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Previous School/College</label>
                    <input {...register("schoolName")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="Enter school name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Madhyamik Score (%)</label>
                    <input {...register("madhyamikMarks")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="Overall percentage" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last NEET Score</label>
                    <input {...register("prevNeetMarks")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="Optional" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">H.S. Science Marks (Theory)</p>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2"><label className="text-[9px] font-black text-slate-400">Physics</label><input {...register("hsMarksPhysics")} className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold" /></div>
                      <div className="space-y-2"><label className="text-[9px] font-black text-slate-400">Chemistry</label><input {...register("hsMarksChemistry")} className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold" /></div>
                      <div className="space-y-2"><label className="text-[9px] font-black text-slate-400">Biology</label><input {...register("hsMarksBiology")} className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold" /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Enrollment */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Final Enrollment</h2>
                  <p className="text-slate-500 font-medium">Select your program and finalize registration.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Batch</label>
                    <select 
                      {...register("batchId")}
                      className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all appearance-none"
                    >
                      <option value="">Choose your batch...</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Academic Package (₹)</label>
                    <input type="number" {...register("academicFee")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="Proposed yearly fee" />
                  </div>
                  <div className="md:col-span-2">
                     <label className={`w-full p-8 rounded-[40px] border-2 transition-all cursor-pointer flex items-center gap-6 ${isResidential ? 'bg-indigo-50 border-indigo-600' : 'bg-slate-50/50 border-slate-200'}`}>
                        <input type="checkbox" {...register("isResidential")} className="hidden" />
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isResidential ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                           <span className="material-symbols-outlined">apartment</span>
                        </div>
                        <div className="flex-grow">
                           <h4 className={`font-black uppercase tracking-widest text-sm ${isResidential ? 'text-indigo-900' : 'text-slate-600'}`}>Apply for Residential Facility</h4>
                           <p className="text-xs text-slate-400 font-medium mt-1">Check this if you require hostel and mess services.</p>
                        </div>
                        {isResidential && <span className="material-symbols-outlined text-indigo-600">check_circle</span>}
                     </label>
                  </div>
                  {isResidential && (
                    <div className="md:col-span-2 space-y-2 animate-in slide-in-from-top-4 duration-300">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Hostel Fee (₹)</label>
                      <input type="number" {...register("monthlyHostelFee")} className="w-full h-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/50 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" placeholder="Monthly amount" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-16 flex items-center justify-between pt-10 border-t border-slate-100">
               {step > 1 ? (
                 <button 
                   type="button" 
                   onClick={prevStep}
                   className="h-16 px-10 rounded-3xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-3"
                 >
                   <span className="material-symbols-outlined">arrow_back</span>
                   Back
                 </button>
               ) : (
                 <div />
               )}

               {step < 3 ? (
                 <button 
                   type="button" 
                   onClick={nextStep}
                   className="h-16 px-12 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-200"
                 >
                   Continue
                   <span className="material-symbols-outlined">arrow_forward</span>
                 </button>
               ) : (
                 <button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="h-16 px-14 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
                 >
                   {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Complete Application'}
                   {!isSubmitting && <span className="material-symbols-outlined">verified</span>}
                 </button>
               )}
            </div>

          </form>
        </div>
      </main>

      <style jsx global>{`
        .animate-in {
          animation: 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .slide-in-from-right-8 {
          animation-name: slideInRight;
        }
        .slide-in-from-top-4 {
          animation-name: slideInTop;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(2rem); }
          to { transform: translateX(0); }
        }
        @keyframes slideInTop {
          from { transform: translateY(-1rem); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
