//src/app/user/service/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Building2, Phone, IndianRupee, Tag, ShieldCheck, Info, MessageCircle, Star, X, User } from 'lucide-react';
import UserSidebar from "@/components/UserSidebar";
import { useSession } from "next-auth/react";

// રેટિંગ બતાવવા માટે નાનું કોમ્પોનન્ટ
const RatingStars = ({ rating, count }) => (
  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
    <Star size={14} className="fill-amber-400 text-amber-400" />
    <span className="text-amber-700 font-black text-[12px]">{rating > 0 ? Number(rating).toFixed(1) : "New"}</span>
    <span className="text-amber-400/50 text-[10px]">|</span>
    <span className="text-amber-600/70 font-bold text-[10px]">{count || 0} reviews</span>
  </div>
);

export default function CandidateServiceView() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // New State for fetching existing reviews
  const [existingReviews, setExistingReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/serviceprovider/serviceform?all=true', { cache: "no-store" });
      const data = await res.json();
      const rawServices = data.success ? (data.services || []) : [];

      let promotedServices = [];
      try {
        const promoRes = await fetch('/api/advertising/promoted-services', { cache: "no-store" });
        const promoData = await promoRes.json();
        if (promoData.success && Array.isArray(promoData.services)) {
          promotedServices = promoData.services;
        }
      } catch (e) {
        console.error("Promoted services fetch error:", e);
      }

      const promoOrder = new Map(promotedServices.map((p) => [p.serviceId, p.sortOrder]));

      const activeServices = rawServices
        .map((service) => {
          const id = String(service._id);
          const promo = promotedServices.find((p) => p.serviceId === id);
          if (promo) {
            return {
              ...service,
              isPromoted: true,
              promotedPlanTitle: promo.planTitle,
            };
          }
          return service;
        })
        .sort((a, b) => {
          const aId = String(a._id);
          const bId = String(b._id);
          const aRank = promoOrder.has(aId) ? promoOrder.get(aId) : Number.MAX_SAFE_INTEGER;
          const bRank = promoOrder.has(bId) ? promoOrder.get(bId) : Number.MAX_SAFE_INTEGER;
          if (aRank !== bRank) return aRank - bRank;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

      setServices(activeServices);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  // રિવ્યુ ફેચ કરવાનું ફંક્શન
  const fetchProviderReviews = async (providerEmail) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/reviews?targetId=${providerEmail}&reviewType=service`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setExistingReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleWhatsAppContact = (service) => {
    let phone = (service.whatsappNumber || service.providerMobile).toString().replace(/\D/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    const messageText = `Hello ${service.providerName},%0A%0AI saw your service *${service.title}* on the portal.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${messageText}`;
    window.open(whatsappUrl, '_blank');
  };

  // રિવ્યુ સબમિટ કરવાનું ફંક્શન
  const submitReview = async (e) => {
    e.preventDefault();
    if (!session) return alert("Please login to write a review");
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: selectedService.providerEmail,
          reviewerId: session.user.email,
          reviewerName: session.user.name || "User",
          targetType: "provider",
          rating,
          comment,
          reviewType: "service"
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Review submitted successfully! ✨");
        setComment("");
        setRating(5);
        fetchProviderReviews(selectedService.providerEmail); // લિસ્ટ રિફ્રેશ કરો
        fetchServices(); // મેઈન પેજ પર રેટિંગ અપડેટ કરો
      }
    } catch (err) {
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <UserSidebar />

      <main className="flex-1 lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Available Services</h1>
            <p className="text-slate-500 font-medium mt-2">Explore expert services provided by our verified partners.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service._id} className="bg-white rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                  <div className="p-6 pb-0 flex justify-between items-start flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={12} /> {service.category}
                      </span>
                      {service.isPromoted && (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-emerald-600 font-black text-xl">
                      <IndianRupee size={20} />
                      <span>{service.price}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1">
                    <div className="mb-3">
                       <RatingStars rating={service.averageRating} count={service.reviewCount} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors truncate">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50/50 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      {service.providerLogo ? (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0 shadow-sm">
                          <img src={service.providerLogo} alt="provider logo" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                          {service.providerName?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Provider</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{service.providerName}</p>
                      </div>
                      <ShieldCheck size={18} className="text-emerald-500" />
                    </div>
                  </div>

                  <div className="px-6 pb-6 mt-auto space-y-2">
                    <button 
                      onClick={() => handleWhatsAppContact(service)}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <MessageCircle size={20} /> Contact
                    </button>
                    
                    <button 
                      onClick={() => {
                        setSelectedService(service);
                        setShowModal(true);
                        fetchProviderReviews(service.providerEmail); // મોડલ ખુલતા જ રિવ્યુ લોડ કરો
                      }}
                      className="w-full py-3 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-2"
                    >
                      <Star size={14} /> Reviews & Ratings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal (Read + Write) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300 my-8">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10">
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Display Existing Reviews */}
              <div className="p-8 border-r border-slate-100 bg-slate-50/50 rounded-l-[40px]">
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                   Reviews
                </h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {loadingReviews ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
                  ) : existingReviews.length > 0 ? (
                    existingReviews.map((rev) => (
                      <div key={rev._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{rev.reviewerName}</span>
                          <div className="flex items-center text-amber-400">
                             <Star size={10} className="fill-current"/> 
                             <span className="text-[10px] font-bold ml-1 text-slate-700">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-400 text-sm font-bold italic">No reviews yet.</div>
                  )}
                </div>
              </div>

              {/* Right Side: Write New Review */}
              <div className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Rate Service</h2>
                <p className="text-slate-500 text-xs mb-6 font-medium">Share your experience with others.</p>

                <form onSubmit={submitReview} className="space-y-6">
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={32} 
                          className={`${num <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    placeholder="Write your feedback here..."
                    className="w-full p-4 bg-slate-50 rounded-[20px] outline-none font-medium text-slate-700 text-sm min-h-[120px] border border-transparent focus:border-indigo-100 transition-all"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
