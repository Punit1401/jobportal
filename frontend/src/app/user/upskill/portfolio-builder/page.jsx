"use client";
import React, { useState } from "react";
import { Briefcase, Sparkles, User, Code, Layout, Send, Loader2, ArrowRight, Download, Plus, Trash2 } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';

export default function PortfolioBuilderPage() {
    const [userData, setUserData] = useState({
        name: "",
        role: "",
        bio: "",
        skills: "",
        experience: "",
        projects: ""
    });
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const generatePortfolio = async (e) => {
        if (e) e.preventDefault();
        
        if (!userData.name || !userData.role) {
            return alert("Please provide at least your name and professional role.");
        }
        
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch("/api/ai/portfolio-builder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userData }),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult(data);
            } else {
                alert(data.error || "Could not generate portfolio.");
            }
        } catch (error) {
            alert("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                                <Sparkles size={14} className="text-indigo-600" />
                                <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">AI Portfolio Designer</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Portfolio Builder
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Tell us about your journey, and let our AI craft a professional portfolio structure that stands out to recruiters.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                        {/* Input Form */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <form onSubmit={generatePortfolio} className="space-y-5">
                                    <h3 className="text-xl font-black text-slate-900 mb-4">Personal Details</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                                            <input 
                                                type="text"
                                                name="name"
                                                value={userData.name}
                                                onChange={handleInputChange}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Professional Role *</label>
                                            <input 
                                                type="text"
                                                name="role"
                                                value={userData.role}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Senior Software Engineer"
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Key Skills (Comma separated)</label>
                                            <input 
                                                type="text"
                                                name="skills"
                                                value={userData.skills}
                                                onChange={handleInputChange}
                                                placeholder="e.g. React, Node.js, AWS, Python"
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Work Experience Summary</label>
                                            <textarea 
                                                name="experience"
                                                value={userData.experience}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="Mention your past roles and key companies..."
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none resize-none"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Projects Summary</label>
                                            <textarea 
                                                name="projects"
                                                value={userData.projects}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="Briefly describe 1-2 major projects you've worked on..."
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none resize-none"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !userData.name || !userData.role}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Designing Portfolio...</>
                                        ) : (
                                            <><Sparkles size={18} /> Generate My Portfolio</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Output Section */}
                        <div className="xl:col-span-3">
                            {loading ? (
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                        <div className="relative bg-white p-6 rounded-full shadow-lg border border-slate-100">
                                            <Loader2 className="animate-spin text-indigo-600" size={48} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">Drafting Your Portfolio</h3>
                                    <p className="text-slate-500 font-medium mt-3 max-w-sm">
                                        Our AI is analyzing your background to create an impactful personal brand...
                                    </p>
                                </div>
                            ) : result ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                                    {/* Preview Card */}
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden">
                                        
                                        {/* Hero Section */}
                                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                            <div className="relative z-10">
                                                <h2 className="text-4xl font-black mb-2">{userData.name}</h2>
                                                <p className="text-indigo-100 font-bold text-xl mb-6">{result.hero?.tagline || userData.role}</p>
                                                <p className="text-indigo-50/90 text-lg leading-relaxed max-w-2xl font-medium">
                                                    {result.hero?.intro}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-8 md:p-10 space-y-12 bg-white">
                                            
                                            {/* About Me */}
                                            <section>
                                                <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                        <User size={18} className="text-indigo-600" />
                                                    </div>
                                                    Professional Bio
                                                </h4>
                                                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                                    {result.aboutMe}
                                                </p>
                                            </section>

                                            {/* Skills Grid */}
                                            <section>
                                                <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                                        <Code size={18} className="text-emerald-600" />
                                                    </div>
                                                    Core Expertise
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {result.skills?.map((skillGroup, i) => (
                                                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                            <p className="font-black text-xs text-slate-400 uppercase tracking-widest mb-3">{skillGroup.category}</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {skillGroup.items?.map((skill, j) => (
                                                                    <span key={j} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Experience & Projects */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <section>
                                                    <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                                            <Briefcase size={18} className="text-amber-600" />
                                                        </div>
                                                        Experience
                                                    </h4>
                                                    <div className="space-y-6">
                                                        {result.experience?.map((exp, i) => (
                                                            <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                                                                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-2 border-amber-400 rounded-full"></div>
                                                                <h5 className="font-black text-slate-800 text-lg leading-tight">{exp.role}</h5>
                                                                <p className="text-slate-500 font-bold text-sm mb-2">{exp.company} • {exp.duration}</p>
                                                                <p className="text-slate-600 text-sm font-medium leading-relaxed">{exp.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>

                                                <section>
                                                    <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                            <Layout size={18} className="text-blue-600" />
                                                        </div>
                                                        Key Projects
                                                    </h4>
                                                    <div className="space-y-6">
                                                        {result.projects?.map((proj, i) => (
                                                            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
                                                                <h5 className="font-black text-slate-800 text-lg mb-1">{proj.title}</h5>
                                                                <p className="text-slate-600 text-sm font-medium mb-4 leading-relaxed">{proj.description}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {proj.technologies?.map((tech, j) => (
                                                                        <span key={j} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                                            {tech}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>

                                            {/* Footer CTA */}
                                            <div className="pt-10 border-t border-slate-100 text-center">
                                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Final Statement</p>
                                                <p className="text-slate-900 font-black text-2xl italic tracking-tight mb-8">
                                                    "{result.contactCallToAction}"
                                                </p>
                                                <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-slate-200">
                                                    Download Portfolio PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-[3rem] p-12 border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-8">
                                        <Sparkles className="text-slate-300" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-700 mb-3">Portfolio Preview</h3>
                                    <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto">
                                        Enter your details on the left to generate a stunning, AI-powered portfolio layout tailored to your career.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
