"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";
import PartnerOnboarding from "@/components/PartnerOnboarding";
import { ACCESS_STAGES } from "@/lib/partnerAccess";

export default function RecruiterDashboard() {
  const { data: session, status: authStatus } = useSession();
  const [access, setAccess] = useState(null);
  const [plans, setPlans] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentJobs: [],
  });
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
          const dashRes = await fetch("/api/recruiter/dashboard");
          const dashData = await dashRes.json();
          if (dashData.success) {
            setDashboardData({
              stats: [
                { label: "Active Jobs", value: dashData.stats?.jobsCount || 0, color: "bg-blue-50 text-blue-600" },
                { label: "Applications", value: dashData.stats?.appsCount || 0, color: "bg-indigo-50 text-indigo-600" },
                { label: "Pending", value: dashData.stats?.pendingCount || 0, color: "bg-amber-50 text-amber-600" },
                { label: "Hired", value: dashData.stats?.hiredCount || 0, color: "bg-emerald-50 text-emerald-600" },
              ],
              recentJobs: dashData.recentJobs || [],
            });
          }
        } else {
          setDashboardData({ stats: [], recentJobs: [] });
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
  }, [authStatus]);

  if (loading && authStatus === "authenticated") {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
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
      <RecruiterSidebar activePage="dashboard" />
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

        <PartnerOnboarding access={access} role="recruiter" plans={plans} onRefresh={load} />

        {verified && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {dashboardData.stats.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">
                    {String(item.value).padStart(2, "0")}
                  </h2>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6">Recent Job Postings</h3>
              {dashboardData.recentJobs.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.recentJobs.map((job) => (
                    <li
                      key={job._id}
                      className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl font-bold text-sm"
                    >
                      <span>{job.title || job.role}</span>
                      <span className="text-indigo-600">{job.applicationsCount || 0} apps</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic text-center py-8">No jobs posted yet.</p>
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
