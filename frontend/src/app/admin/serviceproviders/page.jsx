// "use client";
// import React, { useEffect, useState } from 'react';
// import { 
//   Mail, Phone, MapPin, Briefcase, 
//   Search, RotateCcw, Ban, FileText, Building2,
//   CheckCircle2, XCircle, Clock, ExternalLink
// } from 'lucide-react';

// export default function AdminSPManager() {
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");

//   useEffect(() => {
//     fetchProviders();
//   }, []);

//   const fetchProviders = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch('/api/admin/serviceproviders');
//       const data = await res.json();
//       setProviders(data.providers || []);
//     } catch (err) {
//       console.error("Error fetching:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, status, isRejected = false) => {
//     const actionText = isRejected ? 'reject' : (status === 'approved' ? 'approve' : 'reset');
//     if (!confirm(`Are you sure you want to ${actionText} this provider?`)) return;

//     try {
//       const res = await fetch('/api/admin/serviceproviders', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id, status: isRejected ? 'rejected' : status }),
//       });
//       if (res.ok) {
//         fetchProviders();
//       }
//     } catch (err) {
//       alert("Error updating status");
//     }
//   };

//   const getFileUrl = (path) => {
//     if (!path || path === "No Document" || path === "uploaded" || path === "") return null;
//     let cleanPath = path.replace(/^public\//, '');
//     if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
//       cleanPath = '/' + cleanPath;
//     }
//     return cleanPath;
//   };

//   const filtered = providers.filter(sp => {
//     const matchesStatus = statusFilter === "All" || sp.status === statusFilter.toLowerCase();
//     const searchableText = `${sp.fullName || ""} ${sp.providerName || ""} ${sp.email || ""}`.toLowerCase();
//     return matchesStatus && searchableText.includes(searchTerm.toLowerCase());
//   });

//   if (loading) return (
//     <div className="flex h-screen items-center justify-center bg-white">
//       <div className="flex flex-col items-center gap-3">
//         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
//         <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen font-sans">
//       <div className="max-w-[1700px] mx-auto">

//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expert Network Admin</h1>
//             <p className="text-slate-500 font-medium">Verify and manage service provider applications</p>
//           </div>

//           <div className="flex flex-wrap gap-3 w-full md:w-auto">
//             <div className="relative flex-1 md:min-w-[350px]">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//               <input 
//                 type="text" 
//                 placeholder="Search name, email, or business..." 
//                 className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all text-sm font-medium"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <select 
//               className="border-none shadow-sm px-4 py-3 rounded-2xl bg-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-700"
//               value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
//             >
//               <option value="All">All Applications</option>
//               <option value="Pending">Pending Review</option>
//               <option value="Approved">Approved</option>
//               <option value="Rejected">Rejected</option>
//             </select>
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[1200px]">
//               <thead>
//                 <tr className="bg-slate-50/50 border-b border-slate-100">
//                   <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Provider Details</th>
//                   <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Business info</th>
//                   <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Identity Details</th>
//                   <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Verification Docs</th>
//                   <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Approval Status</th>
//                   <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {filtered.map((sp) => (
//                   <tr key={sp._id} className="hover:bg-slate-50/80 transition-all">
//                     <td className="p-5">
//                       <div className="font-bold text-slate-900 text-base">{sp.fullName}</div>
//                       <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
//                         <Mail size={13} className="text-slate-400"/> {sp.email}
//                       </div>
//                       <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
//                         <Phone size={13} className="text-slate-400"/> {sp.mobile}
//                       </div>
//                     </td>

//                     <td className="p-5">
//                       <div className="font-bold text-indigo-600 flex items-center gap-1.5">
//                         <Building2 size={14}/> {sp.providerName}
//                       </div>
//                       <div className="text-[12px] text-slate-600 font-bold mt-1.5 px-2 py-0.5 bg-indigo-50 rounded-md inline-block">
//                         {sp.serviceCategory}
//                       </div>
//                       <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
//                         <MapPin size={12}/> {sp.location}
//                       </div>
//                     </td>

//                     <td className="p-5">
//                       <div className="space-y-1">
//                         <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Aadhar Number</div>
//                         <div className="text-sm font-mono font-bold text-slate-700">{sp.aadharNumber || "---"}</div>
//                         <div className="pt-2">
//                           <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded">PAN: {sp.panNumber || "N/A"}</span>
//                         </div>
//                       </div> {/* Fixed: Correct closing div */}
//                     </td>

//                     <td className="p-5">
//                       <div className="flex justify-center gap-3">
//                         {[
//                           { path: sp.aadharDoc, label: 'Aadhar' },
//                           { path: sp.panDoc, label: 'PAN' },
//                           { path: sp.gstDoc, label: 'GST' }
//                         ].map((doc, i) => {
//                           const url = getFileUrl(doc.path);
//                           return url ? (
//                             <a 
//                               key={i} 
//                               href={url} 
//                               target="_blank" 
//                               rel="noopener noreferrer"
//                               className="group/btn flex flex-col items-center gap-1 no-underline"
//                             >
//                               <div className="p-2.5 bg-white border-2 border-slate-100 rounded-xl group-hover/btn:border-indigo-500 group-hover/btn:text-indigo-600 group-hover/btn:shadow-lg group-hover/btn:shadow-indigo-100 transition-all text-slate-400">
//                                 <FileText size={18}/>
//                               </div>
//                               <span className="text-[9px] font-black text-slate-400 group-hover/btn:text-indigo-600 uppercase tracking-widest">{doc.label}</span>
//                             </a>
//                           ) : (
//                             <div key={i} className="flex flex-col items-center gap-1 opacity-20 grayscale cursor-not-allowed">
//                                <div className="p-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
//                                  <FileText size={18}/>
//                                </div>
//                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{doc.label}</span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </td>

//                     <td className="p-5 text-center">
//                       <div className="flex justify-center">
//                         {sp.status === 'approved' ? (
//                           <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black border border-emerald-100 uppercase tracking-tight">
//                             <CheckCircle2 size={14}/> Verified
//                           </div>
//                         ) : sp.status === 'rejected' ? (
//                           <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-[11px] font-black border border-red-100 uppercase tracking-tight">
//                             <XCircle size={14}/> Rejected
//                           </div>
//                         ) : (
//                           <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-black border border-amber-100 uppercase tracking-tight animate-pulse">
//                             <Clock size={14}/> Pending
//                           </div>
//                         )}
//                       </div>
//                     </td>

//                     <td className="p-5 text-right">
//                       <div className="flex justify-end gap-2">
//                         {sp.status !== 'pending' ? (
//                           <button 
//                             onClick={() => updateStatus(sp._id, 'pending')} 
//                             className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
//                             title="Reset to Pending"
//                           >
//                             <RotateCcw size={20}/>
//                           </button>
//                         ) : (
//                           <>
//                             <button 
//                               onClick={() => updateStatus(sp._id, 'approved')} 
//                               className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
//                             >
//                               APPROVE
//                             </button>
//                             <button 
//                               onClick={() => updateStatus(sp._id, 'rejected', true)} 
//                               className="p-2.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
//                               title="Reject Application"
//                             >
//                               <Ban size={22}/>
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filtered.length === 0 && (
//             <div className="py-32 text-center bg-slate-50/30">
//               <div className="inline-flex p-6 bg-white rounded-full shadow-sm text-slate-200 mb-4">
//                 <Search size={40}/>
//               </div>
//               <p className="text-slate-400 font-bold text-lg">No experts found matching your filters</p>
//               <button onClick={() => {setSearchTerm(""); setStatusFilter("All");}} className="mt-4 text-indigo-600 font-black text-sm hover:underline">Clear all filters</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from 'react';
import {
  Mail, Phone, MapPin, Briefcase,
  Search, RotateCcw, Ban, FileText, Building2,
  CheckCircle2, XCircle, Clock, ExternalLink, X, Eye, User, Info, Tag, Globe, ShieldCheck
} from 'lucide-react';

export default function AdminSPManager() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSP, setSelectedSP] = useState(null); // Full Profile Modal માટે

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/serviceproviders');
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, isRejected = false) => {
    const actionText = isRejected ? 'reject' : (status === 'approved' ? 'approve' : 'reset');
    if (!confirm(`Are you sure you want to ${actionText} this provider?`)) return;

    try {
      const res = await fetch('/api/admin/serviceproviders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: isRejected ? 'rejected' : status }),
      });
      if (res.ok) {
        fetchProviders();
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
    let cleanPath = path.replace(/^public\//, '');
    if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
      cleanPath = '/' + cleanPath;
    }
    return cleanPath;
  };

  const filtered = providers.filter(sp => {
    const matchesStatus = statusFilter === "All" || sp.status === statusFilter.toLowerCase();
    const searchableText = `${sp.fullName || ""} ${sp.providerName || ""} ${sp.email || ""}`.toLowerCase();
    return matchesStatus && searchableText.includes(searchTerm.toLowerCase());
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
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1700px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expert Network Admin</h1>
            <p className="text-slate-500 font-medium">Verify and manage service provider applications</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search name, email, or business..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border-none shadow-sm px-4 py-3 rounded-2xl bg-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-700"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Applications</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Provider Details</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Business info</th>
                  {/* <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Identity Details</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Verification Docs</th> */}
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Approval Status</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((sp) => (
                  <tr key={sp._id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-5">
                      <button
                        onClick={() => setSelectedSP(sp)}
                        className="font-bold text-slate-900 text-base hover:text-indigo-600 hover:underline transition-all"
                      >
                        {sp.fullName}
                      </button>
                      <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                        <Mail size={13} className="text-slate-400" /> {sp.email}
                      </div>
                      <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                        <Phone size={13} className="text-slate-400" /> {sp.mobile}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="font-bold text-indigo-600 flex items-center gap-1.5">
                        <Building2 size={14} /> {sp.providerName}
                      </div>
                      <div className="text-[12px] text-slate-600 font-bold mt-1.5 px-2 py-0.5 bg-indigo-50 rounded-md inline-block">
                        {sp.serviceCategory}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                        <MapPin size={12} /> {sp.location}
                      </div>
                    </td>

                    {/* <td className="p-5">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Aadhar Number</div>
                        <div className="text-sm font-mono font-bold text-slate-700">{sp.aadharNumber || "---"}</div>
                        <div className="pt-2">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded">PAN: {sp.panNumber || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        {[
                          { path: sp.aadharDoc, label: 'Aadhar' },
                          { path: sp.panDoc, label: 'PAN' },
                          { path: sp.gstDoc, label: 'GST' }
                        ].map((doc, i) => {
                          const url = getFileUrl(doc.path);
                          return url ? (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group/btn flex flex-col items-center gap-1 no-underline">
                              <div className="p-2.5 bg-white border-2 border-slate-100 rounded-xl group-hover/btn:border-indigo-500 group-hover/btn:text-indigo-600 transition-all text-slate-400">
                                <FileText size={18} />
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.label}</span>
                            </a>
                          ) : (
                            <div key={i} className="flex flex-col items-center gap-1 opacity-20 grayscale cursor-not-allowed">
                              <div className="p-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                                <FileText size={18} />
                              </div>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{doc.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td> */}

                    <td className="p-5 text-center">
                      <div className="flex justify-center">
                        {sp.status === 'approved' ? (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black border border-emerald-100 uppercase tracking-tight">
                            <CheckCircle2 size={14} /> Verified
                          </div>
                        ) : sp.status === 'rejected' ? (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-[11px] font-black border border-red-100 uppercase tracking-tight">
                            <XCircle size={14} /> Rejected
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-black border border-amber-100 uppercase tracking-tight animate-pulse">
                            <Clock size={14} /> Pending
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        {sp.status !== 'pending' ? (
                          <button
                            onClick={() => updateStatus(sp._id, 'pending')}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                            title="Reset to Pending"
                          >
                            <RotateCcw size={20} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => updateStatus(sp._id, 'approved')}
                              className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                              APPROVE
                            </button>
                            <button
                              onClick={() => updateStatus(sp._id, 'rejected', true)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                              title="Reject Application"
                            >
                              <Ban size={22} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-32 text-center bg-slate-50/30">
              <div className="inline-flex p-6 bg-white rounded-full shadow-sm text-slate-200 mb-4">
                <Search size={40} />
              </div>
              <p className="text-slate-400 font-bold text-lg">No experts found matching your filters</p>
              <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); }} className="mt-4 text-indigo-600 font-black text-sm hover:underline">Clear all filters</button>
            </div>
          )}
        </div>

        {/* --- Full Profile Modal --- */}
        {selectedSP && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setSelectedSP(null)}
          >
            <div
              className="bg-white w-full max-w-4xl my-8 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-xl leading-none">Provider Profile</h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-black">Expert Verification System</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSP(null)}
                  className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto custom-scrollbar">

                {/* Left Side: Personal & Docs */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Info size={14} /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <DetailItem label="Full Name" value={selectedSP.fullName} />
                      <DetailItem label="Email Address" value={selectedSP.email} />
                      <DetailItem label="Mobile Number" value={selectedSP.mobile} />
                      <DetailItem label="Aadhar Card No" value={selectedSP.aadharNumber} />
                      <DetailItem label="PAN Card No" value={selectedSP.panNumber} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <FileText size={14} /> Verification Documents
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <DocLink label="Aadhar Document" url={getFileUrl(selectedSP.aadharDoc)} />
                      <DocLink label="PAN Document" url={getFileUrl(selectedSP.panDoc)} />
                      <DocLink label="GST Registration" url={getFileUrl(selectedSP.gstDoc)} />
                    </div>
                  </section>
                </div>

                {/* Right Side: Business & Address */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Building2 size={14} /> Business Details
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                      <DetailItem label="Business/Provider Name" value={selectedSP.providerName} />
                      <DetailItem label="Service Category" value={selectedSP.serviceCategory} highlight />
                      <DetailItem label="Location" value={selectedSP.location} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <MapPin size={14} /> Address Details
                    </h3>
                    <div className="p-5 border-2 border-dashed border-slate-100 rounded-3xl">
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">
                        {selectedSP.address || "No detailed address provided."}
                      </p>
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-slate-50 border-t flex items-center justify-between">
                <button
                  onClick={() => setSelectedSP(null)}
                  className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-900 transition-colors"
                >
                  CLOSE PROFILE
                </button>

                <div className="flex gap-3">
                  {selectedSP.status !== 'pending' ? (
                    <button
                      onClick={() => { updateStatus(selectedSP._id, 'pending'); setSelectedSP(null); }}
                      className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-slate-300"
                    >
                      RESET TO PENDING
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { updateStatus(selectedSP._id, 'rejected', true); setSelectedSP(null); }}
                        className="text-red-600 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-red-50"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => { updateStatus(selectedSP._id, 'approved'); setSelectedSP(null); }}
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200"
                      >
                        APPROVE NOW
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function DetailItem({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>{value || "---"}</p>
    </div>
  );
}

function DocLink({ label, url }) {
  return url ? (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all group no-underline"
    >
      <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
        <FileText size={14} className="text-indigo-500" /> {label}
      </span>
      <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-600" />
    </a>
  ) : (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl opacity-50 cursor-not-allowed">
      <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
        <XCircle size={14} /> {label} (Not Uploaded)
      </span>
    </div>
  );
}