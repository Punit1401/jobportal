"use client";
import React, { useEffect, useState } from 'react';
import { 
  Calendar, MapPin, Clock, Video, Info, 
  CheckCircle2, XCircle, Loader2, ArrowRight,
  Share2, Bookmark, Bell, Sparkles
} from 'lucide-react';
import RecruiterSidebar from '@/components/RecruiterSidebar.jsx';
import FeatureGuard from '@/components/FeatureGuard';
import { useSession } from "next-auth/react";

export default function RecruiterEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userRole = session?.user?.role || "recruiter";

  useEffect(() => {
    if (userRole) {
      fetchEvents();
      fetchMyInterests();
    }
  }, [userRole]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/admin/events?role=${userRole}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events.filter(e => e.status !== 'Cancelled'));
      }
    } catch (err) { console.error(err); }
  };

  const fetchMyInterests = async () => {
    try {
      const res = await fetch('/api/events/interest');
      const data = await res.json();
      if (data.success) setMyInterests(data.myInterests);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleInterest = async (eventId, response) => {
    try {
      const res = await fetch('/api/events/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, response })
      });
      if (res.ok) fetchMyInterests();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <RecruiterSidebar activePage="events" />

      <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
        <FeatureGuard featureName="Events & Activities">
          <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto pb-20">
            
            <header className="mb-12">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                 <Sparkles size={14} /> Upcoming Events
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Events & Activities</h1>
              <p className="text-slate-500 font-medium text-lg italic max-w-2xl">
                Connect with industry leaders, participate in workshops, and stay ahead in your journey.
              </p>
            </header>

            {loading ? (
               <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <Loader2 size={48} className="animate-spin text-indigo-600" />
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading latest activities...</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {events.map((event) => {
                     const myResponse = myInterests.find(i => i.eventId === event._id)?.response;
                     
                     return (
                        <div key={event._id} className="group bg-white rounded-[48px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all hover:-translate-y-2">
                           <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                              {event.thumbnail ? (
                                 <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90">
                                    <Calendar size={64} className="text-white opacity-20" />
                                  </div>
                              )}
                              <div className="absolute top-6 left-6">
                                 <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                    {event.category}
                                 </span>
                              </div>
                           </div>

                           <div className="p-8">
                              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                              
                              <div className="space-y-3 mb-8">
                                 <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    <Calendar size={16} className="text-indigo-500" />
                                    {new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                 </div>
                                 <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    <MapPin size={16} className="text-indigo-500" />
                                    {event.location}
                                 </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                 <button 
                                   onClick={() => handleInterest(event._id, "Interested")}
                                   className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                     ${myResponse === "Interested" 
                                       ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                                       : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-50"}`}
                                 >
                                    {myResponse === "Interested" ? <CheckCircle2 size={18} /> : null}
                                    {myResponse === "Interested" ? "I am Interested" : "Are you Interested?"}
                                  </button>

                                  <button 
                                    onClick={() => handleInterest(event._id, "Not Interested")}
                                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                      ${myResponse === "Not Interested" 
                                        ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent"}`}
                                  >
                                     {myResponse === "Not Interested" ? <XCircle size={14} /> : null}
                                     Not Interested
                                  </button>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}

            {!loading && events.length === 0 && (
               <div className="py-40 text-center bg-slate-50 rounded-[60px] border border-dashed border-slate-200">
                  <Calendar size={64} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Events Scheduled</h3>
                  <p className="text-slate-300 font-medium mt-2 italic">Check back later for exciting webinars and activities.</p>
               </div>
            )}
          </div>
        </FeatureGuard>
      </main>
    </div>
  );
}
