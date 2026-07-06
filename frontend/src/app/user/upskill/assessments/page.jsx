"use client";
import React, { useState } from "react";
import { ClipboardCheck, Sparkles, Trophy, AlertCircle, Loader2, ArrowRight, CheckCircle2, XCircle, RotateCcw, Brain } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';

export default function AssessmentsPage() {
    const [skill, setSkill] = useState("");
    const [level, setLevel] = useState("Intermediate");
    const [loading, setLoading] = useState(false);
    const [testData, setTestData] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const startAssessment = async (e) => {
        if (e) e.preventDefault();
        if (!skill) return alert("Please enter a skill or job role.");

        setLoading(true);
        setTestData(null);
        setUserAnswers({});
        setShowResults(false);

        try {
            const res = await fetch("/api/ai/assessment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill, level }),
            });
            const data = await res.json();
            if (data.success) {
                setTestData(data);
            } else {
                alert(data.error || "Failed to start assessment.");
            }
        } catch (error) {
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (qIdx, option) => {
        if (showResults) return;
        setUserAnswers(prev => ({ ...prev, [qIdx]: option }));
    };

    const calculateScore = () => {
        let score = 0;
        testData.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) score++;
        });
        return score;
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-5xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                                <Brain size={14} className="text-indigo-600" />
                                <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">AI Skill Validator</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                Assessments & Tests
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Validate your expertise with AI-generated technical tests. Get instant feedback and identify areas for improvement.
                            </p>
                        </div>
                    </div>

                    {!testData ? (
                        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                            <form onSubmit={startAssessment} className="max-w-2xl mx-auto space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ClipboardCheck className="text-indigo-600" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">What do you want to be tested on?</h3>
                                    <p className="text-slate-500">Enter a skill like 'React', 'Python', or a role like 'Project Manager'.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Skill / Job Role</label>
                                        <input 
                                            type="text"
                                            value={skill}
                                            onChange={(e) => setSkill(e.target.value)}
                                            placeholder="e.g. Node.js Development"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Difficulty Level</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {["Beginner", "Intermediate", "Advanced"].map((l) => (
                                                <button
                                                    key={l}
                                                    type="button"
                                                    onClick={() => setLevel(l)}
                                                    className={`py-3 rounded-xl font-bold text-sm border transition-all ${level === l ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !skill}
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="animate-spin" size={20} /> Generating Test...</>
                                    ) : (
                                        <><Sparkles size={20} className="text-indigo-400" /> Start Assessment</>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
                                    <h3 className="text-2xl font-black text-slate-900">{testData.testTitle}</h3>
                                    {!showResults && (
                                        <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold text-sm">
                                            {Object.keys(userAnswers).length} / {testData.questions.length} Answered
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-12">
                                    {testData.questions.map((q, idx) => (
                                        <div key={idx} className="space-y-6">
                                            <div className="flex gap-4">
                                                <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">{idx + 1}</span>
                                                <p className="text-xl font-bold text-slate-800 pt-1 leading-relaxed">{q.question}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                                                {q.options.map((option, oIdx) => {
                                                    const isSelected = userAnswers[idx] === option;
                                                    const isCorrect = option === q.correctAnswer;
                                                    const isWrong = isSelected && !isCorrect;

                                                    let btnClass = "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 hover:border-slate-200";
                                                    if (showResults) {
                                                        if (isCorrect) btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100";
                                                        else if (isWrong) btnClass = "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-100";
                                                        else if (isSelected) btnClass = "bg-slate-200 border-slate-300 opacity-50";
                                                        else btnClass = "bg-white border-slate-100 text-slate-400 opacity-50";
                                                    } else if (isSelected) {
                                                        btnClass = "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100";
                                                    }

                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            disabled={showResults}
                                                            onClick={() => handleAnswerSelect(idx, option)}
                                                            className={`p-5 rounded-2xl border text-left font-bold transition-all flex justify-between items-center group ${btnClass}`}
                                                        >
                                                            <span>{option}</span>
                                                            {showResults && isCorrect && <CheckCircle2 size={18} />}
                                                            {showResults && isWrong && <XCircle size={18} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {showResults && (
                                                <div className="pl-14 pt-2 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4">
                                                        <AlertCircle className="text-indigo-600 shrink-0" size={20} />
                                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                                            <span className="font-black text-slate-900 block mb-1">Explanation:</span>
                                                            {q.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!showResults ? (
                                    <div className="mt-16 pt-10 border-t border-slate-100 text-center">
                                        <button
                                            onClick={() => setShowResults(true)}
                                            disabled={Object.keys(userAnswers).length < testData.questions.length}
                                            className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-30 flex items-center justify-center gap-3 mx-auto"
                                        >
                                            Submit Assessment <ArrowRight size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-16 pt-10 border-t border-slate-100">
                                        <div className="bg-slate-900 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                            <div className="relative z-10 text-center md:text-left">
                                                <h4 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-3">Assessment Summary</h4>
                                                <p className="text-4xl font-black mb-4">You scored {calculateScore()} out of {testData.questions.length}</p>
                                                <p className="text-slate-400 font-medium text-lg max-w-md">
                                                    {calculateScore() === testData.questions.length 
                                                        ? "Perfect! You have a strong grasp of this topic." 
                                                        : "Great effort! Review the explanations above to strengthen your knowledge."}
                                                </p>
                                            </div>
                                            <div className="relative z-10 flex flex-col gap-4">
                                                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20">
                                                    <Trophy className="text-yellow-400" size={60} />
                                                </div>
                                                <button
                                                    onClick={() => setTestData(null)}
                                                    className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-all"
                                                >
                                                    <RotateCcw size={16} /> Retake Test
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
