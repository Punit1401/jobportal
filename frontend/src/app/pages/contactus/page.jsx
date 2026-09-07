"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ShieldCheck, RefreshCw, Loader2, MessageSquare } from 'lucide-react'; 
import Footer from '@/components/Footer';

const ContactPage = () => {
  const [showOtpField, setShowOtpField] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "", 
    subject: "General Inquiry",
    message: ""
  });

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter email first");
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "send-otp", email })
      });
      if (res.ok) {
        setShowOtpField(true);
        setTimer(60);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send OTP");
      }
    } catch (err) {
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "verify-otp", email, otp })
      });
      if (res.ok) {
        setIsEmailVerified(true);
        setShowOtpField(false);
      } else {
        const data = await res.json();
        alert(data.error || "Invalid OTP");
      }
    } catch (err) {
      alert("Verification error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) return;
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "submit-form", email, formData })
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Submission failed");
        setLoading(false);
        return;
      }
      alert("Message sent successfully!");
      setFormData({ name: "", mobile: "", subject: "General Inquiry", message: "" });
      setEmail("");
      setIsEmailVerified(false);
    } catch (err) {
      alert("Submission error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // translate-z-0 and will-change-transform helps in GPU acceleration
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 py-20 px-4 overflow-x-hidden transform-gpu">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold tracking-wide uppercase"
          >
            Contact Support
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Conversation</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Have a question or just want to say hi? We'd love to hear from you. 
            Fill out the form below and our team will get back to you shortly.
          </motion.p>
        </div>

        <div className="flex justify-center items-center relative">
          {/* Optimized Decorative background blobs with will-change */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none will-change-transform"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none will-change-transform delay-1000"></div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative z-10 will-change-transform"
          >
            <form onSubmit={handleSubmitForm} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div className="space-y-2.5">
                  <label htmlFor="fullNameId" className="text-sm font-bold text-slate-700 ml-2">Full Name <span className="text-rose-500">*</span></label>
                  <input 
                    id="fullNameId"
                    type="text" 
                    placeholder="Enter your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-700 ml-2">Mobile Number <span className="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    placeholder="Enter mobile number"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="md:col-span-2 space-y-2.5">
                  <label className="text-sm font-bold text-slate-700 ml-2">Email Address <span className="text-rose-500">*</span></label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="name@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isEmailVerified || loading}
                      className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${isEmailVerified ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 font-semibold' : ''}`}
                    />
                    {!isEmailVerified && !showOtpField && (
                      <button 
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || !email}
                        className="absolute right-2.5 top-2.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-300"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                      </button>
                    )}
                    {isEmailVerified && (
                      <div className="absolute right-4 top-4 text-emerald-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100">
                        <ShieldCheck size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Section */}
              <AnimatePresence mode="wait">
                {showOtpField && !isEmailVerified && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl space-y-5 overflow-hidden will-change-transform"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="opacity-80" />
                        <label className="font-bold tracking-tight">Security Code <span className="text-rose-300">*</span></label>
                      </div>
                      <div className="text-xs font-medium bg-white/10 px-3 py-1 rounded-full">
                        {timer > 0 ? `Resend in ${timer}s` : (
                           <button type="button" onClick={handleSendOtp} className="font-bold underline underline-offset-4">Resend Code</button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:bg-white focus:text-indigo-600 outline-none transition-all text-center text-2xl tracking-[0.4em] font-black"
                      />
                      <button 
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || loading}
                        className="px-8 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirm"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-700 ml-2">Subject <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>General Inquiry</option>
                    <option>Recruiter Support</option>
                    <option>Candidate Help</option>
                    <option>Partnership</option>
                  </select>
                  <MessageSquare size={18} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-700 ml-2">Message <span className="text-rose-500">*</span></label>
                <textarea 
                  rows="4" 
                  placeholder="How can we help you today?"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
                ></textarea>
              </div>

              <div className="pt-4">
                <motion.button 
                  whileHover={isEmailVerified ? { scale: 1.01 } : {}}
                  whileTap={isEmailVerified ? { scale: 0.99 } : {}}
                  type="submit"
                  disabled={!isEmailVerified || loading}
                  className={`w-full py-5 font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-3 relative overflow-hidden ${isEmailVerified ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <span className="relative z-10 text-lg">{loading ? "Sending..." : "Send Message"}</span>
                  {!loading && <Send size={20} className="relative z-10" />}
                  {isEmailVerified && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>}
                </motion.button>
                
                {!isEmailVerified && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center mt-5">
                    Verify Email to unlock
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;