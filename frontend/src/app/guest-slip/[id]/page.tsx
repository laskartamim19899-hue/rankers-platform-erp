"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { guestApi } from "@/lib/api";
import Link from "next/link";

function amountInWords(num: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " " + ones[num%10] : "");
  if (num < 1000) return ones[Math.floor(num/100)] + " Hundred" + (num%100 ? " " + amountInWords(num%100) : "");
  if (num < 100000) return amountInWords(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " " + amountInWords(num%1000) : "");
  return amountInWords(Math.floor(num/100000)) + " Lakh" + (num%100000 ? " " + amountInWords(num%100000) : "");
}

export default function GuestSlipPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const r = await guestApi.getPayment(id as string); setPayment(r.data); }
      catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-600" /></div>;
  if (!payment) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500 font-bold">Slip Not Found</p></div>;

  const gt = payment.guestTeacher;
  const slipNo = `RP-GT-${payment.id.substring(0, 8).toUpperCase()}`;
  const paidDate = new Date(payment.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const words = `Rupees ${amountInWords(Math.round(payment.totalAmount))} Only`;

  const HalfSlip = ({ label, accent, copyFor }: { label: string; accent: string; copyFor: string }) => (
    <div style={{ width: "105mm", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "148mm", position: "relative", overflow: "hidden" }}>
      {/* Watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: "40px", fontWeight: 900, color: "#fff7ed", pointerEvents: "none", userSelect: "none" }}>PAID</div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${accent}`, paddingBottom: "3mm", marginBottom: "3mm" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5mm" }}>
            <img src="/logo.png" alt="" style={{ height: "10mm", width: "auto" }} />
            <div>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Rankers' Platform</div>
              <div style={{ fontSize: "5.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Guest Teacher Payment Slip</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: accent, color: "white", padding: "1mm 3mm", borderRadius: "2px", fontSize: "6.5px", fontWeight: 900, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "6px", fontWeight: 800, color: "#334155", marginTop: "1.5mm" }}>No: {slipNo}</div>
            <div style={{ fontSize: "5.5px", color: "#94a3b8", marginTop: "0.5mm" }}>{paidDate}</div>
          </div>
        </div>

        <div style={{ fontSize: "5.5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "2mm" }}>{copyFor}</div>

        {/* Teacher Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm", marginBottom: "3mm" }}>
          <div style={{ background: "#fff7ed", padding: "2mm", borderRadius: "2px", border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Guest Teacher</div>
            <div style={{ fontSize: "8.5px", fontWeight: 900, color: "#0f172a" }}>{gt.name}</div>
            <div style={{ fontSize: "5.5px", color: "#64748b", marginTop: "0.5mm" }}>{gt.subject}</div>
            {gt.qualification && <div style={{ fontSize: "5.5px", color: "#64748b" }}>{gt.qualification}</div>}
          </div>
          <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Payment Period</div>
            <div style={{ fontSize: "9px", fontWeight: 900, color: "#0f172a" }}>{payment.month}</div>
            <div style={{ fontSize: "6px", color: "#64748b", marginTop: "0.5mm", fontWeight: 700 }}>Mode: {payment.paymentMode}</div>
            {payment.transactionId && <div style={{ fontSize: "5.5px", color: "#64748b", wordBreak: "break-all" }}>Ref: {payment.transactionId}</div>}
          </div>
        </div>

        {/* Calculation Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "6.5px", marginBottom: "3mm" }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              <th style={{ padding: "1.5mm 2mm", textAlign: "left", color: "white", fontWeight: 900, textTransform: "uppercase" }}>Particulars</th>
              <th style={{ padding: "1.5mm 2mm", textAlign: "center", color: "white", fontWeight: 900 }}>Qty</th>
              <th style={{ padding: "1.5mm 2mm", textAlign: "right", color: "white", fontWeight: 900 }}>₹ Amt</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fffbeb" }}>
              <td style={{ padding: "2.5mm 2mm", color: "#1e293b", fontWeight: 700 }}>
                Class Fees
                <div style={{ color: "#64748b", fontSize: "6px", fontWeight: 500, marginTop: "0.5mm" }}>₹{payment.ratePerClass}/class × {payment.classesHeld} classes</div>
              </td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "center", color: "#ea580c", fontWeight: 900 }}>{payment.classesHeld}</td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "right", fontWeight: 900, color: "#059669" }}>₹{payment.classAmount.toLocaleString('en-IN')}</td>
            </tr>
            {payment.allowances > 0 && (
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "2mm", color: "#1e293b", fontWeight: 700 }}>Other Allowances</td>
                <td style={{ padding: "2mm", textAlign: "center", color: "#64748b" }}>—</td>
                <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: "#2563eb" }}>₹{payment.allowances.toLocaleString('en-IN')}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: `${accent}18`, borderTop: `2px solid ${accent}` }}>
              <td colSpan={2} style={{ padding: "2.5mm 2mm", fontWeight: 900, color: accent, fontSize: "8px", textTransform: "uppercase" }}>Total Amount Paid</td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "right", fontWeight: 900, color: accent, fontSize: "13px" }}>₹{payment.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in words */}
        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "2px", padding: "2mm", marginBottom: "2mm" }}>
          <span style={{ fontSize: "5.5px", fontWeight: 900, color: "#78350f", textTransform: "uppercase" }}>In Words: </span>
          <span style={{ fontSize: "6px", fontWeight: 700, color: "#92400e" }}>{words}</span>
        </div>

        {/* Remarks */}
        {payment.remarks && (
          <div style={{ fontSize: "6px", color: "#64748b", fontStyle: "italic", marginBottom: "2mm" }}>Remarks: {payment.remarks}</div>
        )}

        {/* Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "3mm", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "22mm", height: "0.5px", background: "#94a3b8", marginBottom: "1.5mm" }} />
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Guest Teacher</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "22mm", height: "0.5px", background: "#94a3b8", marginBottom: "1.5mm" }} />
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Authorised By</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="print:hidden bg-slate-200 min-h-screen flex flex-col items-center py-10 px-4 gap-6">
        <div className="flex items-center gap-4 w-full" style={{ maxWidth: "210mm" }}>
          <Link href="/admin/guest-teacher" className="flex items-center gap-1 text-slate-500 font-bold text-sm hover:text-orange-700">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </Link>
          <button onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 shadow-lg">
            <span className="material-symbols-outlined text-sm">print</span>
            Print Both Copies
          </button>
        </div>
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden" style={{ width: "210mm", fontFamily: "Inter, sans-serif" }}>
          <div style={{ width: "210mm", height: "148mm", display: "flex", overflow: "hidden" }}>
            <HalfSlip label="Teacher Copy" accent="#ea580c" copyFor="▸ Guest Teacher Copy" />
            <div style={{ width: "0", borderLeft: "1.5px dashed #94a3b8", flexShrink: 0, display: "flex", alignItems: "center", position: "relative" }}>
              <div style={{ position: "absolute", fontSize: "5.5px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", writingMode: "vertical-rl" }}>✂ Cut Here</div>
            </div>
            <HalfSlip label="Office Copy" accent="#0f172a" copyFor="▸ Institution / Accounts Copy" />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">A5 Landscape · Cut along dotted line · Teacher Copy + Office Copy</p>
      </div>

      <div className="hidden print:block">
        <div style={{ width: "210mm", height: "148mm", display: "flex", overflow: "hidden" }}>
          <HalfSlip label="Teacher Copy" accent="#ea580c" copyFor="▸ Guest Teacher Copy" />
          <div style={{ width: "0", borderLeft: "1.5px dashed #94a3b8", flexShrink: 0 }} />
          <HalfSlip label="Office Copy" accent="#0f172a" copyFor="▸ Institution / Accounts Copy" />
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A5 landscape; margin: 0; }
          body { margin: 0; background: white; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
