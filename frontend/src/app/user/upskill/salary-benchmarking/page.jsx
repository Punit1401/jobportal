"use client";
import React, { useState } from "react";
import { DollarSign, Sparkles, MapPin, Briefcase, TrendingUp, Loader2, ArrowRight, Building, Award, Info } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';

export default function SalaryBenchmarkingPage() {
    const [formData, setFormData] = useState({
        role: "",
        location: "",
        experience: "",
        industry: ""
    });
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getSalaryBenchmark = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.role || !formData.location) {
            return alert("Please provide both role and location.");
        }
        
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch("/api/ai/salary-benchmarking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult(data);
            } else {
                alert(data.error || "Could not fetch salary data.");
            }
        } catch (error) {
            alert("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: result?.currency || 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
                                <DollarSign size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">AI Salary Insights</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Salary Benchmarking
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Discover your market value. Get AI-powered salary data tailored to your role, location, and experience level.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                        {/* Form Section */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <form onSubmit={getSalaryBenchmark} className="space-y-5">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Market Parameters</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Job Role *</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Frontend Developer"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Location *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. San Francisco, CA or Mumbai, India"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Years of Exp</label>
                                                <input 
                                                    type="number"
                                                    name="experience"
                                                    value={formData.experience}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. 5"
                                                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Industry</label>
                                                <input 
                                                    type="text"
                                                    name="industry"
                                                    value={formData.industry}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. FinTech"
                                                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !formData.role || !formData.location}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Analyzing Market Data...</>
                                        ) : (
                                            <><TrendingUp size={18} /> Analyze Market Value</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Result Section */}
                        <div className="xl:col-span-3">
                            {loading ? (
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                        <div className="relative bg-white p-6 rounded-full shadow-lg border border-slate-100">
                                            <Loader2 className="animate-spin text-emerald-600" size={48} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">Calculating Benchmarks</h3>
                                    <p className="text-slate-500 font-medium mt-3 max-w-sm">
                                        Comparing your profile against thousands of real-world salary data points...
                                    </p>
                                </div>
                            ) : result ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                                    
                                    {/* Main Range Card */}
                                    <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-1">Estimated Range</h4>
                                                <p className="text-4xl font-black text-slate-900">{formatCurrency(result.range.median)} <span className="text-lg text-slate-400 font-medium">median / year</span></p>
                                            </div>
                                            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Market Sentiment</p>
                                                <p className="text-xl font-black text-emerald-700">{result.marketSentiment}</p>
                                            </div>
                                        </div>

                                        {/* Range Visualizer */}
                                        <div className="relative pt-12 pb-8">
                                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-emerald-200" style={{ width: '25%' }}></div>
                                                <div className="h-full bg-emerald-500" style={{ width: '50%' }}></div>
                                                <div className="h-full bg-emerald-700" style={{ width: '25%' }}></div>
                                            </div>
                                            <div className="flex justify-between mt-4">
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Low End</p>
                                                    <p className="text-sm font-bold text-slate-700">{formatCurrency(result.range.low)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-emerald-600 uppercase mb-1">Median</p>
                                                    <p className="text-lg font-black text-emerald-700">{formatCurrency(result.range.median)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Top End</p>
                                                    <p className="text-sm font-bold text-slate-700">{formatCurrency(result.range.high)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Companies & Skills */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                            <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                    <Building size={18} className="text-blue-600" />
                                                </div>
                                                Top Paying Firms
                                            </h4>
                                            <div className="space-y-3">
                                                {result.topPayingCompanies?.map((company, i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-700 flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        {company}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                            <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                                    <Award size={18} className="text-amber-600" />
                                                </div>
                                                High-Income Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.requiredSkillsForTopPay?.map((skill, i) => (
                                                    <span key={i} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insights Section */}
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute bottom-0 right-0 p-6 opacity-10">
                                            <TrendingUp size={120} />
                                        </div>
                                        <div className="relative z-10 space-y-8">
                                            <div>
                                                <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-4 text-emerald-400">
                                                    <MapPin size={16} /> Location Impact
                                                </h4>
                                                <p className="text-slate-300 font-medium leading-relaxed italic">
                                                    "{result.locationFactor}"
                                                </p>
                                            </div>
                                            <div className="pt-8 border-t border-white/10">
                                                <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-4 text-emerald-400">
                                                    <TrendingUp size={16} /> Future Growth Projection
                                                </h4>
                                                <p className="text-slate-200 font-bold text-lg leading-relaxed">
                                                    {result.growthProjection}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-[3rem] p-12 border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-8">
                                        <DollarSign className="text-slate-300" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-700 mb-3">Market Value Preview</h3>
                                    <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto">
                                        Enter your career details on the left to see detailed salary ranges, market trends, and top paying skills in your area.
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
