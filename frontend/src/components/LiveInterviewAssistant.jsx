"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Mic, MicOff, Sparkles, Loader2, AlertTriangle, FileText, Lightbulb, Gauge, MessageSquarePlus,
} from "lucide-react";

// Interviewer-side AI co-pilot. Uses the browser's free Web Speech API for live
// transcription, then asks the AI for follow-up questions, an answer score, and
// a final evaluation. Transparent assistant for the interviewer — not a candidate aid.
export default function LiveInterviewAssistant() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [role, setRole] = useState("");
  const [transcript, setTranscript] = useState([]); // [{speaker, text}]
  const [interim, setInterim] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [speaker, setSpeaker] = useState("Interviewer"); // who is currently talking
  const recRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e) => {
      let finalText = "", interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interimText += t;
      }
      if (finalText) {
        setTranscript((prev) => [...prev, { speaker: speakerRef.current, text: finalText.trim() }]);
        setInterim("");
      } else {
        setInterim(interimText);
      }
    };
    rec.onerror = (e) => { if (e.error === "not-allowed") { setSupported(false); } };
    rec.onend = () => { if (listeningRef.current) { try { rec.start(); } catch {} } };
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refs to read latest state inside recognition callbacks
  const speakerRef = useRef(speaker); useEffect(() => { speakerRef.current = speaker; }, [speaker]);
  const listeningRef = useRef(listening); useEffect(() => { listeningRef.current = listening; }, [listening]);

  const toggleListen = () => {
    if (!recRef.current) return;
    if (listening) { setListening(false); try { recRef.current.stop(); } catch {} }
    else { setListening(true); try { recRef.current.start(); } catch {} }
  };

  const fullTranscript = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n");

  // Analyze the most recent interviewer-question + candidate-answer pair.
  const analyzeTurn = async () => {
    const q = lastQuestion || [...transcript].reverse().find((t) => t.speaker === "Interviewer")?.text || "";
    const a = lastAnswer || [...transcript].reverse().find((t) => t.speaker === "Candidate")?.text || "";
    if (!q && !a) return alert("No question/answer captured yet.");
    setAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch("/api/ai/interview-assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "turn", role, question: q, answer: a }),
      });
      const r = await res.json();
      if (r.success) setAnalysis(r);
      else alert(r.error || "Analysis failed.");
    } catch { alert("Analysis failed."); }
    setAnalyzing(false);
  };

  const generateReport = async () => {
    if (!fullTranscript.trim()) return alert("No transcript yet.");
    setReporting(true); setReport(null);
    try {
      const res = await fetch("/api/ai/interview-assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "summary", role, transcript: fullTranscript }),
      });
      const r = await res.json();
      if (r.success) setReport(r);
      else alert(r.error || "Report failed.");
    } catch { alert("Report failed."); }
    setReporting(false);
  };

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Live transcription not available</p>
          <p className="text-sm mt-1">Use <strong>Google Chrome or Microsoft Edge</strong> and allow microphone access. (The browser's built-in speech recognition isn't supported here.)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Consent / setup bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role being interviewed for (e.g. Backend Developer)"
            className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={toggleListen}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ${listening ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
            {listening ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> Start Listening</>}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Please inform the candidate that this session is AI-assisted and transcribed. Tag who is speaking below for best results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live transcript */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" /> Live Transcript</h3>
            <div className="flex gap-1">
              {["Interviewer", "Candidate"].map((s) => (
                <button key={s} onClick={() => setSpeaker(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${speaker === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 space-y-2 text-sm">
            {transcript.length === 0 && !interim && <p className="text-gray-400 italic">Start listening and the conversation will appear here…</p>}
            {transcript.map((t, i) => (
              <p key={i}><span className={`font-semibold ${t.speaker === "Interviewer" ? "text-blue-700" : "text-emerald-700"}`}>{t.speaker}:</span> <span className="text-gray-700">{t.text}</span></p>
            ))}
            {interim && <p className="text-gray-400 italic">{speaker}: {interim}</p>}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button onClick={analyzeTurn} disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze last answer
            </button>
            <button onClick={generateReport} disabled={reporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60">
              {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Final report
            </button>
          </div>
        </div>

        {/* AI co-pilot output */}
        <div className="space-y-4">
          {analysis && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Gauge className="h-5 w-5 text-indigo-600" /> Answer Analysis</h3>
              {typeof analysis.score === "number" && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500"><span>Answer score</span><span>{analysis.score}/100</span></div>
                  <div className="h-2 bg-gray-100 rounded-full mt-1"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${analysis.score}%` }} /></div>
                </div>
              )}
              {analysis.evaluation && <p className="text-sm text-gray-700 mb-3">{analysis.evaluation}</p>}
              {analysis.followUps?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MessageSquarePlus className="h-3.5 w-3.5" /> Suggested follow-ups</p>
                  <ul className="space-y-1.5">
                    {analysis.followUps.map((q, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{q}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {report && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText className="h-5 w-5 text-gray-700" /> Candidate Evaluation</h3>
              {typeof report.overallScore === "number" && <p className="text-sm mb-1">Overall: <strong>{report.overallScore}/100</strong> · <span className="font-semibold text-indigo-700">{report.recommendation}</span></p>}
              {report.summary && <p className="text-sm text-gray-700 mb-2">{report.summary}</p>}
              {report.strengths?.length > 0 && <p className="text-sm text-emerald-700"><strong>Strengths:</strong> {report.strengths.join("; ")}</p>}
              {report.concerns?.length > 0 && <p className="text-sm text-rose-700"><strong>Concerns:</strong> {report.concerns.join("; ")}</p>}
            </div>
          )}

          {!analysis && !report && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 text-sm">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              AI suggestions, answer scores and the final evaluation will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
