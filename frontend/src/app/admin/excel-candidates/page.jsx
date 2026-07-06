"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelCandidatesUpload() {
  const [excelPreview, setExcelPreview] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [dbCandidates, setDbCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Mail state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  // Filters
  const [professionFilter, setProfessionFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  // Fetch DB candidates
  const fetchDbCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/excel-candidates/list");
      const data = await res.json();
      setDbCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbCandidates();
  }, []);

  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelPreview(json);
    };

    reader.readAsArrayBuffer(file);
  };

  const uploadExcelToServer = async () => {
    if (!selectedFile || excelPreview.length === 0) {
      alert("Please upload Excel and generate preview first!");
      return;
    }

    try {
      setUploadingExcel(true);
      const formData = new FormData();
      formData.append("mode", "save");
      formData.append("rows", JSON.stringify(excelPreview));

      const res = await fetch("/api/excel-candidates/manage", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      alert(
        `Saved Successfully!\n🟢 Inserted: ${data.insertedCount}\n🟡 Updated: ${data.updatedCount}\n⚪ Skipped: ${data.skippedCount}`
      );

      fetchDbCandidates();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploadingExcel(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = (checked) => {
    if (checked) setSelectedIds(filteredCandidates.map((c) => c._id));
    else setSelectedIds([]);
  };
  // Select All — but ignore unsubscribed candidates
  const handleSelectAll = () => {
    const selectable = candidates
      .filter(c => c.mailStop !== true)  // ❗ unsubscribed ne skip karo
      .map(c => c._id);

    setSelectedIds(selectable);
  };


  // Filters logic
  const filteredCandidates = dbCandidates.filter(
    (c) =>
      (professionFilter === "All" || c.profession === professionFilter) &&
      (positionFilter === "All" || c.position === positionFilter) &&
      (roleFilter === "All" || c.role === roleFilter) &&
      (cityFilter === "All" || c.city === cityFilter)
  );

  const getUniqueValues = (key) => [
    "All",
    ...new Set(dbCandidates.map((c) => c[key]).filter(Boolean)),
  ];

  // -------------------------------
  // DELETE CANDIDATE
  // -------------------------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const res = await fetch(`/api/excel-candidates/delete`, {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      fetchDbCandidates();
    } catch (err) {
      alert(err.message);
    }
  };

  // -------------------------------
  // UNSUBSCRIBE CANDIDATE
  // -------------------------------
  const handleToggleSubscribe = async (id, unsubscribed) => {
    try {
      const action = unsubscribed ? "subscribe" : "unsubscribe";
  
      const res = await fetch(`/api/excel-candidates/unsubscribe`, {
        method: "POST",
        body: JSON.stringify({ id, action }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
  
      alert(data.message);
  
      // 🔥 IMMEDIATE UI UPDATE (main fix)
      setDbCandidates((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, unsubscribed: !unsubscribed } : c
        )
      );
  
    } catch (err) {
      alert(err.message);
    }
  };
  
  

  const handleSendMail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert("Please enter both subject and message!");
      return;
    }
  
    if (selectedIds.length === 0) {
      alert("Please select at least one candidate!");
      return;
    }
  
    // 🔥 FILTER unsubscribed Excel Candidates
    const emailsToSend = selectedIds
      .map((id) => dbCandidates.find((c) => c._id === id))
      .filter(Boolean)
      .filter((c) => !c.unsubscribed)        // <-- 🚫 block unsubscribed
      .map((c) => c.email);
  
    if (emailsToSend.length === 0) {
      alert("Selected users are unsubscribed!");
      return;
    }
  
    if (!confirm(`Send email to ${emailsToSend.length} candidate(s)?`))
      return;
  
    try {
      setSendingMail(true);
  
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailBody,
          emails: emailsToSend,
          type: "excel-candidates",
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
  
      alert(data.message || "Email sent!");
  
      // 🔥 Update UI mailCount instantly
      setDbCandidates((prev) =>
        prev.map((c) =>
          emailsToSend.includes(c.email)
            ? { ...c, mailCount: (c.mailCount || 0) + 1 }
            : c
        )
      );
  
      setEmailSubject("");
      setEmailBody("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingMail(false);
    }
  };
  
  

  if (loading) return <p>Loading candidates from database...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload Candidates Excel</h1>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleUploadExcel}
        className="border p-2 rounded w-full mb-3"
      />

      {excelPreview.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Excel Preview</h2>
          <div className="overflow-x-auto border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {Object.keys(excelPreview[0]).map((key) => (
                    <th key={key} className="border px-2 py-1">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelPreview.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="border px-2 py-1">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={uploadExcelToServer}
            disabled={uploadingExcel}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {uploadingExcel ? "Saving..." : "Save to Database"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 mb-4">
        <Filter
          label="Profession"
          value={professionFilter}
          setValue={setProfessionFilter}
          options={getUniqueValues("profession")}
        />
        <Filter
          label="Position"
          value={positionFilter}
          setValue={setPositionFilter}
          options={getUniqueValues("position")}
        />
        <Filter
          label="Role"
          value={roleFilter}
          setValue={setRoleFilter}
          options={getUniqueValues("role")}
        />
        <Filter
          label="City"
          value={cityFilter}
          setValue={setCityFilter}
          options={getUniqueValues("city")}
        />
      </div>

      {/* DB Table */}
      <div className="overflow-x-auto border">
        <table className="w-full text-sm">
        <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredCandidates.length > 0 &&
                    selectedIds.length === filteredCandidates.map((c) => c._id).length
                  }
                  onChange={(e) => selectAll(e.target.checked)}
                />
              </th>
                
              <th className="border px-2 py-1">Mail Sent</th>
              <th className="border px-2 py-1">Actions</th>
                
              {dbCandidates.length > 0 &&
              Object.keys(dbCandidates[0] || {})
                .filter((k) => k !== "__v" && k !== "_id")
                .map((key) => (
                  <th key={key} className="border px-2 py-1">
                    {key}
                  </th>
                ))}

            </tr>
          </thead>


          <tbody>
            {filteredCandidates.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                {/* SELECT */}
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c._id)}
                    onChange={() => toggleSelect(c._id)}
                  />
                </td>

                {/* MAIL COUNT */}
                <td className="border px-2 py-1 text-center">
                  {c.mailCount || 0}
                </td>

                {/* ACTIONS */}
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                  <button
                  onClick={() =>
                    handleToggleSubscribe(c._id, c.unsubscribed)
                  }
                  className={`${
                    c.unsubscribed ? "bg-green-600" : "bg-orange-500"
                  } text-white px-2 py-1 rounded`}
                  >
                  {c.unsubscribed ? "Subscribe" : "Unsubscribe"}
                </button>

                </td>

                {/* DATA */}
                {Object.entries(c)
                  .filter(([k]) => k !== "__v" && k !== "_id")
                  .map(([key, value]) => (
                    <td key={key} className="border px-2 py-1">
                      {String(value)}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mail Section */}
      <div className="border-t pt-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">
          Send Email to Selected Candidates
        </h2>

        <input
          type="text"
          placeholder="Email Subject"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="border rounded w-full p-2 mb-3"
        />

        <textarea
          rows="4"
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          placeholder="Write your email message..."
          className="border rounded w-full p-2 mb-3"
        ></textarea>

        <button
          onClick={handleSendMail}
          disabled={sendingMail}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {sendingMail
            ? "Sending..."
            : `Send Email (${selectedIds.length})`}
        </button>
      </div>
    </div>
  );
}

function Filter({ label, value, setValue, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}:</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border p-1 rounded w-full"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
