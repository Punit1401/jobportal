// "use client";
// import { useState, useEffect } from "react";
// import {
//   Building2, User, MapPin, Clock,
//   Briefcase, Banknote, Search, ExternalLink,
//   Phone, Mail, Calendar, Wrench, ListPlus, Users
// } from "lucide-react";

// export default function AdminDashboard() {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Email States
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [mailSubject, setMailSubject] = useState("");
//   const [mailBody, setMailBody] = useState("");
//   const [sending, setSending] = useState(false);

//   // Mailing List State
//   const [listType, setListType] = useState("candidate");

//   useEffect(() => {
//     const loadJobs = async () => {
//       try {
//         const res = await fetch("/api/admin/all-jobs");
//         if (!res.ok) throw new Error("Failed to fetch jobs");
//         const data = await res.json();
//         setJobs(data);
//       } catch (err) {
//         console.error("Failed to fetch", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadJobs();
//   }, []);

//   const filteredData = jobs.filter(j => {
//     const matchesTab = tab === "all" ? true : j.postedByRole === tab;
//     const searchLower = searchTerm.toLowerCase();
//     const matchesSearch =
//       j.title?.toLowerCase().includes(searchLower) ||
//       j.name?.toLowerCase().includes(searchLower) ||
//       j.companyDetails?.companyName?.toLowerCase().includes(searchLower) ||
//       j.companyDetails?.contactPersonName?.toLowerCase().includes(searchLower);
//     return matchesTab && matchesSearch;
//   });

//   const handleSelect = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedIds([]);
//       setSelectAll(false);
//     } else {
//       const allIds = filteredData.map((j) => j._id);
//       setSelectedIds(allIds);
//       setSelectAll(true);
//     }
//   };

//   const handleCreateMailingList = async () => {
//     const targetData = jobs.filter(j => j.postedByRole === listType);
//     const targetEmails = targetData
//       .map(j => j.companyDetails?.email || j.email)
//       .filter(email => email && email !== "N/A");
//     const targetIds = targetData.map(j => j._id);

//     if (targetIds.length === 0) {
//       alert(`No active records found for ${listType}`);
//       return;
//     }

//     try {
//       setSending(true);
//       const res = await fetch("/api/sendMail", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           subject: `Mailing List: ${listType.toUpperCase()} - ${new Date().toLocaleDateString()}`,
//           message: "This is a saved mailing list.",
//           type: listType,
//           userIds: targetIds,
//           sentEmails: targetEmails,
//           recipientsCount: targetIds.length,
//           isSent: false
//         })
//       });

//       if (res.ok) {
//         localStorage.setItem("selectedMailingList", JSON.stringify(targetIds));
//         setSelectedIds(targetIds);
//         alert(`✅ ${listType.toUpperCase()} List Saved!`);
//       } else {
//         alert("❌ Failed to save list.");
//       }
//     } catch (err) {
//       alert("Error saving list");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleSendMail = async (ids, all = false) => {
//     if (!mailSubject.trim() || !mailBody.trim()) {
//       alert("Please enter both subject and message!");
//       return;
//     }
//     try {
//       setSending(true);
//       const res = await fetch("/api/sendMail", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           subject: mailSubject,
//           message: mailBody,
//           userIds: all ? [] : ids,
//           allUsers: all,
//           type: "jobs",
//         }),
//       });
//       if (res.ok) {
//         alert(`✅ Sent successfully!`);
//         setMailSubject(""); setMailBody(""); setSelectedIds([]); setSelectAll(false);
//       }
//     } catch (err) {
//       alert("Error sending mail");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
//       <div className="max-w-[1600px] mx-auto">

//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Admin Job Management</h1>
//             <p className="text-sm text-gray-500">Monitor and manage all job postings and communications</p>
//           </div>
//           <div className="relative w-full md:w-96">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search jobs, companies or HR..."
//               className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Filters and Tabs */}
//         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//           <div className="flex bg-white border border-gray-200 rounded-md p-1 shadow-sm">
//             {['all', 'recruiter', 'candidate', 'serviceprovider'].map((t) => (
//               <button
//                 key={t}
//                 onClick={() => { setTab(t); setSelectedIds([]); setSelectAll(false); }}
//                 className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//               >
//                 {t === "all" ? "All Posts" : t === "serviceprovider" ? "Services" : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Main Table Wrapper */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left border-collapse">
//               <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase text-xs font-semibold">
//                 <tr>
//                   <th className="p-4 w-12 text-center">
//                     <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
//                   </th>
//                   <th className="p-4">Job Title & Entity</th>
//                   <th className="p-4">Contact Info</th>
//                   <th className="p-4">Details</th>
//                   <th className="p-4">Location/Salary</th>
//                   <th className="p-4 text-center">Status</th>
//                   <th className="p-4 text-right">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {loading ? (
//                   <tr><td colSpan="7" className="p-12 text-center text-gray-500">Loading records...</td></tr>
//                 ) : filteredData.length > 0 ? (
//                   filteredData.map((job, i) => {
//                     const email = job.companyDetails?.email || job.email || "N/A";
//                     const mobile = job.companyDetails?.mobile || job.phone || "N/A";
//                     const poster = job.companyDetails?.companyName || job.name || "Individual";

//                     return (
//                       <tr key={i} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(job._id) ? 'bg-blue-50' : ''}`}>
//                         <td className="p-4 text-center">
//                           <input type="checkbox" checked={selectedIds.includes(job._id)} onChange={() => handleSelect(job._id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
//                         </td>
//                         <td className="p-4">
//                           <div className="font-semibold text-gray-900">{job.title}</div>
//                           <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
//                             {job.postedByRole === 'serviceprovider' ? <Wrench size={12} /> : <User size={12} />}
//                             {poster}
//                           </div>
//                         </td>
//                         <td className="p-4 space-y-1 text-xs">
//                           <div className="flex items-center gap-2 text-gray-600"><Mail size={12} /> {email}</div>
//                           <div className="flex items-center gap-2 text-gray-600"><Phone size={12} /> {mobile}</div>
//                         </td>
//                         <td className="p-4 text-xs space-y-1">
//                           <div className="flex items-center gap-2"><Briefcase size={12} /> {job.experienceLevel || "N/A"}</div>
//                           <div className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block">{job.jobType}</div>
//                         </td>
//                         <td className="p-4 text-xs">
//                           <div className="font-medium flex items-center gap-1"><MapPin size={12} className="text-red-500" /> {job.location || 'Remote'}</div>
//                           <div className="text-green-600 font-semibold mt-1">{job.salaryRange || 'Not Specified'}</div>
//                         </td>
//                         <td className="p-4 text-center">
//                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${job.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
//                             }`}>
//                             {job.status}
//                           </span>
//                         </td>
//                         <td className="p-4 text-right">
//                           <button className="text-gray-400 hover:text-blue-600 transition-colors">
//                             <ExternalLink size={18} />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr><td colSpan="7" className="p-12 text-center text-gray-400 font-medium">No matching records found.</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Action Sections Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Create Mailing List */}
//           <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-2 bg-blue-100 text-blue-600 rounded-md"><ListPlus size={20} /></div>
//                 <h3 className="font-bold text-gray-800">Quick Mailing List</h3>
//               </div>
//               <p className="text-sm text-gray-500 mb-4">Save a specific group of users as a mailing list for future broadcasts.</p>
//               <select
//                 value={listType}
//                 onChange={(e) => setListType(e.target.value)}
//                 className="w-full p-2 mb-4 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="candidate">Candidates</option>
//                 <option value="recruiter">Recruiters</option>
//                 <option value="serviceprovider">Service Providers</option>
//               </select>
//             </div>
//             <button
//               onClick={handleCreateMailingList}
//               disabled={sending}
//               className="w-full bg-gray-900 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               <Users size={16} /> {sending ? "Saving..." : "Generate List"}
//             </button>
//           </div>

//           {/* Broadcast Email Form */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//               <Mail size={18} className="text-blue-600" /> Broadcast Message
//             </h3>
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 value={mailSubject}
//                 onChange={(e) => setMailSubject(e.target.value)}
//                 placeholder="Subject Line"
//                 className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//               />
//               <textarea
//                 rows="3"
//                 value={mailBody}
//                 onChange={(e) => setMailBody(e.target.value)}
//                 placeholder="Type your message here..."
//                 className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//               ></textarea>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => handleSendMail(selectedIds, false)}
//                   disabled={sending || selectedIds.length === 0}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
//                 >
//                   {sending ? "Sending..." : `Send to Selected (${selectedIds.length})`}
//                 </button>
//                 <button
//                   onClick={() => handleSendMail([], true)}
//                   disabled={sending}
//                   className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
//                 >
//                   Send to All
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import {
  Building2, User, MapPin, Clock,
  Briefcase, Banknote, Search, ExternalLink,
  Phone, Mail, Calendar, Wrench, ListPlus, Users, Trash2
} from "lucide-react";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Email States
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [sending, setSending] = useState(false);

  // Mailing List State
  const [listType, setListType] = useState("candidate");

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/all-jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // --- Delete Function ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch(`/api/admin/all-jobs?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("✅ Job deleted successfully!");
        setJobs(jobs.filter((j) => j._id !== id));
      } else {
        alert("❌ Failed to delete job.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting job");
    }
  };

  const filteredData = jobs.filter(j => {
    const matchesTab = tab === "all" ? true : j.postedByRole === tab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      j.title?.toLowerCase().includes(searchLower) ||
      j.name?.toLowerCase().includes(searchLower) ||
      j.companyDetails?.companyName?.toLowerCase().includes(searchLower) ||
      j.companyDetails?.contactPersonName?.toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = filteredData.map((j) => j._id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleCreateMailingList = async () => {
    const targetData = jobs.filter(j => j.postedByRole === listType);
    const targetEmails = targetData
      .map(j => j.companyDetails?.email || j.email)
      .filter(email => email && email !== "N/A");
    const targetIds = targetData.map(j => j._id);

    if (targetIds.length === 0) {
      alert(`No active records found for ${listType}`);
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Mailing List: ${listType.toUpperCase()} - ${new Date().toLocaleDateString()}`,
          message: "This is a saved mailing list.",
          type: listType,
          userIds: targetIds,
          sentEmails: targetEmails,
          recipientsCount: targetIds.length,
          isSent: false
        })
      });

      if (res.ok) {
        localStorage.setItem("selectedMailingList", JSON.stringify(targetIds));
        setSelectedIds(targetIds);
        alert(`✅ ${listType.toUpperCase()} List Saved!`);
      } else {
        alert("❌ Failed to save list.");
      }
    } catch (err) {
      alert("Error saving list");
    } finally {
      setSending(false);
    }
  };

  const handleSendMail = async (ids, all = false) => {
    if (!mailSubject.trim() || !mailBody.trim()) {
      alert("Please enter both subject and message!");
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mailSubject,
          message: mailBody,
          userIds: all ? [] : ids,
          allUsers: all,
          type: "jobs",
        }),
      });
      if (res.ok) {
        alert(`✅ Sent successfully!`);
        setMailSubject(""); setMailBody(""); setSelectedIds([]); setSelectAll(false);
      }
    } catch (err) {
      alert("Error sending mail");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Job Management</h1>
            <p className="text-sm text-gray-500">Monitor and manage all job postings and communications</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs, companies or HR..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex bg-white border border-gray-200 rounded-md p-1 shadow-sm">
            {['all', 'recruiter', 'candidate', 'serviceprovider'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelectedIds([]); setSelectAll(false); }}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {t === "all" ? "All Posts" : t === "serviceprovider" ? "Services" : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Main Table Wrapper */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="p-4">Job Title & Entity</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Location/Salary</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="7" className="p-12 text-center text-gray-500">Loading records...</td></tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((job, i) => {
                    const email = job.companyDetails?.email || job.email || "N/A";
                    const mobile = job.companyDetails?.mobile || job.phone || "N/A";
                    const poster = job.companyDetails?.companyName || job.name || "Individual";

                    return (
                      <tr key={i} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(job._id) ? 'bg-blue-50' : ''}`}>
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={selectedIds.includes(job._id)} onChange={() => handleSelect(job._id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{job.title}</div>
                          <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            {job.postedByRole === 'serviceprovider' ? <Wrench size={12} /> : <User size={12} />}
                            {poster}
                          </div>
                        </td>
                        <td className="p-4 space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-gray-600"><Mail size={12} /> {email}</div>
                          <div className="flex items-center gap-2 text-gray-600"><Phone size={12} /> {mobile}</div>
                        </td>
                        <td className="p-4 text-xs space-y-1">
                          <div className="flex items-center gap-2"><Briefcase size={12} /> {job.experienceLevel || "N/A"}</div>
                          <div className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block">{job.jobType}</div>
                        </td>
                        <td className="p-4 text-xs">
                          <div className="font-medium flex items-center gap-1"><MapPin size={12} className="text-red-500" /> {job.location || 'Remote'}</div>
                          <div className="text-green-600 font-semibold mt-1">{job.salaryRange || 'Not Specified'}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${job.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                              <ExternalLink size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Job"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" className="p-12 text-center text-gray-400 font-medium">No matching records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Mailing List */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md"><ListPlus size={20} /></div>
                <h3 className="font-bold text-gray-800">Quick Mailing List</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Save a specific group of users as a mailing list for future broadcasts.</p>
              <select
                value={listType}
                onChange={(e) => setListType(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="candidate">Candidates</option>
                <option value="recruiter">Recruiters</option>
                <option value="serviceprovider">Service Providers</option>
              </select>
            </div>
            <button
              onClick={handleCreateMailingList}
              disabled={sending}
              className="w-full bg-gray-900 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Users size={16} /> {sending ? "Saving..." : "Generate List"}
            </button>
          </div>

          {/* Broadcast Email Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={18} className="text-blue-600" /> Broadcast Message
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
                placeholder="Subject Line"
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <textarea
                rows="3"
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              ></textarea>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSendMail(selectedIds, false)}
                  disabled={sending || selectedIds.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {sending ? "Sending..." : `Send to Selected (${selectedIds.length})`}
                </button>
                <button
                  onClick={() => handleSendMail([], true)}
                  disabled={sending}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Send to All
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}