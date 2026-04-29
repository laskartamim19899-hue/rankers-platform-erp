"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { settingsApi, academicApi, userApi, dataApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function InstitutionSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "academic" | "staff" | "data">("general");
  const [settings, setSettings] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Data Management State
  const [resetPhrase, setResetPhrase] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Creation State
  const [newBatchName, setNewBatchName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("welcome123");
  const [newStaffRole, setNewStaffRole] = useState("TEACHER");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "SUPER_ADMIN") {
      router.push("/admin/dashboard");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, batchRes, courseRes, teacherRes, staffRes] = await Promise.all([
        settingsApi.get(),
        academicApi.getBatches(),
        academicApi.getCourses(),
        academicApi.getTeachers(),
        userApi.getStaff()
      ]);
      setSettings(settingsRes.data);
      setBatches(batchRes.data);
      setCourses(courseRes.data);
      setTeachers(teacherRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.update({
        lateFeePerDay: settings.lateFeePerDay,
        gracePeriodDays: settings.gracePeriodDays,
        lateFeeEnabled: settings.lateFeeEnabled,
        institutionName: settings.institutionName,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        address: settings.address,
        gstNumber: settings.gstNumber,
        tagline: settings.tagline,
        principalName: settings.principalName,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName || !selectedCourseId) return;
    setIsSaving(true);
    try {
      await academicApi.createBatch({
        name: newBatchName,
        courseId: selectedCourseId,
        teacherId: selectedTeacherId || null
      });
      setNewBatchName("");
      const batchRes = await academicApi.getBatches();
      setBatches(batchRes.data);
      alert("Batch created!");
    } catch (err) { alert("Error"); } finally { setIsSaving(false); }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName) return;
    setIsSaving(true);
    try {
      await academicApi.createCourse({ name: newCourseName, description: newCourseDesc });
      setNewCourseName("");
      setNewCourseDesc("");
      const res = await academicApi.getCourses();
      setCourses(res.data);
      alert("Course added!");
    } catch (err) { alert("Error"); } finally { setIsSaving(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;
    setIsSaving(true);
    try {
      await userApi.createStaff({ name: newStaffName, email: newStaffEmail, password: newStaffPassword, role: newStaffRole });
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPassword("welcome123");
      const res = await userApi.getStaff();
      setStaff(res.data);
      alert("Staff account created!");
    } catch (err) { alert("Error"); } finally { setIsSaving(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure? This will delete all batches and fees linked to this course.")) return;
    try {
      await academicApi.deleteCourse(id);
      fetchData();
    } catch (err) { alert("Error"); }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm("Delete this batch and all its attendance records?")) return;
    try {
      await academicApi.deleteBatch(id);
      fetchData();
    } catch (err) { alert("Error"); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    try {
      await userApi.deleteStaff(id);
      fetchData();
    } catch (err) { alert("Error"); }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await dataApi.export();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rankers_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetData = async () => {
    if (resetPhrase !== 'RESET ALL DATA') {
      alert('Type exactly: RESET ALL DATA');
      return;
    }
    setIsResetting(true);
    try {
      await dataApi.reset(resetPhrase);
      setResetPhrase('');
      alert('All data has been reset. You will be redirected to dashboard.');
      router.push('/admin/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Reset failed.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setImportError(null);
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.data) throw new Error('Invalid file format');
        const res = await dataApi.import(parsed);
        setImportResult(res.data.summary);
      } catch (err: any) {
        setImportError(err.response?.data?.message || err.message || 'Import failed');
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain mr-4" />
        <h1 className="text-xl font-black text-primary tracking-tight mr-auto">System Configuration</h1>
        {saved && <div className="text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-xs font-black animate-pulse">SAVED!</div>}
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1 shadow-sm">
          {["general", "academic", "staff", "data"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab === 'general' ? 'Institutional' : tab === 'academic' ? 'Academic & Courses' : 'Staff Management'}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6">
        
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined">apartment</span></div>
                <div><h2 className="text-lg font-black text-slate-900">Institution Identity</h2><p className="text-xs text-slate-500">Global branding for receipts and reports</p></div>
              </div>
              
              <div className="p-6 space-y-8">
                
                {/* Branding Section */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Identity & Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution Name</label>
                      <input type="text" value={settings?.institutionName || ""} onChange={(e) => setSettings({...settings, institutionName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagline</label>
                      <input type="text" value={settings?.tagline || ""} onChange={(e) => setSettings({...settings, tagline: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Empowering Future Leaders" />
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <input type="text" value={settings?.phone || ""} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="+91..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input type="email" value={settings?.email || ""} onChange={(e) => setSettings({...settings, email: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="info@domain.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</label>
                      <input type="text" value={settings?.website || ""} onChange={(e) => setSettings({...settings, website: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="www.domain.com" />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</label>
                      <input type="text" value={settings?.address || ""} onChange={(e) => setSettings({...settings, address: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="Street, City, PIN" />
                    </div>
                  </div>
                </div>

                {/* Legal & Leadership Section */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Legal & Leadership</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal / Director Name</label>
                      <input type="text" value={settings?.principalName || ""} onChange={(e) => setSettings({...settings, principalName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST / Registration No.</label>
                      <input type="text" value={settings?.gstNumber || ""} onChange={(e) => setSettings({...settings, gstNumber: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="Optional" />
                    </div>
                  </div>
                </div>

                {/* Automation Section */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Automation & Fees</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Fee (₹/Day)</label>
                      <input type="number" value={settings?.lateFeePerDay || 0} onChange={(e) => setSettings({...settings, lateFeePerDay: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grace Period (Days)</label>
                      <input type="number" value={settings?.gracePeriodDays || 0} onChange={(e) => setSettings({...settings, gracePeriodDays: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Enable Late Fees</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle automated late fee calculations</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSettings({ ...settings, lateFeeEnabled: !settings.lateFeeEnabled })}
                      className={`w-14 h-7 rounded-full p-1 transition-all ${settings.lateFeeEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.lateFeeEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={isSaving} className="bg-primary text-white px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Course Management */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><span className="material-symbols-outlined">menu_book</span></div>
                <div><h2 className="text-lg font-black text-slate-900">Course Catalog</h2><p className="text-xs text-slate-500">Add or remove active institutional courses</p></div>
              </div>
              <form onSubmit={handleCreateCourse} className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Name *</label>
                  <input type="text" placeholder="e.g. WBJEE 2026" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} required className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <input type="text" placeholder="e.g. 2-Year Engineering Prep" value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <button type="submit" disabled={isSaving} className="h-12 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg disabled:opacity-50">Add Course</button>
              </form>
              <div className="p-0 max-h-60 overflow-y-auto divide-y divide-slate-100">
                {courses.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 font-bold text-sm">No courses added yet.</div>
                ) : courses.map(c => (
                  <div key={c.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 font-black">{c.name[0]}</div>
                      <div><p className="font-black text-slate-800">{c.name}</p><p className="text-xs text-slate-400 font-medium">{c.description || "No description"}</p></div>
                    </div>
                    <button onClick={() => handleDeleteCourse(c.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Management */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><span className="material-symbols-outlined">groups</span></div>
                <div><h2 className="text-lg font-black text-slate-900">Batch Allocation</h2><p className="text-xs text-slate-500">Create academic batches and assign Class Teachers</p></div>
              </div>
              <form onSubmit={handleCreateBatch} className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Name *</label><input type="text" required value={newBatchName} onChange={(e) => setNewBatchName(e.target.value)} placeholder="e.g. Target Alpha" className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Course *</label>
                  <select required value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Teacher</label>
                  <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">-- Unassigned --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={isSaving} className="h-12 bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 shadow-lg disabled:opacity-50">Create Batch</button>
              </form>
              <div className="divide-y divide-slate-100">
                {batches.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold text-sm">No batches created yet.</div>
                ) : batches.map(b => (
                  <div key={b.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black">{b.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-800">{b.name}</p>
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{b.course?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">In-charge</p>
                        {b.teacher ? (
                           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><p className="text-xs font-black text-slate-700">{b.teacher.name}</p></div>
                        ) : (
                           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span><p className="text-xs font-black text-slate-400 italic">Unassigned</p></div>
                        )}
                      </div>
                      <button onClick={() => handleDeleteBatch(b.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><span className="material-symbols-outlined">person_add</span></div>
                <div><h2 className="text-lg font-black text-slate-900">Staff Access Management</h2><p className="text-xs text-slate-500">Create accounts for Teachers and Accountants</p></div>
              </div>
              <form onSubmit={handleCreateStaff} className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Full Name</label><input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 font-bold text-sm" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Login ID/Email</label><input type="email" value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 font-bold text-sm" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Password</label><input type="text" value={newStaffPassword} onChange={(e) => setNewStaffPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 font-bold text-sm" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Role</label><select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 font-bold text-sm"><option value="TEACHER">Teacher</option><option value="ACCOUNTANT">Accountant</option><option value="ADMIN">Admin</option></select></div>
                <button type="submit" className="h-10 bg-purple-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-purple-700">Create Staff</button>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><tr className="px-6 py-3"><th className="px-6 py-3">Staff Name</th><th className="px-6 py-3">Login ID</th><th className="px-6 py-3">Access Role</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-800 text-sm">{s.name}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{s.email}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${s.role === 'ADMIN' ? 'bg-red-50 text-red-600 border border-red-100' : s.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{s.role}</span></td>
                        <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteStaff(s.id)} className="text-red-400 hover:text-red-600"><span className="material-symbols-outlined text-xl">person_remove</span></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DATA MANAGEMENT TAB ── */}
        {activeTab === "data" && (
          <div className="space-y-8">

            {/* Export */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><span className="material-symbols-outlined">cloud_download</span></div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Export Institution Data</h2>
                  <p className="text-xs text-slate-500">Download a complete JSON backup of all students, fees, courses, timetables and expenses</p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="ml-auto h-12 px-8 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  {isExporting ? 'Exporting...' : 'Download Backup'}
                </button>
              </div>
              <div className="px-6 py-4 bg-blue-50">
                <p className="text-[11px] font-bold text-blue-700">💡 Always export a backup before resetting. The backup file can be used to restore all data.</p>
              </div>
            </div>

            {/* Import */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><span className="material-symbols-outlined">cloud_upload</span></div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Import Institution Data</h2>
                  <p className="text-xs text-slate-500">Restore data from a previously exported Rankers backup file (.json)</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-emerald-400 transition-colors">upload_file</span>
                  <span className="text-sm font-bold text-slate-400 mt-2">{isImporting ? 'Importing...' : 'Click to select backup file'}</span>
                  <span className="text-[10px] text-slate-300">Accepts .json backup files only</span>
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" disabled={isImporting} />
                </label>
                {importResult && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-sm font-black text-emerald-700 mb-3">✅ Import Completed Successfully</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {Object.entries(importResult).map(([key, val]) => (
                        <div key={key} className="text-center p-2 bg-white rounded-xl border border-emerald-100">
                          <p className="text-xl font-black text-emerald-600">{val as number}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {importError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm">
                    ❌ {importError}
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone - Reset */}
            <div className="bg-white rounded-3xl border-2 border-red-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-red-100 flex items-center gap-4 bg-red-50">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600"><span className="material-symbols-outlined">warning</span></div>
                <div>
                  <h2 className="text-lg font-black text-red-700">Danger Zone — Reset All Data</h2>
                  <p className="text-xs text-red-500">Permanently deletes all students, fees, payments, attendance, courses, batches and expenses. This action cannot be undone.</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-xs font-black text-amber-700 leading-relaxed">
                    ⚠️ Your SUPER_ADMIN account and Institution Settings will be preserved. All other data including student records, fee history, and attendance will be permanently erased.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Type <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-red-600">RESET ALL DATA</span> to confirm</label>
                  <input
                    type="text"
                    value={resetPhrase}
                    onChange={(e) => setResetPhrase(e.target.value)}
                    placeholder="RESET ALL DATA"
                    className="w-full h-12 px-4 rounded-xl border-2 border-red-200 font-black focus:ring-2 focus:ring-red-400 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleResetData}
                  disabled={isResetting || resetPhrase !== 'RESET ALL DATA'}
                  className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-red-200"
                >
                  {isResetting ? '⚙️ Resetting...' : '🗑️ Reset All Institution Data'}
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

