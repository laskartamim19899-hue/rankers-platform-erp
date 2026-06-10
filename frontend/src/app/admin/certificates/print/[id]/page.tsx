'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function CertificatePrintPage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCertificate(id as string);
    }
  }, [id]);

  const fetchCertificate = async (certId: string) => {
    try {
      const res = await api.get(`/certificates/${certId}`);
      if (res.data.success) {
        setCertificate(res.data.certificate);
        // Automatically trigger print dialog once loaded
        setTimeout(() => {
          window.print();
        }, 800);
      } else {
        alert('Certificate not found');
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
      alert('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Preparing Document...</div>;
  if (!certificate) return <div className="p-8 text-center text-red-500">Document not found.</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-8 flex justify-center items-center print:bg-white print:p-0">
      
      {/* Outer Certificate Container with Gold Border */}
      <div className="relative w-[1100px] h-[800px] bg-white p-4 shadow-2xl print:shadow-none print:border-none print:w-[100%] print:h-[100vh]">
        
        {/* Inner Intricate Border */}
        <div className="relative w-full h-full border-[10px] border-double border-amber-500 p-2">
          <div className="relative w-full h-full border border-amber-300 p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#fffdf5] to-[#fdf9e8]">
            
            {/* Watermark Background */}
            <div className="absolute inset-0 flex justify-center items-center opacity-[0.07] pointer-events-none">
              <img src="/logo.png" alt="Watermark" className="w-[600px] h-auto grayscale" />
            </div>

            {/* Corner Ornaments */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500"></div>

            {/* Header Section */}
            <div className="text-center relative z-10">
              <h1 className="text-5xl md:text-6xl font-extrabold uppercase tracking-widest text-[#1e3a8a] font-serif mb-2 drop-shadow-sm">
                Rankers' Platform
              </h1>
              <p className="text-lg md:text-xl text-amber-700 tracking-[0.2em] uppercase font-medium">
                Excellence in Education
              </p>
              
              <div className="flex justify-center items-center my-8">
                <div className="h-[2px] w-24 bg-amber-400"></div>
                <svg className="w-8 h-8 text-amber-500 mx-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="h-[2px] w-24 bg-amber-400"></div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold uppercase text-gray-800 tracking-wider font-serif">
                {certificate.type} Certificate
              </h2>
            </div>

            {/* Body Section */}
            <div className="text-center text-xl md:text-2xl leading-relaxed space-y-8 px-12 my-auto relative z-10 font-serif text-gray-700">
              <p className="italic text-gray-600">This is to proudly certify that</p>
              
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 border-b-2 border-amber-400 inline-block px-12 pb-2">
                {certificate.student?.user?.name || 'Student Name'}
              </h3>
              
              <p>
                bearing Registration Number <span className="font-semibold text-gray-900">{certificate.student?.regNo || '---'}</span>
              </p>
              
              <p className="max-w-3xl mx-auto">
                is recognized as a bona fide student of our prestigious institution. 
                This document is officially issued based on the institution's verified records 
                for their continued pursuit of academic excellence.
              </p>
              
              {certificate.remarks && (
                <p className="text-lg text-amber-800 italic mt-4">
                  "{certificate.remarks}"
                </p>
              )}
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-end px-16 relative z-10 mt-12">
              
              {/* Date & Reference */}
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800 border-b border-gray-400 pb-1 w-48 mx-auto">
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-500 uppercase tracking-widest text-sm mt-2 font-semibold">Date of Issue</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">Ref: {certificate.referenceNumber}</p>
              </div>

              {/* Seal Badge */}
              <div className="relative flex justify-center items-center w-32 h-32">
                <div className="absolute inset-0 bg-amber-500 rounded-full flex justify-center items-center border-4 border-amber-600 shadow-lg">
                  <div className="w-28 h-28 border border-dashed border-amber-100 rounded-full flex flex-col justify-center items-center text-amber-50">
                    <span className="text-xs font-bold uppercase tracking-wider">Official</span>
                    <svg className="w-6 h-6 my-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Seal</span>
                  </div>
                </div>
              </div>

              {/* Signatory */}
              <div className="text-center">
                <div className="h-12 flex items-end justify-center">
                  <span className="font-signature text-3xl text-blue-900 -rotate-3 mb-1">
                    {certificate.issuedBy}
                  </span>
                </div>
                <div className="border-b border-gray-400 w-56 mx-auto mb-1"></div>
                <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Authorized Signatory</p>
                <p className="text-xs text-gray-400 mt-1">Rankers' Platform</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
