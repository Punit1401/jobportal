"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Users, Briefcase, Loader2 } from "lucide-react";

export default function AdminPlansPage() {
    const [activeTab, setActiveTab] = useState("recruiter");
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "", price: "", duration: "", durationType: "Days",
        planCategory: "Basic", userType: "Recruiter", isPopular: false,
        limits: { jobLimit: 0, leadLimit: 0, useLimit: 0 },
        storage: { value: 0, unit: "GB" },
        features: []
    });

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
        formData.userType === "Candidate" 
            ? CANDIDATE_FEATURES 
            : (formData.userType === "ServiceProvider" ? PROVIDER_FEATURES : RECRUITER_FEATURES);

    const handleFeatureToggle = (feat) => {
        setFormData(prev => {
            const current = prev.features;
            if (current.includes(feat)) return { ...prev, features: current.filter(f => f !== feat) };
            return { ...prev, features: [...current, feat] };
        });
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/plans");
            const data = await res.json();
            if (data.success) setPlans(data.plans);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchPlans();
                alert("Plan saved successfully!");
            }
        } catch (err) { alert("Error saving plan"); }
    };

    const deletePlan = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
            fetchPlans();
        } catch (err) { alert("Delete failed"); }
    };

    const filteredPlans = plans.filter(p => p.userType.toLowerCase() === activeTab.toLowerCase());

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Subscription Plans</h1>
                        <p className="text-slate-500 font-bold text-sm">Manage pricing for your platform</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition"
                    >
                        <Plus size={20} /> Create New Plan
                    </button>
                </div>

                {/* Tabs Selection */}
                <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl w-fit border border-slate-200">
                    <button
                        onClick={() => setActiveTab("recruiter")}
                        className={`px-6 py-2 rounded-xl font-black flex items-center gap-2 transition ${activeTab === "recruiter" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        <Briefcase size={18} /> Recruiters
                    </button>
                    <button
                        onClick={() => setActiveTab("ServiceProvider")}
                        className={`px-6 py-2 rounded-xl font-black flex items-center gap-2 transition ${activeTab.toLowerCase() === "serviceprovider" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        <Users size={18} /> Service Providers
                    </button>
                    <button
                        onClick={() => setActiveTab("candidate")}
                        className={`px-6 py-2 rounded-xl font-black flex items-center gap-2 transition ${activeTab.toLowerCase() === "candidate" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                        <Users size={18} /> Candidates
                    </button>
                </div>

                {/* Plans Table */}
                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPlans.length === 0 && <p className="text-center p-10 font-bold text-slate-400">No plans found for this category.</p>}
                        {filteredPlans.map(plan => (
                            <div key={plan._id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">{plan.title} {plan.isPopular && "🔥"}</h3>
                                    <p className="text-sm font-bold text-indigo-600">{plan.price === 0 ? "Free Trial" : `₹${plan.price}`} / {plan.duration} {plan.durationType}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Plan Limits & Space</p>
                                        <p className="font-bold text-slate-700">
                                            {plan.userType.toLowerCase() === "recruiter" && `${plan.limits?.jobLimit} Job posts`}
                                            {plan.userType.toLowerCase() === "serviceprovider" && `${plan.limits?.leadLimit} Leads`}
                                            {plan.userType.toLowerCase() === "candidate" && (plan.limits?.useLimit > 0 ? `${plan.limits.useLimit} uses limit` : `Unlimited AI Access`)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition"><Edit3 size={20} /></button>
                                        <button onClick={() => deletePlan(plan._id)} className="p-2 text-slate-400 hover:text-rose-600 transition"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- Simple Add Plan Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black mb-6">Create New Plan</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                            <div className="col-span-2">
                                <label className="block text-xs font-black uppercase mb-2">Plan Title</label>
                                <input required type="text" className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="e.g. Gold Plan" onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-2">Price (INR)</label>
                                <input required type="number" className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-2">User Type</label>
                                <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.userType} onChange={e => setFormData({ ...formData, userType: e.target.value })}>
                                    <option value="Recruiter">Recruiter</option>
                                    <option value="ServiceProvider">Service Provider</option>
                                    <option value="Candidate">Candidate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-2">Duration Value</label>
                                <input required type="number" className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="30" onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-2">Duration Type</label>
                                <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" onChange={e => setFormData({ ...formData, durationType: e.target.value })}>
                                    <option value="Days">Days</option>
                                    <option value="Months">Months</option>
                                    <option value="Years">Years</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-2">Category</label>
                                <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" onChange={e => setFormData({ ...formData, planCategory: e.target.value })}>
                                    <option value="Basic">Basic</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-2">Storage</label>
                                <div className="flex gap-2">
                                    <input type="number" className="flex-1 p-3 bg-slate-50 border rounded-xl" placeholder="e.g. 5" onChange={e => setFormData({ ...formData, storage: { ...formData.storage, value: e.target.value } })} />
                                    <select className="w-24 p-3 bg-slate-50 border rounded-xl font-bold" onChange={e => setFormData({ ...formData, storage: { ...formData.storage, unit: e.target.value } })}>
                                        <option value="GB">GB</option>
                                        <option value="MB">MB</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-2 border-t pt-4 mt-4">
                                <h4 className="font-black text-sm mb-4">Plan Limits</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {formData.userType === "Recruiter" && (
                                        <input type="number" placeholder="Job Limit" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setFormData({ ...formData, limits: { ...formData.limits, jobLimit: e.target.value } })} />
                                    )}
                                    {formData.userType === "ServiceProvider" && (
                                        <input type="number" placeholder="Lead Access Limit" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setFormData({ ...formData, limits: { ...formData.limits, leadLimit: e.target.value } })} />
                                    )}
                                    {formData.userType === "Candidate" && (
                                        <input type="number" placeholder="Use Limit (0 for unlimited)" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setFormData({ ...formData, limits: { ...formData.limits, useLimit: e.target.value } })} />
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="popular" onChange={e => setFormData({ ...formData, isPopular: e.target.checked })} />
                                        <label htmlFor="popular" className="text-sm font-bold">Mark as Popular</label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 border-t pt-4 mt-4">
                                <h4 className="font-black text-sm mb-4">Core Features (Access Control)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {AVAILABLE_FEATURES.map(feat => (
                                        <label key={feat} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200">
                                            <input type="checkbox" checked={formData.features.includes(feat)} onChange={() => handleFeatureToggle(feat)} className="w-4 h-4 accent-indigo-600" />
                                            <span className="text-xs font-bold text-slate-700">{feat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2 flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-500">Cancel</button>
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Save Plan</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}