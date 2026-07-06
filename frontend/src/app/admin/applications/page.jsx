"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filteredApps, setFilteredApps] = useState([]);

  // Modal states
  const [noteModal, setNoteModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Selection for multi-delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Notification & Mail states
  const [notificationMessage, setNotificationMessage] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch applications
  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    let filtered = apps;
    if (statusFilter !== "All")
      filtered = filtered.filter(
        (a) => a.status.toLowerCase() === statusFilter.toLowerCase()
      );
    if (jobFilter !== "All")
      filtered = filtered.filter((a) => a.job?.title === jobFilter);
    if (categoryFilter !== "All")
      filtered = filtered.filter((a) => a.job?.jobCategory === categoryFilter);
    setFilteredApps(filtered);
  }, [apps, statusFilter, jobFilter, categoryFilter]);

  // DELETE single application
  const deleteApplication = async (id) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to delete");
      setApps((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Error deleting application");
    }
  };

  // Bulk delete
  const deleteSelected = async () => {
    if (selectedIds.length === 0)
      return alert("Please select at least one application.");
    if (!confirm(`Delete ${selectedIds.length} selected applications?`)) return;

    try {
      for (const id of selectedIds) {
        await fetch(`/api/applications/${id}`, { method: "DELETE" });
      }
      setApps((prev) => prev.filter((a) => !selectedIds.includes(a._id)));
      setSelectedIds([]);
      setSelectAll(false);
      alert("Selected applications deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error deleting selected applications.");
    }
  };

  // PATCH update
  const updateApplication = async (id, update) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to update");

      setApps((prev) =>
        prev.map((a) => (a._id === id ? { ...a, ...update } : a))
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating application");
    }
  };

  const openNoteModal = (app) => {
    setSelectedApp(app);
    setNoteText(app.note || "");
    setNoteModal(true);
  };

  const saveNote = async () => {
    if (!selectedApp) return;
    await updateApplication(selectedApp._id, { note: noteText });
    setNoteModal(false);
    setSelectedApp(null);
    setNoteText("");
  };


    // ✅ Send Notification
    const handleSendNotification = async (ids, broadcast = false) => {
      if (!notificationMessage.trim()) {
        alert("Please enter a notification message!");
        return;
      }
    
      if (!broadcast && (!ids || ids.length === 0)) {
        alert("Please select at least one user!");
        return;
      }
    
      const confirmMsg = broadcast
        ? "Send this notification to ALL users?"
        : `Send this notification to ${ids.length} selected user(s)?`;
    
      if (!confirm(confirmMsg)) return;
    
      try {
        setSending(true);
    
        const body = broadcast
          ? {
              title: "New Notification",
              message: notificationMessage,
              broadcast: true,
            }
          : {
              title: "New Notification",
              message: notificationMessage,
              userIds: ids
                .map(id => apps.find(a => a._id === id)?.candidate) // 🔥 CORRECT
                .filter(Boolean),
            };
    
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
    
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send notifications");
    
        setNotificationMessage("");
        alert(data.message || "✅ Notification sent successfully!");
      } catch (err) {
        console.error("Error sending notification:", err);
        alert(err.message || "An error occurred while sending notifications");
      } finally {
        setSending(false);
      }
    };
    

  // ✅ Send Mail Function
  const handleSendMail = async (ids, all = false) => {
    if (!mailSubject.trim() || !mailBody.trim()) {
      alert("Please enter both subject and message!");
      return;
    }

    if (!all && (!ids || ids.length === 0)) {
      alert("Please select at least one user to send mail!");
      return;
    }

    if (!confirm(`Send this mail to ${all ? "all users" : ids.length + " user(s)"}?`))
      return;

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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send mail");

      alert(`✅ Mail sent successfully to ${data.sentTo} user(s)!`);
      setMailSubject("");
      setMailBody("");
    } catch (err) {
      console.error("Mail send error:", err);
      alert("An error occurred while sending mail");
    } finally {
      setSending(false);
    }
  };

  // ✅ Export filtered applications to Excel
  const downloadExcel = () => {
    if (filteredApps.length === 0) {
      alert("No data available to export!");
      return;
    }

    const excelData = filteredApps.map((a) => ({
      Name: a.name,
      Email: a.email,
      Phone: a.phone,
      Job_Title: a.job?.title || "N/A",
      Category: a.job?.jobCategory || "N/A",
      Type: a.job?.type || "N/A",
      Experience_Level: a.job?.experienceLevel || "N/A",
      Price: a.price || "",
      Estimated_Days: a.estimatedDays || "",
      Cover_Letter: a.coverLetter || "",
      LinkedIn: a.linkedIn || "",
      Portfolio: a.portfolio || "",
      Resume_Links:
        a.attachments?.map((f) => f.url).join(", ") || "No attachments",
      Status: a.status,
      Admin_Note: a.note || "",
      Created_At: new Date(a.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, "applications.xlsx");
  };

  if (loading) return <p className="p-6">Loading applications...</p>;

  const jobTitles = [...new Set(apps.map((a) => a.job?.title).filter(Boolean))];
  const jobCategories = [
    ...new Set(apps.map((a) => a.job?.jobCategory).filter(Boolean)),
  ];

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
      const allIds = filteredApps.map((a) => a._id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-48"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-48"
        >
          <option value="All">All Jobs</option>
          {jobTitles.map((title, i) => (
            <option key={i} value={title}>
              {title}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-48"
        >
          <option value="All">All Categories</option>
          {jobCategories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Buttons */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex gap-3 flex-wrap">
          <button
            onClick={deleteSelected}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}

      {/* ✅ Excel Download Button */}
      <div className="mb-4">
        <button
          onClick={downloadExcel}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          📥 Download Excel (Filtered)
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded mb-6">
        <table className="w-full table-auto border-collapse text-sm min-w-[1300px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="border p-2">Candidate</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Job Title</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Experience</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Info</th>
              <th className="border p-2">LinkedIn</th>
              <th className="border p-2">Portfolio</th>
              <th className="border p-2">Resume</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Admin Note</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="17" className="text-center p-4 text-gray-500">
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredApps.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(a._id)}
                      onChange={() => handleSelect(a._id)}
                    />
                  </td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="border p-2">{a.name}</td>
                  <td className="border p-2">{a.email}</td>
                  <td className="border p-2">{a.phone}</td>
                  <td className="border p-2">{a.job?.title || "Unknown"}</td>
                  <td className="border p-2">{a.job?.jobCategory || "N/A"}</td>
                  <td className="border p-2">{a.job?.type || "N/A"}</td>
                  <td className="border p-2">
                    {a.job?.experienceLevel || "N/A"}
                  </td>
                  <td className="border p-2">{a.price}</td>
                  <td className="border p-2">{a.estimatedDays}</td>
                  <td className="border p-2">{a.coverLetter}</td>
                  <td className="border p-2">
                    <a
                      href={a.linkedIn || "#"}
                      target="_blank"
                      className="text-blue-600"
                    >
                      View
                    </a>
                  </td>
                  <td className="border p-2">
                    <a
                      href={a.portfolio || "#"}
                      target="_blank"
                      className="text-blue-600"
                    >
                      View
                    </a>
                  </td>
                  <td className="border p-2">
                    {a.attachments?.length
                      ? a.attachments.map((f) =>
                          f?.url ? (
                            <a
                              key={f.url}
                              href={f.url}
                              target="_blank"
                              className="text-blue-600 underline mr-2"
                            >
                              View
                            </a>
                          ) : null
                        )
                      : "N/A"}
                  </td>
                  <td className="border p-2">{a.status}</td>
                  <td className="border p-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => openNoteModal(a)}
                    >
                      {a.note ? "View / Edit" : "Add Note"}
                    </button>
                  </td>
                  <td className="border p-2 flex flex-col gap-1">
                    {a.status !== "approved" && (
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() =>
                          updateApplication(a._id, { status: "approved" })
                        }
                      >
                        Approve
                      </button>
                    )}
                    {a.status !== "rejected" && (
                      <button
                        className="text-yellow-600 hover:underline"
                        onClick={() =>
                          updateApplication(a._id, { status: "rejected" })
                        }
                      >
                        Reject
                      </button>
                    )}
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteApplication(a._id)}
                    >
                      Delete
                    </button>
                    

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Mail Sending Box */}
      <div className="border-t pt-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Send Email</h2>
        <input
          type="text"
          value={mailSubject}
          onChange={(e) => setMailSubject(e.target.value)}
          placeholder="Enter email subject"
          className="border rounded w-full p-2 mb-2"
        />
        <textarea
          rows="4"
          value={mailBody}
          onChange={(e) => setMailBody(e.target.value)}
          placeholder="Write email message here..."
          className="border rounded w-full p-2 mb-3"
        ></textarea>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleSendMail(selectedIds, false)}
            disabled={sending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Mail to Selected Users"}
          </button>

          <button
            onClick={() => handleSendMail([], true)}
            disabled={sending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Mail to All Users"}
          </button>
        </div>
      </div>

      {/* ✅ Notification section */}
      <div className="border-t pt-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Send Notification</h2>
        <textarea
          rows="3"
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          placeholder="Write a message to send..."
          className="border rounded w-full p-2 mb-3"
        ></textarea>

        <div className="flex gap-3">
          <button
            onClick={() => handleSendNotification(selectedIds)}
            disabled={sending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send to Selected Users"}
          </button>
          <button
            onClick={() => handleSendNotification([], true)}
            disabled={sending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send to All Users"}
          </button>
        </div>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-[90%]">
            <h2 className="text-lg font-semibold mb-2">
              {selectedApp?.name}'s Note
            </h2>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows="5"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write admin note here..."
            ></textarea>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-gray-200"
                onClick={() => setNoteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white"
                onClick={saveNote}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
