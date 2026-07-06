"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Zap, XCircle, Loader2, Ticket, ArrowRight, Briefcase, Users } from "lucide-react";

export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const [allPlans, setAllPlans] = useState([]); // બધા પ્લાન્સ સ્ટોર કરવા
    const [activeTab, setActiveTab] = useState("recruiter"); // Default tab
    const [loading, setLoading] = useState(true);
    const [processingPlanId, setProcessingPlanId] = useState(null);

    // Coupon States
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch("/api/admin/plans");
                const data = await res.json();
                if (data.success) {
                    setAllPlans(data.plans || []);
                    // જો યુઝર લોગીન હોય, તો તેના રોલ મુજબ ડિફોલ્ટ ટેબ સેટ કરો
                    if (session?.user?.role) {
                        setActiveTab(session.user.role.toLowerCase());
                    }
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (status !== 'loading') fetchPlans();
    }, [session, status]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        try {
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            if (data.success) {
                const found = data.coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
                if (found) {
                    setAppliedCoupon(found);
                    alert(`Success! ${found.discountValue}${found.discountType === "Percentage" ? "%" : "₹"} discount applied.`);
                } else {
                    alert("Invalid or Expired Coupon.");
                }
            }
        } catch (err) {
            alert("Error validating coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    const calculateDiscountedPrice = (originalPrice) => {
        if (!appliedCoupon) return originalPrice;
        const discount = appliedCoupon.discountType === "Percentage"
            ? (originalPrice * appliedCoupon.discountValue / 100)
            : appliedCoupon.discountValue;
        return Math.max(0, originalPrice - discount);
    };

    const handlePayment = async (plan) => {
        if (status === 'unauthenticated') {
            alert("Please login to proceed.");
            window.location.href = '/login';
            return;
        }
        setProcessingPlanId(plan._id);
        // Payment Logic... (તમારી જૂની Razorpay મેથડ અહીં આવશે)
    };

    // હાલના ટેબ મુજબ પ્લાન્સ ફિલ્ટર કરો
    const filteredPlans = allPlans.filter(p => p.userType.toLowerCase() === activeTab);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Plans...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFBFF] pb-20">
            {/* Header section with Tabs */}
            <div className="bg-slate-900 pt-20 pb-40 px-6 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-white text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
                        Premium <span className="text-blue-400">Memberships</span>
                    </h1>

                    {/* --- TOGGLE TABS --- */}
                    <div className="flex bg-white/10 p-1 rounded-2xl max-w-md mx-auto mb-10 backdrop-blur-md border border-white/10">
                        <button
                            onClick={() => setActiveTab("recruiter")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${activeTab === "recruiter" ? "bg-white text-slate-900 shadow-xl" : "text-white hover:bg-white/5"}`}
                        >
                            <Briefcase size={14} /> For Recruiters
                        </button>
                        <button
                            onClick={() => setActiveTab("serviceprovider")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${activeTab === "serviceprovider" ? "bg-white text-slate-900 shadow-xl" : "text-white hover:bg-white/5"}`}
                        >
                            <Users size={14} /> For Providers
                        </button>
                    </div>

                    {/* Coupon Input */}
                    <div className="max-w-md mx-auto flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
                        <input
                            type="text"
                            placeholder="COUPON CODE"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="bg-transparent flex-1 px-4 text-white font-bold text-xs outline-none"
                        />
                        <button onClick={handleApplyCoupon} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black">{couponLoading ? "..." : "APPLY"}</button>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlans.length > 0 ? filteredPlans.map((plan) => {
                        const finalPrice = calculateDiscountedPrice(plan.price);
                        return (
                            <div key={plan._id} className={`bg-white rounded-[40px] p-10 border border-slate-200 shadow-xl flex flex-col relative group transition-all duration-500 hover:-translate-y-3 ${plan.isPopular ? 'ring-4 ring-blue-500/20 z-10' : ''}`}>
                                {plan.isPopular && <div className="absolute top-6 right-8 bg-amber-500 text-white p-2 rounded-full shadow-lg shadow-amber-200"><Zap size={16} fill="white" /></div>}

                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">{plan.title}</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">{plan.planCategory}</p>

                                <div className="mb-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{finalPrice.toLocaleString()}</span>
                                        <span className="text-slate-400 font-bold text-sm">/ {plan.duration} {plan.durationType}</span>
                                    </div>
                                    {appliedCoupon && <p className="text-emerald-500 text-[10px] font-black mt-1">DISCOUNT APPLIED!</p>}
                                </div>

                                <div className="flex-1 space-y-4 mb-10">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Plan Benefits</h4>

                                    {/* DYNAMIC LIMITS */}
                                    {plan.limits?.jobLimit > 0 && <FeatureItem text={`Post ${plan.limits.jobLimit} Active Jobs`} />}
                                    {plan.limits?.leadLimit > 0 && <FeatureItem text={`Access ${plan.limits.leadLimit} Premium Leads`} />}
                                    {plan.storageLimit > 0 && <FeatureItem text={`${plan.storageLimit}GB Cloud Storage`} />}

                                    {/* DYNAMIC FEATURES ARRAY */}
                                    {plan.features?.map((feat, idx) => (
                                        <FeatureItem key={idx} text={feat} />
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePayment(plan)}
                                    disabled={processingPlanId === plan._id}
                                    className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${plan.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                >
                                    {processingPlanId === plan._id ? <Loader2 className="animate-spin" size={16} /> : <>Select Plan <ArrowRight size={16} /></>}
                                </button>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-black uppercase tracking-widest">No plans found for this category</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text }) {
    return (
        <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-1 rounded-full"><CheckCircle2 size={14} className="text-emerald-500" /></div>
            <span className="text-sm font-bold text-slate-600">{text}</span>
        </div>
    );
}