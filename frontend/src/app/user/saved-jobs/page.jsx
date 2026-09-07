"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, MapPin, DollarSign, Clock, Briefcase, Trash2, ExternalLink, Loader2, Building2, X } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SavedJobsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [savedJobs, setSavedJobs] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [allCompaniesLoading, setAllCompaniesLoading] = useState(false);
  const [onlyShowFollowed, setOnlyShowFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState(tab === "companies" ? "companies" : "jobs");

  useEffect(() => {
    fetchSavedJobs();
    fetchFollowedCompanies();
    fetchAllCompanies();
  }, []);

  useEffect(() => {
    if (tab === "companies") {
      setActiveTab("companies");
    } else {
      setActiveTab("jobs");
    }
  }, [tab]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates/save-job");
      const data = await res.json();
      if (data.success) {
        setSavedJobs(data.savedJobs || []);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const res = await fetch("/api/candidates/follow-company");
      const data = await res.json();
      if (data.success) {
        setFollowedCompanies(data.followedCompanies || []);
      }
    } catch (error) {
      console.error("Error fetching followed companies:", error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      setAllCompaniesLoading(true);
      const res = await fetch("/api/recruiter/companies");
      const data = await res.json();
      if (data.success) {
        setAllCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Error fetching all companies:", error);
    } finally {
      setAllCompaniesLoading(false);
    }
  };

  const removeJob = async (jobId) => {
    try {
      const res = await fetch("/api/candidates/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
      }
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };

  const toggleFollowCompany = async (companyId) => {
    try {
      const res = await fetch("/api/candidates/follow-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchFollowedCompanies();
      }
    } catch (error) {
      console.error("Error toggling follow company:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar activePage="saved-jobs" />

      <main className="md:ml-64 flex-1 w-full p-4 sm:p-8 lg:p-12 mt-16 md:mt-0">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Bookmark className="text-indigo-600" size={36} />
              My Workspace
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Manage your bookmarked jobs and followed companies.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/50 shadow-inner mb-8">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "jobs"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Saved Jobs ({savedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "companies"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Followed Companies ({followedCompanies.length})
            </button>
          </div>

          {activeTab === "jobs" ? (
            /* --- JOBS TAB --- */
            loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
              </div>
            ) : savedJobs.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bookmark className="text-slate-300" size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Saved Jobs Yet</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                  You haven't bookmarked any jobs yet. Start exploring jobs and save the ones you like!
                </p>
                <Link href="/careers" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                          {job.logo ? (
                            <img src={job.logo} alt={job.company} className="object-cover w-full h-full" />
                          ) : (
                            <Briefcase className="text-slate-400" size={24} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                            <Link href={`/careers/${job._id}`}>{job.title}</Link>
                          </h3>
                          <p className="text-slate-500 font-bold text-sm mt-1">{job.company}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeJob(job._id)}
                        className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                        title="Remove from saved jobs"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <MapPin size={16} className="text-indigo-500" /> {job.location || "Not specified"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <DollarSign size={16} className="text-emerald-500" /> {job.minSalary && job.maxSalary ? `₹${job.minSalary} - ₹${job.maxSalary}` : job.salary || "Not disclosed"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Briefcase size={16} className="text-amber-500" /> {job.type || job.experience || "Full Time"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Clock size={16} className="text-blue-500" />
                        {new Date(job.postedDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {skill}
                        </span>
                      ))}
                      {(job.requiredSkills && job.requiredSkills.length > 3) && (
                        <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <Link
                        href={`/careers/${job._id}`}
                        className="flex items-center justify-center gap-2 w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        View Details <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* --- COMPANIES TAB --- */
            companiesLoading || allCompaniesLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
              </div>
            ) : (() => {
              const followedIds = followedCompanies.map(c => c._id);
              const normalizedCompanies = allCompanies.map(c => ({
                _id: c._id,
                name: c.companyName || "Verified Employer",
                logo: c.logo || "",
                tagline: c.tagline || "",
                industry: c.industry || "General",
                website: c.website || "",
                companySize: c.companySize || "11-50 employees",
                address: c.address || c.city || "",
                description: c.description || "",
                founded: c.founded || "",
              }));

              const displayCompanies = onlyShowFollowed
                ? normalizedCompanies.filter(c => followedIds.includes(c._id))
                : normalizedCompanies;

              return (
                <>
                  {/* Exploration and filter toggle */}
                  <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                    <span className="text-sm font-bold text-slate-500">Explore registered companies</span>
                    <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-indigo-600 select-none bg-white px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm">
                      <input 
                        type="checkbox" 
                        checked={onlyShowFollowed} 
                        onChange={(e) => setOnlyShowFollowed(e.target.checked)} 
                        className="w-4 h-4 accent-indigo-600 rounded" 
                      /> 
                      Show Followed Only
                    </label>
                  </div>

                  {displayCompanies.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="text-slate-300" size={40} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">No Companies Found</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        {onlyShowFollowed 
                          ? "You aren't following any companies yet. Uncheck the filter to explore and follow registered companies!" 
                          : "No recruiters or companies registered in the system yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayCompanies.map((company) => {
                        const isFollowing = followedIds.includes(company._id);
                        return (
                          <div key={company._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden border border-indigo-100">
                                  {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="object-cover w-full h-full" />
                                  ) : (
                                    <Building2 className="text-indigo-500" size={24} />
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleFollowCompany(company._id)}
                                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                    isFollowing
                                      ? "bg-slate-50 border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                                      : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                                  }`}
                                  title={isFollowing ? "Unfollow company" : "Follow company"}
                                >
                                  {isFollowing ? "Unfollow" : "Follow"}
                                </button>
                              </div>

                              <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">
                                {company.name}
                              </h3>
                              {company.tagline && (
                                <p className="text-slate-400 font-medium text-xs mb-3 italic">
                                  "{company.tagline}"
                                </p>
                              )}
                              
                              <div className="space-y-2 mt-4 text-xs font-bold text-slate-500">
                                {company.industry && (
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                    <span>{company.industry}</span>
                                  </div>
                                )}
                                {company.companySize && (
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    <span>{company.companySize}</span>
                                  </div>
                                )}
                                {company.address && (
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                    <span className="truncate max-w-[200px]">{company.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="pt-6 border-t border-slate-50 mt-6 flex gap-3">
                              <button
                                onClick={() => setSelectedCompany(company)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                              >
                                View Profile
                              </button>
                              {company.website && (
                                <a
                                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all"
                                >
                                  Website <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      </main>

      {/* Centered Modern Modal for Company Profile */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setSelectedCompany(null)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden border border-indigo-100 shrink-0">
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={36} className="text-indigo-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-black text-slate-900 leading-tight truncate">{selectedCompany.name}</h3>
                <p className="text-slate-500 font-bold text-sm mt-1">{selectedCompany.industry || "General Industry"}</p>
                {selectedCompany.tagline && (
                  <p className="text-slate-400 text-xs font-semibold mt-1.5 italic truncate">"{selectedCompany.tagline}"</p>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Company Size</span>
                <span className="text-slate-800 font-bold text-sm">{selectedCompany.companySize || "Not specified"}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Founded</span>
                <span className="text-slate-800 font-bold text-sm">{selectedCompany.founded || "Not specified"}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 col-span-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Office Location</span>
                <span className="text-slate-800 font-bold text-sm">{selectedCompany.address || "Not specified"}</span>
              </div>
            </div>

            {/* Description / About */}
            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">About the Company</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50/40 p-4 rounded-2xl border border-slate-100/50 whitespace-pre-line">
                {selectedCompany.description || "No detailed description provided by this employer."}
              </p>
            </div>

            {/* Action buttons (only Website, absolutely no email or phone!) */}
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedCompany(null)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Profile
              </button>
              {selectedCompany.website && (
                <a
                  href={selectedCompany.website.startsWith("http") ? selectedCompany.website : `https://${selectedCompany.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Visit Website <ExternalLink size={14} />
                </a>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
