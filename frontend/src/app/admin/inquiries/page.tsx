"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { inquiryApi } from "@/lib/api";

export default function InquiryDashboard() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await inquiryApi.getAll();
      setInquiries(res.data);
    } catch (err) {
      console.error("Failed to fetch inquiries", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await inquiryApi.updateStatus(id, status);
      fetchInquiries();
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await inquiryApi.delete(id);
      fetchInquiries();
    } catch (err) { alert("Delete failed"); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight mr-auto">Admission Inquiries</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800">{inq.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{inq.phone} • {inq.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {inq.courseInterest}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={inq.status} 
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                        className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-3 py-1 outline-none ${
                          inq.status === 'NEW' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          inq.status === 'CONTACTED' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="REGISTERED">Registered</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(inq.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/students/add?inquiryId=${inq.id}`} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">person_add</span>
                        </Link>
                        <button onClick={() => handleDelete(inq.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inquiries.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold">No inquiries yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}
