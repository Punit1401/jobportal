"use client";
import React, { useState } from "react";
import { X, Plus, Loader2, CheckCircle2 } from "lucide-react";

const FIELDS_BY_TYPE = {
  job: [
    { key: "title", label: "Job Title *", required: true },
    { key: "company", label: "Company Name" },
    { key: "applyUrl", label: "Apply URL (https://...) *", required: true },
    { key: "location", label: "Location" },
    { key: "industry", label: "Industry / Sector" },
    { key: "experience", label: "Experience (e.g. 0-2 years)" },
    { key: "employmentType", label: "Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] },
    { key: "description", label: "Short Description", type: "textarea" },
  ],
  exam: [
    { key: "name", label: "Exam Name *", required: true },
    { key: "conductingAuthority", label: "Conducting Authority (e.g. UPSC, SSC)" },
    { key: "applyLink", label: "Apply / Official Link *", required: true },
    { key: "state", label: "State", type: "select", options: ["All India","Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"] },
    { key: "applicationEnd", label: "Last Date to Apply", type: "date" },
    { key: "examDate", label: "Exam Date", type: "date" },
    { key: "vacancyCount", label: "Number of Vacancies", type: "number" },
  ],
  scheme: [
    { key: "title", label: "Scheme Name *", required: true },
    { key: "applyLink", label: "Official Link (https://...) *", required: true },
    { key: "description", label: "Short Description", type: "textarea" },
    { key: "eligibility", label: "Eligibility (who can apply)" },
    { key: "sector", label: "Sector (e.g. Health, Education)" },
    { key: "state", label: "State", placeholder: "All India" },
  ],
  "govt-job": [
    { key: "title", label: "Job Title *", required: true },
    { key: "applyLink", label: "Official Link (https://...) *", required: true },
    { key: "description", label: "Short Description", type: "textarea" },
    { key: "eligibility", label: "Eligibility" },
    { key: "sector", label: "Department / Sector" },
    { key: "state", label: "State", placeholder: "All India" },
  ],
  internship: [
    { key: "title", label: "Internship Title *", required: true },
    { key: "applyLink", label: "Official Link (https://...) *", required: true },
    { key: "description", label: "Short Description", type: "textarea" },
    { key: "eligibility", label: "Eligibility" },
    { key: "sector", label: "Sector" },
    { key: "state", label: "State", placeholder: "All India" },
  ],
  apprenticeship: [
    { key: "title", label: "Apprenticeship Title *", required: true },
    { key: "applyLink", label: "Official Link (https://...) *", required: true },
    { key: "description", label: "Short Description", type: "textarea" },
    { key: "eligibility", label: "Eligibility (e.g. ITI/Diploma holders)" },
    { key: "sector", label: "Sector", placeholder: "Skill Development" },
    { key: "state", label: "State", placeholder: "All India" },
  ],
  training: [
    { key: "title", label: "Training Program Title *", required: true },
    { key: "applyLink", label: "Official Link (https://...) *", required: true },
    { key: "description", label: "Short Description", type: "textarea" },
    { key: "eligibility", label: "Eligibility" },
    { key: "sector", label: "Sector", placeholder: "Skill Development" },
    { key: "state", label: "State", placeholder: "All India" },
  ],
};

const TITLES = {
  job: "Add a Job",
  exam: "Add an Exam",
  scheme: "Add a Scheme",
  "govt-job": "Add a Govt Job",
  internship: "Add an Internship",
  apprenticeship: "Add an Apprenticeship",
  training: "Add a Training Program",
};

export default function ManualSubmitModal({ type, onClose }) {
  const fields = FIELDS_BY_TYPE[type] || FIELDS_BY_TYPE.job;
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  var set = function(k, v) { setForm(function(f) { var next = Object.assign({}, f); next[k] = v; return next; }); };

  var inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  var submit = async function() {
    var required = fields.filter(function(f) { return f.required; });
    for (var i = 0; i < required.length; i++) {
      if (!form[required[i].key] || !form[required[i].key].trim()) {
        alert("Please fill in: " + required[i].label.replace(" *", ""));
        return;
      }
    }
    setSubmitting(true);
    try {
      var payload = Object.assign({}, form, { type: type });
      var res = await fetch("/api/candidate/manual-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      var result = await res.json();
      if (result.success) {
        setDone(true);
      } else if (res.status === 401) {
        alert("Please log in to submit.");
      } else {
        alert(result.error || "Submission failed.");
      }
    } catch (e) {
      alert("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={function(e) { e.stopPropagation(); }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">{TITLES[type] || "Add Entry"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">Submitted for review</p>
            <p className="text-sm text-gray-500 mt-1">It will appear on the portal once approved by an admin.</p>
            <p className="text-xs text-gray-400 mt-2">This will be tagged as a manual submission.</p>
            <button onClick={onClose} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Close</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Submissions are reviewed by an admin before going live. Manual entries will be tagged accordingly.
            </p>

            {fields.map(function(f) {
              if (f.type === "textarea") {
                return (
                  <textarea key={f.key} className={inputCls} rows={2} placeholder={f.label}
                    value={form[f.key] || ""} onChange={function(e) { set(f.key, e.target.value); }} />
                );
              }
              if (f.type === "select") {
                return (
                  <select key={f.key} className={inputCls} value={form[f.key] || ""}
                    onChange={function(e) { set(f.key, e.target.value); }}>
                    <option value="">{f.label}</option>
                    {f.options.map(function(o) { return <option key={o} value={o}>{o}</option>; })}
                  </select>
                );
              }
              if (f.type === "date") {
                return (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
                    <input type="date" className={inputCls} value={form[f.key] || ""}
                      onChange={function(e) { set(f.key, e.target.value); }} />
                  </div>
                );
              }
              if (f.type === "number") {
                return (
                  <input key={f.key} type="number" className={inputCls} placeholder={f.label}
                    value={form[f.key] || ""} onChange={function(e) { set(f.key, e.target.value); }} />
                );
              }
              return (
                <input key={f.key} type="text" className={inputCls} placeholder={f.placeholder || f.label}
                  value={form[f.key] || ""} onChange={function(e) { set(f.key, e.target.value); }} />
              );
            })}

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
