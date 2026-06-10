"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentApi, academicApi } from "@/lib/api";
import { exportToCSV } from "@/lib/utils";

export default function StudentDatabase() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCourse, setFilterCourse] = useState("ALL");

  const handleResetPassword = async (userId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${studentName}? The new password will be 'student123'.`)) return;
    try {
      await authApi.adminResetPassword(userId, "student123");
      alert("Password reset successfully to: student123");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      alert(`RESET FAILED: ${msg}`);
      console.error("Reset Error Details:", err.response?.data);
    }
  };

  const handleExport = () => {
    const exportData = filteredStudents.map(s => ({
      "Registration Number": s.regNo || "PENDING",
      "Student Name": s.user.name,
      "Email (Login ID)": s.user.email,
      "Course": s.courses?.map((c: any) => c.course?.name).join(', ') || "N/A",
      "Phone": s.phone,
      "Guardian Name": s.guardianName,
      "Status": s.status,
      "Admission Date": new Date(s.user.createdAt).toLocaleDateString()
    }));
    exportToCSV(exportData, "Students_Database");
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [studentRes, courseRes] = await Promise.all([
        studentApi.getAll(),
        academicApi.getCourses()
      ]);
      setStudents(studentRes.data);
      setCourses(courseRes.data);
      setFilteredStudents(studentRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = students;
    
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.user.name.toLowerCase().includes(query) ||
        s.regNo?.toLowerCase().includes(query) ||
        s.phone.includes(query) ||
        s.guardianName?.toLowerCase().includes(query)
      );
    }
    
    // Status Filter
    if (filterStatus !== "ALL") {
      result = result.filter(s => s.status === filterStatus);
    }
    
    // Course Filter
    if (filterCourse !== "ALL") {
      result = result.filter(s => 
        s.courses.some((sc: any) => sc.courseId === filterCourse)
      );
    }
    
    setFilteredStudents(result);
  }, [searchQuery, filterStatus, filterCourse, students]);

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this student? They will be issued a unique Registration Number.")) return;
    try {
      const res = await studentApi.approve(id);
      router.push(`/admin/students/approval-success/${id}`);
    } catch (err) { alert("Failed to approve student"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("DANGER: This will permanently delete the student and all their academic/financial records. Continue?")) return;
    try {
      await studentApi.delete(id);
      fetchInitialData();
      alert("Student deleted successfully");
    } catch (err) { alert("Failed to delete student"); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="mr-auto">
          <h1 className="text-xl font-black text-primary tracking-tight">Student Intelligence</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Database Management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="bg-white text-slate-600 border-2 border-slate-200 px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
          <Link href="/admission" className="bg-primary text-white px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">person_add</span>
            New Admission
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Search by Name, Reg No, Guardian, or Phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            {/* Course Dropdown */}
            <div className="lg:w-64 relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">school</span>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none"
              >
                <option value="ALL">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filter by Status:</span>
            {["ALL", "APPROVED", "PENDING", "INACTIVE"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {status}
              </button>
            ))}
            
            <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Found <span className="text-primary">{filteredStudents.length}</span> Results
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Courses</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-400 border border-slate-200/50">
                          {student.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-primary transition-colors">{student.user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">G: {student.guardianName || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {student.regNo ? (
                          <span className="font-mono font-black text-primary bg-blue-50 px-3 py-1 rounded-lg text-[10px] border border-blue-100">{student.regNo}</span>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">Issue Pending</span>
                        )}
                        <p className="text-[10px] text-slate-400 font-bold">{student.phone}</p>
                        <p className="text-[10px] text-indigo-600 font-black italic">{student.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {student.courses.map((c: any) => (
                          <div key={c.courseId} className="flex flex-col">
                            {c.batch ? (
                              <span className="text-[10px] font-black text-slate-800">{c.batch.name}</span>
                            ) : null}
                            <span className="text-[9px] font-black uppercase text-slate-400">
                              {c.course.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                        student.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        student.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        student.status === 'INACTIVE' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        {student.status === 'PENDING' && (
                          <button 
                            onClick={() => handleApprove(student.id)}
                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100 hover:shadow-lg hover:shadow-emerald-200"
                            title="Approve Student"
                          >
                            <span className="material-symbols-outlined text-lg">verified</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleResetPassword(student.user.id, student.user.name)}
                          className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center border border-amber-100 hover:shadow-lg hover:shadow-amber-200"
                          title="Reset Password"
                        >
                          <span className="material-symbols-outlined text-lg">key</span>
                        </button>
                        <Link 
                          href={`/admin/students/${student.id}`} 
                          className="w-10 h-10 rounded-xl bg-blue-50 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-blue-100 hover:shadow-lg hover:shadow-primary/20"
                          title="View Intelligence"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <button 
                          onClick={() => router.push(`/admin/students/${student.id}?action=promote`)}
                          className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-100 hover:shadow-lg hover:shadow-indigo-200"
                          title="Promote / Enroll New"
                        >
                          <span className="material-symbols-outlined text-lg">trending_up</span>
                        </button>
                        <Link 
                          href={`/admin/students/approval-success/${student.id}`}
                          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center border border-slate-200 hover:shadow-lg"
                          title="Print Registration Page"
                        >
                          <span className="material-symbols-outlined text-lg">print</span>
                        </Link>
                        <Link 
                          href={`/admin/students/${student.id}/edit`} 
                          className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center border border-amber-100 hover:shadow-lg hover:shadow-amber-200"
                          title="Edit Records"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-100 hover:shadow-lg hover:shadow-red-200"
                          title="Expunge Record"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="p-32 text-center bg-slate-50/50">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <span className="material-symbols-outlined text-4xl">person_search</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">We couldn't find any students matching your current filters. Try adjusting your search query.</p>
              <button onClick={() => { setSearchQuery(""); setFilterStatus("ALL"); setFilterCourse("ALL"); }} className="mt-8 text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

