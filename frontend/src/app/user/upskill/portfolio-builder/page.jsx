"use client";
import React, { useState } from "react";
import { Briefcase, Sparkles, User, Code, Layout, Send, Loader2, ArrowRight, Download, Plus, Trash2 } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import FeatureGuard from "@/components/FeatureGuard";

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
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isEditingGenerated, setIsEditingGenerated] = useState(false);

    const fetchProfileData = async () => {
        setFetchingProfile(true);
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                
                // Construct experience summary
                let expSummary = "";
                if (data.workExperiences && data.workExperiences.length > 0) {
                    expSummary = data.workExperiences.map(w => 
                        `${w.designation || w.position || "Role"} at ${w.currentCompanyName || "Company"}${w.jobFromDate ? ` (${w.jobFromDate} - ${w.presentEmploymentStatus === "yes" || !w.jobToDate ? "Present" : w.jobToDate})` : ""}${w.jobDescription ? `: ${w.jobDescription}` : ""}`.trim()
                    ).join("\n\n");
                } else if (data.currentCompanyName || data.jobDescription || data.position || data.profession) {
                    const roleTitle = data.position || data.profession || "Role";
                    expSummary = data.currentCompanyName ? `${roleTitle} at ${data.currentCompanyName}` : roleTitle;
                    if (data.jobDescription) expSummary += `: ${data.jobDescription}`;
                }

                // Construct projects summary
                let projSummary = data.projectsDetails || "";
                if (data.internshipDetails) {
                    projSummary += projSummary ? `\n\nInternship: ${data.internshipDetails}` : `Internship: ${data.internshipDetails}`;
                }
                if (data.apprenticeDetails) {
                    projSummary += projSummary ? `\n\nApprenticeship: ${data.apprenticeDetails}` : `Apprenticeship: ${data.apprenticeDetails}`;
                }

                // Extract skills
                let skillsStr = "";
                if (Array.isArray(data.skills)) {
                    skillsStr = data.skills.join(", ");
                } else if (typeof data.skills === "string") {
                    skillsStr = data.skills;
                }

                setUserData(prev => ({
                    name: data.fullName || prev.name,
                    role: data.position || data.profession || data.jobDepartment || prev.role,
                    bio: data.jobDescription || prev.bio,
                    skills: skillsStr || prev.skills,
                    experience: expSummary || prev.experience,
                    projects: projSummary || prev.projects
                }));
            }
        } catch (err) {
            console.error("Error fetching candidate profile for portfolio builder:", err);
        } finally {
            setFetchingProfile(false);
        }
    };

    React.useEffect(() => {
        fetchProfileData();
    }, []);

    const handleDownloadPDF = () => {
        const printContent = document.getElementById("portfolio-preview-card").innerHTML;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>My Portfolio - ${userData.name || "Career"}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body { 
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            padding: 3rem; 
                            background: #fff; 
                        }
                        /* Hide buttons in print */
                        .no-print { display: none !important; }
                        button { display: none !important; }
                    </style>
                </head>
                <body>
                    <div class="max-w-4xl mx-auto">${printContent}</div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

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
                <FeatureGuard featureName="My Website & Portfolio">
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
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-black text-slate-900">Personal Details</h3>
                                        <button
                                            type="button"
                                            onClick={fetchProfileData}
                                            disabled={fetchingProfile}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            {fetchingProfile ? <Loader2 size={12} className="animate-spin" /> : <User size={12} />}
                                            {fetchingProfile ? "Loading..." : "Auto-fill from Profile"}
                                        </button>
                                    </div>
                                    
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
                                    {/* Direct Edit Mode Action Bar */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50 border border-indigo-100 rounded-2xl p-4 gap-4 no-print">
                                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest text-center sm:text-left">
                                            {isEditingGenerated 
                                                ? "📝 Direct Edit Mode Active - Click on any text inside the preview below to edit it!" 
                                                : "✨ Portfolio Generated! You can edit any text directly."}
                                        </p>
                                        <button 
                                            onClick={() => setIsEditingGenerated(!isEditingGenerated)}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                                                isEditingGenerated 
                                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            }`}
                                        >
                                            {isEditingGenerated ? "Save Changes" : "Edit Portfolio"}
                                        </button>
                                    </div>

                                    {/* Preview Card */}
                                    <div id="portfolio-preview-card" className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden">
                                        
                                        {/* Hero Section */}
                                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                            <div className="relative z-10 space-y-4">
                                                <h2 
                                                    contentEditable={isEditingGenerated}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.target.innerText;
                                                        setUserData(prev => ({ ...prev, name: val }));
                                                    }}
                                                    className={`text-4xl font-black mb-2 outline-none rounded px-1 ${isEditingGenerated ? "bg-white/10 focus:ring-2 focus:ring-white" : ""}`}
                                                >
                                                    {userData.name}
                                                </h2>
                                                <p 
                                                    contentEditable={isEditingGenerated}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.target.innerText;
                                                        setResult(prev => ({
                                                            ...prev,
                                                            hero: { ...prev.hero, tagline: val }
                                                        }));
                                                    }}
                                                    className={`font-bold text-xl mb-6 outline-none rounded px-1 ${isEditingGenerated ? "bg-white/10 focus:ring-2 focus:ring-white" : "text-indigo-100"}`}
                                                >
                                                    {result.hero?.tagline || userData.role}
                                                </p>
                                                <p 
                                                    contentEditable={isEditingGenerated}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.target.innerText;
                                                        setResult(prev => ({
                                                            ...prev,
                                                            hero: { ...prev.hero, intro: val }
                                                        }));
                                                    }}
                                                    className={`text-lg leading-relaxed max-w-2xl font-medium outline-none rounded px-1 ${isEditingGenerated ? "bg-white/10 focus:ring-2 focus:ring-white" : "text-indigo-50/90"}`}
                                                >
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
                                                <p 
                                                    contentEditable={isEditingGenerated}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.target.innerText;
                                                        setResult(prev => ({ ...prev, aboutMe: val }));
                                                    }}
                                                    className={`text-slate-600 text-lg leading-relaxed font-medium outline-none rounded p-1 ${isEditingGenerated ? "bg-slate-50 border border-dashed border-indigo-200 focus:ring-2 focus:ring-indigo-500" : ""}`}
                                                >
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
                                                            <p 
                                                                contentEditable={isEditingGenerated}
                                                                suppressContentEditableWarning
                                                                onBlur={(e) => {
                                                                    const val = e.target.innerText;
                                                                    const updated = [...result.skills];
                                                                    updated[i].category = val;
                                                                    setResult(prev => ({ ...prev, skills: updated }));
                                                                }}
                                                                className={`font-black text-xs text-slate-400 uppercase tracking-widest mb-3 outline-none rounded ${isEditingGenerated ? "bg-white border border-dashed border-indigo-200" : ""}`}
                                                            >
                                                                {skillGroup.category}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {skillGroup.items?.map((skill, j) => (
                                                                    <span 
                                                                        key={j} 
                                                                        contentEditable={isEditingGenerated}
                                                                        suppressContentEditableWarning
                                                                        onBlur={(e) => {
                                                                            const val = e.target.innerText;
                                                                            const updated = [...result.skills];
                                                                            updated[i].items[j] = val;
                                                                            setResult(prev => ({ ...prev, skills: updated }));
                                                                        }}
                                                                        className={`px-3 py-1 bg-white border border-slate-100 rounded-lg text-sm font-bold text-slate-700 shadow-sm outline-none ${isEditingGenerated ? "border-indigo-300 ring-1 ring-indigo-200" : ""}`}
                                                                    >
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
                                                            <div key={i} className="relative pl-6 border-l-2 border-slate-100 space-y-1">
                                                                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-2 border-amber-400 rounded-full"></div>
                                                                <h5 
                                                                    contentEditable={isEditingGenerated}
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => {
                                                                        const val = e.target.innerText;
                                                                        const updated = [...result.experience];
                                                                        updated[i].role = val;
                                                                        setResult(prev => ({ ...prev, experience: updated }));
                                                                    }}
                                                                    className={`font-black text-slate-800 text-lg leading-tight outline-none rounded ${isEditingGenerated ? "bg-slate-50 border border-dashed border-indigo-200" : ""}`}
                                                                >
                                                                    {exp.role}
                                                                </h5>
                                                                <p 
                                                                    contentEditable={isEditingGenerated}
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => {
                                                                        const val = e.target.innerText;
                                                                        const parts = val.split("•").map(p => p.trim());
                                                                        const updated = [...result.experience];
                                                                        updated[i].company = parts[0] || "";
                                                                        updated[i].duration = parts[1] || "";
                                                                        setResult(prev => ({ ...prev, experience: updated }));
                                                                    }}
                                                                    className={`text-slate-500 font-bold text-sm mb-2 outline-none rounded ${isEditingGenerated ? "bg-slate-50 border border-dashed border-indigo-200" : ""}`}
                                                                >
                                                                    {exp.company} • {exp.duration}
                                                                </p>
                                                                <p 
                                                                    contentEditable={isEditingGenerated}
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => {
                                                                        const val = e.target.innerText;
                                                                        const updated = [...result.experience];
                                                                        updated[i].description = val;
                                                                        setResult(prev => ({ ...prev, experience: updated }));
                                                                    }}
                                                                    className={`text-slate-600 text-sm font-medium leading-relaxed outline-none rounded ${isEditingGenerated ? "bg-slate-50 border border-dashed border-indigo-200" : ""}`}
                                                                >
                                                                    {exp.description}
                                                                </p>
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
                                                            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 border-dashed space-y-2">
                                                                <h5 
                                                                    contentEditable={isEditingGenerated}
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => {
                                                                        const val = e.target.innerText;
                                                                        const updated = [...result.projects];
                                                                        updated[i].title = val;
                                                                        setResult(prev => ({ ...prev, projects: updated }));
                                                                    }}
                                                                    className={`font-black text-slate-800 text-lg mb-1 outline-none rounded ${isEditingGenerated ? "bg-white border border-dashed border-indigo-200" : ""}`}
                                                                >
                                                                    {proj.title}
                                                                </h5>
                                                                <p 
                                                                    contentEditable={isEditingGenerated}
                                                                    suppressContentEditableWarning
                                                                    onBlur={(e) => {
                                                                        const val = e.target.innerText;
                                                                        const updated = [...result.projects];
                                                                        updated[i].description = val;
                                                                        setResult(prev => ({ ...prev, projects: updated }));
                                                                    }}
                                                                    className={`text-slate-600 text-sm font-medium mb-4 leading-relaxed outline-none rounded ${isEditingGenerated ? "bg-white border border-dashed border-indigo-200" : ""}`}
                                                                >
                                                                    {proj.description}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {proj.technologies?.map((tech, j) => (
                                                                        <span 
                                                                            key={j} 
                                                                            contentEditable={isEditingGenerated}
                                                                            suppressContentEditableWarning
                                                                            onBlur={(e) => {
                                                                                const val = e.target.innerText;
                                                                                const updated = [...result.projects];
                                                                                updated[i].technologies[j] = val;
                                                                                setResult(prev => ({ ...prev, projects: updated }));
                                                                            }}
                                                                            className={`text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 outline-none ${isEditingGenerated ? "border-indigo-300 ring-1 ring-indigo-100" : ""}`}
                                                                        >
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
                                            <div className="pt-10 border-t border-slate-100 text-center space-y-4">
                                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Final Statement</p>
                                                <p 
                                                    contentEditable={isEditingGenerated}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.target.innerText;
                                                        setResult(prev => ({ ...prev, contactCallToAction: val }));
                                                    }}
                                                    className={`text-slate-900 font-black text-2xl italic tracking-tight mb-8 outline-none rounded p-1 ${isEditingGenerated ? "bg-slate-50 border border-dashed border-indigo-200 focus:ring-2 focus:ring-indigo-500" : ""}`}
                                                >
                                                    "{result.contactCallToAction}"
                                                </p>
                                                <button 
                                                    onClick={handleDownloadPDF}
                                                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 no-print"
                                                >
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
            </FeatureGuard>
        </main>
    </div>
  );
}
