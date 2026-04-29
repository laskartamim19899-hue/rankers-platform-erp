"use client";

import { useState, useEffect } from "react";
import { communicationApi } from "@/lib/api";
import Link from "next/link";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("GENERAL");
  const [audience, setAudience] = useState("STUDENTS");

  const fetchAnnouncements = async () => {
    try {
      const res = await communicationApi.getAnnouncements();
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsPosting(true);
    try {
      await communicationApi.createAnnouncement({
        title,
        content,
        type,
        targetAudience: audience
      });
      alert("Announcement posted successfully!");
      setTitle("");
      setContent("");
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to post announcement");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await communicationApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Institutional Bulletin</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 px-1">Post Update</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={handlePost} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Headline</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Mock Test Rescheduled"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                <div className="flex gap-2">
                  {['GENERAL', 'ACADEMIC', 'URGENT'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg border transition-all ${type === t ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Content</label>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Details of the announcement..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Audience</label>
                <select 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="ALL">Everyone</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="STAFF">Staff Only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {isPosting ? "Posting..." : "Blast Announcement"}
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Existing Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">history</span>
            Broadcast History
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-start group hover:shadow-md transition-all">
                  <div className="space-y-2 flex-grow pr-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${ann.type === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {ann.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">To: {ann.targetAudience}</span>
                    </div>
                    <h3 className="font-black text-slate-900">{ann.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{ann.content}</p>
                    <p className="text-[10px] text-slate-400 italic">Posted on {new Date(ann.createdAt).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(ann.id)}
                    className="text-slate-300 hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
