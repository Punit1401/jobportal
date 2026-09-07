"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Serviceprovidersidbar";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";
import PartnerOnboarding from "@/components/PartnerOnboarding";
import { ACCESS_STAGES } from "@/lib/partnerAccess";

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [access, setAccess] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activeGigsCount, setActiveGigsCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const statusRes = await fetch("/api/partner/status", { cache: "no-store" });
      const statusData = await statusRes.json();

      if (statusData.success) {
        setAccess(statusData.access);
        setPlans(statusData.plans || []);

        if (statusData.access?.canUseSystem) {
          const [serviceRes, reviewRes] = await Promise.all([
            fetch("/api/serviceprovider/serviceform", { cache: "no-store" }),
            fetch(`/api/reviews?targetId=${session.user.email}&reviewType=service`, { cache: "no-store" }),
          ]);
          const serviceData = await serviceRes.json();
          const reviewData = await reviewRes.json();

          if (serviceRes.ok && serviceData.services) {
            setActiveGigsCount(serviceData.services.length);
          }
          if (reviewData.success && reviewData.reviews?.length > 0) {
            setReviews(reviewData.reviews);
            const avg =
              reviewData.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              reviewData.reviews.length;
            setStats({ avgRating: avg.toFixed(1), totalReviews: reviewData.reviews.length });
          } else {
            setReviews([]);
            setStats({ avgRating: 0, totalReviews: 0 });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") load();
    else if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, session?.user?.email]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFEFF]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const verified = access?.stage === ACCESS_STAGES.ACTIVE;
  const needsPlan =
    access?.stage === ACCESS_STAGES.NEED_SUBSCRIPTION ||
    access?.stage === ACCESS_STAGES.SUBSCRIPTION_EXPIRED;

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex flex-col lg:flex-row">
      <Sidebar activePage="dashboard" />

      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 w-full overflow-x-hidden">
        <header className="mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, <span className="text-indigo-600">{session?.user?.name?.split(" ")[0]}</span>! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            {verified ? (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                <CheckCircle2 size={10} /> Active — Plan Enabled
              </div>
            ) : needsPlan ? (
              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                <CheckCircle2 size={10} /> Verified — Choose Plan
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-100 uppercase">
                <Clock size={10} /> Setup Pending
              </div>
            )}
          </div>
        </header>

        <PartnerOnboarding access={access} role="serviceprovider" plans={plans} onRefresh={load} />

        {verified && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard title="Active Services" value={activeGigsCount.toString().padStart(2, "0")} />
              <StatCard title="Total Reviews" value={stats.totalReviews} />
              <StatCard title="Avg. Rating" value={stats.avgRating} />
              <StatCard title="Status" value="Live" />
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6">Recent Feedback</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 4).map((rev) => (
                    <div key={rev._id} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                        {rev.reviewerName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black">{rev.reviewerName}</h4>
                        <p className="text-xs text-slate-500 italic">&quot;{rev.comment}&quot;</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-10 italic">No reviews yet.</p>
              )}
            </div>
          </>
        )}

        <div className="mt-20 pb-20">
          <FeedbackForm />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-[1.8rem] border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
}
