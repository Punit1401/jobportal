"use client";
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, IndianRupee, Calendar, Clock, Edit2, 
  Trash2, Users, Loader2, ChevronDown, ChevronUp, AlignLeft, 
  ListChecks, X, Send
} from 'lucide-react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { useSession } from "next-auth/react"; // Session ચેક કરવા માટે ઉમેર્યું

export default function ManageJobs() {
  const { data: session } = useSession(); // લોગિન થયેલ રિક્રુટરનો ડેટા મેળવવા
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    // જો સેશન ન હોય તો ડેટા ફેચ ન કરવો
    if (!session?.user) return;

    try {
      setLoading(true);
      // રિક્રુટરના પોતાના જ ડેટા મળે તે માટે સેશન દ્વારા API કોલ
      const res = await fetch("/api/recruiter/jobs/post");
      const data = await res.json();
      
      if (res.ok) {
        // અહીં ખાતરી કરો કે ડેટામાં ફક્ત આ જ રિક્રુટરની જોબ્સ છે
        // જો API લેવલ પર ફિલ્ટરિંગ ન હોય તો ફ્રન્ટએન્ડ ફિલ્ટર (સેફ્ટી માટે):
        const myJobs = data.jobs || [];
        setJobs(myJobs);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchJobs();
    }
  }, [session]);

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`/api/recruiter/jobs/post?jobId=${jobId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setJobs(jobs.filter(j => j._id !== jobId));
      } else {
        alert("Delete failed on server");
      }
    } catch (err) {
      alert("Failed to delete job");
    }
  };

  const handleUpdateSuccess = (updatedJob) => {
    setJobs(jobs.map(j => j._id === updatedJob._id ? updatedJob : j));
    setEditingJob(null);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      <RecruiterSidebar activePage="managejobs" />
      
      <main className="flex-1 w-full p-3 sm:p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4 mt-12 md:mt-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Manage Jobs</h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Control your active job listings.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-slate-400 font-bold animate-pulse">Loading your jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {jobs.map((job) => (
                <JobAccordionCard 
                  key={job._id} 
                  job={job} 
                  onDelete={handleDelete} 
                  onEdit={() => setEditingJob(job)} 
                />
              ))}
              
              {jobs.length === 0 && (
                <div className="text-center bg-white border-2 border-dashed border-slate-200 rounded-[32px] py-16 px-6">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-slate-900 font-black text-lg">No Jobs Found</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">You haven't posted any jobs yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {editingJob && (
        <EditJobModal 
          job={editingJob} 
          onClose={() => setEditingJob(null)} 
          onSuccess={handleUpdateSuccess} 
        />
      )}
    </div>
  );
}

function JobAccordionCard({ job, onDelete, onEdit }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white rounded-[24px] border transition-all duration-500 overflow-hidden ${isOpen ? 'border-indigo-500 shadow-2xl ring-4 ring-indigo-50' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="p-4 sm:p-6 lg:p-7 cursor-pointer">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${isOpen ? 'bg-indigo-600 text-white rotate-6' : 'bg-indigo-50 text-indigo-600'}`}>
              <Briefcase size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-black text-slate-900 truncate leading-tight">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                 <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md"><MapPin size={12}/> {job.location}</span>
                 <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md"><Clock size={12}/> {job.jobType}</span>
              </div>
            </div>
          </div>
          <div className={`p-2 rounded-full transition-all shrink-0 ${isOpen ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'text-slate-300'}`}>
            <ChevronDown size={24} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-50">
          <div className="text-center">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Package</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-600">{job.salaryRange}</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Experience</p>
            <p className="text-xs sm:text-sm font-bold text-slate-700">{job.experienceLevel}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Deadline</p>
            <p className="text-xs sm:text-sm font-bold text-rose-500">{new Date(job.deadline).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 sm:px-7 pb-6 sm:pb-8">
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.1em]"><AlignLeft size={16} /> Job Description</div>
              <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-100">
                <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.1em]"><ListChecks size={16} /> Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(job.skills || job.requirements || []).map((skill, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }} 
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
            >
              <Edit2 size={18} /> Update Listing
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(job._id); }} 
              className="sm:w-auto px-8 bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-95 transition-all"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditJobModal({ job, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: job.title || "",
    location: job.location || "",
    salaryRange: job.salaryRange || "",
    description: job.description || "",
    requirements: Array.isArray(job.skills) ? job.skills.join(", ") : (Array.isArray(job.requirements) ? job.requirements.join(", ") : ""),
    jobType: job.jobType || "",
    experienceLevel: job.experienceLevel || "",
    deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/recruiter/jobs/post", {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job._id, ...formData }),
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.job);
        alert("Job updated successfully!");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-10 duration-500">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Edit Listing</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Job ID: {job._id.slice(-6)}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Job Role / Title</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all mt-1.5" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Location</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none mt-1.5" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Salary Range</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none mt-1.5" value={formData.salaryRange} onChange={(e) => setFormData({...formData, salaryRange: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Job Type</label>
              <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none mt-1.5" value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Experience Level</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none mt-1.5" value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})} placeholder="e.g. 2-4 Years" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Deadline Date</label>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none mt-1.5" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Requirements / Skills (Comma separated)</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-900 outline-none mt-1.5" value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} placeholder="React, Node.js, Tailwind..." />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">About the Role</label>
            <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-slate-700 outline-none mt-1.5 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Send size={22} /> Save & Publish Updates</>}
          </button>
        </form>
      </div>
    </div>
  );
}