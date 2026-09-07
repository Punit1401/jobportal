"use client";
import React, { useState, useEffect } from "react";
import { HardDrive, Settings, Plus, Edit, Trash2, CheckCircle, Save, X } from "lucide-react";

export default function FilesFoldersAdminPage() {
  const [activeTab, setActiveTab] = useState("settings");
  
  // Storage Settings State
  const [settings, setSettings] = useState({
    defaultCandidateSpaceMB: 200,
    defaultRecruiterSpaceMB: 500,
    defaultServiceProviderSpaceMB: 500,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Storage Plans State
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [planForm, setPlanForm] = useState({
    title: "",
    addedSpaceMB: 0,
    price: 0,
    isActive: true,
  });

  // Fetch Settings
  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/storage/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Fetch Plans
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch("/api/admin/storage/plans");
      const data = await res.json();
      if (data.success) setPlans(data.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchPlans();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/storage/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        alert("Default storage allocations saved!");
      } else {
        alert("Error saving settings");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const openPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan._id);
      setPlanForm({
        title: plan.title,
        addedSpaceMB: plan.addedSpaceMB,
        price: plan.price,
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        title: "",
        addedSpaceMB: 500,
        price: 99,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    const method = editingPlan ? "PUT" : "POST";
    const payload = editingPlan ? { ...planForm, id: editingPlan } : planForm;

    try {
      const res = await fetch("/api/admin/storage/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPlans();
      } else {
        alert("Error saving plan");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving plan");
    }
  };

  const handleDeletePlan = async (id) => {
    if (confirm("Delete this storage package?")) {
      try {
        const res = await fetch(`/api/admin/storage/plans?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchPlans();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen text-slate-900 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Files & Storage</h1>
          <p className="text-slate-500 text-sm">Manage default storage limits and purchasable storage packs</p>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-200/60 w-fit rounded-2xl mb-10 backdrop-blur-sm">
        <button 
          onClick={() => setActiveTab("settings")} 
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "settings" ? "bg-white text-blue-600 shadow-md" : "text-slate-600 hover:text-slate-800"}`}
        >
          <Settings className="inline mr-2" size={16} /> Global Settings
        </button>
        <button 
          onClick={() => setActiveTab("plans")} 
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "plans" ? "bg-white text-blue-600 shadow-md" : "text-slate-600 hover:text-slate-800"}`}
        >
          <HardDrive className="inline mr-2" size={16} /> Storage Packages
        </button>
      </div>

      {activeTab === "settings" && (
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm max-w-3xl">
          <h2 className="text-xl font-black text-slate-800 mb-6">Default File Upload Limits</h2>
          <p className="text-slate-500 text-sm mb-8">Set the default free storage size allocated to each user role (in Megabytes).</p>

          {loadingSettings ? (
            <div className="animate-pulse flex flex-col gap-6">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Candidates</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Default storage for job seekers</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.defaultCandidateSpaceMB} 
                    onChange={(e) => setSettings({...settings, defaultCandidateSpaceMB: Number(e.target.value)})}
                    className="w-24 p-3 bg-white border border-slate-200 rounded-xl font-bold text-center outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">MB</span>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Recruiters</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Default storage for hiring companies</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.defaultRecruiterSpaceMB} 
                    onChange={(e) => setSettings({...settings, defaultRecruiterSpaceMB: Number(e.target.value)})}
                    className="w-24 p-3 bg-white border border-slate-200 rounded-xl font-bold text-center outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">MB</span>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Service Providers</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Default storage for consultants & agencies</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={settings.defaultServiceProviderSpaceMB} 
                    onChange={(e) => setSettings({...settings, defaultServiceProviderSpaceMB: Number(e.target.value)})}
                    className="w-24 p-3 bg-white border border-slate-200 rounded-xl font-bold text-center outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">MB</span>
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex justify-center items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save size={20} /> {savingSettings ? "Saving..." : "Save Default Limits"}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "plans" && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Storage Upgrade Packages</h2>
            <button 
              onClick={() => openPlanModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus size={16} /> New Package
            </button>
          </div>

          {loadingPlans ? (
            <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Loading Packages...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px]">
              <HardDrive size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Storage Packages</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">Create your first package to let users purchase extra space.</p>
              <button onClick={() => openPlanModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"><Plus size={18} /> Add Package</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plans.map(plan => (
                <div key={plan._id} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all relative">
                  {!plan.isActive && (
                    <div className="absolute top-4 right-4 bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">Inactive</div>
                  )}
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <HardDrive size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">{plan.title}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span className="text-3xl font-black text-indigo-600">₹{plan.price}</span>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      +{plan.addedSpaceMB >= 1024 ? `${(plan.addedSpaceMB / 1024).toFixed(1)} GB` : `${plan.addedSpaceMB} MB`} Extra Space
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openPlanModal(plan)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-black flex justify-center items-center gap-1 transition-all">
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeletePlan(plan._id)} className="flex-1 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black flex justify-center items-center gap-1 transition-all">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-all"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-800 mb-6">{editingPlan ? "Edit Package" : "Create Storage Package"}</h2>
            
            <form onSubmit={handleSavePlan} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Package Title</label>
                <input 
                  type="text" 
                  required 
                  value={planForm.title} 
                  onChange={(e) => setPlanForm({...planForm, title: e.target.value})} 
                  placeholder="e.g. 10 GB Extra Space"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:border-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Extra Space (MB)</label>
                  <input 
                    type="number" 
                    required 
                    value={planForm.addedSpaceMB} 
                    onChange={(e) => setPlanForm({...planForm, addedSpaceMB: Number(e.target.value)})} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Price (INR)</label>
                  <input 
                    type="number" 
                    required 
                    value={planForm.price} 
                    onChange={(e) => setPlanForm({...planForm, price: Number(e.target.value)})} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:border-indigo-500" 
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-2xl bg-slate-50">
                <input 
                  type="checkbox" 
                  checked={planForm.isActive} 
                  onChange={(e) => setPlanForm({...planForm, isActive: e.target.checked})} 
                  className="w-5 h-5 accent-indigo-600 rounded" 
                /> 
                <span className="font-bold text-sm text-slate-700">Package is Active</span>
              </label>

              <button type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-200">
                <Save size={20} /> {editingPlan ? "Update Package" : "Publish Package"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
