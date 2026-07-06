"use client";
import React, { useState } from "react";
import { MessageCircle, CheckCircle, AlertCircle, Lightbulb, UserCheck, Loader2, ArrowRight, Zap, Target } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';

const COMMON_QUESTIONS = [
    "Tell me about a time you failed.",
    "Describe a situation where you had to work with a difficult colleague.",
    "Tell me about a time you showed leadership.",
    "Describe a time you had to learn something new quickly.",
    "Tell me about your greatest professional achievement.",
    "Custom Question (Type below)"
];

export default function BehavioralCoachingPage() {
    const [selectedQuestion, setSelectedQuestion] = useState(COMMON_QUESTIONS[0]);
    const [customQuestion, setCustomQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleEvaluate = async (e) => {
        if (e) e.preventDefault();
        
        const questionToEvaluate = selectedQuestion === "Custom Question (Type below)" ? customQuestion : selectedQuestion;
        
        if (!questionToEvaluate.trim() || !answer.trim()) {
            return alert("Please provide both a question and your answer.");
        }
        
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch("/api/ai/behavioral-coaching", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: questionToEvaluate, answer }),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult(data);
            } else {
                alert(data.error || "Could not evaluate response.");
            }
        } catch (error) {
            alert("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 8) return "text-emerald-600";
        if (score >= 5) return "text-amber-500";
        return "text-rose-500";
    };

    const getScoreBg = (score) => {
        if (score >= 8) return "bg-emerald-50 border-emerald-200";
        if (score >= 5) return "bg-amber-50 border-amber-200";
        return "bg-rose-50 border-rose-200";
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-6xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 mb-4">
                                <UserCheck size={14} className="text-violet-600" />
                                <span className="text-xs font-bold text-violet-700 tracking-wider uppercase">AI Interview Coach</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Behavioral Coaching
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Master your behavioral interviews using the STAR method. Practice common questions and get instant AI feedback to perfect your delivery.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Practice Form */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <form onSubmit={handleEvaluate} className="space-y-6">
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select a Question</label>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                value={selectedQuestion}
                                                onChange={(e) => setSelectedQuestion(e.target.value)}
                                                className="w-full pl-12 pr-10 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none appearance-none"
                                            >
                                                {COMMON_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {selectedQuestion === "Custom Question (Type below)" && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input 
                                                type="text"
                                                value={customQuestion}
                                                onChange={(e) => setCustomQuestion(e.target.value)}
                                                placeholder="Type your custom behavioral question..."
                                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                            />
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex justify-between items-center">
                                            <span>Your Answer</span>
                                            <span className="text-violet-500 font-bold bg-violet-50 px-2 py-0.5 rounded-md">Use STAR Method</span>
                                        </label>
                                        <textarea
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            rows={8}
                                            placeholder="Situation: ...&#10;Task: ...&#10;Action: ...&#10;Result: ..."
                                            className="w-full p-5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none resize-y leading-relaxed"
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !answer.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-violet-700 hover:-translate-y-1 transition-all shadow-xl shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Analyzing Response...</>
                                        ) : (
                                            <><Zap size={18} /> Evaluate My Answer</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="h-full">
                            {loading ? (
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-violet-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                        <div className="relative bg-white p-5 rounded-full shadow-lg border border-slate-100">
                                            <Loader2 className="animate-spin text-violet-600" size={40} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">Evaluating your answer...</h3>
                                    <p className="text-slate-500 font-medium mt-2 text-sm max-w-xs">
                                        Our AI is assessing your structure, impact, and alignment with the STAR method.
                                    </p>
                                </div>
                            ) : result ? (
                                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                                    
                                    <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50 rounded-t-[2rem]">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Feedback</h3>
                                            <p className="text-slate-500 font-medium text-sm mt-1">Detailed assessment of your response</p>
                                        </div>
                                        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-[4px] shadow-lg shrink-0 bg-white ${getScoreBg(result.score)}`}>
                                            <span className={`text-3xl font-black ${getScoreColor(result.score)} leading-none`}>{result.score}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${getScoreColor(result.score)} opacity-80 mt-1`}>/ 10</span>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                                        
                                        {/* Overall Feedback */}
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                                <MessageCircle size={16} className="text-violet-500" /> Overall Assessment
                                            </h4>
                                            <p className="text-slate-700 font-medium leading-relaxed bg-violet-50/50 p-5 rounded-2xl border border-violet-100/50">
                                                {result.feedback}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Strengths */}
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-emerald-500" /> Strengths
                                                </h4>
                                                <ul className="space-y-3">
                                                    {result.strengths?.map((str, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-sm font-medium text-slate-600 leading-snug">{str}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Improvements */}
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                                    <AlertCircle size={16} className="text-amber-500" /> Areas to Improve
                                                </h4>
                                                <ul className="space-y-3">
                                                    {result.improvements?.map((imp, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            <span className="text-sm font-medium text-slate-600 leading-snug">{imp}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Ideal Pattern */}
                                        <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Target size={100} />
                                            </div>
                                            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-3 flex items-center gap-2 relative z-10">
                                                <Lightbulb size={16} className="text-yellow-400" /> Ideal STAR Structure
                                            </h4>
                                            <p className="text-slate-300 text-sm font-medium leading-relaxed relative z-10">
                                                {result.idealAnswerPattern}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 h-full flex flex-col items-center justify-center text-center border-dashed border-2">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                        <MessageCircle className="text-slate-300" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Coach</h3>
                                    <p className="text-slate-500 font-medium text-sm max-w-sm">
                                        Select a question, type your STAR formatted answer, and let AI provide professional feedback.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
