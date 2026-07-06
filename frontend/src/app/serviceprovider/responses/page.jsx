"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Serviceprovidersidbar';
import { Send, User, Loader2, MessageSquare, Clock } from 'lucide-react';

export default function ResponsesPage() {
  const { data: session } = useSession();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/serviceprovider/Inquiry')
        .then(res => res.json())
        .then(data => {
          if (data.success) setInquiries(data.inquiries);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex flex-col lg:flex-row">
      <Sidebar activePage="responses" />
      <main className="flex-1 p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Client Responses</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Inbox ({inquiries.length})</p>
        </header>

        <div className="grid gap-4">
          {inquiries.length > 0 ? inquiries.map((item) => (
            <div key={item._id} className="bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-black">
                  {item.clientName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-800">{item.clientName}</h3>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase tracking-tighter">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 font-black uppercase mb-2">{item.serviceTitle}</p>
                  <p className="text-sm text-slate-500 font-medium italic">"{item.message}"</p>
                </div>
                <div className="flex gap-2">
                   <a href={`mailto:${item.clientEmail}`} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2">
                     <Send size={16} /> Reply
                   </a>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <MessageSquare size={40} className="text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold italic">No inquiries received yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}