"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/UserSidebar';
import { TrendingUp, Zap, Globe, Loader2, Search, Briefcase, X, Info } from 'lucide-react';
import FeatureGuard from "@/components/FeatureGuard";

export default function IndustryTrendsPage() {
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState('Technology');
  const [isManual, setIsManual] = useState(false);
  const [trends, setTrends] = useState(null);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchTrends = async (targetIndustry = industry) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/industry-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: targetIndustry }),
      });
      const data = await res.json();
      if (data.success) {
        setTrends(data.trends);
      }
    } catch (err) {
      alert("Error fetching market trends.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] overflow-hidden relative">
      <div className="lg:w-64 flex-shrink-0 border-r border-slate-200">
        <Sidebar activePage="industry-trends" />
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <FeatureGuard featureName="Learning Features">
          <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pt-10 lg:pt-0">
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 text-shadow-sm">
                Market Insights <TrendingUp className="text-emerald-500" />
              </h1>
              <p className="text-slate-500 font-bold mt-2">Real-time industry trends & demand analysis</p>
            </div>

            <div className="flex gap-2 bg-white p-2 rounded-3xl shadow-xl border border-slate-100 items-center">
              {isManual ? (
                <input
                  type="text"
                  autoFocus
                  className="bg-transparent outline-none px-4 py-2 font-bold text-slate-700 text-sm w-48"
                  placeholder="Enter industry..."
                  onBlur={() => !industry && setIsManual(false)}
                  onChange={(e) => setIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTrends()}
                />
              ) : (
                <select
                  value={industry}
                  onChange={(e) => {
                    if (e.target.value === "MANUAL") {
                      setIsManual(true);
                      setIndustry("");
                    } else {
                      setIndustry(e.target.value);
                      fetchTrends(e.target.value);
                    }
                  }}
                  className="bg-transparent outline-none px-4 py-2 font-bold text-slate-600 text-sm cursor-pointer"
                >
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Marketing">Marketing</option>
                  <option value="MANUAL">➕ Type Manually...</option>
                </select>
              )}

              <button
                onClick={() => fetchTrends()}
                disabled={loading}
                className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400">
              <div className="relative mb-6">
                <Loader2 className="animate-spin text-emerald-500" size={60} />
                <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={24} />
              </div>
              <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">Analyzing {industry} Market...</p>
            </div>
          ) : trends && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-700">

              <div className="md:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap size={120} />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" /> High Demand Skills (Click to expand)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trends.skills?.map((skill, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedItem({ title: skill.name, detail: skill.description, type: 'Skill', growth: skill.growth })}
                      className="p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-emerald-200 hover:bg-white transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-bold text-slate-700 group-hover:text-emerald-700">{skill.name}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-600">+{skill.growth}%</span>
                        <div className="w-12 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${skill.growth}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <Globe size={40} className="text-indigo-400 mb-6" />
                <div>
                  <h3 className="text-3xl font-black mb-2 tracking-tight">{trends.marketStatus}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Global Sentiment</p>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <p className="text-sm font-medium leading-relaxed italic text-slate-300">"{trends.summary}"</p>
                </div>
              </div>

              <div className="md:col-span-3 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Briefcase size={16} className="text-indigo-500" /> Emerging Roles (Click for info)
                </h3>
                <div className="flex flex-wrap gap-4">
                  {trends.roles?.map((role, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedItem({ title: role.name, detail: role.description, type: 'Role' })}
                      className="px-8 py-4 bg-indigo-50/50 text-indigo-700 rounded-2xl font-black text-xs border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {role.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
        </FeatureGuard>
      </main>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedItem.type === 'Skill' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {selectedItem.type}
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-4">{selectedItem.title}</h2>

              {selectedItem.growth && (
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={18} className="text-emerald-500" />
                  <span className="font-bold text-emerald-600">{selectedItem.growth}% Market Growth Potential</span>
                </div>
              )}

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex gap-3 text-slate-600 leading-relaxed font-medium">
                  <Info size={20} className="flex-shrink-0 mt-1 text-slate-400" />
                  <p>{selectedItem.detail}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-8 bg-slate-900 text-white p-5 rounded-3xl font-black hover:bg-indigo-600 transition-all shadow-lg"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}