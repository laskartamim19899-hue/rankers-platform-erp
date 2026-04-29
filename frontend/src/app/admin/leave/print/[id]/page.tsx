"use client";

import { useEffect, useState } from "react";
import { leaveApi } from "@/lib/api";
import { use } from "react";

export default function PrintLeavePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [leave, setLeave] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    leaveApi.getById(id)
      .then(res => {
        setLeave(res.data);
        setIsLoading(false);
        // Auto-trigger print after a short delay for rendering
        setTimeout(() => window.print(), 800);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  const getFullUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  const totalDays = leave
    ? Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-900"></div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">Leave pass not found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f1f5f9; }
        
        .no-print { }
        
        @page {
          size: A4;
          margin: 0;
        }
        
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .pass-wrapper { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-slate-800 text-white py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-lg">🪪</span>
          <span className="font-bold">Leave Pass Preview</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">{leave.passNo}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-white/30 text-white rounded-lg text-sm font-bold hover:bg-white/10 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-white text-slate-900 rounded-lg text-sm font-black hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* The actual pass — styled for A4 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', minHeight: '100vh', background: '#f1f5f9' }}>
        <div className="pass-wrapper" style={{
          width: '794px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
        }}>

          {/* Header Banner */}
          <div style={{ background: 'linear-gradient(135deg, #00236f 0%, #0a3fa8 100%)', padding: '32px 40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Logo */}
                <img src="/logo.png" alt="Rankers' Platform" style={{ height: '60px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.3em', opacity: 0.7, textTransform: 'uppercase' }}>Official Document</p>
                  <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: 1 }}>Rankers' Platform</h1>
                  <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>High-Stakes Academic Excellence</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.2em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>Authorized Leave Pass</p>
                <p style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '2px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px' }}>{leave.passNo}</p>
                <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '6px' }}>
                  Issued: {new Date(leave.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Student Identity Section */}
          <div style={{ padding: '32px 40px', display: 'flex', gap: '32px', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9' }}>
            {/* Photo */}
            <div style={{ flexShrink: 0 }}>
              {leave.student?.user?.photoUrl ? (
                <img
                  src={getFullUrl(leave.student.user.photoUrl)!}
                  alt="Student"
                  style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '3px solid #e2e8f0', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100px', height: '120px', borderRadius: '10px', border: '3px solid #e2e8f0', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '900', color: '#00236f' }}>
                  {leave.student?.user?.name?.[0] || 'S'}
                </div>
              )}
              <p style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', textAlign: 'center', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authorized Photo</p>
            </div>

            {/* Student Info */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Student Information</p>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {leave.student?.user?.name}
              </h2>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  REG: {leave.student?.regNo || 'N/A'}
                </span>
                {leave.student?.courses?.[0]?.course?.name && (
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {leave.student.courses[0].course.name}
                  </span>
                )}
                {leave.student?.hostelAlloc && (
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', background: '#fff7ed', padding: '4px 12px', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                    🏠 Room {leave.student.hostelAlloc.hostel?.roomNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Leave Details Grid */}
          <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>Leave Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Departure Date</p>
                <p style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                  {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Return Date</p>
                <p style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                  {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div style={{ background: '#00236f', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Duration</p>
                <p style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{totalDays} <span style={{ fontSize: '12px', opacity: 0.8 }}>day{totalDays > 1 ? 's' : ''}</span></p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Destination / Going To</p>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#334155' }}>📍 {leave.destination}</p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Reason for Leave</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', lineHeight: 1.6 }}>{leave.reason}</p>
            </div>

            {leave.notes && (
              <div style={{ marginTop: '12px', background: '#fefce8', borderRadius: '12px', padding: '14px', border: '1px solid #fef08a' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#a16207', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Special Instructions</p>
                <p style={{ fontSize: '13px', color: '#713f12' }}>{leave.notes}</p>
              </div>
            )}
          </div>

          {/* Terms & Signature */}
          <div style={{ padding: '28px 40px', display: 'flex', gap: '40px', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>Conditions of Leave</p>
              <ul style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.8, paddingLeft: '16px' }}>
                <li>The student must return by the date mentioned above.</li>
                <li>This pass is valid for the dates mentioned only.</li>
                <li>Overstaying without prior written permission is a disciplinary offence.</li>
                <li>This pass must be presented at the gate upon departure & return.</li>
              </ul>
            </div>
            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '8px', marginBottom: '8px', minWidth: '140px' }}>
                <p style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{leave.issuedBy}</p>
              </div>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authorized Signature</p>
              <p style={{ fontSize: '9px', color: '#cbd5e1', marginTop: '2px' }}>Rankers' Platform</p>
            </div>
          </div>

          {/* Footer Strip */}
          <div style={{ background: '#f8fafc', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
              © 2026 Rankers' Platform — This is a computer-generated leave pass.
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>Pass: {leave.passNo}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
                Printed: {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
