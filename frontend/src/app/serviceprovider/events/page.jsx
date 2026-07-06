"use client";
import React, { useState, useEffect } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { Calendar, Plus, Clock, MapPin, Users, MoreVertical, Trash2, Edit3, Loader2, Video, CalendarDays, Bookmark, Share2 } from 'lucide-react';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            // Reusing existing events API
            const res = await fetch('/api/recruiter/events');
            const data = await res.json();
            if (data.success) setEvents(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="events" />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-10 pb-20">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Events & Activities</h1>
                            <p className="text-slate-500 font-medium mt-1">Schedule and manage your webinars, client meetings, and workshops.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all"><Plus size={20} /> Create Event</button>
                    </header>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        
                        {/* Mini Calendar Placeholder */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm text-center">
                                <CalendarDays className="mx-auto text-indigo-600 mb-4" size={48} />
                                <h4 className="text-2xl font-black text-slate-900">May 2026</h4>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">4 Events Scheduled</p>
                                <div className="mt-8 grid grid-cols-7 gap-2">
                                    {[...Array(31)].map((_, i) => (
                                        <div key={i} className={`h-8 flex items-center justify-center text-[10px] font-black rounded-lg ${[5, 12, 18, 25].includes(i+1) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{i+1}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
                                <h4 className="text-lg font-black mb-4">Upcoming Next</h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">In 2 hours</p>
                                        <h5 className="font-bold text-sm">Client Strategy Call</h5>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/5 opacity-50">
                                        <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">Tomorrow</p>
                                        <h5 className="font-bold text-sm">Service Webinar</h5>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Events List */}
                        <div className="lg:col-span-3 space-y-6">
                            {loading ? (
                                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></div>
                            ) : events.length > 0 ? events.map((event) => (
                                <div key={event._id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Date Box */}
                                        <div className="bg-indigo-50 text-indigo-600 w-24 h-24 rounded-[32px] flex flex-col items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <span className="text-xs font-black uppercase tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-3xl font-black">{new Date(event.date).getDate()}</span>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${event.type === 'Interview' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{event.type}</span>
                                                    <h3 className="text-2xl font-black text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600"><Edit3 size={18} /></button>
                                                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs bg-slate-50/50 p-4 rounded-2xl">
                                                    <Clock size={16} /> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs bg-slate-50/50 p-4 rounded-2xl truncate">
                                                    <MapPin size={16} /> {event.location || "Online Meeting"}
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs bg-slate-50/50 p-4 rounded-2xl">
                                                    <Users size={16} /> {event.attendees?.length || 0} Attendees
                                                </div>
                                            </div>

                                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">{event.description || "No additional description for this event."}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 text-center bg-white rounded-[50px] border-4 border-dashed border-slate-100">
                                    <Calendar size={64} className="mx-auto text-slate-200 mb-6" />
                                    <h3 className="text-2xl font-black text-slate-400">Your schedule is empty.</h3>
                                    <p className="text-slate-400 font-bold mt-2">Time to plan your next big event!</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
