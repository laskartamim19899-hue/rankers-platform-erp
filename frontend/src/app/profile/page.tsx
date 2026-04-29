"use client";

import { useState, useEffect } from "react";
import { studentApi, authApi, userApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isRemovingPic, setIsRemovingPic] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    const fetchProfile = async () => {
      try {
        if (userData.studentProfile?.id) {
          const res = await studentApi.getById(userData.studentProfile.id);
          setProfile(res.data);
          setPhone(res.data.phone);
          setAddress(res.data.address);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("userId", user.id);

    setIsUploadingPic(true);
    try {
      const res = await userApi.updateProfilePic(formData);
      const updatedUser = { ...user, photoUrl: res.data.photoUrl };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Profile picture updated!");
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleRemovePic = async () => {
    if (!confirm("Remove profile picture?")) return;
    setIsRemovingPic(true);
    try {
      await userApi.removeProfilePic(user.id);
      const updatedUser = { ...user, photoUrl: null };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Profile picture removed");
    } catch (err) {
      alert("Failed to remove picture");
    } finally {
      setIsRemovingPic(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsUpdating(true);
    try {
      await studentApi.update(profile.id, { phone, address });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        userId: user.id,
        oldPassword,
        newPassword
      });
      alert("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear cookie for middleware
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    router.push("/login");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  const getFullUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href={user?.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard'} className="mr-4 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-primary tracking-tight">Personal Identity</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="h-32 bg-primary relative">
            <div className="absolute -bottom-12 left-8 group">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 border-4 border-white shadow-lg relative overflow-hidden">
                {user?.photoUrl ? (
                  <img src={getFullUrl(user.photoUrl)!} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-black text-primary uppercase">
                    {user?.name[0]}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-white text-xl">{isUploadingPic ? 'sync' : 'photo_camera'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploadingPic} />
                </label>
              </div>
              {user?.photoUrl && (
                <button 
                  onClick={handleRemovePic}
                  disabled={isRemovingPic}
                  className="absolute -right-2 -bottom-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-all border border-slate-100"
                >
                  <span className="material-symbols-outlined text-sm">{isRemovingPic ? 'sync' : 'delete'}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
              <p className="text-slate-500 font-medium">{user?.email}</p>
              <span className="mt-2 inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">
                {user?.role}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-all active:scale-95"
            >
              Sign Out
            </button>
          </div>

          <div className="border-t border-slate-100 p-8">
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registration Number</label>
                <input disabled value={profile?.regNo || 'N/A'} className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-slate-700" 
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Residential Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-slate-700 resize-none" 
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 px-1">Security Settings</h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Old Password</label>
                  <input 
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 px-1">Account Info</h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
               {profile && (
                <>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Guardian</p>
                    <p className="text-sm font-bold text-slate-800">{profile.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Birth Date</p>
                    <p className="text-sm font-bold text-slate-800">{new Date(profile.dob).toLocaleDateString()}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">Active</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 w-full py-12 mt-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-inter text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            © 2026 Rankers' Platform • Identity & Security
          </p>
          <div className="flex gap-8">
            <Link className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors" href="/privacy-policy">
              Privacy
            </Link>
            <Link className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors" href="/terms-of-service">
              Terms
            </Link>
            <Link className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors" href="/support">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
