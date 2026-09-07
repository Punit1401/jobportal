"use client";

import { useState, useEffect } from "react";
import { 
  Search, Users, Mail, Phone, MapPin, 
  Download, Filter, ChevronLeft, ChevronRight,
  User, Briefcase, Wrench, Globe, ExternalLink,
  Loader2, RefreshCw, Database
} from "lucide-react";

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contacts", { cache: "no-store" });
      const data = await res.json();
      setContacts(data || []);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filterCategories = ["All", "Candidate", "Recruiter", "ServiceProvider", "Enquiry", "Candidate Job"];

  const filteredContacts = contacts.filter(c => {
    let matchesRole = true;
    if (roleFilter !== "All") {
      if (roleFilter === "Candidate Job") {
        matchesRole = c.role.includes("Candidate Job");
      } else {
        matchesRole = c.role === roleFilter;
      }
    }
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.toLowerCase().includes(searchLower) ||
      c.company.toLowerCase().includes(searchLower) ||
      c.source.toLowerCase().includes(searchLower);
    
    return matchesRole && matchesSearch;
  });

  const totalPages = Math.ceil(filteredContacts.length / pageSize);
  const paginatedContacts = filteredContacts.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    if (filteredContacts.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Role", "Company", "Source", "Location", "Date"];
    const csv = [
      headers.join(","),
      ...filteredContacts.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.role}"`,
        `"${c.company}"`,
        `"${c.source}"`,
        `"${c.location}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "contacts_master_list.csv");
    link.click();
  };

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const getRoleIcon = (role) => {
    if (role === "Enquiry") return <Mail size={14} />;
    if (role.includes("Candidate Job")) return <Globe size={14} />;
    switch (role) {
      case "Recruiter": return <Briefcase size={14} />;
      case "ServiceProvider": return <Wrench size={14} />;
      case "Candidate": return <User size={14} />;
      default: return <Database size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <Users size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Master Database</h1>
            </div>
            <p className="text-slate-500 font-medium">Centralized directory of all recruiters, candidates, providers, and job-based contacts.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={fetchContacts}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
            >
              <Download size={18} /> Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard label="Total Unique" value={contacts.length} color="bg-indigo-50 text-indigo-600" icon={<Database size={20} />} />
          <StatCard label="Enquiries" value={contacts.filter(c => c.role === "Enquiry").length} color="bg-rose-50 text-rose-600" icon={<Mail size={20} />} />
          <StatCard label="Recruiters" value={contacts.filter(c => c.role === "Recruiter").length} color="bg-blue-50 text-blue-600" icon={<Briefcase size={20} />} />
          <StatCard label="Service Providers" value={contacts.filter(c => c.role === "ServiceProvider").length} color="bg-emerald-50 text-emerald-600" icon={<Wrench size={20} />} />
          <StatCard label="Candidates" value={contacts.filter(c => c.role === "Candidate").length} color="bg-amber-50 text-amber-600" icon={<User size={20} />} />
          <StatCard label="Job Posts" value={contacts.filter(c => c.role.includes("Candidate Job")).length} color="bg-slate-50 text-slate-600" icon={<Globe size={20} />} />
        </div>


        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, email, phone, company or source..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <Filter size={18} className="text-slate-400 shrink-0" />
              {filterCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setRoleFilter(cat); setPage(1); }}
                  className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                    roleFilter === cat 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Company</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source & Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Synchronizing Database...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedContacts.length > 0 ? (
                  paginatedContacts.map((contact, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-black text-xs uppercase">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{contact.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5 flex items-center gap-1">
                              <MapPin size={10} className="text-rose-500" /> {contact.location || "Location N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit border ${
                            contact.role === 'Recruiter' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            contact.role === 'ServiceProvider' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            contact.role === 'Candidate' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            contact.role === 'Enquiry' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            contact.role.includes('Candidate Job') ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {getRoleIcon(contact.role)} {contact.role}
                          </span>
                          <p className="text-xs font-bold text-slate-600">{contact.company}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Mail size={14} className="text-slate-400" /> {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Phone size={14} className="text-slate-400" /> {contact.phone}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{contact.source}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(contact.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {contact.role === "Enquiry" ? (
                             <button 
                               onClick={() => setSelectedEnquiry(contact)}
                               className="p-2 bg-rose-50 text-rose-600 rounded-lg transition-all hover:bg-rose-100 shadow-sm" 
                               title="View Message"
                             >
                               <Mail size={16} />
                             </button>
                           ) : (
                             <>
                               {contact.email !== 'N/A' && (
                                 <a href={`mailto:${contact.email}`} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Send Email">
                                   <Mail size={16} />
                                 </a>
                               )}
                               <button className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                 <ExternalLink size={16} />
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching contacts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredContacts.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredContacts.length)} of {filteredContacts.length} Contacts
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                          page === pageNum ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-500 border border-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enquiry Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100">
                       <Mail size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Contact Enquiry</h3>
                       <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">Incoming Message</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedEnquiry(null)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
                    <RefreshCw size={20} className="rotate-45" />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">From</p>
                       <p className="font-bold text-slate-900">{selectedEnquiry.name}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                       <p className="font-bold text-slate-900">{new Date(selectedEnquiry.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                    <p className="font-bold text-slate-900">{selectedEnquiry.details?.subject || "No Subject"}</p>
                 </div>
                 <div className="p-6 bg-slate-900 rounded-[30px] text-slate-200">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Message Body</p>
                    <p className="text-sm font-medium leading-relaxed italic">"{selectedEnquiry.details?.message}"</p>
                 </div>
              </div>
              <div className="p-8 pt-0">
                 <button 
                   onClick={() => setSelectedEnquiry(null)}
                   className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                 >
                    Close Message
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h2 className="text-3xl font-black text-slate-900 mt-1">{value.toLocaleString()}</h2>
    </div>
  );
}
