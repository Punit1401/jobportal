"use client";
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Mail, Phone, Search, RotateCcw, Zap, Calendar, User, Building2,
  CheckCircle2, XCircle, Clock, Filter, CreditCard, ArrowRight,
  TrendingUp, AlertCircle, Briefcase, Users, Trash2
} from 'lucide-react';

export default function SubscriptionMonitoring() {
  const [activeTab, setActiveTab] = useState("recruiters");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Active, Expired, Free
  const [industryFilter, setIndustryFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");

  useEffect(() => {
    fetchSubscriptionData();
  }, [activeTab]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === "recruiters" ? "/api/admin/recruiters" : "/api/admin/serviceproviders";
      const res = await fetch(endpoint);
      const result = await res.json();
      
      let list = [];
      if (activeTab === "recruiters") {
        list = result.recruiters || [];
      } else {
        list = result.providers || [];
      }
      setData(list);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!confirm("Are you sure you want to delete this subscriber? This action cannot be undone.")) return;
    const endpoint = activeTab === "recruiters" ? `/api/admin/recruiters?id=${id}` : `/api/admin/serviceproviders?id=${id}`;
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        alert("Subscriber deleted successfully!");
        fetchSubscriptionData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete subscriber");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDownloadExcel = () => {
    const formattedData = filteredData.map((item, idx) => {
      const isPaid = activeTab === "recruiters" ? item.isPaid : (item.isPaid || !!item.subscription);
      const expiry = item.subscription?.expiryDate ? new Date(item.subscription.expiryDate) : null;
      const isActive = isPaid && expiry && expiry > new Date();
      const isExpired = isPaid && expiry && expiry <= new Date();
      
      const statusStr = isActive ? "ACTIVE" : (isExpired ? "EXPIRED" : "FREE");

      if (activeTab === "recruiters") {
        return {
          "Sr No": idx + 1,
          "Full Name": item.fullName || "-",
          "Email": item.email || "-",
          "Mobile": item.mobile || "-",
          "Company Name": item.companyName || "-",
          "Industry": item.industry || "-",
          "Plan Title": item.subscription?.planTitle || (item.isPaid ? "Premium" : "Free Tier"),
          "Purchase Date": item.subscription?.purchaseDate ? new Date(item.subscription.purchaseDate).toLocaleDateString() : "-",
          "Expiry Date": item.subscription?.expiryDate ? new Date(item.subscription.expiryDate).toLocaleDateString() : "-",
          "Jobs Used": item.subscription?.usedJobs || 0,
          "Status": statusStr,
          "Payment Amount": item.paymentAmount || 0,
          "State": item.state || "-",
          "City": item.city || "-"
        };
      } else {
        return {
          "Sr No": idx + 1,
          "Full Name": item.fullName || "-",
          "Email": item.email || "-",
          "Mobile": item.mobile || "-",
          "Provider Name": item.providerName || "-",
          "Service Category": item.serviceCategory || "-",
          "Plan Title": item.subscription?.planTitle || (isPaid ? "Premium" : "Free Tier"),
          "Purchase Date": item.subscription?.purchaseDate ? new Date(item.subscription.purchaseDate).toLocaleDateString() : "-",
          "Expiry Date": item.subscription?.expiryDate ? new Date(item.subscription.expiryDate).toLocaleDateString() : "-",
          "Leads Used": item.subscription?.usedLeads || 0,
          "Status": statusStr,
          "Payment Amount": item.paymentAmount || 0,
          "State": item.state || item.location || "-",
          "City": item.city || "-"
        };
      }
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === "recruiters" ? "Recruiter Subscriptions" : "Provider Subscriptions");
    XLSX.writeFile(wb, `${activeTab === "recruiters" ? "Recruiter" : "Provider"}_Subscriptions_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const filteredData = data.filter(item => {
    const isPaid = activeTab === "recruiters" ? item.isPaid : (item.isPaid || !!item.subscription);
    const expiryDate = item.subscription?.expiryDate ? new Date(item.subscription.expiryDate) : null;
    const isActive = isPaid && expiryDate && expiryDate > new Date();
    const isExpired = isPaid && expiryDate && expiryDate <= new Date();

    let matchesStatus = true;
    if (statusFilter === "Active") matchesStatus = isActive;
    else if (statusFilter === "Expired") matchesStatus = isExpired;
    else if (statusFilter === "Free") matchesStatus = !isPaid;

    const matchesIndustry = industryFilter === "All" || (activeTab === "recruiters" ? item.industry === industryFilter : item.serviceCategory === industryFilter);
    const matchesState = stateFilter === "All" || (activeTab === "recruiters" ? item.state === stateFilter : (item.state || item.location) === stateFilter);

    const searchableText = `${item.fullName || ""} ${activeTab === 'recruiters' ? item.companyName : item.providerName} ${item.email || ""}`.toLowerCase();
    return matchesStatus && matchesIndustry && matchesState && searchableText.includes(searchTerm.toLowerCase());
  });

  // Stats calculation
  const stats = {
    total: data.length,
    active: data.filter(item => {
      const isPaid = activeTab === "recruiters" ? item.isPaid : (item.isPaid || !!item.subscription);
      const expiry = item.subscription?.expiryDate ? new Date(item.subscription.expiryDate) : null;
      return isPaid && expiry && expiry > new Date();
    }).length,
    expired: data.filter(item => {
      const isPaid = activeTab === "recruiters" ? item.isPaid : (item.isPaid || !!item.subscription);
      const expiry = item.subscription?.expiryDate ? new Date(item.subscription.expiryDate) : null;
      return isPaid && expiry && expiry <= new Date();
    }).length,
    free: data.filter(item => {
        const isPaid = activeTab === "recruiters" ? item.isPaid : (item.isPaid || !!item.subscription);
        return !isPaid;
    }).length
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Loading Subscriptions...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-[1700px] mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-600 rounded-lg text-white">
                 <CreditCard size={20} />
               </div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Management</h1>
            </div>
            <p className="text-slate-500 font-medium">Monitor active plans, renewals and expiry across all subscribers</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button
              onClick={() => { setActiveTab("recruiters"); setSearchTerm(""); setStatusFilter("All"); setIndustryFilter("All"); setStateFilter("All"); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                activeTab === "recruiters" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Briefcase size={14} /> Recruiters
            </button>
            <button
              onClick={() => { setActiveTab("serviceproviders"); setSearchTerm(""); setStatusFilter("All"); setIndustryFilter("All"); setStateFilter("All"); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                activeTab === "serviceproviders" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Users size={14} /> Service Providers
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <SubscriptionStatCard title="Total Subscribers" value={stats.total} icon={<TrendingUp size={24} />} color="indigo" />
           <SubscriptionStatCard title="Active Plans" value={stats.active} icon={<CheckCircle2 size={24} />} color="emerald" />
           <SubscriptionStatCard title="Expired Soon" value={stats.expired} icon={<AlertCircle size={24} />} color="rose" />
           <SubscriptionStatCard title="Free Tier" value={stats.free} icon={<Zap size={24} />} color="amber" />
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm">
           <div className="relative flex-1 min-w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by subscriber name, business or email..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Filter size={16} className="text-slate-400" />
              <select 
                className="bg-transparent border-none text-xs font-black uppercase outline-none cursor-pointer"
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              >
                 <option value="All">All Status</option>
                 <option value="Active">Active Plans</option>
                 <option value="Expired">Expired</option>
                 <option value="Free">Free Tier</option>
              </select>
           </div>

           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Filter size={16} className="text-slate-400" />
              <select 
                className="bg-transparent border-none text-xs font-black uppercase outline-none cursor-pointer"
                value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
              >
                 <option value="All">All {activeTab === "recruiters" ? "Industries" : "Categories"}</option>
                 {[...new Set(data.map(item => activeTab === "recruiters" ? item.industry : item.serviceCategory).filter(Boolean))].map(opt => (
                   <option key={opt} value={opt}>{opt}</option>
                 ))}
              </select>
           </div>

           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Filter size={16} className="text-slate-400" />
              <select 
                className="bg-transparent border-none text-xs font-black uppercase outline-none cursor-pointer"
                value={stateFilter} onChange={e => setStateFilter(e.target.value)}
              >
                 <option value="All">All States</option>
                 {[...new Set(data.map(item => activeTab === "recruiters" ? item.state : (item.state || item.location)).filter(Boolean))].map(opt => (
                   <option key={opt} value={opt}>{opt}</option>
                 ))}
              </select>
           </div>

           <button 
             onClick={() => { fetchSubscriptionData(); setSearchTerm(""); setStatusFilter("All"); setIndustryFilter("All"); setStateFilter("All"); }} 
             className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-2xl transition-all border border-slate-100"
             title="Reset Filters"
           >
              <RotateCcw size={20} />
           </button>

           <button
             onClick={handleDownloadExcel}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1.5"
             title="Download Excel"
           >
             ⬇️ Download Excel
           </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Subscriber</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Plan Details</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Usage Metrics</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Validity</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Payment</th>
                      <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredData.map((item) => {
                      const isPaid = activeTab === "recruiters" ? item.isPaid : (item.isPaid || !!item.subscription);
                      const expiry = item.subscription?.expiryDate ? new Date(item.subscription.expiryDate) : null;
                      const isActive = isPaid && expiry && expiry > new Date();
                      const isExpired = isPaid && expiry && expiry <= new Date();

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-all group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <User size={20} />
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900">{item.fullName}</p>
                                    <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                                       <Building2 size={12} /> {activeTab === 'recruiters' ? item.companyName : item.providerName}
                                    </p>
                                 </div>
                              </div>
                           </td>

                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                 {isPaid ? (
                                    <div className="flex items-center gap-2">
                                       <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                          <Zap size={14} fill="currentColor" />
                                       </div>
                                       <span className="text-sm font-black text-slate-700">{item.subscription?.planTitle || "Premium Plan"}</span>
                                    </div>
                                 ) : (
                                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Free Tier</span>
                                 )}
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-8">
                                    Purchased: {item.subscription?.purchaseDate ? new Date(item.subscription.purchaseDate).toLocaleDateString() : 'N/A'}
                                 </p>
                              </div>
                           </td>

                           <td className="px-8 py-6">
                              <div className="flex items-center gap-6">
                                 <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jobs/Leads</p>
                                    <p className="text-sm font-black text-slate-700">
                                       {activeTab === 'recruiters' ? `${item.subscription?.usedJobs || 0} Used` : `${item.subscription?.usedLeads || 0} Leads`}
                                    </p>
                                 </div>
                                 <div className="w-px h-8 bg-slate-100"></div>
                                 <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                       isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                       isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                       'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}>
                                       {isActive ? 'Live' : isExpired ? 'Expired' : 'Inert'}
                                    </div>
                                 </div>
                              </div>
                           </td>

                           <td className="px-8 py-6">
                              {expiry ? (
                                 <div className="flex items-center gap-2.5">
                                    <Calendar size={16} className={isActive ? "text-indigo-500" : "text-rose-400"} />
                                    <div>
                                       <p className={`text-sm font-black ${isActive ? "text-slate-800" : "text-rose-600"}`}>
                                          {expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                       </p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase">
                                          {isActive ? `${Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24))} days left` : 'Expired'}
                                       </p>
                                    </div>
                                 </div>
                              ) : (
                                 <span className="text-xs font-bold text-slate-300 italic">No Expiry</span>
                              )}
                           </td>

                           <td className="px-8 py-6 text-right">
                              <p className="text-sm font-black text-slate-900">₹{item.paymentAmount || 0}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center justify-end gap-1">
                                 {item.isPaid ? 'PAID' : 'FREE'} <ArrowRight size={10} />
                              </p>
                           </td>

                           <td className="px-8 py-6 text-right">
                             <button
                               onClick={() => handleDeleteSubscriber(item._id)}
                               className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                               title="Delete Subscriber"
                             >
                               <Trash2 size={20} />
                             </button>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>

          {filteredData.length === 0 && (
            <div className="py-40 text-center">
               <div className="inline-flex p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
                 <AlertCircle size={48} />
               </div>
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Subscriptions Found</h3>
               <p className="text-slate-300 text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionStatCard({ title, value, icon, color }) {
  const colorMap = {
    indigo: "bg-indigo-600 text-white shadow-indigo-100",
    emerald: "bg-emerald-500 text-white shadow-emerald-100",
    rose: "bg-rose-500 text-white shadow-rose-100",
    amber: "bg-amber-500 text-white shadow-amber-100"
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-5">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${colorMap[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
       </div>
    </div>
  );
}
