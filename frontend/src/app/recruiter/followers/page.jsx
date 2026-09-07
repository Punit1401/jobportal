"use client";
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import FeatureGuard from '@/components/FeatureGuard';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import {
  Mail, ExternalLink, Loader2, Calendar, User, Briefcase, Phone,
  MapPin, X, GraduationCap, Globe, FileText, Trash2,
  Clock, Layers, Star, Search, Filter, IndianRupee, Rocket, MessageSquare, Building2, Users
} from 'lucide-react';

function FollowersListContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [professionFilter, setProfessionFilter] = useState("All");

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recruiter/followers');
      const data = await res.json();
      if (data.success) {
        setFollowers(data.followers || []);
      }
    } catch (err) {
      console.error("Fetch Followers Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

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

  // Filter Logic
  const filteredList = useMemo(() => {
    return followers.filter(f => {
      const name = f.fullName || "";
      const email = f.email || "";
      const skills = Array.isArray(f.skills) ? f.skills.join(" ") : (f.skills || "");
      const profession = f.profession || "N/A";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skills.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProfession = professionFilter === "All" || profession === professionFilter;

      return matchesSearch && matchesProfession;
    });
  }, [followers, searchQuery, professionFilter]);

  // Unique Professions
  const uniqueProfessions = useMemo(() => {
    const list = followers.map(f => f.profession).filter(Boolean);
    return ["All", ...new Set(list)];
  }, [followers]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <RecruiterSidebar activePage="followers" />

      <main className="flex-1 p-6 md:p-10 relative">
        <FeatureGuard featureName="Responses">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Building2 className="text-indigo-600 animate-pulse" size={32} />
                  Company Followers
                </h1>
                <p className="text-slate-500 font-medium mt-1">Candidates who are following your company profile.</p>
              </div>
              <button 
                onClick={fetchFollowers} 
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 text-xs font-bold text-slate-600 active:scale-95"
              >
                Refresh
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Followers</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{followers.length.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                  <Users size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtered Followers</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{filteredList.length.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                  <Star size={24} />
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-300/80 uppercase tracking-widest">Engaged Members</p>
                  <p className="text-3xl font-black text-indigo-300 mt-1">{followers.filter(f => f.skills?.length > 0).length.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl text-indigo-400">
                  <MessageSquare size={24} />
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search followers by name, email or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={professionFilter}
                  onChange={(e) => setProfessionFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold text-slate-600 appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="All">All Professions</option>
                  {uniqueProfessions.filter(p => p !== "All").map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid of Followers */}
            {loading ? (
              <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                <Building2 className="text-slate-300 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-black text-slate-900 mb-2">No Followers Found</h3>
                <p className="text-slate-400 font-medium">Try adjusting your search criteria or wait for candidates to follow your company.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((follower) => (
                  <div 
                    key={follower._id} 
                    onClick={() => setSelectedUser(follower)}
                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                          {follower.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{follower.fullName}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase">{follower.profession || "Candidate"}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 text-xs font-semibold text-slate-500">
                        {follower.currentCompanyName && (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            <span>At: {follower.currentCompanyName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span>{follower.email}</span>
                        </div>
                        {follower.city && (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            <span>{follower.city}, {follower.state}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills Tags */}
                      {follower.skills && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {(Array.isArray(follower.skills) ? follower.skills : follower.skills.split(',')).slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                              {skill.trim()}
                            </span>
                          ))}
                          {(Array.isArray(follower.skills) ? follower.skills : follower.skills.split(',')).length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{(Array.isArray(follower.skills) ? follower.skills : follower.skills.split(',')).length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChat(follower);
                        }}
                        disabled={startingChat}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={14} /> Chat
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FeatureGuard>

        {/* DETAILS PANEL SLIDE-OVER */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-0 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900">Follower Insights</h2>
                  <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase">Profile Details</p>
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
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
                </div>
              </div>

              <div className="p-4 md:p-8 space-y-8 md:space-y-10 pb-32">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl font-black">
                      {selectedUser.fullName?.charAt(0)}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-black mb-1">{selectedUser.fullName}</h3>
                      <p className="text-indigo-300 font-bold text-base md:text-lg">{selectedUser.profession || "Candidate"}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                        {selectedUser.city && (
                          <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest">
                            <MapPin size={10} /> {selectedUser.city}, {selectedUser.state}
                          </span>
                        )}
                        {selectedUser.currentCompanyName && (
                          <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest">
                            <Briefcase size={10} /> {selectedUser.currentCompanyName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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

                {selectedUser.skills && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedUser.skills) ? selectedUser.skills : selectedUser.skills.split(',')).map((skill, i) => (
                        <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100 uppercase">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.resume && (
                  <div className="pt-6">
                    <a 
                      href={selectedUser.resume} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-6 bg-indigo-600 rounded-[2rem] text-white hover:bg-indigo-700 transition-all group shadow-xl shadow-indigo-200/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                        <div>
                          <p className="font-black text-lg">View Resume</p>
                          <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Verify Credentials</p>
                        </div>
                      </div>
                      <ExternalLink size={20} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function FollowersList() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
      <FollowersListContent />
    </Suspense>
  );
}
