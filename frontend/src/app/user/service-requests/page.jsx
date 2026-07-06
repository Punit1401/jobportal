"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PlusCircle, MessageSquare, CheckCircle, Clock, Send, Loader2 } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';

export default function ServiceRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/service-requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) return alert("Please fill all fields");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Service Request submitted successfully!");
        setSubject("");
        setMessage("");
        setShowForm(false);
        fetchRequests();
      } else {
        alert(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request", error);
      alert("Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <MessageSquare className="text-indigo-600" size={36} />
                Service Requests
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Need help? Submit a request and our admin team will respond to you shortly.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              {showForm ? "Cancel Request" : (
                <>
                  <PlusCircle size={18} /> New Request
                </>
              )}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-[2rem] p-8 mb-10 border border-slate-100 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Request</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-medium"
                    placeholder="e.g. Issue with account setup"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-medium resize-y"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : (
                      <>
                        <Send size={18} /> Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Service Requests</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                You haven't submitted any service requests yet. If you need help, feel free to create one!
              </p>
              {!showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Create Request
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((req) => (
                <div key={req._id} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{req.subject}</h3>
                      <p className="text-sm font-medium text-slate-400 mt-1">
                        Submitted on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      {req.status === "Pending" ? (
                        <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                          <Clock size={14} /> Pending
                        </span>
                      ) : req.status === "Answered" ? (
                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                          <CheckCircle size={14} /> Answered
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                          <CheckCircle size={14} /> Closed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6">
                    <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{req.message}</p>
                  </div>

                  {req.adminReply && (
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden">
                      {/* Decorative background element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-[100px] -mr-8 -mt-8 opacity-50"></div>
                      
                      <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md">
                          A
                        </div>
                        <span className="font-bold text-indigo-900 uppercase tracking-widest text-xs">Admin Response</span>
                      </div>
                      <p className="text-indigo-800 font-medium pl-14 whitespace-pre-wrap leading-relaxed relative z-10">
                        {req.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
