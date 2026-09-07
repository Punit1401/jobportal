"use client";
import React, { useState, useEffect } from "react";
import {
  Target, Sparkles, Building2, MapPin, CheckCircle2, Loader2, ExternalLink, Settings,
  ClipboardList, Trash2, Lightbulb,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import FeatureGuard from "@/components/FeatureGuard";

const TRACK_STATUSES = ["Applied", "Viewed", "Interview", "Offer", "Rejected"];
const STATUS_STYLE = {
  Applied: "bg-blue-100 text-blue-700", Viewed: "bg-purple-100 text-purple-700",
  Interview: "bg-amber-100 text-amber-700", Offer: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-gray-200 text-gray-600", Saved: "bg-gray-100 text-gray-600",
};
const csv = (arr) => (arr || []).join(", ");
const parse = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function AutoApplyPage() {
  const [tab, setTab] = useState("website");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Website (recruiter-posted) jobs — AI resume match + true auto-apply.
  const [siteJobs, setSiteJobs] = useState([]);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteApplying, setSiteApplying] = useState(false);
  const [profileSummary, setProfileSummary] = useState("");

  const loadSiteJobs = async () => {
    setSiteLoading(true);
    try {
      const r = await fetch("/api/candidate/internal-job-match").then((x) => x.json());
      if (r.success) { setSiteJobs(r.jobs || []); setProfileSummary(r.profileSummary || ""); }
    } catch (e) { console.error(e); }
    setSiteLoading(false);
  };
  useEffect(() => { loadSiteJobs(); }, []);

  const autoApplyRecommended = async () => {
    const targets = siteJobs.filter((j) => j.recommend && !j.applied);
    if (targets.length === 0) return alert("No new recommended jobs to apply to.");
    if (!confirm(`Auto-apply to ${targets.length} AI-recommended website job(s)?`)) return;
    setSiteApplying(true);
    try {
      const matchScores = Object.fromEntries(targets.map((j) => [j._id, j.matchScore]));
      const res = await fetch("/api/candidate/auto-apply-internal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: targets.map((j) => j._id), matchScores }),
      });
      const r = await res.json();
      if (r.success) { alert(`✅ ${r.message}`); loadSiteJobs(); }
      else alert(r.error || "Auto-apply failed.");
    } catch { alert("Auto-apply failed."); }
    setSiteApplying(false);
  };

  const applyOne = async (job) => {
    setSiteApplying(true);
    try {
      const res = await fetch("/api/candidate/auto-apply-internal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: [job._id], matchScores: { [job._id]: job.matchScore } }),
      });
      const r = await res.json();
      if (r.success) { alert(`✅ ${r.message}`); loadSiteJobs(); }
      else alert(r.error || "Apply failed.");
    } catch { alert("Apply failed."); }
    setSiteApplying(false);
  };

  const [prefs, setPrefs] = useState({
    industries: [], locations: [], employmentTypes: [], keywords: [], minMatchScore: 40, enabled: false
  });
  const [skills, setSkills] = useState("");
  const [showPrefs, setShowPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // External (aggregated) jobs — normal AI matchmaking & quick apply
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, m, a] = await Promise.all([
        fetch("/api/candidate/auto-apply-preferences").then((r) => r.json()),
        fetch("/api/candidate/job-match").then((r) => r.json()),
        fetch("/api/candidate/job-applications").then((r) => r.json()),
      ]);
      if (p.success) { setPrefs(p.preferences); setSkills(p.skills || ""); if (!p.preferences.keywords?.length && !p.preferences.industries?.length) setShowPrefs(true); }
      if (m.success) setJobs(m.jobs);
      if (a.success) setApplications(a.applications);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await fetch("/api/candidate/auto-apply-preferences", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prefs),
      });
      const m = await fetch("/api/candidate/job-match").then((r) => r.json());
      if (m.success) setJobs(m.jobs);
      setShowPrefs(false);
    } catch { alert("Could not save preferences."); }
    setSavingPrefs(false);
  };

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const eligible = jobs.filter((j) => j.matchScore >= (prefs.minMatchScore ?? 40) && !j.applied);
  const selectAllEligible = () => setSelected(eligible.map((j) => j._id));

  const applySelected = async () => {
    if (selected.length === 0) return;
    setApplying(true);
    try {
      const matchScores = Object.fromEntries(jobs.map((j) => [j._id, j.matchScore]));
      const res = await fetch("/api/candidate/apply-job", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: selected, matchScores }),
      });
      const result = await res.json();
      if (result.success) {
        result.applied.forEach((a) => a.applyUrl && window.open(a.applyUrl, "_blank", "noopener"));
        alert(`✅ ${result.message}`);
        setSelected([]);
        loadAll();
        setTab("tracking");
      } else if (res.status === 401) alert("Please log in.");
    } catch { alert("Apply failed."); }
    setApplying(false);
  };

  const updateStatus = async (jobId, status) => {
    setApplications((xs) => xs.map((a) => (a.jobId._id === jobId ? { ...a, status } : a)));
    await fetch("/api/candidate/job-applications", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, status }),
    });
  };
  const removeApp = async (jobId) => {
    await fetch(`/api/candidate/job-applications?jobId=${jobId}`, { method: "DELETE" });
    setApplications((xs) => xs.filter((a) => a.jobId._id !== jobId));
  };

  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="AI Features">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-1">
              <Target className="h-8 w-8 text-blue-600" /> AI Auto-Apply
            </h1>
            <p className="text-gray-600 mb-6">Set your preferences, let AI match & rank jobs, then apply to many at once. We prep & track — you confirm on the official site.</p>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              {[["website", "Website Jobs (AI Auto-Apply)", <Target className="h-4 w-4" key="w" />], ["find", "External Jobs", <Sparkles className="h-4 w-4" key="i" />], ["tracking", "My Applications", <ClipboardList className="h-4 w-4" key="t" />]].map(([id, label, icon]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {icon} {label}
                  {id === "tracking" && applications.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-gray-100">{applications.length}</span>}
                </button>
              ))}
            </div>

            {tab === "website" ? (
              siteLoading ? (
                <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
              ) : (
                <>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
                    <p className="text-sm text-indigo-900">
                      AI analyzes your resume & credentials against jobs posted on this website and auto-applies to the best matches.
                    </p>
                    {!profileSummary && <p className="text-xs text-amber-700 mt-1">⚠ Your profile looks sparse — fill your skills/education in Profile for sharper matching.</p>}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>{siteJobs.filter((j) => j.recommend && !j.applied).length}</strong> AI-recommended · {siteJobs.filter((j) => j.applied).length} applied · {siteJobs.length} total
                    </p>
                    <button onClick={autoApplyRecommended} disabled={siteApplying}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
                      {siteApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} AI Auto-Apply to recommended
                    </button>
                  </div>
                  {siteJobs.length === 0 ? (
                    <Empty title="No website jobs available" hint="When recruiters post jobs on the platform, they'll show here with AI match scores." />
                  ) : (
                    <div className="space-y-3">
                      {siteJobs.map((job) => (
                        <div key={job._id} className={`bg-white border rounded-xl p-4 flex items-start gap-3 ${job.recommend && !job.applied ? "border-emerald-300" : "border-gray-200"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {job.matchScore != null && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${job.matchScore >= 60 ? "bg-emerald-100 text-emerald-700" : job.matchScore >= 35 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{job.matchScore}% match</span>}
                              {job.recommend && <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">AI recommends</span>}
                              {job.applied && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Applied ✓</span>}
                              {job.experienceLevel && <span className="text-xs text-gray-400">{job.experienceLevel}</span>}
                            </div>
                            <h3 className="font-bold text-gray-900 mt-1">{job.title}</h3>
                            <p className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3">
                              {job.company && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>}
                              {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                              {job.salaryRange && <span>{job.salaryRange}</span>}
                            </p>
                            {job.fit && <p className="text-xs text-gray-600 mt-1">🧠 {job.fit}</p>}
                          </div>
                          {!job.applied && (
                            <button onClick={() => applyOne(job)} disabled={siteApplying}
                              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                              Apply
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            ) : tab === "find" ? (
              loading ? (
                <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
              ) : (
                <>
                  {/* Preferences */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                    <button onClick={() => setShowPrefs((v) => !v)} className="flex items-center gap-2 font-bold text-gray-900">
                      <Settings className="h-5 w-5 text-blue-600" /> Auto-Apply Preferences
                      <span className="text-xs font-normal text-gray-400">({showPrefs ? "hide" : "edit"})</span>
                    </button>
                    {showPrefs && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div><label className="text-xs font-semibold text-gray-500">Keywords / skills (comma separated)</label>
                          <input className={input} value={csv(prefs.keywords)} onChange={(e) => setPrefs({ ...prefs, keywords: parse(e.target.value) })} placeholder="react, node, data analysis" /></div>
                        <div><label className="text-xs font-semibold text-gray-500">Preferred industries</label>
                          <input className={input} value={csv(prefs.industries)} onChange={(e) => setPrefs({ ...prefs, industries: parse(e.target.value) })} placeholder="IT / Software, Banking / Finance" /></div>
                        <div><label className="text-xs font-semibold text-gray-500">Preferred locations</label>
                          <input className={input} value={csv(prefs.locations)} onChange={(e) => setPrefs({ ...prefs, locations: parse(e.target.value) })} placeholder="Bengaluru, Mumbai, Remote" /></div>
                        <div><label className="text-xs font-semibold text-gray-500">Employment types</label>
                          <input className={input} value={csv(prefs.employmentTypes)} onChange={(e) => setPrefs({ ...prefs, employmentTypes: parse(e.target.value) })} placeholder="Full-time, Internship" /></div>
                        <div><label className="text-xs font-semibold text-gray-500">Minimum match score: {prefs.minMatchScore}%</label>
                          <input type="range" min="0" max="100" step="5" className="w-full" value={prefs.minMatchScore} onChange={(e) => setPrefs({ ...prefs, minMatchScore: Number(e.target.value) })} /></div>
                        <div className="flex items-end">
                          <button onClick={savePrefs} disabled={savingPrefs} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2">
                            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save & Re-match
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bulk apply bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>{eligible.length}</strong> jobs match your criteria (≥{prefs.minMatchScore}%) · {selected.length} selected
                    </p>
                    <div className="flex gap-2">
                      <button onClick={selectAllEligible} className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Select all eligible</button>
                      <button onClick={applySelected} disabled={applying || selected.length === 0}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
                        {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} Apply to {selected.length || ""} selected
                      </button>
                    </div>
                  </div>

                  {jobs.length === 0 ? (
                    <Empty title="No jobs to match" hint="The job feed is empty — try refreshing later." />
                  ) : (
                    <div className="space-y-3">
                      {jobs.map((job) => {
                        const isSel = selected.includes(job._id);
                        const meets = job.matchScore >= (prefs.minMatchScore ?? 40);
                        return (
                          <div key={job._id} className={`bg-white border rounded-xl p-4 flex items-start gap-3 ${isSel ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200"}`}>
                            {!job.applied && (
                              <input type="checkbox" checked={isSel} onChange={() => toggleSelect(job._id)} className="mt-1.5 h-4 w-4 accent-blue-600" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${meets ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{job.matchScore}% match</span>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700">{job.industry}</span>
                                <span className="text-xs text-gray-400">{job.employmentType}</span>
                                {job.applied && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Applied</span>}
                              </div>
                              <h3 className="font-bold text-gray-900 mt-1">{job.title}</h3>
                              <p className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3">
                                {job.company && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>}
                                {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )
            ) : (
              applications.length === 0 ? (
                <Empty title="No applications tracked yet" hint="Apply to jobs from the Find & Apply tab to track them here." />
              ) : (
                <div className="space-y-2">
                  {applications.map((a) => (
                    <div key={a.jobId._id} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{a.jobId.title}</h3>
                        <p className="text-xs text-gray-500">{a.jobId.company} {a.matchScore != null && <span>· {a.matchScore}% match</span>} · applied {new Date(a.appliedAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <select value={a.status} onChange={(e) => updateStatus(a.jobId._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer ${STATUS_STYLE[a.status] || "bg-gray-100"}`}>
                        {TRACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => removeApp(a.jobId._id)} className="text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </FeatureGuard>
      </main>
    </div>
  );
}

function Empty({ title, hint }) {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1 text-sm">{hint}</p>
    </div>
  );
}
