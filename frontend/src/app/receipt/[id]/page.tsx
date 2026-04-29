"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { financeApi } from "@/lib/api";
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

export default function ReceiptPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        if (!id) return;
        const res = await financeApi.getPayment(id as string);
        setPayment(res.data);
      } catch (err) {
        console.error("Failed to fetch payment", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600" />
    </div>
  );

  if (!payment) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">receipt_long</span>
        <p className="text-slate-500 font-bold mt-4">Receipt Not Found</p>
        <Link href="/admin/finance" className="mt-4 inline-block text-emerald-600 font-black text-sm underline">← Back</Link>
      </div>
    </div>
  );

  const allPayments = payment.siblings || [payment];
  const grandTotal = allPayments.reduce((s: number, p: any) => s + p.amount, 0);
  const totalLateFee = allPayments.reduce((s: number, p: any) => s + (p.fee?.lateFee || 0), 0);
  const receiptNo = `RP-${payment.id.substring(0, 8).toUpperCase()}`;
  const dateStr = new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const sharedProps = { payment, allPayments, grandTotal, totalLateFee, receiptNo, dateStr };

  return (
    <>
      <div className="print:hidden bg-slate-200 min-h-screen flex flex-col items-center py-10 px-4 gap-6">
        <div className="flex items-center gap-4 w-full" style={{ maxWidth: "210mm" }}>
          <Link href="/admin/finance" className="flex items-center gap-1 text-slate-500 font-bold text-sm hover:text-emerald-700 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </Link>
          <button onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 shadow-lg">
            <span className="material-symbols-outlined text-sm">print</span>
            Print Both Copies
          </button>
        </div>
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden" style={{ width: "210mm", fontFamily: "Inter, sans-serif" }}>
          <TwoUpReceipt {...sharedProps} />
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">A5 Landscape · Cut along dotted line · Student Copy + Office Copy</p>
      </div>

      <div className="hidden print:block">
        <TwoUpReceipt {...sharedProps} />
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

function HalfDoc({ label, accent, copyFor, payment, allPayments, grandTotal, totalLateFee, receiptNo, dateStr }: any) {
  const feeRows = allPayments.map((p: any) => ({
    label: p.fee?.type === 'HOSTEL' ? 'Hostel & Residential Fees' : 'Academic Tuition Fees',
    sub: p.fee?.month ? `Monthly — ${p.fee.month}` : `Course: ${p.fee?.course?.name}`,
    lateFee: p.fee?.lateFee || 0,
    amount: p.amount,
  }));
  const words = `Rupees ${amountInWords(Math.round(grandTotal))} Only`;

  return (
    <div style={{ width: "105mm", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "148mm" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2.5px solid ${accent}`, paddingBottom: "3mm", marginBottom: "3mm" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2.5mm" }}>
          <img src="/logo.png" alt="" style={{ height: "10mm", width: "auto" }} />
          <div>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.2 }}>Rankers' Platform</div>
            <div style={{ fontSize: "5.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Diamond Harbour, WB</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ background: accent, color: "white", padding: "1mm 3mm", borderRadius: "2px", fontSize: "6.5px", fontWeight: 900, textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: "6px", fontWeight: 800, color: "#334155", marginTop: "1.5mm" }}>No: {receiptNo}</div>
          <div style={{ fontSize: "5.5px", color: "#94a3b8", marginTop: "0.5mm" }}>{dateStr}</div>
        </div>
      </div>

      {/* Copy label */}
      <div style={{ fontSize: "5.5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "2mm" }}>{copyFor}</div>

      {/* Student Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm", marginBottom: "3mm" }}>
        <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Student</div>
          <div style={{ fontSize: "8px", fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>{payment.student?.user?.name}</div>
          <div style={{ fontSize: "5.5px", color: "#64748b", marginTop: "0.5mm" }}>Reg: {payment.student?.regNo}</div>
          <div style={{ fontSize: "5.5px", color: "#64748b" }}>Course: {payment.fee?.course?.name}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: "2mm", borderRadius: "2px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1mm" }}>Payment Info</div>
          <div style={{ fontSize: "7px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>{payment.paymentMode}</div>
          {payment.transactionId && <div style={{ fontSize: "5.5px", color: "#64748b", marginTop: "0.5mm", wordBreak: "break-all" }}>ID: {payment.transactionId}</div>}
          <div style={{ fontSize: "5.5px", fontWeight: 900, color: "#059669", marginTop: "1mm" }}>✓ Verified</div>
        </div>
      </div>

      {/* Fee Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "6.5px" }}>
        <thead>
          <tr style={{ background: "#0f172a" }}>
            <th style={{ padding: "1.5mm 2mm", textAlign: "left", color: "white", fontWeight: 900, textTransform: "uppercase" }}>Description</th>
            <th style={{ padding: "1.5mm 2mm", textAlign: "right", color: "white", fontWeight: 900 }}>₹ Amt</th>
          </tr>
        </thead>
        <tbody>
          {feeRows.map((r: any, i: number) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "2mm", color: "#1e293b", fontWeight: 700 }}>
                {r.label}
                <div style={{ color: "#64748b", fontWeight: 500 }}>{r.sub}</div>
                {r.lateFee > 0 && <div style={{ color: "#dc2626", fontWeight: 800, fontSize: "5.5px" }}>Late Fine: ₹{r.lateFee}</div>}
              </td>
              <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: "#0f172a" }}>₹{r.amount.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {totalLateFee > 0 && (
            <tr style={{ borderTop: "1px solid #e2e8f0" }}>
              <td style={{ padding: "1.5mm 2mm", color: "#94a3b8", fontWeight: 700 }}>Late Fines</td>
              <td style={{ padding: "1.5mm 2mm", textAlign: "right", color: "#dc2626", fontWeight: 800 }}>₹{totalLateFee.toLocaleString('en-IN')}</td>
            </tr>
          )}
          <tr style={{ background: `${accent}18`, borderTop: `2px solid ${accent}` }}>
            <td style={{ padding: "2mm", fontWeight: 900, color: accent, fontSize: "8px", textTransform: "uppercase" }}>Grand Total</td>
            <td style={{ padding: "2mm", textAlign: "right", fontWeight: 900, color: accent, fontSize: "12px" }}>₹{grandTotal.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in words */}
      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "2px", padding: "2mm", marginTop: "2mm" }}>
        <span style={{ fontSize: "5.5px", fontWeight: 900, color: "#78350f", textTransform: "uppercase" }}>In Words: </span>
        <span style={{ fontSize: "6px", fontWeight: 700, color: "#92400e" }}>{words}</span>
      </div>

      {/* Signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "3mm", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "22mm", height: "0.5px", background: "#94a3b8", marginBottom: "1.5mm" }} />
          <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Receiver</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "22mm", height: "0.5px", background: "#94a3b8", marginBottom: "1.5mm" }} />
          <div style={{ fontSize: "5px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Authorized Sign</div>
        </div>
      </div>
    </div>
  );
}

function TwoUpReceipt(props: any) {
  return (
    <div style={{ width: "210mm", height: "148mm", display: "flex", flexDirection: "row", overflow: "hidden" }}>
      <HalfDoc {...props} label="Payment Receipt" accent="#059669" copyFor="▸ Student / Parent Copy" />
      <div style={{ width: "0", borderLeft: "1.5px dashed #94a3b8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", fontSize: "5.5px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", writingMode: "vertical-rl" }}>✂ Cut Here</div>
      </div>
      <HalfDoc {...props} label="Office Voucher" accent="#0f172a" copyFor="▸ Institution / Office Copy" />
    </div>
  );
}
