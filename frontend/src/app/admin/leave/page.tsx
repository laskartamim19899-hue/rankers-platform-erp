"use client";

import { useState, useEffect } from "react";
import { leaveApi, studentApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LeaveManagementPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"passes" | "applications">("applications");

  const [form, setForm] = useState({ studentId: "", reason: "", destination: "", startDate: "", endDate: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchData = async () => {
    try {
      const [leavesRes, studentsRes] = await Promise.all([leaveApi.getAll(), studentApi.getAll()]);
      setLeaves(leavesRes.data);
      setStudents(studentsRes.data.filter((s: any) => s.status === "APPROVED"));
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/login"); return; }
    setAdminName(JSON.parse(userStr).name);
    fetchData();
  }, [router]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await leaveApi.issue({ ...form, issuedBy: adminName });
      setLeaves([res.data, ...leaves]);
      setShowForm(false);
      setForm({ studentId: "", reason: "", destination: "", startDate: "", endDate: "", notes: "" });
      alert(`✅ Leave Pass Issued! Pass No: ${res.data.passNo}`);
    } catch (err: any) { alert(err.response?.data?.message || "Failed to issue leave"); }
    finally { setIsSubmitting(false); }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this leave application and issue pass?")) return;
    try {
      const res = await leaveApi.approve(id, { issuedBy: adminName });
      alert(`✅ ${res.data.message}`);
      setLeaves(leaves.map(l => l.id === id ? res.data.leave : l));
    } catch { alert("Failed to approve"); }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this application?")) return;
    try {
      await leaveApi.reject(id);
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: "REJECTED" } : l));
    } catch { alert("Failed to reject"); }
  };

  const handleMarkReturned = async (id: string) => {
    if (!confirm("Mark student as returned?")) return;
    try {
      await leaveApi.updateStatus(id, { status: "RETURNED", returnedAt: new Date().toISOString() });
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: "RETURNED", returnedAt: new Date() } : l));
    } catch { alert("Failed to update status"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this leave record permanently?")) return;
    try {
      await leaveApi.delete(id);
      setLeaves(leaves.filter(l => l.id !== id));
    } catch { alert("Failed to delete"); }
  };

  const pending = leaves.filter(l => l.status === "PENDING");
  const issued = leaves.filter(l => l.status !== "PENDING");

  const filteredIssued = issued.filter(l => {
    const matchStatus = filterStatus === "ALL" || l.status === filterStatus || (filterStatus === "APPROVED" && (l.status === "APPROVED"));
    const matchSearch = !searchTerm || l.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.passNo?.toLowerCase().includes(searchTerm.toLowerCase()) || l.student?.regNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (leave: any) => {
    if (leave.status === "RETURNED") return { label: "Returned", color: "bg-green-100 text-green-700" };
    if (leave.status === "REJECTED") return { label: "Rejected", color: "bg-red-100 text-red-700" };
    const now = new Date();
    if (new Date(leave.endDate) < now) return { label: "Overdue", color: "bg-red-100 text-red-700" };
    if (new Date(leave.startDate) <= now) return { label: "On Leave", color: "bg-amber-100 text-amber-700" };
    return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  };

  const onLeaveCount = issued.filter(l => {
    if (l.status === "RETURNED" || l.status === "REJECTED") return false;
    const now = new Date();
    return new Date(l.startDate) <= now && new Date(l.endDate) >= now;
  }).length;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600">luggage</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Leave Management</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Official Leave Pass System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/leave-apply"
            target="_blank"
            className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Public Form
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Issue Leave
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Passes</p>
            <p className="text-3xl font-black text-primary">{issued.length}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Currently Away</p>
            <p className="text-3xl font-black text-amber-600">{onLeaveCount}</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Overdue Return</p>
            <p className="text-3xl font-black text-red-600">
              {issued.filter(l => l.status !== "RETURNED" && l.status !== "REJECTED" && new Date(l.endDate) < new Date()).length}
            </p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">Returned</p>
            <p className="text-3xl font-black text-green-600">{issued.filter(l => l.status === "RETURNED").length}</p>
          </div>
          <div
            onClick={() => setActiveTab("applications")}
            className={`rounded-2xl border p-5 shadow-sm cursor-pointer transition-all ${pending.length > 0 ? "bg-orange-50 border-orange-300 animate-pulse" : "bg-white border-slate-200"}`}
          >
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Pending Review</p>
            <p className="text-3xl font-black text-orange-600">{pending.length}</p>
          </div>
        </div>

        {/* On leave alert */}
        {onLeaveCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-amber-600 text-3xl">warning</span>
            <p className="font-black text-amber-900">{onLeaveCount} student{onLeaveCount > 1 ? "s are" : " is"} currently away on approved leave.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "applications" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-sm">inbox</span>
            Guardian Applications
            {pending.length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab("passes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "passes" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-sm">luggage</span>
            Issued Passes
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900">Guardian Leave Applications</h2>
                <p className="text-xs text-slate-400 font-bold">Submitted via the public online form</p>
              </div>
              <Link href="/leave-apply" target="_blank" className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">open_in_new</span> Share Public Link
              </Link>
            </div>
            {pending.length === 0 ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-slate-200 text-5xl">inbox</span>
                <p className="text-slate-400 font-bold mt-4">No pending applications</p>
                <p className="text-xs text-slate-400">Share the public form link with guardians: <span className="font-black text-primary">/leave-apply</span></p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pending.map(app => (
                  <div key={app.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xl flex-shrink-0">
                          {app.student?.user?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{app.student?.user?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{app.student?.regNo}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">location_on</span>{app.destination}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
                              {new Date(app.startDate).toLocaleDateString("en-IN")} → {new Date(app.endDate).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 italic">"{app.reason}"</p>
                          <p className="text-[10px] text-primary font-bold mt-1">{app.issuedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Approve & Issue Pass
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Issued Passes Tab */}
        {activeTab === "passes" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400">search</span>
                <input type="text" placeholder="Search by name, reg no or pass no..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-700">
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">On Leave / Upcoming</option>
                <option value="RETURNED">Returned</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-black text-slate-900">Leave Records</h2>
                <span className="text-xs font-bold text-slate-400">{filteredIssued.length} records</span>
              </div>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div></div>
                ) : filteredIssued.length === 0 ? (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-slate-200 text-5xl">luggage</span>
                    <p className="text-slate-400 font-bold mt-4">No leave records found.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Pass No", "Student", "Destination", "From", "To", "Status", "Actions"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredIssued.map(leave => {
                        const badge = getStatusBadge(leave);
                        const overdue = leave.status !== "RETURNED" && leave.status !== "REJECTED" && new Date(leave.endDate) < new Date();
                        return (
                          <tr key={leave.id} className={`hover:bg-slate-50 transition-colors ${overdue ? "bg-red-50/30" : ""}`}>
                            <td className="px-5 py-4"><span className="font-black text-primary text-xs">{leave.passNo}</span></td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900">{leave.student?.user?.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{leave.student?.regNo}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1 text-slate-600">
                                <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                                <span className="font-medium">{leave.destination}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-700">{new Date(leave.startDate).toLocaleDateString("en-IN")}</td>
                            <td className="px-5 py-4">
                              <span className={`font-bold ${overdue ? "text-red-600" : "text-slate-700"}`}>{new Date(leave.endDate).toLocaleDateString("en-IN")}</span>
                              {overdue && <span className="block text-[9px] text-red-500 font-black uppercase">OVERDUE</span>}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${badge.color}`}>{badge.label}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Link href={`/admin/leave/print/${leave.id}`} target="_blank" className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" title="Print Pass">
                                  <span className="material-symbols-outlined text-sm">print</span>
                                </Link>
                                {leave.status !== "RETURNED" && leave.status !== "REJECTED" && (
                                  <button onClick={() => handleMarkReturned(leave.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all" title="Mark Returned">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                  </button>
                                )}
                                <button onClick={() => handleDelete(leave.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all" title="Delete">
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Issue Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-black text-xl text-slate-900">Issue Leave Pass</h2>
                <p className="text-xs text-slate-400 font-bold">Generate an official authorized leave</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleIssue} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Student *</label>
                <select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none font-bold text-slate-700">
                  <option value="">-- Choose Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.user.name} ({s.regNo})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date *</label>
                  <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Return Date *</label>
                  <input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination *</label>
                <input type="text" required placeholder="e.g. Home — Kolkata, WB" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason *</label>
                <textarea required rows={3} placeholder="Reason for leave..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                <input type="text" placeholder="Any special instructions..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none font-medium" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-12 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">luggage</span>}
                  {isSubmitting ? "Issuing..." : "Issue Pass"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
