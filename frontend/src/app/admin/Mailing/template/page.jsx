"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Trash2, Plus, Save, ArrowLeft, Code, Eye, Edit, X } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [newTemp, setNewTemp] = useState({ title: "", subject: "", content: "" });
  const [isCodeView, setIsCodeView] = useState(false); // Code view toggle mate
  const [editingId, setEditingId] = useState(null);
  const [previewTemp, setPreviewTemp] = useState(null); // Template to view/preview

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/template");
    const data = await res.json();
    setTemplates(data);
  };

  const handleSave = async () => {
    if (!newTemp.title || !newTemp.content) return alert("Title and Content are required!");
    try {
      const url = "/api/admin/template";
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, ...newTemp } : newTemp;

      const res = await fetch(url, { 
        method, 
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setNewTemp({ title: "", subject: "", content: "" });
        setEditingId(null);
        fetchTemplates();
        alert(editingId ? "✅ Template Updated successfully!" : "✅ Template Saved successfully!");
      } else {
        const errData = await res.json();
        alert("❌ Failed to save template: " + (errData.error || "Server error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving template");
    }
  };

  const handleStartEdit = (temp) => {
    setEditingId(temp._id);
    setNewTemp({
      title: temp.title || "",
      subject: temp.subject || "",
      content: temp.content || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewTemp({ title: "", subject: "", content: "" });
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Delete template?")) return;
    await fetch(`/api/admin/template?id=${id}`, { method: "DELETE" });
    if (editingId === id) {
      handleCancelEdit();
    }
    fetchTemplates();
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <a href="/admin/Mailing" className="flex items-center gap-2 text-slate-400 font-bold mb-6 hover:text-indigo-600 transition-all">
          <ArrowLeft size={16}/> BACK TO MAILER
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section 1: Create/Edit Template */}
          <div className="lg:col-span-7 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase italic flex items-center gap-2 text-slate-800">
                <Plus size={20} className="text-indigo-600"/> {editingId ? "Edit Template" : "Create Template"}
              </h2>
              {/* Toggle Button for Code View */}
              <button 
                onClick={() => setIsCodeView(!isCodeView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isCodeView ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {isCodeView ? <><Eye size={14}/> Visual View</> : <><Code size={14}/> Code View (HTML)</>}
              </button>
            </div>

            <div className="space-y-3">
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500"
                placeholder="Template Title (Internal Name)"
                value={newTemp.title}
                onChange={e => setNewTemp({...newTemp, title: e.target.value})}
              />
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500"
                placeholder="Email Subject Line"
                value={newTemp.subject}
                onChange={e => setNewTemp({...newTemp, subject: e.target.value})}
              />

              {isCodeView ? (
                <textarea 
                  className="w-full h-[350px] p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Paste your HTML code here..."
                  value={newTemp.content}
                  onChange={e => setNewTemp({...newTemp, content: e.target.value})}
                />
              ) : (
                <div className="h-[350px] mb-12 rounded-2xl overflow-hidden border-2 border-slate-100">
                  <ReactQuill 
                    theme="snow" 
                    className="h-full bg-slate-50" 
                    value={newTemp.content} 
                    onChange={val => setNewTemp({...newTemp, content: val})} 
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                {editingId && (
                  <button 
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-100 text-slate-600 p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  className="flex-2 bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Save size={18}/> {editingId ? "Update Template" : "Save Template"}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Saved Templates List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-black uppercase italic text-slate-400 text-xs tracking-widest ml-4">Saved Library</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {templates.map(t => (
                <div key={t._id} className={`bg-white p-5 rounded-2xl border flex justify-between items-center hover:shadow-md transition-all group ${editingId === t._id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-100'}`}>
                  <div className="overflow-hidden flex-1 mr-2">
                    <p className="font-black text-slate-800 text-xs uppercase italic truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-1">{t.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => setPreviewTemp(t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Preview Template"
                    >
                      <Eye size={16}/>
                    </button>
                    <button 
                      onClick={() => handleStartEdit(t)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Edit Template"
                    >
                      <Edit size={16}/>
                    </button>
                    <button 
                      onClick={() => deleteTemplate(t._id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Template"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <p className="text-slate-300 font-bold text-xs uppercase italic">No templates saved yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HTML Preview Modal */}
      {previewTemp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-900">{previewTemp.title}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Subject: {previewTemp.subject}</p>
              </div>
              <button
                onClick={() => setPreviewTemp(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[60vh] overflow-y-auto bg-white">
              <div 
                className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: previewTemp.content }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => {
                  handleStartEdit(previewTemp);
                  setPreviewTemp(null);
                }}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <Edit size={14}/> Load for Editing
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ql-container { border: none !important; height: 300px; font-family: 'Inter', sans-serif; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #f1f5f9 !important; background: #fff; }
      `}</style>
    </div>
  );
}