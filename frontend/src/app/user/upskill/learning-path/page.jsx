"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/UserSidebar';
import { BookOpen, Map, ChevronRight, Loader2, Sparkles, CheckCircle2, PlayCircle } from 'lucide-react';

export default function LearningPathPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [roadmap, setRoadmap] = useState(null);

  const generateRoadmap = async () => {
    if (!role) return alert("Please enter a target job role!");
    setLoading(true);
    setRoadmap(null);

    try {
      const res = await fetch('/api/ai/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, level }),
      });
      const data = await res.json();
      if (data.success) setRoadmap(data.roadmap);
    } catch (err) {
      alert("Error generating roadmap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFEFF] overflow-hidden">
      <div className="lg:w-64 flex-shrink-0 border-r border-slate-100">
        <Sidebar activePage="learning-path" />
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-4xl mx-auto pt-10">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              Personalized Learning Path <Map className="text-indigo-600" />
            </h1>
            <p className="text-slate-500 font-bold mt-2">AI-driven roadmap to master your dream career</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Job Role</label>
                <input 
                  type="text" value={role} onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Data Scientist"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Level</label>
                <select 
                  value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-200 font-bold text-slate-600"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <button 
              onClick={generateRoadmap} disabled={loading}
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? "BUILDING YOUR PATH..." : "GENERATE MY ROADMAP"}
            </button>
          </div>

          {roadmap && (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
              <h3 className="text-xl font-black text-slate-800 px-4">Your Master Plan:</h3>
              {roadmap.steps.map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex gap-6 relative overflow-hidden group">
                  <div className="h-full w-1.5 bg-indigo-100 absolute left-0 top-0 group-hover:bg-indigo-500 transition-all"></div>
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                    {idx + 1}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-800">{step.topic}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {step.resources.map((res, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                          <PlayCircle size={12}/> {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}