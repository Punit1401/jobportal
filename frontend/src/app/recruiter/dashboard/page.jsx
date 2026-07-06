"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Loader2, Ban, Clock, CheckCircle2, Briefcase, Users, Calendar, Award, CreditCard, AlertCircle } from "lucide-react";

export default function RecruiterDashboard() {
  const { data: session, status: authStatus } = useSession();
  const [dbUser, setDbUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentJobs: [],
    interviews: []
  });
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // If already fetching or no session, return
      if (authStatus !== "authenticated" || !session?.user?.email) return;

      try {
        setLoading(true);

        // 1. Get Profile Data
        const statusRes = await fetch(`/api/admin/recruiters?email=${session.user.email}`,
          {
            cache: 'no-store'
          });

        const statusData = await statusRes.json();
        const recruiter = statusData.recruiter;
        setDbUser(recruiter);

        // ✅ બદલાવ: હવે પેમેન્ટ (isPaid) ચેક કર્યા વગર ડેટા ફેચ થશે
        if (recruiter?.isApproved /* && recruiter?.isPaid */) {
          const dashRes = await fetch(`/api/recruiter/dashboard`);
          const dashData = await dashRes.json();

          if (dashData.success) {
            setDashboardData({
              stats: [
                { label: "Active Jobs", value: dashData.stats?.jobsCount || 0, icon: <Briefcase size={20} />, color: "bg-blue-50 text-blue-600" },
                { label: "Total Applications", value: dashData.stats?.appsCount || 0, icon: <Users size={20} />, color: "bg-indigo-50 text-indigo-600" },
                { label: "Pending Review", value: dashData.stats?.pendingCount || 0, icon: <Clock size={20} />, color: "bg-amber-50 text-amber-600" },
                { label: "Hired", value: dashData.stats?.hiredCount || 0, icon: <Award size={20} />, color: "bg-emerald-50 text-emerald-600" },
              ],
              recentJobs: dashData.recentJobs || [],
              interviews: dashData.interviews || []
            });
          }
        }

        hasFetched.current = true;
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, authStatus]);

  if (loading && authStatus === "authenticated") {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  // 💳 Payment handler commented out
  /*
  const handlePayment = async () => {
    try {
      const amount = 500; 
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Order creation failed");
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.order.amount,
        currency: "INR",
        name: "Job Portal",
        description: "Recruiter Account Activation",
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Account Activated Successfully!");
            window.location.reload(); 
          } else {
            alert("Payment Verification Failed!");
          }
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: { color: "#4f46e5" },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with payment.");
    }
  };
  */

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex flex-col lg:flex-row">
      <RecruiterSidebar activePage="dashboard" />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 w-full overflow-x-hidden">

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Welcome, <span className="text-indigo-600">{session?.user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              {dbUser?.isApproved ? (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                  <CheckCircle2 size={10} /> Verified Recruiter
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-100 uppercase">
                  <Clock size={10} /> Verification Pending
                </div>
              )}
            </div>
          </div>
        </header>

        {!dbUser?.isApproved && !dbUser?.isRejected && (
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-[32px] mb-12 flex flex-col items-center text-center">
            <Clock size={48} className="text-amber-500 mb-4 animate-pulse" />
            <h2 className="text-xl font-black text-slate-900 mb-2">Verification Under Process</h2>
            <p className="text-slate-500 max-w-md">Your documents are currently being reviewed by the admin. Once approved, you can start posting jobs for free.</p>
          </div>
        )}

        {/* 💳 Payment Section Commented
        {dbUser?.isApproved && !dbUser?.isPaid && (
          <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm">
                <CreditCard size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Activate Your Account</h2>
                <p className="text-slate-500">Congratulations! Your profile is approved. Please complete the payment to activate your account and start hiring.</p>
              </div>
            </div>
            <button 
              onClick={handlePayment} 
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              Pay Now & Start Hiring
            </button>
          </div>
        )}
        */}

        {dbUser?.isRejected && (
          <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] mb-12 flex flex-col items-center text-center">
            <Ban size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">Profile Rejected</h2>
            <p className="text-slate-500 max-w-md">Your profile has been rejected by the admin. Please review your verification details and contact support if necessary.</p>
          </div>
        )}

        {/* ✅ બદલાવ: હવે ફક્ત isApproved હશે તો જ ડેશબોર્ડ દેખાશે (Paid હોવું જરૂરી નથી) */}
        {dbUser?.isApproved && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {dashboardData.stats.length > 0 ? (
                dashboardData.stats.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4`}>
                      {item.icon}
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1">
                      {item.value.toString().padStart(2, '0')}
                    </h2>
                  </div>
                ))
              ) : (
                // Fallback stats if data hasn't loaded properly
                [
                  { label: "Active Jobs", value: 0, icon: <Briefcase size={20} />, color: "bg-blue-50 text-blue-600" },
                  { label: "Total Applications", value: 0, icon: <Users size={20} />, color: "bg-indigo-50 text-indigo-600" },
                  { label: "Pending Review", value: 0, icon: <Clock size={20} />, color: "bg-amber-50 text-amber-600" },
                  { label: "Hired", value: 0, icon: <Award size={20} />, color: "bg-emerald-50 text-emerald-600" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all opacity-60">
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4`}>
                      {item.icon}
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1">00</h2>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800">Active Postings</h3>
                  <button onClick={() => window.location.href = '/recruiter/candidate'} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Applicants</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentJobs.length > 0 ? (
                        dashboardData.recentJobs.map((job, i) => (
                          <JobRow
                            key={job._id || i}
                            title={job.title || job.role}
                            apps={job.applicationsCount || 0}
                            status={job.status || 'active'}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-10 text-slate-400 font-medium italic">No jobs posted yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      {/* Script can remain or be commented if you don't want to load Razorpay at all */}
      {/* <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> */}
    </div>
  );
}

function JobRow({ title, apps, status }) {
  return (
    <tr className="group cursor-pointer hover:translate-x-1 transition-transform">
      <td className="px-4 py-5 bg-slate-50/50 group-hover:bg-slate-50 rounded-l-2xl font-bold text-slate-700 text-sm">{title}</td>
      <td className="px-4 py-5 bg-slate-50/50 group-hover:bg-slate-50 font-black text-indigo-600 text-sm">{apps}</td>
      <td className="px-4 py-5 bg-slate-50/50 group-hover:bg-slate-50 rounded-r-2xl">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}