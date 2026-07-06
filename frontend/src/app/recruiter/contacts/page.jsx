"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Users, Search, Filter, Mail, Phone, MapPin, MoreHorizontal, Download, UserPlus, Star, ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [mailingLists, setMailingLists] = useState([]);
    const [showListModal, setShowListModal] = useState(false);

    const fetchMailingLists = async () => {
        const res = await fetch('/api/recruiter/mailing-list');
        const data = await res.json();
        if (data.ok) setMailingLists(data.data.filter(l => l.type === 'Custom' || l._id.length > 20));
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/recruiter/contacts');
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
            const res = await fetch('/api/recruiter/mailing-list', {
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

    const handleAddContact = () => {
        alert("Manual contact addition will be available in the next update. For now, candidates are added automatically when they apply.");
    };

    const handleExport = () => {
        const headers = ["Name", "Email", "Mobile", "Role", "Status", "City"];
        const rows = contacts.map(c => [c.name, c.email, c.mobile, c.role, c.status, c.city]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "candidates_contacts.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleViewResume = (contact) => {
        if (contact.resumeUrl) {
            window.open(contact.resumeUrl, '_blank');
        } else {
            alert("This candidate has not uploaded a resume yet.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="contacts" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Contact Management</h1>
                            <p className="text-slate-500 font-medium mt-1">Unified CRM for all your candidate interactions.</p>
                        </div>
                        <div className="flex gap-4">
                            {selectedContacts.length > 0 && (
                                <button 
                                    onClick={() => setShowListModal(true)}
                                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-[24px] font-black shadow-xl shadow-emerald-100 hover:-translate-y-1 transition-all"
                                >
                                    <Plus size={20} />
                                    Add to List ({selectedContacts.length})
                                </button>
                            )}
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-slate-50 text-slate-900 px-6 py-4 rounded-[24px] font-black hover:bg-slate-100 transition-all"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
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
                                placeholder="Search by name, role, email or phone..."
                                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                            />
                        </div>
                        <select className="px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 appearance-none cursor-pointer">
                            <option>All Statuses</option>
                            <option>Active</option>
                            <option>Placed</option>
                            <option>In Discussion</option>
                        </select>
                        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all">
                            <Filter size={18} />
                            Advanced Filter
                        </button>
                    </div>

                    {/* Contacts Table/Cards */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
                        {/* List Modal Overlay */}
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
                                            <p className="text-center py-6 text-slate-400 font-bold italic">No custom lists found. Create one in the Mailing List section first.</p>
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
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Candidate</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact Info</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.length > 0 ? contacts.map((contact) => (
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
                                                        <p className="text-xs text-slate-500 font-bold">{contact.role || "Candidate"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {contact.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                        <Phone size={12} className="text-slate-400" />
                                                        {contact.mobile || contact.phone || "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                    <MapPin size={14} className="text-indigo-500" />
                                                    {contact.city ? `${contact.city}, ${contact.state}` : "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    contact.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' :
                                                    contact.status === 'placed' ? 'bg-blue-50 text-blue-600' :
                                                    contact.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {contact.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50 text-right">
                                                 <div className="flex items-center justify-end gap-2">
                                                     <button 
                                                         onClick={() => handleViewResume(contact)}
                                                         className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                     >
                                                         <FileText size={18} />
                                                     </button>
                                                     <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all">
                                                         <Star size={18} />
                                                     </button>
                                                     <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                                         <MoreHorizontal size={18} />
                                                     </button>
                                                 </div>
                                             </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold">No contacts found in your recruitment history.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-8 flex items-center justify-between bg-slate-50/30">
                            <p className="text-sm font-bold text-slate-400">Showing 1 to 5 of 1,245 contacts</p>
                            <div className="flex gap-2">
                                <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(p => (
                                        <button key={p} className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${p === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
