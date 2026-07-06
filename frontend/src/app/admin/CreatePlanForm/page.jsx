"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle, Briefcase, Users, X, Save, Clock, Ticket, Check } from "lucide-react";

export default function SubscriptionManagement() {
    const [activeTab, setActiveTab] = useState("Recruiter");
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [featureInput, setFeatureInput] = useState("");

    // --- Coupon States ---
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");

    const initialFormState = {
        title: "",
        planCategory: "Basic",
        userType: "Recruiter",
        price: 0,
        duration: 30,
        durationType: "Days",
        features: [],
        limits: { jobLimit: 0, leadLimit: 0 },
        storageLimit: 0,
        isPopular: false,
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/plans");
            const data = await res.json();
            if (data.success) setPlans(data.plans || []);
        } catch (err) {
            setError("Failed to load plans.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    // --- Coupon Validation Logic ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError("");
        try {
            const res = await fetch(`/api/admin/coupons?code=${couponCode.toUpperCase()}`);
            const data = await res.json();
            if (data.success) {
                setAppliedCoupon(data.coupon);
                setCouponError("");
            } else {
                setAppliedCoupon(null);
                setCouponError(data.message || "Invalid or Expired Coupon");
            }
        } catch (err) {
            setCouponError("Error validating coupon");
        }
    };

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan._id);
            setFormData({
                ...plan,
                features: Array.isArray(plan.features) ? [...plan.features] : [],
                limits: plan.limits || { jobLimit: 0, leadLimit: 0 },
                planCategory: plan.planCategory || plan.planType || "Basic",
                duration: plan.duration || 30,
                durationType: plan.durationType || "Days"
            });
        } else {
            setEditingPlan(null);
            setFormData({ ...initialFormState, userType: activeTab });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingPlan ? "PUT" : "POST";
        const res = await fetch("/api/admin/plans", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingPlan ? { ...formData, id: editingPlan } : formData),
        });

        const result = await res.json();
        if (result.success) {
            alert(editingPlan ? "Plan Updated!" : "Plan Created!");
            setIsModalOpen(false);
            fetchPlans();
        }
    };

    const deletePlan = async (id) => {
        if (confirm("Are you sure?")) {
            const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchPlans();
        }
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            const currentFeatures = Array.isArray(formData.features) ? formData.features : [];
            setFormData({ ...formData, features: [...currentFeatures, featureInput.trim()] });
            setFeatureInput("");
        }
    };

    const getPlanColor = (type) => {
        switch (type) {
            case 'Premium': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Standard': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Enterprise': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const filteredPlans = Array.isArray(plans) ? plans.filter(p => p.userType === activeTab) : [];

    return (
        <div className="p-8 bg-[#F9FAFB] min-h-screen text-slate-900 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Subscription Management</h1>
                    <p className="text-slate-500 text-sm">Create and Manage your service packages</p>
                </div>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold">
                    <Plus size={20} /> ADD NEW PACKAGE
                </button>
            </div>

            <div className="flex p-1.5 bg-slate-200/60 w-fit rounded-2xl mb-10 backdrop-blur-sm">
                {["Recruiter", "ServiceProvider"].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-md" : "text-slate-600 hover:text-slate-800"}`}>
                        {tab === "Recruiter" ? <Briefcase className="inline mr-2" size={16} /> : <Users className="inline mr-2" size={16} />}
                        {tab === "Recruiter" ? "Recruiter" : "Service Provider"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Loading Plans...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlans.map((plan) => (
                        <div key={plan._id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col">
                            {plan.isPopular && <div className="absolute -right-12 top-7 rotate-45 bg-orange-500 text-white text-[10px] font-black py-1.5 w-40 text-center uppercase tracking-widest z-10">Popular</div>}

                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getPlanColor(plan.planCategory)}`}>
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
                                    {plan.userType === "Recruiter" ? "Job Postings" : "Lead Access"}:
                                    <span className="text-blue-600 ml-1">
                                        {plan.userType === "Recruiter" ? (plan.limits?.jobLimit || 0) : (plan.limits?.leadLimit || 0)}
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
                                    <button onClick={() => openModal(plan)} className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"><Edit size={14} /> EDIT</button>
                                    <button onClick={() => deletePlan(plan._id)} className="flex-1 py-3 rounded-2xl border border-rose-100 text-rose-500 text-xs font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative border border-white/20">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-800">{editingPlan ? "Edit Package" : "Create New Package"}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Plan Title</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Plan Level</label>
                                    <select value={formData.planCategory} onChange={(e) => setFormData({ ...formData, planCategory: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                                        <option value="Basic">Basic</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Target Role</label>
                                    <select value={formData.userType} onChange={(e) => setFormData({ ...formData, userType: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" disabled={editingPlan}>
                                        <option value="Recruiter">Recruiter</option>
                                        <option value="ServiceProvider">Service Provider</option>
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Price (INR)</label>
                                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                                </div>
                            </div>

                            {/* --- PLAN VALIDITY SECTION --- */}
                            <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-[24px] border border-blue-100">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3 block">Plan Validity</label>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Duration Value</label>
                                    <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold" placeholder="e.g. 30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Duration Type</label>
                                    <select value={formData.durationType} onChange={(e) => setFormData({ ...formData, durationType: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold">
                                        <option value="Days">Days</option>
                                        <option value="Months">Months</option>
                                        <option value="Years">Years</option>
                                    </select>
                                </div>
                            </div>

                            {/* --- COUPON SECTION (NEW) --- */}
                            <div className="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100">
                                <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-3 block">Apply Promo Code (Admin Preview)</label>
                                <div className="flex gap-2 relative">
                                    <div className="relative flex-1">
                                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-indigo-200 rounded-2xl outline-none font-bold uppercase placeholder:text-slate-300"
                                            placeholder="ENTER CODE"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="bg-indigo-600 text-white px-6 rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-wider">{couponError}</p>}
                                {appliedCoupon && (
                                    <div className="mt-3 flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                                        <span className="text-emerald-700 text-xs font-black flex items-center gap-2">
                                            <Check size={14} /> APPLIED: {appliedCoupon.code} (-{appliedCoupon.discountValue}{appliedCoupon.discountType === 'Percentage' ? '%' : '₹'})
                                        </span>
                                        <button type="button" onClick={() => setAppliedCoupon(null)} className="text-emerald-700 hover:text-rose-500"><X size={14} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Package Features</label>
                                <div className="flex gap-2 mb-4">
                                    <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold" placeholder="e.g. 24/7 Support" />
                                    <button type="button" onClick={addFeature} className="bg-slate-800 text-white px-4 rounded-xl"><Plus size={20} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(formData.features || []).map((f, i) => (
                                        <span key={i} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                            {f} <X size={14} className="cursor-pointer text-rose-500" onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 items-end">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                                        {formData.userType === "Recruiter" ? "Job Posting Limit" : "Lead Access Limit"}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.userType === "Recruiter" ? (formData.limits?.jobLimit || 0) : (formData.limits?.leadLimit || 0)}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setFormData(prev => ({
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
                                <div className="flex justify-between p-1">
                                    <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-slate-600">
                                        <input type="checkbox" checked={formData.isPopular} onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })} className="w-5 h-5 rounded-lg" /> Popular
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-black text-xs uppercase text-emerald-600">
                                        <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded-lg" /> Active
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[20px] font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 tracking-widest uppercase">
                                <Save size={22} /> {editingPlan ? "UPDATE PACKAGE" : "PUBLISH PACKAGE"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}