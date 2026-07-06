"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Target, Zap, Bell, 
  ShieldCheck, Heart, Sparkles, CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const CandidateFeatures = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const features = [
    { 
      icon: <FileText className="w-6 h-6" />, 
      title: "AI-Powered Resume Builder", 
      desc: "Generate industry-specific resumes using our neural engine that highlights your strengths based on real-time market demand." 
    },
    { 
      icon: <Target className="w-6 h-6" />, 
      title: "Deep ATS Analysis", 
      desc: "Receive a comprehensive score out of 100 with actionable feedback to bypass Applicant Tracking Systems used by Fortune 500 companies." 
    },
    { 
      icon: <Zap className="w-6 h-6" />, 
      title: "Neural Job Matching", 
      desc: "Our algorithm matches your specific skill set with high-salary roles, cutting your job search time by up to 60%." 
    },
    { 
      icon: <Bell className="w-6 h-6" />, 
      title: "Real-time Pulse Alerts", 
      desc: "Get notified the millisecond a job matching your profile is posted. Stay ahead of the competition every time." 
    },
    { 
      icon: <ShieldCheck className="w-6 h-6" />, 
      title: "Verified Opportunities", 
      desc: "Every listing undergoes a 3-step verification process to ensure zero scams and high-quality employers." 
    },
    { 
      icon: <Heart className="w-6 h-6" />, 
      title: "Application Lifecycle", 
      desc: "A central command center to track every stage of your application—from 'Applied' to 'Interview' to 'Offered'." 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-8">
            <Sparkles size={16} /> EMPOWERING CAREERS
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            The Smartest Way to <br/><span className="text-indigo-500">Land Your Dream Job.</span>
          </motion.h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Enterprise-grade tools designed to help you stand out, get noticed, and secure your next big role with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
              Start Building Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 pb-24 relative z-20">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8 }} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-200 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default CandidateFeatures;