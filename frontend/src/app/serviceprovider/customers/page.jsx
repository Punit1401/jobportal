"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Serviceprovidersidbar';
import FeatureGuard from '@/components/FeatureGuard';
import { Users, Search, Filter, Mail, Phone, MapPin, MoreHorizontal, Download, UserPlus, Star, ChevronLeft, ChevronRight, FileText, Plus, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [mailingLists, setMailingLists] = useState([]);
    const [showListModal, setShowListModal] = useState(false);

    // Dynamic Filter & Pagination States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({ role: "", city: "" });

    const fetchMailingLists = async () => {
        const res = await fetch('/api/mailing-list');
        const data = await res.json();
        if (data.ok) setMailingLists(data.data);
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/serviceprovider/contacts', { cache: 'no-store' });
            const data = await res.json();
            if (data.ok) setContacts(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
        fetchMailingLists();
    }, []);

    const toggleSelection = (id) => {
        setSelectedContacts(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleAddToList = async (listId) => {
        try {
            const res = await fetch('/api/mailing-list', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listId, candidateIds: selectedContacts })
            });
            if (res.ok) {
                alert("Contacts added to list successfully!");
                setSelectedContacts([]);
                setShowListModal(false);
            }
        } catch (error) {
            alert("Error adding contacts to list.");
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [savingContact, setSavingContact] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [importingState, setImportingState] = useState({ importing: false, total: 0, estimatedMinutes: 0 });
    const [newContact, setNewContact] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "",
        city: "",
        state: "",
        status: "Inquired",
        message: ""
    });

    const handleSaveContact = async (e) => {
        e.preventDefault();
        setSavingContact(true);
        try {
            const method = editingContact ? 'PUT' : 'POST';
            const bodyObj = editingContact ? { ...newContact, id: editingContact._id } : newContact;

            const res = await fetch('/api/serviceprovider/contacts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyObj)
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                alert(editingContact ? "Contact updated successfully!" : "Contact saved successfully!");
                setShowAddModal(false);
                setEditingContact(null);
                setNewContact({ name: "", email: "", mobile: "", role: "", city: "", state: "", status: "Inquired", message: "" });
                fetchContacts();
            } else {
                alert(data.error || "Failed to save contact");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Error saving contact");
        } finally {
            setSavingContact(false);
        }
    };

    const handleAddContact = () => {
        setEditingContact(null);
        setNewContact({ name: "", email: "", mobile: "", role: "", city: "", state: "", status: "Inquired", message: "" });
        setShowAddModal(true);
    };

    const handleDeleteContact = async (id) => {
        if (!confirm("Are you sure you want to delete this contact?")) return;
        try {
            const res = await fetch(`/api/serviceprovider/contacts?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                alert("Contact deleted successfully!");
                setSelectedContacts(prev => prev.filter(item => item !== id));
                fetchContacts();
            } else {
                alert(data.error || "Failed to delete contact");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting contact");
        }
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedContacts.length} selected contacts?`)) return;
        try {
            const res = await fetch('/api/serviceprovider/contacts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContacts })
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                alert("Selected contacts deleted successfully!");
                setSelectedContacts([]);
                fetchContacts();
            } else {
                alert(data.error || "Failed to delete selected contacts");
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            alert("Error deleting selected contacts");
        }
    };

    const handleExport = () => {
        const headers = ["Name", "Email", "Mobile", "Status", "City"];
        const rows = contacts.map(c => [c.name, c.email, c.mobile, c.status, c.city]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customer_contacts.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("No data found in the selected Excel file.");
                    return;
                }

                // Map columns to match service provider fields: name, email, mobile, role, city, state, status
                const mappedContacts = data.map(row => {
                    let name = "";
                    let email = "";
                    let mobile = "";
                    let role = "Customer";
                    let city = "";
                    let state = "";
                    let status = "Inquired";

                    for (const key of Object.keys(row)) {
                        const k = key.toLowerCase().trim();
                        const val = String(row[key] || "").trim();

                        if (k.includes("name") || k === "fullname") {
                            name = val;
                        } else if (k.includes("email") || k === "mail") {
                            email = val;
                        } else if (k.includes("phone") || k.includes("mobile") || k.includes("number") || k.includes("contact") || k === "__empty") {
                            mobile = val;
                        } else if (k.includes("role") || k.includes("profession") || k.includes("position") || k.includes("designation") || k.includes("title")) {
                            role = val;
                        } else if (k.includes("city") || k.includes("town") || k.includes("location")) {
                            city = val;
                        } else if (k.includes("state") || k.includes("province")) {
                            state = val;
                        } else if (k.includes("status")) {
                            status = val;
                        }
                    }

                    return { name, email, mobile, role, city, state, status };
                }).filter(c => c.name && c.email);

                const total = mappedContacts.length;
                if (total === 0) {
                    alert("No valid contacts found (Name and Email are required).");
                    return;
                }

                // Calculate estimated time (approx 1 minute per 300 records)
                const estimatedMinutes = Math.max(1, Math.ceil(total / 300));
                const confirmMsg = `Scan Complete!\n\nYour file contains ${total} valid contact records.\nIt will take approximately ${estimatedMinutes} minute(s) to import this data.\n\n⚠️ IMPORTANT: Please do not close, logout, or go back from this screen while importing.\n\nDo you want to proceed?`;

                if (!confirm(confirmMsg)) {
                    e.target.value = '';
                    return;
                }

                setImportingState({ importing: true, total, estimatedMinutes });

                const res = await fetch('/api/serviceprovider/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mappedContacts)
                });
                const resData = await res.json();

                setImportingState({ importing: false, total: 0, estimatedMinutes: 0 });

                if (resData.ok) {
                    alert("Data added Successfully!");
                    fetchContacts();
                } else {
                    alert("Failed to import contacts: " + (resData.error || "Unknown error"));
                }
            } catch (err) {
                console.error(err);
                setImportingState({ importing: false, total: 0, estimatedMinutes: 0 });
                alert("Error parsing Excel file: " + err.message);
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const filteredContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
            (contact.name || "").toLowerCase().includes(query) ||
            (contact.fullName || "").toLowerCase().includes(query) ||
            (contact.email || "").toLowerCase().includes(query) ||
            (contact.mobile || "").toLowerCase().includes(query) ||
            (contact.city || "").toLowerCase().includes(query);

        const matchesStatus = statusFilter === "All Statuses" || 
            (contact.status || "").toLowerCase() === statusFilter.toLowerCase();

        const matchesRole = !advancedFilters.role || 
            (contact.role || "Customer").toLowerCase().includes(advancedFilters.role.toLowerCase());
        const matchesCity = !advancedFilters.city || 
            (contact.city || "").toLowerCase().includes(advancedFilters.city.toLowerCase());

        return matchesQuery && matchesStatus && matchesRole && matchesCity;
    });

    const totalContacts = filteredContacts.length;
    const totalPages = Math.ceil(totalContacts / itemsPerPage);
    const startIndex = totalContacts > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(currentPage * itemsPerPage, totalContacts);
    const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <Sidebar activePage="customers" />
            
            <main className="flex-1 p-4 lg:p-10">
                <FeatureGuard featureName="Contact Management">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Contact Management</h1>
                            <p className="text-slate-500 font-medium mt-1">Unified CRM for all your customer inquiries.</p>
                        </div>
                        <div className="flex gap-4">
                            {selectedContacts.length > 0 && (
                                <>
                                    <button 
                                        onClick={() => setShowListModal(true)}
                                        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-[24px] font-black shadow-xl shadow-emerald-100 hover:-translate-y-1 transition-all"
                                    >
                                        <Plus size={20} />
                                        Add to List ({selectedContacts.length})
                                    </button>
                                    <button 
                                        onClick={handleDeleteSelected}
                                        className="flex items-center gap-2 bg-rose-600 text-white px-6 py-4 rounded-[24px] font-black shadow-xl shadow-rose-100 hover:-translate-y-1 transition-all"
                                    >
                                        Delete Selected ({selectedContacts.length})
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-slate-50 text-slate-900 px-6 py-4 rounded-[24px] font-black hover:bg-slate-100 transition-all"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
                            <button 
                                onClick={() => document.getElementById('excel-file-input').click()}
                                className="flex items-center gap-2 bg-slate-50 text-slate-900 px-6 py-4 rounded-[24px] font-black hover:bg-slate-100 transition-all"
                            >
                                <Upload size={20} />
                                Import Excel
                            </button>
                            <input 
                                id="excel-file-input"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleImportExcel}
                                className="hidden"
                            />
                            <button 
                                onClick={handleAddContact}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
                            >
                                <UserPlus size={20} />
                                Add Contact
                            </button>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                        <div className="xl:col-span-2 relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by name, email or phone..."
                                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 appearance-none cursor-pointer"
                        >
                            <option value="All Statuses">All Statuses</option>
                            <option value="Inquired">Inquired</option>
                            <option value="Responded">Responded</option>
                            <option value="Booked">Booked</option>
                        </select>
                        <div className="relative">
                            <button 
                                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${showAdvancedFilter ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
                            >
                                <Filter size={18} />
                                Advanced Filter
                            </button>
                            
                            {showAdvancedFilter && (
                                <div className="absolute right-0 mt-3 w-80 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 z-50 space-y-4">
                                    <h4 className="font-black text-slate-800 text-sm">Filter Customers</h4>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Service Type / Role</label>
                                        <input 
                                            type="text"
                                            value={advancedFilters.role}
                                            onChange={(e) => { setAdvancedFilters(prev => ({ ...prev, role: e.target.value })); setCurrentPage(1); }}
                                            placeholder="e.g. Consultation, Repair"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">City / Location</label>
                                        <input 
                                            type="text"
                                            value={advancedFilters.city}
                                            onChange={(e) => { setAdvancedFilters(prev => ({ ...prev, city: e.target.value })); setCurrentPage(1); }}
                                            placeholder="e.g. Rajkot, Mumbai"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => { setAdvancedFilters({ role: "", city: "" }); setCurrentPage(1); }}
                                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contacts Table */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
                        {showListModal && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                                <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-2xl font-black text-slate-900">Select List</h3>
                                        <button onClick={() => setShowListModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                                    </div>
                                    <div className="space-y-3">
                                        {mailingLists.map(list => (
                                            <button 
                                                key={list._id} 
                                                onClick={() => handleAddToList(list._id)}
                                                className="w-full p-6 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded-3xl text-left font-black transition-all flex items-center justify-between group"
                                            >
                                                {list.name}
                                                <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                        {mailingLists.length === 0 && (
                                            <p className="text-center py-6 text-slate-400 font-bold italic">No custom lists found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-6 w-10 border-b border-slate-100">
                                            <input 
                                                type="checkbox" 
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedContacts(contacts.map(c => c._id));
                                                    else setSelectedContacts([]);
                                                }}
                                                className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Role</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact Info</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Loading contacts...</td></tr>
                                    ) : paginatedContacts.length > 0 ? paginatedContacts.map((contact) => (
                                        <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedContacts.includes(contact._id)}
                                                    onChange={() => toggleSelection(contact._id)}
                                                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {(contact.fullName || contact.name || "C").charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900">{contact.fullName || contact.name}</h4>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <span className="font-bold text-sm text-slate-700">
                                                    {contact.role || "Customer"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {contact.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                        <Phone size={12} className="text-slate-400" />
                                                        {contact.mobile || "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                    <MapPin size={14} className="text-indigo-500" />
                                                    {contact.city || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">
                                                    {contact.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50 text-right">
                                                 <div className="flex items-center justify-end gap-2">
                                                     <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                                         <FileText size={18} />
                                                     </button>
                                                     <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all">
                                                         <Star size={18} />
                                                     </button>
                                                     <div className="relative inline-block text-left">
                                                         <button 
                                                             onClick={() => setActiveDropdown(activeDropdown === contact._id ? null : contact._id)}
                                                             className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-200 transition-all"
                                                         >
                                                             <MoreHorizontal size={18} />
                                                         </button>
                                                         {activeDropdown === contact._id && (
                                                             <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-left">
                                                                 <button 
                                                                     onClick={() => {
                                                                         setEditingContact(contact);
                                                                         setNewContact({
                                                                             name: contact.fullName || contact.name || "",
                                                                             email: contact.email || "",
                                                                             mobile: contact.mobile || "",
                                                                             role: contact.role || "",
                                                                             city: contact.city || "",
                                                                             state: contact.state || "",
                                                                             status: contact.status || "Inquired",
                                                                             message: contact.message || ""
                                                                         });
                                                                         setShowAddModal(true);
                                                                         setActiveDropdown(null);
                                                                     }}
                                                                     className="w-full px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs transition-all flex items-center gap-2"
                                                                 >
                                                                     Update
                                                                 </button>
                                                                 <button 
                                                                     onClick={() => {
                                                                         handleDeleteContact(contact._id);
                                                                         setActiveDropdown(null);
                                                                     }}
                                                                     className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-all flex items-center gap-2"
                                                                 >
                                                                     Delete
                                                                 </button>
                                                             </div>
                                                         )}
                                                     </div>
                                                 </div>
                                             </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-bold">No contacts found in your inquiry history.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalContacts > 0 && (
                            <div className="p-8 flex items-center justify-between bg-slate-50/30">
                                <p className="text-sm font-bold text-slate-400">
                                    Showing {startIndex} to {endIndex} of {totalContacts} contacts
                                </p>
                                {totalPages > 1 && (
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                                                <button 
                                                    key={p} 
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${p === currentPage ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {showAddModal && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                            <div className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl relative">
                                <h3 className="text-2xl font-black text-slate-900 mb-6">{editingContact ? "Update Contact" : "Add Contact"}</h3>
                                
                                <form onSubmit={handleSaveContact} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={newContact.name}
                                            onChange={e => setNewContact({...newContact, name: e.target.value})}
                                            placeholder="e.g. Amit Patel"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={newContact.email}
                                            onChange={e => setNewContact({...newContact, email: e.target.value})}
                                            placeholder="e.g. amit@example.com"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mobile Number</label>
                                        <input 
                                            type="text" 
                                            value={newContact.mobile}
                                            onChange={e => setNewContact({...newContact, mobile: e.target.value})}
                                            placeholder="e.g. 9876543210"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Service Type / Role</label>
                                        <input 
                                            type="text" 
                                            value={newContact.role}
                                            onChange={e => setNewContact({...newContact, role: e.target.value})}
                                            placeholder="e.g. Home Cleaning, Consultation"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">City</label>
                                            <input 
                                                type="text" 
                                                value={newContact.city}
                                                onChange={e => setNewContact({...newContact, city: e.target.value})}
                                                placeholder="e.g. Rajkot"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">State</label>
                                            <input 
                                                type="text" 
                                                value={newContact.state}
                                                onChange={e => setNewContact({...newContact, state: e.target.value})}
                                                placeholder="e.g. Gujarat"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                                        <select 
                                            value={newContact.status}
                                            onChange={e => setNewContact({...newContact, status: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700"
                                        >
                                            <option value="Inquired">Inquired</option>
                                            <option value="Responded">Responded</option>
                                            <option value="Booked">Booked</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            type="submit" 
                                            disabled={savingContact}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                                        >
                                            {savingContact ? "Saving..." : editingContact ? "Update Contact" : "Save Contact"}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowAddModal(false)}
                                            className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {importingState.importing && (
                        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-[110] flex flex-col items-center justify-center p-6 text-white text-center">
                            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                            <h3 className="text-3xl font-black mb-4">Importing Contacts...</h3>
                            <p className="text-indigo-200 font-bold max-w-md text-lg">
                                Processing <span className="text-white font-black">{importingState.total}</span> records. 
                                This will take approximately <span className="text-white font-black">{importingState.estimatedMinutes}</span> minute(s).
                            </p>
                            <p className="text-rose-400 font-black mt-6 animate-pulse uppercase tracking-widest text-sm">
                                ⚠️ Please do not close, log out, or go back from this page!
                            </p>
                        </div>
                    )}

                </div>
                </FeatureGuard>
            </main>
        </div>
    );
}
