"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import FeatureGuard from '@/components/FeatureGuard';
import { Layers, Users, Search, Plus, Filter, MoreVertical, Edit2, Trash2, Download, CheckCircle2, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MailingListPage() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedNewContacts, setSelectedNewContacts] = useState([]);
    const [viewingList, setViewingList] = useState(null);
    const [targetListForAdding, setTargetListForAdding] = useState(null);
    const [showContactSelector, setShowContactSelector] = useState(false);

    const [activeTab, setActiveTab] = useState("lists"); // "lists" or "candidates"
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [professionFilter, setProfessionFilter] = useState("");
    
    const [distinctRoles, setDistinctRoles] = useState([]);
    const [distinctCities, setDistinctCities] = useState([]);
    const [distinctProfessions, setDistinctProfessions] = useState([]);

    const fetchData = async () => {
        try {
            const listRes = await fetch('/api/recruiter/mailing-list');
            const listData = await listRes.json();
            if (listData.ok) setLists(listData.data);

            const contactRes = await fetch('/api/recruiter/contacts');
            const contactData = await contactRes.json();
            if (contactData.ok) {
                setAllContacts(contactData.data);
                // Extract distinct values for filters
                setDistinctRoles([...new Set(contactData.data.map(c => c.role || c.position).filter(r => r))]);
                setDistinctCities([...new Set(contactData.data.map(c => c.city).filter(r => r))]);
                setDistinctProfessions([...new Set(contactData.data.map(c => c.profession).filter(r => r))]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleContactSelection = (id) => {
        setSelectedNewContacts(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreateListWithSelected = async () => {
        if (selectedNewContacts.length === 0) {
            alert("Please select candidates first.");
            return;
        }
        const name = prompt("Enter name for the new list:");
        if (!name) return;

        try {
            const res = await fetch('/api/recruiter/mailing-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, candidateIds: selectedNewContacts })
            });
            if (res.ok) {
                alert("Mailing list created successfully!");
                setSelectedNewContacts([]);
                setActiveTab("lists");
                fetchData();
            }
        } catch (error) {
            alert("Error creating list.");
        }
    };

    const handleDeleteList = async (id) => {
        if (!confirm("Are you sure you want to delete this list?")) return;
        try {
            const res = await fetch(`/api/recruiter/mailing-list?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLists(lists.filter(l => l._id !== id));
            }
        } catch (error) {
            alert("Error deleting list.");
        }
    };

    const handleAddSelectedToCurrentList = async () => {
        if (!viewingList || selectedNewContacts.length === 0) return;
        try {
            const res = await fetch('/api/recruiter/mailing-list', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listId: viewingList._id, candidateIds: selectedNewContacts })
            });
            if (res.ok) {
                alert("Candidates added successfully!");
                setSelectedNewContacts([]);
                setShowContactSelector(false);
                fetchData();
                setViewingList(null);
            }
        } catch (error) {
            alert("Error adding members.");
        }
    };

    const filteredContacts = allContacts.filter(c => {
        const matchesSearch = (c.name || c.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (c.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "" || (c.role || c.position) === roleFilter;
        const matchesCity = cityFilter === "" || c.city === cityFilter;
        const matchesProfession = professionFilter === "" || c.profession === professionFilter;
        return matchesSearch && matchesRole && matchesCity && matchesProfession;
    });

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="mailinglist" />
            
            <main className="flex-1 p-4 lg:p-10">
                <FeatureGuard featureName="Mailing List">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Tabs & Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <Layers size={40} className="text-indigo-600" />
                                Mailing Manager
                            </h1>
                            <div className="flex gap-4 mt-6">
                                <button 
                                    onClick={() => setActiveTab("lists")}
                                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "lists" ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                                >
                                    Saved Lists
                                </button>
                                <button 
                                    onClick={() => setActiveTab("candidates")}
                                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "candidates" ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                                >
                                    All Candidates
                                </button>
                            </div>
                        </div>

                        {activeTab === "candidates" ? (
                            <div className="flex flex-col xl:flex-row gap-4 w-full xl:w-auto">
                                <div className="relative flex-1 xl:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        placeholder="Search candidates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="relative w-40">
                                        <select 
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            className="w-full pl-4 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">All Roles</option>
                                            {distinctRoles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative w-40">
                                        <select 
                                            value={cityFilter}
                                            onChange={(e) => setCityFilter(e.target.value)}
                                            className="w-full pl-4 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">All Cities</option>
                                            {distinctCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative w-40">
                                        <select 
                                            value={professionFilter}
                                            onChange={(e) => setProfessionFilter(e.target.value)}
                                            className="w-full pl-4 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">All Professions</option>
                                            {distinctProfessions.map(prof => (
                                                <option key={prof} value={prof}>{prof}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {targetListForAdding ? (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={async () => {
                                                if (selectedNewContacts.length === 0) return;
                                                try {
                                                    const res = await fetch('/api/recruiter/mailing-list', {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ listId: targetListForAdding._id, candidateIds: selectedNewContacts })
                                                    });
                                                    if (res.ok) {
                                                        alert(`Added ${selectedNewContacts.length} candidates to ${targetListForAdding.name}`);
                                                        setSelectedNewContacts([]);
                                                        setTargetListForAdding(null);
                                                        setActiveTab("lists");
                                                        fetchData();
                                                    }
                                                } catch (e) { alert("Error adding to list"); }
                                            }}
                                            disabled={selectedNewContacts.length === 0}
                                            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
                                        >
                                            Add to {targetListForAdding.name} ({selectedNewContacts.length})
                                        </button>
                                        <button 
                                            onClick={() => setTargetListForAdding(null)}
                                            className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleCreateListWithSelected}
                                        disabled={selectedNewContacts.length === 0}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                    >
                                        Create List ({selectedNewContacts.length})
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => setActiveTab("candidates")}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
                            >
                                <Plus size={20} />
                                New List
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    {activeTab === "lists" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {lists.map((list) => (
                                <div key={list._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <Layers size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDeleteList(list._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{list.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-8">
                                        <Users size={16} />
                                        <span>{list.members?.length || 0} Contacts</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setViewingList(list)}
                                            className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                                        >
                                            View & Manage
                                        </button>
                                        <Link 
                                            href={`/recruiter/mailer?list=${list._id}`}
                                            className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all"
                                        >
                                            <Mail size={20} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {lists.length === 0 && !loading && (
                                <div className="col-span-full py-20 text-center text-slate-400 font-bold italic border-4 border-dashed border-slate-100 rounded-[40px]">
                                    No saved mailing lists. Click "New List" to get started.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest w-16">
                                            <input 
                                                type="checkbox" 
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedNewContacts(filteredContacts.map(c => c._id));
                                                    else setSelectedNewContacts([]);
                                                }}
                                                className="w-5 h-5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role / Position</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredContacts.map(contact => (
                                        <tr key={contact._id} className="hover:bg-slate-50 transition-all group">
                                            <td className="px-8 py-6">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedNewContacts.includes(contact._id)}
                                                    onChange={() => toggleContactSelection(contact._id)}
                                                    className="w-5 h-5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600">{contact.name?.[0]}</div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{contact.name || contact.fullName}</p>
                                                        <p className="text-xs font-bold text-slate-400">{contact.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest">{contact.role || contact.position || "N/A"}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                    Applied
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                                                    <Plus size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredContacts.length === 0 && (
                                <div className="p-20 text-center text-slate-400 font-bold italic">
                                    No candidates found. Ensure they have applied for jobs to show up here.
                                </div>
                            )}
                        </div>
                    )}

                    {/* View List Detail Modal */}
                    {viewingList && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                            <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900">{viewingList.name}</h3>
                                        <p className="text-slate-400 font-bold mt-1">{viewingList.members?.length || 0} Members</p>
                                    </div>
                                    <button onClick={() => setViewingList(null)} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl font-black transition-all">Close</button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-4 no-scrollbar">
                                    {viewingList.members?.map(member => (
                                        <div key={member._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 border border-slate-100">{(member.fullName || member.name || "C")[0]}</div>
                                                <div>
                                                    <p className="font-black text-slate-900">{member.fullName || member.name}</p>
                                                    <p className="text-xs font-bold text-slate-400">{member.email}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button 
                                        onClick={() => {
                                            setTargetListForAdding(viewingList);
                                            setActiveTab("candidates");
                                            setViewingList(null);
                                        }}
                                        className="py-5 bg-indigo-50 text-indigo-600 rounded-[24px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} /> Add More
                                    </button>
                                    <Link href={`/recruiter/mailer?list=${viewingList._id}`} className="py-5 bg-slate-900 text-white rounded-[24px] text-center font-black uppercase tracking-widest hover:bg-black transition-all">
                                        Start Campaign
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                </FeatureGuard>
            </main>
        </div>
    );
}
