"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/UserSidebar';
import { Sparkles, FileText, Target, Loader2, Copy, Upload, Trash2, Wand2, UserCircle, Image as ImageIcon } from 'lucide-react';
import FeatureGuard from '@/components/FeatureGuard';

export default function AITools() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ats');
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [tailoredData, setTailoredData] = useState(null);

  // --- New States for AI Headshot (COMMENTED OUT) ---
  /*
  const [userPhoto, setUserPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [headshotStyle, setHeadshotStyle] = useState('corporate');
  const [generatedHeadshot, setGeneratedHeadshot] = useState(null);
  */

  // --- File Upload Logic (Fixed: Single Call) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // માત્ર એક જ વાર API કોલ કરો
      const res = await fetch("/api/ai/extract-text", {
        method: "POST",
        // અહીં headers સેટ કરવાની જરૂર નથી, FormData સાથે બ્રાઉઝર ઓટોમેટિક સેટ કરી દેશે
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // ૧. ટેક્સ્ટને textarea માં સેટ કરો
        if (data.text) {
          setResumeText(data.text);
        }

        // ૨. જો AI ડેટા મળ્યો હોય (Auto-fill માટે), તો અહીં હેન્ડલ કરો
        if (data.aiData) {
          //console.log("Extracted Data:", data.aiData);
          alert("AI magic! ✨ Text extracted and details analyzed.");
        }
      } else {
        alert(data.error || "Could not read file. Please paste text manually.");
      }
    } catch (err) {
      //console.error("Auto-fill error:", err);
      alert("Error processing file with AI.");
    } finally {
      setLoading(false);
    }
  };

  // --- Headshot Selection Logic (COMMENTED OUT) ---
  /*
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  */

  const handleAction = async () => {
    // Validation based on Tab
    if (activeTab === 'headshot') {
      // if (!userPhoto) return alert("Please upload a photo first!");
      return; // Disabled
    } else {
      if (!resumeText || !jobDesc) return alert("Please provide both Resume and Job Description!");
    }

    setLoading(true);
    setResult(null);
    setCoverLetter('');
    setTailoredData(null);
    // setGeneratedHeadshot(null);

    // Determine Endpoint
    let endpoint = '/api/ai/ats-score';
    if (activeTab === 'coverletter') endpoint = '/api/ai/generate-cover-letter';
    if (activeTab === 'headshot') endpoint = '/api/ai/generate-headshot';

    try {
      let payload;
      if (activeTab === 'headshot') {
        // payload = { image: photoPreview, style: headshotStyle };
        return; // Disabled
      } else {
        payload = {
          resumeText: resumeText,
          candidateInfo: resumeText,
          jobDescription: jobDesc,
          mode: activeTab
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (activeTab === 'ats') setResult(data.data);
        else if (activeTab === 'tailor') setTailoredData(data.data);
        // else if (activeTab === 'headshot') setGeneratedHeadshot(data.imageUrl);
        else setCoverLetter(data.coverLetter);
      }
    } catch (err) {
      alert("AI Error, try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFEFF] overflow-hidden">

      <div className="lg:w-64 flex-shrink-0 border-r border-slate-100">
        <Sidebar activePage="aitools" />
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <FeatureGuard featureName="AI Features">
          <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center md:text-left pt-16 lg:pt-0">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              AI Career Suite <Sparkles className="text-indigo-600" />
            </h1>
            <p className="text-slate-500 font-bold mt-2 italic">Professional AI Tools for your Career Growth</p>
          </div>

          {/* Tab Switcher - AI Headshot Disabled 📸 */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 mx-auto md:mx-0 overflow-x-auto gap-1">
            {['ats', 'tailor', 'coverletter' /*, 'headshot'*/].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>
                {tab === 'ats' ? 'ATS Analyzer' : tab === 'tailor' ? 'Resume Tailor ✨' : tab === 'coverletter' ? 'Cover Letter Gen' : 'AI Headshot 📸'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
            <div className="space-y-6">

              {activeTab === 'headshot' ? (
                /* --- AI Headshot Input UI (COMMENTED OUT) --- */
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 text-center">
                  <p className="text-slate-400 font-bold">Headshot tool is currently disabled.</p>
                </div>
                /*
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-8 rounded-[30px] bg-slate-50 relative overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-40 w-40 object-cover rounded-full border-4 border-white shadow-lg" />
                    ) : (
                      <ImageIcon size={40} className="text-slate-300 mb-2" />
                    )}
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Upload your clear photo</p>
                    <input type="file" id="headshotUpload" hidden accept="image/*" onChange={handlePhotoSelect} />
                    <label htmlFor="headshotUpload" className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black cursor-pointer hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                      {photoPreview ? 'CHANGE PHOTO' : 'SELECT PHOTO'}
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Corporate', 'Tech CEO', 'Formal'].map(style => (
                        <button key={style} onClick={() => setHeadshotStyle(style.toLowerCase())} className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${headshotStyle === style.toLowerCase() ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-100'}`}>
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                */
              ) : (
                /* --- Existing Resume/JD Input UI --- */
                <>
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" /> Resume / CV
                      </label>
                      <input type="file" id="resumeFile" hidden accept=".pdf,.docx" onChange={handleFileUpload} />
                      <label htmlFor="resumeFile" className="cursor-pointer text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1">
                        <Upload size={12} /> UPLOAD PDF/DOCX
                      </label>
                    </div>

                    {fileName && (
                      <div className="mb-4 flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-700 truncate">{fileName}</span>
                        <button onClick={() => { setFileName(""); setResumeText(""); }} className="text-rose-500"><Trash2 size={16} /></button>
                      </div>
                    )}

                    <textarea
                      rows="8" value={resumeText} onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste resume text or upload a file..."
                      className="w-full p-5 bg-slate-50 rounded-[24px] outline-none font-medium text-slate-600 border border-transparent focus:border-indigo-200 transition-all text-sm"
                    />
                  </div>

                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Target size={18} className="text-rose-500" /> Job Description
                    </label>
                    <textarea
                      rows="5" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
                      placeholder="Paste the Job Requirements here..."
                      className="w-full p-5 bg-slate-50 rounded-[24px] outline-none font-medium text-slate-600 border border-transparent focus:border-rose-200 transition-all text-sm"
                    />
                  </div>
                </>
              )}

              <button onClick={handleAction} disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : activeTab === 'headshot' ? <ImageIcon size={20} /> : activeTab === 'tailor' ? <Wand2 size={20} /> : <Sparkles size={20} />}
                {activeTab === 'ats' ? 'Get ATS Score' : activeTab === 'tailor' ? 'Tailor My Resume' : activeTab === 'headshot' ? 'Generate AI Headshot' : 'Generate Cover Letter'}
              </button>
            </div>

            {/* Results Area */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[500px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="animate-spin mb-4 text-indigo-600" size={40} />
                  <p className="font-bold animate-pulse text-xs uppercase tracking-widest">AI magic in progress...</p>
                </div>
              ) : activeTab === 'ats' && result ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 bg-indigo-50 p-6 rounded-[30px] border border-indigo-100">
                    <div className="text-4xl font-black text-indigo-600">{result.score}%</div>
                    <div className="font-bold text-indigo-900/60 leading-tight uppercase text-xs tracking-tighter">ATS Match<br />Confidence</div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 text-sm uppercase">Analysis Summary</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>

                    {result.missingKeywords?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-rose-500 uppercase">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'tailor' && tailoredData ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-black text-indigo-600 text-sm uppercase flex items-center gap-2">
                    <Wand2 size={16} /> Tailored Improvements
                  </h3>
                  <div className="space-y-4">
                    <div className="p-5 bg-indigo-50/50 rounded-[24px] border border-indigo-100">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-2">Tailored Professional Summary</h4>
                      <p className="text-sm text-slate-700 leading-relaxed italic">"{tailoredData.tailoredSummary}"</p>
                    </div>
                    <div className="p-5 bg-emerald-50/50 rounded-[24px] border border-emerald-100">
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-2">Keywords to add</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tailoredData.keywordsToAdd?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-white text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">+{kw}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(tailoredData.tailoredSummary); alert("Summary Copied!") }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Copy Summary</button>
                  </div>
                </div>
              ) : activeTab === 'headshot' /*&& generatedHeadshot*/ ? (
                /* --- Headshot Result UI (Disabled) --- */
                <div className="flex flex-col items-center justify-center h-full">
                  <UserCircle size={60} className="mb-4 opacity-20" />
                  <p className="text-slate-300 italic font-bold">Feature temporarily unavailable</p>
                </div>
              ) : activeTab === 'coverletter' && coverLetter ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-slate-800 text-sm uppercase flex items-center gap-2">
                      <FileText size={16} className="text-indigo-600" /> Cover Letter
                    </h3>
                    <button onClick={() => { navigator.clipboard.writeText(coverLetter); alert("Copied!"); }} className="flex items-center gap-1 text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                      <Copy size={12} /> COPY
                    </button>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[30px] text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium border border-slate-100">{coverLetter}</div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic font-bold">
                  {activeTab === 'headshot' ? <UserCircle size={60} className="mb-4 opacity-20" /> : <Sparkles size={60} className="mb-4 opacity-20" />}
                  <p>{activeTab === 'headshot' ? 'Upload Photo to Start' : 'Awaiting Input...'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </FeatureGuard>
      </main>
    </div>
  );
}