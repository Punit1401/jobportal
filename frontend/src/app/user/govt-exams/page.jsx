"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, GraduationCap, Calendar, Users, MapPin, ArrowRight, Filter, X, Loader2, Plus,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import ManualSubmitModal from "@/components/ManualSubmitModal";
import FeatureGuard from "@/components/FeatureGuard";

const STAGES = [
  "All", "Upcoming", "Application Open", "Admit Card", "Answer Key", "Result", "Completed",
];

const STAGE_STYLE = {
  "Upcoming": "bg-blue-100 text-blue-700",
  "Application Open": "bg-emerald-100 text-emerald-700",
  "Admit Card": "bg-amber-100 text-amber-700",
  "Answer Key": "bg-purple-100 text-purple-700",
  "Result": "bg-rose-100 text-rose-700",
  "Completed": "bg-gray-200 text-gray-600",
};

const STATES = [
  "All", "All India", "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

export default function GovtExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [stage, setStage] = useState("All");
  const [state, setState] = useState("All");

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stage !== "All") params.set("stage", stage);
      if (state !== "All") params.set("state", state);
      if (appliedSearch.trim()) params.set("q", appliedSearch.trim());

      const res = await fetch(`/api/candidate/govt-exams?${params.toString()}`);
      const result = await res.json();
      if (result.success) setExams(result.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [stage, state, appliedSearch]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const handleSearch = () => setAppliedSearch(searchInput);
  const clearAll = () => { setSearchInput(""); setAppliedSearch(""); setStage("All"); setState("All"); };
  const hasFilters = stage !== "All" || state !== "All" || appliedSearch.trim() !== "";

  const selectCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8
        ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="Government Portal Access">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                Government Exam Schedule
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                Full-year, state-wise schedule of government exams. Filter by stage to see what's
                upcoming, accepting applications, or where admit cards, answer keys and results are out.
              </p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50">
              <Plus className="h-4 w-4" /> Add an Exam
            </button>
          </div>

          {/* Search + filters */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search exams by name, board or keyword…"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <Filter className="h-4 w-4" /> Filters:
              </span>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                <select value={state} onChange={(e) => setState(e.target.value)} className={selectCls}>
                  {STATES.map((s) => <option key={s} value={s}>{s === "All" ? "All States" : s}</option>)}
                </select>
              </div>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className={selectCls}>
                {STAGES.map((s) => <option key={s} value={s}>{s === "All" ? "All Stages" : s}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Stage quick chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {STAGES.filter((s) => s !== "All").map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(stage === s ? "All" : s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${stage === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              {exams.length} exam{exams.length !== 1 ? "s" : ""}
              {state !== "All" && <span> in <strong>{state}</strong></span>}
              {stage !== "All" && <span> · <strong>{stage}</strong></span>}
            </p>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No exams found</h3>
              <p className="text-gray-500 mt-1">Try a different state, stage, or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Link
                  key={exam._id}
                  href={`/user/govt-exams/${exam.slug}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STAGE_STYLE[exam.stage] || "bg-gray-100 text-gray-700"}`}>
                        {exam.stage}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + (exam.ingestSource === "manual" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700")}>
                          {exam.ingestSource === "manual" ? "Manual" : exam.source}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!confirm("Flag & move this exam to Admin Negative List?")) return;
                            try {
                              const res = await fetch("/api/candidate/flag-item", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: exam._id, type: "exam" }),
                              });
                              const data = await res.json();
                              if (res.ok && data.success) {
                                alert("🚩 Exam flagged and moved to Admin Negative List.");
                                setExams((prev) => prev.filter((x) => x._id !== exam._id));
                              } else {
                                alert(data.error || "Failed to flag exam.");
                              }
                            } catch {
                              alert("Failed to flag exam.");
                            }
                          }}
                          title="Flag as Negative / Spam"
                          className="p-0.5 text-gray-400 hover:text-amber-600 transition-opacity opacity-0 group-hover:opacity-100"
                        >
                          <span className="text-xs">🚩</span>
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{exam.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1">{exam.conductingAuthority}</p>

                    <div className="space-y-2 text-sm text-gray-600">
                      {fmtDate(exam.keyDates?.applicationEnd) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-500 shrink-0" />
                          <span>Last date: <strong className="text-gray-800">{fmtDate(exam.keyDates.applicationEnd)}</strong></span>
                        </div>
                      )}
                      {fmtDate(exam.keyDates?.examDate) && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
                          <span>Exam: <strong className="text-gray-800">{fmtDate(exam.keyDates.examDate)}</strong></span>
                        </div>
                      )}
                      {typeof exam.vacancyCount === "number" && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Vacancies: <strong className="text-gray-800">{exam.vacancyCount.toLocaleString("en-IN")}</strong></span>
                        </div>
                      )}
                      {exam.state && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{exam.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto flex justify-center items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        </FeatureGuard>
      </main>
      {showAddModal && <ManualSubmitModal type="exam" onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
