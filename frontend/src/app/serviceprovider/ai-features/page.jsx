"use client";
import React, { useState } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { Sparkles, Brain, MessageSquare, Wand2, Zap, Rocket, Star, ShieldCheck, ArrowRight, Loader2, Bot, Cpu } from 'lucide-react';

export default function AIFeaturesPage() {
    const [generating, setGenerating] = useState(false);

    const aiTools = [
        { 
            id: 1, 
            title: "Smart Response Generator", 
            desc: "AI-powered responses to client inquiries based on your service history.", 
            icon: <MessageSquare className="text-indigo-600" size={28} />,
            status: "Beta"
        },
        { 
            id: 2, 
            title: "Service Description Optimizer", 
            desc: "Optimize your service listings for higher conversion and SEO.", 
            icon: <Wand2 className="text-purple-600" size={28} />,
            status: "Premium"
        },
        { 
            id: 3, 
            title: "Market Demand Predictor", 
            desc: "Analyze trends to predict which services will be in high demand.", 
            icon: <Brain className="text-emerald-600" size={28} />,
            status: "Experimental"
        },
        { 
            id: 4, 
            title: "Automated Follow-up Bot", 
            desc: "Engage with clients automatically after a service inquiry.", 
            icon: <Bot className="text-amber-600" size={28} />,
            status: "Coming Soon"
        }
    ];

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="ai" />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-12 pb-20">
                    
                    {/* Hero Section */}
                    <header className="relative bg-slate-900 rounded-[50px] p-12 md:p-20 text-white overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                        
                        <div className="relative z-10 max-w-2xl space-y-8">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
                                <Sparkles size={16} className="text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Intelligence</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                                Empower Your Service with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Advanced AI.</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                Leverage state-of-the-art machine learning to automate your workflow, optimize your listings, and scale your business faster.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button className="bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black hover:scale-105 transition-all shadow-2xl shadow-white/10">Launch AI Studio</button>
                                <button className="bg-white/5 border border-white/10 px-10 py-5 rounded-[24px] font-black hover:bg-white/10 transition-all">View Documentation</button>
                            </div>
                        </div>
                        
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden xl:block">
                            <Cpu size={240} className="text-white/5 animate-spin-slow" />
                        </div>
                    </header>

                    {/* AI Tools Grid */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-end px-4">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Suite</h3>
                                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Available Modules</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {aiTools.map((tool) => (
                                <div key={tool.id} className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-10 right-10">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            tool.status === 'Beta' ? 'bg-indigo-50 text-indigo-600' :
                                            tool.status === 'Premium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                                        }`}>{tool.status}</span>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {tool.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{tool.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed">{tool.desc}</p>
                                        </div>
                                        <button className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest pt-4 hover:translate-x-2 transition-all">
                                            Explore Tool <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Feature */}
                    <div className="bg-indigo-50 rounded-[50px] p-12 border border-indigo-100 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-indigo-600 shrink-0 shadow-xl shadow-indigo-200/50">
                            <Rocket size={40} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h4 className="text-2xl font-black text-slate-900">Request Custom AI Model</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Need something specific for your industry? Our engineering team can build custom LLM solutions tailored to your service needs.</p>
                        </div>
                        <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black shadow-xl shadow-slate-200 shrink-0 hover:-translate-y-1 transition-all">Talk to AI Team</button>
                    </div>

                </div>
            </main>
        </div>
    );
}
