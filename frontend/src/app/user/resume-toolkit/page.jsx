"use client";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  FileText, Sparkles, UserSquare, BarChart3, 
  Upload, Download, RefreshCw, CheckCircle2, AlertCircle 
} from "lucide-react";

export default function ResumeToolkit() {
  const [tab, setTab] = useState("tailor");
  const { data: session } = useSession();
  
  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tailor/Cover States
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeTextPreview, setResumeTextPreview] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResult, setTailoredResult] = useState(null);
  const [coverTone, setCoverTone] = useState("formal");
  const [coverLength, setCoverLength] = useState("short");
  const [coverResult, setCoverResult] = useState(null);

  // Headshot States
  const [selfieFile, setSelfieFile] = useState(null);
  const [headshotResults, setHeadshotResults] = useState([]);
  const [selectedHeadshot, setSelectedHeadshot] = useState(null);

  // ATS States
  const [atsFile, setAtsFile] = useState(null);
  const [atsJobDesc, setAtsJobDesc] = useState("");
  const [atsResult, setAtsResult] = useState(null);

  const fileInputRef = useRef();
  const selfieInputRef = useRef();
  const atsInputRef = useRef();

  // ------------------ Helpers ------------------
  async function extractTextFromFile(file) {
    if (!file) return "";
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "txt") return await file.text();
    return `File "${file.name}" uploaded successfully. AI will analyze the content during processing.`;
  }

  function downloadText(filename, text) {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ------------------ Handlers ------------------
  async function handleTailorSubmit(e) {
    e.preventDefault();
    if (!resumeTextPreview && !resumeFile) return setError("Please provide a resume.");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeTextPreview,
          jobDescription,
          format: "onepage"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to tailor");
      setTailoredResult(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCoverSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      if (resumeFile) form.append("file", resumeFile);
      form.append("jobDescription", jobDescription);
      form.append("tone", coverTone);
      form.append("length", coverLength);
      const res = await fetch("/api/resume/cover-letter", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setCoverResult(data.coverText || data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAtsUpload = async () => {
    if (!atsFile) return setError("Please upload a file first.");
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", atsFile);
      form.append("jobDescription", atsJobDesc);
      const res = await fetch("/api/resume/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAtsResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-600" size={32} /> Resume Toolkit
          </h1>
          <p className="text-slate-500 font-medium">Smart AI tools to boost your career</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: "tailor", label: "Tailor Resume", icon: FileText },
            { id: "cover", label: "Cover Letter", icon: Sparkles },
            { id: "headshot", label: "AI Headshots", icon: UserSquare },
            { id: "ats", label: "ATS Score", icon: BarChart3 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                tab === t.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              {tab !== "headshot" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Upload Resume</label>
                    <input
                      type="file"
                      ref={tab === 'ats' ? atsInputRef : fileInputRef}
                      className="w-full mt-2 p-3 border-2 border-dashed rounded-2xl text-sm"
                      onChange={async (e) => {
                        const f = e.target.files[0];
                        if(tab === 'ats') setAtsFile(f); else setResumeFile(f);
                        const t = await extractTextFromFile(f);
                        setResumeTextPreview(t);
                      }}
                    />
                  </div>
                  
                  {tab !== 'ats' && (
                    <textarea
                      placeholder="Or paste resume text..."
                      value={resumeTextPreview}
                      onChange={(e) => setResumeTextPreview(e.target.value)}
                      className="w-full p-4 bg-slate-50 border rounded-2xl h-32 text-sm"
                    />
                  )}

                  <textarea
                    placeholder="Job Description..."
                    value={tab === 'ats' ? atsJobDesc : jobDescription}
                    onChange={(e) => tab === 'ats' ? setAtsJobDesc(e.target.value) : setJobDescription(e.target.value)}
                    className="w-full p-4 bg-slate-50 border rounded-2xl h-32 text-sm"
                  />

                  {tab === 'cover' && (
                    <div className="grid grid-cols-2 gap-4">
                      <select value={coverTone} onChange={(e) => setCoverTone(e.target.value)} className="p-3 bg-slate-50 border rounded-xl text-sm">
                        <option value="formal">Formal</option>
                        <option value="friendly">Friendly</option>
                      </select>
                      <select value={coverLength} onChange={(e) => setCoverLength(e.target.value)} className="p-3 bg-slate-50 border rounded-xl text-sm">
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={tab === 'tailor' ? handleTailorSubmit : tab === 'cover' ? handleCoverSubmit : handleAtsUpload}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
                    {loading ? "Processing..." : "Generate Result"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <input type="file" ref={selfieInputRef} onChange={(e) => setSelfieFile(e.target.files[0])} className="hidden" id="selfie" />
                  <label htmlFor="selfie" className="block p-10 border-2 border-dashed rounded-[40px] cursor-pointer hover:bg-slate-50">
                    {selfieFile ? <p className="text-indigo-600 font-bold">{selfieFile.name}</p> : <p className="text-slate-400">Click to upload selfie</p>}
                  </label>
                  <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">Generate Headshot</button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          {/* Right Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm min-h-[500px] p-6">
              <h3 className="font-black text-slate-900 mb-4 flex items-center justify-between">
                <span>AI Output</span>
                {(tailoredResult || coverResult) && (
                  <button onClick={() => downloadText("result.txt", tailoredResult || coverResult)} className="text-indigo-600">
                    <Download size={20}/>
                  </button>
                )}
              </h3>
    
          <div className="bg-slate-50 rounded-2xl p-6 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <RefreshCw className="animate-spin text-indigo-600 mb-4" size={32} />
                <p className="text-slate-500 font-bold animate-pulse">Analyzing your profile...</p>
              </div>
            ) : tab === 'ats' && atsResult ? (
              /* --- ATS Result Professional View --- */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Score Circle/Bar */}
          <div className="text-center p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Overall ATS Score</p>
            <div className="flex items-center justify-center gap-4">
              <span className={`text-6xl font-black ${atsResult.atsScore > 70 ? 'text-emerald-500' : atsResult.atsScore > 40 ? 'text-orange-500' : 'text-rose-500'}`}>
                {atsResult.atsScore}%
              </span>
            </div>
            {/* Simple Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${atsResult.atsScore > 70 ? 'bg-emerald-500' : atsResult.atsScore > 40 ? 'bg-orange-500' : 'bg-rose-500'}`}
                style={{ width: `${atsResult.atsScore}%` }}
              />
            </div>
          </div>

          {/* Missing Keywords Section */}
          <div>
            <h4 className="font-black text-slate-800 flex items-center gap-2 mb-3">
              <BarChart3 size={18} className="text-rose-500" /> Missing Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {atsResult.missingKeywords?.length > 0 ? (
                atsResult.missingKeywords.map((word, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold uppercase tracking-wider">
                    + {word}
                  </span>
                ))
              ) : (
                <p className="text-emerald-600 text-sm font-bold bg-emerald-50 p-3 rounded-xl w-full">✨ No missing keywords found! Great job.</p>
              )}
            </div>
          </div>

          {/* AI Suggestions (Gemini) */}
          <div>
            <h4 className="font-black text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-indigo-600" /> AI Suggestions
            </h4>
            <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {atsResult.aiSuggestions || "AI is thinking..."}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* --- Default Text Output (Tailor/Cover) --- */
        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-medium leading-relaxed">
          {tailoredResult || coverResult || (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
              <FileText size={48} className="mb-4 opacity-20" />
              Your results will appear here after generation.
            </div>
          )}
        </pre>
      )}
    </div>
  </div>
</div>
</div>
</div>
    </div>
  );
}
        
 
// "use client";

// import React, { useState, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { 
//   FileEdit, Mail, UserCircle, Target, 
//   Upload, RefreshCw, Download, CheckCircle2, 
//   Sparkles, AlertCircle, Trash2, Eye
// } from "lucide-react";
// import UserSidebar from "@/components/UserSidebar";

// export default function ResumeToolkit() {
//   const [tab, setTab] = useState("tailor");
//   const { data: session } = useSession();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // States
//   const [resumeFile, setResumeFile] = useState(null);
//   const [resumeTextPreview, setResumeTextPreview] = useState("");
//   const [jobDescription, setJobDescription] = useState("");
//   const [tailoredResult, setTailoredResult] = useState(null);
//   const [coverTone, setCoverTone] = useState("formal");
//   const [coverLength, setCoverLength] = useState("short");
//   const [coverResult, setCoverResult] = useState(null);
//   const [selfieFile, setSelfieFile] = useState(null);
//   const [headshotResults, setHeadshotResults] = useState([]);
//   const [selectedHeadshot, setSelectedHeadshot] = useState(null);
//   const [atsFile, setAtsFile] = useState(null);
//   const [atsJobDesc, setAtsJobDesc] = useState("");
//   const [atsResult, setAtsResult] = useState(null);

//   const fileInputRef = useRef();
//   const selfieInputRef = useRef();
//   const atsInputRef = useRef();

//   // Helper Functions (Same logic as yours)
//   async function extractTextFromFile(file) {
//     if (!file) return "";
//     const ext = file.name.split(".").pop().toLowerCase();
//     if (ext === "txt") return await file.text();
//     return `📄 ${file.name} uploaded. Ready for AI analysis.`;
//   }

//   function downloadText(filename, text) {
//     const blob = new Blob([text], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   // API Handlers (Simplified for brevity, keeping your logic)
//   const handleTailorSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     // ... your fetch logic here
//     setTimeout(() => setLoading(false), 1500); // Demo delay
//   };

//   const tabs = [
//     { id: "tailor", label: "Tailor Resume", icon: <FileEdit size={18} /> },
//     { id: "cover", label: "Cover Letter", icon: <Mail size={18} /> },
//     { id: "headshot", label: "AI Headshots", icon: <UserCircle size={18} /> },
//     { id: "ats", label: "ATS Score", icon: <Target size={18} /> },
//   ];

//   return (
//     <div className="flex min-h-screen bg-slate-100 font-sans">
//       <UserSidebar />
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header Section */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
//             <Sparkles className="text-indigo-600" /> AI Resume Toolkit
//           </h1>
//           <p className="text-slate-500 font-medium mt-1">Optimize your application with powerful AI tools.</p>
//         </div>

//         {/* Tab Navigation */}
//         {/* Tab Navigation - ફક્ત inline-flex રાખો અથવા flex રાખો */}
//         <div className="inline-flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
//           {tabs.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setTab(t.id)}
//               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
//                 tab === t.id 
//                 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
//                 : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
//               }`}
//             >
//               {t.icon} {t.label}
//             </button>
//           ))}
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
//             <AlertCircle size={20} />
//             <p className="text-sm font-bold">{error}</p>
//           </div>
//         )}

//         {/* Content Area */}
//         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
//           <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            
//             {/* Left Column: Inputs */}
//             <div className="lg:col-span-5 p-6 md:p-8 border-r border-slate-50 bg-slate-50/30">
//               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
//                 <Upload size={20} className="text-indigo-600" /> Input Data
//               </h3>
              
//               <div className="space-y-6">
//                 {/* File Upload Area */}
//                 <div className="group">
//                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
//                     Resume Document
//                   </label>
//                   <div className="relative border-2 border-dashed border-slate-200 group-hover:border-indigo-400 rounded-2xl p-6 transition-all bg-white text-center">
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                       onChange={async (e) => {
//                         const f = e.target.files[0];
//                         setResumeFile(f);
//                         const t = await extractTextFromFile(f);
//                         setResumeTextPreview(t);
//                       }}
//                     />
//                     <Upload className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" />
//                     <p className="text-sm font-bold text-slate-600">
//                       {resumeFile ? resumeFile.name : "Click to upload PDF/DOCX"}
//                     </p>
//                     <p className="text-[10px] text-slate-400 mt-1">Maximum file size 5MB</p>
//                   </div>
//                 </div>

//                 {/* Textareas */}
//                 {tab !== "headshot" && (
//                   <>
//                     <div>
//                       <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
//                         Job Description
//                       </label>
//                       <textarea
//                         value={jobDescription}
//                         onChange={(e) => setJobDescription(e.target.value)}
//                         placeholder="Paste the job requirements here..."
//                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px] text-sm font-medium transition-all"
//                       />
//                     </div>
//                   </>
//                 )}

//                 {/* Actions */}
//                 <div className="pt-4 flex flex-col gap-3">
//                   <button 
//                     disabled={loading}
//                     className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
//                     {loading ? "AI is working..." : `Process ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
//                   </button>
//                   <button 
//                     onClick={() => {
//                       setResumeFile(null);
//                       setJobDescription("");
//                       setTailoredResult(null);
//                     }}
//                     className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
//                   >
//                     <Trash2 size={18} /> Reset All
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column: Results */}
//             <div className="lg:col-span-7 p-6 md:p-8 flex flex-col">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
//                   <Eye size={20} className="text-indigo-600" /> Output Preview
//                 </h3>
//                 {tailoredResult && (
//                   <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
//                     <Download size={16} /> Export PDF
//                   </button>
//                 )}
//               </div>

//               <div className="flex-1 bg-slate-50/50 rounded-[24px] border border-slate-100 p-6">
//                 {!tailoredResult && !loading && (
//                   <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
//                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-200">
//                       <Target size={32} />
//                     </div>
//                     <div>
//                       <p className="font-bold text-slate-700">No results yet</p>
//                       <p className="text-sm text-slate-400 max-w-[250px]">Fill in the details on the left to generate AI-powered insights.</p>
//                     </div>
//                   </div>
//                 )}

//                 {loading && (
//                   <div className="h-full flex flex-col items-center justify-center">
//                     <div className="relative">
//                       <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
//                       <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={16} />
//                     </div>
//                     <p className="mt-4 font-bold text-slate-600 animate-pulse">Analyzing your profile...</p>
//                   </div>
//                 )}

//                 {/* Placeholder for actual Results logic */}
//                 {tailoredResult && (
//                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                      <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
//                         {typeof tailoredResult === "string" ? tailoredResult : JSON.stringify(tailoredResult, null, 2)}
//                      </pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }