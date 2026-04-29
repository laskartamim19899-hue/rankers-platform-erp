"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { expenseApi } from "@/lib/api";
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

const categoryColors: Record<string, string> = {
  OPERATIONAL: "#3b82f6",
  SALARY: "#8b5cf6",
  MAINTENANCE: "#f59e0b",
  MARKETING: "#ec4899",
  OTHER: "#64748b",
};

export default function VoucherPage() {
  const { id } = useParams();
  const [expense, setExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        if (!id) return;
        const res = await expenseApi.getById(id as string);
        setExpense(res.data);
      } catch (err) {
        console.error("Failed to fetch expense", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-slate-900" />
    </div>
  );

  if (!expense) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">receipt_long</span>
        <p className="text-slate-500 font-bold mt-4">Voucher Not Found</p>
        <Link href="/admin/expenses" className="mt-4 inline-block text-slate-600 font-black text-sm underline">← Back</Link>
      </div>
    </div>
  );

  const voucherNo = `RP-VO-${expense.id.substring(0, 8).toUpperCase()}`;
  const expDate = new Date(expense.date);
  const dateStr = expDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const catColor = categoryColors[expense.category] || "#64748b";
  const words = `Rupees ${amountInWords(Math.round(expense.amount))} Only`;

  return (
    <>
      {/* Screen wrapper */}
      <div className="print:hidden bg-slate-200 min-h-screen flex flex-col items-center py-10 px-4 gap-6">
        <div className="flex items-center gap-4 w-full" style={{ maxWidth: "210mm" }}>
          <Link href="/admin/expenses" className="flex items-center gap-1 text-slate-500 font-bold text-sm hover:text-slate-900">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </Link>
          <button onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black shadow-lg">
            <span className="material-symbols-outlined text-sm">print</span>
            Print Both Copies
          </button>
        </div>

        <div className="bg-white shadow-2xl rounded-xl overflow-hidden"
          style={{ width: "210mm", fontFamily: "Inter, sans-serif" }}>
          <TwoUpVoucher expense={expense} voucherNo={voucherNo} dateStr={dateStr} catColor={catColor} words={words} />
        </div>

        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">A5 Landscape · Cut along dotted line · One for Payee · One for Office</p>
      </div>

      {/* Print layout */}
      <div className="hidden print:block">
        <TwoUpVoucher expense={expense} voucherNo={voucherNo} dateStr={dateStr} catColor={catColor} words={words} />
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

function TwoUpVoucher({ expense, voucherNo, dateStr, catColor, words }: any) {
  const HalfDoc = ({ label, accent, copyFor }: { label: string; accent: string; copyFor: string }) => (
    <div style={{ width: "105mm", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "148mm", position: "relative", overflow: "hidden" }}>
      {/* PAID Watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: "44px", fontWeight: 900, color: "#f1f5f9", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
        PAID
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${accent}`, paddingBottom: "3mm", marginBottom: "3mm" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5mm" }}>
            <img src="/logo.png" alt="" style={{ height: "10mm", width: "auto" }} />
            <div>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.2 }}>Rankers' Platform</div>
              <div style={{ fontSize: "5.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Institutional Expense Voucher</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: accent, color: label === "Payee Copy" ? "white" : "#f59e0b", padding: "1mm 3mm", borderRadius: "2px", fontSize: "6.5px", fontWeight: 900, textTransform: "uppercase" }}>
              {label}
            </div>
            <div style={{ fontSize: "6px", fontWeight: 800, color: "#334155", marginTop: "1.5mm" }}>No: {voucherNo}</div>
            <div style={{ fontSize: "5.5px", color: "#94a3b8", marginTop: "0.5mm" }}>{dateStr}</div>
          </div>
        </div>

        {/* Copy label */}
        <div style={{ fontSize: "5.5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "2mm" }}>
          {copyFor}
        </div>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm", marginBottom: "3mm" }}>
          <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Expense Title</div>
            <div style={{ fontSize: "7.5px", fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>{expense.title}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Paid To</div>
            <div style={{ fontSize: "7.5px", fontWeight: 900, color: "#0f172a" }}>{expense.payeeName || "—"}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0", gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Purpose</div>
            <div style={{ fontSize: "7px", fontWeight: 700, color: "#334155" }}>{expense.purpose || expense.title}</div>
            {expense.description && <div style={{ fontSize: "6px", color: "#64748b", marginTop: "0.5mm", fontStyle: "italic" }}>{expense.description}</div>}
          </div>
        </div>

        {/* Amount Row */}
        <div style={{ background: accent, borderRadius: "3px", padding: "2.5mm 3mm", marginBottom: "2.5mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "5.5px", fontWeight: 900, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Category</div>
            <div style={{ fontSize: "8px", fontWeight: 900, color: "white", textTransform: "uppercase", marginTop: "0.5mm" }}>{expense.category}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "5.5px", fontWeight: 900, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Amount</div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "white" }}>₹{expense.amount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Amount in words */}
        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "2px", padding: "2mm", marginBottom: "2mm" }}>
          <span style={{ fontSize: "5.5px", fontWeight: 900, color: "#78350f", textTransform: "uppercase" }}>In Words: </span>
          <span style={{ fontSize: "6px", fontWeight: 700, color: "#92400e" }}>{words}</span>
        </div>

        {/* Declaration (Office copy only) */}
        {copyFor.includes("Office") && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "2px", padding: "2mm", marginBottom: "2mm" }}>
            <p style={{ fontSize: "5.5px", color: "#64748b", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
              Certified that this expenditure is incurred for official institutional purposes in accordance with financial policy.
            </p>
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "3mm", borderTop: "1px solid #e2e8f0" }}>
          {(copyFor.includes("Office") ? ["Prepared By", "Accountant", "Approved By"] : ["Payee Signature", "Auth. Sign"]).map((lbl) => (
            <div key={lbl} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ width: "85%", margin: "0 auto 1.5mm", height: "0.5px", background: "#94a3b8" }} />
              <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "210mm", height: "148mm", display: "flex", flexDirection: "row", overflow: "hidden" }}>
      {/* Left — Payee Copy */}
      <HalfDoc label="Payee Copy" accent={catColor} copyFor="▸ Payee / Vendor Copy" />

      {/* Dotted cut line */}
      <div style={{ width: "0", borderLeft: "1.5px dashed #94a3b8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", fontSize: "5.5px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", writingMode: "vertical-rl" }}>✂ Cut Here</div>
      </div>

      {/* Right — Office Copy */}
      <HalfDoc label="Office Copy" accent="#0f172a" copyFor="▸ Institution / Office Copy" />
    </div>
  );
}
