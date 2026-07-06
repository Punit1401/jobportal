"use client";
import React, { useState, useRef } from 'react';
import Sidebar from '@/components/UserSidebar';
import { 
  Mic2, Sparkles, FileText, Target, Loader2, 
  BrainCircuit, ChevronRight, ChevronLeft, RotateCcw, UploadCloud,
  StopCircle, Activity
} from 'lucide-react';

export default function MockInterviewPage() {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [questions, setQuestions] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);

  // --- Speech & Tone Analysis States ---
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleReset = () => {
    setQuestions(null);
    setResumeText('');
    setJobDesc('');
    setCurrentStep(0);
    setAnalysis(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) return alert("Please upload only PDF or DOCX files.");

    setExtracting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ai/extract-text", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setResumeText(data.text);
        alert("File processed successfully!");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setExtracting(false);
    }
  };

  const generateInterview = async () => {
    if (!resumeText || !jobDesc) return alert("Please provide both Resume and Job Description.");
    setLoading(true);
    try {
      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc }),
      });
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // --- Speech Analysis Logic ---
  const startRecording = async () => {
    setAnalysis(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      analyzeSpeech(audioBlob);
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  const analyzeSpeech = async (blob) => {
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("audio", blob);

    try {
      const res = await fetch('/api/ai/analyze-speech', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.analysis);
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
      <div className="lg:w-64 flex-shrink-0 border-r border-slate-200 bg-white">
        <Sidebar activePage="mock-interview" />
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-4xl mx-auto pt-12 lg:pt-0">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              AI Interview Coach <Mic2 className="text-indigo-600" />
            </h1>
            <p className="text-slate-500 font-bold mt-2 italic tracking-tight">Personalized mock sessions & tone analysis</p>
          </div>

          {!questions ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Setup UI stays the same */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" /> Resume Content
                  </label>
                  <button onClick={() => fileInputRef.current.click()} disabled={extracting} className="flex items-center gap-2 text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-full">
                    {extracting ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} UPLOAD
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
                </div>
                <textarea rows="12" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume..." className="w-full flex-1 p-5 bg-slate-50 rounded-[24px] outline-none text-sm resize-none" />
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Target size={18} className="text-rose-500" /> Job Description
                  </label>
                  <textarea rows="10" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste job requirements..." className="w-full p-5 bg-slate-50 rounded-[24px] outline-none text-sm resize-none" />
                </div>
                <button onClick={generateInterview} disabled={loading || extracting} className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={24} />} START SESSION
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentStep + 1} of {questions.length} Questions</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}></div>
              </div>

              <div className="bg-white p-10 rounded-[50px] border border-slate-200 shadow-2xl relative min-h-[500px] flex flex-col">
                <div className="absolute -top-5 left-10 bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-[10px] tracking-widest">LIVE INTERVIEW</div>

                <div className="mt-4 space-y-6 flex-1">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Question:</h4>
                    <p className="text-2xl font-bold text-slate-800 leading-tight">{questions[currentStep].question}</p>
                  </div>

                  {/* Speech Analysis Section */}
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase">Your Practice Answer</h4>
                      {isRecording && <span className="flex items-center gap-1 text-rose-500 font-black text-[10px] animate-pulse"><Activity size={12}/> RECORDING...</span>}
                    </div>

                    {!analysis && !analyzing ? (
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${isRecording ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                      >
                        {isRecording ? <StopCircle /> : <Mic2 />} {isRecording ? "STOP & ANALYZE" : "START SPEAKING"}
                      </button>
                    ) : analyzing ? (
                      <div className="py-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Analyzing Tone & Speech...</p>
                      </div>
                    ) : (
                      <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-600 uppercase">Speech Analysis Result</span>
                          <button onClick={() => setAnalysis(null)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500">RE-RECORD</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-indigo-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Tone</p>
                            <p className="text-sm font-bold text-slate-700 capitalize">{analysis.tone}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-indigo-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Confidence</p>
                            <p className="text-sm font-bold text-slate-700">{analysis.confidence}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{analysis.feedback}"</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-[30px] border border-emerald-100 mt-4">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles size={12}/> AI Recommended Answer</h4>
                    <p className="text-sm text-slate-700 font-medium italic">"{questions[currentStep].bestAnswer}"</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  {currentStep > 0 && (
                    <button onClick={() => {setCurrentStep(currentStep - 1); setAnalysis(null);}} className="px-6 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black flex items-center gap-2"><ChevronLeft size={20} /> PREVIOUS</button>
                  )}
                  {currentStep < questions.length - 1 ? (
                    <button onClick={() => {setCurrentStep(currentStep + 1); setAnalysis(null);}} className="flex-1 py-5 bg-indigo-600 text-white rounded-[24px] font-black flex items-center justify-center gap-2 shadow-lg">NEXT QUESTION <ChevronRight size={20} /></button>
                  ) : (
                    <button onClick={handleReset} className="flex-1 py-5 bg-emerald-600 text-white rounded-[24px] font-black flex items-center justify-center gap-2 shadow-lg">COMPLETE <RotateCcw size={20} /></button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}