"use client";
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import FeatureGuard from '@/components/FeatureGuard';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import {
  Mail, ExternalLink, Loader2, Calendar, User, Briefcase, Phone,
  MapPin, X, CheckCircle, XCircle, GraduationCap, Globe, FileText, Trash2,
  Clock, Layers, Star, Search, Filter, IndianRupee, Rocket, MessageSquare
} from 'lucide-react';

function CandidateListContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search') || "";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  const handleStartChat = async (user) => {
    if (startingChat) return;
    try {
      setStartingChat(true);
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: user.userId,
          candidateEmail: user.email,
          recruiterId: session?.user?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push("/recruiter/chat");
      } else {
        alert(data.error || "Failed to start chat with candidate.");
      }
    } catch (err) {
      console.error("Start chat error:", err);
      alert("Error starting chat.");
    } finally {
      setStartingChat(false);
    }
  };

  // --- ફિલ્ટર સ્ટેટ્સ ---
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [expFilter, setExpFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.ok) {
        setList(data.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  // --- એડવાન્સ્ડ ફિલ્ટર લોજિક (સુધારેલું) ---
  const filteredList = useMemo(() => {
    return list.filter(app => {
      const name = app.name || "";
      const email = app.email || "";
      const status = app.status || "Pending";
      const role = app.role || app.jobRole || "N/A";
      const exp = app.experience || "Fresher";
      const cat = app.category || "General";
      const type = app.jobType || "Full-time";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesRole = roleFilter === "All" || role === roleFilter;
      const matchesExp = expFilter === "All" || exp === expFilter;
      const matchesCat = catFilter === "All" || cat === catFilter;
      const matchesType = typeFilter === "All" || type === typeFilter;

      return matchesSearch && matchesStatus && matchesRole && matchesExp && matchesCat && matchesType;
    });
  }, [list, searchQuery, statusFilter, roleFilter, expFilter, catFilter, typeFilter]);

  // ડ્રોપડાઉન માટે યુનિક વેલ્યુઝ કાઢવા (Dynamic Options)
  const uniqueRoles = useMemo(() => ["All", ...new Set(list.map(item => item.role || item.jobRole).filter(Boolean))], [list]);
  const uniqueExps = useMemo(() => ["All", ...new Set(list.map(item => item.experience || "Fresher"))], [list]);
  const uniqueCats = useMemo(() => ["All", ...new Set(list.map(item => item.category || "General"))], [list]);
  const uniqueTypes = useMemo(() => ["All", ...new Set(list.map(item => item.jobType || "Full-time"))], [list]);

  const handleStatusUpdate = async (id, newStatus) => {
    const res = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    if (res.ok) {
      alert(`Application ${newStatus}`);
      setSelectedUser(null);
      fetchCandidates();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Application deleted successfully");
        setSelectedUser(null);
        fetchCandidates();
      }
    } catch (err) {
      alert("Failed to delete application");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <RecruiterSidebar activePage="candidate" />

      <main className="flex-1 p-6 md:p-10 relative">
        <FeatureGuard featureName="Responses">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Applications Management</h1>
              <button onClick={fetchCandidates} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all">
                <Globe size={18} className="text-indigo-600" />
              </button>
            </div>

            {/* --- MULTI-FILTER BAR --- */}
            <div className="space-y-4 mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by candidate name or email..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-xs font-bold text-slate-600 outline-none">
                  <option value="All">All Roles</option>
                  {uniqueRoles.filter(r => r !== "All").map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <select value={expFilter} onChange={(e) => setExpFilter(e.target.value)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-xs font-bold text-slate-600 outline-none">
                  <option value="All">All Experience</option>
                  {uniqueExps.filter(e => e !== "All").map(e => <option key={e} value={e}>{e}</option>)}
                </select>

                <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-xs font-bold text-slate-600 outline-none">
                  <option value="All">All Categories</option>
                  {uniqueCats.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-xs font-bold text-slate-600 outline-none">
                  <option value="All">All Types</option>
                  {uniqueTypes.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-xs font-bold text-slate-600 outline-none">
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
              ) : filteredList.length === 0 ? (
                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No matching applications found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px] md:min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Role & Project</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bid / Exp</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {filteredList.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setSelectedUser(app)}>
                          <td className="px-6 py-5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{app.name?.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-slate-800">{app.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{app.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-600">{app.role || app.jobRole || "N/A"}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase">{app.projectName || app.category || "General"}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              {app.bidAmount ? (
                                <span className="font-black text-emerald-600 flex items-center gap-1 text-xs tracking-tighter">
                                  <IndianRupee size={12} /> {app.bidAmount}
                                </span>
                              ) : (
                                <span className="font-bold text-slate-600">{app.experience || "Fresher"}</span>
                              )}
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold w-fit italic">{app.jobType || "Full-time"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${(app.status || 'Pending') === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                (app.status || 'Pending') === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                              {app.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-indigo-600 font-bold text-xs hover:underline">View Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </FeatureGuard>

        {/* --- FULL DETAILS SLIDE-OVER --- */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-0 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900">Application Insight</h2>
                  <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase">ID: {selectedUser._id?.slice(-8)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleStartChat(selectedUser)}
                    disabled={startingChat}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {startingChat ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                    Chat
                  </button>
                  <button onClick={() => handleDelete(selectedUser._id)} className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors"><Trash2 size={20} /></button>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
                </div>
              </div>

              <div className="p-4 md:p-8 space-y-8 md:space-y-10 pb-32">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl font-black">
                      {selectedUser.name?.charAt(0)}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-black mb-1">{selectedUser.name}</h3>
                      <p className="text-indigo-300 font-bold text-base md:text-lg">{selectedUser.role || selectedUser.jobRole || selectedUser.profession}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                        <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest"><Layers size={10} /> {selectedUser.category || "General"}</span>
                        <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest"><Star size={10} /> {selectedUser.experience || "Fresher"}</span>
                        <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest"><Clock size={10} /> {selectedUser.jobType || "Full-time"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Freelance / Bidding Section --- */}
                {selectedUser.bidAmount && (
                   <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Rocket size={12}/> Proposal Bid</p>
                      <p className="text-2xl font-black text-emerald-700 flex items-center tracking-tighter">
                        <IndianRupee size={20} /> {selectedUser.bidAmount}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Timeline</p>
                       <p className="font-bold text-slate-700">{selectedUser.timeline || "As per project"}</p>
                    </div>
                   </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                    <p className="font-bold text-slate-800 break-all text-sm">{selectedUser.email}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedUser.mobile || 'Not Linked'}</p>
                  </div>
                </div>

                {/* Freelance Project Description if exists */}
                {selectedUser.projectName && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-[0.2em]">Project Applied For</div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <h4 className="text-lg font-black text-indigo-600 mb-2">{selectedUser.projectName}</h4>
                       <p className="text-slate-600 text-sm leading-relaxed">{selectedUser.projectBrief || "Candidate applied for this specific freelance task."}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]"><Briefcase size={16} /> Work History</div>
                  <div className="relative border-l-2 border-indigo-100 pl-8 space-y-2">
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <h4 className="text-xl font-black text-slate-800">{selectedUser.currentCompanyName || "Open to Opportunities"}</h4>
                    <p className="text-indigo-600 font-black text-xs bg-indigo-50 px-2 py-1 rounded-md inline-block uppercase tracking-wider">{selectedUser.jobDepartment || "N/A"} • {selectedUser.jobIndustry || "N/A"}</p>
                    <p className="text-slate-400 text-[10px] font-black uppercase mt-1">{selectedUser.jobFromDate} — {selectedUser.jobToDate || "Present"}</p>
                    <div className="bg-slate-50 p-6 rounded-3xl text-slate-600 text-sm leading-relaxed border border-dashed border-slate-200 mt-4">{selectedUser.jobDescription || "The candidate has not provided a specific job description for this role."}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em]"><GraduationCap size={18} /> Education</div>
                  <div className="grid gap-4">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-slate-800 text-lg">{selectedUser.graduationSpecialization || "Graduation"}</h5>
                          <p className="text-slate-500 font-bold text-xs">{selectedUser.graduationUniversity || "University Details N/A"}</p>
                        </div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">{selectedUser.graduationPercentage || 0}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Class XII</p>
                        <p className="font-black text-slate-800 text-lg">{selectedUser.classXIIPercentage || 0}%</p>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Class X</p>
                        <p className="font-black text-slate-800 text-lg">{selectedUser.classXPercentage || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills && (Array.isArray(selectedUser.skills) ? selectedUser.skills : selectedUser.skills.split(',')).map((skill, i) => (
                        <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100 uppercase">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Portfolios</p>
                    <div className="flex flex-col gap-2">
                      {selectedUser.github && <a href={selectedUser.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-slate-700 text-xs font-black hover:bg-slate-200 transition-all"><span>GitHub</span> <ExternalLink size={14} /></a>}
                      {selectedUser.portfolio && <a href={selectedUser.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl text-indigo-700 text-xs font-black hover:bg-indigo-100 transition-all"><span>Portfolio</span> <ExternalLink size={14} /></a>}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {selectedUser.resumeUrl && (
                    <a href={selectedUser.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-indigo-600 rounded-[2rem] text-white hover:bg-indigo-700 transition-all group shadow-xl shadow-indigo-200/50">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                        <div>
                          <p className="font-black text-lg">Download Resume</p>
                          <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Verify Credentials</p>
                        </div>
                      </div>
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>

                <div className="fixed bottom-6 left-auto right-12 w-[calc(100%-4rem)] max-w-lg bg-white/80 backdrop-blur-xl p-4 rounded-[2.5rem] border border-slate-100 shadow-2xl flex gap-3 z-20">
                  <button onClick={() => handleStatusUpdate(selectedUser._id, 'Approved')} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200"><CheckCircle size={18} /> APPROVE</button>
                  <button onClick={() => handleStatusUpdate(selectedUser._id, 'Rejected')} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200"><XCircle size={18} /> REJECT</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CandidateList() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
      <CandidateListContent />
    </Suspense>
  );
}