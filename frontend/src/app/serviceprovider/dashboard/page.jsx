"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Serviceprovidersidbar';
import { 
  TrendingUp, Users, Briefcase, Star, 
  OctagonAlert, Loader2, CheckCircle2, 
  MessageSquare, FileEdit, ShieldAlert, ArrowRight, CreditCard, Clock, Ban
} from 'lucide-react';
import Script from 'next/script';

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGigsCount, setActiveGigsCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (hasFetched.current) return;

      if (session?.user?.email) {
        try {
          setLoading(true);
          // 1. Fetch Provider Profile
          const res = await fetch(`/api/admin/serviceproviders?email=${session.user.email}`, {
            cache: 'no-store'
          });
          const data = await res.json();
          
          if (res.ok && data.providers) {
            const currentProfile = data.providers.find(p => p.email === session.user.email);
            setDbUser(currentProfile);

            // Fetch extra data only if Approved and Paid
            if (currentProfile?.status === 'approved' && currentProfile?.isPaid) {
              // 2. Fetch Active Services
              const serviceRes = await fetch(`/api/serviceprovider/serviceform`);
              const serviceData = await serviceRes.json();
              if (serviceRes.ok && serviceData.services) {
                setActiveGigsCount(serviceData.services.length);
              }

              // 3. Fetch Reviews
              const reviewRes = await fetch(`/api/reviews?targetId=${session.user.email}`);
              const reviewData = await reviewRes.json();
              if (reviewData.success) {
                setReviews(reviewData.reviews || []);
                if (reviewData.reviews?.length > 0) {
                  const avg = reviewData.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewData.reviews.length;
                  setStats({ avgRating: avg.toFixed(1), totalReviews: reviewData.reviews.length });
                }
              }
            }
          }
          hasFetched.current = true;
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (authStatus === "authenticated") fetchDashboardData();
    else if (authStatus === "unauthenticated") router.push("/login");
  }, [session, authStatus]);

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/payment/checkout", { // Recruiter જેવી જ API વાપરી
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 999 }), 
      });
      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "Shiven Jobs",
        description: "Service Provider Premium Activation",
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: session.user.email, // SP ઓળખવા માટે
              role: "serviceprovider"
            }),
          });

          // આ ડેટા રીડ કરવો જરૂરી છે જેથી 'success' કન્ફર્મ થઈ શકે
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            alert("Account Activated Successfully!");
            window.location.reload();
          } else {
            alert("Payment verification failed! Please contact support.");
          }
        },
        prefill: {
          name: dbUser?.fullName,
          email: dbUser?.email,
          contact: dbUser?.mobile,
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed to initialize.");
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFEFF]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  // logic flags
  const isProfileIncomplete = !dbUser?.aadharNumber || !dbUser?.panNumber;

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex flex-col lg:flex-row">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Sidebar activePage="dashboard" />

      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 w-full overflow-x-hidden">
        
        {/* Recruiter જેવું Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Welcome, <span className="text-indigo-600">{dbUser?.fullName?.split(' ')[0]}</span>! 👋
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
                {dbUser?.status === 'approved' ? (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                    <CheckCircle2 size={10} /> Verified Expert
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-100 uppercase">
                    <Clock size={10} /> Verification Pending
                  </div>
                )}
            </div>
          </div>
        </header>

        {/* Status Cards (Same as Recruiter Style) */}
        {isProfileIncomplete && (
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mb-12">
               <div>
                  <h2 className="text-3xl font-black italic">Complete Your Profile</h2>
                  <p className="text-indigo-100 mt-2 font-medium">Please provide KYC documents to start the verification process.</p>
               </div>
               <button onClick={() => router.push('/serviceprovider/profile')} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                  Go to Profile <ArrowRight size={18} />
               </button>
            </div>
        )}

        {dbUser?.status === 'pending' && !isProfileIncomplete && (
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-[32px] mb-12 flex flex-col items-center text-center">
            <Clock size={48} className="text-amber-500 mb-4 animate-pulse" />
            <h2 className="text-xl font-black text-slate-900 mb-2">Verification Under Process</h2>
            <p className="text-slate-500 max-w-md">Our team is reviewing your profile. Once approved, you can activate your account and start receiving leads.</p>
          </div>
        )}

        {dbUser?.status === 'approved' && !dbUser?.isPaid && (
          <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm">
                <CreditCard size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Activate Your Account</h2>
                <p className="text-slate-500">Your profile is approved! Pay the one-time fee to unlock your dashboard and services.</p>
              </div>
            </div>
            <button onClick={handlePayment} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
              Pay Now & Get Leads
            </button>
          </div>
        )}

        {dbUser?.status === 'rejected' && (
          <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] mb-12 flex flex-col items-center text-center">
            <Ban size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">Profile Rejected</h2>
            <p className="text-slate-500 max-w-md">Your profile did not meet our requirements. Contact support for more details.</p>
          </div>
        )}

        {/* Dashboard Content - Unlocked only if Paid & Approved */}
        {dbUser?.status === 'approved' && dbUser?.isPaid && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard title="Active Gigs" value={activeGigsCount.toString().padStart(2, '0')} trend="Live" icon={<Briefcase size={20} />} />
              <StatCard title="Total Earnings" value="₹0" trend="Wallet" icon={<TrendingUp size={20} />} />
              <StatCard title="Total Reviews" value={stats.totalReviews} trend="Feedback" icon={<Users size={20} />} />
              <StatCard title="Avg. Rating" value={stats.avgRating} trend="Rating" icon={<Star size={20} className="fill-amber-400 text-amber-400" />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-6">Recent Feedback</h3>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.slice(0, 4).map((rev) => (
                      <div key={rev._id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs uppercase">{rev.reviewerName?.charAt(0)}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-800">{rev.reviewerName}</h4>
                          <p className="text-xs text-slate-500 italic">"{rev.comment}"</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-10 italic">No reviews yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden h-fit">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Account Status</p>
                 <p className="text-2xl font-black flex items-center gap-2">
                    Premium Expert <CheckCircle2 size={22} className="text-indigo-400"/>
                 </p>
                 <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>Visibility</span>
                      <span className="text-indigo-400">High</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-full"></div>
                    </div>
                 </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="bg-white p-6 rounded-[1.8rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-100">{icon}</div>
        <div className="text-[10px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg uppercase">{trend}</div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
}