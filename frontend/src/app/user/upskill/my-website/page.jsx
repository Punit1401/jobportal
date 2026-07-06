"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Globe, Link as LinkIcon, Settings, Layout, Eye, Save, Loader2, Copy, CheckCircle2, Paintbrush, ToggleLeft, ToggleRight } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import Link from "next/link";

export default function MyWebsiteBuilder() {
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [candidateData, setCandidateData] = useState(null);
  const [config, setConfig] = useState({
    username: "",
    theme: "modern",
    template: "modern",
    accentColor: "indigo",
    isPublished: false,
    visibleSections: {
      about: true,
      experience: true,
      education: true,
      skills: true,
      contact: true,
      projects: true,
    }
  });

  useEffect(() => {
    if (session) {
      fetchPortfolio();
    }
  }, [session]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/portfolio");
      const data = await res.json();
      if (data.success) {
        setCandidateData(data.candidate);
        setConfig({
          username: data.portfolio.username || "",
          theme: data.portfolio.theme || "modern",
          template: data.portfolio.template || "modern",
          accentColor: data.portfolio.accentColor || "indigo",
          isPublished: data.portfolio.isPublished || false,
          visibleSections: data.portfolio.visibleSections || {
            about: true, experience: true, education: true, skills: true, contact: true, projects: true
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.username) return alert("Please enter a username for your website link.");
    
    setSaving(true);
    try {
      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        alert("Website settings saved successfully!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (!config.username) return;
    const url = `${window.location.origin}/p/${config.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section) => {
    setConfig(prev => ({
      ...prev,
      visibleSections: {
        ...prev.visibleSections,
        [section]: !prev.visibleSections[section]
      }
    }));
  };

  const colors = ["indigo", "emerald", "rose", "cyan", "amber", "purple"];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar />
      
      <main className="flex-1 w-full p-4 sm:p-8 lg:p-10 mt-16 lg:mt-0 lg:ml-72 transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Globe className="text-indigo-600" size={32} />
                My Website
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Manage your personal portfolio website powered by your profile data.
              </p>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Publish Changes
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Settings Panel */}
              <div className="space-y-6">
                
                {/* Status & Link Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-2"><LinkIcon size={20} className="text-indigo-500"/> Website Link</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Your Username Slug</label>
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">/p/</span>
                        <input 
                          type="text" 
                          placeholder="johndoe"
                          value={config.username}
                          onChange={(e) => setConfig({...config, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 focus:border-indigo-500 focus:ring-2 ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Website Status</p>
                        <p className={`text-xs font-black uppercase tracking-widest mt-1 ${config.isPublished ? "text-emerald-500" : "text-amber-500"}`}>
                          {config.isPublished ? "Live Publicly" : "Private / Draft"}
                        </p>
                      </div>
                      <button 
                        onClick={() => setConfig({...config, isPublished: !config.isPublished})}
                        className={`p-2 rounded-xl transition-colors ${config.isPublished ? "text-emerald-500 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                      >
                        {config.isPublished ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </div>

                    {config.username && config.isPublished && (
                      <div className="flex gap-2">
                        <button onClick={copyLink} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                          {copied ? <CheckCircle2 size={16} className="text-emerald-400"/> : <Copy size={16} />} 
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <Link href={`/p/${config.username}`} target="_blank" className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all">
                          <Eye size={16} /> View Live
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Theme & Design */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Paintbrush size={20} className="text-indigo-500"/> Appearance</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Base Theme</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setConfig({...config, theme: "modern"})}
                          className={`p-4 rounded-2xl border-2 font-black transition-all ${config.theme === "modern" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}
                        >
                          Light
                        </button>
                        <button 
                          onClick={() => setConfig({...config, theme: "dark"})}
                          className={`p-4 rounded-2xl border-2 font-black transition-all ${config.theme === "dark" ? "border-indigo-600 bg-slate-900 text-white" : "border-slate-100 text-slate-500 hover:border-slate-300 bg-slate-50"}`}
                        >
                          Dark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Template Layout</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['modern', 'minimal', 'creative'].map(tpl => (
                          <button 
                            key={tpl}
                            onClick={() => setConfig({...config, template: tpl})}
                            className={`p-4 rounded-2xl border-2 font-black text-sm capitalize transition-all ${config.template === tpl ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}
                          >
                            {tpl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Accent Color</label>
                      <div className="flex flex-wrap gap-3">
                        {colors.map(color => {
                          const bgColors = {
                            indigo: 'bg-indigo-500',
                            emerald: 'bg-emerald-500',
                            rose: 'bg-rose-500',
                            cyan: 'bg-cyan-500',
                            amber: 'bg-amber-500',
                            purple: 'bg-purple-500'
                          };
                          return (
                            <button 
                              key={color}
                              onClick={() => setConfig({...config, accentColor: color})}
                              className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${bgColors[color]} ${config.accentColor === color ? 'border-white ring-4 ring-slate-200 scale-110' : 'border-transparent hover:scale-105'}`}
                            >
                              {config.accentColor === color && <CheckCircle2 size={16} className="text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Visibility Sections */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Layout size={20} className="text-indigo-500"/> Content Visibility</h3>
                  <p className="text-sm font-medium text-slate-500 mb-6">
                    Choose which sections from your main profile should be visible on your public website.
                  </p>
                  
                  <div className="space-y-3">
                    {Object.keys(config.visibleSections).map(section => (
                      <div key={section} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                        <span className="font-bold text-slate-700 capitalize">{section}</span>
                        <button 
                          onClick={() => toggleSection(section)}
                          className={`p-1 rounded-xl transition-colors ${config.visibleSections[section] ? "text-emerald-500" : "text-slate-300"}`}
                        >
                          {config.visibleSections[section] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
