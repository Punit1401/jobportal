"use client";
import React, { useState } from 'react';
import NavBar from '@/components/Navbar';
import { Plus, Minus, HelpCircle, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

const faqData = [
  {
    question: "What is the Expert Network?",
    answer: "The Expert Network is a premium ecosystem connecting industry professionals with ambitious candidates for 1-on-1 career mentorship and specialized interview preparation."
  },
  {
    question: "How do I register as a Service Provider?",
    answer: "Professionals can apply through our dedicated registration portal. You will need to complete your profile and provide necessary identification for our vetting process."
  },
  {
    question: "Is there a verification process?",
    answer: "Yes, to maintain quality, our team reviews all provider applications. Document verification (Aadhar/PAN) is typically processed within 24 to 48 hours."
  },
  {
    question: "How can I book a session with an expert?",
    answer: "You can browse experts by domain, view their ratings and experience, and schedule a direct session through our real-time availability calendar."
  },
  {
    question: "What are the payment terms?",
    answer: "We ensure secure transaction processing. Payments are held in escrow and released to experts immediately after successful session delivery."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`mb-4 rounded-3xl border transition-all duration-500 transform-gpu ${
      isOpen ? 'border-indigo-200 bg-indigo-50/30 shadow-sm' : 'border-slate-100 bg-white hover:border-indigo-100'
    }`}>
      <button 
        onClick={onClick}
        className="w-full py-6 px-6 md:px-8 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-indigo-600' : 'text-slate-800'}`}>
          {question}
        </span>
        <div className={`shrink-0 ml-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 transform-gpu ${
          isOpen ? 'bg-indigo-600 text-white rotate-180 shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400'
        }`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      
      <div 
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[grid-template-rows,opacity] ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 md:px-8 pb-8 text-slate-500 font-medium leading-relaxed max-w-3xl">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar />
      
      {/* Header */}
      <div className="relative pt-32 pb-48 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4F46E5 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-indigo-300 text-[11px] font-black uppercase tracking-[0.2em]">Support Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            How can we <span className="text-indigo-400 italic">help?</span>
          </h1>
        </div>
      </div>

      {/* FAQs List */}
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20 mb-40">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 md:p-10">
          <div className="flex items-center gap-3 mb-10 px-4">
            <HelpCircle className="text-indigo-600" size={24} />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">General Questions</h2>
          </div>

          <div className="space-y-1">
            {faqData.map((item, index) => (
              <FAQItem 
                key={index}
                {...item}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-slate-900 rounded-[35px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold tracking-tight">Still have questions?</h3>
            <p className="text-slate-400 mt-1 font-medium">We're here to help you 24/7.</p>
          </div>
          <button className="relative z-10 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 group shadow-xl shadow-indigo-500/20">
            Contact Support <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  );
}