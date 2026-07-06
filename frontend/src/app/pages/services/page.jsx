
"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, IndianRupee, Tag, ShieldCheck, Star, ArrowRight, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';


export default function PublicServiceExplorer() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/serviceprovider/serviceform?all=true');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  // કોઈપણ એક્શન પર લોગિન પર મોકલી દેશે
  const handleProtectedAction = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-slate-900 py-20 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6">
            Expert <span className="text-indigo-400">Services</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Explore our curated list of professional service providers. Login to connect and book your service.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service) => (
              <div 
                key={service._id} 
                onClick={handleProtectedAction}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Overlay on hover to show Lock icon */}
                <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                        <Lock className="text-indigo-600" size={24} />
                    </div>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {service.category}
                  </span>
                  <div className="flex items-center text-emerald-600 font-black text-xl">
                    <IndianRupee size={18} />
                    <span>{service.price}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Star size={14} className="fill-amber-400 text-amber-400" />
                     <span className="text-slate-900 font-black text-xs">{service.averageRating || "New"}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 italic leading-tight group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                      {service.providerName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</p>
                      <p className="text-sm font-bold text-slate-800">{service.providerName}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Call to Action */}
      <section className="bg-slate-50 py-20 px-6 text-center">
         <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-6 italic">Want to access these services?</h2>
            <button 
              onClick={() => router.push('/login')}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
            >
              Login to Get Started
            </button>
         </div>
      </section>
      <Footer/>
    </div>
  );
}