"use client";

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Briefcase, ChevronLeft, 
  Send, CheckCircle2, Clock, DollarSign, Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function JobDetailsPage({ params: paramsPromise }) {
  // Next.js 15+ માં params ને 'use' કરવો પડે છે
  const params = use(paramsPromise);
  const { data: session } = useSession();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        const foundJob = data.find(j => j._id === params.id);
        setJob(foundJob);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();

    if (session) {
      fetch("/api/candidates/save-job")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.savedJobs) {
            const saved = data.savedJobs.some(j => j._id === params.id);
            setIsSaved(saved);
          }
        })
        .catch(err => console.error(err));
    }
  }, [params.id, session]);

  const handleSaveJob = async () => {
    if (!session) {
      alert("Please login to save jobs.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/candidates/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: params.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
      } else {
        alert(data.error || "Failed to save job");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-indigo-600 font-black tracking-widest">LOADING DETAILS...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Job not found!</h2>
        <Link href="/careers" className="text-indigo-600 font-bold underline">Back to Careers</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/careers" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Open Roles
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-[3rem] p-8 md:p-14 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                {job.category}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                {job.jobType}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tighter">
              {job.title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} /> Location
                </p>
                <p className="font-bold text-slate-700">{job.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <Briefcase size={12} /> Level
                </p>
                <p className="font-bold text-slate-700">{job.experienceLevel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <DollarSign size={12} /> Salary
                </p>
                <p className="font-bold text-slate-700">{job.salaryRange || "Competitive"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <Clock size={12} /> Deadline
                </p>
                <p className="font-bold text-slate-700">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                About the Role
              </h2>
              <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {job.description}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-8">What you'll need</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.skills?.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <CheckCircle2 size={20} className="text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-700">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-200">
                <h3 className="text-2xl font-black mb-4 tracking-tight">Interested?</h3>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                  We're excited to hear from you! Click below to start your application process.
                </p>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-900/20">
                  Apply Now <Send size={18} />
                </button>
                <button 
                  onClick={handleSaveJob}
                  disabled={saving}
                  className={`w-full mt-4 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
                    isSaved 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                      : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {saving ? "Processing..." : isSaved ? "Saved" : "Save Job"} 
                  <Bookmark size={18} className={isSaved ? "fill-emerald-400" : ""} />
                </button>
                <p className="text-[10px] text-center text-slate-500 uppercase font-black tracking-widest mt-6">
                  Reference: {job._id.toString().slice(-6).toUpperCase()}
                </p>
              </div>

              {/* Share Card */}
              <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                <p className="text-indigo-900 font-black text-sm mb-2">Know someone perfect?</p>
                <p className="text-indigo-700/70 text-xs font-bold mb-0">Share this opportunity with your network.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}