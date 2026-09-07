"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, CheckCircle2, Trash2, ChevronDown, ChevronUp, Pencil, IndianRupee, MessageCircle, Phone, Lock, CreditCard, ArrowRight } from 'lucide-react';
import Sidebar from '@/components/Serviceprovidersidbar';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

const ServiceCard = ({ service, onDelete, onEdit, isLocked }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all relative overflow-hidden group ${isLocked ? 'opacity-50 grayscale' : 'hover:shadow-md'}`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider w-fit">{service.category}</span>
          <h3 className="text-xl font-bold text-slate-800 mt-2">{service.title}</h3>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
              <MessageCircle size={14} />
              <span>WA: {service.whatsappNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
              <Phone size={14} />
              <span>Call: {service.providerMobile}</span>
            </div>
          </div>
        </div>
        <span className="text-2xl font-black text-indigo-600">₹{service.price}</span>
      </div>
      <div className="mb-4 relative z-10">
        <div className={`transition-all duration-500 ${isOpen ? 'max-h-60 overflow-y-auto opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <p className="text-slate-500 text-sm font-medium pt-2 pb-4 border-t border-slate-50 mt-2 whitespace-pre-line">{service.description}</p>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-indigo-600 text-[10px] font-black uppercase flex items-center gap-1 mt-2 outline-none">
          {isOpen ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View Details</>}
        </button>
      </div>
      <div className="pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
        <div className="flex flex-col text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>Created On</span>
            <span className="text-slate-600">{new Date(service.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        {!isLocked && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(service)} className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm"><Pencil size={18} /></button>
            <button onClick={() => onDelete(service._id)} className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateService() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [providerInfo, setProviderInfo] = useState({ fullName: '', mobile: '' });
  const [canUseSystem, setCanUseSystem] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    category: '', 
    customCategory: '', 
    price: '', 
    description: '', 
    whatsappNumber: '' 
  });

  useEffect(() => {
    const init = async () => {
      if (session?.user?.email) {
        await fetchProviderDetails(session.user.email);
        const statusRes = await fetch("/api/partner/status", { cache: "no-store" });
        const statusData = await statusRes.json();
        if (statusData.success) {
          setCanUseSystem(!!statusData.access?.canUseSystem);
        }
      }
      fetchServices();
    };
    init();
  }, [session]);

  const fetchProviderDetails = async (email) => {
    try {
      const res = await fetch(`/api/admin/serviceproviders?email=${email}`);
      const data = await res.json();
      if (res.ok && data.providers) {
        const currentProfile = data.providers.find(p => p.email === email);
        if (currentProfile) {
          setProviderInfo({
            fullName: currentProfile.fullName || "",
            mobile: currentProfile.mobile || "",
          });
          
          if (!editingId) {
            setFormData(prev => ({ 
              ...prev, 
              whatsappNumber: currentProfile.whatsappNumber || currentProfile.mobile || '' 
            }));
          }
        }
      }
    } catch (err) { console.error("Profile fetch error:", err); }
    finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/serviceprovider/serviceform');
      const data = await res.json();
      if (data.success) setServices(data.services || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUseSystem) {
      alert("Please complete your profile, get admin verification, and purchase a subscription plan.");
      router.push("/serviceprovider/dashboard");
      return;
    }
    setIsSubmitting(true);
    // ... બાકીનું સબમિટ લોજિક જેવું હતું એવું જ ...
    const finalCategory = formData.category === 'other' ? formData.customCategory : formData.category;
    const payload = {
      id: editingId,
      title: formData.title,
      category: finalCategory,
      price: Number(formData.price),
      description: formData.description,
      whatsappNumber: formData.whatsappNumber, 
      providerName: providerInfo.fullName,
      providerMobile: providerInfo.mobile,   
    };

    try {
      const res = await fetch('/api/serviceprovider/serviceform', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: 'Service Saved! ✨' });
        resetForm();
        fetchServices();
      } else { setStatus({ type: 'error', message: data.error }); }
    } catch (err) { setStatus({ type: 'error', message: 'Error saving data' }); }
    finally { setIsSubmitting(false); setTimeout(() => setStatus({ type: '', message: '' }), 3000); }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      category: '', 
      customCategory: '', 
      price: '', 
      description: '', 
      whatsappNumber: providerInfo.mobile 
    });
    setEditingId(null);
  };

  const handleEditClick = (s) => {
    if (!canUseSystem) return;
    setEditingId(s._id);
    setFormData({ 
        title: s.title, 
        category: ['Cleaning', 'Plumbing'].includes(s.category) ? s.category : 'other', 
        customCategory: ['Cleaning', 'Plumbing'].includes(s.category) ? '' : s.category, 
        price: s.price, 
        description: s.description, 
        whatsappNumber: s.whatsappNumber 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!canUseSystem) return;
    if (confirm("Delete this service?")) {
      await fetch(`/api/serviceprovider/serviceform?id=${id}`, { method: 'DELETE' });
      fetchServices();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFEFF]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFDFF]">
      <Sidebar activePage="serviceform" />
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          
          {!canUseSystem ? (
            <div className="bg-slate-900 rounded-[40px] p-10 text-white mb-12 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6 mx-auto md:mx-0 text-indigo-400 border border-white/10">
                      <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black mb-2 italic">Service Post Locked</h1>
                    <p className="text-slate-400 font-medium max-w-md">Complete your profile, get admin verification, and purchase a subscription plan to publish services.</p>
                  </div>
                  <button onClick={() => router.push('/serviceprovider/dashboard')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl whitespace-nowrap active:scale-95">
                    <ArrowRight size={20} /> Dashboard <ArrowRight size={18} />
                  </button>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 mb-12">
              <h1 className="text-3xl font-black text-slate-900">{editingId ? "Edit Service" : "Create Service"}</h1>
              <div className="flex gap-4 mt-2 mb-6">
                 <p className="text-slate-400 font-bold text-sm italic">Provider: {providerInfo.fullName}</p>
                 <p className="text-slate-400 font-bold text-sm italic">Profile Mob: {providerInfo.mobile}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required placeholder="Service Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input required type="number" placeholder="Price (₹)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="p-4 bg-slate-50 rounded-2xl font-bold outline-none">
                    <option value="">Select Category</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                    <input required placeholder="WhatsApp Number" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full p-4 pl-12 bg-emerald-50 rounded-2xl outline-none font-bold border border-emerald-100" />
                  </div>
                </div>

                {formData.category === 'other' && <input required placeholder="Custom Category" value={formData.customCategory} onChange={(e) => setFormData({...formData, customCategory: e.target.value})} className="w-full p-4 bg-indigo-50 rounded-2xl font-bold outline-none" />}
                
                <textarea required placeholder="Service Description" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none resize-none" />
                
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">
                  {isSubmitting ? "Processing..." : editingId ? "Update Service" : "Publish Service"}
                </button>
                
                {status.message && <div className={`p-4 rounded-xl text-center font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{status.message}</div>}
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
            {services.map(s => (
              <ServiceCard 
                key={s._id} 
                service={s} 
                onDelete={handleDelete} 
                onEdit={handleEditClick} 
                isLocked={!canUseSystem}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}