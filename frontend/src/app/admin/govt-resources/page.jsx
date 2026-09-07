"use client";
import React, { useState, useEffect } from "react";

export default function GovtResourcesAdmin() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/govt-resources");
      const result = await res.json();
      if (result.success) {
        setResources(result.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Clear selections when filter changes to avoid hidden selections
  useEffect(() => {
    setSelectedIds([]);
  }, [filter]);

  const handleAutoFetch = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/govt-resources/auto-fetch", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        fetchResources(); // Refresh list
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("Failed to auto-fetch.");
    }
    setFetching(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/govt-resources?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setResources(resources.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`/api/admin/govt-resources?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setResources(resources.filter((r) => r._id !== id));
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const isNegativeTab = filter.toLowerCase().includes("negative");
  const filteredResources = isNegativeTab
    ? resources.filter(r => r.status === "negative")
    : filter === "All"
      ? resources.filter(r => r.status !== "negative")
      : resources.filter(r => r.category === filter && r.status !== "negative");

  // Toggle selection for a single item
  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Toggle selection for all currently filtered items
  const handleToggleSelectAll = () => {
    const filteredIds = filteredResources.map((r) => r._id);
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

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to approve ${selectedIds.length} selected resources?`)) return;
    try {
      const res = await fetch(`/api/admin/govt-resources?id=${selectedIds.join(",")}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "live" }),
      });
      const result = await res.json();
      if (result.success) {
        setResources(resources.map((r) => selectedIds.includes(r._id) ? { ...r, status: "live" } : r));
        setSelectedIds([]);
      } else {
        alert(result.error || "Failed to bulk approve");
      }
    } catch (err) {
      alert("Failed to bulk approve");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected resources?`)) return;
    try {
      const res = await fetch(`/api/admin/govt-resources?id=${selectedIds.join(",")}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setResources(resources.filter((r) => !selectedIds.includes(r._id)));
        setSelectedIds([]);
      } else {
        alert(result.error || "Failed to bulk delete");
      }
    } catch (err) {
      alert("Failed to bulk delete");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Govt Schemes & Jobs (Admin)</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-sm font-semibold text-blue-800">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-1 px-3 rounded shadow transition-colors"
              >
                Approve
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-1 px-3 rounded shadow transition-colors"
              >
                Delete
              </button>
            </div>
          )}
          <button
            onClick={handleAutoFetch}
            disabled={fetching}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50 ml-auto sm:ml-0"
          >
            {fetching ? "Fetching New Data..." : "🔄 Auto-Fetch New Data"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["All", "Govt Job", "Scheme", "Internship", "Training", "Apprenticeship", "🚩 Negative List"].map(cat => {
          const isNeg = cat.toLowerCase().includes("negative");
          const count = isNeg ? resources.filter(r => r.status === "negative").length : 0;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === cat 
                  ? isNeg ? "bg-red-600 text-white shadow-md font-bold" : "bg-gray-800 text-white" 
                  : isNeg ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cat}{count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p>Loading resources...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={filteredResources.length > 0 && filteredResources.every(r => selectedIds.includes(r._id))}
                    onChange={handleToggleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No resources found in this category.</td>
                </tr>
              ) : (
                filteredResources.map((item) => (
                  <tr key={item._id} className={item.status === "negative" ? "bg-red-50/60" : item.status === "pending" ? "bg-yellow-50/50" : ""}>
                    <td className="px-6 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleToggleSelect(item._id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.source === "community" ? "bg-orange-100 text-orange-800" : item.source === "ai-fetch" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                        {item.source === "community" ? "Manual" : item.source === "ai-fetch" ? "AI" : "Official"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-500 max-w-xs truncate">
                      <a href={item.applyLink} target="_blank" rel="noopener noreferrer">View Link</a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'live' ? 'bg-green-100 text-green-800' : item.status === 'negative' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {item.status === "negative" ? (
                        <>
                          <button onClick={() => handleStatusChange(item._id, "live")} className="text-green-600 hover:text-green-900 font-bold">
                            Approve
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 font-bold">
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          {item.status === "pending" && (
                            <button onClick={() => handleStatusChange(item._id, "live")} className="text-green-600 hover:text-green-900 font-bold">
                              Approve
                            </button>
                          )}
                          {item.status === "live" && (
                            <button onClick={() => handleStatusChange(item._id, "pending")} className="text-yellow-600 hover:text-yellow-900 font-bold">
                              Unpublish
                            </button>
                          )}
                          <button onClick={() => handleStatusChange(item._id, "negative")} className="text-amber-600 hover:text-amber-900 font-bold" title="Flag & Move to Negative List">
                            🚩 Flag
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 font-bold">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
