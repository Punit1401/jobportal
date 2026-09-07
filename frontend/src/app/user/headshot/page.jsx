"use client";
import React, { useState, useRef } from "react";
import { UserSquare, Upload, Sparkles, Loader2, Download, AlertTriangle, ImageIcon, Wand2 } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import FeatureGuard from "@/components/FeatureGuard";

const STYLES = [
  { id: "corporate", label: "Corporate Suit" },
  { id: "formal", label: "Formal Shirt & Tie" },
  { id: "techceo", label: "Tech Founder" },
  { id: "businesscasual", label: "Business Casual" },
  { id: "doctor", label: "Healthcare / Coat" },
];
const BACKGROUNDS = [
  { id: "studio", label: "Studio Grey" },
  { id: "office", label: "Office Blur" },
  { id: "gradient", label: "Blue Gradient" },
  { id: "outdoor", label: "Outdoor Bokeh" },
];

export default function HeadshotPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [photo, setPhoto] = useState("");        // data URL of the uploaded casual photo
  const [style, setStyle] = useState("corporate");
  const [background, setBackground] = useState("studio");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);     // [{url, style, background}]
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please upload an image file.");
    if (f.size > 8 * 1024 * 1024) return setError("Image too large (max 8MB).");
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(f);
  };

  const generate = async () => {
    if (!photo) return setError("Upload a photo first.");
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/ai/headshot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo, style, background }),
      });
      const data = await res.json();
      if (data.success) {
        setResults((r) => [{ url: data.imageUrl, style, background }, ...r]);
      } else if (data.code === "NO_CREDITS") {
        setError("The AI image service is out of credits. Please ask the admin to top up Stability AI.");
      } else {
        setError(data.error || "Generation failed. Please try again.");
      }
    } catch { setError("Network error. Please try again."); }
    setGenerating(false);
  };

  const styleLabel = (id) => STYLES.find((s) => s.id === id)?.label || id;

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="AI Headshot">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-1">
            <UserSquare className="h-8 w-8 text-blue-600" /> AI Professional Headshots
          </h1>
          <p className="text-gray-600 mb-6">Upload a casual photo and generate a corporate headshot in multiple styles and backgrounds.</p>

          {error && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              {/* Upload */}
              <label className="text-sm font-semibold text-gray-700">1. Upload your photo</label>
              <div onClick={() => fileRef.current?.click()}
                className="mt-2 border-2 border-dashed border-gray-300 rounded-xl aspect-square max-w-xs mx-auto flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden bg-gray-50">
                {photo ? <img src={photo} alt="upload" className="w-full h-full object-cover" /> : (
                  <div className="text-center text-gray-400 p-6">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Click to upload a clear face photo</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

              {/* Style */}
              <label className="block text-sm font-semibold text-gray-700 mt-5 mb-2">2. Choose a style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${style === s.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Background */}
              <label className="block text-sm font-semibold text-gray-700 mt-5 mb-2">3. Choose a background</label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map((b) => (
                  <button key={b.id} onClick={() => setBackground(b.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${background === b.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {b.label}
                  </button>
                ))}
              </div>

              <button onClick={generate} disabled={generating || !photo}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating… (~15s)</> : <><Wand2 className="h-4 w-4" /> Generate Headshot</>}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">Tip: try different styles & backgrounds — each generates a new variation.</p>
            </div>

            {/* Results gallery */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-blue-600" /> Your Headshots</h2>
              {results.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center text-gray-400">
                  <Sparkles className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Generated headshots will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {results.map((r, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200">
                      <img src={r.url} alt={`headshot ${i}`} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white">{styleLabel(r.style)}</span>
                        <a href={r.url} download={`headshot-${i + 1}.png`} className="text-white bg-blue-600 rounded-full p-1.5"><Download className="h-3.5 w-3.5" /></a>
                      </div>
                    </div>
                  ))}
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
