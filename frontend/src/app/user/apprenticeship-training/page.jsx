"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, GraduationCap, ExternalLink, Bookmark, Loader2, Briefcase, Plus } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import ManualSubmitModal from "@/components/ManualSubmitModal";
import FeatureGuard from "@/components/FeatureGuard";

export default function ApprenticeshipTrainingPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "All";
  const [resources, setResources] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [addType, setAddType] = useState(null);

  useEffect(() => { setActiveTab(tabParam); }, [tabParam]);

  useEffect(() => {
    (async () => {
      try {
        const [r, sv] = await Promise.all([
          fetch("/api/candidate/govt-resources").then((x) => x.json()),
          fetch("/api/candidate/saved-schemes").then((x) => x.json()).catch(() => ({})),
        ]);
        if (r.success) setResources(r.data.filter((d) => d.category === "Apprenticeship" || d.category === "Training"));
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
      else if (res.status === 401) alert("Please log in to save.");
    } catch { alert("Could not save."); }
  };

  const filtered =
    activeTab === "All" ? resources :
      activeTab === "Saved" ? resources.filter((r) => savedIds.includes(r._id)) :
        resources.filter((r) => r.category === activeTab);

  const titles = {
    All: "Apprenticeship & Training",
    Apprenticeship: "Government Apprenticeships",
    Training: "Government Training Programs",
    Saved: "Saved Programs",
  };
  const descriptions = {
    All: "Browse government apprenticeship and skill training programs. Earn stipends while you learn with NAPS, NATS, and PSU programs.",
    Apprenticeship: "NAPS, NATS and government apprenticeship programs across PSUs, railways and more. Earn a stipend while you learn.",
    Training: "Free government skill training and certification programs to boost your career.",
    Saved: "Your saved apprenticeship and training programs.",
  };

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="Government Portal Access">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 border-b pb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Wrench className="h-8 w-8 text-blue-600" />
                {titles[activeTab] || titles.All}
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">{descriptions[activeTab] || descriptions.All}</p>
            </div>
            <button onClick={() => setAddType(activeTab === "Training" ? "training" : "apprenticeship")}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50">
              <Plus className="h-4 w-4" /> {activeTab === "Training" ? "Add Training" : "Add Apprenticeship"}
            </button>
          </div>

          <div className="flex space-x-2 overflow-x-auto mb-6 pb-2">
            {["All", "Apprenticeship", "Training", "Saved"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {tab}{tab === "Saved" && savedIds.length > 0 ? ` (${savedIds.length})` : ""}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{activeTab === "Saved" ? "No saved programs yet" : "No programs found"}</h3>
              <p className="text-gray-500 mt-1">{activeTab === "Saved" ? "Tap the bookmark on any program to save it." : "Check back later for new programs."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <ProgramCard
                  key={item._id}
                  item={item}
                  saved={savedIds.includes(item._id)}
                  onToggleSave={() => toggleSave(item._id)}
                  onFlag={async () => {
                    if (!confirm("Flag & move this program to Admin Negative List?")) return;
                    try {
                      const res = await fetch("/api/candidate/flag-item", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: item._id, type: "resource" }),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        alert("🚩 Program flagged and moved to Admin Negative List.");
                        setResources((prev) => prev.filter((r) => r._id !== item._id));
                      } else {
                        alert(data.error || "Failed to flag program.");
                      }
                    } catch {
                      alert("Failed to flag program.");
                    }
                  }}
                />
              ))}
            </div>
          )}
          </div>
        </FeatureGuard>
      </main>
      {addType && <ManualSubmitModal type={addType} onClose={() => setAddType(null)} />}
    </div>
  );
}

function ProgramCard({ item, saved, onToggleSave, onFlag }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${item.category === "Apprenticeship" ? "bg-purple-100 text-purple-800" : "bg-teal-100 text-teal-800"}`}>
              {item.category === "Apprenticeship" ? <Wrench className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
              {item.category}
            </span>
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
        <p className={`text-gray-600 text-sm mb-4 ${expanded ? "" : "line-clamp-3"}`}>{item.description}</p>

        {expanded && (
          <div className="space-y-2 mb-4">
            {item.eligibility && item.eligibility !== "Not specified" && item.eligibility !== "See official source" && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700"><strong>Eligibility:</strong> {item.eligibility}</div>
            )}
            {item.sector && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700"><strong>Sector:</strong> {item.sector}</div>
            )}
            {item.state && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700"><strong>State:</strong> {item.state}</div>
            )}
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          {expanded ? "Show less" : "View details"}
        </button>
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
