"use client";
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Mail, Phone, MapPin, Briefcase, Trash2,
  Search, RotateCcw, Ban, FileText, Building2,
  CheckCircle2, XCircle, Clock, ExternalLink, X, Eye, User, Info, Tag, Globe, ShieldCheck, Zap, Calendar, Layers, CreditCard, Hash
} from 'lucide-react';

export default function SubscriberManagement() {
  const [activeTab, setActiveTab] = useState("recruiters"); // recruiters or serviceproviders
  const [recruiters, setRecruiters] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null); // Full Profile Modal

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [recRes, spRes] = await Promise.all([
        fetch("/api/admin/recruiters"),
        fetch("/api/admin/serviceproviders")
      ]);
      
      const recData = await recRes.json();
      const spData = await spRes.json();

      if (recData.success) setRecruiters(recData.recruiters);
      if (spData.success) setProviders(spData.providers || []);
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
        fetchAllData();
        setSelectedItem(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete subscriber");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDownloadExcel = () => {
    const dataToExport = activeTab === "recruiters" ? filteredRecruiters : filteredProviders;
    const formattedData = dataToExport.map((item, idx) => {
      if (activeTab === "recruiters") {
        return {
          "Sr No": idx + 1,
          "Full Name": item.fullName || "-",
          "Email": item.email || "-",
          "Mobile": item.mobile || "-",
          "Company Name": item.companyName || "-",
          "Industry": item.industry || "-",
          "City": item.city || "-",
          "State": item.state || "-",
          "Verified": item.isApproved ? "Approved" : (item.isRejected ? "Rejected" : "Pending"),
          "Subscription": item.isPaid ? "Premium" : "Free Tier",
          "Expiry Date": item.subscription?.expiryDate ? new Date(item.subscription.expiryDate).toLocaleDateString() : "-",
          "GST No": item.gstNo || "-",
          "PAN No": item.panNo || "-",
          "Aadhar No": item.aadharNo || "-"
        };
      } else {
        return {
          "Sr No": idx + 1,
          "Full Name": item.fullName || "-",
          "Email": item.email || "-",
          "Mobile": item.mobile || "-",
          "Provider Name": item.providerName || "-",
          "Service Category": item.serviceCategory || "-",
          "City": item.city || "-",
          "State": item.state || item.location || "-",
          "Status": item.status ? item.status.toUpperCase() : "PENDING",
          "GST No": item.gstNo || "-",
          "PAN No": item.panNo || "-",
          "Aadhar No": item.aadharNo || "-"
        };
      }
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === "recruiters" ? "Recruiters" : "Service Providers");
    XLSX.writeFile(wb, `${activeTab === "recruiters" ? "Recruiters" : "ServiceProviders"}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleUpdateStatus = async (id, status, isRejected = false) => {
    const endpoint = activeTab === "recruiters" ? "/api/admin/recruiters" : "/api/admin/serviceproviders";
    const body = activeTab === "recruiters" 
      ? { id, status, isRejected }
      : { id, status: isRejected ? 'rejected' : (status ? 'approved' : 'pending') };

    const actionText = isRejected ? 'reject' : (status === true || status === 'approved' ? 'approve' : 'reset');
    if (!confirm(`Are you sure you want to ${actionText} this subscriber?`)) return;

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchAllData();
        setSelectedItem(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const getFileUrl = (path) => {
    if (!path || path === "No Document" || path === "uploaded" || path === "") return null;
    if (path.startsWith('data:')) return path;
    let cleanPath = path.replace(/^public\//, '');
    if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
      cleanPath = '/' + cleanPath;
    }
    return cleanPath;
  };

  const handleViewDocument = (base64Data) => {
    try {
      if (!base64Data || base64Data === "No Document") {
        alert("No document available.");
        return;
      }
      if (!base64Data.startsWith("data:")) {
        const url = getFileUrl(base64Data);
        window.open(url, "_blank");
        return;
      }
      const base64Parts = base64Data.split(',');
      const contentType = base64Parts[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(base64Parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      alert("Could not open document.");
    }
  };

  const filteredRecruiters = recruiters.filter(r => {
    const matchesStatus = statusFilter === "All" ||
      (statusFilter === "Approved" && r.isApproved) ||
      (statusFilter === "Rejected" && r.isRejected) ||
      (statusFilter === "Pending" && !r.isApproved && !r.isRejected);

    const isPlanActive = r.isPaid && r.subscription?.expiryDate && new Date(r.subscription.expiryDate) > new Date();
    const matchesPlan = planFilter === "All" ||
      (planFilter === "Paid" && isPlanActive) ||
      (planFilter === "Expired" && r.isPaid && new Date(r.subscription.expiryDate) <= new Date()) ||
      (planFilter === "Free" && !r.isPaid);

    const matchesIndustry = industryFilter === "All" || r.industry === industryFilter;
    const matchesState = stateFilter === "All" || r.state === stateFilter;

    const matchesSearch = (r.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (r.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (r.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPlan && matchesIndustry && matchesState && matchesSearch;
  });

  const filteredProviders = providers.filter(sp => {
    const matchesStatus = statusFilter === "All" || sp.status === statusFilter.toLowerCase();
    const matchesCategory = industryFilter === "All" || sp.serviceCategory === industryFilter;
    const matchesState = stateFilter === "All" || (sp.state || sp.location) === stateFilter;
    const searchableText = `${sp.fullName || ""} ${sp.providerName || ""} ${sp.email || ""}`.toLowerCase();
    return matchesStatus && matchesCategory && matchesState && searchableText.includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-[1800px] mx-auto">

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Subscriber Profile Management</h1>
            <p className="text-slate-500 text-sm font-medium">Verify and manage professional network accounts</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => { setActiveTab("recruiters"); setSearchTerm(""); setStatusFilter("All"); setPlanFilter("All"); setIndustryFilter("All"); setStateFilter("All"); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "recruiters" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Briefcase size={14} /> Recruiters
            </button>
            <button
              onClick={() => { setActiveTab("serviceproviders"); setSearchTerm(""); setStatusFilter("All"); setIndustryFilter("All"); setStateFilter("All"); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "serviceproviders" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Zap size={14} /> Service Providers
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'recruiters' ? 'recruiters' : 'experts'}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-white text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Verification</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          {activeTab === "recruiters" && (
            <select
              className="border border-slate-200 px-4 py-2.5 rounded-xl bg-white text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
              value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            >
              <option value="All">All Plans</option>
              <option value="Paid">Premium</option>
              <option value="Expired">Expired</option>
              <option value="Free">Free</option>
            </select>
          )}
          <select
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-white text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
            value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
          >
            <option value="All">All {activeTab === "recruiters" ? "Industries" : "Categories"}</option>
            {(activeTab === "recruiters"
              ? [...new Set(recruiters.map(r => r.industry).filter(Boolean))]
              : [...new Set(providers.map(p => p.serviceCategory).filter(Boolean))]
            ).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select
            className="border border-slate-200 px-4 py-2.5 rounded-xl bg-white text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
            value={stateFilter} onChange={e => setStateFilter(e.target.value)}
          >
            <option value="All">All States</option>
            {(activeTab === "recruiters"
              ? [...new Set(recruiters.map(r => r.state).filter(Boolean))]
              : [...new Set(providers.map(p => p.state || p.location).filter(Boolean))]
            ).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button
            onClick={() => { fetchAllData(); setSearchTerm(""); setStatusFilter("All"); setPlanFilter("All"); setIndustryFilter("All"); setStateFilter("All"); }}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all"
            title="Reset Filters"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleDownloadExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            title="Download Excel"
          >
            ⬇️ Download Excel
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {activeTab === "recruiters" ? (
            <>
              <StatCard title="Total Recruiters" value={recruiters.length} color="text-slate-700" />
              <StatCard title="Premium Active" value={recruiters.filter(r => r.isPaid && new Date(r.subscription?.expiryDate) > new Date()).length} color="text-indigo-600" />
              <StatCard title="Verified" value={recruiters.filter(r => r.isApproved).length} color="text-emerald-600" />
              <StatCard title="Pending Review" value={recruiters.filter(r => !r.isApproved && !r.isRejected).length} color="text-amber-600" />
            </>
          ) : (
            <>
              <StatCard title="Total Providers" value={providers.length} color="text-slate-700" />
              <StatCard title="Verified" value={providers.filter(p => p.status === 'approved').length} color="text-emerald-600" />
              <StatCard title="Rejected" value={providers.filter(p => p.status === 'rejected').length} color="text-red-600" />
              <StatCard title="Pending" value={providers.filter(p => p.status === 'pending').length} color="text-amber-600" />
            </>
          )}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Basic Details</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Business info</th>
                  {activeTab === "recruiters" && <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Subscription</th>}
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(activeTab === "recruiters" ? filteredRecruiters : filteredProviders).map((item) => {
                  const isApproved = activeTab === "recruiters" ? item.isApproved : item.status === "approved";
                  const isRejected = activeTab === "recruiters" ? item.isRejected : item.status === "rejected";
                  const isPlanActive = activeTab === "recruiters" && item.isPaid && item.subscription?.expiryDate && new Date(item.subscription.expiryDate) > new Date();

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="font-bold text-slate-900 text-base hover:text-indigo-600 hover:underline transition-all block text-left"
                        >
                          {item.fullName}
                        </button>
                        <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                          <Mail size={13} className="text-slate-400" /> {item.email}
                        </div>
                        <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                          <Phone size={13} className="text-slate-400" /> {item.mobile}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="font-bold text-indigo-600 flex items-center gap-1.5">
                          <Building2 size={14} /> {activeTab === "recruiters" ? item.companyName : item.providerName}
                        </div>
                        <div className="text-[12px] text-slate-600 font-bold mt-1.5 px-2 py-0.5 bg-indigo-50 rounded-md inline-block">
                          {activeTab === "recruiters" ? (item.industry || "Recruiter") : item.serviceCategory}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                          <MapPin size={12} /> {item.city || item.location || "N/A"}
                        </div>
                      </td>

                      {activeTab === "recruiters" && (
                        <td className="p-5">
                          {isPlanActive ? (
                            <div className="flex items-center gap-1.5 text-indigo-600">
                              <Zap size={14} fill="currentColor" />
                              <span className="text-xs font-bold uppercase">Premium</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium uppercase">{item.isPaid ? 'Expired' : 'Free Tier'}</span>
                          )}
                        </td>
                      )}

                      <td className="p-5 text-center">
                        <StatusBadge approved={isApproved} rejected={isRejected} />
                      </td>

                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button onClick={() => setSelectedItem(item)} className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="View Full Profile">
                            <Eye size={20} />
                          </button>
                          {isApproved || isRejected ? (
                            <button
                              onClick={() => handleUpdateStatus(item._id, false, false)}
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                              title="Reset to Pending"
                            >
                              <RotateCcw size={20} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(item._id, true, false)}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item._id, false, true)}
                                className="p-2.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                title="Reject"
                              >
                                <Ban size={22} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteSubscriber(item._id)}
                            className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                            title="Delete Subscriber"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(activeTab === "recruiters" ? filteredRecruiters : filteredProviders).length === 0 && (
            <div className="py-32 text-center bg-slate-50/30">
              <div className="inline-flex p-6 bg-white rounded-full shadow-sm text-slate-200 mb-4">
                <Search size={40} />
              </div>
              <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">No match found</p>
              <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); }} className="mt-4 text-indigo-600 font-black text-sm hover:underline">Clear all filters</button>
            </div>
          )}
        </div>

        {/* --- Unified Detail Modal --- */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl my-8 rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-600 rounded-[20px] text-white shadow-lg shadow-indigo-100">
                    {activeTab === 'recruiters' ? <Briefcase size={26} /> : <Zap size={26} />}
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-2xl leading-none">{activeTab === 'recruiters' ? 'Recruiter Profile' : 'Provider Profile'}</h2>
                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.3em] font-black">Subscriber Management System</p>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all hover:rotate-90">
                  <X size={28} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                
                {/* Column 1: Personal & Account */}
                <div className="space-y-8">
                   <section>
                      <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <User size={14} /> Personal Details
                      </h3>
                      <div className="space-y-5">
                        <InfoItem label="Full Name" value={selectedItem.fullName} icon={<User size={14} />} />
                        <InfoItem label="Email Address" value={selectedItem.email} icon={<Mail size={14} />} />
                        <InfoItem label="Mobile Number" value={selectedItem.mobile} icon={<Phone size={14} />} />
                        {activeTab === 'recruiters' && (
                          <>
                            <InfoItem label="Username" value={selectedItem.username} icon={<Tag size={14} />} />
                            <InfoItem label="Designation" value={selectedItem.designation} icon={<Briefcase size={14} />} />
                          </>
                        )}
                        <InfoItem label="Profession" value={selectedItem.profession} icon={<Layers size={14} />} />
                      </div>
                   </section>

                   <section className="pt-4">
                      <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <ShieldCheck size={14} /> Identity / KYC
                      </h3>
                      <div className="space-y-4">
                        <InfoItem label="GST Number" value={selectedItem.gstNo || selectedItem.gstDoc ? 'Available' : 'N/A'} icon={<CreditCard size={14} />} />
                        <InfoItem label="PAN Number" value={selectedItem.panNo || selectedItem.panNumber} icon={<Hash size={14} />} />
                        <InfoItem label="Aadhar Number" value={selectedItem.aadharNo || selectedItem.aadharNumber} icon={<ShieldCheck size={14} />} />
                      </div>
                   </section>
                </div>

                {/* Column 2: Business & Address */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
                      <Building2 size={14} /> Business info
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-5 shadow-sm">
                      <InfoItem label="Organization Name" value={activeTab === 'recruiters' ? selectedItem.companyName : selectedItem.providerName} icon={<Building2 size={14} />} />
                      <InfoItem label="Category / Industry" value={activeTab === 'recruiters' ? selectedItem.industry : selectedItem.serviceCategory} icon={<Layers size={14} />} />
                      <InfoItem label="Website" value={selectedItem.website} icon={<Globe size={14} />} />
                      <InfoItem label="Company Size" value={selectedItem.companySize} />
                    </div>
                  </section>

                  <section className="pt-2">
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
                      <MapPin size={14} /> Location Details
                    </h3>
                    <div className="p-5 border-2 border-dashed border-slate-200 rounded-[24px]">
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase">
                        {selectedItem.address || selectedItem.location || "No full address provided."}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 font-black">
                        {selectedItem.city}, {selectedItem.state} {selectedItem.pincode}
                      </p>
                    </div>
                  </section>
                </div>

                {/* Column 3: Subscription & Docs */}
                <div className="space-y-8">
                   {/* Define status for modal actions */}
                   {(() => {
                      const isApproved = activeTab === "recruiters" ? selectedItem.isApproved : selectedItem.status === "approved";
                      const isRejected = activeTab === "recruiters" ? selectedItem.isRejected : selectedItem.status === "rejected";
                      
                      return (
                        <>
                   {activeTab === 'recruiters' && (
                     <section>
                        <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
                          <Zap size={14} /> Subscription
                        </h3>
                        {/* {Payment details are available but currently in background} */}
                        <div className={`p-5 rounded-[24px] border transition-all ${selectedItem.isPaid ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest">{selectedItem.isPaid ? 'Premium Member' : 'Free Account'}</span>
                              {selectedItem.isPaid && <Zap size={16} fill="currentColor" />}
                           </div>
                           <p className="text-2xl font-black mb-1">{selectedItem.isPaid ? 'ACTIVE' : 'INACTIVE'}</p>
                           <p className="text-[10px] opacity-70 font-bold">Expires: {selectedItem.subscription?.expiryDate ? new Date(selectedItem.subscription.expiryDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                     </section>
                   )}

                   <section>
                      <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <FileText size={14} /> Verification Files
                      </h3>
                      <div className="grid grid-cols-1 gap-2.5">
                        <DocButton label="GST Certificate" active={!!(selectedItem.gstFile || selectedItem.gstDoc)} onClick={() => handleViewDocument(selectedItem.gstFile || selectedItem.gstDoc)} />
                        <DocButton label="Aadhar Card" active={!!(selectedItem.aadharFile || selectedItem.aadharDoc)} onClick={() => handleViewDocument(selectedItem.aadharFile || selectedItem.aadharDoc)} />
                        <DocButton label="PAN Card" active={!!(selectedItem.panFile || selectedItem.panDoc)} onClick={() => handleViewDocument(selectedItem.panFile || selectedItem.panDoc)} />
                        {activeTab === 'recruiters' && <DocButton label="Company License" active={!!selectedItem.licenseFile} onClick={() => handleViewDocument(selectedItem.licenseFile)} />}
                      </div>
                   </section>

                   <div className="pt-6 border-t border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Quick Actions</p>
                      <div className="flex flex-col gap-2">
                         {isApproved || isRejected ? (
                            <button onClick={() => handleUpdateStatus(selectedItem._id, false, false)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Revoke / Reset Status</button>
                         ) : (
                            <>
                              <button onClick={() => handleUpdateStatus(selectedItem._id, true, false)} className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Verify & Approve</button>
                              <button onClick={() => handleUpdateStatus(selectedItem._id, false, true)} className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject Profile</button>
                            </>
                         )}
                          <button
                            onClick={() => handleDeleteSubscriber(selectedItem._id)}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-1.5 mt-1"
                          >
                            <Trash2 size={14} /> Delete Profile
                          </button>
                      </div>
                   </div>
                   </>
                   );
                })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ approved, rejected }) {
  if (approved) return <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tight"><CheckCircle2 size={12} /> Verified</span>;
  if (rejected) return <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-100 uppercase tracking-tight"><XCircle size={12} /> Rejected</span>;
  return <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-tight animate-pulse"><Clock size={12} /> Pending</span>;
}

function DocButton({ label, active, onClick }) {
  return (
    <button
      disabled={!active}
      onClick={onClick}
      className={`flex items-center justify-between w-full px-5 py-3 rounded-2xl text-[11px] font-bold border transition-all ${active ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}
    >
      <div className="flex items-center gap-2.5">
        <FileText size={16} className={active ? "text-indigo-500" : "text-slate-300"} /> {label}
      </div>
      {active ? <Eye size={16} /> : <XCircle size={16} />}
    </button>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2 mb-1">{icon} {label}</p>
      <p className="text-sm font-bold text-slate-700 truncate" title={value}>{value || "Not Provided"}</p>
    </div>
  );
}
