"use client";

import { useState, useEffect } from "react";
import {
  Upload, Trash2, Plus, Image as ImageIcon, FileText,
  Calendar, Briefcase, Loader2,
  CheckCircle2, AlertCircle, RefreshCw, Check,
  Eye, EyeOff, Download, User, Phone, Mail,
  Send, Search, Database, Users, Sparkles, X, Layers, ListFilter
} from "lucide-react";

export default function AdminBulkVacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [dbEmailList, setDbEmailList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Main Page Navigation Tabs: "vacancies" | "scraped" | "maillist"
  const [mainPageTab, setMainPageTab] = useState("vacancies");

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [viewVacancyModal, setViewVacancyModal] = useState(null);

  const [activeTab, setActiveTab] = useState("active"); // "active" | "pending"
  const [approvingId, setApprovingId] = useState(null);

  // Search & Selection States
  const [scrapedSearchQuery, setScrapedSearchQuery] = useState("");
  const [mailSearchQuery, setMailSearchQuery] = useState("");

  const [selectedEmails, setSelectedEmails] = useState([]);
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [syncingMailList, setSyncingMailList] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Govt",
    image: "",
    fileType: "image",
    fileName: ""
  });

  // Fetch Vacancies & DB EmailQueue
  const fetchVacancies = async () => {
    try {
      const res = await fetch("/api/admin/bulk-vacancies");
      const data = await res.json();
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vacancies:", err);
    }
  };

  const fetchEmailList = async () => {
    try {
      const res = await fetch("/api/emailList");
      const data = await res.json();
      if (data.success && Array.isArray(data.emailList)) {
        setDbEmailList(data.emailList);
      }
    } catch (err) {
      console.error("Error fetching email list:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchVacancies(), fetchEmailList()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Compute ALL scraped contacts across all vacancies
  const allScrapedContacts = vacancies.flatMap((v) =>
    (v.scrapedContacts || []).map((c, i) => ({
      _id: c._id || `${v._id}-${i}`,
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      source: v.title || "Bulk Vacancy",
      vacancyId: v._id
    }))
  );

  // Filtered lists
  const filteredScrapedContacts = allScrapedContacts.filter((c) =>
    (c.name || "").toLowerCase().includes(scrapedSearchQuery.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(scrapedSearchQuery.toLowerCase()) ||
    (c.phone || "").toLowerCase().includes(scrapedSearchQuery.toLowerCase()) ||
    (c.source || "").toLowerCase().includes(scrapedSearchQuery.toLowerCase())
  );

  const filteredDbEmails = dbEmailList.filter((item) =>
    (item.name || "").toLowerCase().includes(mailSearchQuery.toLowerCase()) ||
    (item.email || "").toLowerCase().includes(mailSearchQuery.toLowerCase()) ||
    (item.phone || "").toLowerCase().includes(mailSearchQuery.toLowerCase()) ||
    (item.source || "").toLowerCase().includes(mailSearchQuery.toLowerCase())
  );

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        image: reader.result,
        fileType: isPdf ? "pdf" : "image",
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload an Image or PDF file");
    setUploading(true);
    try {
      const res = await fetch("/api/admin/bulk-vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", type: "Govt", image: "", fileType: "image", fileName: "" });
        fetchVacancies();
      }
    } catch (err) {
      alert("Failed to post vacancy");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await fetch("/api/admin/bulk-vacancies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved: true })
      });
      if (res.ok) {
        const result = await res.json();
        const contactCount = result.vacancy?.scrapedContacts?.length || 0;
        alert(
          `✅ Vacancy approved! ${
            contactCount > 0
              ? `Scraped ${contactCount} contact(s) and synced to MailList.`
              : "No contact info detected in image."
          }`
        );
        await Promise.all([fetchVacancies(), fetchEmailList()]);
      } else {
        alert("Failed to approve vacancy");
      }
    } catch (err) {
      alert("Error approving vacancy");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    try {
      await fetch("/api/admin/bulk-vacancies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchVacancies();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // Sync scraped contacts to MailList DB
  const handleSyncScrapedToDb = async () => {
    const validContactsToSave = allScrapedContacts
      .filter((c) => c.email && c.email.includes("@"))
      .map((c) => ({
        email: c.email,
        name: c.name,
        phone: c.phone,
        source: `Scraped: ${c.source}`
      }));

    if (validContactsToSave.length === 0) {
      return alert("No scraped contacts with valid email addresses found to sync.");
    }

    setSyncingMailList(true);
    try {
      const res = await fetch("/api/emailList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: validContactsToSave })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ Successfully saved ${validContactsToSave.length} scraped contact(s) to MailList DB!`);
        fetchEmailList();
      } else {
        alert(data.error || "Sync failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error syncing contacts to MailList DB");
    } finally {
      setSyncingMailList(false);
    }
  };

  // Toggle selection
  const toggleSelectEmail = (email) => {
    if (!email) return;
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSelectAllDbEmails = () => {
    const validDbEmails = filteredDbEmails.map((item) => item.email).filter(Boolean);
    if (selectedEmails.length === validDbEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(validDbEmails);
    }
  };

  const openMailModalFor = (emailsArray) => {
    const cleaned = (emailsArray || []).filter(Boolean);
    setSelectedEmails(cleaned);
    setShowMailModal(true);
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (selectedEmails.length === 0) return alert("Please select at least one contact email.");
    if (!mailSubject.trim() || !mailMessage.trim()) return alert("Subject and Message are required.");

    setSendingMail(true);
    try {
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mailSubject,
          message: mailMessage,
          emails: selectedEmails,
          type: "custom"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 Email sent successfully to ${data.sentTo || selectedEmails.length} recipient(s)!`);
        setShowMailModal(false);
        setMailSubject("");
        setMailMessage("");
        setSelectedEmails([]);
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    } finally {
      setSendingMail(false);
    }
  };

  const exportContactsCSV = (contactsArray, filename = "scraped_contacts.csv") => {
    if (!contactsArray || contactsArray.length === 0) return alert("No contacts to export");
    const headers = "Name,Phone,Email,Source\n";
    const rows = contactsArray
      .map((c) => `"${c.name || ''}","${c.phone || ''}","${c.email || ''}","${c.source || ''}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeVacancies = vacancies.filter((v) => v.isApproved !== false);
  const pendingVacancies = vacancies.filter((v) => v.isApproved === false);
  const currentList = activeTab === "active" ? activeVacancies : pendingVacancies;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-100">
                <Briefcase size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Bulk Vacancies & MailList Manager
              </h1>
            </div>
            <p className="text-slate-500 font-medium italic">
              Manage Vacancies, View AI Scraped Contacts Data & Send Broadcast Emails Across Dedicated Pages
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openMailModalFor(selectedEmails.length > 0 ? selectedEmails : filteredDbEmails.map(c => c.email))}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Send size={16} /> Compose & Send Mail ({selectedEmails.length > 0 ? selectedEmails.length : filteredDbEmails.length})
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-black transition-all shadow-xl shadow-slate-200"
            >
              <Plus size={16} /> Post New Vacancy
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Vacancies" value={activeVacancies.length} color="bg-indigo-50 text-indigo-600" onClick={() => setMainPageTab("vacancies")} />
          <StatCard label="Pending Approval" value={pendingVacancies.length} color="bg-amber-50 text-amber-600" onClick={() => setMainPageTab("vacancies")} />
          <StatCard label="Scraped Contacts Total" value={allScrapedContacts.length} color="bg-rose-50 text-rose-600" onClick={() => setMainPageTab("scraped")} />
          <StatCard label="MailList DB Total" value={dbEmailList.length} color="bg-emerald-50 text-emerald-600" onClick={() => setMainPageTab("maillist")} />
        </div>

        {/* MAIN PAGE NAVIGATION SUB-TABS */}
        <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setMainPageTab("vacancies")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
              mainPageTab === "vacancies"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <Briefcase size={16} /> Vacancies Directory ({vacancies.length})
          </button>
          <button
            onClick={() => setMainPageTab("scraped")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
              mainPageTab === "scraped"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <Sparkles size={16} /> AI Scraped Data Table ({allScrapedContacts.length})
          </button>
          <button
            onClick={() => setMainPageTab("maillist")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
              mainPageTab === "maillist"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <Database size={16} /> MailList & Email Broadcast ({dbEmailList.length})
          </button>
        </div>

        {/* PAGE 1: DEDICATED VACANCIES DIRECTORY PAGE */}
        {mainPageTab === "vacancies" && (
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Bulk Vacancies Directory
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">
                    View, Approve & Manage all uploaded job vacancy posters
                  </p>
                </div>
              </div>

              {/* Active / Pending Filter Tabs */}
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    activeTab === "active" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Active Vacancies ({activeVacancies.length})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    activeTab === "pending" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Pending Approval ({pendingVacancies.length})
                </button>
              </div>
            </div>

            {/* FULL WIDTH VACANCIES TABLE */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Loading Vacancies Directory...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ImageIcon size={40} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-lg font-black text-slate-700">No Vacancies Available</h4>
                <p className="text-slate-400 text-xs mt-1">There are no job postings in this category currently.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-3xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-xs font-black uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-4">Poster Image</th>
                      <th className="p-4">Job Title & Category</th>
                      <th className="p-4">Submitted By</th>
                      <th className="p-4">Posting Dates</th>
                      <th className="p-4">Contacts Scraped</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {currentList.map((vacancy) => (
                      <tr key={vacancy._id} className="hover:bg-slate-50 transition-colors">
                        {/* Poster Image / PDF Thumbnail */}
                        <td className="p-4">
                          <div
                            onClick={() => setViewVacancyModal(vacancy)}
                            className="w-16 h-20 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer border border-slate-200 group relative flex-shrink-0 shadow-sm flex items-center justify-center"
                            title="Click to view full poster image or PDF document"
                          >
                            {vacancy.fileType === "pdf" || (vacancy.image && (vacancy.image.startsWith("data:application/pdf") || vacancy.image.includes("%PDF"))) ? (
                              <div className="flex flex-col items-center justify-center p-1 text-center">
                                <FileText className="text-red-500" size={24} />
                                <span className="text-[8px] font-black text-slate-700 uppercase mt-0.5">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={vacancy.image}
                                alt={vacancy.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye size={16} />
                            </div>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="p-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                                  vacancy.type === "Govt" ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              >
                                {vacancy.type} Job
                              </span>
                              {!vacancy.isApproved && (
                                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500 text-white">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                            <h3 className="font-black text-slate-900 text-base">
                              {vacancy.title}
                            </h3>
                          </div>
                        </td>

                        {/* Submitted By */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                            {vacancy.postedBy || "User"}
                          </span>
                        </td>

                        {/* Dates */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-600">
                              Posted: <span className="font-bold">{new Date(vacancy.createdAt).toLocaleDateString()}</span>
                            </p>
                            <p className="text-rose-500 italic">
                              Expires: <span className="font-bold">{new Date(vacancy.expiresAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </td>

                        {/* Contacts Scraped Badge */}
                        <td className="p-4 whitespace-nowrap">
                          {vacancy.scrapedContacts && vacancy.scrapedContacts.length > 0 ? (
                            <button
                              onClick={() => setMainPageTab("scraped")}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all"
                            >
                              <Users size={14} /> {vacancy.scrapedContacts.length} Contact(s) Extracted
                            </button>
                          ) : vacancy.isApproved ? (
                            <span className="text-xs font-bold text-slate-400 italic">No Contacts Found</span>
                          ) : (
                            <span className="text-xs font-bold text-amber-500 italic">Auto-scrape on Approval</span>
                          )}
                        </td>

                        {/* Actions: View Button, Approve, Delete */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* View Button */}
                            <button
                              onClick={() => setViewVacancyModal(vacancy)}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                              title="View full poster image & details"
                            >
                              <Eye size={16} /> View Poster
                            </button>

                            {!vacancy.isApproved && (
                              <button
                                onClick={() => handleApprove(vacancy._id)}
                                disabled={approvingId === vacancy._id}
                                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-100 disabled:opacity-50"
                                title="Approve & AI Scrape Contacts"
                              >
                                {approvingId === vacancy._id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Check size={16} />
                                )}
                                Approve & Scrape
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(vacancy._id)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all"
                              title="Delete Vacancy"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PAGE 2: DEDICATED AI SCRAPED CONTACTS PAGE */}
        {mainPageTab === "scraped" && (
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    AI Scraped Contacts Table
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">
                    Showing all {allScrapedContacts.length} contact records extracted from Vacancy Posters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSyncScrapedToDb}
                  disabled={syncingMailList}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
                  title="Save all scraped contacts with email to DB"
                >
                  {syncingMailList ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Save All to MailList DB
                </button>
                <button
                  onClick={() => exportContactsCSV(filteredScrapedContacts, "ai_scraped_contacts.csv")}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all"
                  title="Export Scraped Contacts CSV"
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* Scraped Table Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Scraped Contacts by Name, Phone, Email, Source Job Title..."
                value={scrapedSearchQuery}
                onChange={(e) => setScrapedSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            {/* FULL WIDTH SCRAPED CONTACTS DATA TABLE */}
            <div className="overflow-x-auto border border-slate-100 rounded-3xl">
              {filteredScrapedContacts.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <h4 className="text-lg font-black text-slate-700">No Scraped Contacts Found</h4>
                  <p className="text-xs mt-1">Approve pending vacancies to automatically extract contact details from poster images.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-xs font-black uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">Candidate / Contact Name</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Vacancy Source</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredScrapedContacts.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-400 font-bold text-xs">{idx + 1}</td>
                        <td className="p-4 font-black text-slate-900">
                          <span className="flex items-center gap-2">
                            <User size={14} className="text-slate-400 shrink-0" /> {c.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-bold whitespace-nowrap">
                          {c.phone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone size={14} className="text-slate-400 shrink-0" /> {c.phone}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-indigo-600 break-all">
                          {c.email ? (
                            <span className="flex items-center gap-1.5">
                              <Mail size={14} className="text-indigo-400 shrink-0" /> {c.email}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4 text-xs font-bold text-slate-500">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                            {c.source}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {c.email ? (
                            <button
                              onClick={() => openMailModalFor([c.email])}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
                              title={`Send Email to ${c.email}`}
                            >
                              <Send size={14} /> Send Mail
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 italic">No Email</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PAGE 3: DEDICATED MAILLIST & EMAIL BROADCAST PAGE */}
        {mainPageTab === "maillist" && (
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Database size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    MailList DB & Broadcast Queue
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">
                    Showing all {filteredDbEmails.length} subscribers saved in EmailQueue Database
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openMailModalFor(selectedEmails.length > 0 ? selectedEmails : filteredDbEmails.map(c => c.email))}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  <Send size={16} /> Compose Broadcast ({selectedEmails.length > 0 ? selectedEmails.length : filteredDbEmails.length})
                </button>
                <button
                  onClick={() => exportContactsCSV(filteredDbEmails, "maillist_subscribers.csv")}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all"
                  title="Export Subscribers CSV"
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* MailList Table Search & Select Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Database Subscribers by Name, Phone, Email, Source..."
                  value={mailSearchQuery}
                  onChange={(e) => setMailSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-sm px-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={
                      filteredDbEmails.length > 0 &&
                      selectedEmails.length === filteredDbEmails.map((c) => c.email).length
                    }
                    onChange={handleSelectAllDbEmails}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  Select All Subscribers ({filteredDbEmails.length})
                </label>

                {selectedEmails.length > 0 && (
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                    {selectedEmails.length} Subscriber(s) Selected
                  </span>
                )}
              </div>
            </div>

            {/* FULL WIDTH MAILLIST DB TABLE */}
            <div className="overflow-x-auto border border-slate-100 rounded-3xl">
              {filteredDbEmails.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <h4 className="text-lg font-black text-slate-700">No Subscribers Saved in Database</h4>
                  <p className="text-xs mt-1">Switch to "AI Scraped Data Table" and click "Save All to MailList DB" to import contacts.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-xs font-black uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-4 w-10"></th>
                      <th className="p-4">Subscriber Email</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Source</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredDbEmails.map((item, idx) => {
                      const isSelected = selectedEmails.includes(item.email);
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-indigo-50/60" : ""
                          }`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectEmail(item.email)}
                              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-black text-indigo-600 break-all">
                            {item.email}
                          </td>
                          <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                            {item.name || "—"}
                          </td>
                          <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                            {item.phone || "—"}
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-400 whitespace-nowrap">
                            <span className="bg-slate-100 px-3 py-1 rounded-xl">
                              {item.source || "MailList DB"}
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => openMailModalFor([item.email])}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
                              title={`Send Email to ${item.email}`}
                            >
                              <Send size={14} /> Send Email
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* MODAL 1: VIEW VACANCY FULL POSTER IMAGE MODAL */}
        {viewVacancyModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white ${
                      viewVacancyModal.type === "Govt" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  >
                    {viewVacancyModal.type}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 line-clamp-1">
                    {viewVacancyModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewVacancyModal(null)}
                  className="text-slate-400 hover:text-slate-900 font-black text-2xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[300px] max-h-[60vh] flex items-center justify-center">
                  {viewVacancyModal.fileType === "pdf" || (viewVacancyModal.image && (viewVacancyModal.image.startsWith("data:application/pdf") || viewVacancyModal.image.includes("%PDF"))) ? (
                    <div className="w-full h-[55vh] flex flex-col items-center justify-center bg-slate-900 text-white p-4 space-y-3">
                      <div className="flex items-center justify-between w-full px-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                          <FileText className="text-red-400" size={18} /> {viewVacancyModal.fileName || viewVacancyModal.title + ".pdf"}
                        </span>
                        <a
                          href={viewVacancyModal.image}
                          download={`${viewVacancyModal.title.replace(/\s+/g, "_")}.pdf`}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                        >
                          <Download size={13} /> Download PDF
                        </a>
                      </div>
                      <iframe
                        src={viewVacancyModal.image}
                        className="w-full h-full rounded-xl border border-slate-700 bg-white"
                        title="PDF Document Preview"
                      />
                    </div>
                  ) : (
                    <img
                      src={viewVacancyModal.image}
                      alt={viewVacancyModal.title}
                      className="w-full h-full object-contain max-h-[55vh]"
                    />
                  )}
                </div>

                {/* Scraped Info in Modal */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={16} /> Extracted Contact Details ({viewVacancyModal.scrapedContacts?.length || 0})
                  </h4>

                  {viewVacancyModal.scrapedContacts && viewVacancyModal.scrapedContacts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewVacancyModal.scrapedContacts.map((sc, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" /> {sc.name || "N/A"}
                          </p>
                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" /> {sc.phone || "N/A"}
                          </p>
                          <p className="text-xs text-indigo-600 font-bold flex items-center gap-1.5 break-all">
                            <Mail size={12} className="text-indigo-400" /> {sc.email || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic">
                      No contacts extracted yet from this poster image.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setViewVacancyModal(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: POST NEW VACANCY MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Post New Vacancy</h2>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      Add Image Based Job Alert
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-900 transition-all font-black text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Job Title / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat Police Recruitment 2024"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Vacancy Category
                  </label>
                  <div className="flex gap-4">
                    {["Govt", "Pvt"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                          formData.type === type
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {type} Job
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Vacancy File (Image or PDF Poster)
                  </label>
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className={`aspect-video rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center transition-all ${
                        formData.image
                          ? "border-emerald-500 bg-emerald-50/20"
                          : "border-slate-100 bg-slate-50 group-hover:bg-slate-100 group-hover:border-indigo-200"
                      }`}
                    >
                      {formData.image ? (
                        <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                          {formData.fileType === "pdf" ? (
                            <div className="flex flex-col items-center gap-2 text-center">
                              <FileText className="text-red-500 animate-pulse" size={40} />
                              <span className="text-xs font-black text-slate-800 line-clamp-1">{formData.fileName || "Uploaded Vacancy Document.pdf"}</span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">PDF Document Attached</span>
                            </div>
                          ) : (
                            <img src={formData.image} className="w-full h-full object-contain rounded-xl" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                            <RefreshCw className="text-white" size={28} />
                            <p className="text-white font-black text-[10px] uppercase tracking-widest mt-1 ml-2">
                              Change File
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={24} />
                          </div>
                          <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest group-hover:text-indigo-600">
                            Click or Drag Image or PDF Document
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Publish Vacancy
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: COMPOSE & SEND MAIL MODAL */}
        {showMailModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                    <Send size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Send Broadcast Email
                    </h2>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      Recipients ({selectedEmails.length})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMailModal(false)}
                  className="text-slate-400 hover:text-slate-900 transition-all font-black text-2xl"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSendMail} className="p-6 md:p-8 space-y-6">
                {/* Recipients Preview */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    To Recipients ({selectedEmails.length})
                  </label>
                  <div className="max-h-24 overflow-y-auto bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-wrap gap-1.5 text-xs font-bold text-slate-700">
                    {selectedEmails.map((em, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600"
                      >
                        {em}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Urgent Vacancy Notification - ShivEn Group"
                    required
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700 text-sm"
                  />
                </div>

                {/* Email Body Message */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Email Message Content
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Write your email body here..."
                    required
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700 text-sm"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMailModal(false)}
                    className="px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMail}
                    className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    {sendingMail ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> Sending Mail...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Email Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group"
    >
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-slate-600 transition-colors">
        {label}
      </p>
      <h2 className={`text-4xl font-black ${color.split(" ")[1]}`}>{value}</h2>
      <div className={`mt-4 h-1.5 w-12 rounded-full ${color.split(" ")[0]}`}></div>
    </div>
  );
}
