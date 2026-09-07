"use client";
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Users, Briefcase, FileText, TrendingUp, DollarSign,
  UserCheck, ShieldCheck, Download, Calendar, RefreshCcw,
  ArrowUpRight, ArrowDownRight, Activity, Brain, Clock, Percent, Sparkles, Coins, Heart, UserPlus, Users2,
  CheckCircle2, XCircle, Target, MessageSquare, Send
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const DIVERSITY_COLORS = ['#3b82f6', '#ec4899', '#94a3b8'];

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("Last 6 Months");
  const [activeTab, setActiveTab] = useState("overview"); // overview, recruitment, hr-diversity, ai-predictive

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcelOverview = () => {
    if (!stats) return;

    // Sheet 1: Overview Summary
    const summaryData = [
      { Metric: "Total Candidates", Value: stats.summary?.users || 0 },
      { Metric: "Active Jobs", Value: stats.summary?.jobs || 0 },
      { Metric: "Total Applications", Value: stats.summary?.applications || 0 },
      { Metric: "Total Revenue", Value: stats.summary?.revenue || 0 },
      { Metric: "Total Recruiters", Value: stats.summary?.recruiters || 0 },
      { Metric: "Total Service Providers", Value: stats.summary?.serviceProviders || 0 },
      { Metric: "Total Service Requests", Value: stats.summary?.serviceRequests || 0 }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    // Sheet 2: AI Telemetry
    const aiTelemetryData = [
      { "AI Feature": "AI Tutor Queries", "Usage Volume": stats.aiToolAnalytics?.tutorUsage || 0 },
      { "AI Feature": "Mock Interview Runs", "Usage Volume": stats.aiToolAnalytics?.mockInterviewUsage || 0 },
      { "AI Feature": "Resume Review Scans", "Usage Volume": stats.aiToolAnalytics?.resumeReviewUsage || 0 },
      { "AI Feature": "Hiring Poster Gen", "Usage Volume": stats.aiToolAnalytics?.posterUsage || 0 },
      { "AI Feature": "AI Candidate Scorer", "Usage Volume": stats.aiToolAnalytics?.candidateScorerUsage || 0 },
      { "AI Feature": "AI JD Generator", "Usage Volume": stats.aiToolAnalytics?.jdGeneratorUsage || 0 },
      { "AI Feature": "Interview Q&A", "Usage Volume": stats.aiToolAnalytics?.interviewQaUsage || 0 },
      { "AI Feature": "Smart Outreach", "Usage Volume": stats.aiToolAnalytics?.smartOutreachUsage || 0 },
      { "AI Feature": "AI Headshot Generator", "Usage Volume": stats.aiToolAnalytics?.headshotUsage || 0 }
    ];
    const wsAI = XLSX.utils.json_to_sheet(aiTelemetryData);

    // Sheet 3: User AI Patterns
    const wsPatterns = XLSX.utils.json_to_sheet(
      (stats.aiToolAnalytics?.userPatterns || []).map((pat) => ({
        "Candidate Name": pat.name,
        "Email": pat.email,
        "AI Tutor Messages": pat.tutorChats,
        "Mock Interviews": pat.mockInterviews,
        "Resumes Tailored": pat.resumesTailored
      }))
    );

    // Sheet 4: Subscriptions Health
    const subHealthData = [
      { Segment: "Active / Renewed Subscriptions", Count: stats.subscriptionStatusMetrics?.renewals || 0 },
      { Segment: "Lost / Expired Subscriptions", Count: stats.subscriptionStatusMetrics?.lost || 0 },
      { Segment: "Near Renewals (Expires in 15 days)", Count: stats.subscriptionStatusMetrics?.nearRenewals || 0 }
    ];
    const wsSubHealth = XLSX.utils.json_to_sheet(subHealthData);

    // Sheet 5: Near Renewals List
    const wsNearList = XLSX.utils.json_to_sheet(
      (stats.subscriptionStatusMetrics?.nearRenewalList || []).map((item) => ({
        "Subscriber Name": item.name,
        "Email": item.email,
        "Business Name": item.business,
        "Type": item.type,
        "Plan Title": item.plan,
        "Expiry Date": new Date(item.expiry).toLocaleDateString()
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary Overview");
    XLSX.utils.book_append_sheet(wb, wsAI, "AI Features Telemetry");
    XLSX.utils.book_append_sheet(wb, wsPatterns, "Candidate AI Patterns");
    XLSX.utils.book_append_sheet(wb, wsSubHealth, "Subscription Health");
    XLSX.utils.book_append_sheet(wb, wsNearList, "Accounts Near Renewal");

    XLSX.writeFile(wb, `Platform_Intelligence_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Generating Platform Intelligence...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { label: "Total Candidates", value: stats?.summary?.users, icon: <Users size={24} />, color: "bg-indigo-50 text-indigo-600", trend: "+12%" },
    { label: "Active Jobs", value: stats?.summary?.jobs, icon: <Briefcase size={24} />, color: "bg-emerald-50 text-emerald-600", trend: "+5%" },
    { label: "Applications", value: stats?.summary?.applications, icon: <FileText size={24} />, color: "bg-amber-50 text-amber-600", trend: "+18%" },
    { label: "Total Revenue", value: `₹${stats?.summary?.revenue?.toLocaleString()}`, icon: <DollarSign size={24} />, color: "bg-rose-50 text-rose-600", trend: "+24%" },
  ];

  const secondaryStats = [
    { label: "Recruiters", value: stats?.summary?.recruiters, icon: <ShieldCheck size={20} /> },
    { label: "Service Providers", value: stats?.summary?.serviceProviders, icon: <UserCheck size={20} /> },
    { label: "Service Requests", value: stats?.summary?.serviceRequests, icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Analytics & Reports</h1>
            <p className="text-slate-500 font-medium italic">Monitor platform growth, financial payrolls, HR engagement, and AI predictive insights.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1">
              {["Last 30 Days", "Last 6 Months", "Yearly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${timeframe === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={fetchStats} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <RefreshCcw size={20} />
            </button>
            <button 
              onClick={handleDownloadExcelOverview}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
            >
              <Download size={18} /> Export Excel
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-[24px] border border-slate-200 w-fit">
          {[
            { id: "overview", label: "Overview & Finances", icon: <DollarSign size={16} /> },
            { id: "recruitment", label: "Recruitment & Partners", icon: <UserPlus size={16} /> },
            //{ id: "hr-diversity", label: "HR & Diversity", icon: <Users2 size={16} /> },
            { id: "ai-predictive", label: "AI & Predictive Analytics", icon: <Brain size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & FINANCES */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {summaryCards.map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 font-black text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                      <ArrowUpRight size={14} /> {card.trend}
                    </div>
                  </div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{card.label}</h3>
                  <p className="text-3xl font-black text-slate-900">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Financial Stream Details */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Revenue Stream Line Chart */}
              <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Revenue Stream</h3>
                    <p className="text-slate-400 text-sm font-medium">Daily income trends for the last 30 days</p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <DollarSign size={24} />
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.charts?.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Income Source Pie Chart */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2">Income Source</h3>
                <p className="text-slate-400 text-sm font-medium mb-10">Revenue split by service type</p>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.charts?.revenueByPurpose}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.charts?.revenueByPurpose?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-2">
                  {stats?.charts?.revenueByPurpose?.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-slate-500 font-bold uppercase truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial P&L and Payroll Reports */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Payroll & Financial Overview */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-slate-900">Payroll & Financial Balance</h3>
                <p className="text-slate-400 text-sm font-medium">Profit & Loss summary including payrolls</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Gross Revenue</span>
                      <h4 className="text-xl font-black text-emerald-600">₹{stats?.summary?.revenue?.toLocaleString()}</h4>
                    </div>
                    <ArrowUpRight size={24} className="text-emerald-500" />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Payroll Expenses</span>
                      <h4 className="text-xl font-black text-rose-600">₹{stats?.financialPayroll?.payrollExpense?.toLocaleString()}</h4>
                    </div>
                    <ArrowDownRight size={24} className="text-rose-500" />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Operational Costs</span>
                      <h4 className="text-xl font-black text-rose-600">₹{stats?.financialPayroll?.operationalCost?.toLocaleString()}</h4>
                    </div>
                    <ArrowDownRight size={24} className="text-rose-500" />
                  </div>

                  <div className={`flex justify-between items-center p-4 rounded-2xl border ${stats?.financialPayroll?.netProfit >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'}`}>
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase">Net Balance (P&L)</span>
                      <h4 className={`text-xl font-black ${stats?.financialPayroll?.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        ₹{stats?.financialPayroll?.netProfit?.toLocaleString()}
                      </h4>
                    </div>
                    <Coins size={24} className="text-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Monthly Payroll Trend Bar Chart */}
              <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2">Monthly Payroll Trends</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Expenditures on salaries and contractors</p>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.financialPayroll?.monthlyPayrollTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Subscription Renewals, Lost & Near Renewals Section */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Subscription Health & Renewals</h3>
                <p className="text-slate-400 text-sm font-medium">Track renewals, lost (expired) memberships, and accounts near expiry (next 15 days)</p>
              </div>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Active / Renewed</span>
                    <h4 className="text-3xl font-black text-emerald-700">{stats?.subscriptionStatusMetrics?.renewals || 0}</h4>
                  </div>
                  <div className="p-3.5 bg-emerald-500 text-white rounded-2xl">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block mb-1">Lost / Expired</span>
                    <h4 className="text-3xl font-black text-rose-700">{stats?.subscriptionStatusMetrics?.lost || 0}</h4>
                  </div>
                  <div className="p-3.5 bg-rose-500 text-white rounded-2xl">
                    <XCircle size={20} />
                  </div>
                </div>

                <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-1">Near Renewals (15 days)</span>
                    <h4 className="text-3xl font-black text-amber-700">{stats?.subscriptionStatusMetrics?.nearRenewals || 0}</h4>
                  </div>
                  <div className="p-3.5 bg-amber-500 text-white rounded-2xl">
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              {/* Near Renewals List Table */}
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Accounts Near Renewal</h4>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-4 text-[10px] font-black uppercase text-slate-400">Subscriber Name</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-400">Business / Entity</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-400">Type</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-400">Plan</th>
                        <th className="p-4 text-[10px] font-black uppercase text-slate-400">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {stats?.subscriptionStatusMetrics?.nearRenewalList && stats.subscriptionStatusMetrics.nearRenewalList.length > 0 ? (
                        stats.subscriptionStatusMetrics.nearRenewalList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-slate-400 text-[10px]">{item.email}</div>
                            </td>
                            <td className="p-4 font-bold text-slate-700">{item.business}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${item.type === 'Recruiter' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-slate-600">{item.plan}</td>
                            <td className="p-4 font-black text-amber-600">
                              {new Date(item.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-400 font-bold">No accounts near renewal in the next 15 days.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Recent Successful Payments</h3>
                  <p className="text-slate-400 text-sm font-medium">Latest incoming transactions verified on the platform</p>
                </div>
                <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">View All History</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User / Entity</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Purpose</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats?.recentTransactions?.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{tx.user}</span>
                            <span className="text-xs text-slate-400">{tx.email}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                            {tx.purpose}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-sm font-black text-emerald-600">₹{tx.amount.toLocaleString()}</span>
                        </td>
                        <td className="p-6">
                          <span className="text-xs font-bold text-slate-500">
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Success
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECRUITMENT & PARTNERS */}
        {activeTab === "recruitment" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Recruitment Intelligence Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Clock size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Average Time-to-Hire</span>
                  <h4 className="text-3xl font-black text-slate-800">{stats?.recruitmentMetrics?.timeToHire} Days</h4>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Coins size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Cost per Hire</span>
                  <h4 className="text-3xl font-black text-slate-800">₹{stats?.recruitmentMetrics?.costPerHire?.toLocaleString()}</h4>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
                  <Percent size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Placement Success Rate</span>
                  <h4 className="text-3xl font-black text-slate-800">{stats?.recruitmentMetrics?.placementSuccessRate}%</h4>
                </div>
              </div>
            </div>

            {/* Sources & Job distributions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Source of Hire */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2">Sources of Hire</h3>
                <p className="text-slate-400 text-sm font-medium mb-10">Where placements are originating from</p>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.recruitmentMetrics?.sourceOfHire}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.recruitmentMetrics?.sourceOfHire?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-2">
                  {stats?.recruitmentMetrics?.sourceOfHire?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-slate-500 font-bold uppercase truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Distribution Pie */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-slate-900 mb-2">Job Distribution</h3>
                <p className="text-slate-400 text-sm font-medium mb-10">Breakdown of jobs by current status</p>

                <div className="flex-grow min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.charts?.jobDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {stats?.charts?.jobDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-4">
                  {stats?.charts?.jobDistribution?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Status Bar Chart */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2">Application Analytics</h3>
                <p className="text-slate-400 text-sm font-medium mb-10">Success rates and status breakdown of job applications</p>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.charts?.appDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Jobs Classification Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Jobs by Profession */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-slate-900 mb-2">Jobs by Profession</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Volume distribution across occupational roles</p>
                <div className="h-[250px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.charts?.jobsByProfession}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Industrial Jobs */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-slate-900 mb-2">Industrial Jobs</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Corporate volume distribution across sectors</p>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.charts?.industrialJobs}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.charts?.industrialJobs?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-1.5 overflow-y-auto max-h-20 custom-scrollbar pr-1">
                  {stats?.charts?.industrialJobs?.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase truncate max-w-[150px]">{item.name}</span>
                      <span className="font-black text-slate-900">{item.value} Jobs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs by Location */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-slate-900 mb-2">Jobs by Location</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Geographical volume distribution across cities</p>
                <div className="h-[250px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.charts?.locationJobs}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Growth Area Chart */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Platform Growth</h3>
                  <p className="text-slate-400 text-sm font-medium">Monthly registration trends for candidates and recruiters</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="text-[10px] font-black uppercase text-slate-400">Users</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Recruiters</span></div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.charts?.growth}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRecruiters" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="recruiters" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRecruiters)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recruiter and Service Provider Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {secondaryStats.map((item, i) => (
                <div key={i} className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col justify-between group hover:bg-indigo-600 transition-all duration-500">
                  <div className="p-3 bg-white/10 rounded-xl self-start group-hover:bg-white/20 transition-all">
                    {item.icon}
                  </div>
                  <div className="mt-8">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    <h4 className="text-4xl font-black">{item.value}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HR & DIVERSITY */}
        {activeTab === "hr-diversity" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* HR Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Percent size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Staff Retention Rate</span>
                  <h4 className="text-3xl font-black text-slate-800">{stats?.hrDiversity?.retentionRate}%</h4>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-600">
                  <Heart size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Employee Engagement Index</span>
                  <h4 className="text-3xl font-black text-slate-800">{stats?.hrDiversity?.employeeEngagement} / 5.0</h4>
                </div>
              </div>
            </div>

            {/* D&I Breakdown Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* D&I Pie Chart */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2">Diversity & Inclusion (D&I)</h3>
                <p className="text-slate-400 text-sm font-medium mb-10">Gender distribution of registered partners & staff</p>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.hrDiversity?.diversityStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.hrDiversity?.diversityStats?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DIVERSITY_COLORS[index % DIVERSITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-2">
                  {stats?.hrDiversity?.diversityStats?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DIVERSITY_COLORS[i % DIVERSITY_COLORS.length] }}></div>
                        <span className="text-slate-500 font-bold uppercase truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Engagement Feedback Box */}
              <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Internal Engagement Analysis</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6">Key satisfaction highlights from workforce engagement surveys</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                      <h4 className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-2">Work-Life Balance</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        84% of surveyed members feel satisfied with remote options and flexibility.
                      </p>
                    </div>

                    <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                      <h4 className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-2">Growth & Learning</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        76% feel the corporate training programs and certifications have advanced their career outcomes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-900 text-white rounded-3xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Engagement Reports Ready</h4>
                    <p className="text-xs text-slate-400 mt-1">Download monthly qualitative sentiment reports.</p>
                  </div>
                  <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI & PREDICTIVE ANALYTICS */}
        {activeTab === "ai-predictive" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* AI Features Telemetry - Top Level */}
            {(() => {
                const tutorUsageVal = stats?.aiToolAnalytics?.tutorUsage || 0;
                const mockInterviewUsageVal = stats?.aiToolAnalytics?.mockInterviewUsage || 0;
                const resumeReviewUsageVal = stats?.aiToolAnalytics?.resumeReviewUsage || 0;
                const posterUsageVal = stats?.aiToolAnalytics?.posterUsage || 0;
                const candidateScorerVal = stats?.aiToolAnalytics?.candidateScorerUsage || 0;
                const jdGeneratorVal = stats?.aiToolAnalytics?.jdGeneratorUsage || 0;
                const interviewQaVal = stats?.aiToolAnalytics?.interviewQaUsage || 0;
                const smartOutreachVal = stats?.aiToolAnalytics?.smartOutreachUsage || 0;
                const headshotVal = stats?.aiToolAnalytics?.headshotUsage || 0;
                const resumeTailorVal = stats?.aiToolAnalytics?.resumeTailorUsage || 0;
                const coverLetterVal = stats?.aiToolAnalytics?.coverLetterUsage || 0;
                const learningPathVal = stats?.aiToolAnalytics?.learningPathUsage || 0;
                const skillGapVal = stats?.aiToolAnalytics?.skillGapUsage || 0;
                const jobFeedVal = stats?.aiToolAnalytics?.jobFeedUsage || 0;
                const autoApplyVal = stats?.aiToolAnalytics?.autoApplyUsage || 0;
                const fakeJobVal = stats?.aiToolAnalytics?.fakeJobUsage || 0;
                const salaryBenchVal = stats?.aiToolAnalytics?.salaryBenchUsage || 0;
                const behavioralVal = stats?.aiToolAnalytics?.behavioralUsage || 0;
                const networkingVal = stats?.aiToolAnalytics?.networkingUsage || 0;
                const workStyleVal = stats?.aiToolAnalytics?.workStyleUsage || 0;
                const companyInsightsVal = stats?.aiToolAnalytics?.companyInsightsUsage || 0;
                const assessmentsVal = stats?.aiToolAnalytics?.assessmentsUsage || 0;
                const industryTrendsVal = stats?.aiToolAnalytics?.industryTrendsUsage || 0;

                const featuresList = [
                  { name: "AI Tutor Queries", value: tutorUsageVal, icon: <Brain size={18} className="text-indigo-600" /> },
                  { name: "Mock Interview Runs", value: mockInterviewUsageVal, icon: <Sparkles size={18} className="text-emerald-600" /> },
                  { name: "Resume Review Scans", value: resumeReviewUsageVal, icon: <FileText size={18} className="text-amber-600" /> },
                  { name: "Hiring Poster Gen", value: posterUsageVal, icon: <TrendingUp size={18} className="text-rose-600" /> },
                  { name: "AI Candidate Scorer", value: candidateScorerVal, icon: <Target size={18} className="text-indigo-500" /> },
                  { name: "AI JD Generator", value: jdGeneratorVal, icon: <FileText size={18} className="text-emerald-500" /> },
                  { name: "Interview Q&A", value: interviewQaVal, icon: <MessageSquare size={18} className="text-amber-500" /> },
                  { name: "Smart Outreach", value: smartOutreachVal, icon: <Send size={18} className="text-blue-500" /> },
                  { name: "AI Headshot Generator", value: headshotVal, icon: <Users size={18} className="text-purple-600" /> },
                  { name: "AI Resume Tailor", value: resumeTailorVal, icon: <Sparkles size={18} className="text-indigo-600" /> },
                  { name: "AI Cover Letter Gen", value: coverLetterVal, icon: <FileText size={18} className="text-emerald-600" /> },
                  { name: "AI Learning Path", value: learningPathVal, icon: <TrendingUp size={18} className="text-rose-600" /> },
                  { name: "AI Skill Gap Analysis", value: skillGapVal, icon: <Target size={18} className="text-amber-600" /> },
                  { name: "AI Job Feed", value: jobFeedVal, icon: <Activity size={18} className="text-indigo-600" /> },
                  { name: "Smart Recommendation (Auto Apply)", value: autoApplyVal, icon: <UserCheck size={18} className="text-emerald-600" /> },
                  { name: "Fake Job Checker", value: fakeJobVal, icon: <ShieldCheck size={18} className="text-rose-600" /> },
                  { name: "Salary Benchmarking", value: salaryBenchVal, icon: <DollarSign size={18} className="text-amber-600" /> },
                  { name: "Behavioral Coaching", value: behavioralVal, icon: <Users size={18} className="text-indigo-600" /> },
                  { name: "Networking Suggestions", value: networkingVal, icon: <Users2 size={18} className="text-blue-600" /> },
                  { name: "Work Style Fit", value: workStyleVal, icon: <Activity size={18} className="text-emerald-600" /> },
                  { name: "Company Insights", value: companyInsightsVal, icon: <Briefcase size={18} className="text-indigo-600" /> },
                  { name: "Assessments & Test", value: assessmentsVal, icon: <CheckCircle2 size={18} className="text-emerald-600" /> },
                  { name: "Industry Trends", value: industryTrendsVal, icon: <TrendingUp size={18} className="text-amber-600" /> }
                ];

               const sortedFeatures = [...featuresList].sort((a, b) => b.value - a.value);
               const mostUsed = sortedFeatures[0];
               const leastUsed = sortedFeatures[sortedFeatures.length - 1];

               return (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Usage telemetry list */}
                   <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
                     <div>
                       <div className="flex justify-between items-center mb-6">
                         <div>
                           <h3 className="text-xl font-black text-slate-900">AI Features Usage & Telemetry</h3>
                           <p className="text-slate-400 text-sm font-medium">Platform-wide prompt and execution metrics by AI agent capability</p>
                         </div>
                       </div>

                       <div className="overflow-x-auto border border-slate-100 rounded-3xl mt-4 max-h-[480px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                              <th className="p-4 border-b border-slate-100">Rank</th>
                              <th className="p-4 border-b border-slate-100">AI Feature</th>
                              <th className="p-4 border-b border-slate-100 text-center">Usage Volume</th>
                              <th className="p-4 border-b border-slate-100 text-right">Telemetry Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-xs">
                            {sortedFeatures.map((f, idx) => {
                              const isMost = f.name === mostUsed.name;
                              const isLeast = f.name === leastUsed.name;
                              return (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 align-middle">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[10px]">
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="p-4 align-middle">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-slate-50 rounded-xl">
                                        {f.icon}
                                      </div>
                                      <span className="font-bold text-slate-800 uppercase text-[11px]">{f.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-center align-middle font-black text-slate-900 text-sm">
                                    {f.value.toLocaleString()}
                                  </td>
                                  <td className="p-4 text-right align-middle">
                                    {isMost && (
                                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                        🔥 Most Used
                                      </span>
                                    )}
                                    {isLeast && (
                                      <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-rose-100">
                                        🧊 Least Used
                                      </span>
                                    )}
                                    {!isMost && !isLeast && (
                                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                        Active
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold uppercase">🔥 Leader:</span>
                        <span className="font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">{mostUsed?.name} ({mostUsed?.value.toLocaleString()} times)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold uppercase">🧊 Coldest:</span>
                        <span className="font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-md">{leastUsed?.name} ({leastUsed?.value.toLocaleString()} times)</span>
                      </div>
                    </div>
                  </div>

                  {/* Effectiveness / Cost overview */}
                  <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div>
                      <h3 className="text-lg font-black mb-2 flex items-center gap-2 relative z-10">
                        <Sparkles className="text-indigo-400" size={20} />
                        AI Agent Efficiency
                      </h3>
                      <p className="text-slate-400 text-xs font-medium mb-6 relative z-10">Rating metrics and prompt operating costs</p>

                      <div className="space-y-4 relative z-10">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Average Accuracy rating</span>
                            <span className="text-2xl font-black text-white">{stats?.aiToolAnalytics?.effectivenessRating || 92}%</span>
                          </div>
                          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-black">
                            HIGH
                          </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Estimated Cost per Prompt</span>
                            <span className="text-2xl font-black text-white">₹{stats?.aiToolAnalytics?.costPerPrompt || 0.12}</span>
                          </div>
                          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black">
                            OPTIMAL
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-white/5 rounded-2xl text-[10px] text-slate-400 relative z-10 font-bold uppercase tracking-wider text-center border border-white/5">
                      Updated in Real-Time via AI Telemetry Logs
                    </div>
                  </div>
                </div>
              );
            })()}







          </div>
        )}

      </div>
    </div>
  );
}
