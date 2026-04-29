"use client";

import { useState, useEffect } from "react";
import { residentialApi, studentApi } from "@/lib/api";
import Link from "next/link";

export default function AdminHostel() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedHostel, setSelectedHostel] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [hostelRes, studentRes] = await Promise.all([
        residentialApi.getHostels(),
        studentApi.getAll()
      ]);
      setHostels(hostelRes.data);
      setStudents(studentRes.data);
    } catch (err) {
      console.error("Failed to fetch residential data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !capacity) return;
    setIsCreating(true);
    try {
      await residentialApi.createHostel({ roomNumber, capacity });
      alert("Hostel room created!");
      setRoomNumber("");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedHostel) return;
    setIsAllocating(true);
    try {
      await residentialApi.allocate({
        studentId: selectedStudent,
        hostelId: selectedHostel,
        joinDate: new Date().toISOString()
      });
      alert("Room allocated successfully!");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to allocate room");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Remove this room entirely?")) return;
    try {
      await residentialApi.deleteHostel(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDeallocate = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the hostel?")) return;
    try {
      await residentialApi.deallocate(studentId);
      alert("Room deallocated");
      fetchData();
    } catch (err) {
      alert("Failed to deallocate");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Hostel & Residency</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Column */}
        <div className="space-y-8">
           {/* Create Room Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 px-1">Register New Room</h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room No / Name</label>
                  <input 
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                    placeholder="e.g. 302-B"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Max Capacity</label>
                  <select 
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  >
                    {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Students</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
                >
                  {isCreating ? "Saving..." : "Add Room"}
                </button>
              </form>
            </div>
          </div>

          {/* Allocation Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 px-1">Quick Allocation</h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleAllocate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Student</label>
                  <select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.user.name} ({s.regNo})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Room</label>
                  <select 
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="">-- Choose Room --</option>
                    {hostels.map(h => (
                      <option key={h.id} value={h.id} disabled={h.occupancy >= h.capacity}>
                        Room {h.roomNumber} ({h.occupancy}/{h.capacity} full)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAllocating}
                  className="w-full h-12 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isAllocating ? "Allocating..." : "Assign Student"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Hostel List & Current Occupants */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">domain</span>
            Active Residency
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hostels.map(hostel => (
                <div key={hostel.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-primary">Room {hostel.roomNumber}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cap: {hostel.capacity} Total</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${hostel.occupancy >= hostel.capacity ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {hostel.occupancy} / {hostel.capacity}
                      </span>
                      {hostel.occupancy === 0 && (
                        <button 
                          onClick={() => handleDeleteRoom(hostel.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {hostel.allocations.length > 0 ? (
                      hostel.allocations.map((alloc: any) => (
                        <div key={alloc.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-primary border border-slate-200">
                              {alloc.student.user.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{alloc.student.user.name}</p>
                              <p className="text-[10px] text-slate-400 italic font-medium">Since {new Date(alloc.joinDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeallocate(alloc.studentId)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">logout</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6 italic font-medium">No students assigned to this room.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
