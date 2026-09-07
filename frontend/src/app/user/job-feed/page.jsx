"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Briefcase, MapPin, Building2, Filter, X, Loader2, ExternalLink, Clock, Sparkles, Bookmark, Plus,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import ManualSubmitModal from "@/components/ManualSubmitModal";
import FeatureGuard from "@/components/FeatureGuard";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

export default function JobFeedPage() {
  const [jobs, setJobs] = useState([]);
  const [facets, setFacets] = useState({ industries: [], locations: [], employmentTypes: [], sourceLabels: [] });
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [type, setType] = useState("All");
  const [location, setLocation] = useState("All");
  const [source, setSource] = useState("All");
  const [savedIds, setSavedIds] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load the user's saved job ids once (for the bookmark state).
  useEffect(() => {
    fetch("/api/candidate/saved-aggregated-jobs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSavedIds((d.savedJobs || []).map((j) => j._id)); })
      .catch(() => { });
  }, []);

  const toggleSave = async (jobId) => {
    setSavingId(jobId);
    try {
      const res = await fetch("/api/candidate/saved-aggregated-jobs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const result = await res.json();
      if (result.success) {
        setSavedIds((ids) => (result.saved ? [...ids, jobId] : ids.filter((id) => id !== jobId)));
      } else if (res.status === 401) {
        alert("Please log in to save jobs.");
      } else {
        alert(result.error || "Could not save. Please try again.");
      }
    } catch {
      alert("Network error while saving.");
    }
    setSavingId(null);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (industry !== "All") params.set("industry", industry);
      if (type !== "All") params.set("employmentType", type);
      if (location !== "All") params.set("location", location);
      if (source !== "All") params.set("sourceLabel", source);
      if (appliedSearch.trim()) params.set("q", appliedSearch.trim());
      const res = await fetch(`/api/candidate/aggregated-jobs?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setJobs(result.data);
        if (result.facets) setFacets(result.facets);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [industry, type, location, source, appliedSearch]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = () => setAppliedSearch(searchInput);
  const clearAll = () => { setSearchInput(""); setAppliedSearch(""); setIndustry("All"); setType("All"); setLocation("All"); setSource("All"); };
  const hasFilters = industry !== "All" || type !== "All" || location !== "All" || source !== "All" || appliedSearch.trim() !== "";
  const visibleJobs = savedOnly ? jobs.filter((j) => savedIds.includes(j._id)) : jobs;
  const selectCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="AI Job Feed">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" /> AI Job Feed
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                Jobs aggregated daily from company career pages and portals, auto-categorized and de-duplicated.
                Filter by industry, type or location. Clicking apply takes you to the official posting.
              </p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50">
              <Plus className="h-4 w-4" /> Add a Job
            </button>
          </div>

          {/* Search + filters */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search jobs by title, company or keyword…"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <button onClick={handleSearch} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Filter className="h-4 w-4" /> Filters:</span>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
                <option value="All">All Industries</option>
                {facets.industries.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
                <option value="All">All Types</option>
                {facets.employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectCls}>
                <option value="All">All Locations</option>
                {facets.locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={source} onChange={(e) => setSource(e.target.value)} className={selectCls}>
                <option value="All">All Sources</option>
                {facets.sourceLabels.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setSavedOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${savedOnly ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                <Bookmark className={`h-4 w-4 ${savedOnly ? "fill-blue-600 text-blue-600" : ""}`} /> Saved
              </button>
              {hasFilters && (
                <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {!loading && <p className="text-sm text-gray-500 mb-4">{visibleJobs.length} job{visibleJobs.length !== 1 ? "s" : ""} found{savedOnly ? " (saved)" : ""}</p>}

          {loading ? (
            <div className="flex justify-center items-center py-24"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
          ) : visibleJobs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{savedOnly ? "No saved jobs yet" : "No jobs found"}</h3>
              <p className="text-gray-500 mt-1">{savedOnly ? "Tap the bookmark on any job to save it here." : "Try a different industry, type, or search term."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleJobs.map((job) => {
                const isSaved = savedIds.includes(job._id);
                return (
                  <div key={job._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 flex-grow">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{job.industry}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{job.employmentType}</span>
                          {job.sourceLabel && <span className={"px-2.5 py-0.5 rounded-full text-xs font-medium " + (job.ingestSource === "manual" ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700")}>{job.ingestSource === "manual" ? "Manual" : job.sourceLabel}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={async () => {
                              if (!confirm("Flag & move this job to Admin Negative List?")) return;
                              try {
                                const res = await fetch("/api/candidate/flag-item", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: job._id, type: "job" }),
                                });
                                const data = await res.json();
                                if (res.ok && data.success) {
                                  alert("🚩 Job flagged and moved to Admin Negative List.");
                                  setJobs((prev) => prev.filter((j) => j._id !== job._id));
                                } else {
                                  alert(data.error || "Failed to flag job.");
                                }
                              } catch {
                                alert("Failed to flag job.");
                              }
                            }}
                            title="Flag as Negative / Spam"
                            className="p-1 rounded-md text-gray-400 hover:text-amber-600 transition-opacity opacity-0 group-hover:opacity-100"
                          >
                            <span className="text-sm">🚩</span>
                          </button>
                          <button onClick={() => toggleSave(job._id)} disabled={savingId === job._id}
                            title={isSaved ? "Remove from saved" : "Save job"}
                            className={`p-1 rounded-md transition-colors disabled:opacity-50 ${isSaved ? "text-blue-600" : "text-gray-300 hover:text-blue-500"}`}>
                            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-blue-600" : ""}`} />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
                      {job.company && <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2"><Building2 className="h-4 w-4 text-gray-400" /> {job.company}</p>}
                      <div className="space-y-1.5 text-sm text-gray-600">
                        {job.location && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {job.location}</p>}
                        {job.experience && <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> {job.experience}</p>}
                        {fmtDate(job.postedDate) && <p className="text-xs text-gray-400">Posted {fmtDate(job.postedDate)}</p>}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                      <a href={job.applyContact?.applyUrl || job.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
                        Apply on Official Site <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </FeatureGuard>
      </main>
      {showAddModal && <ManualSubmitModal type="job" onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
