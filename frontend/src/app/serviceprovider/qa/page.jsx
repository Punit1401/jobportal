"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Loader2, MessageCircleQuestion, Send, Star } from 'lucide-react';
import Serviceprovidersidbar from "@/components/Serviceprovidersidbar";

export default function ProviderQAPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [answerInputs, setAnswerInputs] = useState({});
  const [submittingIds, setSubmittingIds] = useState(new Set());

  useEffect(() => {
    fetchQuestions();

    const refreshOnFocus = () => {
      fetchQuestions();
    };

    const intervalId = setInterval(fetchQuestions, 30000);
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/qa/questions', {
        cache: "no-store"
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (e, questionId) => {
    e.preventDefault();
    const answerText = answerInputs[questionId];
    if (!answerText?.trim() || !session?.user) return;
    
    setSubmittingIds(prev => new Set(prev).add(questionId));
    try {
      const res = await fetch('/api/qa/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          providerEmail: session.user.email,
          providerName: session.user.name || "Provider",
          answerText
        })
      });
      const data = await res.json();
      if (data.success) {
        setAnswerInputs(prev => ({ ...prev, [questionId]: "" }));
        fetchQuestions(); // Refresh feed
      } else {
        alert(data.error || "Failed to post answer");
      }
    } catch (err) {
      alert("Error posting answer");
    } finally {
      setSubmittingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const isAnsweredByMe = (q) => {
    if (!session?.user) return false;
    return q.answers?.some(a => a.providerEmail === session.user.email);
  };

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <Serviceprovidersidbar activePage="qa" />

      <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
        <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-6xl mx-auto space-y-8 pb-20">
          
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <MessageCircleQuestion className="text-indigo-600" size={40} /> User Questions
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Browse questions asked by users and share your expertise to build trust.
            </p>
          </header>

          {/* Questions Feed */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                  <p className="text-slate-500 font-medium">No questions asked yet.</p>
                </div>
              ) : (
                questions.map((q) => {
                  const answered = isAnsweredByMe(q);
                  
                  return (
                    <div key={q._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                          {q.userName?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-slate-900">{q.userName}</p>
                            <p className="text-xs text-slate-400 font-medium">
                              {new Date(q.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-slate-700 font-semibold text-lg mb-6 leading-snug">
                            {q.questionText}
                          </p>

                          {/* Existing Answers */}
                          {q.answers && q.answers.length > 0 && (
                            <div className="space-y-4 pl-4 sm:pl-8 border-l-2 border-indigo-100 mb-6">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Answers ({q.answers.length})</h4>
                              {q.answers.map((ans, idx) => (
                                <div key={ans._id || idx} className={`bg-slate-50 rounded-2xl p-4 border ${ans.providerEmail === session?.user?.email ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="text-sm font-bold text-slate-900">{ans.providerName}</p>
                                    {ans.providerEmail === session?.user?.email && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">You</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 font-medium">
                                    {ans.answerText}
                                  </p>

                                  {ans.rating > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">
                                          <Star size={10} className="fill-amber-400 text-amber-400" />
                                          {ans.rating} / 5
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">User Rating</p>
                                      </div>
                                      {ans.reviewComment && (
                                        <p className="text-sm text-slate-700 italic">"{ans.reviewComment}"</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Answer Input */}
                          {!answered ? (
                            <form onSubmit={(e) => handlePostAnswer(e, q._id)} className="mt-4 flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0 mt-1">
                                {session?.user?.name?.charAt(0) || "P"}
                              </div>
                              <div className="flex-1 relative">
                                <textarea
                                  value={answerInputs[q._id] || ""}
                                  onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q._id]: e.target.value }))}
                                  placeholder="Write your answer..."
                                  required
                                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[60px] font-medium text-slate-700 text-sm"
                                />
                                <button
                                  type="submit"
                                  disabled={submittingIds.has(q._id)}
                                  className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                  {submittingIds.has(q._id) ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                              <span className="font-bold text-sm">✅ You have already answered this question.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
