"use client";
// ફાઈલની સૌથી ઉપર આ લાઈન ઉમેરો
import { Mail, Phone, MapPin, Briefcase, Award, GraduationCap } from "lucide-react";

export const SkillBadge = ({ name, colorClass = "bg-slate-900 text-white" }) => (
  <span className={`px-2 py-1 ${colorClass} rounded text-[10px] font-bold inline-block`}>
    {name.trim()}
  </span>
);


// Template two orange colour start
export const TemplateOne = ({ data, accentColor = "#f97316" }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    } catch (e) { return dateStr; }
  };

  if (!data) return null;

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] mx-auto flex flex-col shadow-2xl print:shadow-none font-sans relative overflow-hidden border-[1px] border-slate-100">
      
      {/* LEFT DESIGNER STRIPE */}
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: accentColor }}></div>

      {/* HEADER SECTION - LARGER TEXT */}
      <header className="relative pt-16 px-16 pb-10">
        <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-[1000] uppercase tracking-tighter text-slate-900 leading-[0.85]">
              {data.personalInfo?.fullName.split(' ')[0]}
            </h1>
            <h1 className="text-6xl font-[1000] uppercase tracking-tighter leading-[0.85]" style={{ color: accentColor }}>
              {data.personalInfo?.fullName.split(' ').slice(1).join(' ')}
            </h1>
        </div>
        
        <div className="flex flex-wrap gap-y-3 gap-x-8 mt-10 text-[13px] font-black uppercase tracking-widest text-slate-600 border-y-2 border-slate-50 py-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45" style={{ backgroundColor: accentColor }}></span>
            {data.personalInfo?.email}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45" style={{ backgroundColor: accentColor }}></span>
            {data.personalInfo?.phone}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45" style={{ backgroundColor: accentColor }}></span>
            {data.personalInfo?.location}
          </div>
        </div>
      </header>

      <div className="px-16 pb-12 flex flex-col gap-12">
        
        {/* SUMMARY - BIGGER TEXT */}
        {data.personalInfo?.summary && (
          <section>
             <p className="text-slate-800 leading-relaxed text-lg font-bold italic border-l-8 pl-8 py-2" style={{ borderColor: accentColor }}>
                "{data.personalInfo.summary}"
             </p>
          </section>
        )}

        {/* WORK EXPERIENCE - 3 ITEMS PER LINE - BOLDER HEADERS */}
        {data.experiences && data.experiences.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-8">
               <h2 className="text-xl font-[1000] uppercase tracking-[6px] whitespace-nowrap text-slate-900">Experience</h2>
               <div className="h-[4px] w-full bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-3 gap-10">
              {data.experiences.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="text-xs font-black mb-2 text-slate-400 uppercase tracking-widest">
                    {formatDate(exp.start)} — {exp.isCurrent ? "Present" : formatDate(exp.end)}
                  </div>
                  <h3 className="font-black text-slate-900 text-base mt-1 uppercase leading-tight">
                    {exp.title}
                  </h3>
                  <p className="text-sm font-black mb-3 italic" style={{ color: accentColor }}>{exp.company}</p>
                  <p className="text-[13px] text-slate-600 leading-snug font-medium line-clamp-6">{exp.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS - BIGGER CARDS */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-8">
               <h2 className="text-xl font-[1000] uppercase tracking-[6px] whitespace-nowrap text-slate-900">Projects</h2>
               <div className="h-[4px] w-full bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/30 hover:bg-white hover:border-orange-100 hover:shadow-xl transition-all">
                  <h4 className="font-black text-slate-900 text-lg uppercase mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: accentColor }}>P</span>
                    {proj.name}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                      <span className="text-slate-400 font-black uppercase">Frontend</span>
                      <span className="text-slate-900 font-black">{proj.frontend}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                      <span className="text-slate-400 font-black uppercase">Backend</span>
                      <span className="text-slate-900 font-black">{proj.backend}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-black uppercase">Database</span>
                      <span className="font-black" style={{ color: accentColor }}>{proj.database}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER AREA - LARGER BOXES */}
        <div className="grid grid-cols-12 gap-12">
          {/* EDUCATION & CERTS */}
          <div className="col-span-7">
            <h2 className="text-lg font-[1000] uppercase tracking-[4px] mb-8 text-slate-900">Education</h2>
              
               {data.edu10 && (
                  <div className="relative pl-6 border-l-4" style={{ borderColor: accentColor }}>
                    <p className="text-[12px] font-black uppercase text-orange-400 mb-1">10th Grade</p>
                    <p className="text-sm font-black text-slate-900 truncate">{data.edu10.school}</p>
                    <p className="text-sm font-black mt-1" style={{ color: accentColor }}>Passing Year: <span className="text-sm font-black text-slate-900 truncate">{data.edu10.year}</span> <br /> Percentage <span className="text-sm font-black text-slate-900 truncate">{data.edu10.grade}</span></p>
                  </div>
                )}
                <hr className="border-t-2 border-orange-400 my-4 w-full" />
                {data.edu12 && (
                   <div className="relative pl-6 border-l-4" style={{ borderColor: accentColor }}>
                    <p className="text-[12px] font-black uppercase text-orange-400 mb-1">12th Grade</p>
                    <p className="text-sm font-black text-slate-900 truncate">{data.edu12.school}</p>
                    <p className="text-sm font-black mt-1" style={{ color: accentColor }}>Passing Year: <span className="text-sm font-black text-slate-900 truncate">{data.edu12.year}</span> <br /> Percentage <span className="text-sm font-black text-slate-900 truncate">{data.edu12.grade}</span></p>
                  </div>
                )}
                <hr className="border-t-2 border-orange-400 my-4 w-full" />
                    <div className="space-y-8">
                      {data.eduDegree && (
                        <div className="relative pl-6 border-l-4" style={{ borderColor: accentColor }}>
                          <p className="text-[12px] font-black uppercase text-orange-400 mb-1">College</p>
                          <p className="text-lg font-black text-slate-900 uppercase leading-tight">{data.eduDegree.college}</p>
                          <p className="text-sm font-black mt-1" style={{ color: accentColor }}>Degree : <span  className="text-sm font-black text-slate-900 truncate" >{data.eduDegree.course} </span>  <br /> CGPA: <span  className="text-sm font-black text-slate-900 truncate" >{data.eduDegree.grade} </span> </p>
                        </div>
                      )}
            </div>
          </div>

          {/* SKILLS AREA */}
          <div className="col-span-5">
            <h2 className="text-lg font-[1000] uppercase tracking-[4px] mb-8 text-slate-900">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {data.skills?.tech?.split(",").map((s, i) => (
                <span key={i} className="px-3 py-2 bg-white border-2 border-slate-100 text-slate-900 text-xs font-black uppercase rounded-lg shadow-sm">
                  {s.trim()}
                </span>
              ))}
            </div>
            
            {data.languages?.length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-slate-50">
                 <h4 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-[2px]">Languages</h4>
                 <div className="flex flex-wrap gap-4">
                    {data.languages.map((l, i) => (
                      <span key={i} className="text-sm font-black text-slate-800">{l}</span>
                    ))}
                 </div>
              </div>
            )}
            {/* language */}

             {(data.personalInfo.portfolio || data.personalInfo.github) && (
              <div className="mt-8 pt-6 border-t-2 border-slate-50">
                <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-[2px]">
                  Online Presence
                </h3>
                <div className="space-y-3">
                  {data.personalInfo.portfolio && (
                    <div className="flex flex-col">
                      <span className="text-sm font-black mt-1" style={{ color: accentColor }}>Portfolio</span>
                      <a href={data.personalInfo.portfolio} target="_blank" rel="noreferrer" className="text-sm text-slate-700 hover:text-fuchsia-600 truncate underline font-medium">
                        {data.personalInfo.portfolio.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  {data.personalInfo.github && (
                    <div className="flex flex-col">
                      <span className="text-sm font-black mt-1" style={{ color: accentColor }}>GitHub</span>
                      <a href={data.personalInfo.github} target="_blank" rel="noreferrer" className="text-sm text-slate-700 hover:text-fuchsia-600 truncate underline font-medium">
                        {data.personalInfo.github.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DECLARATION */}
        {data.declaration && (
          <footer className="mt-auto pt-10 border-t-4 border-slate-50">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Declaration</h4>
            <p className="text-sm italic text-slate-600 font-medium leading-relaxed">
              {data.declaration}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};
// Template two orange colour End

// Template three black and blue colour start

export const TemplateTwo = ({ data, accentColor = "#6366f1" }) => {
  if (!data) return null;

  return (
    <div className="bg-[#f0f0f0] w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none font-sans p-8 gap-6">
      
      {/* NEW HORIZONTAL HEADER (REPLACED VERTICAL STRIP) */}
      <div className="flex gap-6 mb-8">
        {/* Accent Design Box (Replaced Name Strip) */}
        <div 
          className="w-32 h-32 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: accentColor, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }}
        >
          <span className="text-white text-6xl font-black transform -rotate-12 select-none opacity-40">CV</span>
        </div>

        {/* Name and Title Area */}
        <div className="flex-1 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
           {/* Decorative Grid Background */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '15px 15px' }}></div>
           
           <div className="relative z-10">
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2">
                {data.personalInfo?.fullName}
              </h1>
              <div className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                {data.experiences?.[0]?.title || "Professional"}
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* CONTACT & LINKS FLOATING BAR */}
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2">● {data.personalInfo?.email}</span>
            <span className="flex items-center gap-2">● {data.personalInfo?.phone}</span>
            <span className="flex items-center gap-2">● {data.personalInfo?.location}</span> <br />
            <span>{data.personalInfo?.portfolio && <span className="text-slate-600">Portfolio: {data.personalInfo.portfolio}</span>}</span> <br />
            <span>{data.personalInfo?.github && <span className="text-slate-500">GitHub: {data.personalInfo.github}</span>}</span>
          </div>
          <div className="h-4 w-4 rounded-none border-2 border-black rotate-45" style={{ backgroundColor: accentColor }}></div>
        </div>

        {/* MAIN TWO-COLUMN AREA */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT CONTENT (7 Columns) */}
          <div className="col-span-7 space-y-6">
            {/* Experience Section */}
            <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black uppercase italic mb-6 inline-block border-b-8 leading-[0.1] pb-0" style={{ borderColor: accentColor }}>
                Experience
              </h2>
              <div className="space-y-6">
                {data.experiences?.map((exp, i) => (
                  <div key={exp.id || i} className="relative pl-4 border-l-4 border-black/10">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-md font-black uppercase leading-tight">{exp.title}</h4>
                      <span className="text-[8px] font-bold bg-black text-white px-2 py-0.5 whitespace-nowrap ml-2">{exp.start} — {exp.end}</span>
                    </div>
                    <p className="text-xs font-bold uppercase mb-2" style={{ color: accentColor }}>{exp.company}</p>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects Section */}
            <section className="bg-[#fffeb3] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black uppercase italic mb-4">Projects</h2>
              <div className="grid grid-cols-1 gap-4">
                {data.projects?.map((proj, i) => (
                  <div key={proj.id || i} className="border-2 border-black p-3 bg-white hover:translate-x-1 hover:-translate-y-1 transition-transform">
                    <h5 className="font-black text-[11px] uppercase mb-1 border-b-2 border-black pb-1">{proj.name}</h5>
                    <div className="flex flex-wrap gap-x-4 text-[9px] font-bold text-slate-500 uppercase">
                      {proj.frontend && <span>FE: {proj.frontend}</span>}
                      {proj.backend && <span>BE: {proj.backend}</span>}
                      {proj.database && <span>DB: {proj.database}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Declaration Section */}
            {data.declaration && (
              <section className="bg-stone-100 border-2 border-black p-4 border-dashed">
                <p className="text-[10px] font-bold text-slate-500 leading-tight">
                  <span className="font-black uppercase not-italic mr-2">Declaration:</span>
                  {data.declaration}
                </p>
              </section>
            )}
          </div>

          {/* RIGHT CONTENT (5 Columns) */}
          <div className="col-span-5 space-y-6">
             {/* About Section */}
             <section className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-300 border-2 border-black flex items-center justify-center font-bold">"</div>
              <h3 className="text-xs font-black uppercase mb-2">About Me</h3>
              <p className="text-[12px] font-bold leading-tight italic">
                {data.personalInfo?.summary}
              </p>
            </section>

            {/* Tech Stack Section */}
            <section className="bg-[#e0ffcd] border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xs font-black uppercase mb-4 tracking-widest bg-black text-white p-1 text-center">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills?.tech?.split(",").map((s, i) => (
                  <span key={i} className="px-2 py-1 border-2 border-black text-[9px] font-black uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </section>

            {/* Academic Section */}
            <section className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               <h3 className="text-xs font-black uppercase mb-4 border-b-2 border-black pb-1">Education</h3>
               <div className="space-y-4">
                  {data.eduDegree?.college && (
                    <div>
                      <p className="text-[10px] font-black uppercase leading-tight">{data.eduDegree.college}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{data.eduDegree.course} | {data.eduDegree.year}</p>
                      <p className="text-[9px] font-black mt-1" style={{ color: accentColor }}>Result: {data.eduDegree.grade}</p>
                    </div>
                  )}
                  {(data.edu12?.school || data.edu10?.school) && (
                    <div className="text-[9px] font-bold text-slate-400 space-y-2 pt-2 border-t border-black/10">
                      {data.edu12?.school && <p>12TH: {data.edu12.school} ({data.edu12.grade})</p>}
                      {data.edu10?.school && <p>10TH: {data.edu10.school} ({data.edu10.grade})</p>}
                    </div>
                  )}
               </div>
            </section>

            {/* Certifications Section */}
            {data.certifications?.length > 0 && data.certifications[0].name && (
              <section className="bg-orange-50 border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-black uppercase mb-3">Certifications</h3>
                <div className="space-y-3">
                  {data.certifications.map((cert, i) => (
                    <div key={cert.id || i} className="border-b border-black/10 pb-2 last:border-0">
                      <p className="text-[10px] font-black uppercase leading-tight">{cert.name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">{cert.org} | {cert.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages Section */}
            {data.languages?.length > 0 && (
              <section className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-black uppercase mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {data.languages.map((lang, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 border border-black">{lang}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// Template three black and blue colour End

// --- NEW TEMPLATE 4 ADDED BELOW ---

export const TemplateThree = ({ data, accentColor = "#3b82f6" }) => {
  if (!data) return null;

  return (
    <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl text-zinc-800 font-sans flex border border-zinc-200">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-1/3 bg-zinc-900 text-white p-8">

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-[10px] font-black tracking-[3px] text-zinc-300 mb-5 uppercase">Contact</h2>
          <div className="space-y-4 text-xs">
            {data.personalInfo?.phone && (
              <div className="flex items-center gap-3">
                <Phone size={14} style={{ color: accentColor }} />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo?.email && (
              <div className="flex items-center gap-3">
                <Mail size={14} style={{ color: accentColor }} />
                <span className="break-all">{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo?.location && (
              <div className="flex items-center gap-3">
                <MapPin size={14} style={{ color: accentColor }} />
                <span>{data.personalInfo.location}</span>
              </div>
            )}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-10">
          <h2 className="text-[10px] font-black tracking-[3px] text-zinc-300 mb-5 uppercase">Core Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills?.tech?.split(",").map((skill, i) => (
              <span key={i} className="bg-zinc-800 px-2 py-1 rounded text-[12px] border border-zinc-700">
                {skill.trim()}
              </span>
            ))}
          </div>
        </section>

        {/* Languages - ADDED */}
        {data.languages && data.languages.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[12px] font-black tracking-[3px] text-zinc-300 mb-5 uppercase">Languages</h2>
            <div className="text-[12px] space-y-2 text-zinc-300">
              {data.languages.map((lang, i) => (
                <p key={i}>{lang}</p>
              ))}
            </div>
          </section>
        )}

        {/* Academic */}
        <section>
          <h2 className="text-[12px] font-black tracking-[3px] text-zinc-300 mb-5 uppercase">Academic</h2>
          <div className="space-y-5">
            {data.eduDegree && (
              <div className="text-xs">
                <p className="font-bold uppercase" style={{ color: accentColor }}>{data.eduDegree.course || 'Degree'}</p>
                <p className="text-zinc-100 font-medium">{data.eduDegree.college}</p>
                <p className="text-[10px] text-zinc-400">{data.eduDegree.year} | CGPA: {data.eduDegree.grade}</p>
              </div>
            )}
            {data.edu12 && (
              <div className="text-xs">
                <p className="font-bold uppercase" style={{ color: accentColor }}>12th Grade</p>
                <p className="text-zinc-100 font-medium">{data.edu12.school}</p>
                <p className="text-[10px] text-zinc-400">{data.edu12.year} | {data.edu12.grade}%</p>
              </div>
            )}
            {data.edu10 && (
              <div className="text-xs">
                <p className="font-bold uppercase" style={{ color: accentColor }}>10th Grade</p>
                <p className="text-zinc-100 font-medium">{data.edu10.school}</p>
                <p className="text-[10px] text-zinc-400">{data.edu10.year} | {data.edu10.grade}%</p>
              </div>
            )}
          </div>
        </section>
      </aside>

      {/* --- RIGHT MAIN CONTENT --- */}
      <main className="w-2/3 p-12 bg-white">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase mb-2">
            {data.personalInfo?.fullName}
          </h1>
          <div className="h-1 w-20 mb-4" style={{ backgroundColor: accentColor }}></div>
        </header>

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-black tracking-[4px] text-zinc-500 mb-6 uppercase flex items-center gap-2">
              <Briefcase size={16} /> Experience
            </h2>
            <div className="space-y-6">
              {data.experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-zinc-800 text-md uppercase">{exp.title}</h3>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                       {exp.start} - {exp.end || 'Present'}
                    </span>
                  </div>
                  <p className="font-bold text-xs uppercase mb-2" style={{ color: accentColor }}>{exp.company}</p>
                  <p className="text-sm text-zinc-600 leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-black tracking-[4px] text-zinc-500 mb-6 uppercase">Projects</h2>
            <div className="grid grid-cols-1 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="border-l-2 border-zinc-100 pl-4">
                  <h3 className="font-bold text-zinc-800 uppercase text-sm">{proj.name}</h3>
                  <p className="text-[15px] text-zinc-500 mt-1">
                    <span className="font-bold" style={{ color: accentColor }}> Frontend: </span> {proj.frontend} <br />
                    <span className="font-bold" style={{ color: accentColor }} > Backend:  </span> {proj.backend} <br />
                    <span className="font-bold" style={{ color: accentColor }}> Database: </span>{proj.database && `/ ${proj.database}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications - ADDED */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-black tracking-[4px] text-zinc-500 mb-6 uppercase">Certifications</h2>
            <div className="space-y-3">
              {data.certifications.map((cert, i) => (
                <div key={i} className="text-sm">
                  <p className="font-bold text-zinc-800">{cert.name}</p>
                  <p className="text-xs text-zinc-500">{cert.org} | {cert.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Declaration - ADDED */}
        {data.declaration && (
          <section className="mt-12 pt-6 border-t border-zinc-100">
            <h2 className="text-[10px] font-black tracking-[2px] text-zinc-400 uppercase mb-2">Declaration</h2>
            <p className="text-[11px] text-zinc-500 italic">{data.declaration}</p>
          </section>
        )}
      </main>
    </div>
  );
};
export const TemplateFour = ({ data, accentColor = "#1e40af" }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short"
            });
        } catch (e) {
            return dateStr;
        }
    };

    if (!data) return null;

    return (
        <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-gray-800 shadow-lg print:shadow-none overflow-hidden font-sans">
            {/* Header */}
            <header className="p-10 text-white" style={{ backgroundColor: accentColor }}>
                <h1 className="text-5xl font-black mb-6 tracking-tight uppercase">
                    {data.personalInfo?.fullName || "Your Name"}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm opacity-90 font-medium">
                    {data.personalInfo?.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo?.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo?.location && <div>{data.personalInfo.location}</div>}
                </div>
            </header>

            <div className="p-10">
                {/* About Me */}
                {data.personalInfo?.summary && (
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 uppercase tracking-widest text-gray-900" style={{ borderColor: accentColor }}>
                            About Me
                        </h2>
                        <p className="text-gray-700 leading-relaxed italic border-l-4 pl-4" style={{ borderColor: accentColor }}>
                            "{data.personalInfo.summary}"
                        </p>
                    </section>
                )}

                {/* Experience - 3 items per line */}
                {data.experiences && data.experiences.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 uppercase tracking-widest text-gray-900" style={{ borderColor: accentColor }}>
                            Work Experience
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {data.experiences.map((exp, index) => (
                                <div key={index} className="relative pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                                    <div className="mb-1">
                                        <h3 className="text-sm font-black text-gray-900 uppercase leading-tight">{exp.title}</h3>
                                        <p className="font-bold text-xs" style={{ color: accentColor }}>{exp.company}</p>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">
                                        {formatDate(exp.start)} — {exp.isCurrent ? "Present" : formatDate(exp.end)}
                                    </div>
                                    {exp.desc && <p className="text-gray-600 text-[11px] leading-snug line-clamp-4">{exp.desc}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects Section - Added Database Display */}
                {data.projects && data.projects.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 uppercase tracking-widest text-gray-900" style={{ borderColor: accentColor }}>
                            Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.projects.map((proj, i) => (
                                <div key={i} className="p-4 rounded border-l-4 bg-gray-50" style={{ borderColor: accentColor }}>
                                    <h4 className="font-bold text-gray-900 uppercase text-sm mb-2">{proj.name}</h4>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-600"><strong>Frontend:</strong> {proj.frontend}</p>
                                        <p className="text-xs text-gray-600"><strong>Backend:</strong> {proj.backend}</p>
                                        {/* DATABASE FIELD DISPLAY */}
                                        {proj.database && (
                                            <p className="text-xs text-gray-600"><strong>Database:</strong> {proj.database}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Education Column */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 uppercase tracking-widest text-gray-900" style={{ borderColor: accentColor }}>
                            Education
                        </h2>
                        <div className="space-y-6">
                            {data.eduDegree && (
                                <div>
                                    <p className="font-bold text-xs uppercase" style={{ color: accentColor }}>Degree</p>
                                    <h3 className="font-black text-gray-900 text-sm uppercase">{data.eduDegree.college}</h3>
                                    <p className="text-xs font-bold text-gray-500">Grade: {data.eduDegree.grade}</p>
                                </div>
                            )}
                            {data.edu12 && (
                                <div>
                                    <p className="font-bold text-xs uppercase" style={{ color: accentColor }}>12th Grade</p>
                                    <h3 className="font-black text-gray-900 text-sm uppercase">{data.edu12.school}</h3>
                                    <p className="text-xs font-bold text-gray-500">{data.edu12.year} | {data.edu12.grade}</p>
                                </div>
                            )}
                            {data.edu10 && (
                                <div>
                                    <p className="font-bold text-xs uppercase" style={{ color: accentColor }}>10th Grade</p>
                                    <h3 className="font-black text-gray-900 text-sm uppercase">{data.edu10.school}</h3>
                                    <p className="text-xs font-bold text-gray-500">{data.edu10.year} | {data.edu10.grade}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Skills Column */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 uppercase tracking-widest text-gray-900" style={{ borderColor: accentColor }}>
                            Skills & Languages
                        </h2>
                        
                        {/* Tech Skills */}
                        <div className="mb-6">
                            <h3 className="text-xs font-black uppercase mb-3 text-gray-500 tracking-tighter">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.skills?.tech?.split(",").map((skill, index) => (
                                    <span key={index} className="px-3 py-1 text-[10px] font-black uppercase text-white rounded" style={{ backgroundColor: accentColor }}>
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Database Skills (if separate in your data) */}
                        {data.skills?.database && (
                             <div className="mb-6">
                             <h3 className="text-xs font-black uppercase mb-3 text-gray-500 tracking-tighter">Databases</h3>
                             <div className="flex flex-wrap gap-2">
                                 {data.skills.database.split(",").map((db, index) => (
                                     <span key={index} className="px-3 py-1 text-[10px] font-black uppercase border border-gray-300 rounded text-gray-700">
                                         {db.trim()}
                                     </span>
                                 ))}
                             </div>
                         </div>
                        )}

                        {data.languages?.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black uppercase mb-3 text-gray-500 tracking-tighter">Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.languages.map((lang, i) => (
                                        <span key={i} className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Declaration */}
                {data.declaration && (
                    <section className="mt-12 pt-6 border-t">
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">Declaration</h2>
                        <p className="text-sm italic text-gray-600">{data.declaration}</p>
                    </section>
                )}
            </div>
        </div>
    );
};
export const TemplateFive = ({ data, accentColor = "#0f172a" }) => {
  if (!data) return null;

  return (
    <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-800 shadow-2xl print:shadow-none flex overflow-hidden font-sans">
      
      {/* SIDEBAR (Left Column) */}
      <aside 
        className="w-[38%] p-12 text-white flex flex-col gap-10 relative overflow-hidden" 
        style={{ backgroundColor: accentColor }}
      >
        {/* Subtle Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-white/5 -skew-y-12 transform origin-top-left"></div>

        {/* Profile Image / Initials Placeholder */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-32 h-32 bg-white text-slate-900 rounded-2xl rotate-3 flex items-center justify-center text-5xl font-black mb-6 shadow-xl">
            <span className="-rotate-3">
              {data.personalInfo?.fullName?.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-center leading-none uppercase tracking-tighter mb-2">
            {data.personalInfo?.fullName}
          </h1>
          <div className="h-1 w-12 bg-white/30 rounded-full"></div>
        </div>

        {/* Contact Section */}
        <section className="relative z-10">
          <h2 className="text-[11px] font-black uppercase tracking-[4px] border-b-2 border-white/20 pb-2 mb-6 text-white/90">
            Contact
          </h2>
          <div className="space-y-5 text-[12px]">
            {[
              { label: "Phone", value: data.personalInfo?.phone },
              { label: "Email", value: data.personalInfo?.email },
              { label: "Location", value: data.personalInfo?.location },
              { label: "Portfolio", value: data.personalInfo?.portfolio },
              { label: "GitHub", value: data.personalInfo?.github },
            ].map((item, i) => item.value && (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-black uppercase text-[9px] tracking-widest text-white/50">{item.label}</span>
                <span className="font-bold break-all">{item.value.replace(/^https?:\/\//, '')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        {data.skills?.tech && (
          <section className="relative z-10">
            <h2 className="text-[11px] font-black uppercase tracking-[4px] border-b-2 border-white/20 pb-2 mb-6 text-white/90">
              Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.tech.split(",").map((skill, i) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-tight bg-white/10 px-3 py-1.5 rounded-md border border-white/10 hover:bg-white hover:text-slate-900 transition-colors cursor-default">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION SECTION */}
        <section className="relative z-10 mt-auto">
          <h2 className="text-[11px] font-black uppercase tracking-[4px] border-b-2 border-white/20 pb-2 mb-6 text-white/90">
            Education
          </h2>
          <div className="space-y-6">
            {data.eduDegree?.college && (
              <div className="border-l-2 border-white/30 pl-4 py-1">
                <p className="text-[10px] font-black uppercase text-white/50 mb-1">{data.eduDegree.year}</p>
                <p className="text-[13px] font-black leading-tight mb-1">{data.eduDegree.course}</p>
                <p className="text-[11px] font-bold italic text-white/80">{data.eduDegree.college} • {data.eduDegree.grade}</p>
              </div>
            )}
            {/* 12th & 10th condensed */}
            <div className="grid grid-cols-1 gap-4 opacity-80">
              {data.edu12?.school && (
                <p className="text-[11px] font-bold">12th: {data.edu12.school} ({data.edu12.grade})</p>
              )}
              {data.edu10?.school && (
                <p className="text-[11px] font-bold">10th: {data.edu10.school} ({data.edu10.grade})</p>
              )}
            </div>
          </div>
        </section>
      </aside>

      {/* MAIN CONTENT (Right Column) */}
      <main className="w-[62%] p-16 bg-white flex flex-col">
        
        {/* Profile / Summary */}
        <section className="mb-14">
          <h2 className="text-lg font-black uppercase tracking-[6px] mb-6 flex items-center gap-4 text-slate-900">
            Profile
            <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed font-bold italic border-l-4 border-slate-900 pl-6 py-2">
            "{data.personalInfo.summary}"
          </p>
        </section>

        {/* Experience Section */}
        {data.experiences?.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-black uppercase tracking-[6px] mb-8 flex items-center gap-4 text-slate-900">
              Experience
              <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
            </h2>
            <div className="space-y-10">
              {data.experiences.map((exp, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                      {exp.title}
                    </h3>
                    <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase">
                      {exp.start} — {exp.end || "Present"}
                    </span>
                  </div>
                  <p className="text-sm font-black mb-3 uppercase tracking-widest underline decoration-2 underline-offset-4" style={{ color: accentColor }}>
                    {exp.company}
                  </p>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                    {exp.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {data.projects?.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-black uppercase tracking-[6px] mb-8 flex items-center gap-4 text-slate-900">
              Projects
              <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-6 border-2 border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                  <h4 className="font-black text-sm uppercase mb-4 tracking-tighter bg-slate-900 text-white inline-block px-3 py-1 rounded">
                    {proj.name}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "FE", val: proj.frontend },
                      { label: "BE", val: proj.backend },
                      { label: "DB", val: proj.database }
                    ].map((tech, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tech.label}</span>
                        <span className="text-[11px] font-bold text-slate-700 truncate">{tech.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS & DECLARATION BOTTOM GROUP */}
        <div className="mt-auto grid grid-cols-1 gap-8">
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-4">Certifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                    <div>
                      <p className="font-black text-[12px] text-slate-900 leading-tight">{cert.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{cert.org}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.declaration && (
            <section className="pt-6 border-t-2 border-slate-50">
              <p className="text-[11px] text-slate-400 italic leading-relaxed font-medium">
                <span className="font-black uppercase not-italic mr-2">Declaration:</span>
                {data.declaration}
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};