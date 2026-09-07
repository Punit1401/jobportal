"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ChevronRight,
  Bookmark,
  Bell,
  Loader2,
  Sparkles,
  BarChart3,
  BadgeCheck,
  TrendingUp,
  Target,
  ArrowRight,
  Briefcase,
  BookOpen,
  Calendar,
  MessageSquare,
  Folder,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Layers,
  HelpCircle,
  FileText,
  Star,
  Zap,
  Globe,
  Camera,
  Layout,
  Users
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import FeedbackForm from "@/components/FeedbackForm";

export default function UserDashboard() {
  const { data: session } = useSession();
  
  // Data States
  const [jobs, setJobs] = useState([]);
  const [exams, setExams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  
  // Interaction & UI States
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [stats, setStats] = useState({ applied: 0, interviews: 0, saved: 0 });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeOpportunityTab, setActiveOpportunityTab] = useState("AI Job Feed");
  const [employmentStatus, setEmploymentStatus] = useState("Open to work");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [careerInsights, setCareerInsights] = useState({
    profileStrengthScore: 75,
    resumePerformanceScore: 68,
    interviewSuccessRate: 40,
    comparisonLinks: {
      salary: "/user/upskill/salary-benchmarking",
      skills: "/user/upskill/SkillGapAnalysis",
      trends: "/user/upskill/industry-trends",
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch User Profile
        let userSkills = [];
        if (session?.user?.email) {
          const userRes = await fetch(`/api/candidates?email=${session.user.email}`);
          const userData = await userRes.json();
          if (userData.ok && userData.data) {
            if (userData.data.skills) {
              userSkills = Array.isArray(userData.data.skills)
                ? userData.data.skills.map((s) => s.toLowerCase())
                : userData.data.skills.split(",").map((s) => s.trim().toLowerCase());
            }
            if (userData.data.presentEmploymentStatus) {
              setEmploymentStatus(userData.data.presentEmploymentStatus);
            }
          }
        }

        // 2. Fetch Jobs
        const jobsRes = await fetch("/api/jobs");
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          let recommended = Array.isArray(jobsData) ? jobsData : [];
          if (userSkills.length > 0) {
            recommended = recommended.filter((job) => {
              const jobText = `${job.title} ${job.description} ${job.requirements?.join(" ")}`.toLowerCase();
              return userSkills.some((skill) => jobText.includes(skill));
            });
          }
          setJobs(recommended.slice(0, 6));
        }

        // 3. Fetch Government Exams
        const examsRes = await fetch("/api/candidate/govt-exams");
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          if (examsData.success && Array.isArray(examsData.data)) {
            setExams(examsData.data.slice(0, 4));
          }
        }

        // 4. Fetch Programs / Internships
        const progRes = await fetch("/api/candidate/programs");
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.success && Array.isArray(progData.data)) {
            setPrograms(progData.data.slice(0, 4));
          }
        }

        // 5. Fetch Government Schemes
        const schemesRes = await fetch("/api/candidate/community-schemes");
        if (schemesRes.ok) {
          const schemesData = await schemesRes.json();
          if (schemesData.success && Array.isArray(schemesData.data)) {
            setSchemes(schemesData.data.slice(0, 4));
          }
        }

        // 6. Fetch Applications & Stats
        const appRes = await fetch("/api/applications");
        if (appRes.ok) {
          const appResult = await appRes.json();
          if (appResult.ok && Array.isArray(appResult.data)) {
            const apps = appResult.data;
            setStats((prev) => ({
              ...prev,
              applied: apps.length,
              interviews: apps.filter((a) => a.status?.toLowerCase() === "approved" || a.status?.toLowerCase() === "shortlisted").length,
            }));
          }
        }

        // 7. Fetch Saved Jobs
        const savedRes = await fetch("/api/candidates/save-job");
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          if (savedData.success && Array.isArray(savedData.savedJobs)) {
            setSavedJobIds(savedData.savedJobs.map((j) => j._id));
            setStats((prev) => ({ ...prev, saved: savedData.savedJobs.length }));
          }
        }

        // 8. Fetch Conversations (Chat Inbox)
        const chatRes = await fetch("/api/chat/conversations");
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          if (chatData.success && Array.isArray(chatData.conversations)) {
            setConversations(chatData.conversations.slice(0, 3));
          }
        }

        // 9. Fetch Candidate Files
        const filesRes = await fetch("/api/user/files");
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          if (filesData.files && Array.isArray(filesData.files)) {
            setUserFiles(filesData.files.slice(0, 3));
          }
        }

        // 10. Fetch Career Insights
        const insightsRes = await fetch("/api/user/career-insights", { cache: "no-store" });
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          if (insightsData.success && insightsData.data) {
            setCareerInsights(insightsData.data);
          }
        }
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleAutoApply = async () => {
    if (selectedJobs.length === 0) {
      alert("Please select at least one job to apply.");
      return;
    }

    try {
      setApplying(true);
      const selectedJobData = jobs
        .filter((j) => selectedJobs.includes(j._id))
        .map((j) => ({
          jobId: j._id,
          recruiterId: j.recruiterId,
          role: j.title,
        }));

      const res = await fetch("/api/user/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedJobs: selectedJobData }),
      });

      const data = await res.json();
      if (data.ok) {
        alert(`Successfully applied to ${data.results.filter((r) => r.status === "success").length} jobs!`);
        setSelectedJobs([]);
        const newApps = data.results.filter((r) => r.status === "success").length;
        setStats((prev) => ({ ...prev, applied: prev.applied + newApps }));
      } else {
        alert(data.error || "Auto-apply failed.");
      }
    } catch (error) {
      alert("An error occurred during auto-apply.");
    } finally {
      setApplying(false);
    }
  };

  const toggleSaveJob = async (jobId) => {
    if (savingId) return;
    setSavingId(jobId);
    try {
      const res = await fetch("/api/candidates/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedJobIds((prev) => [...prev, jobId]);
          setStats((prev) => ({ ...prev, saved: prev.saved + 1 }));
        } else {
          setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
          setStats((prev) => ({ ...prev, saved: Math.max(0, prev.saved - 1) }));
        }
      }
    } catch (error) {
      console.error("Save job error:", error);
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setEmploymentStatus(newStatus);
    try {
      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentEmploymentStatus: newStatus }),
      });
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 pt-36 lg:pt-20 ${
          isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-10">
          
          {/* HEADER BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full max-w-xl relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, exams, people, resources..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-800 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Link
                href="/user/notifications"
                className="p-3 bg-white border border-slate-200 rounded-2xl relative shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600"
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white"></span>
              </Link>
              <Link
                href="/user/chat"
                className="p-3 bg-white border border-slate-200 rounded-2xl relative shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600"
              >
                <MessageSquare size={20} />
              </Link>
              <Link
                href="/user/post"
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-slate-200"
              >
                <Zap size={14} /> Post
              </Link>
            </div>
          </div>

          {/* HERO SECTION */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> {getTimeOfDay()}, {session?.user?.name?.split(" ")[0] || "User"}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Your career, scanned <br />
                  and ready to move.
                </h1>
                <p className="text-slate-300 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                  We scanned your profile against active listings. Here is your real-time status and priority actions for today.
                </p>

                {/* Hero Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-indigo-400">{careerInsights.profileStrengthScore}%</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Profile Visibility</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-emerald-400">{stats.applied}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Applications</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-amber-400">{stats.interviews}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Matches / Approved</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-rose-400">{stats.saved}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Saved Items</p>
                  </div>
                </div>
              </div>

              {/* Career Radar Widget */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">CAREER RADAR</span>
                
                {/* SVG Radar Visualization */}
                <svg className="w-56 h-56 overflow-visible" viewBox="0 0 240 240">
                  {/* Grid Rings */}
                  {[0.3, 0.6, 0.9].map((scale, idx) => (
                    <polygon
                      key={idx}
                      points="120,30 195,85 166,175 74,175 45,85"
                      transform={`translate(${120 * (1 - scale)}, ${120 * (1 - scale)}) scale(${scale})`}
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Axis lines */}
                  <line x1="120" y1="120" x2="120" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="120" y1="120" x2="195" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="120" y1="120" x2="166" y2="175" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="120" y1="120" x2="74" y2="175" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="120" y1="120" x2="45" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  
                  {/* Data Shape */}
                  <polygon
                    points="120,45 180,95 155,160 85,165 55,90"
                    fill="rgba(99, 102, 241, 0.3)"
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                  {/* Radar Labels */}
                  <text x="120" y="18" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">APPLICATIONS</text>
                  <text x="210" y="85" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="start">SKILLS</text>
                  <text x="175" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">PREP</text>
                  <text x="65" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">NETWORK</text>
                  <text x="30" y="85" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">VISIBILITY</text>
                </svg>

                <p className="text-xs text-slate-300 font-semibold mt-2">Overall Match Index: <span className="text-indigo-400 font-bold">{Math.round((careerInsights.profileStrengthScore + careerInsights.resumePerformanceScore) / 2)}%</span></p>
              </div>
            </div>
          </section>

          {/* TODAY'S FOCUS */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Today's Focus</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Ranked by AI engine based on active matching and deadlines.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Focus Card 1 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    <span className="text-indigo-600 font-black">{jobs.length} recommended roles</span> matched your profile in the AI Job Feed.
                  </p>
                </div>
                <Link
                  href="/user/job-feed"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase text-indigo-600 hover:text-indigo-700 pt-4"
                >
                  Review Matches <ArrowRight size={14} />
                </Link>
              </div>

              {/* Focus Card 2 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <FileText size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    Resume Performance score is <span className="text-amber-600 font-black">{careerInsights.resumePerformanceScore}/100</span> based on latest edit.
                  </p>
                </div>
                <Link
                  href="/user/resumebuilder"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase text-amber-600 hover:text-amber-700 pt-4"
                >
                  Fix in Resume Builder <ArrowRight size={14} />
                </Link>
              </div>

              {/* Focus Card 3 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <BadgeCheck size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    <span className="text-emerald-600 font-black">{stats.applied} active application(s)</span> are currently tracked in your pipeline.
                  </p>
                </div>
                <Link
                  href="/user/status"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase text-emerald-600 hover:text-emerald-700 pt-4"
                >
                  Open Application Status <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* OPPORTUNITIES TABBED SECTION */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Opportunities For You</h2>
                <p className="text-slate-500 font-medium text-xs mt-0.5">Explore jobs, government exams, training programs, and welfare schemes.</p>
              </div>
              <Link
                href="/user/job-feed"
                className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                See All →
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap gap-1 border border-slate-200/60">
              {["AI Job Feed", "Find Jobs", "Government Exams & Jobs", "Internships & Training", "Govt Schemes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveOpportunityTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeOpportunityTab === tab
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Opportunity Tab Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOpportunityTab === "AI Job Feed" || activeOpportunityTab === "Find Jobs" ? (
                filteredJobs.slice(0, 3).map((job) => (
                  <div key={job._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                          {job.company?.charAt(0) || "J"}
                        </div>
                        <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100">
                          {job.type || "Full Time"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg leading-snug">{job.title}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-1">{job.company || "Employer"} • {job.location || "Remote"}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-700">{job.salaryRange || "Best in Class"}</span>
                      <Link href={`/careers?jobId=${job._id}`} className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline">
                        Apply →
                      </Link>
                    </div>
                  </div>
                ))
              ) : activeOpportunityTab === "Government Exams & Jobs" ? (
                exams.length === 0 ? (
                  <div className="col-span-3 text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">No active government exams available right now.</div>
                ) : (
                  exams.map((exam) => (
                    <div key={exam._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                            Govt Exam
                          </span>
                          <span className="text-xs font-bold text-slate-400">{exam.category || "Official"}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg leading-snug">{exam.title || exam.name}</h4>
                        <p className="text-slate-500 text-xs font-semibold mt-1">{exam.organization || exam.board || "Government Exam Body"}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">{exam.lastDate ? `Deadline: ${exam.lastDate}` : "Active"}</span>
                        <Link href="/user/govt-exams" className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline">
                          View Exam →
                        </Link>
                      </div>
                    </div>
                  ))
                )
              ) : activeOpportunityTab === "Internships & Training" ? (
                programs.length === 0 ? (
                  <div className="col-span-3 text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">No internship or training programs found.</div>
                ) : (
                  programs.map((prog) => (
                    <div key={prog._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                            {prog.programType || "Program"}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{prog.mode || "Offline"}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg leading-snug">{prog.title}</h4>
                        <p className="text-slate-500 text-xs font-semibold mt-1">{prog.organization || "Govt Agency"}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">{prog.stipend || "Stipend Provided"}</span>
                        <Link href="/user/programs" className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline">
                          Details →
                        </Link>
                      </div>
                    </div>
                  ))
                )
              ) : (
                schemes.length === 0 ? (
                  <div className="col-span-3 text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">No welfare schemes loaded.</div>
                ) : (
                  schemes.map((scheme) => (
                    <div key={scheme._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black uppercase bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-100">
                            Scheme
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg leading-snug">{scheme.title}</h4>
                        <p className="text-slate-500 text-xs font-semibold mt-1">{scheme.organization || "Government Scheme"}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">{scheme.eligibility || "Public Eligibility"}</span>
                        <Link href="/user/govt-schemes" className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline">
                          Explore →
                        </Link>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </section>

          {/* AI TOOLKIT SECTION */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your AI Toolkit</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Build assets and optimize your professional persona.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              <Link
                href="/user/upskill/ai-tools"
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/30 hover:border-indigo-500 hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">AI Tools</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">Cover letters, JD matching, salary insight.</p>
                </div>
              </Link>

              <Link
                href="/user/resumebuilder"
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/30 hover:border-indigo-500 hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Resume Builder</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">ATS Optimization & professional templates.</p>
                </div>
              </Link>

              <Link
                href="/user/upskill/portfolio-builder"
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/30 hover:border-indigo-500 hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layout size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Portfolio Builder</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">AI profile auto-fill & custom layout designer.</p>
                </div>
              </Link>

              <Link
                href="/user/headshot"
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/30 hover:border-indigo-500 hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">AI Headshots</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">Generate studio-quality headshot photos.</p>
                </div>
              </Link>

              <Link
                href="/user/upskill/my-website"
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/30 hover:border-indigo-500 hover:-translate-y-1 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">My Website</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">Publish your branded personal domain.</p>
                </div>
              </Link>
            </div>
          </section>

          {/* KEEP GROWING SECTION */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Keep Growing</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Skill up, prep smart, and decide with confidence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/user/upskill/learning-path" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Learning Path</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Personalized skill progression modules tailored to your target roles.</p>
                </div>
              </Link>

              <Link href="/user/upskill/behavioral-coaching" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Interview Preparation</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">AI behavioral mock interviews & real-time feedback coaching.</p>
                </div>
              </Link>

              <Link href="/user/upskill/work-style-fit" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Work Style Fit</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Evaluate company culture compatibility & workplace preferences.</p>
                </div>
              </Link>

              <Link href="/libraries" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Knowledge Library</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Curated career guides, negotiation strategies, and articles.</p>
                </div>
              </Link>

              <Link href="/user/qa" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Ask Experts (Q&A)</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Get answers from industry mentors and hiring managers.</p>
                </div>
              </Link>

              <Link href="/user/upskill/company-reviews" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Star size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Company Reviews & Ratings</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Read authentic employee insights before accepting offers.</p>
                </div>
              </Link>
            </div>
          </section>

          {/* WORKSPACE PANELS */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Workspace</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Manage your messaging, calendar, files, and job status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chat Inbox Panel */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <MessageSquare size={18} className="text-indigo-600" /> Chat Inbox
                    </h4>
                    <Link href="/user/chat" className="text-xs font-bold text-indigo-600 hover:underline">View All →</Link>
                  </div>

                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">No recent chat messages.</div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((conv) => (
                        <div key={conv._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {conv.recruiterId?.companyName?.charAt(0) || "R"}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{conv.recruiterId?.companyName || conv.recruiterId?.fullName || "Recruiter"}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{conv.lastMessage || "Conversation active"}</p>
                            </div>
                          </div>
                          <Link href="/user/chat" className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">
                            Reply
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Files & Storage Panel */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <Folder size={18} className="text-amber-600" /> Files & Folders
                    </h4>
                    <Link href="/user/files" className="text-xs font-bold text-amber-600 hover:underline">Manage →</Link>
                  </div>

                  {userFiles.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">No uploaded documents yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {userFiles.map((file, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-amber-600" />
                            <div>
                              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{file.name || file.filename || `Document_${idx + 1}`}</p>
                              <p className="text-[10px] text-slate-400">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : "Uploaded"}</p>
                            </div>
                          </div>
                          <a href={file.url || "#"} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar & Deadlines Panel */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600" /> Calendar & Deadlines
                  </h4>
                  <Link href="/user/calendar" className="text-xs font-bold text-emerald-600 hover:underline">Full Calendar →</Link>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center text-xs font-black shrink-0">
                      <span>TODAY</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Career Sync & Match Assessment</p>
                      <p className="text-[10px] text-slate-500">Automated daily job matching active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMMUNITY SECTION */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Community & Networking</h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Verified service providers and expert assistance.</p>
            </div>

            <div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Service Directory</span>
                  <h4 className="font-bold text-slate-900 text-lg">Professional Service Providers</h4>
                  <p className="text-xs text-slate-500">Verified experts for coaching, legal aid, and resume writing.</p>
                </div>
                <Link href="/user/service" className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shrink-0">
                  Browse →
                </Link>
              </div>
            </div>
          </section>

          {/* FEEDBACK SECTION */}
          <div className="pt-8">
            <FeedbackForm />
          </div>

        </div>
      </main>
    </div>
  );
}
