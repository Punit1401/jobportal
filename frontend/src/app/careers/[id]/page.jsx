"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Clock,
  Heart,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";

export default function JobDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { data: session } = useSession();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [following, setFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        const [jobsRes, candRes] = await Promise.all([
          fetch("/api/jobs", { cache: "no-store" }),
          fetch("/api/candidate-jobs?public=true", { cache: "no-store" }),
        ]);

        const jobsData = await jobsRes.json();
        const candidateData = await candRes.json().catch(() => []);

        const jobList = Array.isArray(jobsData?.data)
          ? jobsData.data
          : Array.isArray(jobsData?.jobs)
            ? jobsData.jobs
            : Array.isArray(jobsData)
              ? jobsData
              : [];

        const candList = Array.isArray(candidateData)
          ? candidateData
          : Array.isArray(candidateData?.data)
            ? candidateData.data
            : [];

        const foundJob =
          jobList.find((item) => String(item._id) === String(params.id)) ||
          candList.find((item) => String(item._id) === String(params.id));

        setJob(foundJob || null);

        if (session?.user?.email) {
          const profileRes = await fetch(`/api/candidates?email=${encodeURIComponent(session.user.email)}`, { cache: "no-store" });
          const profileData = await profileRes.json();
          if (profileData?.ok && profileData?.data) {
            const rawSkills = profileData.data.skills;
            const skills = Array.isArray(rawSkills)
              ? rawSkills
              : typeof rawSkills === "string"
                ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            setCandidateSkills(skills);
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.id, session?.user?.email]);

  useEffect(() => {
    const fetchSavedAndFollowing = async () => {
      if (!session?.user?.email || !job?._id) return;
      try {
        const [saveRes, followRes] = await Promise.all([
          fetch("/api/candidates/save-job", { cache: "no-store" }),
          fetch("/api/candidates/follow-company", { cache: "no-store" }).catch(() => null)
        ]);
        const saveData = await saveRes.json();
        const followData = followRes ? await followRes.json().catch(() => ({})) : {};

        if (saveData.success && saveData.savedJobs) {
          setSaved(saveData.savedJobs.some((item) => String(item._id) === String(job._id)));
        }
        if (followData.success && followData.followedCompanies && job?.companyId) {
          const targetId = typeof job.companyId === "object" ? job.companyId._id : job.companyId;
          setFollowing(followData.followedCompanies.some((c) => String(c._id) === String(targetId)));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSavedAndFollowing();
  }, [job?._id, job?.companyId, session?.user?.email]);

  const handleSaveJob = async () => {
    if (!session) {
      alert("Please login to save jobs.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/candidates/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job._id }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.saved);
      } else {
        alert(data.error || "Failed to save job");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowCompany = async () => {
    if (!session) {
      alert("Please login to follow companies.");
      return;
    }
    const targetId = typeof job?.companyId === "object" ? job.companyId._id : job?.companyId;
    if (!targetId) {
      alert("Company details not available.");
      return;
    }

    setFollowingLoading(true);
    try {
      const res = await fetch("/api/candidates/follow-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: targetId }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowing(data.following);
      } else {
        alert(data.error || "Failed to follow company");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFollowingLoading(false);
    }
  };

  const jobSkills = Array.isArray(job?.skills)
    ? job.skills
    : typeof job?.skills === "string"
      ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : typeof job?.requirements === "string"
        ? job.requirements.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkills.some((candidateSkill) => candidateSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(candidateSkill.toLowerCase()))
  );

  const allEducationLabel = normalizeStaticLabel(job?.education, "All education levels");
  const genderLabel = normalizeStaticLabel(job?.gender, "All genders");
  const shiftLabel = normalizeStaticLabel(job?.shift, "Day Shift");
  const scheduleLabel = normalizeStaticLabel(job?.workingDays, "Flexible schedule");
  const vacancyLabel = job?.vacancies || job?.openings || 1;
  const vacancyText = Number(vacancyLabel) > 1 ? `${vacancyLabel} Vacancies` : `${vacancyLabel} Vacancy`;

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.companyName || job.company || "Career and Naukri"}`,
          url: shareUrl,
        });
      } catch {
        // ignore
      }
    } else if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      alert("Job link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-indigo-600 font-black tracking-widest">LOADING DETAILS...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Job not found!</h2>
        <Link href="/careers" className="text-indigo-600 font-bold underline">Back to Careers</Link>
      </div>
    );
  }

  const companyName = job.companyName || job.company || job.recruiterName || job.designation || "Verified Employer";
  const location = job.location || "Location not specified";
  const salary = job.salaryRange || job.projectBudget || "Competitive";
  const experience = job.experienceLevel || "Any Experience";
  const descriptionText = job.description || "No description provided.";

  return (
    <div className="min-h-screen bg-[#F6FAFB] pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 pt-2">
          <Link href="/careers" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
            <ArrowLeft size={20} />
            Back
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-indigo-700 px-4 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 sm:p-8 md:p-10 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                {job.isFreelance ? "Project" : "New Job"}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                {vacancyText}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                {job.jobType || "Full Time"}
              </span>
              {job.isFreelance && (
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                  Contract
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {job.title}
              </h1>
              <p className="text-lg sm:text-xl font-black text-slate-500">{companyName}</p>
            </div>

            <div className="mt-6 space-y-3 text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-lg font-medium">{location}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 shrink-0" />
                <p className="text-lg font-medium">
                  <span className="font-black text-slate-700">{salary}</span>
                  {!job.isFreelance && <span> /Month</span>}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase size={20} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-lg font-medium">
                  <span className="font-black text-slate-700">{experience}</span>
                  {job.designation ? ` in ${job.designation}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <span className="px-3 py-2 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                {job.jobType || "Full Time"}
              </span>
              <span className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {experience}
              </span>
              <span className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {location}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Job Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allEducationLabel && <HighlightItem icon={BadgeCheck} text={allEducationLabel} />}
                {genderLabel && <HighlightItem icon={Users} text={genderLabel} />}
                <HighlightItem icon={ShieldCheck} text={`${matchedSkills.length || 0} out of ${jobSkills.length || 0} skills match`} />
                {shiftLabel ? (
                  <HighlightItem icon={Clock} text={`${job.jobType || "Full Time"} | ${shiftLabel}`} />
                ) : (
                  <HighlightItem icon={Clock} text={job.jobType || "Full Time"} />
                )}
                {job.department && <HighlightItem icon={Tag} text={job.department} />}
                {scheduleLabel && <HighlightItem icon={Clock} text={scheduleLabel} />}
              </div>
            </div>

            {jobSkills.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  {matchedSkills.length || 0} out of {jobSkills.length} skills match
                </h2>
                <div className="flex flex-wrap gap-2">
                  {jobSkills.map((skill, index) => {
                    const matched = matchedSkills.some((item) => item.toLowerCase() === skill.toLowerCase());
                    return (
                      <span
                        key={index}
                        className={`px-4 py-2 rounded-full text-sm font-bold border ${
                          matched
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        {skill}
                        {matched && <CheckMark />}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-4">Job Description</h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px] sm:text-base">
                {descriptionText}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm lg:sticky lg:top-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                  <Building2 size={22} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">About the company</p>
                  <h3 className="text-lg font-black text-slate-900">{companyName}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                {job.companyDescription || job.description || "A verified opportunity on Career and Naukri."}
              </p>
              {job.companyId && (
                <button
                  onClick={handleFollowCompany}
                  disabled={followingLoading}
                  className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all ${
                    following 
                      ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" 
                      : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                  }`}
                >
                  {following ? "✓ Following" : "+ Follow Company"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (job.isCandidate && job.applyEmail) {
                  window.location.href = `mailto:${job.applyEmail}`;
                  return;
                }
                if (job.isCandidate && job.applyLink) {
                  window.open(job.applyLink.startsWith("http") ? job.applyLink : `https://${job.applyLink}`, "_blank", "noopener,noreferrer");
                  return;
                }
                alert("Application flow can be connected here.");
              }}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-700 py-4 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all"
            >
              Apply Now
            </button>

            {job.applyPhone ? (
              <button
                onClick={() => window.location.href = `tel:${job.applyPhone}`}
                className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Call HR
                <Phone size={18} />
              </button>
            ) : (
              <button
                onClick={handleSaveJob}
                disabled={saving}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  saved
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {saving ? "Saving..." : saved ? "Saved" : "Save Job"}
                <Heart size={18} className={saved ? "fill-white" : ""} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HighlightItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <Icon size={18} className="text-indigo-600 shrink-0" />
      <span className="font-semibold text-slate-700">{text}</span>
    </div>
  );
}

function CheckMark() {
  return <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px]">✓</span>;
}

function normalizeStaticLabel(value, fallback) {
  if (!value) return "";
  return value === fallback ? "" : value;
}
