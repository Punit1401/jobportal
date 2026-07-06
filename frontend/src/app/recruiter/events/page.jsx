"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Calendar, Clock, MapPin, Video, Users, Plus, ChevronRight, Bell } from 'lucide-react';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/recruiter/events');
        const data = await res.json();
        if (data.ok) {
          const categorized = data.data.map(e => ({
            ...e,
            category: new Date(e.date) > new Date() ? 'upcoming' : 'past'
          }));
          setEvents(categorized);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleHostEvent = () => {
    alert("Opening the Event Setup wizard. You can now configure your live webinars or hiring events.");
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <RecruiterSidebar activePage="events" />
      
      <main className="flex-1 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Events & Activities</h1>
              <p className="text-slate-500 font-medium mt-1">Manage your recruitment events and schedule.</p>
            </div>
            <button 
              onClick={handleHostEvent}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
            >
              <Plus size={20} />
              Host New Event
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100">
                <Bell size={32} className="text-indigo-600 mb-4" />
                <h4 className="text-4xl font-black text-indigo-900">{events.filter(e => e.category === 'upcoming').length}</h4>
                <p className="text-indigo-600 font-bold mt-1">Upcoming Events</p>
            </div>
            <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100">
                <Users size={32} className="text-emerald-600 mb-4" />
                <h4 className="text-4xl font-black text-emerald-900">{events.reduce((acc, curr) => acc + (curr.attendees?.length || 0), 0)}</h4>
                <p className="text-emerald-600 font-bold mt-1">Total Attendees</p>
            </div>
            <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100">
                <Video size={32} className="text-amber-600 mb-4" />
                <h4 className="text-4xl font-black text-amber-900">{events.filter(e => e.type === 'Online').length}</h4>
                <p className="text-amber-600 font-bold mt-1">Webinars Scheduled</p>
            </div>
          </div>

          {/* Tabs & List */}
          <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-100 pb-2">
                {["upcoming", "past", "saved"].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.filter(e => e.category === activeTab).length > 0 ? events.filter(e => e.category === activeTab).map((event) => (
                    <div key={event._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-slate-50 rounded-[20px] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    {event.type === "Online" || event.type === "Webinar" ? <Video size={24} /> : <MapPin size={24} />}
                                </div>
                                <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {event.type}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{event.title}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-6">{event.description || event.desc}</p>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Calendar size={16} className="text-indigo-500" />
                                    {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Clock size={16} className="text-indigo-500" />
                                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <MapPin size={16} className="text-indigo-500" />
                                        {event.location}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center -space-x-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-[10px] font-bold">U</div>
                                ))}
                                <div className="text-xs font-bold text-slate-400 ml-4">+{event.attendees?.length || 0} Registered</div>
                            </div>
                            <button className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="lg:col-span-2 p-20 text-center text-slate-400 font-bold border-4 border-dashed border-slate-100 rounded-[40px]">No {activeTab} events found. Schedule one now!</div>
                )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
