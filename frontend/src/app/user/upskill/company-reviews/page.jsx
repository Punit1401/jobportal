"use client";
import React, { useState, useEffect } from "react";
import { 
  Building2, Sparkles, TrendingUp, Users, MessageSquare, 
  Star, Loader2, Search, ArrowRight, ArrowLeft, MapPin, 
  Calendar, Globe, DollarSign, Award, Send, CheckCircle, Info 
} from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import { useSession } from "next-auth/react";

export default function CompanyReviews() {
    const { data: session } = useSession();
    
    // --- State Variables ---
    const [companies, setCompanies] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    
    const [companyName, setCompanyName] = useState("");
    const [searchedCompany, setSearchedCompany] = useState("");
    const [selectedCompanyObj, setSelectedCompanyObj] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // --- Reviews States ---
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewMetrics, setReviewMetrics] = useState({
        averageRating: "0.0",
        avgWorkCulture: "0.0",
        avgCareerGrowth: "0.0",
        avgSalary: "0.0"
    });
    
    const [reviewForm, setReviewForm] = useState({
        role: "",
        rating: 5,
        workCultureRating: 5,
        careerGrowthRating: 5,
        salaryRating: 5,
        comment: "",
        isAnonymous: true
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    // --- Fetch Registered Companies on Mount ---
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const res = await fetch("/api/recruiter/companies");
                const data = await res.json();
                if (data.success) {
                    setCompanies(data.companies || []);
                }
            } catch (err) {
                console.error("Failed to load registered companies", err);
            } finally {
                setCompaniesLoading(false);
            }
        };
        loadCompanies();
    }, []);

    // --- Fetch Reviews & Ratings from DB ---
    const fetchReviews = async (targetId) => {
        setReviewsLoading(true);
        try {
            const res = await fetch(`/api/reviews?targetId=${encodeURIComponent(targetId)}&reviewType=company`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
                setReviewMetrics({
                    averageRating: data.averageRating || "0.0",
                    avgWorkCulture: data.avgWorkCulture || "0.0",
                    avgCareerGrowth: data.avgCareerGrowth || "0.0",
                    avgSalary: data.avgSalary || "0.0"
                });
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    // --- Fetch AI Insights & Reviews for Selected Company ---
    const selectCompany = async (compName, compObj = null) => {
        setLoading(true);
        setInsights(null);
        setSearchedCompany(compName);
        setSelectedCompanyObj(compObj);
        
        // Use ID if registered recruiter, otherwise fallback to name string
        const targetId = compObj?._id || compName;
        
        try {
            // 1. Fetch AI insights
            const res = await fetch("/api/ai/company-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName: compName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setInsights(data.insights);
            } else {
                alert(data.error || "Could not fetch AI insights at this moment.");
            }
            
            // 2. Fetch DB reviews
            await fetchReviews(targetId);
        } catch (error) {
            alert("Could not fetch insights at this moment.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!companyName.trim()) return;
        
        // Check if entered name matches any registered company
        const matched = companies.find(
            c => c.companyName.toLowerCase().trim() === companyName.toLowerCase().trim()
        );
        if (matched) {
            selectCompany(matched.companyName, matched);
        } else {
            selectCompany(companyName, null);
        }
    };

    // --- Submit New Review ---
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!session) return alert("Please sign in to submit a review.");
        if (!reviewForm.role.trim() || !reviewForm.comment.trim()) {
            return alert("Please fill in your current/former job title and feedback details.");
        }

        setSubmittingReview(true);
        const targetId = selectedCompanyObj?._id || searchedCompany;

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetId,
                    reviewerId: session.user.id || session.user.email,
                    reviewerName: session.user.name || "Anonymous Candidate",
                    targetType: "recruiter",
                    reviewType: "company",
                    rating: reviewForm.rating,
                    workCultureRating: reviewForm.workCultureRating,
                    careerGrowthRating: reviewForm.careerGrowthRating,
                    salaryRating: reviewForm.salaryRating,
                    comment: reviewForm.comment,
                    role: reviewForm.role,
                    isAnonymous: reviewForm.isAnonymous
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("Review submitted successfully!");
                setReviewForm({
                    role: "",
                    rating: 5,
                    workCultureRating: 5,
                    careerGrowthRating: 5,
                    salaryRating: 5,
                    comment: "",
                    isAnonymous: true
                });
                fetchReviews(targetId);
            } else {
                alert(data.error || "Failed to submit review.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // --- Helper components ---
    const StarRating = ({ value, onChange = null }) => {
        const stars = [1, 2, 3, 4, 5];
        return (
            <div className="flex gap-1">
                {stars.map((s) => (
                    <Star 
                        key={s} 
                        size={18} 
                        onClick={onChange ? () => onChange(s) : null}
                        className={`transition-all ${onChange ? 'cursor-pointer hover:scale-110' : ''} ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                    />
                ))}
            </div>
        );
    };

    const ProgressBar = ({ label, score }) => {
        const percentage = (parseFloat(score) / 5) * 100;
        return (
            <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{label}</span>
                    <span>{score} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-5xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4 animate-in fade-in duration-300">
                                <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                                <span className="text-xs font-black text-indigo-700 tracking-wider uppercase">Anonymous Reviews & Ratings</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Company Reviews & Ratings
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg leading-relaxed">
                                Research work culture, salaries, and employee feedback for our registered companies. Post your anonymous Glassdoor-style reviews.
                            </p>
                        </div>
                        {insights && (
                            <button 
                                onClick={() => {
                                    setInsights(null);
                                    setSearchedCompany("");
                                    setSelectedCompanyObj(null);
                                    setReviews([]);
                                }}
                                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm shadow-sm"
                            >
                                <ArrowLeft size={16} /> Back to List
                            </button>
                        )}
                    </div>

                    {/* Main UI Search and Listings */}
                    {!insights && !loading && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            {/* Search Bar */}
                            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                                    <Search className="absolute left-6 text-slate-400" size={24} />
                                    <input 
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Enter a company name (e.g. Google, TCS, Microsoft) or search below..."
                                        className="w-full pl-16 pr-36 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-lg font-bold text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !companyName.trim()}
                                        className="absolute right-3 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Analyze <ArrowRight size={18} />
                                    </button>
                                </form>
                            </div>

                            {/* Registered Companies Grid */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Registered Companies</h2>
                                {companiesLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <Loader2 className="animate-spin text-indigo-600" size={36} />
                                    </div>
                                ) : companies.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {companies.map((c) => (
                                            <div 
                                                key={c._id}
                                                onClick={() => selectCompany(c.companyName, c)}
                                                className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-md hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                            {c.logo ? (
                                                                <img src={c.logo} alt={c.companyName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Building2 className="text-slate-400" size={24} />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-black text-slate-800 text-lg truncate group-hover:text-indigo-600 transition-colors">{c.companyName}</h3>
                                                            <p className="text-slate-400 font-bold text-xs truncate">{c.industry || "Industry unspecified"}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 font-medium text-sm line-clamp-2 italic leading-relaxed">
                                                        "{c.tagline || c.description || "Review this company's culture and benefits."}"
                                                    </p>
                                                </div>
                                                <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center text-xs font-black text-slate-400">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {c.city || c.location || "On-site"}</span>
                                                    <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">VIEW INFO <ArrowRight size={12} /></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                                        <Building2 className="mx-auto text-slate-300 mb-3" size={40} />
                                        <p className="text-slate-500 font-bold">No registered recruiters found yet. Use the search bar above to fetch insights on any company!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl animate-in fade-in duration-300">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-lg border border-slate-100 mb-6">
                                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Analyzing {searchedCompany}...</h3>
                            <p className="text-slate-500 font-medium mt-2 text-center max-w-sm">
                                Gathering culture, compensation, ratings, and employee reports...
                            </p>
                        </div>
                    )}

                    {/* Selected Company Details View */}
                    {insights && !loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            
                            {/* Left Column: AI & Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                                    
                                    {/* Brand Header */}
                                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                                                {selectedCompanyObj?.logo ? (
                                                    <img src={selectedCompanyObj.logo} alt={searchedCompany} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 size={32} className="text-indigo-300" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black tracking-tight text-3xl capitalize">{searchedCompany}</h3>
                                                <p className="text-indigo-200/80 text-sm font-medium mt-1">
                                                    {selectedCompanyObj?.industry || "Corporate Profile"} 
                                                    {selectedCompanyObj?.city && ` • ${selectedCompanyObj.city}`}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Average Star Metrics */}
                                        <div className="bg-white/15 px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shrink-0">
                                            <div className="text-center">
                                                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-black mb-1">Average Score</p>
                                                <div className="flex items-center gap-2 justify-center">
                                                    <Star size={18} className="text-amber-400 fill-amber-400" />
                                                    <span className="font-black text-2xl">
                                                        {reviews.length > 0 ? reviewMetrics.averageRating : (insights.employeeRating || "4.0")}/5
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Information Attributes */}
                                    {selectedCompanyObj && (
                                        <div className="p-8 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Website</p>
                                                <a href={selectedCompanyObj.website} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-sm hover:underline truncate block">
                                                    {selectedCompanyObj.website || "Not Available"}
                                                </a>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Founded</p>
                                                <p className="text-slate-800 font-bold text-sm">{selectedCompanyObj.founded || "Not Available"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Company Size</p>
                                                <p className="text-slate-800 font-bold text-sm">{selectedCompanyObj.companySize || "Not Available"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Location</p>
                                                <p className="text-slate-800 font-bold text-sm truncate" title={selectedCompanyObj.address}>
                                                    {selectedCompanyObj.address || `${selectedCompanyObj.city || ""}, ${selectedCompanyObj.state || ""}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Insights Sections */}
                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Culture */}
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <Users size={60} />
                                                </div>
                                                <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-xs tracking-widest mb-4">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <Users size={16} className="text-indigo-600" />
                                                    </div>
                                                    Work Culture
                                                </h4>
                                                <p className="text-slate-600 text-sm leading-relaxed font-medium relative z-10">
                                                    {insights.companyCulture || "No culture insights available."}
                                                </p>
                                            </div>

                                            {/* Interview Focus */}
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <MessageSquare size={60} />
                                                </div>
                                                <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-xs tracking-widest mb-4">
                                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <MessageSquare size={16} className="text-emerald-600" />
                                                    </div>
                                                    Interview Focus
                                                </h4>
                                                <p className="text-slate-600 text-sm leading-relaxed font-medium relative z-10">
                                                    {insights.commonInterviewTopics || "No interview insights available."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Market Growth */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-3xl border border-indigo-100/50 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
                                            <div className="absolute -right-6 -bottom-6 text-indigo-200/30">
                                                <TrendingUp size={120} />
                                            </div>
                                            <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center shrink-0 relative z-10">
                                                <TrendingUp className="text-indigo-600" size={22} />
                                            </div>
                                            <div className="relative z-10">
                                                <h4 className="font-black text-indigo-950 text-sm uppercase tracking-widest mb-2">Market Reputation & Growth</h4>
                                                <p className="text-indigo-800/80 text-sm font-medium leading-relaxed">
                                                    {insights.marketPosition || "No market data available."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employee Reviews Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={20} className="text-indigo-600" /> Real Employee Reviews ({reviews.length})
                                    </h3>
                                    {reviewsLoading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="animate-spin text-indigo-600" size={24} />
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((r) => (
                                                <div key={r._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md space-y-4 animate-in fade-in duration-300">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-black text-slate-800 text-base">{r.role || "Employee"}</h4>
                                                            <p className="text-slate-400 font-bold text-xs">
                                                                {r.isAnonymous ? "Anonymous Feedback" : r.reviewerName} • {new Date(r.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <StarRating value={r.rating} />
                                                    </div>
                                                    
                                                    {/* Sub-ratings badges */}
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                                                            Culture: {r.workCultureRating || r.rating}/5
                                                        </span>
                                                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                                                            Growth: {r.careerGrowthRating || r.rating}/5
                                                        </span>
                                                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md">
                                                            Salary: {r.salaryRating || r.rating}/5
                                                        </span>
                                                    </div>

                                                    <p className="text-slate-600 font-medium text-sm leading-relaxed border-t border-slate-50 pt-3">
                                                        "{r.comment}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <MessageSquare className="mx-auto text-slate-300 mb-2" size={32} />
                                            <p className="text-slate-500 font-bold text-sm">No employee reviews submitted yet. Be the first to share your experience below!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Rating metrics & Submission form */}
                            <div className="space-y-6">
                                {/* Glassdoor Progress Bars */}
                                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl space-y-6">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-slate-50 pb-3 flex items-center gap-2">
                                        <Award size={16} className="text-indigo-600" /> Glassdoor-style Metrics
                                    </h4>
                                    <div className="space-y-4">
                                        <ProgressBar label="Work Culture" score={reviews.length > 0 ? reviewMetrics.avgWorkCulture : "4.0"} />
                                        <ProgressBar label="Career Growth" score={reviews.length > 0 ? reviewMetrics.avgCareerGrowth : "4.2"} />
                                        <ProgressBar label="Salary & Comp" score={reviews.length > 0 ? reviewMetrics.avgSalary : "3.8"} />
                                    </div>
                                </div>

                                {/* Review form */}
                                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl space-y-4">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-slate-50 pb-3 flex items-center gap-2">
                                        <Send size={16} className="text-indigo-600" /> Write a Review
                                    </h4>
                                    {session ? (
                                        <form onSubmit={handleSubmitReview} className="space-y-4">
                                            {/* Role */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-slate-600">Your Job Title / Role</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={reviewForm.role}
                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, role: e.target.value }))}
                                                    placeholder="Ex: Senior Developer, HR Intern"
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
                                                />
                                            </div>

                                            {/* Overall Rating */}
                                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600">Overall Rating</span>
                                                <StarRating 
                                                    value={reviewForm.rating} 
                                                    onChange={(val) => setReviewForm(prev => ({ ...prev, rating: val }))}
                                                />
                                            </div>

                                            {/* Culture Rating */}
                                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600">Work Culture</span>
                                                <StarRating 
                                                    value={reviewForm.workCultureRating} 
                                                    onChange={(val) => setReviewForm(prev => ({ ...prev, workCultureRating: val }))}
                                                />
                                            </div>

                                            {/* Growth Rating */}
                                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600">Career Growth</span>
                                                <StarRating 
                                                    value={reviewForm.careerGrowthRating} 
                                                    onChange={(val) => setReviewForm(prev => ({ ...prev, careerGrowthRating: val }))}
                                                />
                                            </div>

                                            {/* Salary Rating */}
                                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600">Salary & Comp</span>
                                                <StarRating 
                                                    value={reviewForm.salaryRating} 
                                                    onChange={(val) => setReviewForm(prev => ({ ...prev, salaryRating: val }))}
                                                />
                                            </div>

                                            {/* Comment */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-slate-600">Review Feedback</label>
                                                <textarea 
                                                    required
                                                    rows="3"
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                                    placeholder="Share work experience, pros/cons, or culture feedback..."
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 resize-none"
                                                />
                                            </div>

                                            {/* Anonymous checkbox */}
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox"
                                                    checked={reviewForm.isAnonymous}
                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-600">Submit anonymously</span>
                                            </label>

                                            {/* Submit button */}
                                            <button 
                                                type="submit"
                                                disabled={submittingReview}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50"
                                            >
                                                {submittingReview ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Post Review"}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl text-center space-y-2">
                                            <Info size={20} className="mx-auto text-slate-400" />
                                            <p className="text-xs font-bold text-slate-500">Sign in to write an employee review.</p>
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
