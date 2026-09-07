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
import * as XLSX from "xlsx";
import {
  Building2, User, MapPin, Clock,
  Briefcase, Banknote, Search, ExternalLink,
  Phone, Mail, Calendar, Wrench, ListPlus, Users, Trash2, Sparkles, Copy, CheckCheck, Download
} from "lucide-react";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Additional Filter States
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterJobType, setFilterJobType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProfession, setFilterProfession] = useState("All");
  const [filterIndustry, setFilterIndustry] = useState("All");

  // Edit Job States
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    salaryRange: "",
    experienceLevel: "",
    description: "",
    jobType: "",
    status: ""
  });

  // Email States
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState("");
  const [generatedJobs, setGeneratedJobs] = useState([]);
  const [copied, setCopied] = useState(false);

  // Mailing List State
  const [listType, setListType] = useState("candidate");

  const locations = ["All", ...Array.from(new Set(jobs.map(j => j.location).filter(Boolean)))];
  const jobTypes = ["All", ...Array.from(new Set(jobs.map(j => j.jobType).filter(Boolean)))];
  const professions = ["All", ...Array.from(new Set(jobs.map(j => j.profession).filter(Boolean)))];
  const industries = ["All", ...Array.from(new Set(jobs.map(j => j.industry).filter(Boolean)))];

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

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(job => ({
      Title: job.title,
      Company: job.companyDetails?.companyName || job.companyName || job.company || "N/A",
      Email: job.companyDetails?.email || job.email || "N/A",
      Mobile: job.companyDetails?.mobile || job.phone || "N/A",
      Profession: job.profession || "N/A",
      Industry: job.industry || "N/A",
      JobType: job.jobType || "N/A",
      Location: job.location || "N/A",
      SalaryRange: job.salaryRange || "N/A",
      ExperienceLevel: job.experienceLevel || "N/A",
      Status: job.status || "N/A"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jobs");
    XLSX.writeFile(wb, `Jobs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

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
        setGeneratedJobs((prev) => prev.filter((j) => j._id !== id));
      } else {
        alert("❌ Failed to delete job.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting job");
    }
  };

  // --- Delete Included Job ---
  const handleDeleteIncludedJob = async (id) => {
    await handleDelete(id);
  };

  // --- Start Edit Function ---
  const handleStartEdit = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || "",
      companyName: job.companyDetails?.companyName || job.companyName || job.company || "Unknown Company",
      location: job.location || "",
      salaryRange: job.salaryRange || "",
      experienceLevel: job.experienceLevel || "",
      description: job.description || "",
      jobType: job.jobType || "",
      status: job.status || "active"
    });
  };

  // --- Save Edit Function ---
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/all-jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingJob._id,
          ...editFormData
        })
      });

      if (res.ok) {
        alert("✅ Job updated successfully!");
        setEditingJob(null);
        loadJobs();
        setGeneratedJobs((prev) =>
          prev.map((j) =>
            j._id === editingJob._id
              ? {
                  ...j,
                  title: editFormData.title,
                  companyName: editFormData.companyName,
                  companyDetails: {
                    ...j.companyDetails,
                    companyName: editFormData.companyName
                  },
                  location: editFormData.location,
                  salaryRange: editFormData.salaryRange,
                  experienceLevel: editFormData.experienceLevel,
                  description: editFormData.description,
                  jobType: editFormData.jobType,
                  status: editFormData.status
                }
              : j
          )
        );
      } else {
        alert("❌ Failed to update job.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating job");
    }
  };

  // --- Flag Job as Negative ---
  const handleFlagJob = async (id, targetStatus = "negative") => {
    try {
      const res = await fetch("/api/admin/all-jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: targetStatus })
      });
      if (res.ok) {
        alert(targetStatus === "negative" ? "🚩 Job marked as Negative & moved to Negative List!" : "✅ Job restored to Active!");
        setJobs(jobs.map(j => j._id === id ? { ...j, status: targetStatus } : j));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const filteredData = jobs.filter(j => {
    const matchesTab = tab === "all" ? true : j.postedByRole === tab;
    
    const matchesLocation = filterLocation === "All" || j.location === filterLocation;
    const matchesJobType = filterJobType === "All" || j.jobType === filterJobType;
    const matchesProfession = filterProfession === "All" || j.profession === filterProfession;
    const matchesIndustry = filterIndustry === "All" || j.industry === filterIndustry;
    
    const matchesStatus = filterStatus === "negative"
      ? j.status === "negative"
      : filterStatus === "All"
        ? j.status !== "negative"
        : j.status === filterStatus ||
          (filterStatus === "published" && j.status === "active") ||
          (filterStatus === "active" && j.status === "published");

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      j.title?.toLowerCase().includes(searchLower) ||
      j.name?.toLowerCase().includes(searchLower) ||
      j.companyDetails?.companyName?.toLowerCase().includes(searchLower) ||
      j.companyDetails?.contactPersonName?.toLowerCase().includes(searchLower);
      
    return matchesTab && matchesLocation && matchesJobType && matchesStatus && matchesSearch && matchesProfession && matchesIndustry;
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
        const mailingListObjects = targetData.map(j => ({
          _id: j._id,
          id: j._id,
          name: j.title || "Untitled Job",
          email: j.companyDetails?.email || j.email || "N/A",
          city: j.location || "N/A",
          role: j.postedByRole
        }));
        localStorage.setItem("selectedMailingList", JSON.stringify(mailingListObjects));
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

  const handleGeneratePost = async () => {
    try {
      setGeneratingPost(true);
      setCopied(false);
      const res = await fetch("/api/admin/jobs/featured-post", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate post");
      }

      setGeneratedPost(data.content || "");
      setGeneratedMediaUrl(data.mediaUrl || "");
      setGeneratedJobs(Array.isArray(data.jobs) ? data.jobs : []);
      alert("✅ Latest jobs post created successfully!");
    } catch (err) {
      alert(err.message || "Failed to generate post");
    } finally {
      setGeneratingPost(false);
    }
  };

  const handleCopyPost = async () => {
    if (!generatedPost) return;
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      alert("Copy failed");
    }
  };

  const handleDownloadPoster = async () => {
    if (!generatedMediaUrl) return;
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("Download failed");
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Download failed");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `latest-jobs-poster-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/jpeg", 0.95);
    };

    image.onerror = () => {
      alert("Download failed");
    };

    image.src = generatedMediaUrl;
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
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleDownloadExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Download size={16} />
              Download Excel
            </button>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search jobs, companies or HR..."
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex bg-white border border-gray-200 rounded-md p-1 shadow-sm">
            {['all', 'recruiter', 'candidate', 'serviceprovider'].map((t) => (
              <button
                key={t}
                onClick={() => { 
                  setTab(t); 
                  setSelectedIds([]); 
                  setSelectAll(false); 
                  setFilterLocation("All"); 
                  setFilterJobType("All"); 
                  setFilterStatus("All"); 
                  setFilterProfession("All");
                  setFilterIndustry("All");
                }}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {t === "all" ? "All Posts" : t === "serviceprovider" ? "Services" : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Profession Select */}
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            >
              <option value="All">All Professions</option>
              {professions.filter(p => p !== "All").map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>

            {/* Industry Select */}
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            >
              <option value="All">All Industries</option>
              {industries.filter(i => i !== "All").map((i, idx) => (
                <option key={idx} value={i}>{i}</option>
              ))}
            </select>

            {/* Location Select */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            >
              <option value="All">All Locations</option>
              {locations.filter(loc => loc !== "All").map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Job Type Select */}
            <select
              value={filterJobType}
              onChange={(e) => setFilterJobType(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            >
              <option value="All">All Types</option>
              {jobTypes.filter(type => type !== "All").map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active / Published</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
              <option value="negative">🚩 Negative List ({jobs.filter(j => j.status === "negative").length})</option>
            </select>
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
                      <tr key={i} className={`hover:bg-gray-50 transition-colors ${job.status === 'negative' ? 'bg-red-50/60' : selectedIds.includes(job._id) ? 'bg-blue-50' : ''}`}>
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
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            job.status === 'negative' ? 'bg-red-100 text-red-700 border-red-200' : job.status === 'published' || job.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {job.status === 'negative' ? 'FLAGGED / NEGATIVE' : job.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === "negative" ? (
                              <button
                                onClick={() => handleFlagJob(job._id, "active")}
                                className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                                title="Approve & Restore to Active"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFlagJob(job._id, "negative")}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors font-bold text-xs"
                                title="Flag & Move to Negative List"
                              >
                                🚩 Flag
                              </button>
                            )}
                            <button 
                              onClick={() => handleStartEdit(job)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title="Edit Job"
                            >
                              <ExternalLink size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Delete Job"
                            >
                              <Trash2 size={16} />
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

        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-md">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Auto Post Generator</h3>
              </div>
              <p className="text-sm text-gray-500">
                Creates one post from the latest 5 jobs with basic details and the apply note: Register now at popoal.com
              </p>
            </div>
            <button
              onClick={handleGeneratePost}
              disabled={generatingPost}
              className="px-6 py-3 bg-amber-500 text-white rounded-md text-sm font-semibold hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              {generatingPost ? "Generating..." : "Generate Latest 5 Job Post"}
            </button>
          </div>

          {generatedPost && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">Generated Post</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPost}
                      className="px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
                    >
                      {copied ? <CheckCheck size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadPoster}
                      disabled={!generatedMediaUrl}
                      className="px-3 py-2 rounded-md bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-6 font-medium">
                  {generatedPost}
                </pre>
                {generatedMediaUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <img
                      src={generatedMediaUrl}
                      alt="Generated hiring poster"
                      className="w-full h-auto block"
                    />
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Included Jobs</h4>
                <div className="space-y-3">
                  {generatedJobs.map((job, index) => (
                    <div key={job._id || index} className="p-3 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{job.title || "Untitled Job"}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {job.companyDetails?.companyName || job.companyName || job.company || "Unknown Company"}
                          {" • "}
                          {job.location || "Remote"}
                          {" • "}
                          {job.experienceLevel || "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(job)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Job"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteIncludedJob(job._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Job Details</h3>
                <p className="text-sm text-slate-500 font-medium">Update posting information in the database</p>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Salary / Budget</label>
                  <input
                    type="text"
                    required
                    value={editFormData.salaryRange}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryRange: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Experience Level / Category</label>
                  <input
                    type="text"
                    required
                    value={editFormData.experienceLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Job Type</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jobType}
                    onChange={(e) => setEditFormData({ ...editFormData, jobType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  >
                    <option value="active">Active / Published</option>
                    <option value="published">Active / Published</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Job Description</label>
                <textarea
                  rows="4"
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
