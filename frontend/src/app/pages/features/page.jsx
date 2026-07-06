"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Target, Zap, Search, 
  Briefcase, GraduationCap, Trophy, Layout, 
  CheckCircle2, Sparkles, TrendingUp, Microscope
} from 'lucide-react';

const FeaturesPage = () => {
  const ecosystems = [
    {
      title: "For Candidates",
      tagline: "Land your dream job",
      color: "indigo",
      features: [
        { icon: <FileText />, title: "AI Resume Builder", desc: "Create industry-standard resumes with professional templates." },
        { icon: <Target />, title: "ATS Score Checker", desc: "Get real-time feedback on how well your resume beats the bots." },
        { icon: <Zap />, title: "Instant Apply", desc: "One-click applications to thousands of verified job listings." }
      ]
    },
    {
      title: "For Recruiters",
      tagline: "Hire top-tier talent",
      color: "emerald",
      features: [
        { icon: <Briefcase />, title: "Smart Job Posting", desc: "AI-assisted job descriptions that attract the right candidates." },
        { icon: <Search />, title: "Talent Sourcing", desc: "Advanced filters to find candidates by skill, location, and ATS score." },
        { icon: <Layout />, title: "Hiring Pipeline", desc: "Track applicants from screening to final offer in one dashboard." }
      ]
    },
    {
      title: "For Service Providers",
      tagline: "Upskill the workforce",
      color: "amber",
      features: [
        { icon: <Microscope />, title: "Mock Interviews", desc: "Conduct 1-on-1 sessions to prepare candidates for the big day." },
        { icon: <GraduationCap />, title: "Training Modules", desc: "Host courses, bootcamps, and technical skill certifications." },
        { icon: <Trophy />, title: "Skill Assessments", desc: "Create mock tests and challenges to verify candidate expertise." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-28 pb-40 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6"
          >
            One Platform. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Total Career Control.</span>
          </motion.h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Whether you're building a resume, hiring a team, or providing expert training—we've got the tools to power your growth.
          </p>
        </div>
      </section>

      {/* Main Ecosystem Sections */}
      <section className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-20">
        <div className="space-y-32">
          {ecosystems.map((group, idx) => (
            <div key={idx}>
              <div className="mb-12 text-center md:text-left">
                <span className={`text-${group.color}-600 font-bold tracking-widest uppercase text-sm`}>{group.tagline}</span>
                <h2 className="text-4xl font-black text-slate-900 mt-2">{group.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {group.features.map((feature, fIdx) => (
                  <motion.div
                    key={fIdx}
                    whileHover={{ y: -10 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group transition-all"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-${group.color}-50 text-${group.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(feature.icon, { size: 28 })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unique Selling Point (ATS Focus) */}
      <section className="bg-indigo-600 py-24 px-4 overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold mb-6">
              <Sparkles size={14} /> AI POWERED
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Master the ATS <br/>Ranking Game.</h2>
            <p className="text-indigo-100 text-lg mb-8">
              Don't get lost in the pile. Our AI analyzes your resume against 50+ hiring parameters and gives you an "ATS Score" to ensure you land in the recruiter's shortlist.
            </p>
            <ul className="space-y-4">
              {['Keyword Optimization', 'Format Compatibility', 'Skill Gap Analysis'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold">
                  <CheckCircle2 className="text-indigo-300" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10 relative"
          >
            {/* Mockup of ATS Score */}
            <div className="bg-white rounded-[2rem] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-slate-800">Resume Score</span>
                <span className="text-indigo-600 font-black text-2xl">88/100</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }} 
                  whileInView={{ width: '88%' }} 
                  transition={{ duration: 1.5 }}
                  className="bg-indigo-600 h-full" 
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Keywords Match</span>
                  <span className="text-emerald-500">Perfect</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Readability</span>
                  <span className="text-emerald-500">High</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Training Section Callout */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <TrendingUp className="mx-auto text-indigo-600 mb-6" size={48} />
        <h2 className="text-4xl font-black text-slate-900 mb-6">Not just a job portal, <br/>but a career partner.</h2>
        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
          From the moment you start your first **Mock Test** to the day you sign your **Offer Letter**, we provide the ecosystem you need to succeed.
        </p>
        <button className="px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all">
          Explore Training Modules
        </button>
      </section>
    </div>
  );
};

export default FeaturesPage;