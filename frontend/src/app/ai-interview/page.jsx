"use client";

import { useState } from "react";

export default function AIInterview() {
  const [tab, setTab] = useState("mock"); // "mock" or "speech"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mockQuestion, setMockQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [speechText, setSpeechText] = useState("");
  const [speechFeedback, setSpeechFeedback] = useState("");

  // ----------------- Mock Interview -----------------
  const generateMockQuestion = async () => {
    setLoading(true);
    setError("");
    setMockQuestion("");
    setUserAnswer("");
    setFeedback("");

    try {
      const res = await fetch("/api/ai/mock-question");
      if (!res.ok) throw new Error("Failed to get question");
      const data = await res.json();
      setMockQuestion(data.question || "No question generated. Try again.");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer) return;
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/ai/mock-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: mockQuestion, answer: userAnswer }),
      });

      if (!res.ok) throw new Error("Failed to get feedback");
      const data = await res.json();
      setFeedback(data.feedback || "Good answer!");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Speech & Tone Analysis -----------------
  const analyzeSpeech = async () => {
    if (!speechText) return;
    setLoading(true);
    setError("");
    setSpeechFeedback("");

    try {
      const res = await fetch("/api/ai/speech-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speechText }),
      });

      if (!res.ok) throw new Error("Failed to analyze speech");
      const data = await res.json();
      setSpeechFeedback(data.analysis || "Your speech is clear and confident!");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">AI Interview & Speech Coaching</h1>

      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${tab === "mock" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
          onClick={() => setTab("mock")}
        >
          Mock Interview
        </button>
        <button
          className={`px-4 py-2 rounded-md ${tab === "speech" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
          onClick={() => setTab("speech")}
        >
          Speech & Tone Analysis
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      {/* Mock Interview Tab */}
      {tab === "mock" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <button
              onClick={generateMockQuestion}
              disabled={loading}
              className="px-4 py-2 rounded bg-green-600 text-white mb-4"
            >
              {loading ? "Generating..." : mockQuestion ? "Next Question" : "Generate Mock Question"}
            </button>

            {mockQuestion && (
              <div className="p-4 border rounded bg-white mb-4">
                <p className="font-medium">Question:</p>
                <p className="mt-2">{mockQuestion}</p>
              </div>
            )}

            {mockQuestion && (
              <>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={6}
                  placeholder="Type your answer here..."
                  className="w-full p-2 border rounded mb-2"
                />
                <button
                  onClick={submitAnswer}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  {loading ? "Analyzing..." : "Submit Answer"}
                </button>
              </>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Feedback</h3>
            <div className="p-4 border rounded bg-white min-h-[150px]">
              {feedback ? <pre className="whitespace-pre-wrap">{feedback}</pre> : <p className="text-sm text-slate-500">Your feedback will appear here.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Speech & Tone Tab */}
      {tab === "speech" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <textarea
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              rows={10}
              placeholder="Paste your answer to behavioral questions here..."
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={analyzeSpeech}
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              {loading ? "Analyzing..." : "Analyze Speech & Tone"}
            </button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Analysis & Suggestions</h3>
            <div className="p-4 border rounded bg-white min-h-[150px]">
              {speechFeedback ? <pre className="whitespace-pre-wrap">{speechFeedback}</pre> : <p className="text-sm text-slate-500">Analysis will appear here.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
