"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Lightbulb, Search, Filter, X, Loader2, ExternalLink, Clock, IndianRupee, MapPin, Building2, Briefcase, Wrench, BadgeCheck, Plus, CheckCircle2,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import FeatureGuard from "@/components/FeatureGuard";

const TABS = [
  { id: "All", label: "All", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "Internship", label: "Internship Programs", icon: <Briefcase className="h-4 w-4" /> },
  { id: "Industrial Training", label: "Industrial Training", icon: <Wrench className="h-4 w-4" /> },
  { id: "Apprenticeship", label: "Apprenticeship", icon: <BadgeCheck className="h-4 w-4" /> },
];
const MODES = ["All", "Offline", "Online", "Hybrid"];
const TYPE_STYLE = {
  Internship: "bg-blue-100 text-blue-700",
  "Industrial Training": "bg-purple-100 text-purple-700",
  Apprenticeship: "bg-emerald-100 text-emerald-700",
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [facets, setFacets] = useState({ sectors: [] });
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [tab, setTab] = useState("All");
  const [sector, setSector] = useState("All");
  const [mode, setMode] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== "All") params.set("programType", tab);
      if (sector !== "All") params.set("sector", sector);
      if (mode !== "All") params.set("mode", mode);
      if (appliedSearch.trim()) params.set("q", appliedSearch.trim());
      const res = await fetch(`/api/candidate/programs?${params.toString()}`);
      const result = await res.json();
      if (result.success) { setPrograms(result.data); if (result.facets) setFacets(result.facets); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [tab, sector, mode, appliedSearch]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const handleSearch = () => setAppliedSearch(searchInput);
  const clearAll = () => { setSearchInput(""); setAppliedSearch(""); setSector("All"); setMode("All"); };
  const hasFilters = sector !== "All" || mode !== "All" || appliedSearch.trim() !== "";
  const selectCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none";

  const handleFlagProgram = async (programId) => {
    if (!confirm("Flag & move this program to Admin Negative List?")) return;
    try {
      const res = await fetch("/api/candidate/flag-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: programId, type: "resource" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("🚩 Program flagged and moved to Admin Negative List.");
        setPrograms((prev) => prev.filter((p) => p._id !== programId));
      } else {
        alert(data.error || "Failed to flag program.");
      }
    } catch {
      alert("Failed to flag program.");
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="Government Portal Access">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 border-b pb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-blue-600" /> Internships, Training & Apprenticeships
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                Explore internship programs, industrial training, and apprenticeships from government bodies and PSUs. Filter by type, sector and mode.
              </p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Add an Internship
            </button>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Search + filters */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by program, organization or skill…"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button onClick={handleSearch} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Filter className="h-4 w-4" /> Filters:</span>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={selectCls}>
                <option value="All">All Sectors</option>
                {facets.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className={selectCls}>
                {MODES.map((m) => <option key={m} value={m}>{m === "All" ? "All Modes" : m}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {!loading && <p className="text-sm text-gray-500 mb-4">{programs.length} program{programs.length !== 1 ? "s" : ""}{tab !== "All" && <span> · <strong>{tab}</strong></span>}</p>}

          {loading ? (
            <div className="flex justify-center items-center py-24"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
          ) : programs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No programs found</h3>
              <p className="text-gray-500 mt-1">Try a different type, sector, or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((p) => (
                <div key={p._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 flex-grow">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[p.programType] || "bg-gray-100 text-gray-700"}`}>{p.programType}</span>
                        {p.sector && <span className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{p.sector}</span>}
                      </div>
                      <button
                        onClick={() => handleFlagProgram(p._id)}
                        title="Flag as Negative / Spam"
                        className="p-1 rounded-md text-gray-400 hover:text-amber-600 transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <span className="text-sm">🚩</span>
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{p.title}</h3>
                    {p.organization && <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-3"><Building2 className="h-4 w-4 text-gray-400" />{p.organization}</p>}
                    <div className="space-y-1.5 text-sm text-gray-600">
                      {p.duration && <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-500" /> {p.duration}</p>}
                      {p.stipend && <p className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4 text-emerald-500" /> {p.stipend}</p>}
                      {p.mode && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {p.mode}{p.location ? ` · ${p.location}` : ""}</p>}
                      {p.qualification && <p className="text-xs text-gray-500">Eligibility: {p.qualification}</p>}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                    <a href={p.applyLink} target="_blank" rel="noopener noreferrer"
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
                      Apply / Details <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </FeatureGuard>
      </main>

      {showSubmitModal && <SubmitProgramModal onClose={() => setShowSubmitModal(false)} />}
    </div>
  );
}

function SubmitProgramModal({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    organization: "",
    category: "Internship",
    applyLink: "",
    sector: "",
    mode: "Offline",
    duration: "",
    stipend: "",
    qualification: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  const submit = async () => {
    if (!form.title || !form.applyLink) return alert("Title and official apply link are required.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/candidate/community-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) setDone(true);
      else if (res.status === 401) alert("Please log in to submit.");
      else alert(result.error || "Submission failed.");
    } catch {
      alert("Submission failed.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Suggest an Internship / Program</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">Submitted for review</p>
            <p className="text-sm text-gray-500 mt-1">It will appear once a moderator approves it. Thank you!</p>
            <button onClick={onClose} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Close</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Submissions are reviewed by a moderator before going live.</p>
            <input className={input} placeholder="Program title * (e.g. SBI Summer Internship 2026)" value={form.title} onChange={(e) => set("title", e.target.value)} />
            <input className={input} placeholder="Organization / Company (e.g. State Bank of India)" value={form.organization} onChange={(e) => set("organization", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="Internship">Internship</option>
                <option value="Industrial Training">Industrial Training</option>
                <option value="Apprenticeship">Apprenticeship</option>
              </select>
              <select className={input} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <input className={input} placeholder="Official Apply link (https://…) *" value={form.applyLink} onChange={(e) => set("applyLink", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className={input} placeholder="Duration (e.g. 2 Months)" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
              <input className={input} placeholder="Stipend (e.g. ₹10,000/mo)" value={form.stipend} onChange={(e) => set("stipend", e.target.value)} />
            </div>
            <input className={input} placeholder="Sector (e.g. Banking, Defense, IT)" value={form.sector} onChange={(e) => set("sector", e.target.value)} />
            <input className={input} placeholder="Eligibility / Qualification (e.g. Graduates / B.Tech)" value={form.qualification} onChange={(e) => set("qualification", e.target.value)} />
            <textarea className={input} rows={2} placeholder="Short description / details" value={form.description} onChange={(e) => set("description", e.target.value)} />
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={submit} disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit Program"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
