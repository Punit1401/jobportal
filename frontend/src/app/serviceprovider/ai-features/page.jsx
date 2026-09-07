"use client";
import React, { useState } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import FeatureGuard from '@/components/FeatureGuard';
import { Sparkles, Brain, MessageSquare, Wand2, CheckCircle2, Loader2, Send } from 'lucide-react';

export default function AIFeaturesPage() {
    const [activeTool, setActiveTool] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [input, setInput] = useState("");

    const aiTools = [
        {
            id: 'qa_response',
            name: "Smart Response Generator",
            desc: "Draft professional answers to candidate questions.",
            icon: <MessageSquare size={28} />,
            color: "indigo",
            prompt: "Paste the candidate's question here...",
            systemInstruction: "You are an expert career consultant and service provider. Provide a professional, helpful, and concise draft response to the user's question."
        },
        {
            id: 'desc_optimizer',
            name: "Service Description Optimizer",
            desc: "Optimize your service listings for higher conversion.",
            icon: <Wand2 size={28} />,
            color: "purple",
            prompt: "Paste your current service description or ideas here...",
            systemInstruction: "You are an expert copywriter and marketing specialist. Rewrite the provided service description to make it highly engaging, professional, and SEO-optimized to attract more clients."
        },
        {
            id: 'proposal_writer',
            name: "Proposal & Pitch Writer",
            desc: "Generate persuasive pitches for your service offerings.",
            icon: <Send size={28} />,
            color: "amber",
            prompt: "What service are you pitching? (e.g., Premium Resume Writing for Tech Leaders)",
            systemInstruction: "You are a top-tier sales strategist. Generate a compelling, structured, and professional pitch or proposal for the given service offering."
        },
        {
            id: 'market_demand',
            name: "Market Demand Predictor",
            desc: "Analyze trends to predict high-demand services.",
            icon: <Brain size={28} />,
            color: "emerald",
            prompt: "Enter your service niche or category (e.g., Full-Stack Development Interview Prep)",
            systemInstruction: "You are a career market analyst. Based on current industry trends, analyze the demand for the provided service niche. Provide insights on what candidates are looking for and how the service provider can stand out."
        }
    ];

    const runTool = async () => {
        if (!input) return;
        setLoading(true);
        setResult(null);

        const tool = aiTools.find(t => t.id === activeTool);

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input, systemInstruction: tool.systemInstruction }),
            });
            const data = await res.json();
            if (data.text) {
                setResult(data.text);
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
            <Serviceprovidersidbar activePage="ai" />

            <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
                <FeatureGuard featureName="AI Features">
                <div className="max-w-7xl mx-auto space-y-10 pb-20">

                    {/* Header */}
                    <header className="relative bg-slate-900 rounded-[40px] p-10 md:p-16 text-white overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                        <div className="relative z-10 max-w-2xl space-y-6">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                                <Sparkles size={14} className="text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Intelligence</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]">
                                Empower Your Service with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Advanced AI.</span>
                            </h1>
                            <p className="text-slate-400 text-base font-medium leading-relaxed">
                                Leverage state-of-the-art AI to automate your workflow, optimize your listings, and scale your business faster.
                            </p>
                        </div>
                    </header>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {aiTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => { setActiveTool(tool.id); setResult(null); setInput(""); }}
                                className={`p-8 rounded-[35px] border text-left transition-all group ${activeTool === tool.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-xl'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${activeTool === tool.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-indigo-600 group-hover:scale-110'}`}>
                                    {tool.icon}
                                </div>
                                <h3 className="text-xl font-black mb-2">{tool.name}</h3>
                                <p className={`text-xs font-medium leading-relaxed ${activeTool === tool.id ? 'text-slate-400' : 'text-slate-500'}`}>
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
                                    {aiTools.find(t => t.id === activeTool).name}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Input Information</label>
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={aiTools.find(t => t.id === activeTool).prompt}
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
                </FeatureGuard>
            </main>
        </div>
    );
}
