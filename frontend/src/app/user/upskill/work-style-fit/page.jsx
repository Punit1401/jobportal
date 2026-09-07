"use client";

import React, { useState } from "react";
import UserSidebar from "@/components/UserSidebar";
import { Sparkles, BrainCircuit, Target, Users, Building2, Loader2, CheckCircle2, AlertTriangle, Lightbulb, MessageSquare } from "lucide-react";
import FeatureGuard from "@/components/FeatureGuard";

const personalityQuickPicks = [
  "Collaborative, adaptable, and proactive",
  "Independent, structured, and detail-oriented",
  "Fast-paced, ambitious, and results-driven",
  "Creative, experimental, and open-minded"
];

const preferenceQuickPicks = [
  "I prefer clear goals, regular feedback, and a stable team environment.",
  "I enjoy autonomy, ownership, and minimal micromanagement.",
  "I thrive in fast-moving teams with lots of cross-functional collaboration.",
  "I like structured processes, predictable routines, and deep focus time."
];

export default function WorkStyleFitPage() {
  const [personalityTraits, setPersonalityTraits] = useState(personalityQuickPicks[0]);
  const [workPreferences, setWorkPreferences] = useState(preferenceQuickPicks[0]);
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const analyzeFit = async (e) => {
    if (e) e.preventDefault();

    if (!personalityTraits.trim() || !workPreferences.trim()) {
      alert("Please describe your work style and preferences.");
      return;
    }

    if (!targetCompany.trim() && !targetRole.trim() && !jobDescription.trim()) {
      alert("Please add a target company, role, or job description.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/ai/work-style-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalityTraits: personalityTraits.trim(),
          workPreferences: workPreferences.trim(),
          targetCompany: targetCompany.trim(),
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim()
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert(data.error || "Could not generate analysis.");
      }
    } catch (error) {
      alert("Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 55) return "text-amber-500";
    return "text-rose-500";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-100";
    if (score >= 55) return "bg-amber-50 border-amber-100";
    return "bg-rose-50 border-rose-100";
  };

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="AI Features">
          <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-6xl mx-auto space-y-8 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                <Sparkles size={14} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">AI Powered Analysis</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Work Style Fit Analysis
              </h1>
              <p className="text-slate-500 font-medium mt-3 max-w-3xl text-lg">
                See how your personality, work preferences, and communication style align with a target company or role before you apply.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BrainCircuit size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Your Work Style</h2>
                    <p className="text-sm text-slate-500 font-medium">Describe how you like to work in real life.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quick Pick</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {personalityQuickPicks.map((pick) => (
                        <button
                          key={pick}
                          type="button"
                          onClick={() => setPersonalityTraits(pick)}
                          className={`text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${personalityTraits === pick ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"}`}
                        >
                          {pick}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Personality Traits</label>
                    <textarea
                      value={personalityTraits}
                      onChange={(e) => setPersonalityTraits(e.target.value)}
                      rows={4}
                      placeholder="Example: collaborative, calm under pressure, likes ownership, values feedback..."
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 transition-all resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Work Preferences</label>
                    <textarea
                      value={workPreferences}
                      onChange={(e) => setWorkPreferences(e.target.value)}
                      rows={4}
                      placeholder="Example: prefer clear goals, hybrid work, regular check-ins, fast-paced team..."
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Target Opportunity</h2>
                    <p className="text-sm text-slate-500 font-medium">Add a company, role, or pasted job description.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company</label>
                      <input
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="e.g. Google, TCS, startup"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role</label>
                      <input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Frontend Developer"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Job Description</label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={6}
                      placeholder="Paste the job description or team culture details here..."
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={analyzeFit}
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Target size={20} />}
                {loading ? "Analyzing Fit..." : "Analyze Work Style Fit"}
              </button>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm min-h-[500px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <Loader2 className="animate-spin mb-4 text-indigo-600" size={40} />
                  <p className="font-bold animate-pulse text-xs uppercase tracking-widest">AI is evaluating your fit...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={`p-6 rounded-[28px] border ${scoreBg(analysis.fitScore)}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Fit Score</p>
                        <div className={`text-5xl font-black ${scoreColor(analysis.fitScore)}`}>{analysis.fitScore}%</div>
                      </div>
                      <div className="max-w-md">
                        <h3 className="text-xl font-black text-slate-900 mb-2">Overall Match</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{analysis.fitSummary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-5 rounded-[24px] bg-emerald-50 border border-emerald-100">
                      <h4 className="flex items-center gap-2 font-black text-emerald-700 uppercase tracking-widest text-xs mb-4">
                        <CheckCircle2 size={16} /> Strong Matches
                      </h4>
                      <div className="space-y-2">
                        {(analysis.strongMatches || []).map((item, idx) => (
                          <div key={idx} className="bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-700 border border-emerald-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-[24px] bg-rose-50 border border-rose-100">
                      <h4 className="flex items-center gap-2 font-black text-rose-700 uppercase tracking-widest text-xs mb-4">
                        <AlertTriangle size={16} /> Potential Gaps
                      </h4>
                      <div className="space-y-2">
                        {(analysis.potentialGaps || []).map((item, idx) => (
                          <div key={idx} className="bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-700 border border-rose-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-6 rounded-[24px] bg-indigo-50 border border-indigo-100">
                      <h4 className="flex items-center gap-2 font-black text-indigo-700 uppercase tracking-widest text-xs mb-4">
                        <Users size={16} /> Ideal Environments
                      </h4>
                      <div className="space-y-2">
                        {(analysis.idealEnvironments || []).map((item, idx) => (
                          <div key={idx} className="bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-700 border border-indigo-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-[24px] bg-amber-50 border border-amber-100">
                      <h4 className="flex items-center gap-2 font-black text-amber-700 uppercase tracking-widest text-xs mb-4">
                        <MessageSquare size={16} /> Interview Talking Points
                      </h4>
                      <div className="space-y-2">
                        {(analysis.interviewTalkingPoints || []).map((item, idx) => (
                          <div key={idx} className="bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-700 border border-amber-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[28px] p-6 md:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                      <h4 className="font-black text-white uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                        <Lightbulb size={16} className="text-yellow-400" /> Growth Advice
                      </h4>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        {analysis.growthAdvice}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setAnalysis(null)}
                      className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all"
                    >
                      Re-analyze Fit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic font-bold py-20">
                  <Target size={60} className="mb-4 opacity-20" />
                  <p>Fill your profile and target opportunity, then analyze your fit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </FeatureGuard>
      </main>
    </div>
  );
}
