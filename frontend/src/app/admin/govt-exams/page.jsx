"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, CheckCircle, Clock, Loader2, GraduationCap, Rss } from "lucide-react";

const CATEGORIES = [
  "Job Notification", "Upcoming Exam", "Admit Card", "Result", "Answer Key",
  "Counselling", "Document Verification", "Application Deadline", "Correction Window", "Interview Schedule",
];
const SOURCES = [
  "UPSC", "SSC", "IBPS", "SBI", "RBI", "Railway", "State PSC", "Defence", "Teaching",
  "Police", "University", "PSU", "Apprenticeship", "Skill Mission", "Employment Exchange", "Other",
];
const DATE_FIELDS = [
  ["applicationStart", "Application Start"], ["applicationEnd", "Last Date to Apply"],
  ["correctionWindowEnd", "Correction Window End"], ["admitCardDate", "Admit Card"],
  ["examDate", "Exam Date"], ["answerKeyDate", "Answer Key"],
  ["resultDate", "Result"], ["interviewDate", "Interview"],
];

const emptyForm = {
  name: "", conductingAuthority: "", advertisementNumber: "", category: "Job Notification",
  source: "Other", department: "", state: "", qualification: "", eligibilityConditions: "",
  ageLimit: "", reservationDetails: "", nationality: "Indian", experience: "", vacancyCount: "",
  salaryStructure: "", jobLocation: "", selectionProcedure: "", examPattern: "", negativeMarking: "",
  syllabus: "", applicationFees: "", paymentMethods: "", requiredDocuments: "", helpdeskInfo: "",
  officialWebsite: "", applyLink: "", status: "live",
  keyDates: {},
};

const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");

export default function GovtExamsAdmin() {
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/govt-exams");
      const result = await res.json();
      if (result.success) setExams(result.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchExams(); }, []);

  const handleImport = async () => {
    if (!confirm("Pull the latest exams from the live feeds now?")) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/govt-exams/import", { method: "POST" });
      const result = await res.json();
      if (result.success) { alert("✅ " + result.message); fetchExams(); }
      else alert(result.error || "Import failed.");
    } catch { alert("Import failed."); }
    setImporting(false);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDate = (k, v) => setForm((f) => ({ ...f, keyDates: { ...f.keyDates, [k]: v } }));

  const handleExtract = async () => {
    if (rawText.trim().length < 30) return alert("Paste the notification text first.");
    setExtracting(true);
    try {
      const res = await fetch("/api/admin/govt-exams/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || "Extraction failed.");

      const d = result.data;
      setForm({
        ...emptyForm,
        ...Object.fromEntries(Object.entries(d).filter(([k]) => k !== "keyDates" && k !== "requiredDocuments")),
        // null -> "" so inputs stay controlled
        ...Object.fromEntries(
          Object.entries(d).filter(([k]) => k !== "keyDates").map(([k, v]) => [k, v == null ? "" : v])
        ),
        requiredDocuments: Array.isArray(d.requiredDocuments) ? d.requiredDocuments.join(", ") : "",
        vacancyCount: d.vacancyCount ?? "",
        status: "live",
        keyDates: d.keyDates || {},
      });
      alert("✅ AI filled the form. Review the fields below, then Save (publishes live).");
    } catch (err) {
      alert("AI extraction failed. Please try again.");
    }
    setExtracting(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.conductingAuthority) return alert("Name and Conducting Authority are required.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        vacancyCount: form.vacancyCount === "" ? undefined : Number(form.vacancyCount),
        requiredDocuments: form.requiredDocuments
          ? form.requiredDocuments.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        keyDates: Object.fromEntries(
          Object.entries(form.keyDates || {}).filter(([, v]) => v)
        ),
      };
      const res = await fetch("/api/admin/govt-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || "Save failed.");
      alert("✅ Exam saved.");
      setForm(emptyForm);
      setRawText("");
      fetchExams();
    } catch (err) {
      alert("Save failed.");
    }
    setSaving(false);
  };

  const setStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/govt-exams?id=${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.success) setExams((xs) => xs.map((x) => (x._id === id ? { ...x, status } : x)));
    } catch { alert("Failed to update status."); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this exam?")) return;
    try {
      const res = await fetch(`/api/admin/govt-exams?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) setExams((xs) => xs.filter((x) => x._id !== id));
    } catch { alert("Failed to delete."); }
  };

  const filtered = filter === "All" ? exams : exams.filter((e) => e.status === filter);

  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const label = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2 mb-1">
            <GraduationCap className="h-7 w-7 text-indigo-600" /> Government Exams
          </h1>
          <p className="text-gray-500 text-sm">Auto-import from live feeds, or paste a notification for AI to structure.</p>
        </div>
        <button
          onClick={handleImport} disabled={importing}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rss className="h-4 w-4" />}
          {importing ? "Importing…" : "Auto-Import from Feeds"}
        </button>
      </div>

      {/* AI Import */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 mb-6">
        <label className="flex items-center gap-2 font-bold text-indigo-800 mb-2">
          <Sparkles className="h-5 w-5" /> AI Import
        </label>
        <textarea
          rows={5} value={rawText} onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste the full government exam notification text here…"
          className={input}
        />
        <button
          onClick={handleExtract} disabled={extracting}
          className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {extracting ? "Extracting…" : "Extract with AI"}
        </button>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Exam Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={label}>Exam Name *</label><input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className={label}>Conducting Authority *</label><input className={input} value={form.conductingAuthority} onChange={(e) => set("conductingAuthority", e.target.value)} /></div>
          <div><label className={label}>Advertisement Number</label><input className={input} value={form.advertisementNumber} onChange={(e) => set("advertisementNumber", e.target.value)} /></div>
          <div><label className={label}>Category</label><select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className={label}>Source</label><select className={input} value={form.source} onChange={(e) => set("source", e.target.value)}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className={label}>Department</label><input className={input} value={form.department} onChange={(e) => set("department", e.target.value)} /></div>
          <div><label className={label}>State</label><input className={input} value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
          <div><label className={label}>Qualification</label><input className={input} value={form.qualification} onChange={(e) => set("qualification", e.target.value)} /></div>
          <div><label className={label}>Vacancy Count</label><input type="number" className={input} value={form.vacancyCount} onChange={(e) => set("vacancyCount", e.target.value)} /></div>
          <div><label className={label}>Age Limit</label><input className={input} value={form.ageLimit} onChange={(e) => set("ageLimit", e.target.value)} /></div>
          <div><label className={label}>Salary Structure</label><input className={input} value={form.salaryStructure} onChange={(e) => set("salaryStructure", e.target.value)} /></div>
          <div><label className={label}>Job Location</label><input className={input} value={form.jobLocation} onChange={(e) => set("jobLocation", e.target.value)} /></div>
          <div><label className={label}>Application Fees</label><input className={input} value={form.applicationFees} onChange={(e) => set("applicationFees", e.target.value)} /></div>
          <div><label className={label}>Payment Methods</label><input className={input} value={form.paymentMethods} onChange={(e) => set("paymentMethods", e.target.value)} /></div>
          <div><label className={label}>Official Website</label><input className={input} value={form.officialWebsite} onChange={(e) => set("officialWebsite", e.target.value)} /></div>
          <div><label className={label}>Apply Link</label><input className={input} value={form.applyLink} onChange={(e) => set("applyLink", e.target.value)} /></div>
        </div>

        {/* Long text fields */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div><label className={label}>Eligibility Conditions</label><textarea rows={2} className={input} value={form.eligibilityConditions} onChange={(e) => set("eligibilityConditions", e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={label}>Reservation Details</label><textarea rows={2} className={input} value={form.reservationDetails} onChange={(e) => set("reservationDetails", e.target.value)} /></div>
            <div><label className={label}>Selection Procedure</label><textarea rows={2} className={input} value={form.selectionProcedure} onChange={(e) => set("selectionProcedure", e.target.value)} /></div>
            <div><label className={label}>Exam Pattern</label><textarea rows={2} className={input} value={form.examPattern} onChange={(e) => set("examPattern", e.target.value)} /></div>
            <div><label className={label}>Negative Marking</label><input className={input} value={form.negativeMarking} onChange={(e) => set("negativeMarking", e.target.value)} /></div>
          </div>
          <div><label className={label}>Syllabus</label><textarea rows={3} className={input} value={form.syllabus} onChange={(e) => set("syllabus", e.target.value)} /></div>
          <div><label className={label}>Required Documents (comma separated)</label><input className={input} value={form.requiredDocuments} onChange={(e) => set("requiredDocuments", e.target.value)} /></div>
          <div><label className={label}>Helpdesk Info</label><input className={input} value={form.helpdeskInfo} onChange={(e) => set("helpdeskInfo", e.target.value)} /></div>
        </div>

        {/* Key dates */}
        <h3 className="font-semibold text-gray-700 mt-6 mb-2 text-sm">Important Dates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DATE_FIELDS.map(([k, lbl]) => (
            <div key={k}>
              <label className={label}>{lbl}</label>
              <input type="date" className={input} value={toDateInput(form.keyDates?.[k])} onChange={(e) => setDate(k, e.target.value)} />
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 mt-6">
          <select className={input + " max-w-[140px]"} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="live">Publish Live</option>
            <option value="pending">Save as Pending</option>
          </select>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save Exam
          </button>
        </div>
      </div>

      {/* Existing exams */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">All Exams ({exams.length})</h2>
        <select className={input + " max-w-[180px]"} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {["All", "pending", "live", "expired", "rejected", "negative"].map((s) => (
            <option key={s} value={s}>{s === "negative" ? "🚩 Negative List" : s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
      ) : (filter === "negative" ? exams.filter(e => e.status === "negative") : filter === "All" ? exams.filter(e => e.status !== "negative") : exams.filter(e => e.status === filter)).length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-lg border border-dashed">No exams found in this category.</p>
      ) : (
        <div className="space-y-2">
          {(filter === "negative" ? exams.filter(e => e.status === "negative") : filter === "All" ? exams.filter(e => e.status !== "negative") : exams.filter(e => e.status === filter)).map((e) => (
            <div key={e._id} className={`flex items-center justify-between border rounded-lg p-3 ${e.status === "negative" ? "bg-red-50/60 border-red-200" : "bg-white border-gray-200"}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    e.status === "live" ? "bg-emerald-100 text-emerald-700" :
                    e.status === "negative" ? "bg-red-100 text-red-700" :
                    e.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                    {e.status}
                  </span>
                  <span className="text-xs text-gray-400">{e.source} • {e.category}</span>
                </div>
                <p className="font-semibold text-gray-900 truncate">{e.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {e.status === "negative" ? (
                  <button onClick={() => setStatus(e._id, "live")} title="Approve & Restore"
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 font-bold text-xs">Approve</button>
                ) : (
                  <>
                    {e.status !== "live" ? (
                      <button onClick={() => setStatus(e._id, "live")} title="Publish"
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"><CheckCircle className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => setStatus(e._id, "pending")} title="Unpublish"
                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"><Clock className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => setStatus(e._id, "negative")} title="Flag & Move to Negative List"
                      className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 font-bold text-xs">🚩 Flag</button>
                  </>
                )}
                <button onClick={() => remove(e._id)} title="Delete"
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
