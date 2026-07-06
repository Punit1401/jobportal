// "use client";

// import { useEffect, useState } from "react";
// import * as XLSX from "xlsx";

// export default function CandidatesAdmin() {
//   const [candidates, setCandidates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deletingIds, setDeletingIds] = useState([]);
//   const [selectedIds, setSelectedIds] = useState([]);

//   const [professionFilter, setProfessionFilter] = useState("All");
//   const [positionFilter, setPositionFilter] = useState("All");
//   const [roleFilter, setRoleFilter] = useState("All");
//   const [experienceFilter, setExperienceFilter] = useState("All");
//   const [cityFilter, setCityFilter] = useState("All");

//   const [notificationMessage, setNotificationMessage] = useState("");
//   const [sending, setSending] = useState(false);

//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailBody, setEmailBody] = useState("");
//   const [sendingMail, setSendingMail] = useState(false);

//   useEffect(() => {
//     const fetchCandidates = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/candidates", { cache: "no-store" });
//         if (!res.ok) throw new Error("Failed to fetch candidates");
//         const data = await res.json();
//         if (Array.isArray(data)) setCandidates(data);
//         else if (data && typeof data === 'object') setCandidates([data]);
//         else setCandidates([]);
//       } catch (err) {
//         console.error("Error fetching:", err);
//         setCandidates([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCandidates();
//   }, []);

//   const handleDelete = async (ids) => {
//     if (!ids || ids.length === 0) return alert("Select at least one candidate!");
//     if (!confirm(`Are you sure you want to delete ${ids.length} candidate(s)?`)) return;
//     try {
//       setDeletingIds(ids);
//       for (const id of ids) {
//         const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
//       }
//       setCandidates((prev) => prev.filter((c) => !ids.includes(c._id)));
//       setSelectedIds([]);
//       alert("✅ Candidate(s) deleted successfully!");
//     } catch (err) { alert("Error deleting candidates"); } finally { setDeletingIds([]); }
//   };

//   const handleSendMail = async (ids = [], broadcast = false) => {
//     if (!emailSubject.trim() || !emailBody.trim()) return alert("⚠️ Please enter both subject and message!");
//     if (!broadcast && (!ids || ids.length === 0)) return alert("⚠️ Please select at least one candidate!");
//     if (!confirm(broadcast ? "Send to ALL?" : `Send to ${ids.length}?`)) return;
//     try {
//       setSendingMail(true);
//       let emailsToSend = broadcast ? candidates.map(c => c.email).filter(Boolean) : ids.map(id => candidates.find(c => c._id === id)?.email).filter(Boolean);
//       const res = await fetch("/api/sendMail", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subject: emailSubject, message: emailBody, type: "candidates", emails: emailsToSend }),
//       });
//       if (res.ok) { setEmailSubject(""); setEmailBody(""); alert("✅ Mail sent!"); }
//     } catch (err) { alert("Error sending mail"); } finally { setSendingMail(false); }
//   };

//   const handleSendNotification = async (ids, broadcast = false) => {
//     if (!notificationMessage.trim()) return alert("Please enter a message!");
//     if (!broadcast && (!ids || ids.length === 0)) return alert("Please select at least one user!");
//     try {
//       setSending(true);
//       const body = broadcast ? { title: "Notification", message: notificationMessage, broadcast: true } : { title: "Notification", message: notificationMessage, userIds: ids.map((id) => candidates.find((c) => c._id === id)?.userId).filter(Boolean) };
//       const res = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
//       if (res.ok) { setNotificationMessage(""); alert("✅ Notification sent!"); }
//     } catch (err) { alert("Error"); } finally { setSending(false); }
//   };

//   const handleDownloadExcel = () => {
//     const ws = XLSX.utils.json_to_sheet(filteredCandidates);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Candidates");
//     XLSX.writeFile(wb, `Candidates_${new Date().toISOString().split("T")[0]}.xlsx`);
//   };

//   const filteredCandidates = Array.isArray(candidates) ? candidates.filter((c) => {
//     return (
//       (professionFilter === "All" || c.profession === professionFilter) &&
//       (positionFilter === "All" || c.position === positionFilter) &&
//       (roleFilter === "All" || c.role === roleFilter) &&
//       (experienceFilter === "All" || c.experience === experienceFilter) &&
//       (cityFilter === "All" || c.city === cityFilter)
//     );
//   }) : [];

//   const getUniqueValues = (key) => ["All", ...new Set(Array.isArray(candidates) ? candidates.map((c) => c[key]).filter(Boolean) : [])];

//   const toggleSelect = (id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
//   const selectAll = (checked) => setSelectedIds(checked ? filteredCandidates.map((c) => c._id) : []);


//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">All Candidates</h1>

//       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
//         <Filter label="Profession" value={professionFilter} setValue={setProfessionFilter} options={getUniqueValues("profession")} />
//         <Filter label="Position" value={positionFilter} setValue={setPositionFilter} options={getUniqueValues("position")} />
//         <Filter label="Role" value={roleFilter} setValue={setRoleFilter} options={getUniqueValues("role")} />
//         <Filter label="Experience" value={experienceFilter} setValue={setExperienceFilter} options={getUniqueValues("experience")} />
//         <Filter label="City" value={cityFilter} setValue={setCityFilter} options={getUniqueValues("city")} />
//       </div>

//       <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//         <p className="text-sm text-gray-600">Showing {filteredCandidates.length} of {candidates.length}</p>
//         <div className="flex gap-3">
//           <button onClick={handleDownloadExcel} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">⬇️ Download Excel</button>
//           {selectedIds.length > 0 && (
//             <>
//               <button onClick={() => handleSendNotification(selectedIds)} disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded">Notify ({selectedIds.length})</button>
//               <button onClick={() => handleDelete(selectedIds)} disabled={deletingIds.length > 0} className="bg-red-600 text-white px-4 py-2 rounded">Delete ({selectedIds.length})</button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* ✅ Table with All Fields separated */}
//       <div className="overflow-x-auto border border-gray-300 rounded shadow-sm">
//         <table className="min-w-[350px] w-full text-sm table-auto border-collapse">
//           <thead className="bg-gray-200 sticky top-0">
//             <tr>
//               <th className="border px-2 py-2 w-10 text-center"><input type="checkbox" checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0} onChange={(e) => selectAll(e.target.checked)} /></th>
//               <th className="border px-2 py-2">Date</th>
//               <th className="border px-2 py-2">Full Name</th>
//               <th className="border px-2 py-2">Email</th>
//               <th className="border px-2 py-2">Mobile</th>
//               {/* <th className="border px-2 py-2">DOB</th> */}
//               {/* <th className="border px-2 py-2">Gender</th> */}
//               <th className="border px-2 py-2">Profession</th>
//               {/* <th className="border px-2 py-2">Position</th>
//               <th className="border px-2 py-2">Role</th>
//               <th className="border px-2 py-2">Address</th> */}
//               <th className="border px-2 py-2">City</th>
//               {/* <th className="border px-2 py-2">State</th> */}
//               {/* <th className="border px-2 py-2">Pincode</th>
//               <th className="border px-2 py-2">Experience Status</th>
//               <th className="border px-2 py-2">Company</th>
//               <th className="border px-2 py-2">Job Dept</th>
//               <th className="border px-2 py-2">Industry</th>
//               <th className="border px-2 py-2">Job From</th>
//               <th className="border px-2 py-2">Job To</th>
//               <th className="border px-2 py-2">Last Salary</th>
//               <th className="border px-2 py-2">Exp. Salary</th>
//               <th className="border px-2 py-2">Notice Period</th>
//               <th className="border px-2 py-2">10th Board (Year/%)</th>
//               <th className="border px-2 py-2">12th Board (Year/%)</th>
//               <th className="border px-2 py-2">Graduation (Uni/Year/%)</th>
//               <th className="border px-2 py-2">Post Grad (Uni/Year/%)</th>
//               <th className="border px-2 py-2">ITI (Uni/Year)</th>
//               <th className="border px-2 py-2">Diploma (Uni/Year)</th>
//               <th className="border px-2 py-2">Skills</th>
//               <th className="border px-2 py-2">GitHUb</th>
//               <th className="border px-2 py-2">Portfolio</th>
//               <th className="border px-2 py-2">Resume</th>
//               <th className="border px-2 py-2">Cover Letter</th>
//               <th className="border px-2 py-2">Experience Letter</th> */}
//               <th className="border px-2 py-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredCandidates.map((c) => (
//               <tr key={c._id} className="hover:bg-gray-50 border-b">
//                 <td className="border px-2 py-2 text-center"><input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} /></td>
//                 <td className="border px-2 py-2 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
//                 <td className="border px-2 py-2 font-medium">{c.fullName || "-"}</td>
//                 <td className="border px-2 py-2">{c.email || "-"}</td>
//                 <td className="border px-2 py-2">{c.mobile || "-"}</td>
//                 {/* <td className="border px-2 py-2">{c.dob || "-"}</td> */}
//                 {/* <td className="border px-2 py-2">{c.gender || "-"}</td> */}
//                 <td className="border px-2 py-2">{c.profession || "-"}</td>
//                 {/* <td className="border px-2 py-2">{c.position || "-"}</td>
//                 <td className="border px-2 py-2">{c.role || "-"}</td>
//                 <td className="border px-2 py-2 max-w-xs truncate">{c.address || "-"}</td> */}
//                 <td className="border px-2 py-2">{c.city || "-"}</td>
//                 {/* <td className="border px-2 py-2">{c.state || "-"}</td>
//                 <td className="border px-2 py-2">{c.pincode || "-"}</td>
//                 <td className="border px-2 py-2">{c.presentEmploymentStatus || "-"}</td>
//                 <td className="border px-2 py-2 font-semibold"> {c.currentCompanyName || c.companyName || "-"} </td>
//                 <td className="border px-2 py-2">{c.jobDepartment || "-"}</td>
//                 <td className="border px-2 py-2">{c.jobIndustry || "-"}</td>
//                 <td className="border px-2 py-2">{c.jobFromDate || "-"}</td>
//                 <td className="border px-2 py-2">{c.jobToDate || "-"}</td>
//                 <td className="border px-2 py-2">{c.lastSalary || "-"}</td>
//                 <td className="border px-2 py-2">{c.expectedSalary || "-"}</td>
//                 <td className="border px-2 py-2">{c.noticePeriod || "-"}</td>
//                 <td className="border px-2 py-2">{c.classXBoard} ({c.classXYear}) - {c.classXPercentage}%</td>
//                 <td className="border px-2 py-2">{c.classXIIBoard} ({c.classXIIYear}) - {c.classXIIPercentage}%</td>
//                 <td className="border px-2 py-2">{c.graduationUniversity} ({c.graduationYear}) - {c.graduationPercentage}%</td>
//                 <td className="border px-2 py-2">{c.postGraduationUniversity} ({c.postGraduationYear})</td>
//                 <td className="border px-2 py-2">{c.itiUniversity} ({c.itiYear})</td>
//                 <td className="border px-2 py-2">{c.diplomaUniversity} ({c.diplomaYear})</td>
//                 <td className="border px-2 py-2">{Array.isArray(c.skills) ? c.skills.join(", ") : "-"}</td>
//                 <td className="border px-2 py-2"> {c.github ? <a href={c.github} target="_blank" className="text-gray-800 underline">GitHub</a> : "-"}</td>
//                 <td className="border px-2 py-2"> {c.portfolio ? <a href={c.portfolio} target="_blank" className="text-green-600 underline">Portfolio</a> : "-"} </td>
//                 <td className="border px-2 py-2">{c.resume ? <a href={c.resume} target="_blank" className="text-red-600 font-bold">PDF</a> : "-"}</td>

//                 <td className="border px-2 py-2"> {c.coverLetter ? (<a href={c.coverLetter} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline"> Letter </a>) : "-"} </td>

//                 <td className="border px-2 py-2"> {c.experienceLetter ? (<a href={c.experienceLetter} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline"> Certificate </a>) : "-"} </td> */}

//                 <td className="border px-2 py-2 text-center">
//                   <button onClick={() => handleDelete([c._id])} disabled={deletingIds.includes(c._id)} className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Mail & Notification Sections (Same as original) */}
//       <div className="border-t pt-4 mt-8">
//         <h2 className="text-lg font-semibold mb-2">Send Email</h2>
//         <input type="text" placeholder="Email Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="border rounded w-full p-2 mb-3" />
//         <textarea rows="4" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message..." className="border rounded w-full p-2 mb-3"></textarea>
//         <div className="flex gap-3">
//           <button onClick={() => handleSendMail(selectedIds)} disabled={sendingMail} className="bg-blue-600 text-white px-4 py-2 rounded">Send to Selected</button>
//           <button onClick={() => handleSendMail([], true)} disabled={sendingMail} className="bg-green-600 text-white px-4 py-2 rounded">Send to All</button>
//         </div>
//       </div>

//       <div className="border-t pt-4 mt-4">
//         <h2 className="text-lg font-semibold mb-2">Send Notification</h2>
//         <textarea rows="3" value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} placeholder="Notification..." className="border rounded w-full p-2 mb-3"></textarea>
//         <div className="flex gap-3">
//           <button onClick={() => handleSendNotification(selectedIds)} disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded">Send to Selected</button>
//           <button onClick={() => handleSendNotification([], true)} disabled={sending} className="bg-green-600 text-white px-4 py-2 rounded">Send to All</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Filter({ label, value, setValue, options }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium mb-1">{label}:</label>
//       <select value={value} onChange={(e) => setValue(e.target.value)} className="border p-1 rounded w-full">
//         {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
//       </select>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { X } from "lucide-react"; // Close icon માટે

export default function CandidatesAdmin() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [professionFilter, setProfessionFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  const [notificationMessage, setNotificationMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/candidates", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch candidates");
        const data = await res.json();
        if (Array.isArray(data)) setCandidates(data);
        else if (data && typeof data === 'object') setCandidates([data]);
        else setCandidates([]);
      } catch (err) {
        console.error("Error fetching:", err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleDelete = async (ids) => {
    if (!ids || ids.length === 0) return alert("Select at least one candidate!");
    if (!confirm(`Are you sure you want to delete ${ids.length} candidate(s)?`)) return;
    try {
      setDeletingIds(ids);
      for (const id of ids) {
        const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      }
      setCandidates((prev) => prev.filter((c) => !ids.includes(c._id)));
      setSelectedIds([]);
      alert("✅ Candidate(s) deleted successfully!");
    } catch (err) { alert("Error deleting candidates"); } finally { setDeletingIds([]); }
  };

  const handleSendMail = async (ids = [], broadcast = false) => {
    if (!emailSubject.trim() || !emailBody.trim()) return alert("⚠️ Please enter both subject and message!");
    if (!broadcast && (!ids || ids.length === 0)) return alert("⚠️ Please select at least one candidate!");
    if (!confirm(broadcast ? "Send to ALL?" : `Send to ${ids.length}?`)) return;
    try {
      setSendingMail(true);
      let emailsToSend = broadcast ? candidates.map(c => c.email).filter(Boolean) : ids.map(id => candidates.find(c => c._id === id)?.email).filter(Boolean);
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, message: emailBody, type: "candidates", emails: emailsToSend }),
      });
      if (res.ok) { setEmailSubject(""); setEmailBody(""); alert("✅ Mail sent!"); }
    } catch (err) { alert("Error sending mail"); } finally { setSendingMail(false); }
  };

  const handleSendNotification = async (ids, broadcast = false) => {
    if (!notificationMessage.trim()) return alert("Please enter a message!");
    if (!broadcast && (!ids || ids.length === 0)) return alert("Please select at least one user!");
    try {
      setSending(true);
      const body = broadcast ? { title: "Notification", message: notificationMessage, broadcast: true } : { title: "Notification", message: notificationMessage, userIds: ids.map((id) => candidates.find((c) => c._id === id)?.userId).filter(Boolean) };
      const res = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setNotificationMessage(""); alert("✅ Notification sent!"); }
    } catch (err) { alert("Error"); } finally { setSending(false); }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCandidates);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, `Candidates_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const filteredCandidates = Array.isArray(candidates) ? candidates.filter((c) => {
    return (
      (professionFilter === "All" || c.profession === professionFilter) &&
      (positionFilter === "All" || c.position === positionFilter) &&
      (roleFilter === "All" || c.role === roleFilter) &&
      (experienceFilter === "All" || c.experience === experienceFilter) &&
      (cityFilter === "All" || c.city === cityFilter)
    );
  }) : [];

  const getUniqueValues = (key) => ["All", ...new Set(Array.isArray(candidates) ? candidates.map((c) => c[key]).filter(Boolean) : [])];

  const toggleSelect = (id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const selectAll = (checked) => setSelectedIds(checked ? filteredCandidates.map((c) => c._id) : []);


  return (
    <div className="p-6 relative">
      <h1 className="text-xl font-bold mb-4">All Candidates</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <Filter label="Profession" value={professionFilter} setValue={setProfessionFilter} options={getUniqueValues("profession")} />
        <Filter label="Position" value={positionFilter} setValue={setPositionFilter} options={getUniqueValues("position")} />
        <Filter label="Role" value={roleFilter} setValue={setRoleFilter} options={getUniqueValues("role")} />
        <Filter label="Experience" value={experienceFilter} setValue={setExperienceFilter} options={getUniqueValues("experience")} />
        <Filter label="City" value={cityFilter} setValue={setCityFilter} options={getUniqueValues("city")} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Showing {filteredCandidates.length} of {candidates.length}</p>
        <div className="flex gap-3">
          <button onClick={handleDownloadExcel} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">⬇️ Download Excel</button>
          {selectedIds.length > 0 && (
            <>
              <button onClick={() => handleSendNotification(selectedIds)} disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded">Notify ({selectedIds.length})</button>
              <button onClick={() => handleDelete(selectedIds)} disabled={deletingIds.length > 0} className="bg-red-600 text-white px-4 py-2 rounded">Delete ({selectedIds.length})</button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded shadow-sm">
        <table className="min-w-[350px] w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="border px-2 py-2 w-10 text-center"><input type="checkbox" checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0} onChange={(e) => selectAll(e.target.checked)} /></th>
              <th className="border px-2 py-2">Date</th>
              <th className="border px-2 py-2">Full Name</th>
              <th className="border px-2 py-2">Email</th>
              <th className="border px-2 py-2">Mobile</th>
              <th className="border px-2 py-2">Profession</th>
              <th className="border px-2 py-2">City</th>
              <th className="border px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 border-b">
                <td className="border px-2 py-2 text-center"><input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} /></td>
                <td className="border px-2 py-2 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td
                  className="border px-2 py-2 font-medium text-blue-600 cursor-pointer hover:underline"
                  onClick={() => setSelectedCandidate(c)}
                >
                  {c.fullName || "-"}
                </td>
                <td className="border px-2 py-2">{c.email || "-"}</td>
                <td className="border px-2 py-2">{c.mobile || "-"}</td>
                <td className="border px-2 py-2">{c.profession || "-"}</td>
                <td className="border px-2 py-2">{c.city || "-"}</td>
                <td className="border px-2 py-2 text-center">
                  <button onClick={() => handleDelete([c._id])} disabled={deletingIds.includes(c._id)} className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ✅ Candidate Details Modal (Popup) --- */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative">
            <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Candidate Full Profile</h2>
              <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <Section title="Personal Information">
                <Data label="Full Name" value={selectedCandidate.fullName} />
                <Data label="Email" value={selectedCandidate.email} />
                <Data label="Mobile" value={selectedCandidate.mobile} />
                <Data label="DOB" value={selectedCandidate.dob} />
                <Data label="Gender" value={selectedCandidate.gender} />
                <Data label="Address" value={selectedCandidate.address} />
                <Data label="City/State/Pincode" value={`${selectedCandidate.city}, ${selectedCandidate.state} - ${selectedCandidate.pincode}`} />
              </Section>

              <Section title="Professional Details">
                <Data label="Profession" value={selectedCandidate.profession} />
                <Data label="Position" value={selectedCandidate.position} />
                <Data label="Role" value={selectedCandidate.role} />
                <Data label="Experience Status" value={selectedCandidate.presentEmploymentStatus} />
                <Data label="Company Name" value={selectedCandidate.currentCompanyName || selectedCandidate.companyName} />
                <Data label="Department" value={selectedCandidate.jobDepartment} />
                <Data label="Industry" value={selectedCandidate.jobIndustry} />
                <Data label="Last Salary" value={selectedCandidate.lastSalary} />
                <Data label="Expected Salary" value={selectedCandidate.expectedSalary} />
                <Data label="Notice Period" value={selectedCandidate.noticePeriod} />
              </Section>

              <Section title="Education">
                <Data label="10th" value={`${selectedCandidate.classXBoard} (${selectedCandidate.classXYear}) - ${selectedCandidate.classXPercentage}%`} />
                <Data label="12th" value={`${selectedCandidate.classXIIBoard} (${selectedCandidate.classXIIYear}) - ${selectedCandidate.classXIIPercentage}%`} />
                <Data label="Graduation" value={`${selectedCandidate.graduationUniversity} (${selectedCandidate.graduationYear}) - ${selectedCandidate.graduationPercentage}%`} />
                <Data label="Post Grad" value={selectedCandidate.postGraduationUniversity ? `${selectedCandidate.postGraduationUniversity} (${selectedCandidate.postGraduationYear})` : "N/A"} />
              </Section>

              <Section title="Skills & Links">
                <Data label="Skills" value={Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills.join(", ") : "-"} />
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedCandidate.resume && <a href={selectedCandidate.resume} target="_blank" className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Resume PDF</a>}
                  {selectedCandidate.portfolio && <a href={selectedCandidate.portfolio} target="_blank" className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Portfolio</a>}
                  {selectedCandidate.github && <a href={selectedCandidate.github} target="_blank" className="bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold">GitHub</a>}
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* Mail & Notification Sections (Same as original) */}
      <div className="border-t pt-4 mt-8">
        <h2 className="text-lg font-semibold mb-2">Send Email</h2>
        <input type="text" placeholder="Email Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="border rounded w-full p-2 mb-3" />
        <textarea rows="4" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message..." className="border rounded w-full p-2 mb-3"></textarea>
        <div className="flex gap-3">
          <button onClick={() => handleSendMail(selectedIds)} disabled={sendingMail} className="bg-blue-600 text-white px-4 py-2 rounded">Send to Selected</button>
          <button onClick={() => handleSendMail([], true)} disabled={sendingMail} className="bg-green-600 text-white px-4 py-2 rounded">Send to All</button>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Send Notification</h2>
        <textarea rows="3" value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} placeholder="Notification..." className="border rounded w-full p-2 mb-3"></textarea>
        <div className="flex gap-3">
          <button onClick={() => handleSendNotification(selectedIds)} disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded">Send to Selected</button>
          <button onClick={() => handleSendNotification([], true)} disabled={sending} className="bg-green-600 text-white px-4 py-2 rounded">Send to All</button>
        </div>
      </div>
    </div>
  );
}

// Modal Components
function Section({ title, children }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
      <h3 className="font-bold text-indigo-600 mb-3 border-b pb-1 uppercase text-xs tracking-wider">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Data({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-1">
      <span className="text-gray-500 font-medium">{label}:</span>
      <span className="text-gray-900 font-semibold">{value || "-"}</span>
    </div>
  );
}

function Filter({ label, value, setValue, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}:</label>
      <select value={value} onChange={(e) => setValue(e.target.value)} className="border p-1 rounded w-full">
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );
}