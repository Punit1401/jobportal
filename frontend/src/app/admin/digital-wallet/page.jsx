"use client";

import React, { useState, useEffect } from "react";
import { 
  Loader2, ArrowUpRight, ArrowDownRight, Wallet, 
  CheckCircle2, Clock, XCircle, Search, Filter, 
  Edit3, Trash2, X 
} from "lucide-react";

export default function DigitalWalletAdminPage() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ totalCredit: 0, totalDebit: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'credit', 'debit'

  // Modal States for Record New Transaction
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: "", amount: "", purpose: "", referenceId: "", type: "debit" });
  const [submitting, setSubmitting] = useState(false);

  // Modal States for Edit Transaction
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: "", amount: "", purpose: "", referenceId: "", type: "debit", status: "success" });
  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wallet-transactions");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setTotals(data.totals);
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordFund = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.purpose) {
      alert("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/wallet-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Transaction recorded successfully!");
        setShowModal(false);
        setFormData({ userId: "", amount: "", purpose: "", referenceId: "", type: "debit" });
        fetchTransactions();
      } else {
        alert("❌ Error: " + (data.error || "Failed to record transaction"));
      }
    } catch (err) {
      console.error(err);
      alert("Error recording transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (txn) => {
    setEditFormData({
      id: txn._id,
      amount: txn.amount || "",
      purpose: txn.purpose || "",
      referenceId: txn.referenceId || "",
      type: txn.type || "debit",
      status: txn.status || "success"
    });
    setShowEditModal(true);
  };

  const handleUpdateTxn = async (e) => {
    e.preventDefault();
    if (!editFormData.amount || !editFormData.purpose) {
      alert("Please fill all required fields");
      return;
    }
    setEditing(true);
    try {
      const res = await fetch("/api/admin/wallet-transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Transaction updated successfully!");
        setShowEditModal(false);
        fetchTransactions();
      } else {
        alert("❌ Error: " + (data.error || "Failed to update transaction"));
      }
    } catch (err) {
      console.error(err);
      alert("Error updating transaction");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTxn = async (id) => {
    if (!confirm("Are you sure you want to delete this wallet transaction? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/wallet-transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Transaction deleted successfully!");
        fetchTransactions();
      } else {
        alert("❌ Error: " + (data.error || "Failed to delete transaction"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = 
      txn.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || txn.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    if (status === "success") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 size={12} /> Success</span>;
    }
    if (status === "pending") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock size={12} /> Pending</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><XCircle size={12} /> Failed</span>;
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wallet className="text-indigo-600" size={32} />
            Digital Wallet Ledger
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Monitor, Edit & Manage all wallet transactions across the entire platform.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
        >
          <ArrowDownRight size={18} />
          Record Outgoing Fund
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Inflow (Added)</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{totals.totalCredit?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Outflow (Spent)</h3>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{totals.totalDebit?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet size={80} />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Total Transactions</h3>
            <div className="text-4xl font-black">{transactions.length}</div>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search user, email, purpose, reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex bg-slate-200/70 p-1 rounded-xl shrink-0 w-full md:w-auto">
            {['all', 'credit', 'debit'].map(t => (
              <button 
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filterType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                <th className="p-5 font-bold border-b border-slate-100">Date</th>
                <th className="p-5 font-bold border-b border-slate-100">User / Role</th>
                <th className="p-5 font-bold border-b border-slate-100">Type / Amount</th>
                <th className="p-5 font-bold border-b border-slate-100">Purpose</th>
                <th className="p-5 font-bold border-b border-slate-100">Reference</th>
                <th className="p-5 font-bold border-b border-slate-100">Status</th>
                <th className="p-5 font-bold border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400 font-medium">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 align-middle">
                      <div className="font-bold text-slate-700">{new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs text-slate-400">{new Date(txn.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-5 align-middle">
                      <div className="font-bold text-slate-900">{txn.user?.name}</div>
                      <div className="text-xs text-slate-500 flex gap-2 items-center">
                        {txn.user?.email} 
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{txn.user?.type}</span>
                      </div>
                    </td>
                    <td className="p-5 align-middle">
                      <div className={`font-black flex items-center gap-1.5 ${txn.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{txn.type}</div>
                    </td>
                    <td className="p-5 align-middle">
                      <span className="font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg text-sm">{txn.purpose}</span>
                    </td>
                    <td className="p-5 align-middle">
                      <div className="text-sm font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block">
                        {txn.referenceId || <span className="text-slate-300">N/A</span>}
                      </div>
                    </td>
                    <td className="p-5 align-middle">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="p-5 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(txn)}
                          className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                          title="Edit Transaction"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTxn(txn._id)}
                          disabled={deletingId === txn._id}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                          title="Delete Transaction"
                        >
                          {deletingId === txn._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Outgoing Fund Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Record Wallet Transaction</h3>
                <p className="text-sm text-slate-500 font-medium">Record a debit outflow or add credit funds to a user wallet</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRecordFund} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Transaction Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm font-semibold text-slate-800"
                >
                  <option value="debit">Outflow (Debit / Payout / Deduct)</option>
                  <option value="credit">Inflow (Credit / Add Funds / Refund)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Reference ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. TXN123456"
                    value={formData.referenceId}
                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Purpose / Payout Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refund, Service Payout, Referral bonus"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-3 rounded-2xl text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50 ${
                    formData.type === "credit" 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                  }`}
                >
                  {submitting ? "Processing..." : formData.type === "credit" ? "Record Inflow" : "Record Outflow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="text-indigo-600" size={20} /> Edit Wallet Transaction
                </h3>
                <p className="text-sm text-slate-500 font-medium">Update amount, purpose, or reference ID</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateTxn} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Transaction Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-800"
                  >
                    <option value="debit">Outflow (Debit)</option>
                    <option value="credit">Inflow (Credit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-800"
                  >
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Reference ID</label>
                  <input
                    type="text"
                    value={editFormData.referenceId}
                    onChange={(e) => setEditFormData({ ...editFormData, referenceId: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Purpose / Reason</label>
                <input
                  type="text"
                  required
                  value={editFormData.purpose}
                  onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-6 py-3 rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {editing ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
