"use client";
import React, { useState, useEffect } from "react";
import { Flag, Trash2, CheckCircle, Search, RefreshCw, AlertTriangle } from "lucide-react";

export default function NegativeListAdmin() {
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterModule, setFilterModule] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFlaggedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/negative-list");
      const result = await res.json();
      if (result.success) {
        setFlaggedItems(result.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlaggedItems();
  }, []);

  const handleDelete = async (id, collectionType) => {
    if (!confirm("Are you sure you want to permanently delete this flagged item?")) return;
    try {
      const res = await fetch(`/api/admin/negative-list?id=${id}&type=${collectionType || ""}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setFlaggedItems((prev) => prev.filter((item) => item._id !== id));
        setSelectedIds((prev) => prev.filter((x) => x !== id));
      } else {
        alert(result.error || "Failed to delete");
      }
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const handleRestore = async (id, collectionType) => {
    if (!confirm("Restore this item back to active / live status?")) return;
    try {
      const res = await fetch(`/api/admin/negative-list?id=${id}&type=${collectionType || ""}`, {
        method: "PUT",
      });
      const result = await res.json();
      if (result.success) {
        setFlaggedItems((prev) => prev.filter((item) => item._id !== id));
        setSelectedIds((prev) => prev.filter((x) => x !== id));
        alert("✅ Item restored to live status!");
      } else {
        alert(result.error || "Failed to restore");
      }
    } catch (err) {
      alert("Failed to restore item");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected flagged items?`)) return;
    try {
      const res = await fetch(`/api/admin/negative-list?id=${selectedIds.join(",")}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setFlaggedItems((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
        setSelectedIds([]);
        alert("✅ Selected flagged items deleted.");
      } else {
        alert(result.error || "Failed to bulk delete");
      }
    } catch (err) {
      alert("Failed to bulk delete");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Restore ${selectedIds.length} selected items back to live status?`)) return;
    try {
      const res = await fetch(`/api/admin/negative-list?id=${selectedIds.join(",")}`, {
        method: "PUT",
      });
      const result = await res.json();
      if (result.success) {
        setFlaggedItems((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
        setSelectedIds([]);
        alert("✅ Selected items restored.");
      } else {
        alert(result.error || "Failed to bulk restore");
      }
    } catch (err) {
      alert("Failed to bulk restore");
    }
  };

  const filteredItems = flaggedItems.filter((item) => {
    const matchesModule =
      filterModule === "All"
        ? true
        : filterModule === "Schemes"
        ? item.moduleType.includes("Scheme") || item.moduleType.includes("Resource")
        : filterModule === "Exams"
        ? item.moduleType.includes("Exam")
        : item.moduleType.includes("Job") || item.moduleType.includes("Service");

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(searchLower) ||
      item.source?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower);

    return matchesModule && matchesSearch;
  });

  const handleToggleSelectAll = () => {
    const filteredIds = filteredItems.map((item) => item._id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !filteredIds.includes(id)));
    } else {
      const newSelections = [...selectedIds];
      filteredIds.forEach((id) => {
        if (!newSelections.includes(id)) newSelections.push(id);
      });
      setSelectedIds(newSelections);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Flag className="h-7 w-7 text-red-600" /> Candidate Flagged / Negative Items
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All items reported or flagged by candidates appear in this table. Admin can permanently delete or restore them.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-xs font-bold text-red-800">{selectedIds.length} Selected</span>
              <button
                onClick={handleBulkRestore}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1 px-2.5 rounded transition-colors"
              >
                Restore
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-1 px-2.5 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          )}
          <button
            onClick={fetchFlaggedItems}
            disabled={loading}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-3.5 rounded-lg text-sm shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {[
            ["All", "All Flagged"],
            ["Schemes", "Govt Schemes & Resources"],
            ["Exams", "Govt Exams"],
            ["Jobs", "Jobs & Services"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterModule(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                filterModule === key
                  ? "bg-red-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search flagged items…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      {/* Dedicated Flagged Items Table */}
      {loading ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">Loading flagged items…</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <AlertTriangle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Flagged Items Found</h3>
          <p className="text-sm text-gray-500 mt-1">There are currently no items flagged by candidates in this category.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item._id))}
                      onChange={handleToggleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Item Title & Info</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Category / Source</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="bg-red-50/40 hover:bg-red-50/70 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleToggleSelect(item._id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-semibold text-gray-900 max-w-md">
                      <div>{item.title}</div>
                      {item.link && item.link !== "#" && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 font-normal hover:underline truncate block max-w-xs mt-0.5"
                        >
                          {item.link}
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                        {item.moduleType}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      <div className="font-medium text-gray-800">{item.category || "General"}</div>
                      <div className="text-gray-400 mt-0.5">{item.source}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                        <Flag className="h-3 w-3" /> FLAGGED
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleRestore(item._id, item.collectionType)}
                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors inline-flex items-center gap-1"
                        title="Restore to Active/Live"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.collectionType)}
                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                        title="Permanently Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
