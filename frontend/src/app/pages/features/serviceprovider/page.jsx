"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Microscope, GraduationCap, Trophy, 
  Video, Calendar, CreditCard, 
  Users, Layers, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const ProviderFeatures = () => {
  const features = [
    { icon: <Microscope />, title: "Virtual Interview Suite", desc: "Proprietary video infrastructure designed specifically for technical mock interviews and live feedback." },
    { icon: <GraduationCap />, title: "LMS Integration", desc: "A robust Learning Management System to host videos, documents, and interactive coding challenges." },
    { icon: <Trophy />, title: "Certified Assessment", desc: "Issuance of blockchain-verified certificates that candidates can display directly on their profiles." },
    { icon: <Calendar />, title: "Smart Scheduling", desc: "Sync with Google/Outlook calendars to automate 1-on-1 mentorship bookings without the back-and-forth." },
    { icon: <Layers />, title: "Candidate Analytics", desc: "Detailed reports on student progress, identifying top performers for potential recruiter referrals." },
    { icon: <CreditCard />, title: "Automated Billing", desc: "Global payment gateway integration to monetize your courses and coaching sessions seamlessly." }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="bg-amber-500 pt-32 pb-40 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/10 mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            Scale Your <br/>Training <span className="text-slate-900">Empire.</span>
          </h1>
          <p className="text-amber-50 font-medium text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            The infrastructure you need to host, manage, and monetize your career coaching or technical training business.
          </p>
          <Link href="/register" className="px-12 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all">
            Apply as Provider
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.02 }} className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/60 border-b-4 border-amber-500">
              <div className="text-amber-500 mb-6">
                {React.cloneElement(item.icon, { size: 40, strokeWidth: 1.5 })}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProviderFeatures;