"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, CheckCircle, Briefcase, Users, X, Save, Clock, Ticket, Check,
  Megaphone, Loader2, Edit3, HardDrive, Calendar, Tag, Percent
} from "lucide-react";
import * as XLSX from "xlsx";

export default function UnifiedPlanAndCouponManagement() {
    const [currentSection, setCurrentSection] = useState("subscriptions"); // "subscriptions" | "advertisements" | "storage" | "coupons"
    const [loading, setLoading] = useState(true);

    // ==========================================
    // 1. SUBSCRIPTION PLANS STATES
    // ==========================================
    const [activeTab, setActiveTab] = useState("Recruiter");
    const [plans, setPlans] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const initialPlanFormState = {
        title: "",
        planCategory: "Basic",
        userType: "Recruiter",
        price: 0,
        duration: 30,
        durationType: "Days",
        features: [],
        limits: { jobLimit: 0, leadLimit: 0, useLimit: 0 },
        storageLimit: 0,
        isPopular: false,
        isActive: true
    };
    const [planForm, setPlanForm] = useState(initialPlanFormState);

    // ==========================================
    // 2. ADVERTISEMENT PLANS STATES
    // ==========================================
    const [adActiveTab, setAdActiveTab] = useState("Recruiter");
    const [adPlans, setAdPlans] = useState([]);
    const [adPurchases, setAdPurchases] = useState([]);
    const [adStats, setAdStats] = useState({});
    const [adModalOpen, setAdModalOpen] = useState(false);
    const [editingAdId, setEditingAdId] = useState(null);
    const [adView, setAdView] = useState("plans"); // "plans" | "purchases"

    const initialAdFormState = {
        title: "",
        description: "",
        price: "",
        duration: "7",
        durationType: "Days",
        userType: "Recruiter",
        features: "",
        estimatedImpressions: "",
        estimatedClicks: "",
        isActive: true,
        isPopular: false,
        displayOrder: "0",
    };
    const [adForm, setAdForm] = useState(initialAdFormState);

    // ==========================================
    // 3. STORAGE PLANS STATES
    // ==========================================
    const [storagePlans, setStoragePlans] = useState([]);
    const [storageModalOpen, setStorageModalOpen] = useState(false);
    const [editingStorageId, setEditingStorageId] = useState(null);
    
    const initialStorageFormState = {
        title: "",
        addedSpaceMB: "",
        price: "",
        isActive: true
    };
    const [storageForm, setStorageForm] = useState(initialStorageFormState);

    // ==========================================
    // 4. COUPON MANAGEMENT STATES
    // ==========================================
    const [coupons, setCoupons] = useState([]);
    const [couponModalOpen, setCouponModalOpen] = useState(false);
    const [editingCouponId, setEditingCouponId] = useState(null);

    const initialCouponFormState = {
        code: "",
        discountType: "Percentage",
        description: "",
        discountValue: "",
        maxRedemptions: "",
        expiryDate: "",
        isActive: true
    };
    const [couponForm, setCouponForm] = useState(initialCouponFormState);


    // ==========================================
    // DATA FETCHING TRIGGERS
    // ==========================================
    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/admin/plans");
            const data = await res.json();
            if (data.success) setPlans(data.plans || []);
        } catch (err) {
            console.error("Failed to load subscription plans.");
        }
    };

    const fetchAdPlans = async () => {
        try {
            const res = await fetch("/api/admin/ad-plans");
            const data = await res.json();
            if (data.success) {
                setAdPlans(data.plans || []);
                setAdPurchases(data.purchases || []);
                setAdStats(data.stats || {});
            }
        } catch (err) {
            console.error("Failed to load ad plans.");
        }
    };

    const fetchStoragePlans = async () => {
        try {
            const res = await fetch("/api/admin/storage/plans");
            const data = await res.json();
            if (data.success) setStoragePlans(data.plans || []);
        } catch (err) {
            console.error("Failed to load storage plans.");
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            if (data.success) setCoupons(data.coupons || []);
        } catch (err) {
            console.error("Failed to load coupons.");
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchPlans(),
            fetchAdPlans(),
            fetchStoragePlans(),
            fetchCoupons()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);


    // ==========================================
    // 1. SUBSCRIPTIONS HANDLERS
    // ==========================================
    const RECRUITER_FEATURES = [
        "Job Placements",
        "Responses",
        "Events & Activities",
        "Auto-Mailer System",
        "Mailing List",
        "Contact Management",
        "AI Features"
    ];
    const PROVIDER_FEATURES = [
        "Contact Management",
        "Events & Activities",
        "AI Features",
        "Auto-Mailer System",
        "Mailing List"
    ];
    const CANDIDATE_FEATURES = [
        "Events & Activities",
        "AI Features",
        "Learning Features",
        "Interview Preparation",
        "My Website & Portfolio",
        "Government Portal Access",
        "AI Job Feed",
        "AI Headshot"
    ];

    const AVAILABLE_FEATURES = 
        planForm.userType === "Candidate" 
            ? CANDIDATE_FEATURES 
            : (planForm.userType === "ServiceProvider" ? PROVIDER_FEATURES : RECRUITER_FEATURES);

    const handleFeatureToggle = (feat) => {
        setPlanForm(prev => {
            const current = prev.features || [];
            if (current.includes(feat)) return { ...prev, features: current.filter(f => f !== feat) };
            return { ...prev, features: [...current, feat] };
        });
    };

    const openPlanModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan._id);
            setPlanForm({
                ...plan,
                features: Array.isArray(plan.features) ? [...plan.features] : [],
                limits: plan.limits || { jobLimit: 0, leadLimit: 0, useLimit: 0 },
                planCategory: plan.planCategory || plan.planType || "Basic",
                duration: plan.duration || 30,
                durationType: plan.durationType || "Days"
            });
        } else {
            setEditingPlan(null);
            setPlanForm({ ...initialPlanFormState, userType: activeTab });
        }
        setIsModalOpen(true);
    };

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        const method = editingPlan ? "PUT" : "POST";
        const res = await fetch("/api/admin/plans", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingPlan ? { ...planForm, id: editingPlan } : planForm),
        });

        const result = await res.json();
        if (result.success) {
            alert(editingPlan ? "Subscription Plan Updated!" : "Subscription Plan Created!");
            setIsModalOpen(false);
            fetchPlans();
        }
    };

    const deletePlan = async (id) => {
        if (confirm("Are you sure you want to delete this subscription plan?")) {
            const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchPlans();
        }
    };


    // ==========================================
    // 2. ADVERTISEMENTS HANDLERS
    // ==========================================
    const openAdModal = (plan = null) => {
        if (plan) {
            setEditingAdId(plan._id);
            setAdForm({
                title: plan.title,
                description: plan.description || "",
                price: String(plan.price),
                duration: String(plan.duration),
                durationType: plan.durationType || "Days",
                userType: plan.userType,
                features: (plan.features || []).join("\n"),
                estimatedImpressions: String(plan.estimatedImpressions || ""),
                estimatedClicks: String(plan.estimatedClicks || ""),
                isActive: plan.isActive !== false,
                isPopular: Boolean(plan.isPopular),
                displayOrder: String(plan.displayOrder || 0),
            });
        } else {
            setEditingAdId(null);
            setAdForm({ ...initialAdFormState, userType: adActiveTab });
        }
        setAdModalOpen(true);
    };

    const handleAdSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: adForm.title,
            description: adForm.description,
            price: Number(adForm.price),
            duration: Number(adForm.duration),
            durationType: adForm.durationType,
            userType: adForm.userType,
            features: adForm.features
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            estimatedImpressions: Number(adForm.estimatedImpressions) || 0,
            estimatedClicks: Number(adForm.estimatedClicks) || 0,
            isActive: adForm.isActive,
            isPopular: adForm.isPopular,
            displayOrder: Number(adForm.displayOrder) || 0,
        };

        const res = await fetch("/api/admin/ad-plans", {
            method: editingAdId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingAdId ? { id: editingAdId, ...payload } : payload),
        });
        const data = await res.json();
        if (data.success) {
            setAdModalOpen(false);
            fetchAdPlans();
            alert(editingAdId ? "Ad Plan Updated" : "Ad Plan Created");
        } else {
            alert(data.error || "Save failed");
        }
    };

    const deleteAdPlan = async (id) => {
        if (!confirm("Delete this advertisement plan?")) return;
        await fetch(`/api/admin/ad-plans?id=${id}`, { method: "DELETE" });
        fetchAdPlans();
    };


    // ==========================================
    // 3. STORAGE PLANS HANDLERS
    // ==========================================
    const openStorageModal = (plan = null) => {
        if (plan) {
            setEditingStorageId(plan._id);
            setStorageForm({
                title: plan.title,
                addedSpaceMB: String(plan.addedSpaceMB),
                price: String(plan.price),
                isActive: plan.isActive !== false
            });
        } else {
            setEditingStorageId(null);
            setStorageForm(initialStorageFormState);
        }
        setStorageModalOpen(true);
    };

    const handleStorageSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: storageForm.title,
            addedSpaceMB: Number(storageForm.addedSpaceMB),
            price: Number(storageForm.price),
            isActive: storageForm.isActive
        };

        const res = await fetch("/api/admin/storage/plans", {
            method: editingStorageId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingStorageId ? { id: editingStorageId, ...payload } : payload),
        });
        const data = await res.json();
        if (data.success) {
            setStorageModalOpen(false);
            fetchStoragePlans();
            alert(editingStorageId ? "Storage Plan Updated" : "Storage Plan Created");
        } else {
            alert(data.error || "Save failed");
        }
    };

    const deleteStoragePlan = async (id) => {
        if (!confirm("Delete this storage plan?")) return;
        await fetch(`/api/admin/storage/plans?id=${id}`, { method: "DELETE" });
        fetchStoragePlans();
    };


    // ==========================================
    // 4. COUPONS HANDLERS
    // ==========================================
    const openCouponModal = (coupon = null) => {
        if (coupon) {
            setEditingCouponId(coupon._id);
            setCouponForm({
                ...coupon,
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : ""
            });
        } else {
            setEditingCouponId(null);
            setCouponForm(initialCouponFormState);
        }
        setCouponModalOpen(true);
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        const discountValStr = String(couponForm.discountValue).replace(/[^\d.]/g, "");
        const parsedDiscountValue = Number(discountValStr) || 0;

        const payload = {
            ...couponForm,
            discountValue: parsedDiscountValue
        };

        const res = await fetch("/api/admin/coupons", {
            method: editingCouponId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingCouponId ? { ...payload, id: editingCouponId } : payload),
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                setCouponModalOpen(false);
                fetchCoupons();
                alert(editingCouponId ? "Coupon Updated" : "Coupon Created");
            }
        }
    };

    const deleteCoupon = async (id) => {
        if (confirm("Delete this coupon code?")) {
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchCoupons();
        }
    };


    // ==========================================
    // SHARED COLOR SCHEME
    // ==========================================
    const getPlanCategoryColor = (cat) => {
        switch (cat) {
            case 'Premium': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Standard': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Enterprise': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const filteredPlans = Array.isArray(plans) ? plans.filter(p => p.userType === activeTab) : [];
    const filteredAdPlans = adPlans.filter(p => p.userType === adActiveTab);
    const filteredAdPurchases = adPurchases.filter(p => {
        const type = p.userRole === "recruiter" ? "Recruiter" : "ServiceProvider";
        return type === adActiveTab;
    });

    return (
        <div className="p-8 bg-[#F9FAFB] min-h-screen text-slate-900 font-sans">
            
            {/* Header section with Unified Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Subscription & Package Settings</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage Subscription Plans, Advertisements, Storage Plans, and Coupons from a single dashboard</p>
                </div>
                
                {/* Unified Contextual Create Button */}
                {currentSection === "subscriptions" && (
                    <button onClick={() => openPlanModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold">
                        <Plus size={20} /> ADD NEW SUBSCRIPTION PACKAGE
                    </button>
                )}
                {currentSection === "advertisements" && (
                    <button onClick={() => openAdModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all font-bold">
                        <Plus size={20} /> ADD NEW ADVERTISEMENT PLAN
                    </button>
                )}
                {currentSection === "storage" && (
                    <button onClick={() => openStorageModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all font-bold">
                        <Plus size={20} /> ADD NEW STORAGE PLAN
                    </button>
                )}
                {currentSection === "coupons" && (
                    <button onClick={() => openCouponModal()} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-200 transition-all font-bold">
                        <Plus size={20} /> CREATE NEW PROMO COUPON
                    </button>
                )}
            </div>

            {/* Main Tabs Selector */}
            <div className="flex gap-6 border-b border-slate-200 mb-8 font-black uppercase text-xs tracking-wider">
                <button 
                    onClick={() => setCurrentSection("subscriptions")} 
                    className={`pb-4 px-2 flex items-center gap-2 transition-all ${currentSection === "subscriptions" ? "border-b-4 border-blue-600 text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-800"}`}
                >
                    <Briefcase size={16} /> Subscription Packages
                </button>
                <button 
                    onClick={() => setCurrentSection("advertisements")} 
                    className={`pb-4 px-2 flex items-center gap-2 transition-all ${currentSection === "advertisements" ? "border-b-4 border-indigo-600 text-indigo-600 font-extrabold" : "text-slate-400 hover:text-slate-800"}`}
                >
                    <Megaphone size={16} /> Advertisement Plans
                </button>
                <button 
                    onClick={() => setCurrentSection("storage")} 
                    className={`pb-4 px-2 flex items-center gap-2 transition-all ${currentSection === "storage" ? "border-b-4 border-emerald-600 text-emerald-600 font-extrabold" : "text-slate-400 hover:text-slate-800"}`}
                >
                    <HardDrive size={16} /> Storage Plans
                </button>
                <button 
                    onClick={() => setCurrentSection("coupons")} 
                    className={`pb-4 px-2 flex items-center gap-2 transition-all ${currentSection === "coupons" ? "border-b-4 border-violet-600 text-violet-600 font-extrabold" : "text-slate-400 hover:text-slate-800"}`}
                >
                    <Ticket size={16} /> Coupon Management
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Loading settings data...</div>
            ) : (
                <>
                    {/* ========================================================= */}
                    {/* SECTION 1: SUBSCRIPTION PLANS PANEL */}
                    {/* ========================================================= */}
                    {currentSection === "subscriptions" && (
                        <div>
                            <div className="flex p-1.5 bg-slate-200/60 w-fit rounded-2xl mb-8 backdrop-blur-sm">
                                {["Recruiter", "ServiceProvider", "Candidate"].map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab ? "bg-white text-blue-600 shadow-md" : "text-slate-600 hover:text-slate-800"}`}>
                                        {tab === "Recruiter" ? <Briefcase size={16} /> : <Users size={16} />}
                                        {tab === "Recruiter" ? "Recruiter" : tab === "ServiceProvider" ? "Service Provider" : "Candidate"}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPlans.map((plan) => (
                                    <div key={plan._id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col">
                                        {plan.isPopular && <div className="absolute -right-12 top-7 rotate-45 bg-orange-500 text-white text-[10px] font-black py-1.5 w-40 text-center uppercase tracking-widest z-10">Popular</div>}
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getPlanCategoryColor(plan.planCategory)}`}>
                                                {plan.planCategory || "Basic"}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.title}</h3>

                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-4xl font-black text-blue-600 tracking-tighter">₹{plan.price}</span>
                                            <span className="text-slate-400 font-bold text-sm">/ {plan.duration} {plan.durationType}</span>
                                        </div>

                                        <div className="mb-4 space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={12} /> Validity: <span className="text-slate-700 ml-1">{plan.duration} {plan.durationType}</span>
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {plan.userType === "Candidate" ? "Access Type" : (plan.userType === "Recruiter" ? "Job Postings" : "Lead Access")}:
                                                <span className="text-blue-600 ml-1">
                                                    {plan.userType === "Candidate" ? (plan.limits?.useLimit > 0 ? `${plan.limits.useLimit} uses` : "Unlimited AI Access") : (plan.userType === "Recruiter" ? (plan.limits?.jobLimit || 0) : (plan.limits?.leadLimit || 0))}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-8 flex-1">
                                            {(plan.features || []).map((f, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm font-semibold text-slate-600">
                                                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t flex flex-col gap-4 bg-white">
                                            <div className="flex justify-between items-center text-xs font-black uppercase">
                                                <span className="text-slate-400 tracking-widest">Status</span>
                                                <span className={plan.isActive ? "text-emerald-600" : "text-rose-500"}>
                                                    {plan.isActive ? "● Active" : "● Inactive"}
                                                </span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => openPlanModal(plan)} className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"><Edit size={14} /> EDIT</button>
                                                <button onClick={() => deletePlan(plan._id)} className="flex-1 py-3 rounded-2xl border border-rose-100 text-rose-500 text-xs font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* SECTION 2: ADVERTISEMENT PLANS PANEL */}
                    {/* ========================================================= */}
                    {currentSection === "advertisements" && (
                        <div>
                            {/* Ad Plan Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Ad Plans</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{adStats.totalAdPlans || adPlans.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Active Ad Campaigns</p>
                                    <p className="text-2xl font-black text-indigo-600 mt-1">{adStats.activePlans || adPlans.filter(p => p.isActive).length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Purchases</p>
                                    <p className="text-2xl font-black text-emerald-600 mt-1">{adStats.totalPurchases || adPurchases.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Ad Revenue</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">₹{(adStats.revenue || 0).toLocaleString("en-IN")}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setAdActiveTab("Recruiter")}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                            adActiveTab === "Recruiter" ? "bg-white text-indigo-600 shadow-md" : "text-slate-600 hover:text-slate-800"
                                        }`}
                                    >
                                        <Briefcase size={16} /> Recruiters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdActiveTab("ServiceProvider")}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                            adActiveTab === "ServiceProvider" ? "bg-white text-indigo-600 shadow-md" : "text-slate-600 hover:text-slate-800"
                                        }`}
                                    >
                                        <Users size={16} /> Service Providers
                                    </button>
                                </div>
                                <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setAdView("plans")}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                            adView === "plans" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:text-slate-800"
                                        }`}
                                    >
                                        Ad Plans ({filteredAdPlans.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdView("purchases")}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                            adView === "purchases" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:text-slate-800"
                                        }`}
                                    >
                                        Campaign Purchases ({filteredAdPurchases.length})
                                    </button>
                                </div>
                            </div>

                            {adView === "plans" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredAdPlans.map((plan) => (
                                        <div key={plan._id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-black uppercase text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                                                        Order #{plan.displayOrder || 0}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${plan.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {plan.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.title} {plan.isPopular && "⭐"}</h3>
                                                <div className="flex items-baseline gap-1 mb-4">
                                                    <span className="text-3xl font-black text-indigo-600">₹{plan.price}</span>
                                                    <span className="text-slate-400 font-bold text-xs">/ {plan.duration} {plan.durationType}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs font-semibold mb-6">{plan.description || "No description provided."}</p>
                                                
                                                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mb-6 border border-slate-100 text-xs font-bold text-slate-500">
                                                    <p>Impressions: <span className="text-slate-800 ml-1">~{plan.estimatedImpressions}</span></p>
                                                    <p>Clicks: <span className="text-slate-800 ml-1">~{plan.estimatedClicks}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openAdModal(plan)} className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-slate-700"><Edit3 size={14} /> EDIT</button>
                                                <button onClick={() => deleteAdPlan(plan._id)} className="flex-1 py-3 rounded-2xl border border-rose-100 text-rose-500 text-xs font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-black tracking-wider">
                                                <tr>
                                                    <th className="p-5">Buyer Account</th>
                                                    <th className="p-5">Plan</th>
                                                    <th className="p-5">Amount Paid</th>
                                                    <th className="p-5">Display Status</th>
                                                    <th className="p-5">Start Date</th>
                                                    <th className="p-5">Expires Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                                {filteredAdPurchases.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">No ad campaign purchases recorded.</td>
                                                    </tr>
                                                ) : (
                                                    filteredAdPurchases.map((p) => (
                                                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-5">
                                                                <p className="font-bold text-slate-800">{p.userName || "—"}</p>
                                                                <p className="text-xs text-slate-400 mt-0.5">{p.userEmail}</p>
                                                            </td>
                                                            <td className="p-5 font-bold text-slate-800">{p.planId?.title || p.name}</td>
                                                            <td className="p-5 font-black text-indigo-600">₹{(p.amountPaid || p.budget || 0).toLocaleString("en-IN")}</td>
                                                            <td className="p-5">
                                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                                                                    p.displayStatus === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : p.displayStatus === "Expired" ? "bg-slate-100 text-slate-400" : "bg-amber-50 text-amber-600 border border-amber-100"
                                                                }`}>
                                                                    {p.displayStatus}
                                                                </span>
                                                            </td>
                                                            <td className="p-5 text-slate-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                                                            <td className="p-5 text-slate-500">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("en-IN") : "—"}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* SECTION 3: STORAGE PLANS PANEL */}
                    {/* ========================================================= */}
                    {currentSection === "storage" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {storagePlans.length === 0 && (
                                <div className="col-span-3 text-center py-20 text-slate-400 font-bold">No Storage space plans created yet.</div>
                            )}
                            {storagePlans.map((plan) => (
                                <div key={plan._id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                                <HardDrive size={24} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${plan.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {plan.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 mb-2">{plan.title}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-black text-emerald-600">₹{plan.price}</span>
                                            <span className="text-slate-400 font-bold text-xs">/ One-time Wallet payment</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl text-xs font-black text-slate-600 uppercase tracking-wide border border-slate-100 mb-6">
                                            Space Added: <span className="text-blue-600 ml-1">{plan.addedSpaceMB} MB</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openStorageModal(plan)} className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-slate-700"><Edit size={14} /> EDIT</button>
                                        <button onClick={() => deleteStoragePlan(plan._id)} className="flex-1 py-3 rounded-2xl border border-rose-100 text-rose-500 text-xs font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* SECTION 4: COUPON MANAGEMENT PANEL */}
                    {/* ========================================================= */}
                    {currentSection === "coupons" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coupons.length === 0 && (
                                <div className="col-span-3 text-center py-20 text-slate-400 font-bold">No promotional coupons created yet.</div>
                            )}
                            {coupons.map((coupon) => (
                                <div key={coupon._id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-violet-50 text-violet-600 px-4 py-1.5 rounded-xl font-black tracking-wider text-sm border border-violet-100 uppercase">
                                                {coupon.code}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${coupon.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-800 mb-2">
                                            {coupon.discountType === "Percentage" ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Flat Off`}
                                        </h3>
                                        <p className="text-slate-500 text-xs font-semibold mb-6">{coupon.description || "No description provided."}</p>

                                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 mb-6">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span>Exp: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-slate-400" />
                                                <span>Max Uses: {coupon.maxRedemptions || "Unlimited"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => openCouponModal(coupon)} className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-slate-700"><Edit size={14} /> EDIT</button>
                                        <button onClick={() => deleteCoupon(coupon._id)} className="flex-1 py-3 rounded-2xl border border-rose-100 text-rose-500 text-xs font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}


            {/* ========================================================= */}
            {/* 1. SUBSCRIPTION PLAN CREATE/EDIT MODAL */}
            {/* ========================================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative border border-white/20">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-800">{editingPlan ? "Edit Subscription Plan" : "Create New Plan"}</h2>
                        </div>

                        <form onSubmit={handlePlanSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Plan Title</label>
                                    <input type="text" required value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Plan Level</label>
                                    <select value={planForm.planCategory} onChange={(e) => setPlanForm({ ...planForm, planCategory: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                                        <option value="Basic">Basic</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Target Role</label>
                                    <select value={planForm.userType} onChange={(e) => setPlanForm({ ...planForm, userType: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" disabled={editingPlan}>
                                        <option value="Recruiter">Recruiter</option>
                                        <option value="ServiceProvider">Service Provider</option>
                                        <option value="Candidate">Candidate</option>
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Price (INR)</label>
                                    <input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-[24px] border border-blue-100">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3 block">Plan Validity</label>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Duration Value</label>
                                    <input type="number" value={planForm.duration} onChange={(e) => setPlanForm({ ...planForm, duration: Number(e.target.value) })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold" placeholder="e.g. 30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Duration Type</label>
                                    <select value={planForm.durationType} onChange={(e) => setPlanForm({ ...planForm, durationType: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold">
                                        <option value="Days">Days</option>
                                        <option value="Months">Months</option>
                                        <option value="Years">Years</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Package Features</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {AVAILABLE_FEATURES.map(feat => (
                                        <label key={feat} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-200 shadow-sm transition-all">
                                            <input type="checkbox" checked={(planForm.features || []).includes(feat)} onChange={() => handleFeatureToggle(feat)} className="w-4 h-4 accent-blue-600 rounded" />
                                            <span className="text-xs font-bold text-slate-700">{feat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 items-end">
                                {planForm.userType !== "Candidate" ? (
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                                            {planForm.userType === "Recruiter" ? "Job Posting Limit" : "Lead Access Limit"}
                                        </label>
                                        <input
                                            type="number"
                                            value={planForm.userType === "Recruiter" ? (planForm.limits?.jobLimit || 0) : (planForm.limits?.leadLimit || 0)}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPlanForm(prev => ({
                                                    ...prev,
                                                    limits: {
                                                        ...(prev.limits || { jobLimit: 0, leadLimit: 0 }),
                                                        [prev.userType === "Recruiter" ? 'jobLimit' : 'leadLimit']: val
                                                    }
                                                }));
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                                            Use Limit (0 for unlimited)
                                        </label>
                                        <input
                                            type="number"
                                            value={planForm.limits?.useLimit || 0}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPlanForm(prev => ({
                                                    ...prev,
                                                    limits: {
                                                        ...(prev.limits || { jobLimit: 0, leadLimit: 0, useLimit: 0 }),
                                                        useLimit: val
                                                    }
                                                }));
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                                        />
                                    </div>
                                )}
                                <div className="flex justify-between p-1">
                                    <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-slate-600">
                                        <input type="checkbox" checked={planForm.isPopular} onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })} className="w-5 h-5 rounded-lg" /> Popular
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-emerald-600">
                                        <input type="checkbox" checked={planForm.isActive} onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })} className="w-5 h-5 rounded-lg" /> Active
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[20px] font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 tracking-widest uppercase">
                                <Save size={22} /> {editingPlan ? "UPDATE PLAN" : "PUBLISH PLAN"}
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* ========================================================= */}
            {/* 2. ADVERTISEMENT PLAN CREATE/EDIT MODAL */}
            {/* ========================================================= */}
            {adModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleAdSubmit} className="bg-white rounded-3xl p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-slate-100 shadow-2xl">
                        <button type="button" onClick={() => setAdModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
                        
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900">{editingAdId ? "Edit Ad Plan" : "Create Ad Plan"}</h2>
                            <p className="text-slate-500 text-xs font-semibold mt-1">Configure banner display duration and estimations</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Ad Title *</label>
                                <input required value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Description</label>
                                <textarea value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Price (₹) *</label>
                                    <input required type="number" min={0} value={adForm.price} onChange={(e) => setAdForm({ ...adForm, price: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Duration (days) *</label>
                                    <input required type="number" min={1} value={adForm.duration} onChange={(e) => setAdForm({ ...adForm, duration: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">User Type</label>
                                <select value={adForm.userType} onChange={(e) => setAdForm({ ...adForm, userType: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                                    <option value="Recruiter">Recruiter</option>
                                    <option value="ServiceProvider">Service Provider</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Features (one per line)</label>
                                <textarea value={adForm.features} onChange={(e) => setAdForm({ ...adForm, features: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" rows={3} placeholder="e.g. Header Placement&#10;Social Media Blast" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Est. Impressions</label>
                                    <input type="number" value={adForm.estimatedImpressions} onChange={(e) => setForm({ ...adForm, estimatedImpressions: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Est. Clicks</label>
                                    <input type="number" value={adForm.estimatedClicks} onChange={(e) => setForm({ ...adForm, estimatedClicks: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2 font-bold text-xs uppercase cursor-pointer">
                                    <input type="checkbox" checked={adForm.isActive} onChange={(e) => setAdForm({ ...adForm, isActive: e.target.checked })} /> Active
                                </label>
                                <label className="flex items-center gap-2 font-bold text-xs uppercase cursor-pointer">
                                    <input type="checkbox" checked={adForm.isPopular} onChange={(e) => setAdForm({ ...adForm, isPopular: e.target.checked })} /> Popular
                                </label>
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                            <Save size={18} /> {editingAdId ? "Update Ad Plan" : "Create Ad Plan"}
                        </button>
                    </form>
                </div>
            )}


            {/* ========================================================= */}
            {/* 3. STORAGE PLAN CREATE/EDIT MODAL */}
            {/* ========================================================= */}
            {storageModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleStorageSubmit} className="bg-white rounded-3xl p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-slate-100 shadow-2xl">
                        <button type="button" onClick={() => setStorageModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900">{editingStorageId ? "Edit Storage Plan" : "Create Storage Plan"}</h2>
                            <p className="text-slate-500 text-xs font-semibold mt-1">Configure additional cloud storage space allocation</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Plan Title *</label>
                                <input required value={storageForm.title} onChange={(e) => setStorageForm({ ...storageForm, title: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="e.g. 500MB Booster Pack" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Added Space (MB) *</label>
                                    <input required type="number" min={1} value={storageForm.addedSpaceMB} onChange={(e) => setStorageForm({ ...storageForm, addedSpaceMB: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="e.g. 500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Price (₹) *</label>
                                    <input required type="number" min={0} value={storageForm.price} onChange={(e) => setStorageForm({ ...storageForm, price: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-2 font-bold text-xs uppercase cursor-pointer">
                                    <input type="checkbox" checked={storageForm.isActive} onChange={(e) => setStorageForm({ ...storageForm, isActive: e.target.checked })} /> Active
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                            <Save size={18} /> {editingStorageId ? "Update Storage Plan" : "Create Storage Plan"}
                        </button>
                    </form>
                </div>
            )}


            {/* ========================================================= */}
            {/* 4. COUPON CREATE/EDIT MODAL */}
            {/* ========================================================= */}
            {couponModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-10 shadow-2xl relative border border-white/20">
                        <button onClick={() => setCouponModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900">{editingCouponId ? "Edit Promo Coupon" : "Create Promo Coupon"}</h2>
                            <p className="text-slate-500 text-xs font-semibold mt-1">Configure discount values and maximum usages</p>
                        </div>

                        <form onSubmit={handleCouponSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Coupon Code *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. SUMMER50"
                                        value={couponForm.code}
                                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold uppercase placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Discount Type</label>
                                    <select
                                        value={couponForm.discountType}
                                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                                    >
                                        <option value="Percentage">Percentage</option>
                                        <option value="Fixed">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Briefly describe what this coupon provides..."
                                    value={couponForm.description}
                                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold placeholder:text-slate-300"
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Discount Value *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 20 for 20%"
                                    required
                                    value={couponForm.discountValue}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold placeholder:text-slate-300"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Max Redemptions</label>
                                    <input
                                        type="number"
                                        placeholder="Leave blank for unlimited"
                                        value={couponForm.maxRedemptions}
                                        onChange={(e) => setCouponForm({ ...couponForm, maxRedemptions: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Expires At *</label>
                                    <input
                                        type="date"
                                        required
                                        value={couponForm.expiryDate}
                                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <label className="flex items-center gap-2 font-bold text-xs uppercase cursor-pointer">
                                    <input type="checkbox" checked={couponForm.isActive} onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })} /> Active
                                </label>
                            </div>

                            <button type="submit" className="w-full mt-8 py-5 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-violet-100 flex items-center justify-center gap-2">
                                <Save size={18} /> {editingCouponId ? "Update Coupon" : "Create Coupon"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}