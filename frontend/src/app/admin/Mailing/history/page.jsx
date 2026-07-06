"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Clock, Eye, Users, Calendar, BarChart3, Mail, X, AlertCircle } from "lucide-react";

export default function MailHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // Modal માટે

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    fetch("/api/mailHistory")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <a href="/admin/Mailing" className="flex items-center gap-2 text-slate-400 font-bold mb-4 hover:text-indigo-600 transition-colors w-fit group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase tracking-[0.2em]">Back to Mailer</span>
            </a>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Campaign <span className="text-indigo-600">History</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <BarChart3 size={12} className="text-indigo-400" /> Performance & Analytics Dashboard
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-8 py-4 rounded-1.5rem shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 font-black text-xl">
                {history.length}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 leading-tight">Total<br />Campaigns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-70">Deployment Info</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-70">Campaign Details</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-70 text-center">Reach</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-70 text-center">Engagement</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-70 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr><td colSpan="5" className="p-32 text-center font-black text-slate-300 animate-pulse uppercase italic tracking-widest">Fetching Data...</td></tr>
                ) : history.length > 0 ? (
                  history.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            <Calendar size={18} />
                          </div>
                          <div>

                            <p className="text-xs font-black text-slate-800">
                              {new Date(h.createdAt).toLocaleDateString('en-GB')}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                        <p className="font-black text-sm text-slate-800 uppercase italic tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{h.subject}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-slate-100 text-[8px] font-black uppercase text-slate-500 rounded-md border border-slate-200">
                            Target: {h.targetType || "All"}
                          </span>
                        </div>
                      </td>

                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-slate-800 font-black text-base">
                            <Users size={16} className="text-indigo-400" /> {h.recipientsCount || 0}
                          </div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Recipients</p>
                        </div>
                      </td>

                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center px-5 py-2.5 bg-indigo-50 rounded-2xl border border-indigo-100 group-hover:bg-indigo-600 transition-all duration-300">
                          <div className="flex items-center gap-1.5 text-indigo-600 font-black text-base group-hover:text-white transition-colors">
                            <Eye size={16} /> {h.opens || 0}
                          </div>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter group-hover:text-indigo-100">Unique Opens</p>
                        </div>
                      </td>

                      <td className="p-6 text-right">
                        <button
                          onClick={() => setSelectedCampaign(h)}
                          className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all flex items-center gap-2 ml-auto"
                        >
                          <Mail size={14} /> View Log
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-32 text-center text-slate-300 uppercase font-black italic tracking-widest">No Campaigns Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- DETAILED EMAIL LOG MODAL --- */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">

              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900">{selectedCampaign.subject}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Detailed Recipient Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="p-3 bg-white text-slate-400 rounded-full shadow-sm hover:text-red-500 hover:rotate-90 transition-all duration-300 border border-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">

                {/* SUCCESS LIST */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 border-emerald-100">
                    <h3 className="text-emerald-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={14} /> Sent Successfully
                    </h3>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black">
                      {selectedCampaign.sentEmails?.length || selectedCampaign.recipientsCount || 0}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCampaign.sentEmails?.length > 0 ? (
                      selectedCampaign.sentEmails.map((email, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-xl border border-slate-100 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          {email}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-300 text-[10px] italic font-bold text-center py-10">No specific email records found for this older campaign.</p>
                    )}
                  </div>
                </div>

                {/* FAILED / PENDING LIST */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 border-red-100">
                    <h3 className="text-red-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} /> Failed / Bounced
                    </h3>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black">
                      {selectedCampaign.failedEmails?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCampaign.failedEmails?.length > 0 ? (
                      selectedCampaign.failedEmails.map((email, idx) => (
                        <div key={idx} className="p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          {email}
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 text-center">
                        <CheckCircle size={32} className="mb-2 text-emerald-500" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">100% Delivery Success</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <button onClick={() => setSelectedCampaign(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                  Close Detailed Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em]">
          ShivEn Group Mailing Engine © 2026
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}