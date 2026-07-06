"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Trash2, Plus, Save, ArrowLeft, Code, Eye } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [newTemp, setNewTemp] = useState({ title: "", subject: "", content: "" });
  const [isCodeView, setIsCodeView] = useState(false); // Code view toggle mate

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/template");
    const data = await res.json();
    setTemplates(data);
  };

  const handleSave = async () => {
    if (!newTemp.title || !newTemp.content) return alert("Title and Content are required!");
    await fetch("/api/admin/template", { 
      method: "POST", 
      body: JSON.stringify(newTemp),
      headers: { "Content-Type": "application/json" }
    });
    setNewTemp({ title: "", subject: "", content: "" });
    fetchTemplates();
    alert("Template Saved!");
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Delete template?")) return;
    await fetch(`/api/admin/template?id=${id}`, { method: "DELETE" });
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
                <Plus size={20} className="text-indigo-600"/> Create Template
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
                  className="w-full h-350px p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Paste your HTML code here..."
                  value={newTemp.content}
                  onChange={e => setNewTemp({...newTemp, content: e.target.value})}
                />
              ) : (
                <div className="h-350px mb-12 rounded-2xl overflow-hidden border-2 border-slate-100">
                  <ReactQuill 
                    theme="snow" 
                    className="h-full bg-slate-50" 
                    value={newTemp.content} 
                    onChange={val => setNewTemp({...newTemp, content: val})} 
                  />
                </div>
              )}

              <button 
                onClick={handleSave}
                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-200"
              >
                <Save size={18}/> Save Template
              </button>
            </div>
          </div>

          {/* Section 2: Saved Templates List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-black uppercase italic text-slate-400 text-xs tracking-widest ml-4">Saved Library</h2>
            <div className="space-y-3 max-h-600px overflow-y-auto pr-2">
              {templates.map(t => (
                <div key={t._id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center hover:shadow-md transition-all group">
                  <div className="overflow-hidden">
                    <p className="font-black text-slate-800 text-xs uppercase italic truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-1">{t.subject}</p>
                  </div>
                  <button 
                    onClick={() => deleteTemplate(t._id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18}/>
                  </button>
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

      <style jsx global>{`
        .ql-container { border: none !important; height: 300px; font-family: 'Inter', sans-serif; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #f1f5f9 !important; background: #fff; }
      `}</style>
    </div>
  );
}