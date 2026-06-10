'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CertificateRecord {
  id: string;
  studentId: string;
  type: string;
  issueDate: string;
  referenceNumber: string;
  issuedBy: string;
  remarks?: string;
  student: {
    user?: {
      name: string;
    };
    regNo: string;
  };
}

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Issue Certificate Form State
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [certType, setCertType] = useState('BONAFIDE');
  const [remarks, setRemarks] = useState('');
  
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates');
      if (res.data.success) {
        setCertificates(res.data.certificates);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo) return alert("Please provide a Registration Number");
    
    try {
      const refNo = `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      await api.post('/certificates/issue', {
        regNo,
        type: certType,
        referenceNumber: refNo,
        remarks
      });
      
      setShowIssueForm(false);
      setRegNo(''); setRemarks('');
      fetchCertificates();
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate. Ensure the Registration Number is valid.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate record?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Failed to delete certificate');
    }
  };

  const handlePrint = (id: string) => {
    window.open(`/admin/certificates/print/${id}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading certificate records...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Document & Certificate Hub
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Issue, manage, and print official student documents instantly</p>
        </div>
        <button 
          onClick={() => setShowIssueForm(!showIssueForm)}
          className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          {showIssueForm ? 'Cancel Creation' : '+ Issue New Certificate'}
        </button>
      </div>

      {showIssueForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 relative overflow-hidden transform transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Issue New Document
          </h2>
          <form onSubmit={handleIssueCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Student Registration Number</label>
              <input 
                required 
                placeholder="e.g. 1001" 
                value={regNo} 
                onChange={e => setRegNo(e.target.value)} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Document Type</label>
              <select 
                value={certType} 
                onChange={e => setCertType(e.target.value)} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-medium cursor-pointer"
              >
                <option value="BONAFIDE">Bonafide Certificate</option>
                <option value="TRANSFER">Transfer Certificate (TC)</option>
                <option value="LEAVING">School Leaving Certificate</option>
                <option value="CHARACTER">Character Certificate</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-gray-700">Remarks / Special Notes</label>
              <textarea 
                placeholder="Add any specific observations, validities, or reasons..." 
                value={remarks} 
                onChange={e => setRemarks(e.target.value)} 
                rows={3}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Generate & Record Certificate
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Recent Issuance Log
          </h2>
        </div>
        
        {certificates.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">No certificates have been issued yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4 font-semibold">Ref Number</th>
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">Reg No</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Issue Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {certificates.map(cert => (
                  <tr key={cert.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{cert.referenceNumber}</td>
                    <td className="p-4 text-gray-700">{cert.student?.user?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-500">{cert.student?.regNo || 'N/A'}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cert.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(cert.issueDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handlePrint(cert.id)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Print PDF</button>
                      <button onClick={() => handleDelete(cert.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
