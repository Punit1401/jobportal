"use client";
import { useEffect, useState } from "react";

export default function AdminDropdownManager() {
  const [dropdowns, setDropdowns] = useState([]);
  const [type, setType] = useState("profession");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);

  // નવી ફિલ્ડ્સ: profession_recruiter અહીં એડ કરી છે
  const types = [
    // --- Candidate Fields ---
    { id: "profession", label: "Profession (Candidate)" }, // કેન્ડિડેટ માટે
    { id: "position", label: "Desired Position (Candidate)" },
    { id: "reference", label: "Reference (Candidate)" },
    { id: "jobIndustry", label: "Job Industry (Candidate)" },
    { id: "presentEmploymentStatus", label: "Employment Status (Candidate)" },
    { id: "jobDepartment", label: "Job Department (Candidate)" },

    // --- Recruiter / Company Profile Fields ---
    { id: "profession_recruiter", label: "🏢 Company Profession (Recruiter)" }, // ✅ નવું ફિલ્ડ રિક્રુટર માટે
    { id: "industry", label: "🏢 Company Industry (Recruiter)" },
    { id: "department", label: "🏢 Company Department (Recruiter)" },
    { id: "size", label: "🏢 Company Size (Recruiter)" },
    { id: "designation", label: "🏢 Designation (Recruiter Profile)" },

    // --- Job Post Dynamic Fields (તમારા ફોર્મ માટે) ---
    { id: "jobCategory", label: "💼 Job Category (Post Job)" },
    { id: "experienceLevel", label: "⏳ Experience Level (Post Job)" },
    { id: "jobProfession", label: "💼 Job Profession (Post Job)" },
  ];

  const fetchDropdowns = async () => {
    try {
      const res = await fetch("/api/dropdowns");
      const data = await res.json();
      if (Array.isArray(data)) setDropdowns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const handleAdd = async () => {
    if (!value.trim()) return alert("Enter value");
    try {
      const res = await fetch("/api/dropdowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: value.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDropdowns((prev) => [...prev, data]);
        setValue("");
      } else {
        alert(data.error || "Error adding value");
      }
    } catch (e) {
      alert("Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this value?")) return;
    try {
      const res = await fetch(`/api/dropdowns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDropdowns((prev) => prev.filter((d) => d._id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Delete failed");
      }
    } catch (e) {
      alert("Error deleting");
    }
  };

  const filtered = dropdowns.filter((d) => d.type === type);

  if (loading) return <p className="p-8 text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Manage All Dropdowns</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Select Category</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Value Name</label>
          <input
            type="text"
            placeholder="Enter value..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Add Value
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-5 py-4 border-b flex justify-between items-center">
          <span className="font-bold text-slate-600 text-sm">
            Category: <span className="text-indigo-600">{types.find(t => t.id === type)?.label}</span>
          </span>
          <span className="text-[10px] bg-indigo-50 px-3 py-1 rounded-full font-black text-indigo-600 uppercase tracking-wider">
            {filtered.length} Items
          </span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="p-5">Value</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 text-slate-700 font-bold text-sm">{d.value}</td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="text-red-500 hover:text-red-700 font-black text-[11px] uppercase tracking-tighter"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-12 text-center text-slate-400 font-medium" colSpan="2">
                    No values found. Start adding some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}