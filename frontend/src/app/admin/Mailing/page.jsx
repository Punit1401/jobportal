"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Send, Clock, Layout, Sparkles, Users, UserCheck,
  ListChecks, ShieldCheck, Filter, Save, Trash2, CheckCircle, X, Check, Briefcase, MapPin
} from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function MailingPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [scheduledTime, setScheduledTime] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lists & Filters
  const [customList, setCustomList] = useState([]); // Will store selected user objects
  const [savedLists, setSavedLists] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter States
  const [filterType, setFilterType] = useState("candidates");
  const [filterCity, setFilterCity] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterExp, setFilterExp] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsersInModal, setSelectedUsersInModal] = useState([]);

  useEffect(() => {
    // Fetch Templates
    fetch("/api/admin/template")
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(() => []);

    // Load Permanent Saved Lists from LocalStorage
    const localSaved = JSON.parse(localStorage.getItem("permanentSavedLists") || "[]");
    setSavedLists(localSaved);

    // Load Active Selected List
    const savedActiveList = localStorage.getItem("selectedMailingList");
    if (savedActiveList) {
      const parsed = JSON.parse(savedActiveList);
      setCustomList(parsed);
      if (parsed.length > 0) setTarget("custom");
    }
  }, []);

  // --- NEW: Load default data when modal opens or filterType changes ---
  useEffect(() => {
    if (showFilterModal) {
      handleFilterSearch();
    }
  }, [showFilterModal, filterType]);

  // --- FULLY DYNAMIC FILTER SEARCH ---
  const handleFilterSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filterType,
        city: filterCity,
        profession: filterProfession,
        gender: filterGender,
        experience: filterExp
      });

      const res = await fetch(`/api/admin/users/filter?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const users = data.users || data;
        setSearchResults(users);
        // By default, select all found users
        setSelectedUsersInModal(users);
      } else {
        alert("Failed to fetch data from API");
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const toggleModalSelection = (user) => {
    const userId = user.id || user._id;
    setSelectedUsersInModal(prev =>
      prev.some(u => (u.id || u._id) === userId)
        ? prev.filter(u => (u.id || u._id) !== userId)
        : [...prev, user]
    );
  };

  const saveCurrentList = () => {
    if (customList.length === 0) return alert("No users in current list to save!");
    const listName = prompt("Enter a name for this mailing list:");
    if (!listName) return;

    const newList = {
      id: Date.now(),
      name: listName,
      count: customList.length,
      users: customList
    };

    const updated = [...savedLists, newList];
    setSavedLists(updated);
    localStorage.setItem("permanentSavedLists", JSON.stringify(updated));
    alert("✅ List Saved Successfully!");
  };

  const deleteSavedList = (id) => {
    const updated = savedLists.filter(l => l.id !== id);
    setSavedLists(updated);
    localStorage.setItem("permanentSavedLists", JSON.stringify(updated));
  };

  const handleAction = async (isSchedule = false) => {
    if (!subject || !message) return alert("Subject & Message are required!");
    if (isSchedule && !scheduledTime) return alert("Please select a time!");
    if (target === "custom" && customList.length === 0) return alert("Custom mailing list is empty!");

    setLoading(true);
    const endpoint = isSchedule ? "/api/scheduleMail" : "/api/sendMail";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          type: target,
          scheduledTime,
          allUsers: target !== "custom",
          userIds: target === "custom" ? customList.map(u => u.id || u._id) : []
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(isSchedule ? "✅ Scheduled!" : `🚀 Sent to ${data.sentTo} users!`);
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      alert("Error processing request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Sparkles className="text-indigo-600" /> Mailing Engine
          </h1>
          <button
            onClick={() => setShowFilterModal(true)}
            className="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:border-indigo-500 transition-all shadow-sm"
          >
            <Filter size={16} /> Build Dynamic List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-8">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-3 block tracking-[0.2em]">Broadcast Target</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <TargetBtn active={target === 'all'} onClick={() => setTarget('all')} icon={<Users size={18} />} label="All Users" />
                  <TargetBtn active={target === 'candidates'} onClick={() => setTarget('candidates')} icon={<UserCheck size={18} />} label="Candidates" />
                  <TargetBtn active={target === 'recruiters'} onClick={() => setTarget('recruiters')} icon={<Layout size={18} />} label="Recruiters" />
                  <TargetBtn active={target === 'custom'} onClick={() => { }} icon={<ListChecks size={18} />} label={`Custom (${customList.length})`} />
                </div>
              </div>

              <div className="space-y-4">
                <select
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  onChange={(e) => {
                    const t = templates.find(x => x._id === e.target.value);
                    if (t) { setSubject(t.subject); setMessage(t.content); }
                  }}
                >
                  <option value="">-- Load from Template --</option>
                  {templates.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                </select>

                <input
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-indigo-500 transition-all"
                  placeholder="Enter Campaign Subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <div className="h-80 mb-16">
                  <ReactQuill theme="snow" value={message} onChange={setMessage} className="h-full rounded-2xl" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end gap-6 pt-4 border-t border-slate-50">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Schedule Blast (Optional)</label>
                  <input type="datetime-local" className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50" onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleAction(true)} className="flex-1 md:flex-none px-8 py-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase text-xs hover:bg-indigo-100 transition-all">
                    Schedule
                  </button>
                  <button
                    onClick={() => handleAction(false)}
                    disabled={loading}
                    className="flex-1 md:flex-none px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
                  >
                    <Send size={20} /> {loading ? "Sending..." : "Blast Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {customList.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ListChecks size={16} /> Selected Mailing List
                  </h3>
                  <p className="text-5xl font-black mb-1">{customList.length}</p>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Verified Users Loaded</p>
                  <div className="mt-6 flex gap-2">
                    <button onClick={saveCurrentList} className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-[10px] font-black uppercase backdrop-blur-md flex items-center justify-center gap-1">
                      <Save size={12} /> Save List
                    </button>
                    <button onClick={() => { setCustomList([]); setTarget("all"); }} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-white transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <Sparkles className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24 rotate-12" />
              </div>
            )}

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Saved Lists <span>{savedLists.length}</span>
              </h3>
              <div className="space-y-3">
                {savedLists.length === 0 && <p className="text-center py-8 text-xs text-slate-300 font-bold uppercase italic">No saved lists</p>}
                {savedLists.map((list) => (
                  <div key={list.id} className="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between">
                    <button
                      onClick={() => { setCustomList(list.users); setTarget("custom"); }}
                      className="text-left flex-1"
                    >
                      <p className="text-xs font-black text-slate-800 uppercase group-hover:text-indigo-600">{list.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{list.count} Users</p>
                    </button>
                    <button onClick={() => deleteSavedList(list.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <QuickLink href="/admin/Mailing/template" icon={<Layout size={18} />} label="Templates" />
              <QuickLink href="/admin/Mailing/history" icon={<Clock size={18} />} label="History" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Dynamic Filter Modal --- */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black uppercase italic">Build Dynamic List</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter specific audience from database</p>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-white rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">User Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <FilterTab active={filterType === 'candidates'} onClick={() => setFilterType('candidates')} label="Candidates" />
                  <FilterTab active={filterType === 'recruiters'} onClick={() => setFilterType('recruiters')} label="Recruiters" />
                  <FilterTab active={filterType === 'experts'} onClick={() => setFilterType('experts')} label="Experts" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">City</label>
                  <input type="text" placeholder="e.g. Jamnagar" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Profession</label>
                  <input type="text" placeholder="e.g. Developer" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500" value={filterProfession} onChange={e => setFilterProfession(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Gender</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                    <option value="">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Experience</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500" value={filterExp} onChange={e => setFilterExp(e.target.value)}>
                    <option value="">Any Exp.</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-3">1-3 Years</option>
                    <option value="3+">3+ Years</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleFilterSearch}
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all"
              >
                {loading ? "Searching..." : "Fetch Results from Database"}
              </button>

              {searchResults.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Found ({searchResults.length})</p>
                    <button onClick={() => setSelectedUsersInModal(searchResults)} className="text-[10px] font-bold text-indigo-600 uppercase">Select All</button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {searchResults.map((user) => {
                      const uid = user.id || user._id;
                      const isSelected = selectedUsersInModal.some(u => (u.id || u._id) === uid);
                      return (
                        <div
                          key={uid}
                          onClick={() => toggleModalSelection(user)}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-50 bg-slate-50'}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-slate-700">{user.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">{user.email} • {user.city || 'N/A'}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'border-2 border-slate-200'}`}>
                            {isSelected && <Check size={12} strokeWidth={4} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t flex gap-3 shrink-0">
              <button onClick={() => setShowFilterModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
              <button
                onClick={() => {
                  setCustomList(selectedUsersInModal);
                  setTarget("custom");
                  setShowFilterModal(false);
                }}
                disabled={selectedUsersInModal.length === 0}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                Use {selectedUsersInModal.length} Selected Users
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ql-container { border-bottom-left-radius: 1.5rem; border-bottom-right-radius: 1.5rem; border: 2px solid #f1f5f9 !important; border-top: none !important; background: #fcfdfe; font-size: 16px; }
        .ql-toolbar { border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; border: 2px solid #f1f5f9 !important; background: white; padding: 12px !important; }
        .ql-editor { min-height: 250px; }
      `}</style>
    </div>
  );
}

function TargetBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-3xl border-2 text-[11px] font-black uppercase transition-all flex flex-col items-center gap-2 ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
    >
      {icon} {label}
    </button>
  );
}

function FilterTab({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-100 bg-white text-slate-400'}`}>
      {label}
    </button>
  );
}

function QuickLink({ href, icon, label }) {
  return (
    <a href={href} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-500 transition-all group">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">{icon}</div>
      <span className="text-xs font-black uppercase text-slate-600 group-hover:text-slate-900">{label}</span>
    </a>
  );
}