"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { CheckCircle, Clock, AlertTriangle, Shield, TrendingUp, Users, Briefcase, Star } from 'lucide-react';

export default function MyStatusPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviews: 0,
    profileCompletion: 0,
    hiringEfficiency: 0,
    responseRate: 0
  });
  const [recruiter, setRecruiter] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/recruiter/status');
        const data = await res.json();
        if (data.ok) {
          setStats(data.stats);
          setRecruiter(data.recruiter);
          setRecentActivity(data.recentActivity);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <RecruiterSidebar activePage="status" />

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <header>
            <h1 className="text-3xl font-black text-slate-900">My Status</h1>
            <p className="text-slate-500 font-medium mt-1">Monitor your account performance and recruitment health.</p>
          </header>

          {/* Verification Status Card */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <Shield size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  Verified Recruiter
                  <CheckCircle size={20} className="text-indigo-600" />
                </h3>
                <p className="text-slate-500 font-medium">Your account is in good standing and fully verified.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm">Active</div>
              <div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold text-sm">Premium Member</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Active Jobs", value: stats.activeJobs, icon: <Briefcase className="text-blue-600" />, bg: "bg-blue-50" },
              { label: "Total Applicants", value: stats.totalApplicants, icon: <Users className="text-indigo-600" />, bg: "bg-indigo-50" },
              { label: "Shortlisted", value: stats.shortlisted, icon: <CheckCircle className="text-emerald-600" />, bg: "bg-emerald-50" },
              { label: "Interviews", value: stats.interviews, icon: <Star className="text-amber-600" />, bg: "bg-amber-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Detailed Status Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Recent Activity */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">New application received</h4>
                      <p className="text-xs text-slate-400 mb-1">{new Date(item.appliedAt || item.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.jobTitle || "Unknown Position"}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-400 font-bold">No recent activity.</div>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-6">Performance Insights</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold">Profile Completion</span>
                      <span className="text-indigo-400">{stats.profileCompletion || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${stats.profileCompletion || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold">Hiring Efficiency</span>
                      <span className="text-emerald-400">{stats.hiringEfficiency || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${stats.hiringEfficiency || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold">Response Rate</span>
                      <span className="text-amber-400">{stats.responseRate || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${stats.responseRate || 0}%` }}></div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/recruiter/analytics"
                  className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all border border-white/10 flex items-center justify-center"
                >
                  View Detailed Report
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
