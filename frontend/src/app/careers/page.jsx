"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin, Coffee, Laptop, Heart,
  ArrowRight, Zap, Rocket, Loader2, Search, Briefcase, Clock, X, Building2, Globe, Users, Wallet, Filter, Calendar, BriefcaseBusiness, Tag, GraduationCap, UserCheck, ChevronLeft, ChevronRight, Sparkles,
  ExternalLink, Mail, Phone, Code, UserCircle, Gavel, Banknote, Timer, Send, Bookmark, Star
} from 'lucide-react';
import ReviewSystem from "@/components/ReviewSystem";

const CareersContent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAiMode, setIsAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [professionFilter, setProfessionFilter] = useState('All');
  const [educationFilter, setEducationFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [isFreelanceOnly, setIsFreelanceOnly] = useState(false); // નવું ફિલ્ડ
  const [bidPrice, setBidPrice] = useState('');
  const [bidTime, setBidTime] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 15;

  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);

  useEffect(() => {
    if (session) {
      fetch("/api/candidates/save-job")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.savedJobs) {
            setSavedJobIds(data.savedJobs.map(j => j._id));
          }
        })
        .catch(err => console.error("Error fetching saved jobs:", err));
    }
  }, [session]);

  const toggleSaveJob = async (e, jobId) => {
    e.stopPropagation(); // prevent opening details
    if (!session) {
      alert("Please login to save jobs.");
      return;
    }
    setSavingJobId(jobId);
    try {
      const res = await fetch("/api/candidates/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedJobIds(prev => [...prev, jobId]);
        } else {
          setSavedJobIds(prev => prev.filter(id => id !== jobId));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingJobId(null);
    }
  };

  // --- Dynamic Filter Options Extraction ---
  const filterOptions = useMemo(() => {
    const getUnique = (key) => {
      const vals = jobs
        .map(job => job[key])
        .filter(val => val && val !== "" && val !== null);
      return ["All", ...new Set(vals)];
    };

    return {
      locations: getUnique('location'),
      types: getUnique('jobType'),
      experiences: getUnique('experienceLevel'),
      industries: ["All", ...new Set(jobs.map(j => j.industry || j.jobCategory).filter(Boolean))],
      professions: getUnique('profession'),
      educations: getUnique('education'),
      designations: getUnique('designation'),
    };
  }, [jobs]);

  // ૧. Smart Recommendations Fetch કરવા માટે
  const getSmartRecommendations = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/jobs/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setIsAiMode(true); // AI મોડ ઓન કરો
        setCurrentPage(1);
      } else {
        alert(data.error || "Your profile is incomplete!");
        if (data.isProfileIncomplete || data.error?.toLowerCase().includes("incomplete")) {
          router.push("/user/profile");
        }
      }
    } catch (err) {
      console.error("AI Matching Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // ૨. બધી જોબ્સ (Default) Fetch કરવા માટે
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setIsAiMode(false); // AI મોડ ઓફ કરો જેથી બધી જોબ્સ દેખાય

      // Recruiter Jobs
      const res = await fetch('/api/jobs', { cache: 'no-store' });
      const data = await res.json();
      const jobList = data.data || data.jobs || data;
      const rawJobs = Array.isArray(jobList) ? jobList : [];

      // Candidate Jobs
      let rawCandJobs = [];
      try {
        const resCand = await fetch('/api/candidate-jobs?public=true', { cache: 'no-store' });
        const candData = await resCand.json();
        const finalCandData = Array.isArray(candData) ? candData : (candData.data || []);
        rawCandJobs = finalCandData.map(j => ({
          ...j,
          isCandidate: true,
          _id: j._id || j.id
        }));
      } catch (e) { console.error(e); }

      // ભેગી કરેલી બધી જ જોબ્સ
      const combinedJobs = [...rawJobs, ...rawCandJobs];
      const activeJobs = combinedJobs.filter(job => {
        if (!job.deadline) return true;
        const deadlineDate = new Date(job.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return isNaN(deadlineDate.getTime()) ? true : deadlineDate >= today;
      }).sort((a, b) => new Date(b.postedAt || b.createdAt || 0) - new Date(a.postedAt || a.createdAt || 0));

      setJobs(activeJobs);

      const jobId = searchParams.get('jobId');
      if (jobId) {
        const targetJob = activeJobs.find(j => j._id === jobId || j.id === jobId);
        if (targetJob && session) setSelectedJob(targetJob);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyProfile = async (job) => {
    if (job.isCandidate) {
      setCompanyDetails(job.companyDetails || null);
      return;
    }
    const targetId = job.recruiterId || job.companyId;
    if (!targetId) { setCompanyDetails(null); return; }
    setLoadingCompany(true);
    try {
      const res = await fetch(`/api/recruiter/register?action=get-profile&id=${targetId}`);
      const result = await res.json();
      if (res.ok && result.data) setCompanyDetails(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleApply = async () => {
    if (!session) { router.push("/login"); return; }
    if (!selectedJob) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob._id,
          recruiterId: selectedJob.recruiterId || selectedJob.userId,
          role: selectedJob.title,
          // ✅ આ નામો ખાસ ચેક કરો, તે API માં જે વાપર્યા છે તેવા જ હોવા જોઈએ
          // ✅ અહીં સુધારો: formData ને બદલે તમારા સ્ટેટ વેરીએબલ્સ વાપરો
          bidAmount: bidPrice, 
          timeline: bidTime,
          projectName: selectedJob.title, // પ્રોજેક્ટનું નામ ઓટોમેટિક ટાઇટલ પરથી લેશે
          projectBrief: "Freelance Proposal", // તમે આના માટે પણ નવું ઇનપુટ બનાવી શકો
          
          isFreelanceApplication: selectedJob.isFreelance
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("🚀 Application Sent Successfully!");
        setSelectedJob(null);
      } else {
        alert(data.error || "Your profile is incomplete!");
        if (data.error?.includes("profile incomplete")) router.push("/candidate/profile");
      }
    } catch (error) {
      alert("Something went wrong!");
    }
  };

  const handleViewDetails = (job) => {
    if (!session) {
      router.push("/login");
    } else {
      setSelectedJob(job);
    }
  };

  // શરૂઆતમાં બધી જોબ્સ લોડ થશે
  useEffect(() => {
    fetchJobs();
  }, [session, searchParams]);

  useEffect(() => { if (selectedJob) fetchCompanyProfile(selectedJob); }, [selectedJob]);

  const filteredJobs = jobs.filter(job => {
    if (isAiMode) return true; // AI મોડમાં મેન્યુઅલ ફિલ્ટરની જરૂર નથી
    const titleMatch = (job.title?.toLowerCase() || "");
    const locMatch = (job.location?.toLowerCase() || "");
    const matchesSearch = titleMatch.includes(searchTerm.toLowerCase()) || locMatch.includes(searchTerm.toLowerCase());

    const matchesLocation = locationFilter === 'All' || job.location === locationFilter;
    const matchesType = typeFilter === 'All' || job.jobType === typeFilter;
    const matchesExp = expFilter === 'All' || job.experienceLevel === expFilter;
    const matchesIndustry = industryFilter === 'All' || (job.industry || job.jobCategory) === industryFilter;
    const matchesProfession = professionFilter === 'All' || job.profession === professionFilter;
    const matchesEducation = educationFilter === 'All' || job.education === educationFilter;
    const matchesDesignation = designationFilter === 'All' || job.designation === designationFilter;
    
    // Freelance Filter logic
    const matchesFreelance = !isFreelanceOnly || job.isFreelance === true;

    return matchesSearch && matchesLocation && matchesType && matchesExp &&
      matchesIndustry && matchesProfession && matchesEducation && matchesDesignation && matchesFreelance;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const perks = [
    { icon: <Laptop size={24} />, title: "Remote First", desc: "Work from anywhere in the world." },
    { icon: <Heart size={24} />, title: "Wellness First", desc: "Premium health cover & mental health days." },
    { icon: <Coffee size={24} />, title: "Learning Budget", desc: "$2,000 yearly for your upskilling." },
    { icon: <Rocket size={24} />, title: "Equity", desc: "Own a piece of the future of hiring." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <section className="relative pt-32 pb-32 px-6 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-bold mb-8 backdrop-blur-md">
            <Zap size={16} className="fill-indigo-400" /> <span>Join the Revolution</span>
          </motion.div>
          <motion.h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight">
            Design your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Own Destiny.</span>
          </motion.h1>
        </div>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {perks.map((perk, i) => (
            <motion.div key={i} whileHover={{ y: -8 }} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">{perk.icon}</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{perk.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{perk.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-none">
                {isAiMode ? "✨ Smart Matches" : "Find Your Role"}
              </h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
                {isAiMode ? "Jobs matched to your profile" : "Browse through current openings"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
               {/* Freelance Filter Toggle */}
               <button 
                onClick={() => {setIsFreelanceOnly(!isFreelanceOnly); setCurrentPage(1);}}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 ${isFreelanceOnly ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
               >
                 <Gavel size={14} /> Freelance Only
               </button>

              <button
                onClick={isAiMode ? fetchJobs : getSmartRecommendations}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95 ${isAiMode
                  ? "bg-slate-100 text-slate-600 border border-slate-200"
                  : "bg-slate-950 text-white hover:bg-indigo-600"
                  }`}
              >
                {aiLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isAiMode ? (
                  "Show All Jobs"
                ) : (
                  <>
                    <Sparkles size={16} fill="white" />
                    Smart Recommendations
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search title or skills..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 ring-indigo-500/20" />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-800 appearance-none">
                {filterOptions.locations.map(opt => <option key={opt} value={opt}>{opt === "All" ? "All Locations" : opt}</option>)}
              </select>
            </div>

            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-800 appearance-none">
                {filterOptions.types.map(opt => <option key={opt} value={opt}>{opt === "All" ? "Job Type" : opt}</option>)}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select value={expFilter} onChange={(e) => { setExpFilter(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-800 appearance-none">
                {filterOptions.experiences.map(opt => <option key={opt} value={opt}>{opt === "All" ? "Experience" : opt}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <Tag size={16} className="text-indigo-500" />
              <select value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent border-none outline-none font-bold text-xs text-slate-600 uppercase">
                {filterOptions.industries.map(opt => <option key={opt} value={opt}>{opt === "All" ? "All Industries" : opt}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <GraduationCap size={16} className="text-indigo-500" />
              <select value={educationFilter} onChange={(e) => { setEducationFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent border-none outline-none font-bold text-xs text-slate-600 uppercase">
                {filterOptions.educations.map(opt => <option key={opt} value={opt}>{opt === "All" ? "Any Education" : opt}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <UserCircle size={16} className="text-indigo-500" />
              <select value={designationFilter} onChange={(e) => { setDesignationFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent border-none outline-none font-bold text-xs text-slate-600 uppercase">
                {filterOptions.designations.map(opt => <option key={opt} value={opt}>{opt === "All" ? "All Designations" : opt}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {loading || aiLoading ? (
                <div className="flex flex-col items-center py-32 text-slate-400"><Loader2 className="animate-spin mb-4" size={48} /><p>{aiLoading ? "Matching your profile..." : "Scanning Careers..."}</p></div>
              ) : currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <motion.div key={job._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => handleViewDetails(job)}
                  >
                    <div className="group bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                      {isAiMode && job.matchScore && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-4 py-1 rounded-bl-xl shadow-sm">
                          {job.matchScore}% MATCH
                        </div>
                      )}
                      {job.isFreelance && (
                         <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[9px] font-black px-4 py-1 rounded-br-xl shadow-sm flex items-center gap-1">
                           <Gavel size={10} /> PROJECT
                         </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${job.isFreelance ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                            {job.jobCategory || job.category || "General"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Clock size={10} className="inline mr-1" /> {job.jobType}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h3>
                        {job.isCandidate && job.companyName && (
                          <p className="text-indigo-500 font-bold text-xs mt-0.5">{job.companyName}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 mt-2 text-[10px] font-bold uppercase">
                          <span className="flex items-center gap-1"><MapPin size={14} className="text-indigo-500" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={14} className="text-indigo-500" /> {job.experienceLevel || "Any Exp"}</span>
                          {job.isFreelance && job.projectBudget && (
                            <span className="flex items-center gap-1 text-emerald-600"><Banknote size={14} /> {job.budgetType}: {job.projectBudget}</span>
                          )}
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3 rounded-2xl font-black text-sm group-hover:bg-indigo-600 transition-all self-start md:self-center">
                        {job.isFreelance ? "Bid Now" : "View Details"} <ArrowRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">No jobs found.</div>
              )}
            </AnimatePresence>
          </div>

          {!loading && !aiLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30"><ChevronLeft size={20} /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => paginate(i + 1)} className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border text-slate-600'}`}>{i + 1}</button>
              ))}
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedJob && session && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white z-[101] shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 flex justify-between items-center border-b z-20">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${selectedJob.isFreelance ? "bg-emerald-500" : "bg-indigo-600"}`}>
                    {selectedJob.isFreelance ? <Gavel size={24} /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 leading-none">{selectedJob.isFreelance ? "Project Details" : "Job Details"}</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1">
                      {selectedJob.isCandidate ? (selectedJob.companyName || "Community Post") : (loadingCompany ? "Loading..." : (companyDetails?.companyName || "Verified Partner"))}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
              </div>

              <div className="p-8 md:p-12 space-y-12">
                {/* --- Bidding Form Section --- */}
                {selectedJob.isFreelance && (
                  <div className="bg-indigo-50/50 p-6 md:p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-inner">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                      <Sparkles size={20} className="text-indigo-600" /> Your Proposal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Your Bid Price (₹/$)</label>
                        <div className="relative">
                          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="e.g. 5000" 
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 ring-indigo-500/20" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Delivery Time</label>
                        <div className="relative">
                          <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="e.g. 5 Days" 
                            value={bidTime}
                            onChange={(e) => setBidTime(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 ring-indigo-500/20" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedJob.isFreelance ? "Project Scope" : "Job Description"}</h4>
                  <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-6 rounded-2xl">
                    {selectedJob.description}
                  </div>
                </div>

                {selectedJob.isCandidate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedJob.education && (
                      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <GraduationCap className="text-indigo-500" size={20} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Education</p>
                          <p className="text-sm font-black text-slate-700">{selectedJob.education}</p>
                        </div>
                      </div>
                    )}
                    {selectedJob.profession && (
                      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <BriefcaseBusiness className="text-indigo-500" size={20} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Profession</p>
                          <p className="text-sm font-black text-slate-700">{selectedJob.profession}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/60">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">About {selectedJob.isFreelance ? "Client" : "Company"}</h4>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-indigo-600">
                      {selectedJob.isCandidate ? (selectedJob.companyName || "Community Post") : (companyDetails?.companyName || "Verified Employer")}
                    </h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      {selectedJob.isCandidate ? (selectedJob.companyDescription || "This job was shared by a community member.") : (companyDetails?.description || "A trusted partner in our network.")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedJob.isFreelance ? "Project Scope" : "Job Description"}</h4>
                  <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-6 rounded-2xl">
                    {selectedJob.description}
                  </div>
                </div>

                {selectedJob.isCandidate && selectedJob.skills && (
                  <div className="space-y-4 mb-10">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Code size={20} className="text-indigo-500" /> Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.split(',').map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 italic">
                          #{skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- Reputation Section --- */}
                <div className="pt-10 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-8">
                    <Star className="text-amber-400" fill="currentColor" size={24} />
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recruiter Reputation</h4>
                  </div>
                  <ReviewSystem 
                    targetId={selectedJob.recruiterId || selectedJob.userId} 
                    targetType="recruiter" 
                  />
                </div>

                {/* <div className="pt-8 border-t sticky bottom-0 bg-white pb-6">
                  {selectedJob.isCandidate ? (
                    <div className="space-y-3">
                      <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Apply Here</p>

                      {selectedJob.applyLink && (
                        <a href={selectedJob.applyLink.startsWith('http') ? selectedJob.applyLink : `https://${selectedJob.applyLink}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full bg-slate-950 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                          {selectedJob.isFreelance ? "Submit Proposal" : "Apply on Website"} <ExternalLink size={20} />
                        </a>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {selectedJob.applyEmail && (
                          <a href={`mailto:${selectedJob.applyEmail}`} className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-slate-950 text-slate-950 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-2 text-sm uppercase">
                              <Mail size={18} /> Email
                            </div>
                            <span className="text-[10px] lowercase text-slate-500 truncate w-full px-2 text-center">{selectedJob.applyEmail}</span>
                          </a>
                        )}
                        {selectedJob.applyPhone && (
                          <a href={`tel:${selectedJob.applyPhone}`} className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-slate-950 text-slate-950 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-2 text-sm uppercase">
                              <Phone size={18} /> Call
                            </div>
                            <span className="text-[10px] text-slate-500">{selectedJob.applyPhone}</span>
                          </a>
                        )}
                      </div>

                      {!selectedJob.applyLink && !selectedJob.applyEmail && !selectedJob.applyPhone && (
                        <div className="text-center p-4 bg-orange-50 text-orange-600 rounded-2xl font-bold border border-orange-100">
                          Application details not provided.
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={handleApply} className={`w-full text-white py-6 rounded-[2rem] font-black text-xl transition-all ${selectedJob.isFreelance ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-950 hover:bg-indigo-600"}`}>
                      {selectedJob.isFreelance ? "Submit a Proposal" : "Apply for this Position"}
                    </button>
                  )}
                </div> */}
                <div className="pt-8 border-t sticky bottom-0 bg-white pb-6">
                  {/* જો જોબ Freelance હોય, તો હંમેશા આપણું handleApply ફંક્શન જ વાપરવું */}
                  {selectedJob.isFreelance ? (
                    <div className="space-y-4">
                      <button 
                        onClick={handleApply} 
                        disabled={bidLoading}
                        className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        {bidLoading ? <Loader2 className="animate-spin" /> : <>Submit a Proposal <Send size={20} /></>}
                      </button>
                      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Your bid & profile will be shared with the recruiter
                      </p>
                    </div>
                  ) : (
                    /* જો જોબ સાદી (Normal) હોય, તો તમારી જૂની પદ્ધતિ મુજબ લિંક્સ બતાવવી */
                    <>
                      {selectedJob.isCandidate ? (
                        <div className="space-y-3">
                          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Apply Here</p>
                      
                          {selectedJob.applyLink && (
                            <a 
                              href={selectedJob.applyLink.startsWith('http') ? selectedJob.applyLink : `https://${selectedJob.applyLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 w-full bg-slate-950 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                            >
                              Apply on Website <ExternalLink size={20} />
                            </a>
                          )}
                
                          <div className="grid grid-cols-2 gap-3">
                            {selectedJob.applyEmail && (
                              <a href={`mailto:${selectedJob.applyEmail}`} className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-slate-950 text-slate-950 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-2 text-sm uppercase"><Mail size={18} /> Email</div>
                                <span className="text-[10px] lowercase text-slate-500 truncate w-full px-2 text-center">{selectedJob.applyEmail}</span>
                              </a>
                            )}
                            {selectedJob.applyPhone && (
                              <a href={`tel:${selectedJob.applyPhone}`} className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-slate-950 text-slate-950 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-2 text-sm uppercase"><Phone size={18} /> Call</div>
                                <span className="text-[10px] text-slate-500">{selectedJob.applyPhone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Recruiter દ્વારા મુકાયેલી સાદી જોબ માટે */
                        <button 
                          onClick={handleApply} 
                          className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-600 transition-all"
                        >
                          Apply for this Position
                        </button>
                      )}
                    </>
                  )}

                  {/* Save Job Button in Drawer */}
                  <button 
                    onClick={(e) => toggleSaveJob(e, selectedJob._id)}
                    disabled={savingJobId === selectedJob._id}
                    className={`w-full mt-4 py-4 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
                      savedJobIds.includes(selectedJob._id) 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {savingJobId === selectedJob._id ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : savedJobIds.includes(selectedJob._id) ? (
                      <>Saved <Bookmark size={24} className="fill-emerald-500" /></>
                    ) : (
                      <>Save for Later <Bookmark size={24} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CareersPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    }>
      <CareersContent />
    </Suspense>
  );
}