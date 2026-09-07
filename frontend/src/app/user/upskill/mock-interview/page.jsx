"use client";
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/UserSidebar';
import { useSession } from 'next-auth/react';
import { 
  Mic2, Sparkles, FileText, Target, Loader2, 
  BrainCircuit, ChevronRight, ChevronLeft, RotateCcw, UploadCloud,
  StopCircle, Activity, Calendar, Video
} from 'lucide-react';
import FeatureGuard from "@/components/FeatureGuard";

export default function MockInterviewPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [questions, setQuestions] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState('');
  const fileInputRef = useRef(null);

  // --- Speech & Tone Analysis States ---
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const mediaRecorder = useRef(null);
  const recordingChunks = useRef([]);
  const recordingMimeType = useRef('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchInterviewSessions();
    }
  }, [session?.user?.email]);

  useEffect(() => {
    return () => {
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recordedVideoUrl]);

  const handleReset = () => {
    setQuestions(null);
    setResumeText('');
    setJobDesc('');
    setCurrentStep(0);
    setAnalysis(null);
    setRecordedVideoUrl('');
    setCurrentSessionId('');
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

  const fetchInterviewSessions = async () => {
    if (!session?.user?.email) return;
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/interview-sessions', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setInterviewSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load interview sessions', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const saveInterviewSession = async (payload) => {
    if (!session?.user?.email) return null;
    const res = await fetch('/api/interview-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.success ? data.session : null;
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
      if (data.success) {
        setQuestions(data.questions);
        setAnalysis(null);
        setRecordedVideoUrl('');

        if (session?.user?.email) {
          const savedSession = await saveInterviewSession({
            action: 'session',
            status: 'in-progress',
            jobDescription: jobDesc,
            resumeText,
            questions: data.questions,
          });

          if (savedSession?._id) {
            setCurrentSessionId(savedSession._id);
            fetchInterviewSessions();
          }
        }
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  // --- Speech Analysis Logic ---
  const startRecording = async () => {
    setAnalysis(null);
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl('');
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mimeType = getSupportedMimeType();
      recordingMimeType.current = mimeType;
      mediaRecorder.current = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recordingChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => recordingChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const recordingBlob = new Blob(recordingChunks.current, {
          type: recordingMimeType.current || 'video/webm',
        });
        const playbackUrl = URL.createObjectURL(recordingBlob);
        setRecordedVideoUrl(playbackUrl);
        analyzeSpeech(recordingBlob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Camera/Microphone access required for video interview.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) mediaRecorder.current.stop();
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
      if (data.success) {
        setAnalysis(data.analysis);

        if (currentSessionId) {
          await saveInterviewSession({
            action: 'update',
            sessionId: currentSessionId,
            speechAnalysis: data.analysis,
            recording: {
              hasRecording: true,
              mimeType: blob.type || 'video/webm',
              size: blob.size || 0,
              createdAt: new Date().toISOString(),
            },
            status: 'in-progress',
          });
          fetchInterviewSessions();
        }
      }
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleDate) return alert('Please select a schedule date.');
    if (!session?.user?.email) return alert('Please login to schedule an interview.');

    const savedSession = await saveInterviewSession({
      action: 'schedule',
      scheduledAt: scheduleDate,
      jobDescription: jobDesc,
      resumeText,
      questions: questions || [],
    });

    if (savedSession) {
      setShowScheduleModal(false);
      setScheduleDate('');
      fetchInterviewSessions();
      alert(`Interview scheduled for ${new Date(scheduleDate).toLocaleString()}`);
    } else {
      alert('Failed to schedule interview.');
    }
  };

  const handleCompleteSession = async () => {
    if (currentSessionId) {
      await saveInterviewSession({
        action: 'update',
        sessionId: currentSessionId,
        status: 'completed',
      });
      fetchInterviewSessions();
    }
    handleReset();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
      <div className="lg:w-64 flex-shrink-0 border-r border-slate-200 bg-white">
        <Sidebar activePage="mock-interview" />
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <FeatureGuard featureName="Interview Preparation">
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
                <div className="flex gap-4">
                  <button onClick={() => setShowScheduleModal(true)} disabled={loading || extracting} className="w-1/3 py-6 bg-white border-2 border-slate-200 text-slate-700 rounded-[30px] font-black text-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50">
                    <Calendar size={24} className="text-slate-500" /> SCHEDULE
                  </button>
                  <button onClick={generateInterview} disabled={loading || extracting} className="flex-1 py-6 bg-slate-900 text-white rounded-[30px] font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={24} />} START SESSION
                  </button>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Saved Interview Sessions</h3>
                    <button onClick={fetchInterviewSessions} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Refresh</button>
                  </div>
                  {sessionsLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <Loader2 className="animate-spin" size={16} /> Loading sessions...
                    </div>
                  ) : interviewSessions.length ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {interviewSessions.slice(0, 5).map((item) => (
                        <div key={item._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-black text-slate-800 text-sm capitalize">{item.kind}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : `${item.questionsCount || 0} questions saved`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No saved interview sessions yet.</p>
                  )}
                </div>

                {showScheduleModal && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
                      <h3 className="text-xl font-black mb-4">Schedule Interview</h3>
                      <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl mb-6 outline-none" />
                      <div className="flex gap-4">
                        <button onClick={() => setShowScheduleModal(false)} className="flex-1 p-4 bg-slate-100 rounded-xl font-bold">Cancel</button>
                        <button onClick={handleScheduleConfirm} className="flex-1 p-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Confirm</button>
                      </div>
                    </div>
                  </div>
                )}
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
                      {isRecording && <span className="flex items-center gap-1 text-rose-500 font-black text-[10px] animate-pulse"><Activity size={12}/> RECORDING VIDEO...</span>}
                    </div>

                    <div className="mb-4">
                      {recordedVideoUrl && !isRecording && (
                        <div className="mb-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded Answer Preview</h5>
                            <a
                              href={recordedVideoUrl}
                              download={`interview-answer-${currentStep + 1}.webm`}
                              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                            >
                              Download
                            </a>
                          </div>
                          <video
                            src={recordedVideoUrl}
                            controls
                            className="w-full max-w-sm mx-auto rounded-2xl bg-black border-4 border-slate-100 shadow-md"
                          />
                        </div>
                      )}

                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline
                            className={`w-full max-w-sm mx-auto rounded-2xl bg-black border-4 border-slate-100 shadow-md transition-all ${isRecording ? 'block' : 'hidden'}`}
                        />
                    </div>

                    {!analysis && !analyzing ? (
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${isRecording ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                      >
                        {isRecording ? <StopCircle /> : <Video />} {isRecording ? "STOP & ANALYZE" : "RECORD VIDEO ANSWER"}
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
                    <button onClick={handleCompleteSession} className="flex-1 py-5 bg-emerald-600 text-white rounded-[24px] font-black flex items-center justify-center gap-2 shadow-lg">COMPLETE <RotateCcw size={20} /></button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </FeatureGuard>
      </main>
    </div>
  );
}
