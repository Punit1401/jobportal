"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark, GraduationCap, Calendar, MapPin, Loader2, Trash2, ClipboardList, ArrowRight, ExternalLink,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import FeatureGuard from "@/components/FeatureGuard";

const TRACK_STATUSES = ["Interested", "Applied", "Admit Card", "Appeared", "Result", "Selected", "Not Selected"];
const STATUS_STYLE = {
  Interested: "bg-blue-100 text-blue-700",
  Applied: "bg-emerald-100 text-emerald-700",
  "Admit Card": "bg-amber-100 text-amber-700",
  Appeared: "bg-purple-100 text-purple-700",
  Result: "bg-rose-100 text-rose-700",
  Selected: "bg-green-100 text-green-700",
  "Not Selected": "bg-gray-200 text-gray-600",
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

export default function MyExamsPage() {
  const [tab, setTab] = useState("saved");
  const [saved, setSaved] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        fetch("/api/candidate/saved-exams").then((r) => r.json()),
        fetch("/api/candidate/exam-tracking").then((r) => r.json()),
      ]);
      if (s.success) setSaved(s.savedExams || []);
      if (t.success) setTracking(t.tracking || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const unsave = async (examId) => {
    await fetch("/api/candidate/saved-exams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId }),
    });
    setSaved((xs) => xs.filter((e) => e._id !== examId));
  };

  const trackFromSaved = async (examId) => {
    await fetch("/api/candidate/exam-tracking", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, status: "Interested" }),
    });
    load();
    setTab("tracking");
  };

  const updateStatus = async (examId, status) => {
    setTracking((xs) => xs.map((a) => (a.examId._id === examId ? { ...a, status } : a)));
    await fetch("/api/candidate/exam-tracking", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, status }),
    });
  };

  const untrack = async (examId) => {
    await fetch(`/api/candidate/exam-tracking?examId=${examId}`, { method: "DELETE" });
    setTracking((xs) => xs.filter((a) => a.examId._id !== examId));
  };

  const tabs = [
    { id: "saved", label: "Saved Exams", icon: <Bookmark className="h-4 w-4" />, count: saved.length },
    { id: "tracking", label: "Application Tracking", icon: <ClipboardList className="h-4 w-4" />, count: tracking.length },
  ];

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="Government Portal Access">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-blue-600" /> My Exams
          </h1>
          <p className="text-gray-600 mb-6">Your saved government exams and application progress, all in one place.</p>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t.icon} {t.label}
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600">{t.count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
          ) : tab === "saved" ? (
            saved.length === 0 ? (
              <Empty icon={<Bookmark />} title="No saved exams yet"
                hint={<>Browse the <Link href="/user/govt-exams" className="text-blue-600 font-medium">Govt Exams</Link> and tap the bookmark to save them here.</>} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saved.map((exam) => (
                  <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{exam.category}</span>
                        <button onClick={() => unsave(exam._id)} className="text-gray-300 hover:text-red-500" title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Link href={`/user/govt-exams/${exam.slug}`}>
                        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">{exam.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 mb-3">{exam.conductingAuthority}</p>
                      {fmtDate(exam.keyDates?.applicationEnd) && (
                        <p className="text-sm text-gray-600 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-red-500" /> Last date: <strong>{fmtDate(exam.keyDates.applicationEnd)}</strong></p>
                      )}
                      {exam.state && <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1"><MapPin className="h-4 w-4 text-gray-400" /> {exam.state}</p>}
                    </div>
                    <div className="p-3 bg-gray-50 border-t flex gap-2">
                      <button onClick={() => trackFromSaved(exam._id)} className="flex-1 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                        <ClipboardList className="h-3.5 w-3.5" /> Track
                      </button>
                      <Link href={`/user/govt-exams/${exam.slug}`} className="flex-1 text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            tracking.length === 0 ? (
              <Empty icon={<ClipboardList />} title="No applications tracked"
                hint="Save an exam and tap 'Track' to follow your application progress here." />
            ) : (
              <div className="space-y-3">
                {tracking.map((a) => (
                  <div key={a.examId._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/govt-exams/${a.examId.slug}`}>
                        <h3 className="font-bold text-gray-900 truncate hover:text-blue-600">{a.examId.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-500">{a.examId.conductingAuthority}
                        {fmtDate(a.examId.keyDates?.examDate) && <span> · Exam: {fmtDate(a.examId.keyDates.examDate)}</span>}
                      </p>
                    </div>
                    <select value={a.status} onChange={(e) => updateStatus(a.examId._id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer ${STATUS_STYLE[a.status] || "bg-gray-100"}`}>
                      {TRACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => untrack(a.examId._id)} className="text-gray-300 hover:text-red-500" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
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

function Empty({ icon, title, hint }) {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="h-12 w-12 text-gray-400 mx-auto mb-4 flex items-center justify-center [&>svg]:h-12 [&>svg]:w-12">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1 text-sm">{hint}</p>
    </div>
  );
}
