"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Megaphone,
  Loader2,
  Briefcase,
  Users,
  IndianRupee,
  X,
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  duration: "7",
  durationType: "Days",
  userType: "Recruiter",
  features: "",
  estimatedImpressions: "",
  estimatedClicks: "",
  isActive: true,
  isPopular: false,
  displayOrder: "0",
};

export default function AdminAdvertisingPlansPage() {
  const [activeTab, setActiveTab] = useState("Recruiter");
  const [plans, setPlans] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState("plans");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ad-plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
        setPurchases(data.purchases || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, userType: activeTab });
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      title: plan.title,
      description: plan.description || "",
      price: String(plan.price),
      duration: String(plan.duration),
      durationType: plan.durationType || "Days",
      userType: plan.userType,
      features: (plan.features || []).join("\n"),
      estimatedImpressions: String(plan.estimatedImpressions || ""),
      estimatedClicks: String(plan.estimatedClicks || ""),
      isActive: plan.isActive !== false,
      isPopular: Boolean(plan.isPopular),
      displayOrder: String(plan.displayOrder || 0),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      duration: Number(form.duration),
      durationType: form.durationType,
      userType: form.userType,
      features: form.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      estimatedImpressions: Number(form.estimatedImpressions) || 0,
      estimatedClicks: Number(form.estimatedClicks) || 0,
      isActive: form.isActive,
      isPopular: form.isPopular,
      displayOrder: Number(form.displayOrder) || 0,
    };

    try {
      const res = await fetch("/api/admin/ad-plans", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        load();
        alert(editingId ? "Plan updated" : "Plan created");
      } else {
        alert(data.error || "Save failed");
      }
    } catch {
      alert("Save failed");
    }
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this advertisement plan?")) return;
    await fetch(`/api/admin/ad-plans?id=${id}`, { method: "DELETE" });
    load();
  };

  const filteredPlans = plans.filter((p) => p.userType === activeTab);
  const filteredPurchases = purchases.filter((p) => {
    const type = p.userRole === "recruiter" ? "Recruiter" : "ServiceProvider";
    return type === activeTab;
  });

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Megaphone className="text-indigo-600" /> Advertisement Plans
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Create plans, track purchases, and monitor campaign status
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <Plus size={18} /> Add Ad Plan
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MiniStat label="Total Plans" value={stats.totalPlans || 0} />
          <MiniStat label="Active Plans" value={stats.activePlans || 0} />
          <MiniStat label="Total Purchases" value={stats.totalPurchases || 0} />
          <MiniStat label="Revenue" value={`₹${(stats.revenue || 0).toLocaleString("en-IN")}`} />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2 bg-white p-1 rounded-xl border">
            <button
              type="button"
              onClick={() => setActiveTab("Recruiter")}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                activeTab === "Recruiter" ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
            >
              <Briefcase size={16} /> Recruiters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ServiceProvider")}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                activeTab === "ServiceProvider" ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
            >
              <Users size={16} /> Service Providers
            </button>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl border">
            <button
              type="button"
              onClick={() => setView("plans")}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                view === "plans" ? "bg-indigo-600 text-white" : "text-slate-500"
              }`}
            >
              Plans
            </button>
            <button
              type="button"
              onClick={() => setView("purchases")}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                view === "purchases" ? "bg-indigo-600 text-white" : "text-slate-500"
              }`}
            >
              Purchases ({filteredPurchases.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : view === "plans" ? (
          <div className="space-y-3">
            {filteredPlans.length === 0 && (
              <p className="text-center py-12 text-slate-400 font-bold">No plans for this category.</p>
            )}
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white p-6 rounded-2xl border flex justify-between items-center gap-4"
              >
                <div>
                  <h3 className="font-black text-lg">
                    {plan.title} {plan.isPopular && "⭐"}
                    {!plan.isActive && (
                      <span className="ml-2 text-xs text-rose-500">(Inactive)</span>
                    )}
                  </h3>
                  <p className="text-indigo-600 font-bold">
                    ₹{plan.price} / {plan.duration} {plan.durationType}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Purchased {plan.purchaseCount || 0} times • ~
                    {plan.estimatedImpressions} impressions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    className="p-2 text-slate-400 hover:text-indigo-600"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePlan(plan._id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black">
                <tr>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Purchased</th>
                  <th className="p-4">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                      No purchases yet
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="p-4">
                        <p className="font-bold">{p.userName || "—"}</p>
                        <p className="text-xs text-slate-500">{p.userEmail}</p>
                        <p className="text-[10px] uppercase text-slate-400">{p.userRole}</p>
                      </td>
                      <td className="p-4 font-bold">{p.planId?.title || p.name}</td>
                      <td className="p-4 font-black text-indigo-600">
                        ₹{(p.amountPaid || p.budget || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                            p.displayStatus === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : p.displayStatus === "Expired"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {p.displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td className="p-4 text-slate-600">
                        {p.expiresAt
                          ? new Date(p.expiresAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">{editingId ? "Edit Plan" : "New Ad Plan"}</h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <Field label="Title" required>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                  rows={2}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₹)" required>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                  />
                </Field>
                <Field label="Duration (days)" required>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                  />
                </Field>
              </div>
              <Field label="User Type">
                <select
                  value={form.userType}
                  onChange={(e) => setForm({ ...form, userType: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Recruiter">Recruiter</option>
                  <option value="ServiceProvider">Service Provider</option>
                </select>
              </Field>
              <Field label="Features (one per line)">
                <textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                  rows={3}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Est. Impressions">
                  <input
                    type="number"
                    value={form.estimatedImpressions}
                    onChange={(e) => setForm({ ...form, estimatedImpressions: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                  />
                </Field>
                <Field label="Est. Clicks">
                  <input
                    type="number"
                    value={form.estimatedClicks}
                    onChange={(e) => setForm({ ...form, estimatedClicks: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 font-bold text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active (visible to users)
              </label>
              <label className="flex items-center gap-2 font-bold text-sm">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                />
                Mark as popular
              </label>
            </div>
            <button
              type="submit"
              className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-xl font-black"
            >
              {editingId ? "Update Plan" : "Create Plan"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-black uppercase text-slate-400 block mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
