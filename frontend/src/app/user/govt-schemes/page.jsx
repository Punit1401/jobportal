"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, Landmark, ExternalLink, Calendar, Bookmark, Sparkles, Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import ManualSubmitModal from "@/components/ManualSubmitModal";
import FeatureGuard from "@/components/FeatureGuard";

const BENEFIT_TYPES = ["Financial Aid", "Loan / Credit", "Subsidy", "Pension", "Insurance", "Scholarship", "Skill Training", "Healthcare", "Housing", "Employment Support", "Other"];

export default function GovtSchemesPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "All";
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [addType, setAddType] = useState(null);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    (async () => {
      try {
        const [r, rec, sv] = await Promise.all([
          fetch("/api/candidate/govt-resources").then((x) => x.json()),
          fetch("/api/candidate/scheme-recommendations").then((x) => x.json()).catch(() => ({})),
          fetch("/api/candidate/saved-schemes").then((x) => x.json()).catch(() => ({})),
        ]);
        if (r.success) setResources(r.data);
        if (rec.success) setRecommendations(rec.recommendations || []);
        if (sv.success) setSavedIds((sv.savedSchemes || []).map((s) => s._id));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const toggleSave = async (schemeId) => {
    try {
      const res = await fetch("/api/candidate/saved-schemes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId }),
      });
      const result = await res.json();
      if (result.success) setSavedIds((ids) => result.saved ? [...ids, schemeId] : ids.filter((id) => id !== schemeId));
      else if (res.status === 401) alert("Please log in to save schemes.");
    } catch { alert("Could not save."); }
  };

  const handleFlagResource = async (resourceId) => {
    if (!confirm("Flag & move this item to Admin Negative List?")) return;
    try {
      const res = await fetch("/api/candidate/flag-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceId, type: "resource" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("🚩 Item flagged and moved to Admin Negative List.");
        setResources((prev) => prev.filter((r) => r._id !== resourceId));
        setRecommendations((prev) => prev.filter((r) => r._id !== resourceId));
      } else {
        alert(data.error || "Failed to flag item.");
      }
    } catch {
      alert("Failed to flag item.");
    }
  };

  const showTabs = tabParam === "All";
  const filteredResources =
    activeTab === "All" ? resources :
      activeTab === "Saved" ? resources.filter((r) => savedIds.includes(r._id)) :
        resources.filter((r) => r.category === activeTab);

  const showRecs = (activeTab === "All" || activeTab === "Scheme") && recommendations.length > 0;

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="Government Portal Access">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 border-b pb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Landmark className="h-8 w-8 text-blue-600" />
                {activeTab === "Govt Job" ? "Government Jobs" :
                  activeTab === "Scheme" ? "Government Schemes" :
                    activeTab === "Internship" ? "Government Internships" :
                      "Government Schemes & Jobs"}
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                {activeTab === "Govt Job" ? "Latest government job notifications and recruitment updates." :
                  activeTab === "Scheme" ? "Discover government schemes and benefits. Personalized to your profile." :
                    activeTab === "Internship" ? "Government internship opportunities across ministries and departments." :
                      "Discover government jobs, schemes and benefits. Personalized to your profile, with eligibility matching."}
              </p>
            </div>
            <button onClick={() => setAddType(activeTab === "Govt Job" ? "govt-job" : activeTab === "Internship" ? "internship" : "scheme")}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50">
              <Plus className="h-4 w-4" /> {activeTab === "Govt Job" ? "Add a Govt Job" : activeTab === "Internship" ? "Add an Internship" : "Add a Scheme"}
            </button>
          </div>

          {/* Recommended for You */}
          {showRecs && (
            <div className="mb-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500" /> Recommended for You
                <span className="text-xs font-normal text-gray-400">(based on your profile)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((s) => (
                  <div key={s._id} className="group bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-5 flex flex-col hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> {s.matchScore}% match
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleFlagResource(s._id)} title="Flag as Negative / Spam" className="text-gray-400 hover:text-amber-600 transition-opacity opacity-0 group-hover:opacity-100 p-0.5">
                          <span className="text-xs">🚩</span>
                        </button>
                        <button onClick={() => toggleSave(s._id)} className={savedIds.includes(s._id) ? "text-blue-600" : "text-gray-300 hover:text-blue-500"}>
                          <Bookmark className={`h-4 w-4 ${savedIds.includes(s._id) ? "fill-blue-600" : ""}`} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{s.title}</h3>
                    {s.benefitAmount && <p className="text-xs font-semibold text-emerald-700 mb-1">{s.benefitAmount}</p>}
                    {s.matchReasons?.[0] && <p className="text-xs text-gray-500 mb-3">✓ {s.matchReasons[0]}</p>}
                    <a href={s.applyLink} target="_blank" rel="noopener noreferrer"
                      className="mt-auto text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                      View & Apply <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs — only shown when no specific category is pre-selected */}
          {showTabs && (
            <div className="flex space-x-2 overflow-x-auto mb-6 pb-2">
              {["All", "Govt Job", "Scheme", "Internship", "Saved"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {tab}{tab === "Saved" && savedIds.length > 0 ? ` (${savedIds.length})` : ""}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{activeTab === "Saved" ? "No saved schemes yet" : "No resources found"}</h3>
              <p className="text-gray-500 mt-1">{activeTab === "Saved" ? "Tap the bookmark on any scheme to save it." : `Check back later for new ${activeTab !== "All" ? activeTab : "jobs and schemes"}.`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((item) => (
                <SchemeCard
                  key={item._id}
                  item={item}
                  saved={savedIds.includes(item._id)}
                  onToggleSave={() => toggleSave(item._id)}
                  onFlag={() => handleFlagResource(item._id)}
                />
              ))}
            </div>
          )}
          </div>
        </FeatureGuard>
      </main>

      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} benefitTypes={BENEFIT_TYPES} />}
      {addType && <ManualSubmitModal type={addType} onClose={() => setAddType(null)} />}
    </div>
  );
}

function SchemeCard({ item, saved, onToggleSave, onFlag }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{item.category}</span>
            {item.source === "community" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">Manual</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onFlag} title="Flag as Negative / Spam" className="text-gray-400 hover:text-amber-600 transition-opacity opacity-0 group-hover:opacity-100 p-0.5">
              <span className="text-sm">🚩</span>
            </button>
            <button onClick={onToggleSave} title={saved ? "Remove" : "Save"}
              className={saved ? "text-blue-600" : "text-gray-300 hover:text-blue-500"}>
              <Bookmark className={`h-5 w-5 ${saved ? "fill-blue-600" : ""}`} />
            </button>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
        {item.benefitAmount && <p className="text-sm font-semibold text-emerald-700 mb-2">{item.benefitAmount}</p>}
        <p className={`text-gray-600 text-sm mb-4 ${expanded ? "" : "line-clamp-3"}`}>{item.description}</p>

        {expanded && (
          <div className="space-y-2 mb-4">
            {item.eligibility && item.eligibility !== "Not specified" && item.eligibility !== "See official source" && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                <strong>Eligibility:</strong> {item.eligibility}
              </div>
            )}
            {item.benefitType && item.benefitType !== "Other" && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                <strong>Benefit Type:</strong> {item.benefitType}
              </div>
            )}
            {item.sector && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                <strong>Sector:</strong> {item.sector}
              </div>
            )}
            {item.state && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                <strong>State:</strong> {item.state}
              </div>
            )}
            {item.incomeCeiling && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                <strong>Income Limit:</strong> {item.incomeCeiling}
              </div>
            )}
            {item.documentsRequired?.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                <strong>Documents:</strong> {item.documentsRequired.join(", ")}
              </div>
            )}
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700">
          {expanded ? "Show less" : "View details"}
        </button>
        {item.source === "community" && <span className="text-[11px] text-gray-400 ml-3">Community submission</span>}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <a href={item.applyLink} target="_blank" rel="noopener noreferrer"
          className="w-full flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Apply on Official Site <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function SubmitModal({ onClose, benefitTypes }) {
  const [form, setForm] = useState({ title: "", applyLink: "", description: "", eligibility: "", benefitType: "Other", sector: "", state: "All India" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  const submit = async () => {
    if (!form.title || !form.applyLink) return alert("Title and official link are required.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/candidate/community-schemes", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) setDone(true);
      else if (res.status === 401) alert("Please log in to submit.");
      else alert(result.error || "Submission failed.");
    } catch { alert("Submission failed."); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Suggest a Scheme / Benefit</h2>
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
            <input className={input} placeholder="Scheme name *" value={form.title} onChange={(e) => set("title", e.target.value)} />
            <input className={input} placeholder="Official link (https://…) *" value={form.applyLink} onChange={(e) => set("applyLink", e.target.value)} />
            <textarea className={input} rows={2} placeholder="Short description" value={form.description} onChange={(e) => set("description", e.target.value)} />
            <input className={input} placeholder="Eligibility (who can apply)" value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <select className={input} value={form.benefitType} onChange={(e) => set("benefitType", e.target.value)}>
                {benefitTypes.map((b) => <option key={b}>{b}</option>)}
              </select>
              <input className={input} placeholder="Sector (e.g. Health)" value={form.sector} onChange={(e) => set("sector", e.target.value)} />
            </div>
            <button onClick={submit} disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Submit for Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
