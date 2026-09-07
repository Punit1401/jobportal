"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Loader2, HelpCircle, MessageSquare, Star, X, User } from 'lucide-react';
import UserSidebar from "@/components/UserSidebar";

export default function UserQAPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Question state
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQ, setSubmittingQ] = useState(false);

  // Review Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchQuestions();
    }
  }, [session]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/qa/questions?userEmail=${session.user.email}`, {
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

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    setSubmittingQ(true);
    try {
      const res = await fetch('/api/qa/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: session.user.email,
          userName: session.user.name || "User",
          questionText: newQuestion
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewQuestion("");
        fetchQuestions();
      }
    } catch (err) {
      alert("Error posting question");
    } finally {
      setSubmittingQ(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/qa/rate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion._id,
          answerId: selectedProvider._id,
          reviewerId: session.user.email,
          reviewerName: session.user.name || "User",
          providerEmail: selectedProvider.providerEmail,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Review submitted successfully! ✨");
        setShowModal(false);
        setComment("");
        setRating(5);
        fetchQuestions(); // Refresh to show rating
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <UserSidebar />

      <main className="flex-1 lg:ml-72 p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <HelpCircle className="text-indigo-600" size={40} /> Ask Experts
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Post your questions here and get answers directly from our verified Service Providers.
            </p>
          </header>

          {/* Post Question Form */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10"></div>
            <form onSubmit={handlePostQuestion}>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What do you want to know?"
                required
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none min-h-[120px] font-medium text-slate-700"
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingQ}
                  className="px-8 py-3.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                  {submittingQ ? <Loader2 className="animate-spin" size={18} /> : "Post Question"}
                </button>
              </div>
            </form>
          </div>

          {/* Questions Feed */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-800">Your Questions</h2>
              {questions.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                  <p className="text-slate-500 font-medium">You haven't asked any questions yet.</p>
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
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

                        {/* Answers Section */}
                        {q.answers && q.answers.length > 0 ? (
                          <div className="space-y-4 pl-4 sm:pl-8 border-l-2 border-indigo-100 mt-4 pt-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Answers</h4>
                            {q.answers.map((ans, idx) => (
                              <div key={ans._id || idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative group">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                      {ans.providerName?.charAt(0) || "P"}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">{ans.providerName}</p>
                                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Expert</p>
                                    </div>
                                  </div>
                                  {(!ans.rating || ans.rating === 0) ? (
                                    <button
                                      onClick={() => {
                                        setSelectedProvider(ans);
                                        setSelectedQuestion(q);
                                        setShowModal(true);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                                    >
                                      <Star size={12} className="fill-amber-400" /> Rate Answer
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                                      <Star size={12} className="fill-amber-400 text-amber-400" />
                                      {ans.rating} Rated
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                  {ans.answerText}
                                </p>
                                
                                {/* Show the review comment if it exists */}
                                {ans.rating > 0 && ans.reviewComment && (
                                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Your Review</p>
                                    <p className="text-sm text-slate-700 italic">"{ans.reviewComment}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pl-4 sm:pl-8 border-l-2 border-slate-100 mt-4 pt-2">
                            <p className="text-sm text-slate-400 font-medium italic">No answers yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200 p-8">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10">
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Rate Provider</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              Rate <span className="font-bold text-slate-700">{selectedProvider?.providerName}</span> based on their answer.
            </p>

            <form onSubmit={submitReview} className="space-y-6">
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      size={36} 
                      className={`${num <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                required
                placeholder="Write your feedback..."
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium text-slate-700 text-sm min-h-[100px] border border-slate-200 focus:border-indigo-500 transition-all"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? <Loader2 className="animate-spin" size={18} /> : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
