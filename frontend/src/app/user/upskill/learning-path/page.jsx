"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/UserSidebar';
import { BookOpen, Map, ChevronRight, Loader2, Sparkles, CheckCircle2, PlayCircle, ArrowRight, Clock, Star } from 'lucide-react';
import FeatureGuard from "@/components/FeatureGuard";

export default function LearningPathPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [roadmap, setRoadmap] = useState(null);
  const [timeline, setTimeline] = useState(null);
  
  // New States for Interactive Visual Flowchart
  const [activeView, setActiveView] = useState('diagram'); // diagram or list
  const [activeStage, setActiveStage] = useState(0);

  const generateRoadmap = async () => {
    if (!role) return alert("Please enter a target job role!");
    setLoading(true);
    setRoadmap(null);
    setTimeline(null);
    setActiveStage(0);

    try {
      const res = await fetch('/api/ai/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, level }),
      });
      const data = await res.json();
      if (data.success) {
        setRoadmap(data.roadmap);
        setTimeline(data.timeline);
      }
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
        <FeatureGuard featureName="Learning Features">
          <div className="max-w-5xl mx-auto pt-10">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              Personalized Learning Path <Map className="text-indigo-600" />
            </h1>
            <p className="text-slate-500 font-bold mt-2">AI-driven roadmap & role transitions for your dream career</p>
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

          {(roadmap || timeline) && (
            <div className="space-y-8 pb-20">
              
              {/* View Switcher Toggle */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setActiveView('diagram')} 
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeView === 'diagram' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Interactive Flow diagram
                </button>
                <button 
                  onClick={() => setActiveView('list')} 
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeView === 'list' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Timeline List
                </button>
              </div>

              {activeView === 'diagram' ? (
                /* --- INTERACTIVE SVG FLOW diagram --- */
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-x-auto">
                    <div className="min-w-[800px] py-12 relative flex items-center justify-between px-16">
                      
                      {/* Visual Flow Line */}
                      <div className="absolute left-[110px] right-[110px] top-[80px] h-1.5 bg-indigo-50 border border-indigo-100/50 rounded-full -z-0">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full animate-pulse transition-all" style={{ width: `${(activeStage / (timeline.length - 1 || 1)) * 100}%` }}></div>
                      </div>

                      {timeline.map((stage, idx) => {
                        const isSelected = activeStage === idx;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setActiveStage(idx)}
                            className="relative z-10 flex flex-col items-center w-48 text-center group cursor-pointer"
                          >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300
                              ${isSelected 
                                ? 'bg-indigo-600 border-indigo-150 text-white scale-110 shadow-xl shadow-indigo-200 ring-4 ring-indigo-50' 
                                : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600'}`}>
                              <span className="text-lg font-black">{idx + 1}</span>
                            </div>
                            <div className="mt-4">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors ${isSelected ? 'bg-indigo-550 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                {stage.duration}
                              </span>
                              <h4 className={`font-black text-sm mt-2.5 truncate max-w-[180px] ${isSelected ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'}`}>{stage.title}</h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Focused Detail Panel */}
                    <div className="mt-6 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-100 pb-5 mb-5 gap-4">
                        <div>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">Phase {activeStage + 1} Info</span>
                          <h3 className="text-2xl font-black text-slate-800 mt-2">{timeline[activeStage]?.title}</h3>
                        </div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Expected duration: <span className="text-indigo-600 font-black">{timeline[activeStage]?.duration}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                        {timeline[activeStage]?.description}
                      </p>

                      {/* Linked learning path steps */}
                      {roadmap?.steps && (
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="text-indigo-600" size={14} /> Topic to Master
                          </h4>
                          <h5 className="font-black text-slate-900 text-base">
                            {roadmap.steps[activeStage % roadmap.steps.length]?.topic}
                          </h5>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {roadmap.steps[activeStage % roadmap.steps.length]?.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {(roadmap.steps[activeStage % roadmap.steps.length]?.resources || []).map((res, i) => (
                              <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black flex items-center gap-1 uppercase tracking-wider">
                                <PlayCircle size={10} /> {res}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* --- LIST VIEW TIMELINE --- */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Timeline Section */}
                  {timeline && (
                    <div className="lg:col-span-1 space-y-6 animate-in slide-in-from-left-5 duration-700">
                      <h3 className="text-xl font-black text-slate-800 px-4 flex items-center gap-2">
                        <Clock className="text-amber-500" /> Career Timeline
                      </h3>
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        {timeline.map((stage, idx) => (
                          <div key={idx} className="relative pl-6 border-l-2 border-indigo-100 last:border-transparent pb-6 last:pb-0">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-indigo-500 rounded-full"></div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-indigo-200 hover:shadow-md transition-all">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest mb-2 inline-block">
                                {stage.duration}
                              </span>
                              <h4 className="font-bold text-slate-800 text-sm mb-1">{stage.title}</h4>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">{stage.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roadmap Section */}
                  {roadmap && (
                    <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                      <h3 className="text-xl font-black text-slate-800 px-4 flex items-center gap-2">
                        <Star className="text-indigo-500" /> Your Master Plan
                      </h3>
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
                                  <PlayCircle size={12} /> {res}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
        </FeatureGuard>
      </main>
    </div>
  );
}