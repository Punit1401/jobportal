"use client";
import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, Loader2, ArrowRight, Building, FileText, Mail, DollarSign, Info } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import FeatureGuard from "@/components/FeatureGuard";

export default function FakeJobCheckPage() {
    const [jobData, setJobData] = useState({
        title: "",
        company: "",
        email: "",
        description: "",
        salary: ""
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobData((prev) => ({ ...prev, [name]: value }));
    };

    const analyzeJob = async (e) => {
        if (e) e.preventDefault();
        
        // Basic validation
        if (!jobData.title || !jobData.description) {
            return alert("Please provide at least a Job Title and Description.");
        }
        
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch("/api/ai/fake-job-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobData }),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult(data);
            } else {
                alert(data.error || "Could not analyze the job at this moment.");
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
                <FeatureGuard featureName="Interview Preparation">
                    <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-5xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 mb-4">
                                <ShieldAlert size={14} className="text-rose-600" />
                                <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">AI Scam Detector</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Fake Job Checker
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Not sure if a job offer is legitimate? Paste the details below and our AI will analyze it for common red flags, scams, and deceptive patterns.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <form onSubmit={analyzeJob} className="space-y-5">
                                    <h3 className="text-xl font-black text-slate-900 mb-4">Job Details</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Job Title *</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    name="title"
                                                    value={jobData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Data Entry Clerk"
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company Name</label>
                                            <div className="relative">
                                                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    name="company"
                                                    value={jobData.company}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Tech Solutions Inc."
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    name="email"
                                                    value={jobData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. hr@company.com"
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Offered Salary</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    name="salary"
                                                    value={jobData.salary}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. $100,000/yr"
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Job Description *</label>
                                        <textarea
                                            name="description"
                                            value={jobData.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            placeholder="Paste the full job description here. Include any requirements, daily duties, and communication you've had..."
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none resize-y"
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !jobData.title || !jobData.description}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Analyzing Details...</>
                                        ) : (
                                            <><Search size={18} /> Check For Scams</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="lg:col-span-2">
                            {loading ? (
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                        <div className="relative bg-white p-5 rounded-full shadow-lg border border-slate-100">
                                            <Loader2 className="animate-spin text-rose-500" size={40} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">Scanning for Red Flags</h3>
                                    <p className="text-slate-500 font-medium mt-2 text-sm">
                                        Our AI is comparing the details against thousands of known scam patterns...
                                    </p>
                                </div>
                            ) : result ? (
                                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className={`p-8 text-white ${result.isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                                {result.isSafe ? <ShieldCheck size={36} /> : <AlertTriangle size={36} />}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Risk Score</p>
                                                <p className="text-4xl font-black">{result.riskScore}<span className="text-lg opacity-70">/100</span></p>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight mb-2">
                                            {result.isSafe ? "Looks Legitimate" : "High Risk Scam"}
                                        </h3>
                                        <p className="text-white/90 font-medium leading-relaxed text-sm">
                                            {result.verdict}
                                        </p>
                                    </div>

                                    <div className="p-6 flex-1 bg-slate-50 space-y-6 overflow-y-auto max-h-[500px]">
                                        {result.explanation && (
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2 text-indigo-600">
                                                    <Info size={14} /> AI Detailed Analysis & Explanation
                                                </h4>
                                                <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-line">
                                                    {result.explanation}
                                                </p>
                                            </div>
                                        )}

                                        {result.redFlags && result.redFlags.length > 0 ? (
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2 text-slate-500">
                                                    <AlertTriangle size={14} className="text-rose-500" /> Detected Red Flags
                                                </h4>
                                                <ul className="space-y-3">
                                                    {result.redFlags.map((flag, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                            <div className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-rose-500" />
                                                            <span className="text-sm font-medium text-slate-700 leading-snug">{flag}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <ShieldCheck className="text-emerald-500" size={28} />
                                                </div>
                                                <h4 className="font-bold text-slate-800">No Red Flags Found</h4>
                                                <p className="text-slate-500 text-sm mt-1">The job description appears to be standard and legitimate.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 h-full flex flex-col items-center justify-center text-center border-dashed border-2">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                        <ShieldAlert className="text-slate-300" size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Ready to Scan</h3>
                                    <p className="text-slate-500 font-medium text-sm">
                                        Fill in the job details on the left and click 'Check For Scams' to get an instant AI risk analysis.
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
