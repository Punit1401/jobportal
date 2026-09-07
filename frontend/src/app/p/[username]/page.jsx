import React from "react";
import connectMongo from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Candidate from "@/models/Candidate";
import { notFound } from "next/navigation";
import { MapPin, Mail, ExternalLink, Briefcase, GraduationCap, Code, ArrowRight, CheckCircle2 } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import WebsiteTemplateRenderer, { isNewWebsiteTemplate } from "@/components/website-templates/WebsiteTemplateRenderer";

export default async function PublicPortfolioPage({ params }) {
  const { username } = await params;
  await connectMongo();
  const session = await getServerSession(authOptions);

  const rawPortfolio = await Portfolio.findOne({ username }).lean();
  if (!rawPortfolio) return notFound();

  if (!rawPortfolio.isPublished) {
    if (!session || session.user.id !== rawPortfolio.userId.toString()) {
      return notFound();
    }
  }

  const rawCandidate = await Candidate.findOne({ userId: rawPortfolio.userId }).lean();
  if (!rawCandidate) return notFound();

  const portfolio = JSON.parse(JSON.stringify(rawPortfolio));
  const candidate = JSON.parse(JSON.stringify(rawCandidate));

  const template = portfolio.template || "modern";

  if (isNewWebsiteTemplate(template)) {
    return <WebsiteTemplateRenderer candidate={candidate} portfolio={portfolio} />;
  }

  // THEME VARIABLES
  const isDark = portfolio.theme === "dark";
  const bgMain = isDark ? "bg-[#0B1120] text-slate-200" : "bg-slate-50 text-slate-800";
  const bgCard = isDark ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-xl shadow-slate-200/50";
  const bgNav = isDark ? "bg-[#0B1120]/80 border-slate-800" : "bg-white/80 border-slate-200";
  
  // COLOR PALETTE MAP
  const cMap = {
    indigo: { text: "text-indigo-500", bg: "bg-indigo-500", lightBg: "bg-indigo-500/10", border: "border-indigo-500", glow: "shadow-indigo-500/20" },
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10", border: "border-emerald-500", glow: "shadow-emerald-500/20" },
    rose: { text: "text-rose-500", bg: "bg-rose-500", lightBg: "bg-rose-500/10", border: "border-rose-500", glow: "shadow-rose-500/20" },
    cyan: { text: "text-cyan-500", bg: "bg-cyan-500", lightBg: "bg-cyan-500/10", border: "border-cyan-500", glow: "shadow-cyan-500/20" },
    amber: { text: "text-amber-500", bg: "bg-amber-500", lightBg: "bg-amber-500/10", border: "border-amber-500", glow: "shadow-amber-500/20" },
    purple: { text: "text-purple-500", bg: "bg-purple-500", lightBg: "bg-purple-500/10", border: "border-purple-500", glow: "shadow-purple-500/20" },
  };

  const activeColor = portfolio.accentColor || 'indigo';
  const themeColors = cMap[activeColor];
  
  const vs = portfolio.visibleSections || {};

  // =================== MINIMAL TEMPLATE ===================
  if (template === "minimal") {
    return (
      <div className={`min-h-screen font-sans selection:${themeColors.bg}/30 ${bgMain} py-20 px-6 sm:px-12`}>
        <div className="max-w-3xl mx-auto space-y-24">
          {!portfolio.isPublished && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm ${themeColors.lightBg} ${themeColors.text} border ${themeColors.border}`}>
              Preview Mode (Draft)
            </div>
          )}

          <header className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight">{candidate.fullName}</h1>
            <p className={`text-2xl font-medium ${themeColors.text}`}>{candidate.profession || candidate.position}</p>
            
            <div className="flex flex-wrap gap-6 pt-4 text-sm font-medium opacity-80">
              {candidate.city && <span className="flex items-center gap-2"><MapPin size={16}/> {candidate.city}, {candidate.state}</span>}
              {vs.contact && candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 hover:opacity-100 transition-opacity"><Mail size={16}/> Email</a>}
            </div>
          </header>

          {vs.about && candidate.jobDescription && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-6">About</h2>
              <p className="text-lg md:text-xl leading-relaxed font-light">{candidate.jobDescription}</p>
            </section>
          )}

          {vs.experience && candidate.workExperiences?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-10">Experience</h2>
              <div className="space-y-12">
                {candidate.workExperiences.map((exp, idx) => (
                  <div key={idx} className="relative pl-8 border-l border-slate-200 dark:border-slate-800">
                    <span className={`absolute left-[-4.5px] top-2 w-2 h-2 rounded-full ${themeColors.bg}`}></span>
                    <h3 className="text-2xl font-medium">{exp.position || exp.jobDepartment}</h3>
                    <p className={`font-medium mb-4 mt-1 ${themeColors.text}`}>{exp.currentCompanyName} <span className="opacity-40 ml-2">| {exp.jobFromDate} - {exp.jobToDate || "Present"}</span></p>
                    <p className="leading-relaxed opacity-80 font-light">{exp.jobDescription}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vs.skills && candidate.skills?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-6">Skills</h2>
              <p className="text-lg font-light leading-relaxed">{candidate.skills.join("  /  ")}</p>
            </section>
          )}
          
          <footer className="pt-20 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center opacity-50 text-sm">
            <span>© {new Date().getFullYear()} {candidate.fullName}</span>
            <span>Made with Career and Naukri</span>
          </footer>
        </div>
      </div>
    );
  }

  // =================== CREATIVE TEMPLATE ===================
  if (template === "creative") {
    return (
      <div className={`min-h-screen font-sans selection:${themeColors.bg}/30 ${bgMain} flex flex-col md:flex-row`}>
        {/* Left Fixed Sidebar */}
        <div className={`md:w-[40%] md:fixed h-auto md:h-screen p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden ${themeColors.bg} text-white`}>
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          
          {!portfolio.isPublished && (
            <div className="absolute top-6 left-6 p-2 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-md z-10">
              Draft Mode
            </div>
          )}
          
          <div className="relative z-10 space-y-8">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-white/10 flex items-center justify-center text-4xl lg:text-5xl font-black shadow-2xl backdrop-blur-xl border border-white/20">
              {candidate.fullName?.charAt(0) || "U"}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1]">{candidate.fullName}</h1>
            <p className="text-2xl font-medium opacity-90">{candidate.profession || candidate.position}</p>
            <p className="text-lg opacity-70 font-light leading-relaxed max-w-sm">{candidate.jobDescription}</p>
            
            <div className="flex flex-col gap-4 text-sm font-bold opacity-90 pt-8">
              {candidate.city && <span className="flex items-center gap-3"><MapPin size={20}/> {candidate.city}</span>}
              {vs.contact && candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-3 hover:translate-x-2 transition-transform"><Mail size={20}/> Email Me</a>}
              {vs.contact && candidate.portfolio && <a href={candidate.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:translate-x-2 transition-transform"><ExternalLink size={20}/> View Portfolio</a>}
            </div>
          </div>
        </div>

        {/* Right Scrollable Content */}
        <div className={`md:w-[60%] md:ml-[40%] p-8 md:p-16 lg:p-24 space-y-24 ${isDark ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}`}>
          {vs.experience && candidate.workExperiences?.length > 0 && (
            <section>
              <h2 className="text-5xl font-black mb-12 tracking-tighter">Experience</h2>
              <div className="grid gap-8">
                {candidate.workExperiences.map((exp, idx) => (
                  <div key={idx} className={`p-10 rounded-[2.5rem] border ${bgCard} hover:-translate-y-2 transition-transform duration-300`}>
                    <h3 className="text-2xl font-black mb-2">{exp.position || exp.jobDepartment}</h3>
                    <p className={`font-bold mb-6 text-lg ${themeColors.text}`}>{exp.currentCompanyName}</p>
                    <p className="opacity-80 leading-relaxed font-light text-lg">{exp.jobDescription}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vs.education && candidate.formalEducations?.length > 0 && (
            <section>
              <h2 className="text-5xl font-black mb-12 tracking-tighter">Education</h2>
              <div className="grid gap-8 lg:grid-cols-2">
                {candidate.formalEducations.map((edu, idx) => (
                  <div key={idx} className={`p-10 rounded-[2.5rem] border ${bgCard}`}>
                    <GraduationCap size={40} className={`mb-6 opacity-20`} />
                    <h3 className="text-xl font-black mb-2">{edu.type || "Degree"} in {edu.specialization}</h3>
                    <p className={`font-bold ${themeColors.text} mb-4`}>{edu.institute || edu.university}</p>
                    <p className="opacity-60 text-sm font-bold uppercase tracking-widest">{edu.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vs.skills && candidate.skills?.length > 0 && (
            <section>
              <h2 className="text-5xl font-black mb-12 tracking-tighter">Expertise</h2>
              <div className="flex flex-wrap gap-4">
                {candidate.skills.map((skill, idx) => (
                  <span key={idx} className={`px-8 py-4 rounded-full border font-black text-lg ${bgCard} hover:${themeColors.bg} hover:text-white transition-colors duration-300 cursor-default shadow-lg shadow-black/5`}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // =================== MODERN TEMPLATE (DEFAULT - Fully Upgraded) ===================
  return (
    <div className={`min-h-screen font-sans selection:${themeColors.bg}/30 ${bgMain}`}>
      
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${bgNav} transition-all`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${themeColors.bg}`}>
              {candidate.fullName?.charAt(0) || "U"}
            </span>
            {candidate.fullName?.split(' ')[0]}
          </div>
          <div className="flex items-center gap-4">
            {vs.contact && candidate.email && (
              <a href={`mailto:${candidate.email}`} className={`px-5 py-2.5 rounded-full font-bold text-sm text-white ${themeColors.bg} hover:opacity-90 transition-opacity shadow-lg ${themeColors.glow}`}>
                Hire Me
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none ${themeColors.bg}`}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {!portfolio.isPublished && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-bold text-sm ${themeColors.lightBg} ${themeColors.text} border ${themeColors.border}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span> Draft Mode
            </div>
          )}
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
            I'm {candidate.fullName?.split(' ')[0]}, a <br className="hidden md:block"/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${activeColor}-500 to-${activeColor}-300`}>
              {candidate.profession || candidate.position || "Professional"}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl opacity-60 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            {candidate.jobDescription || "Passionate about building great products and solving complex problems."}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {candidate.city && (
              <span className={`flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm font-bold ${bgCard}`}>
                <MapPin size={18} className={themeColors.text} /> {candidate.city}, {candidate.state}
              </span>
            )}
            {vs.contact && candidate.portfolio && (
              <a href={candidate.portfolio} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm font-bold ${bgCard} hover:border-${activeColor}-500 transition-colors`}>
                <ExternalLink size={18} className={themeColors.text} /> Portfolio
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-20 space-y-32">
        
        {/* Experience Section */}
        {vs.experience && candidate.workExperiences?.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-4xl font-black tracking-tight">Experience</h2>
              <div className={`flex-1 h-px bg-gradient-to-r from-${activeColor}-500/50 to-transparent`}></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {candidate.workExperiences.map((exp, idx) => (
                <div key={idx} className={`p-10 rounded-[2rem] border backdrop-blur-xl ${bgCard} hover:-translate-y-2 transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${themeColors.lightBg} ${themeColors.text}`}>
                    <Briefcase size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 block">
                    {exp.jobFromDate} — {exp.jobToDate || "Present"}
                  </span>
                  <h3 className="text-2xl font-black mb-1">{exp.position || exp.jobDepartment}</h3>
                  <p className={`font-bold mb-6 text-lg ${themeColors.text}`}>{exp.currentCompanyName}</p>
                  <p className="opacity-80 leading-relaxed">{exp.jobDescription}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {vs.skills && candidate.skills?.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-4xl font-black tracking-tight">Skills & Tools</h2>
              <div className={`flex-1 h-px bg-gradient-to-r from-${activeColor}-500/50 to-transparent`}></div>
            </div>
            <div className="flex flex-wrap gap-4">
              {candidate.skills.map((skill, idx) => (
                <div key={idx} className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-bold text-lg ${bgCard} hover:border-${activeColor}-500 transition-colors cursor-default`}>
                  <CheckCircle2 size={20} className={themeColors.text} /> {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {vs.education && candidate.formalEducations?.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-4xl font-black tracking-tight">Education</h2>
              <div className={`flex-1 h-px bg-gradient-to-r from-${activeColor}-500/50 to-transparent`}></div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {candidate.formalEducations.map((edu, idx) => (
                <div key={idx} className={`p-8 rounded-[2rem] border ${bgCard} relative overflow-hidden group`}>
                  <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${themeColors.text}`}>
                    <GraduationCap size={100} />
                  </div>
                  <h3 className="text-xl font-black mb-2 relative z-10">{edu.type || "Degree"} in {edu.specialization}</h3>
                  <p className={`font-bold ${themeColors.text} mb-6 relative z-10`}>{edu.institute || edu.university}</p>
                  <span className="inline-block px-4 py-2 rounded-lg bg-slate-500/10 text-xs font-black uppercase tracking-widest relative z-10">
                    Class of {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-20 py-12 border-t text-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <h2 className="text-3xl font-black tracking-tight mb-6">Let's work together.</h2>
        {vs.contact && candidate.email && (
          <a href={`mailto:${candidate.email}`} className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-white ${themeColors.bg} hover:scale-105 transition-transform shadow-2xl ${themeColors.glow}`}>
            Get in touch <ArrowRight size={20} />
          </a>
        )}
        <p className="mt-12 text-sm font-bold opacity-40 uppercase tracking-widest">
          Powered by Career and Naukri
        </p>
      </footer>
    </div>
  );
}
