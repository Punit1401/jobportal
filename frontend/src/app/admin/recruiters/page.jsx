// "use client";
// import { useEffect, useState } from "react";
// import {
//   MapPin, Ban, RotateCcw, FileText, Download, Mail,
//   Phone, Briefcase, Hash, CreditCard, Building2,
//   CheckCircle2, XCircle, Clock, Search, Zap, Calendar, AlertCircle
// } from "lucide-react";
// import * as XLSX from "xlsx";

// export default function AdminRecruiterManager() {
//   const [recruiters, setRecruiters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [planFilter, setPlanFilter] = useState("All"); // નવું ફિલ્ટર
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => { fetchRecruiters(); }, []);

//   const fetchRecruiters = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/admin/recruiters");
//       const data = await res.json();
//       if (data.success) setRecruiters(data.recruiters);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateStatus = async (id, status, isRejected = false) => {
//     const msg = isRejected ? "Reject this recruiter?" : status ? "Approve this recruiter?" : "Reset to pending?";
//     if (!confirm(msg)) return;

//     const res = await fetch("/api/admin/recruiters", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id, status, isRejected }),
//     });

//     if (res.ok) {
//       alert("Status updated successfully!");
//       fetchRecruiters();
//     }
//   };

//   const handleViewDocument = (base64Data) => {
//     try {
//       if (!base64Data || base64Data === "No Document") return;
//       if (!base64Data.startsWith("data:")) {
//         const url = base64Data.startsWith("/") ? base64Data : `/${base64Data}`;
//         window.open(url, "_blank");
//         return;
//       }
//       const base64Parts = base64Data.split(',');
//       const contentType = base64Parts[0].split(':')[1].split(';')[0];
//       const byteCharacters = atob(base64Parts[1]);
//       const byteNumbers = new Array(byteCharacters.length);
//       for (let i = 0; i < byteCharacters.length; i++) {
//         byteNumbers[i] = byteCharacters.charCodeAt(i);
//       }
//       const byteArray = new Uint8Array(byteNumbers);
//       const blob = new Blob([byteArray], { type: contentType });
//       const fileURL = URL.createObjectURL(blob);
//       window.open(fileURL, "_blank");
//     } catch (error) {
//       console.error("Document View Error:", error);
//       alert("Could not open document.");
//     }
//   };

//   // --- Filtering Logic (Status + Plan + Search) ---
//   const filtered = recruiters.filter(r => {
//     // Status Filter
//     const matchesStatus = statusFilter === "All" ||
//       (statusFilter === "Approved" && r.isApproved) ||
//       (statusFilter === "Rejected" && r.isRejected) ||
//       (statusFilter === "Pending" && !r.isApproved && !r.isRejected);

//     // Plan Filter
//     const hasActivePlan = r.isPaid && r.subscription?.expiryDate && new Date(r.subscription.expiryDate) > new Date();
//     const matchesPlan = planFilter === "All" ||
//       (planFilter === "Paid" && hasActivePlan) ||
//       (planFilter === "Expired" && r.isPaid && new Date(r.subscription.expiryDate) <= new Date()) ||
//       (planFilter === "Free" && !r.isPaid);

//     // Search Filter
//     const matchesSearch = (r.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
//       (r.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
//       (r.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

//     return matchesStatus && matchesPlan && matchesSearch;
//   });

//   if (loading) return (
//     <div className="flex h-screen items-center justify-center bg-white">
//       <div className="flex flex-col items-center gap-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Recruiter Database...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-4 bg-slate-50 min-h-screen font-sans">
//       <div className="max-w-[1850px] mx-auto">

//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
//               <Briefcase className="text-indigo-600" /> Recruiter & Subscription Manager
//             </h1>
//             <p className="text-slate-500 text-sm font-bold italic">Verify identities and track premium subscriptions</p>
//           </div>

//           <div className="flex flex-wrap gap-3 w-full md:w-auto">
//             {/* Search */}
//             <div className="relative flex-1 md:min-w-[300px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search name, company or email..."
//                 className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all text-sm font-medium"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             {/* Verification Filter */}
//             <select
//               className="border border-slate-200 p-2 rounded-xl bg-white font-black text-[11px] uppercase outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
//               value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
//             >
//               <option value="All">All Verification</option>
//               <option value="Pending">Pending Review</option>
//               <option value="Approved">Approved</option>
//               <option value="Rejected">Rejected</option>
//             </select>

//             {/* Plan Filter */}
//             <select
//               className="border border-indigo-100 p-2 rounded-xl bg-indigo-50 text-indigo-700 font-black text-[11px] uppercase outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
//               value={planFilter} onChange={e => setPlanFilter(e.target.value)}
//             >
//               <option value="All">All Plans</option>
//               <option value="Paid">Active Premium</option>
//               <option value="Expired">Expired Plans</option>
//               <option value="Free">No Plan (Free)</option>
//             </select>
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[1600px]">
//               <thead>
//                 <tr className="bg-slate-50/80 border-b border-slate-100">
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Recruiter Info</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Organization</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subscription Status</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Plan Validity</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">GST & Identity</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Docs</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Verify Status</th>
//                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {filtered.map((r) => {
//                   const isPlanActive = r.isPaid && r.subscription?.expiryDate && new Date(r.subscription.expiryDate) > new Date();

//                   return (
//                     <tr key={r._id} className="hover:bg-indigo-50/20 transition-all group">
//                       {/* Recruiter Details */}
//                       <td className="p-4">
//                         <div className="font-black text-slate-900 leading-none">{r.fullName}</div>
//                         <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-2 tracking-tight">
//                           <Mail size={12} className="text-slate-300" /> {r.email}
//                         </div>
//                         <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
//                           <Phone size={12} className="text-slate-300" /> {r.mobile}
//                         </div>
//                       </td>

//                       {/* Company & Role */}
//                       <td className="p-4">
//                         <div className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-xs tracking-tight">
//                           <Building2 size={14} className="text-indigo-200" /> {r.companyName}
//                         </div>
//                         <div className="text-[10px] text-slate-400 mt-1 font-black flex items-center gap-1">
//                           <MapPin size={10} className="text-rose-400" /> {r.location || r.city || "N/A"}
//                         </div>
//                       </td>

//                       {/* Subscription Status - NEW */}
//                       <td className="p-4">
//                         {isPlanActive ? (
//                           <div className="flex flex-col gap-1">
//                             <span className="inline-flex items-center gap-1 w-fit px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter">
//                               <Zap size={10} fill="currentColor" /> Premium Active
//                             </span>
//                             <span className="text-[10px] font-bold text-slate-400 tracking-tight">ID: {r.subscription?.planId?.slice(-6) || "N/A"}</span>
//                           </div>
//                         ) : r.isPaid ? (
//                           <div className="flex flex-col gap-1 opacity-60">
//                             <span className="inline-flex items-center gap-1 w-fit px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
//                               <AlertCircle size={10} /> Expired
//                             </span>
//                           </div>
//                         ) : (
//                           <span className="text-[10px] font-black text-slate-300 uppercase italic">Free Tier</span>
//                         )}
//                       </td>

//                       {/* Plan Validity - NEW */}
//                       <td className="p-4">
//                         {r.isPaid ? (
//                           <div className="space-y-1">
//                             <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
//                               <Calendar size={12} className="text-indigo-400" />
//                               <span>Start: {new Date(r.paidAt).toLocaleDateString()}</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-[11px] font-black text-rose-500">
//                               <Clock size={12} />
//                               <span>Ends: {new Date(r.subscription?.expiryDate).toLocaleDateString()}</span>
//                             </div>
//                           </div>
//                         ) : (
//                           <span className="text-[10px] font-bold text-slate-300">-- No Record --</span>
//                         )}
//                       </td>

//                       {/* GST & ID Numbers */}
//                       <td className="p-4">
//                         <div className="flex flex-col gap-1.5">
//                           <div className="flex items-center gap-2">
//                             <span className="text-[9px] font-black bg-slate-100 px-1.5 py-0.5 rounded uppercase text-slate-500">GST</span>
//                             <code className="text-[10px] font-bold text-slate-700">{r.gstNo || "N/A"}</code>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <span className="text-[9px] font-black bg-slate-100 px-1.5 py-0.5 rounded uppercase text-slate-500">PAN</span>
//                             <code className="text-[10px] font-bold text-slate-700 uppercase">{r.panNo || "N/A"}</code>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Documents */}
//                       <td className="p-4">
//                         <div className="flex justify-center gap-1.5">
//                           {[
//                             { path: r.gstFile, label: 'GST' },
//                             { path: r.aadharFile, label: 'AAD' },
//                             { path: r.panFile, label: 'PAN' }
//                           ].map((doc, i) => (
//                             <button
//                               key={i}
//                               disabled={!doc.path || doc.path === "No Document"}
//                               onClick={() => handleViewDocument(doc.path)}
//                               className={`p-2 rounded-lg border transition-all ${doc.path && doc.path !== "No Document" ? 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-200 cursor-not-allowed'}`}
//                               title={doc.label}
//                             >
//                               <FileText size={14} />
//                             </button>
//                           ))}
//                         </div>
//                       </td>

//                       {/* Verification Status Badge */}
//                       <td className="p-4 text-center">
//                         {r.isApproved ? (
//                           <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-tighter">
//                             <CheckCircle2 size={12} /> Verified
//                           </div>
//                         ) : r.isRejected ? (
//                           <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black border border-red-100 uppercase tracking-tighter">
//                             <XCircle size={12} /> Rejected
//                           </div>
//                         ) : (
//                           <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black border border-amber-100 uppercase tracking-tighter animate-pulse">
//                             <Clock size={12} /> Reviewing
//                           </div>
//                         )}
//                       </td>

//                       {/* Action Buttons */}
//                       <td className="p-4 text-right">
//                         <div className="flex justify-end gap-2">
//                           {r.isRejected || r.isApproved ? (
//                             <button
//                               onClick={() => handleUpdateStatus(r._id, false, false)}
//                               className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
//                               title="Reset Verification"
//                             >
//                               <RotateCcw size={18} />
//                             </button>
//                           ) : (
//                             <>
//                               <button
//                                 onClick={() => handleUpdateStatus(r._id, true, false)}
//                                 className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => handleUpdateStatus(r._id, false, true)}
//                                 className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
//                                 title="Reject"
//                               >
//                                 <Ban size={20} />
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {filtered.length === 0 && (
//             <div className="py-24 text-center bg-white">
//               <div className="text-slate-100 mb-4 flex justify-center"><Search size={64} /></div>
//               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching recruiters found</p>
//               <button onClick={() => { setStatusFilter("All"); setPlanFilter("All"); setSearchTerm(""); }} className="mt-4 text-indigo-600 font-bold text-sm hover:underline italic">Clear all filters</button>
//             </div>
//           )}
//         </div>

//         {/* --- Stats Summary Footer --- */}
//         <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="bg-white p-4 rounded-2xl border border-slate-200">
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recruiters</p>
//             <p className="text-2xl font-black text-slate-900">{recruiters.length}</p>
//           </div>
//           <div className="bg-white p-4 rounded-2xl border border-slate-200">
//             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Premium Active</p>
//             <p className="text-2xl font-black text-indigo-600">
//               {recruiters.filter(r => r.isPaid && new Date(r.subscription?.expiryDate) > new Date()).length}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-2xl border border-slate-200">
//             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Verified Partners</p>
//             <p className="text-2xl font-black text-emerald-600">{recruiters.filter(r => r.isApproved).length}</p>
//           </div>
//           <div className="bg-white p-4 rounded-2xl border border-slate-200">
//             <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending Approval</p>
//             <p className="text-2xl font-black text-amber-600">
//               {recruiters.filter(r => !r.isApproved && !r.isRejected).length}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import {
  MapPin, Ban, RotateCcw, FileText, Mail,
  Phone, Briefcase, Hash, CreditCard, Building2,
  CheckCircle2, XCircle, Clock, Search, Zap, Calendar, X, Eye,
  Globe, User, ShieldCheck, Info, Tag, Layers
} from "lucide-react";

export default function AdminRecruiterManager() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  useEffect(() => { fetchRecruiters(); }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/recruiters");
      const data = await res.json();
      if (data.success) setRecruiters(data.recruiters);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, isRejected = false) => {
    const msg = isRejected ? "Reject this recruiter?" : status ? "Approve this recruiter?" : "Reset to pending?";
    if (!confirm(msg)) return;

    const res = await fetch("/api/admin/recruiters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, isRejected }),
    });

    if (res.ok) {
      fetchRecruiters();
    }
  };

  const handleViewDocument = (base64Data) => {
    try {
      if (!base64Data || base64Data === "No Document") {
        alert("No document available.");
        return;
      }
      if (!base64Data.startsWith("data:")) {
        const url = base64Data.startsWith("/") ? base64Data : `/${base64Data}`;
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

  const filtered = recruiters.filter(r => {
    const matchesStatus = statusFilter === "All" ||
      (statusFilter === "Approved" && r.isApproved) ||
      (statusFilter === "Rejected" && r.isRejected) ||
      (statusFilter === "Pending" && !r.isApproved && !r.isRejected);

    const isPlanActive = r.isPaid && r.subscription?.expiryDate && new Date(r.subscription.expiryDate) > new Date();
    const matchesPlan = planFilter === "All" ||
      (planFilter === "Paid" && isPlanActive) ||
      (planFilter === "Expired" && r.isPaid && new Date(r.subscription.expiryDate) <= new Date()) ||
      (planFilter === "Free" && !r.isPaid);

    const matchesSearch = (r.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (r.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (r.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPlan && matchesSearch;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto">

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recruiter Management</h1>
            <p className="text-slate-500 text-sm">Review applications and manage premium subscriptions</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, company, email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border border-slate-200 px-3 py-2 rounded-lg bg-white text-sm outline-none"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Verification</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="border border-slate-200 px-3 py-2 rounded-lg bg-white text-sm outline-none"
              value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            >
              <option value="All">All Plans</option>
              <option value="Paid">Premium</option>
              <option value="Expired">Expired</option>
              <option value="Free">Free</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Recruiters" value={recruiters.length} color="text-slate-700" />
          <StatCard title="Premium Active" value={recruiters.filter(r => r.isPaid && new Date(r.subscription?.expiryDate) > new Date()).length} color="text-indigo-600" />
          <StatCard title="Verified" value={recruiters.filter(r => r.isApproved).length} color="text-emerald-600" />
          <StatCard title="Pending Review" value={recruiters.filter(r => !r.isApproved && !r.isRejected).length} color="text-amber-600" />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recruiter</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                  {/* <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Docs</th> */}
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const isPlanActive = r.isPaid && r.subscription?.expiryDate && new Date(r.subscription.expiryDate) > new Date();
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <button onClick={() => setSelectedRecruiter(r)} className="font-semibold text-indigo-600 hover:underline block text-sm text-left">
                          {r.fullName}
                        </button>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail size={12} /> {r.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-slate-700 block">{r.companyName}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-1"><MapPin size={12} /> {r.city || "N/A"}, {r.state || ""}</span>
                      </td>
                      <td className="p-4">
                        {isPlanActive ? (
                          <div className="flex items-center gap-1.5 text-indigo-600">
                            <Zap size={14} fill="currentColor" />
                            <span className="text-xs font-bold uppercase">Premium</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium uppercase">{r.isPaid ? 'Expired' : 'Free Tier'}</span>
                        )}
                      </td>
                      {/* <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <DocIcon active={!!r.gstFile} onClick={() => handleViewDocument(r.gstFile)} label="GST" />
                          <DocIcon active={!!r.aadharFile} onClick={() => handleViewDocument(r.aadharFile)} label="AAD" />
                          <DocIcon active={!!r.panFile} onClick={() => handleViewDocument(r.panFile)} label="PAN" />
                        </div>
                      </td> */}
                      <td className="p-4 text-center">
                        <StatusBadge approved={r.isApproved} rejected={r.isRejected} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {r.isRejected || r.isApproved ? (
                            <button onClick={() => handleUpdateStatus(r._id, false, false)} className="p-2 text-slate-400 hover:text-indigo-600" title="Reset to Pending">
                              <RotateCcw size={18} />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => handleUpdateStatus(r._id, true, false)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">
                                Approve
                              </button>
                              <button onClick={() => handleUpdateStatus(r._id, false, true)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Ban size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Full Details Modal --- */}
        {selectedRecruiter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl my-8 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {selectedRecruiter.logo && (
                    <img src={selectedRecruiter.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                  )}
                  <div>
                    <h2 className="font-bold text-slate-800 leading-none">Recruiter Full Profile</h2>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">ID: {selectedRecruiter._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRecruiter(null)} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 border border-slate-100"><X size={20} /></button>
              </div>

              {/* Modal Body */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Section 1: Basic & Personal */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} /> Personal Details
                  </h3>
                  <div className="space-y-4">
                    <InfoItem label="Full Name" value={selectedRecruiter.fullName} icon={<User size={14} />} />
                    <InfoItem label="Username" value={selectedRecruiter.username} icon={<Tag size={14} />} />
                    <InfoItem label="Designation" value={selectedRecruiter.designation} icon={<Briefcase size={14} />} />
                    <InfoItem label="Email Address" value={selectedRecruiter.email} icon={<Mail size={14} />} />
                    <InfoItem label="Mobile" value={selectedRecruiter.mobile} icon={<Phone size={14} />} />
                    <InfoItem label="Profession" value={selectedRecruiter.profession} icon={<Layers size={14} />} />
                  </div>

                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2 pt-4">
                    <ShieldCheck size={14} /> KYC Details
                  </h3>
                  <div className="space-y-4">
                    <InfoItem label="GST Number" value={selectedRecruiter.gstNo} icon={<CreditCard size={14} />} />
                    <InfoItem label="PAN Number" value={selectedRecruiter.panNo} icon={<Hash size={14} />} />
                    <InfoItem label="Aadhar Number" value={selectedRecruiter.aadharNo} icon={<ShieldCheck size={14} />} />
                    <InfoItem label="Company License" value={selectedRecruiter.companyLicense} icon={<FileText size={14} />} />
                  </div>
                </div>

                {/* Section 2: Company Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={14} /> Company Info
                  </h3>
                  <div className="space-y-4">
                    <InfoItem label="Company Name" value={selectedRecruiter.companyName} icon={<Building2 size={14} />} />
                    <InfoItem label="Registration Type" value={selectedRecruiter.registrationType} icon={<Info size={14} />} />
                    <InfoItem label="Industry" value={selectedRecruiter.industry} icon={<Layers size={14} />} />
                    <InfoItem label="Company Size" value={selectedRecruiter.companySize} icon={<User size={14} />} />
                    <InfoItem label="Website" value={selectedRecruiter.website} icon={<Globe size={14} />} />
                    <InfoItem label="Founded" value={selectedRecruiter.founded} />
                    <InfoItem label="Recruiter Type" value={selectedRecruiter.recruiterType} />

                    <div className="pt-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Address</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                        {selectedRecruiter.address}, {selectedRecruiter.city}, {selectedRecruiter.state}, {selectedRecruiter.pincode}, {selectedRecruiter.country}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2 pt-4">
                    <Phone size={14} /> Alternate Contacts
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Contact Person</p>
                      <p className="text-sm font-semibold">{selectedRecruiter.contactPersonName || "N/A"}</p>
                      <p className="text-xs text-slate-500">{selectedRecruiter.contactPersonNumber}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Owner Details</p>
                      <p className="text-sm font-semibold">{selectedRecruiter.ownerName || "N/A"}</p>
                      <p className="text-xs text-slate-500">{selectedRecruiter.ownerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Subscription & Files */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} /> Subscription Status
                  </h3>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-700 font-bold">Current Plan</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${selectedRecruiter.isPaid ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {selectedRecruiter.isPaid ? 'Premium' : 'Free'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Expiry" value={selectedRecruiter.subscription?.expiryDate ? new Date(selectedRecruiter.subscription.expiryDate).toLocaleDateString() : "Never"} />
                      <InfoItem label="Paid Amt" value={`₹${selectedRecruiter.paymentAmount || 0}`} />
                    </div>
                    <div className="pt-2 border-t border-indigo-100 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] text-indigo-400 font-bold uppercase">Jobs Used</p>
                        <p className="text-xs font-bold">{selectedRecruiter.subscription?.usedJobs || 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-indigo-400 font-bold uppercase">Leads Used</p>
                        <p className="text-xs font-bold">{selectedRecruiter.subscription?.usedLeads || 0}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2 pt-4">
                    <FileText size={14} /> Documents & Proofs
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <DocButton label="GST Certificate" active={!!selectedRecruiter.gstFile} onClick={() => handleViewDocument(selectedRecruiter.gstFile)} />
                    <DocButton label="Aadhar Card" active={!!selectedRecruiter.aadharFile} onClick={() => handleViewDocument(selectedRecruiter.aadharFile)} />
                    <DocButton label="PAN Card" active={!!selectedRecruiter.panFile} onClick={() => handleViewDocument(selectedRecruiter.panFile)} />
                    <DocButton label="Company License" active={!!selectedRecruiter.licenseFile} onClick={() => handleViewDocument(selectedRecruiter.licenseFile)} />
                  </div>

                  <div className="pt-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Internal Management</p>
                    <div className="flex gap-2">
                      {selectedRecruiter.isApproved ? (
                        <button onClick={() => { handleUpdateStatus(selectedRecruiter._id, false, false); setSelectedRecruiter(null); }} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-200">Revoke Approval</button>
                      ) : (
                        <button onClick={() => { handleUpdateStatus(selectedRecruiter._id, true, false); setSelectedRecruiter(null); }} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">Approve Now</button>
                      )}
                      {!selectedRecruiter.isRejected && (
                        <button onClick={() => { handleUpdateStatus(selectedRecruiter._id, false, true); setSelectedRecruiter(null); }} className="px-4 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg text-xs font-bold hover:bg-red-100">Reject</button>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedRecruiter(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <X size={14} /> Close Details
                    </button>
                  </div>
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
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ approved, rejected }) {
  if (approved) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">VERIFIED</span>;
  if (rejected) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">REJECTED</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">PENDING</span>;
}

function DocIcon({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      disabled={!active}
      title={label}
      className={`p-2 rounded-md border transition-all ${active ? 'bg-white border-slate-200 text-indigo-600 hover:border-indigo-500' : 'bg-slate-50 border-transparent text-slate-200 cursor-not-allowed'}`}
    >
      <Eye size={14} />
    </button>
  );
}

function DocButton({ label, active, onClick }) {
  return (
    <button
      disabled={!active}
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${active ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}
    >
      <div className="flex items-center gap-2">
        <FileText size={14} className={active ? "text-indigo-500" : "text-slate-300"} /> {label}
      </div>
      {active ? <Eye size={14} /> : <XCircle size={14} />}
    </button>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1.5 mb-0.5">{icon} {label}</p>
      <p className="text-sm font-bold text-slate-700 truncate" title={value}>{value || "Not Provided"}</p>
    </div>
  );
}