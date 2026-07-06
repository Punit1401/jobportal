"use client";
import React, { useState } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Sparkles, Brain, FileText, Users, Target, MessageSquare, Loader2, Wand2, Send, CheckCircle2 } from 'lucide-react';

export default function AIFeaturesPage() {
    const [activeTool, setActiveTool] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [input, setInput] = useState("");

    const tools = [
        { 
            id: 'matching', 
            name: "AI Candidate Scorer", 
            icon: <Target size={24} />, 
            color: "indigo",
            desc: "Upload a JD and find the top 5 matching candidates from your database.",
            prompt: "Paste Job Description here..."
        },
        { 
            id: 'jd', 
            name: "AI JD Generator", 
            icon: <FileText size={24} />, 
            color: "emerald",
            desc: "Generate a professional, SEO-optimized Job Description in seconds.",
            prompt: "Enter Job Title (e.g. Senior Node.js Developer)..."
        },
        { 
            id: 'questions', 
            name: "Interview Q&A", 
            icon: <MessageSquare size={24} />, 
            color: "amber",
            desc: "Generate role-specific interview questions and expected answers.",
            prompt: "Enter Job Role and Experience Level..."
        },
        { 
            id: 'email', 
            name: "Smart Outreach", 
            icon: <Send size={24} />, 
            color: "blue",
            desc: "Write personalized, high-conversion outreach emails to passive candidates.",
            prompt: "Enter Candidate Name and Role..."
        }
    ];

    const runTool = async () => {
        if (!input) return;
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch('/api/ai/recruiter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeTool, input }),
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.result);
            } else {
                alert(data.error || "AI generation failed.");
            }
        } catch (error) {
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="ai" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                                <Sparkles size={14} className="text-indigo-600" />
                                <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">Advanced AI Portal</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Features</h1>
                            <p className="text-slate-500 font-medium mt-1">Supercharge your hiring process with cutting-edge AI tools.</p>
                        </div>
                    </header>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tools.map((tool) => (
                            <button 
                                key={tool.id}
                                onClick={() => { setActiveTool(tool.id); setResult(null); setInput(""); }}
                                className={`p-8 rounded-[40px] border text-left transition-all group ${activeTool === tool.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-xl'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${activeTool === tool.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-indigo-600 group-hover:scale-110'}`}>
                                    {tool.icon}
                                </div>
                                <h3 className="text-xl font-black mb-2">{tool.name}</h3>
                                <p className={`text-sm font-medium leading-relaxed ${activeTool === tool.id ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {tool.desc}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Active Tool Area */}
                    {activeTool && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center gap-3 mb-8">
                                <Wand2 className="text-indigo-600" size={24} />
                                <h3 className="text-2xl font-black text-slate-900">
                                    {tools.find(t => t.id === activeTool).name}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Input Information</label>
                                        <textarea 
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={tools.find(t => t.id === activeTool).prompt}
                                            className="w-full h-64 p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                                        />
                                    </div>
                                    <button 
                                        onClick={runTool}
                                        disabled={loading || !input}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : <><Sparkles size={20} /> Generate AI Result</>}
                                    </button>
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative min-h-[300px]">
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle2 size={24} className={result ? "text-emerald-500" : "text-slate-200"} />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">AI Output</h4>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
                                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-bold animate-pulse">Consulting the AI Engine...</p>
                                        </div>
                                    ) : result ? (
                                        <div className="prose prose-slate max-w-none">
                                            <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">
                                                {result}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 pt-20">
                                            <Brain size={48} className="text-slate-300" />
                                            <p className="text-slate-400 font-bold max-w-[200px]">Waiting for your input to generate amazing insights.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
