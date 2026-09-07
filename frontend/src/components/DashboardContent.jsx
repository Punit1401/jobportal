"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function JobConnectPro() {
  const router = useRouter();
  const [latestJobs, setLatestJobs] = useState([]);
  const [config, setConfig] = useState({
    hero_title: "Find Your Dream Career, Faster Than Ever",
    hero_subtitle: "Connect with top employers, showcase your skills, and land your perfect job. The most comprehensive platform for job seekers and recruiters.",
    features_title: "Everything You Need to Succeed",
    cta_text: "Get Started Free",
  });
  const [promoCampaign, setPromoCampaign] = useState(null);
  const [showPromo, setShowPromo] = useState(false);

  // ડેટાબેઝમાંથી 2 લેટેસ્ટ જોબ્સ ફેચ કરવાનું લોજિક
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs?limit=2"); 
        const data = await res.json();
        if (data && data.length > 0) {
          setLatestJobs(data);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await fetch("/api/advertising/active", { cache: "no-store" });
        const data = await res.json();
        if (!data.success || !data.campaign) return;

        const dismissedKey = `promo_dismissed_${data.campaign.id}`;
        if (sessionStorage.getItem(dismissedKey) === "1") return;

        setPromoCampaign(data.campaign);
        setShowPromo(true);
      } catch (error) {
        console.error("Error loading promo campaign:", error);
      }
    };
    fetchPromo();
  }, []);

  // SDK Integration
  useEffect(() => {
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig: config,
        onConfigChange: (updated) => setConfig(prev => ({ ...prev, ...updated }))
      });
    }
  }, [config]);

  // સર્ચ હેન્ડલર
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    const location = e.target.location.value;
    router.push(`/careers?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; scroll-behavior: smooth; }
        .gradient-text {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .floating { animation: float 6s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {showPromo && promoCampaign && (
        <div className="fixed inset-0 z-[120] pointer-events-none bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pointer-events-auto w-full max-w-xl bg-white rounded-[32px] border border-slate-200 shadow-2xl p-8 relative">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem(`promo_dismissed_${promoCampaign.id}`, "1");
                setShowPromo(false);
              }}
              className="absolute right-4 top-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 font-black text-slate-600"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-[11px] uppercase tracking-widest font-black text-indigo-700 mb-2">
              Sponsored {promoCampaign.userRole === "recruiter" ? "Job" : "Service"}
            </p>
            <h3 className="text-2xl font-black text-slate-900">{promoCampaign.targetTitle}</h3>
            <p className="text-slate-500 font-medium mt-2">{promoCampaign.targetSubtitle}</p>
            <p className="text-xs text-slate-400 mt-3">
              Campaign: {promoCampaign.planTitle}
              {promoCampaign.expiresAt
                ? ` • Ends ${new Date(promoCampaign.expiresAt).toLocaleDateString("en-IN")}`
                : ""}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href={promoCampaign.ctaHref}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black"
              >
                View Details
              </Link>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem(`promo_dismissed_${promoCampaign.id}`, "1");
                  setShowPromo(false);
                }}
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/50 rounded-full blur-3xl floating" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl floating" style={{ animationDelay: '-3s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-indigo-700 text-sm font-bold tracking-wide uppercase">10M+ Active Job Seekers</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
              {config.hero_title.split(',')[0]}, <br />
              <span className="gradient-text">{config.hero_title.split(',')[1] || "Faster Than Ever"}</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              {config.hero_subtitle}
            </p>

            {/* --- Dynamic Search Box --- */}
            <form onSubmit={handleSearch} className="bg-white shadow-xl shadow-indigo-100 border border-slate-200 rounded-2xl p-2 mb-10 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
                <input type="text" name="query" placeholder="Job title or skills" className="w-full py-4 bg-transparent border-none outline-none focus:ring-0 font-medium text-slate-900" />
              </div>
              <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl border-l border-slate-200 sm:border-l-0">
                <input type="text" name="location" placeholder="City or Remote" className="w-full py-4 bg-transparent border-none outline-none focus:ring-0 font-medium text-slate-900" />
              </div>
              <button type="submit" className="bg-indigo-600 text-white font-black px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                Search Jobs
              </button>
            </form>
            
            <div className="grid grid-cols-3 gap-8">
              <div><div className="text-3xl font-black text-slate-900">500K+</div><div className="text-slate-500 font-medium">Jobs</div></div>
              <div><div className="text-3xl font-black text-slate-900">50K+</div><div className="text-slate-500 font-medium">Companies</div></div>
              <div><div className="text-3xl font-black text-slate-900">95%</div><div className="text-slate-500 font-medium">Success</div></div>
            </div>
          </div>
            
          {/* Hero Visuals - 2 Clickable Dynamic Cards */}
          <div className="hidden lg:block relative h-[500px]">
            {latestJobs.map((job, idx) => (
              <div 
                key={job.id || idx}
                onClick={() => router.push(`/careers?jobId=${job.id}`)}
                className={`absolute w-80 bg-white border border-slate-100 shadow-2xl rounded-3xl p-6 cursor-pointer hover:shadow-indigo-200 transition-all hover:scale-105 z-10 floating ${idx === 0 ? 'top-0 right-0' : 'bottom-10 left-0'}`}
                style={{ animationDelay: idx === 1 ? '-3s' : '0s' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${idx === 0 ? 'bg-indigo-600' : 'bg-purple-600'} rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden`}>
                    {job.companyLogo ? <img src={job.companyLogo} alt="logo" className="w-full h-full object-cover" /> : job.companyName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-1">{job.companyName} • {job.location || "Remote"}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">{job.salary || "Best in Industry"}</span>
                  <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">View Details →</span>
                </div>
              </div>
            ))}
            {!latestJobs.length && <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium">Loading opportunities...</div>}
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-16">{config.features_title}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: "Smart Search", desc: "Filters for location & salary.", icon: "🔍", color: "bg-indigo-50" },
              { title: "Verified", desc: "Every company is manually checked.", icon: "✅", color: "bg-emerald-50" },
              { title: "Instant Apply", desc: "Apply with a single click profile.", icon: "⚡", color: "bg-amber-50" },
              { title: "Insights", desc: "Track applications & salary trends.", icon: "📊", color: "bg-pink-50" }
            ].map((feature, i) => (
              <div key={i} className={`${feature.color} p-8 rounded-[32px] border border-slate-50 hover:scale-105 transition-transform cursor-default`}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Recruiter Section --- */}
      <section id="recruiters" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-8 text-slate-900">Hire Top Talent <span className="gradient-text">10x Faster</span></h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">Streamline your recruitment process with AI-powered matching and centralized candidate tracking.</p>
            <div className="space-y-4 mb-10">
              {['Easy Job Posting', 'Candidate Management', 'AI Matching Engine'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-semibold text-slate-700">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/recruiter/register" className="inline-block bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl">
              Start Hiring Now
            </Link>
          </div>
          <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100">
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">Recent Applicants</h3>
            <div className="space-y-4">
              {[
                { name: "Sarah Kim", role: "UI Designer", match: "98%" },
                { name: "Mike Ross", role: "Backend Dev", match: "92%" },
                { name: "Jessica P.", role: "Manager", match: "85%" }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">{c.name[0]}</div>
                    <div><div className="font-bold text-sm text-slate-900">{c.name}</div><div className="text-xs text-slate-500 font-medium">{c.role}</div></div>
                  </div>
                  <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg">{c.match} Match</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Admin/Enterprise Section --- */}
      <section id="admin" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 bg-indigo-600 rounded-[48px] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-6">Enterprise Dashboard</h2>
              <p className="text-indigo-100 text-lg mb-10 leading-relaxed">Complete control over your recruitment ecosystem with analytics, security, and custom settings.</p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20"><div className="text-2xl font-bold">2.4M</div><div className="text-white text-sm">Total Users</div></div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20"><div className="text-2xl font-bold">89K</div><div className="text-white text-sm">Jobs Posted</div></div>
              </div>
              <Link href="/demo" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
                Request Demo
              </Link>
            </div>
            <div className="hidden lg:block bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <div className="h-48 flex items-end gap-3 mb-6">
                {[40, 70, 45, 90, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/20 rounded-t-lg transition-all hover:bg-white" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-center text-sm font-bold text-indigo-100 uppercase tracking-widest">Platform Analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-24 bg-slate-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-8">Ready to Transform Your Career?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              {config.cta_text}
            </Link>
            {/* <Link href="/demo" className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              Watch Demo
            </Link> */}
          </div>
        </div>
      </section>
    </div>
  );
}