"use client";
import React, { useState, useRef, useEffect } from "react";
import { Video, Square, RotateCcw, UploadCloud, Loader2, CheckCircle2, AlertTriangle, Circle } from "lucide-react";

// Self-contained interview recorder: camera+mic capture (MediaRecorder),
// live preview, in-browser review, and optional upload to S3.
export default function InterviewRecorder({ sessionId }) {
  const liveRef = useRef(null);
  const reviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [status, setStatus] = useState("idle"); // idle | ready | recording | recorded
  const [error, setError] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [blob, setBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const timerRef = useRef(null);

  // Clean up the stream/timer on unmount.
  useEffect(() => () => stopStream(), []);

  const stopStream = () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const enableCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }, audio: true,
      });
      streamRef.current = stream;
      if (liveRef.current) { liveRef.current.srcObject = stream; liveRef.current.play().catch(() => {}); }
      setStatus("ready");
    } catch (e) {
      setError("Camera/microphone access denied or unavailable. Please allow permissions and retry.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setBlobUrl(""); setBlob(null); setUploaded(false); setSeconds(0);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const mr = new MediaRecorder(streamRef.current, { mimeType: mime });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const b = new Blob(chunksRef.current, { type: "video/webm" });
      setBlob(b);
      setBlobUrl(URL.createObjectURL(b));
      setStatus("recorded");
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setStatus("recording");
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const reRecord = () => { setStatus("ready"); setBlobUrl(""); setBlob(null); setUploaded(false); setSeconds(0); };

  const upload = async () => {
    if (!blob) return;
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("recording", blob, "interview.webm");
      if (sessionId) fd.append("sessionId", sessionId);
      const res = await fetch("/api/interview-sessions/upload-recording", { method: "POST", body: fd });
      const result = await res.json();
      if (result.success) setUploaded(true);
      else if (result.code === "S3_NOT_CONFIGURED")
        setError("Recording saved locally for review. Cloud save needs AWS S3 credentials (ask the admin to configure storage).");
      else setError(result.error || "Upload failed.");
    } catch { setError("Upload failed. Check your connection."); }
    setUploading(false);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
        <Video className="h-5 w-5 text-blue-600" /> Interview Recording
      </h3>

      <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
        {/* Live preview (hidden once we have a recording to review) */}
        <video ref={liveRef} muted playsInline className={`w-full h-full object-cover ${status === "recorded" ? "hidden" : ""}`} />
        {/* Review playback */}
        {status === "recorded" && <video ref={reviewRef} src={blobUrl} controls className="w-full h-full object-cover" />}

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <Video className="h-10 w-10 mb-2 opacity-60" />
            <p className="text-sm">Enable your camera to begin</p>
          </div>
        )}
        {status === "recording" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <Circle className="h-2.5 w-2.5 fill-white animate-pulse" /> REC {fmt(seconds)}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {status === "idle" && (
          <button onClick={enableCamera} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2">
            <Video className="h-4 w-4" /> Enable Camera
          </button>
        )}
        {status === "ready" && (
          <button onClick={startRecording} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 inline-flex items-center gap-2">
            <Circle className="h-4 w-4 fill-white" /> Start Recording
          </button>
        )}
        {status === "recording" && (
          <button onClick={stopRecording} className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black inline-flex items-center gap-2">
            <Square className="h-4 w-4" /> Stop
          </button>
        )}
        {status === "recorded" && (
          <>
            <button onClick={reRecord} className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 inline-flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Re-record
            </button>
            {uploaded ? (
              <span className="px-5 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Saved to cloud
              </span>
            ) : (
              <button onClick={upload} disabled={uploading} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Save Recording
              </button>
            )}
            <a href={blobUrl} download="interview-recording.webm" className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 inline-flex items-center gap-2">
              Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}
