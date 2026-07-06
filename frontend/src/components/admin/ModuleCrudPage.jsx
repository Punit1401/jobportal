"use client";

import { useEffect, useState } from "react";

const DEFAULT_FORM = {
  title: "",
  description: "",
  status: "Active",
  priority: "Medium",
  meta: {},
};

export default function ModuleCrudPage({
  moduleKey,
  title,
  subtitle,
  fields = [],
  columns = [],
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const endpoint = `/api/admin/modules/${moduleKey}`;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [moduleKey]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId("");
  };

  const setMetaField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      meta: { ...(prev.meta || {}), [key]: value },
    }));
  };

  const getCellValue = (item, key, source = "root") => {
    if (source === "meta") return item?.meta?.[key] ?? "-";
    return item?.[key] ?? "-";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { ...form, id: editingId } : form;

      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      resetForm();
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      status: item.status || "Active",
      priority: item.priority || "Medium",
      meta: item.meta || {},
    });
  };

  const onDelete = async (id) => {
    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    const rowValues = [
      item.title,
      item.description,
      item.status,
      item.priority,
      ...columns.map((col) => getCellValue(item, col.key, col.source)),
    ]
      .join(" ")
      .toLowerCase();
    return rowValues.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportRows = filteredItems.map((item) => ({
    Title: item.title || "",
    Status: item.status || "",
    Priority: item.priority || "",
    Description: item.description || "",
    ...Object.fromEntries(columns.map((col) => [col.label, getCellValue(item, col.key, col.source)])),
  }));

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (exportRows.length === 0) return;
    const headers = Object.keys(exportRows[0]);
    const csv = [
      headers.join(","),
      ...exportRows.map((row) =>
        headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    downloadFile(csv, `${moduleKey}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExportExcel = () => {
    if (exportRows.length === 0) return;
    const headers = Object.keys(exportRows[0]);
    const tableRows = exportRows
      .map((row) => `<tr>${headers.map((h) => `<td>${String(row[h] ?? "")}</td>`).join("")}</tr>`)
      .join("");
    const html = `
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    downloadFile(html, `${moduleKey}.xls`, "application/vnd.ms-excel");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-2 gap-4">
        <input
          required
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Title"
          className="border rounded-xl px-4 py-2"
        />
        <select
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          className="border rounded-xl px-4 py-2"
        >
          <option>Active</option>
          <option>Pending</option>
          <option>Archived</option>
        </select>
        <select
          value={form.priority}
          onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
          className="border rounded-xl px-4 py-2"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Description"
          className="border rounded-xl px-4 py-2"
        />
        {fields.map((field) => (
          field.type === "select" ? (
            <select
              key={field.key}
              value={form.meta?.[field.key] || ""}
              onChange={(e) => setMetaField(field.key, e.target.value)}
              className="border rounded-xl px-4 py-2"
              required={field.required}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              key={field.key}
              value={form.meta?.[field.key] || ""}
              onChange={(e) => setMetaField(field.key, e.target.value)}
              placeholder={field.placeholder || field.label}
              className="border rounded-xl px-4 py-2"
              required={field.required}
              type={field.type || "text"}
            />
          )
        ))}
        <div className="md:col-span-2 flex gap-3">
          <button disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-xl">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search records..."
            className="border rounded-xl px-4 py-2 w-full md:max-w-md"
          />
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm">
              Export CSV
            </button>
            <button onClick={handleExportExcel} className="px-3 py-2 bg-green-700 text-white rounded-xl text-sm">
              Export Excel
            </button>
          </div>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-500">No records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2 font-semibold">{item.title}</td>
                    <td>{item.status}</td>
                    <td>{item.priority}</td>
                    {columns.map((col) => (
                      <td key={`${item._id}-${col.key}`}>{getCellValue(item, col.key, col.source)}</td>
                    ))}
                    <td className="space-x-2">
                      <button onClick={() => onEdit(item)} className="px-2 py-1 bg-blue-100 rounded">Edit</button>
                      <button onClick={() => onDelete(item._id)} className="px-2 py-1 bg-red-100 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 py-1">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
