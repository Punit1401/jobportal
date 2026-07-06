"use client";

import { useEffect, useState } from "react";
import MarkdownIt from "markdown-it";
import { useSession } from "next-auth/react";
import UserSidebar from "@/components/UserSidebar";
import ReviewSystem from "@/components/ReviewSystem";
import { Search, MapPin, Briefcase, Building, ChevronRight, Filter, X, Star } from 'lucide-react';


const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("All");

  // App State
  const [showForm, setShowForm] = useState(false);
  const [app, setApp] = useState({ phone: "", pricing: "", additionalInfo: "", resume: null });
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        const published = data.filter(j => j.published);
        setCategories([...new Set(published.map(j => j.jobCategory))]);
        
        let filtered = published;
        if (categoryFilter !== "All") filtered = filtered.filter(j => j.jobCategory === categoryFilter);
        if (jobTypeFilter !== "All") filtered = filtered.filter(j => j.type === jobTypeFilter);
        if (experienceFilter !== "All") filtered = filtered.filter(j => j.experienceLevel === experienceFilter);
        
        setJobs(filtered);
        if (filtered.length > 0 && !selectedJob) setSelectedJob(filtered[0]._id);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchJobs();
  }, [categoryFilter, jobTypeFilter, experienceFilter]);

  const selectedJobData = jobs.find(j => j._id === selectedJob);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        {/* --- Top Navbar Inside Main --- */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
             <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search jobs, companies..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium"
                />
             </div>
             <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-2.5 bg-slate-100 rounded-xl">
               <Filter size={20} className="text-slate-600" />
             </button>
          </div>
          <div className="hidden md:flex gap-3">
             <select onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg outline-none">
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <select onChange={(e) => setJobTypeFilter(e.target.value)} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg outline-none">
                <option value="All">Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
             </select>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)] overflow-hidden">
          {/* --- Left Column: Job Cards --- */}
          <div className="w-full lg:w-400px border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-10 animate-pulse">Loading...</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <div 
                    key={job._id}
                    onClick={() => setSelectedJob(job._id)}
                    className={`p-5 cursor-pointer transition-all hover:bg-slate-50 relative ${selectedJob === job._id ? "bg-indigo-50/50" : ""}`}
                  >
                    {selectedJob === job._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600">{job.title}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-slate-500 flex items-center gap-1.5"><Building size={14}/> {job.company}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5"><MapPin size={14}/> {job.location}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{job.type}</span>
                      <span className="text-indigo-600 text-[10px] font-bold uppercase">{job.experienceLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- Right Column: Job Details --- */}
          <div className="hidden lg:block flex-1 bg-white overflow-y-auto p-10">
            {selectedJobData ? (
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">{selectedJobData.title}</h2>
                    <p className="text-lg text-indigo-600 font-bold mt-1">{selectedJobData.company}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => document.getElementById('company-reputation')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center gap-2"
                    >
                      <Star size={18} /> Reviews
                    </button>
                    <button 
                      onClick={() => setShowForm(true)}
                      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>

                <div className="flex gap-6 mb-10 pb-6 border-b border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Location</span>
                    <span className="font-bold text-slate-700">{selectedJobData.location}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Experience</span>
                    <span className="font-bold text-slate-700">{selectedJobData.experienceLevel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type</span>
                    <span className="font-bold text-slate-700">{selectedJobData.type}</span>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                   <h3 className="text-xl font-bold mb-4">Job Description</h3>
                   <div className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: md.render(selectedJobData.description || "") }} />
                </div>

                {selectedJobData.requirements && (
                  <div className="mt-10">
                    <h3 className="text-xl font-bold mb-4">Key Requirements</h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {selectedJobData.requirements.split(",").map((req, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 border border-slate-100">
                          <ChevronRight size={16} className="text-indigo-600" /> {req.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Company Reputation Section */}
                <div id="company-reputation" className="mt-20 pt-10 border-t border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Star className="text-amber-400" fill="currentColor" />
                        Company Reputation
                    </h3>
                    <ReviewSystem 
                        targetId={selectedJobData.recruiterId} 
                        targetType="recruiter" 
                    />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Briefcase size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Simple Modal Form --- */}
      {showForm && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-32px p-8 shadow-2xl">
            <h3 className="text-2xl font-black mb-6">Apply for {selectedJobData?.title}</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Phone Number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border-none" />
              <textarea placeholder="Why you?" rows="4" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 border-none" />
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                <input type="file" className="text-xs" />
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl">Submit Application</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}