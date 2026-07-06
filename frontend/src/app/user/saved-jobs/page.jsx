"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, MapPin, DollarSign, Clock, Briefcase, Trash2, ExternalLink, Loader2 } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import Link from "next/link";
import Image from "next/image";

export default function SavedJobsPage() {
  const { data: session } = useSession();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates/save-job");
      const data = await res.json();
      if (data.success) {
        setSavedJobs(data.savedJobs || []);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (jobId) => {
    try {
      const res = await fetch("/api/candidates/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove from local state
        setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
      }
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar activePage="saved-jobs" />

      <main className=" md:ml-64 flex-1 w-full p-4 sm:p-8 lg:p-12 mt-16 md:mt-0">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Bookmark className="text-indigo-600" size={36} />
              Saved Jobs
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Manage all the job opportunities you have bookmarked for later.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Saved Jobs Yet</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                You haven't bookmarked any jobs yet. Start exploring jobs and save the ones you like!
              </p>
              <Link href="/careers" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                        {job.logo ? (
                          <Image src={job.logo} alt={job.company} width={56} height={56} className="object-cover" />
                        ) : (
                          <Briefcase className="text-slate-400" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                          <Link href={`/careers/${job._id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-slate-500 font-bold text-sm mt-1">{job.company}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeJob(job._id)}
                      className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                      title="Remove from saved jobs"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={16} className="text-indigo-500" /> {job.location || "Not specified"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <DollarSign size={16} className="text-emerald-500" /> {job.minSalary && job.maxSalary ? `₹${job.minSalary} - ₹${job.maxSalary}` : job.salary || "Not disclosed"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Briefcase size={16} className="text-amber-500" /> {job.type || job.experience || "Full Time"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Clock size={16} className="text-blue-500" />
                      {new Date(job.postedDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                    {(job.requiredSkills && job.requiredSkills.length > 3) && (
                      <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        +{job.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      href={`/careers/${job._id}`}
                      className="flex items-center justify-center gap-2 w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      View Details <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
