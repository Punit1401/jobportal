"use client";
import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronRight, Bookmark, Bell, Loader2, Sparkles } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [stats, setStats] = useState({ applied: 0, interviews: 0, saved: 0 });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ૧. યુઝરની પ્રોફાઇલ ફેચ કરો (Skills, Education વગેરે માટે)
        let userSkills = [];
        if (session?.user?.email) {
          const userRes = await fetch(`/api/candidates?email=${session.user.email}`);
          const userData = await userRes.json();
          if (userData.ok && userData.data) {
            userSkills = userData.data.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
          }
        }

        // ૨. બધી નોકરીઓ ફેચ કરો
        const jobsRes = await fetch('/api/jobs');
        if (!jobsRes.ok) {
          setJobs([]);
          return;
        }
        const jobsData = await jobsRes.json();

        // ૩. પ્રોફાઇલ મેચિંગ લોજિક (Recommended Jobs)
        let recommended = Array.isArray(jobsData) ? jobsData : [];

        if (userSkills.length > 0) {
          recommended = recommended.filter(job => {
            const jobText = `${job.title} ${job.description} ${job.requirements?.join(' ')}`.toLowerCase();
            return userSkills.some(skill => jobText.includes(skill));
          });
        }

        setJobs(recommended.slice(0, 8));

        // ૪. એપ્લિકેશન ફેચ કરો
        const appRes = await fetch('/api/applications');
        if (!appRes.ok) return;
        const appResult = await appRes.json();

        if (appResult.ok && Array.isArray(appResult.data)) {
          const apps = appResult.data;
          setStats(prev => ({
            ...prev,
            applied: apps.length,
            interviews: apps.filter(a => a.status?.toLowerCase() === 'approved').length
          }));
        }
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const handleAutoApply = async () => {
    if (selectedJobs.length === 0) {
      alert("Please select at least one job to apply.");
      return;
    }

    try {
      setApplying(true);
      const selectedJobData = jobs
        .filter(j => selectedJobs.includes(j._id))
        .map(j => ({
          jobId: j._id,
          recruiterId: j.recruiterId,
          role: j.title
        }));

      const res = await fetch('/api/user/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedJobs: selectedJobData }),
      });

      const data = await res.json();
      if (data.ok) {
        alert(`Successfully applied to ${data.results.filter(r => r.status === 'success').length} jobs!`);
        setSelectedJobs([]);
        // Update stats
        const newApps = data.results.filter(r => r.status === 'success').length;
        setStats(prev => ({ ...prev, applied: prev.applied + newApps }));
      } else {
        alert(data.error || "Auto-apply failed.");
      }
    } catch (error) {
      alert("An error occurred during auto-apply.");
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 
        ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>

        <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto">

          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Hello, <span className="text-indigo-600">{session?.user?.name?.split(' ')[0] || "User"}</span> 👋
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Ready to find your next big opportunity?</p>
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl relative shadow-sm hover:shadow-md transition-all">
              <Bell size={24} />
              <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
          </header>

          {/* SEARCH BAR */}
          <div className="flex-[2] relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search job title, company..."
              className="w-full pl-14 pr-4 py-4.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white font-medium text-sm transition-all border border-transparent focus:border-indigo-500"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 mt-8">
            {[
              { label: "Applied Jobs", value: stats.applied, color: "text-indigo-600", bg: "bg-indigo-50", href: "/user/status" },
              { label: "Approved", value: stats.interviews, color: "text-emerald-600", bg: "bg-emerald-50", href: "/user/status" },
              { label: "Saved Jobs", value: stats.saved, color: "text-amber-600", bg: "bg-amber-50", href: "/careers" },
            ].map((stat, i) => (
              <Link href={stat.href} key={i} className="bg-white p-7 rounded-[32px] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value.toString().padStart(2, '0')}</p>
                </div>
                <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <ChevronRight size={24} />
                </div>
              </Link>
            ))}
          </div>

          {/* RECOMMENDED JOBS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">Recommended for you</h3>
              {selectedJobs.length > 0 && (
                <button 
                  onClick={handleAutoApply}
                  disabled={applying}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {applying ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Auto-Applying ({selectedJobs.length})
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
            ) : (
              jobs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No jobs found matching your profile yet.</p>
                  <Link href="/user/profile" className="text-indigo-600 font-bold mt-2 inline-block">Update your skills →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {filteredJobs.map((job) => (
                    <div key={job._id} className="relative group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all ${selectedJobs.includes(job._id) ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                      <div className={`bg-white p-6 rounded-[32px] border transition-all flex flex-col sm:flex-row items-center gap-6 ${selectedJobs.includes(job._id) ? 'border-indigo-200 shadow-xl shadow-indigo-50/50 bg-indigo-50/10' : 'border-slate-100 hover:border-indigo-100'}`}>
                        
                        {/* Checkbox */}
                        <div 
                          onClick={() => toggleJobSelection(job._id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedJobs.includes(job._id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-slate-50'}`}
                        >
                          {selectedJobs.includes(job._id) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                        </div>

                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 group-hover:scale-110 transition-transform">
                          {job.title?.charAt(0)}
                        </div>
                        
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start">
                            <Link href={`/careers?jobId=${job._id}`}>
                              <h4 className="font-bold text-slate-900 text-xl hover:text-indigo-600 transition-colors">{job.title}</h4>
                            </Link>
                            <button className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Bookmark size={20} />
                            </button>
                          </div>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {job.location}
                          </p>
                          <div className="mt-5 flex justify-between items-center">
                            <div className="flex gap-2">
                              <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100">
                                {job.salaryRange || "Best in Class"}
                              </span>
                              {job.type && (
                                <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100">
                                  {job.type}
                                </span>
                              )}
                            </div>
                            <Link href={`/careers?jobId=${job._id}`} className="text-[10px] font-black uppercase bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200">
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}