"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function MailManager() {
  const [fileEmails, setFileEmails] = useState([]);
  const [dbEmails, setDbEmails] = useState([]);
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------
  // Load emails from localStorage + DB on mount
  // ---------------------------
  useEffect(() => {
    const saved = localStorage.getItem("fileEmails");
    if (saved) setFileEmails(JSON.parse(saved));

    fetchDb();
  }, []);

  // ---------------------------
  // Persist fileEmails in localStorage
  // ---------------------------
  useEffect(() => {
    localStorage.setItem("fileEmails", JSON.stringify(fileEmails));
  }, [fileEmails]);

  // ---------------------------
  // Fetch DB emails
  // ---------------------------
  const fetchDb = async () => {
    try {
      const res = await fetch("/api/emailList");
      const json = await res.json();
      setDbEmails(json.emailList || []);
    } catch (err) {
      console.error(err);
      setDbEmails([]);
    }
  };

  // ---------------------------
  // Parse Excel file
  // ---------------------------
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const parsed = rows
        .map((row, i) => {
          const normalized = {};
          Object.keys(row || {}).forEach((k) => {
            normalized[k.toString().toLowerCase().trim()] = row[k];
          });
          const email =
            normalized.email ||
            normalized["email id"] ||
            normalized.mail ||
            normalized["e-mail"] ||
            normalized["user email"] ||
            "";
          if (!email) return null;
          const name = normalized.name || normalized.fullname || email.split("@")[0];
          return { id: `file-${i}`, email: email.toString().trim().toLowerCase(), name };
        })
        .filter(Boolean);

      setFileEmails(parsed);
      setSelected([]);
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------------------------
  // Save parsed emails to DB
  // ---------------------------
  const saveToDb = async () => {
    if (fileEmails.length === 0) return alert("No parsed emails.");
    setLoading(true);
    try {
      const emails = fileEmails.map((f) => f.email);
      const res = await fetch("/api/emailList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setDbEmails(json.emailList || []);
      setFileEmails([]);
      alert("Saved to database");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Toggle select
  // ---------------------------
  const toggleSelect = (identifier) => {
    setSelected((prev) =>
      prev.includes(identifier) ? prev.filter((x) => x !== identifier) : [...prev, identifier]
    );
  };

  // Select all emails
  const handleSelectAll = () => {
    const all = [...fileEmails.map(f => f.email), ...dbEmails.map(d => d.email)];
    setSelected(all);
  };

  // ---------------------------
  // Filter emails for display
  // ---------------------------
  const filtered = [
    ...fileEmails.map(f => ({ ...f, source: "file" })),
    ...dbEmails.map(d => ({ ...d, source: "db" })),
  ].filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------------------
  // Send Emails
  // ---------------------------
  const handleSend = async () => {
    if (!subject || !message) return alert("Subject and message required.");

    const toSend = filtered.filter(u => selected.includes(u.email)).map(u => u.email);
    if (toSend.length === 0) return alert("Select at least one email.");

    setLoading(true);
    try {
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, emails: toSend }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");

      // ✅ Do NOT remove DB emails, only optional remove from fileEmails
      setFileEmails(prev => prev.filter(f => !toSend.includes(f.email)));
      setSelected([]);
      setSubject("");
      setMessage("");
      alert(`Sent ${json.sentTo} emails.`);
    } catch (err) {
      console.error(err);
      alert("Send failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mail Manager (Excel → Queue → Send)</h1>

      {/* Upload Excel */}
      <div className="mb-4 border p-4 rounded">
        <h2 className="font-semibold mb-2">Upload Excel</h2>
        <input type="file" accept=".xlsx,.csv" onChange={handleFile} />
        <div className="mt-3">
          <button
            onClick={saveToDb}
            disabled={fileEmails.length === 0 || loading}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Save parsed emails to DB ({fileEmails.length})
          </button>
        </div>
        {fileEmails.length > 0 && (
          <div className="mt-3 max-h-36 overflow-y-auto border p-2 rounded">
            {fileEmails.map(f => (
              <label key={f.id} className="block">
                <input type="checkbox" checked={selected.includes(f.email)} onChange={() => toggleSelect(f.email)} />
                <span className="ml-2">{f.name} ({f.email})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* DB Queue */}
      <div className="mb-4 border p-4 rounded">
        <h2 className="font-semibold mb-2">Database Email Queue</h2>
        <p className="text-sm text-gray-600 mb-2">Total saved: {dbEmails.length}</p>
        <div className="max-h-36 overflow-y-auto border p-2 rounded">
          {dbEmails.length === 0 ? <p className="text-gray-500">No saved emails</p> :
            dbEmails.map(d => (
              <label key={d._id} className="block">
                <input type="checkbox" checked={selected.includes(d.email)} onChange={() => toggleSelect(d.email)} />
                <span className="ml-2">{d.email}</span>
              </label>
            ))
          }
        </div>
      </div>

      {/* Compose & Send */}
      <div className="mb-4 border p-4 rounded">
        <h2 className="font-semibold mb-2">Compose & Send</h2>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="border w-full p-2 rounded mb-2" />
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} placeholder="Message" className="border w-full p-2 rounded mb-2" />
        <div className="flex gap-3 items-center mb-3">
          <button onClick={handleSelectAll} className="px-3 py-1 bg-gray-200 rounded">Select All</button>
          <button onClick={fetchDb} className="px-3 py-1 bg-gray-200 rounded">Refresh Queue</button>
          <input placeholder="Search email or name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border p-1 rounded ml-auto" />
        </div>
        <div className="mb-2 max-h-48 overflow-y-auto border p-2 rounded">
          {filtered.map(u => (
            <label key={`${u.source}-${u.email}`} className="block">
              <input type="checkbox" checked={selected.includes(u.email)} onChange={() => toggleSelect(u.email)} />
              <span className="ml-2">{u.name ? `${u.name} ` : ""}({u.email})</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Sending..." : "Send to selected"}
          </button>
        </div>
      </div>
    </div>
  );
}
