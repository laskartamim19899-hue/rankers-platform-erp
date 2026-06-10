"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { cbtApi } from "@/lib/api";

interface BulkUploadModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function BulkUploadModal({ onSuccess, onClose }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isMapping, setIsMapping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, current: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        setData(jsonData);
        setIsMapping(true);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setStats({ total: data.length, current: 0 });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        await cbtApi.createQuestion({
          subject: row.Subject || "GENERAL",
          topic: row.Topic || null,
          subTopic: row.SubTopic || null,
          section: row.Section || "A",
          content: row.QuestionContent || row.Question || "",
          explanation: row.Explanation || null,
          difficulty: row.Difficulty || "MEDIUM",
          correctOption: String(row.CorrectOption || "A"),
          options: [
            { id: "A", text: String(row.OptionA || "") },
            { id: "B", text: String(row.OptionB || "") },
            { id: "C", text: String(row.OptionC || "") },
            { id: "D", text: String(row.OptionD || "") },
          ]
        });
        setStats(prev => ({ ...prev, current: i + 1 }));
      } catch (err) {
        console.error("Failed to upload row", i, err);
      }
    }

    setIsUploading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bulk Question Upload</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Excel & CSV Processor</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!isMapping && !isUploading && (
          <div className="space-y-8">
            <div className="border-4 border-dashed border-slate-100 rounded-3xl p-12 text-center hover:border-indigo-200 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">upload_file</span>
              </div>
              <p className="text-lg font-black text-slate-700 mb-2">Drop your Excel file here</p>
              <p className="text-sm text-slate-400 font-medium italic">Supports .xlsx, .xls, and .csv formats</p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-amber-600">info</span>
                <div>
                  <p className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">Required Format</p>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Ensure your Excel has columns: <b>Subject, Topic, QuestionContent, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation.</b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMapping && !isUploading && (
          <div className="space-y-8">
            <div className="bg-indigo-50 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600 font-black">
                   {data.length}
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-900">Questions Detected</p>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{file?.name}</p>
                </div>
              </div>
              <button onClick={() => setFile(null) || setIsMapping(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500">Change File</button>
            </div>

            <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50 p-4">
               <table className="w-full text-left">
                 <thead className="sticky top-0 bg-slate-50 pb-4">
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                     <th className="py-2">Subject</th>
                     <th className="py-2">Question Preview</th>
                     <th className="py-2 text-right">Correct</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {data.slice(0, 10).map((row, idx) => (
                     <tr key={idx} className="text-xs">
                       <td className="py-3 font-bold text-slate-600">{row.Subject}</td>
                       <td className="py-3 text-slate-500 truncate max-w-[200px]">{row.QuestionContent || row.Question}</td>
                       <td className="py-3 text-right font-black text-emerald-600">{row.CorrectOption}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {data.length > 10 && <p className="text-center text-[10px] font-black text-slate-400 uppercase py-4">And {data.length - 10} more...</p>}
            </div>

            <button 
              onClick={handleUpload}
              className="w-full h-14 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Start Final Processing
            </button>
          </div>
        )}

        {isUploading && (
          <div className="text-center py-10 space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * (stats.current / stats.total))}
                  className="text-indigo-600 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-black text-slate-900">{Math.round((stats.current / stats.total) * 100)}%</p>
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 mb-2">Processing Questions...</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                Imported {stats.current} of {stats.total} questions
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: `${(stats.current / stats.total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
