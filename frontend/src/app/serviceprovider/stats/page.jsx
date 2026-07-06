"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Serviceprovidersidbar';
import { Eye, MessageCircle, Star, TrendingUp, Loader2 } from 'lucide-react';

export default function StatsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/serviceprovider/Inquiry') // આ એન્ડપોઈન્ટમાં હવે ડેશબોર્ડ માટે જરૂરી ડેટા પણ રિટર્ન થતું હોય તે ચેક કરજો 
        .then(res => res.json())
        .then(resData => {
          if (resData.success) setData(resData);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex flex-col lg:flex-row">
      <Sidebar activePage="stats" />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Performance Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Views" value={data?.stats.totalViews} icon={<Eye className="text-blue-600" />} color="bg-blue-50" />
          <StatCard title="Total Leads" value={data?.stats.inquiryCount} icon={<MessageCircle className="text-indigo-600" />} color="bg-indigo-50" />
          <StatCard title="Urgent Work" value={data?.stats.urgentCount} icon={<TrendingUp className="text-red-600" />} color="bg-red-50" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest text-[12px]">Service Popularity (Based on Views)</h3>
          <div className="space-y-8">
            {data?.stats.servicePerformance.length > 0 ? data.stats.servicePerformance.map((service, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-black text-slate-800">{service.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{service.views} Views</p>
                  </div>
                  <p className="text-xs font-black text-indigo-600">{service.percent}%</p>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${service.percent}%` }}></div>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 font-bold italic py-10">Create services to see analytics.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-hover hover:border-indigo-200">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-4xl font-black text-slate-800">{value || 0}</h2>
    </div>
  );
}