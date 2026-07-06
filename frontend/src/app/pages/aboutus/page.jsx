"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Rocket, Briefcase, ShieldCheck, Globe } from 'lucide-react';
import Footer from '@/components/Footer';
import Link from "next/link";

const AboutUs = () => {
  const stats = [
    { label: "Active Users", value: "100K+", icon: <Users className="text-indigo-600" /> },
    { label: "Companies", value: "500+", icon: <Briefcase className="text-emerald-600" /> },
    { label: "Service Providers", value: "10K+", icon: <Rocket className="text-amber-600" /> },
    { label: "Countries", value: "25+", icon: <Globe className="text-blue-600" /> },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            {...fadeIn}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
          >
            Bridging the Gap Between <br />
            <span className="text-indigo-400">Talent & Opportunity</span>
          </motion.h1>
          <motion.p 
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto"
          >
            We are building the world's most integrated ecosystem for professionals, 
            recruiters, and service providers to connect, collaborate, and grow.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-center"
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Target className="text-indigo-600" /> Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg mb-6">
              Unlike traditional job boards, we believe recruitment is a community effort. 
              Our mission is to empower <b>Candidates</b> to find their dream roles, 
              <b>Recruiters</b> to discover elite talent, and **Service Providers** to offer the specialized support that makes the professional world spin.
            </p>
            <ul className="space-y-4">
              {[
                "AI-driven candidate matching",
                "Verified Service Provider marketplace",
                "Professional networking & social feed"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                  <ShieldCheck className="text-emerald-500" size={20} /> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video bg-indigo-100 rounded-[3rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold">
                 <img
    src="/aboutus img.png"
    alt="Platform UI"
    className="w-full h-full object-cover"
  />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Why Choose Us?</h2>
          <p className="text-slate-500 mt-2">The values that drive our platform.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { title: "Transparency", desc: "No hidden fees for candidates. Real reviews for service providers." },
            { title: "Innovation", desc: "Modern tools for modern recruiters. Integrated ATS and networking." },
            { title: "Community", desc: "A supportive space where professionals help each other thrive." }
          ].map((value, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
              <p className="text-slate-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-indigo-600 rounded-[3rem] p-10 md:p-20 text-center text-white shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to join the future of work?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
             
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
              <Link href="/register"> Join as Candidate </Link>
            </button>
            <button className="bg-indigo-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-950 transition-all">
              <Link href="/recruiter/register">Hire Talent</Link>
            </button>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default AboutUs;