"use client";
import React, { useEffect, useState } from "react";
import { Users, Briefcase, FileText, IndianRupee, Store, Building2, Settings2, ArrowRight, TrendingUp, MapPin, Factory, GraduationCap, CreditCard, BarChart3, CalendarDays, Target, Zap } from "lucide-react";
import {
  BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#d946ef'];
const GRADIENT_COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'];

export default function AdminDashboard() {
  const [data, setData] = useState({
    summary: { users: 0, recruiters: 0, serviceProviders: 0, jobs: 0, applications: 0, revenue: 0, serviceRequests: 0 },
    charts: { growth: [], jobDistribution: [], appDistribution: [], revenueTrend: [], revenueByPurpose: [] },
    recentTransactions: [],
    recruitmentMetrics: { timeToHire: 18, placementSuccessRate: 78.4, costPerHire: 8500 },
    filterOptions: { professions: [], industries: [], locations: [] }
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ profession: "All", industry: "All", location: "All", dateFrom: "", dateTo: "" });

  const fetchStats = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      else setRefreshing(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/admin/stats?${queryParams}`, { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchStats(false);
    }
  }, [filters]);

  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { summary, charts, recentTransactions } = data;

  const statCards = [
    { title: "Total Users", value: summary.users, icon: <Users size={24} />, color: "bg-blue-100 text-blue-600" },
    { title: "Recruiters", value: summary.recruiters, icon: <Building2 size={24} />, color: "bg-indigo-100 text-indigo-600" },
    { title: "Providers", value: summary.serviceProviders, icon: <Store size={24} />, color: "bg-purple-100 text-purple-600" },
    { title: "Jobs Posted", value: summary.jobs, icon: <Briefcase size={24} />, color: "bg-emerald-100 text-emerald-600" },
    { title: "Applications", value: summary.applications, icon: <FileText size={24} />, color: "bg-pink-100 text-pink-600" },
    { title: "Total Revenue", value: `₹${summary.revenue?.toLocaleString() || 0}`, icon: <IndianRupee size={24} />, color: "bg-amber-100 text-amber-600" },
    { title: "Service Req.", value: summary.serviceRequests, icon: <Settings2 size={24} />, color: "bg-rose-100 text-rose-600" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Overview of your entire system metrics and growth.</p>
        </div>
        {refreshing && (
          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse border border-indigo-100">
            Refreshing...
          </span>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Settings2 size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Filter Statistics</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Filter entire dashboard data dynamically</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full md:w-auto">
          {/* Profession Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profession</span>
            <select
              value={filters.profession}
              onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="All">All Professions</option>
              {data.filterOptions?.professions?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Industry Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</span>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="All">All Industries</option>
              {data.filterOptions?.industries?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</span>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="All">All Locations</option>
              {data.filterOptions?.locations?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* KPI / Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-[24px] text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-wider mb-1">Average Time to Hire</p>
            <h3 className="text-3xl font-black">{data.recruitmentMetrics?.timeToHire || 18} Days</h3>
            <p className="text-indigo-100 text-[10px] mt-2 font-medium">Days from posting job to successful onboarding</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <Briefcase size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-[24px] text-white shadow-lg shadow-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-wider mb-1">Placement Success Rate</p>
            <h3 className="text-3xl font-black">{data.recruitmentMetrics?.placementSuccessRate || 78.4}%</h3>
            <p className="text-emerald-100 text-[10px] mt-2 font-medium">Percentage of jobs successfully filled</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <Users size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-[24px] text-white shadow-lg shadow-amber-100 flex items-center justify-between">
          <div>
            <p className="text-amber-100 font-bold text-[10px] uppercase tracking-wider mb-1">Average Cost Per Hire</p>
            <h3 className="text-3xl font-black">₹{(data.recruitmentMetrics?.costPerHire || 8500).toLocaleString()}</h3>
            <p className="text-amber-100 text-[10px] mt-2 font-medium">Platform marketing expense divided by hires</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <IndianRupee size={28} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group">
            <div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">User & Recruiter Growth</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.growth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="users" name="Candidates" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="recruiters" name="Recruiters" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Revenue Trend (Last 30 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                <Line type="monotone" dataKey="amount" name="Revenue (₹)" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Status Distribution */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Job Statuses</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.jobDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {charts.jobDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Application Statuses</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.appDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {charts.appDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900">Recent Transactions</h2>
            <a href="/admin/digital-wallet" className="text-indigo-600 font-bold text-sm flex items-center hover:underline">View All <ArrowRight size={16} className="ml-1" /></a>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((txn, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                        {txn.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{txn.user}</p>
                        <p className="text-xs text-slate-500 font-medium">{txn.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600">+₹{txn.amount}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 font-medium py-10">No recent transactions</div>
            )}
          </div>
        </div>
      </div>

      {/* Jobs by Profession / Industry / Location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jobs by Profession */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-50 rounded-xl"><GraduationCap size={18} className="text-violet-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Jobs by Profession</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(charts.jobsByProfession || []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} width={100} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" name="Jobs" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Industry */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-cyan-50 rounded-xl"><Factory size={18} className="text-cyan-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Jobs by Industry</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(charts.industrialJobs || []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} width={100} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" name="Jobs" fill="#06b6d4" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Location */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-rose-50 rounded-xl"><MapPin size={18} className="text-rose-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Jobs by Location</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(charts.locationJobs || []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} width={100} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" name="Jobs" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue by Purpose + Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-50 rounded-xl"><CreditCard size={18} className="text-amber-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Revenue by Purpose</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.revenueByPurpose || []} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {(charts.revenueByPurpose || []).map((entry, index) => (
                    <Cell key={`rev-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 rounded-xl"><BarChart3 size={18} className="text-emerald-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Financial Overview</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1">Net Profit</p>
              <p className="text-xl font-black text-emerald-700">₹{(data.financialPayroll?.netProfit || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">Payroll</p>
              <p className="text-xl font-black text-blue-700">₹{(data.financialPayroll?.payrollExpense || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">Operations</p>
              <p className="text-xl font-black text-rose-700">₹{(data.financialPayroll?.operationalCost || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.financialPayroll?.monthlyPayrollTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="amount" name="Payroll" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-teal-50 rounded-xl"><Zap size={18} className="text-teal-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Subscriptions</h2>
          </div>
          <div className="space-y-4 mb-5">
            <div className="flex justify-between items-center p-3.5 bg-emerald-50 rounded-xl">
              <span className="text-xs font-bold text-emerald-700">Active Renewals</span>
              <span className="text-lg font-black text-emerald-600">{data.subscriptionStatusMetrics?.renewals || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-rose-50 rounded-xl">
              <span className="text-xs font-bold text-rose-700">Lost / Expired</span>
              <span className="text-lg font-black text-rose-600">{data.subscriptionStatusMetrics?.lost || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-amber-50 rounded-xl">
              <span className="text-xs font-bold text-amber-700">Near Renewal (15 days)</span>
              <span className="text-lg font-black text-amber-600">{data.subscriptionStatusMetrics?.nearRenewals || 0}</span>
            </div>
          </div>
          {(data.subscriptionStatusMetrics?.nearRenewalList || []).length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Upcoming Renewals</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.subscriptionStatusMetrics.nearRenewalList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.type} • {item.plan}</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-600">{item.expiry ? new Date(item.expiry).toLocaleDateString() : 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Market Demand + Data Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-xl"><TrendingUp size={18} className="text-indigo-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Job Market Demand</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.predictiveAI?.jobMarketDemand || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" name="Demand Score" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-slate-100 rounded-xl"><Target size={18} className="text-slate-600" /></div>
            <h2 className="text-lg font-black text-slate-900">Filtered Data Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 pr-4">Category</th>
                  <th className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 pr-4">Count</th>
                  <th className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { cat: 'Total Users', count: summary.users },
                  { cat: 'Recruiters', count: summary.recruiters },
                  { cat: 'Service Providers', count: summary.serviceProviders },
                  { cat: 'Active Jobs', count: summary.jobs },
                  { cat: 'Applications', count: summary.applications },
                  { cat: 'Service Requests', count: summary.serviceRequests },
                ].map((row, i) => {
                  const totalPeople = summary.users + summary.recruiters + summary.serviceProviders;
                  const pct = totalPeople > 0 && i < 3 ? ((row.count / totalPeople) * 100).toFixed(1) : '100';
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 text-xs font-bold text-slate-800">{row.cat}</td>
                      <td className="py-3 pr-4 text-sm font-black text-slate-900">{row.count.toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, parseFloat(pct))}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.recruitmentMetrics?.sourceOfHire && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Source of Hire</p>
              <div className="space-y-2">
                {data.recruitmentMetrics.sourceOfHire.map((src, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">{src.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${src.value}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{src.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
