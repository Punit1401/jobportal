"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, CheckCircle, Clock, Search, Send, Loader2 } from "lucide-react";

export default function AdminServiceRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [replyText, setReplyText] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleReplySubmit = async (id) => {
    if (!replyText[id]) return alert("Please enter a reply");
    
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminReply: replyText[id] }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Replied successfully!");
        setReplyText((prev) => ({ ...prev, [id]: "" }));
        fetchRequests();
      } else {
        alert(data.error || "Failed to reply");
      }
    } catch (error) {
      console.error("Error replying to request", error);
      alert("Error replying to request");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.userRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.userId?.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={32} />
            Service Requests
          </h1>
          <p className="text-gray-500 mt-1">Manage and respond to user inquiries and support requests.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by subject or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Requests Found</h3>
          <p className="text-gray-500">There are no service requests matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((req) => (
            <div key={req._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{req.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {req.userId?.name || req.userId?.fullName || "Unknown User"}
                      </span>
                      <span className="text-blue-600 font-bold">({req.userId?.email || req.userEmail || "No Email"})</span>
                      <span>•</span>
                      <span className="text-xs">{new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                    <div>
                      {(() => {
                        const role = req.userRole || req.userId?.role || "candidate";
                        const isRecruiter = role.toLowerCase() === 'recruiter';
                        return (
                          <span className={`mr-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isRecruiter ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                            {role}
                          </span>
                        );
                      })()}
                      {req.status === "Pending" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold uppercase tracking-wider border border-yellow-100">
                          <Clock size={14} /> Pending
                        </span>
                      ) : req.status === "Answered" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold uppercase tracking-wider border border-green-100">
                          <CheckCircle size={14} /> Answered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold uppercase tracking-wider border border-gray-200">
                          <CheckCircle size={14} /> Closed
                        </span>
                      )}
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{req.message}</p>
                </div>

                {req.adminReply ? (
                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        A
                      </div>
                      <span className="font-semibold text-blue-900 text-sm">Your Reply</span>
                    </div>
                    <p className="text-blue-800 text-sm pl-10 whitespace-pre-wrap leading-relaxed">
                      {req.adminReply}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Write a Response
                    </label>
                    <div className="relative">
                      <textarea
                        value={replyText[req._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [req._id]: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Type your response here to help the user..."
                      />
                      <button
                        onClick={() => handleReplySubmit(req._id)}
                        disabled={submittingId === req._id || !replyText[req._id]?.trim()}
                        className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                      >
                        {submittingId === req._id ? "Sending..." : "Send Reply"}
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
