"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { salaryApi } from "@/lib/api";
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

export default function SalarySlipPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await salaryApi.getRecord(id as string);
        setRecord(res.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-violet-600" /></div>;
  if (!record) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500 font-bold">Salary Slip Not Found</p></div>;

  const staff = record.staffProfile;
  const user = staff.user;
  const slipNo = `RP-SAL-${record.id.substring(0, 8).toUpperCase()}`;
  const paidDate = new Date(record.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const words = `Rupees ${amountInWords(Math.round(record.netSalary))} Only`;

  const HalfSlip = ({ label, accent, copyFor }: { label: string; accent: string; copyFor: string }) => (
    <div style={{ width: "105mm", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "148mm", position: "relative", overflow: "hidden" }}>
      {/* Watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: "40px", fontWeight: 900, color: "#f1f5f9", pointerEvents: "none", userSelect: "none" }}>PAID</div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${accent}`, paddingBottom: "3mm", marginBottom: "3mm" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5mm" }}>
            <img src="/logo.png" alt="" style={{ height: "10mm", width: "auto" }} />
            <div>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Rankers' Platform</div>
              <div style={{ fontSize: "5.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Staff Salary Slip</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: accent, color: "white", padding: "1mm 3mm", borderRadius: "2px", fontSize: "6.5px", fontWeight: 900, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "6px", fontWeight: 800, color: "#334155", marginTop: "1.5mm" }}>No: {slipNo}</div>
            <div style={{ fontSize: "5.5px", color: "#94a3b8", marginTop: "0.5mm" }}>{paidDate}</div>
          </div>
        </div>

        <div style={{ fontSize: "5.5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "2mm" }}>{copyFor}</div>

        {/* Employee Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm", marginBottom: "3mm" }}>
          <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Employee</div>
            <div style={{ fontSize: "8px", fontWeight: 900, color: "#0f172a" }}>{user.name}</div>
            <div style={{ fontSize: "5.5px", color: "#64748b", marginTop: "0.5mm" }}>{staff.designation} · {staff.department || user.role}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Salary Month</div>
            <div style={{ fontSize: "9px", fontWeight: 900, color: "#0f172a" }}>{record.month}</div>
            <div style={{ fontSize: "5.5px", color: "#64748b", marginTop: "0.5mm" }}>Mode: {record.paymentMode}</div>
          </div>
        </div>

        {/* Salary Breakdown Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "6.5px", marginBottom: "3mm" }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              <th style={{ padding: "1.5mm 2mm", textAlign: "left", color: "white", fontWeight: 900, textTransform: "uppercase" }}>Component</th>
              <th style={{ padding: "1.5mm 2mm", textAlign: "right", color: "white", fontWeight: 900 }}>₹ Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "2mm", color: "#1e293b", fontWeight: 700 }}>Basic Salary</td>
              <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: "#059669" }}>+ ₹{record.basicSalary.toLocaleString('en-IN')}</td>
            </tr>
            {record.allowances > 0 && (
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "2mm", color: "#1e293b", fontWeight: 700 }}>Allowances</td>
                <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: "#2563eb" }}>+ ₹{record.allowances.toLocaleString('en-IN')}</td>
              </tr>
            )}
            {record.deductions > 0 && (
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "2mm", color: "#1e293b", fontWeight: 700 }}>Deductions</td>
                <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: "#dc2626" }}>- ₹{record.deductions.toLocaleString('en-IN')}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: `${accent}18`, borderTop: `2px solid ${accent}` }}>
              <td style={{ padding: "2mm", fontWeight: 900, color: accent, fontSize: "8px", textTransform: "uppercase" }}>Net Salary</td>
              <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: accent, fontSize: "13px" }}>₹{record.netSalary.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in words */}
        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "2px", padding: "2mm", marginBottom: "2mm" }}>
          <span style={{ fontSize: "5.5px", fontWeight: 900, color: "#78350f", textTransform: "uppercase" }}>In Words: </span>
          <span style={{ fontSize: "6px", fontWeight: 700, color: "#92400e" }}>{words}</span>
        </div>

        {/* Remarks */}
        {record.remarks && (
          <div style={{ fontSize: "6px", color: "#64748b", fontStyle: "italic", marginBottom: "2mm" }}>Note: {record.remarks}</div>
        )}

        {/* Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "3mm", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "22mm", height: "0.5px", background: "#94a3b8", marginBottom: "1.5mm" }} />
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Employee</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "22mm", height: "0.5px", background: "#94a3b8", marginBottom: "1.5mm" }} />
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Principal/Director</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="print:hidden bg-slate-200 min-h-screen flex flex-col items-center py-10 px-4 gap-6">
        <div className="flex items-center gap-4 w-full" style={{ maxWidth: "210mm" }}>
          <Link href="/admin/salary" className="flex items-center gap-1 text-slate-500 font-bold text-sm hover:text-violet-700">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Salary
          </Link>
          <button onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-violet-700 shadow-lg">
            <span className="material-symbols-outlined text-sm">print</span>
            Print Both Copies
          </button>
        </div>
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden" style={{ width: "210mm", fontFamily: "Inter, sans-serif" }}>
          <div style={{ width: "210mm", height: "148mm", display: "flex", flexDirection: "row", overflow: "hidden" }}>
            <HalfSlip label="Employee Copy" accent="#7c3aed" copyFor="▸ Employee / Staff Copy" />
            <div style={{ width: "0", borderLeft: "1.5px dashed #94a3b8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", fontSize: "5.5px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", writingMode: "vertical-rl" }}>✂ Cut Here</div>
            </div>
            <HalfSlip label="Office Copy" accent="#0f172a" copyFor="▸ Institution / HR Copy" />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">A5 Landscape · Cut along dotted line · Employee Copy + Office Copy</p>
      </div>

      <div className="hidden print:block">
        <div style={{ width: "210mm", height: "148mm", display: "flex", flexDirection: "row", overflow: "hidden" }}>
          <HalfSlip label="Employee Copy" accent="#7c3aed" copyFor="▸ Employee / Staff Copy" />
          <div style={{ width: "0", borderLeft: "1.5px dashed #94a3b8", flexShrink: 0 }} />
          <HalfSlip label="Office Copy" accent="#0f172a" copyFor="▸ Institution / HR Copy" />
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
