"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Search, Layout, Users, 
  BarChart3, MessageSquare, Zap, Target,
  ArrowRight, Globe
} from 'lucide-react';
import Link from 'next/link';

const RecruiterFeatures = () => {
  const features = [
    { icon: <Briefcase />, title: "Precision Job Posting", desc: "Automate technical job descriptions with AI tailored to your company's unique culture and requirements." },
    { icon: <Globe />, title: "Global Talent Pool", desc: "Access a curated database of 500k+ active candidates filtered by verified technical assessments." },
    { icon: <Layout />, title: "Advanced ATS Integration", desc: "Streamline your pipeline from initial screening to digital offer letters in one unified workspace." },
    { icon: <BarChart3 />, title: "Hiring Intelligence", desc: "Data-driven insights into your time-to-hire, cost-per-hire, and recruiter performance metrics." },
    { icon: <Users />, title: "Collaborative Hiring", desc: "Shared interview scorecards and feedback loops to ensure your team stays aligned on every hire." },
    { icon: <Target />, title: "Proactive Sourcing", desc: "Let our AI scout for passive talent that fits your profile, even if they haven't applied yet." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-emerald-950 pt-32 pb-40 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-black tracking-widest uppercase text-xs mb-6">
            Enterprise Recruitment Solutions
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            Find Your Next <br/><span className="text-emerald-400">Rockstar Candidate.</span>
          </h1>
          <p className="text-emerald-100/60 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Stop searching and start hiring. Our platform automates the tedious parts of recruiting so you can focus on building your team.
          </p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40">
            Request Demo <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <motion.div key={idx} whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-emerald-900/5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8">
                {React.cloneElement(item.icon, { size: 30 })}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecruiterFeatures;