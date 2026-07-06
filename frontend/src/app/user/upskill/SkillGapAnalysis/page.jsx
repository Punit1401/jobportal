"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Lightbulb, Loader2, BarChart3, Sparkles } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import { useSession } from "next-auth/react";

export default function SkillGapPage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [localSkills, setLocalSkills] = useState([]);
  const [jobDescription, setJobDescription] = useState("");

  // 🔹 Candidate Profile માંથી સ્કીલ્સ ફેચ કરવા માટે
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true);
        const res = await fetch("/api/candidates"); // તમારી કેન્ડિડેટ પ્રોફાઇલ API
        const data = await res.json();

        // જો ડેટા મળે તો સ્કીલ્સ સેટ કરો
        if (data && data.skills) {
          const skills = data.skills;
          // જો સ્કીલ્સ એરે હોય તો સીધું સેટ કરો, જો સ્ટ્રિંગ હોય તો સ્પ્લિટ કરો
          const skillsArray = Array.isArray(skills)
            ? skills
            : typeof skills === 'string'
              ? skills.split(',').map(s => s.trim()).filter(s => s !== "")
              : [];
          setLocalSkills(skillsArray);
        }
      } catch (error) {
        console.error("Error fetching profile skills:", error);
      } finally {
        setFetchingProfile(false);
      }
    };

    if (session) fetchProfile();
  }, [session]);

  const analyzeGap = async () => {
    // 1. Validation for missing data
    if (!localSkills || localSkills.length === 0) {
      alert("Skill Profile Missing: Please update your skills in your profile first.");
      return;
    }

    if (!jobDescription || jobDescription.trim() === "") {
      alert("Job Details Missing: No job description provided to compare.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSkills: localSkills,
          jobDescription: jobDescription
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAnalysis(data.analysis);
      } else {
        alert("Analysis Error: " + (data.error || "The AI engine encountered an issue."));
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Connection Failed: Unable to connect to the AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar activePage="skill-analysis" />

      <main className="flex-1 w-full p-4 sm:p-8 lg:p-12 mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Skill Gap Analysis
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Our AI evaluates your profile against the job requirements to help you improve.
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
            {!analysis && !loading && (
              <div className="mb-8">
                <label className="block text-slate-700 font-bold mb-3 uppercase tracking-widest text-sm">
                  Target Job Description
                </label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the requirements or job description of the role you want to apply for..."
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[160px] text-slate-700 bg-slate-50 transition-all"
                ></textarea>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">AI Analysis Engine</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                    {fetchingProfile ? "Loading Profile..." : "Powered by Gemini AI"}
                  </p>
                </div>
              </div>

              {!analysis && !loading && (
                <button
                  onClick={analyzeGap}
                  disabled={fetchingProfile || !jobDescription.trim()}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchingProfile ? "Fetching Data..." : "Start Analysis"}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <div className="text-center">
                  <p className="font-black text-slate-900 text-lg animate-pulse">Scanning Profile...</p>
                  <p className="text-slate-400 text-sm font-medium">Comparing your {localSkills.length} skills with the job description</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                  <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                      <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeWidth="3" strokeDasharray={`${analysis.matchPercentage || 0}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-2xl font-black text-slate-900">{analysis.matchPercentage}%</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="font-black text-slate-900 text-xl mb-1">Compatibility Score</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      You match {analysis.matchPercentage}% of the required technical stack for this specific role.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
                    <h4 className="flex items-center gap-2 text-emerald-700 font-black mb-4 text-xs uppercase tracking-widest">
                      <CheckCircle2 size={18} /> Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.existingSkills || []).map((skill, i) => (
                        <span key={i} className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-100 uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100">
                    <h4 className="flex items-center gap-2 text-rose-700 font-black mb-4 text-xs uppercase tracking-widest">
                      <XCircle size={18} /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.missingSkills || []).map((skill, i) => (
                        <span key={i} className="bg-white text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black border border-rose-100 uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  <div className="bg-white/20 h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/30">
                    <Lightbulb className="text-white" size={28} />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-black text-white text-lg uppercase tracking-tight mb-2">AI Roadmap & Advice</h4>
                    <p className="text-indigo-50 leading-relaxed font-medium">
                      {analysis.recommendation}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button onClick={() => setAnalysis(null)} className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                    Re-analyze Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <BarChart3 className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Ready to Scan? Click 'Start Analysis' above</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}