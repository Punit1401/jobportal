// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import UserSidebar from "@/components/UserSidebar";


// const ResumeBuilder = () => {
//   const router = useRouter();

//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const [declaration] = useState(
//     "I hereby declare that the information provided above is true and correct to the best of my knowledge and belief."
//   );

//   // Initial States for resetting
//   const [personalInfo, setPersonalInfo] = useState({
//     fullName: "",
//     email: "",
//     phone: "",
//     location: "",
//     summary: "",
//   });

//   const [links, setLinks] = useState({
//     github: "",
//     portfolio: ""
//   });

//   const [edu10, setEdu10] = useState({ school: "", year: "", grade: "" });
//   const [edu12, setEdu12] = useState({ school: "", year: "", grade: "" });

//   const [eduDegree, setEduDegree] = useState({
//     course: "",
//     college: "",
//     year: "",
//     grade: "",
//   });

//   const [projects, setProjects] = useState([
//     { id: Date.now(), name: "", frontend: "", backend: "", database: "" },
//   ]);

//   const [skills, setSkills] = useState({ tech: "", soft: "", lang: "" });

//   const [experiences, setExperiences] = useState([
//     { id: Date.now(), title: "", company: "", start: "", end: "", desc: "" },
//   ]);

//   const [certifications, setCertifications] = useState([
//     { id: Date.now(), name: "", org: "", date: "", credentialId: "" },
//   ]);

//   const [languages, setLanguages] = useState({
//     list: [],
//     current: ""
//   });

//   useEffect(() => {
//     const stored = localStorage.getItem("resumeData");
//     if (stored) {
//       try {
//         const data = JSON.parse(stored);
//         if (data.personalInfo) setPersonalInfo(data.personalInfo);
//         if (data.links) setLinks(data.links);
//         if (data.edu10) setEdu10(data.edu10);
//         if (data.edu12) setEdu12(data.edu12);
//         if (data.eduDegree) setEduDegree(data.eduDegree);
//         if (data.projects) setProjects(data.projects);
//         if (data.skills) setSkills(data.skills);
//         if (data.experiences) setExperiences(data.experiences);
//         if (data.certifications) setCertifications(data.certifications);
//         if (data.languages) setLanguages({ list: data.languages, current: "" });
//       } catch (error) {
//         console.error("Error loading stored data", error);
//       }
//     }
//   }, []);

//   const inputStyle =
//     "input-focus w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none transition-all";

//   const subInputStyle =
//     "input-focus w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none transition-all";

//   // --- LOGIC FUNCTIONS ---

//   const handleClearAll = () => {
//     if (window.confirm("Are you sure you want to clear all fields? This will also remove saved data.")) {
//       setPersonalInfo({ fullName: "", email: "", phone: "", location: "", summary: "" });
//       setLinks({ github: "", portfolio: "" });
//       setEdu10({ school: "", year: "", grade: "" });
//       setEdu12({ school: "", year: "", grade: "" });
//       setEduDegree({ course: "", college: "", year: "", grade: "" });
//       setProjects([{ id: Date.now(), name: "", frontend: "", backend: "", database: "" }]);
//       setSkills({ tech: "", soft: "", lang: "" });
//       setExperiences([{ id: Date.now(), title: "", company: "", start: "", end: "", desc: "" }]);
//       setCertifications([{ id: Date.now(), name: "", org: "", date: "", credentialId: "" }]);
//       setLanguages({ list: [], current: "" });
//       localStorage.removeItem("resumeData");
//     }
//   };

//   const addExperience = () => {
//     setExperiences((prev) => [
//       ...prev,
//       { id: Date.now(), title: "", company: "", start: "", end: "", desc: "" },
//     ]);
//   };

//   const addProject = () => {
//     setProjects((prev) => [
//       ...prev,
//       { id: Date.now(), name: "", frontend: "", backend: "", database: "" },
//     ]);
//   };

//   const updateExperience = (id, field, value) => {
//     setExperiences((prev) =>
//       prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
//     );
//   };

//   const updateProject = (id, field, value) => {
//     setProjects((prev) =>
//       prev.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj))
//     );
//   };

//   const addCertification = () => {
//     setCertifications((prev) => [
//       ...prev,
//       { id: Date.now(), name: "", org: "", date: "", credentialId: "" },
//     ]);
//   };

//   const updateCertification = (id, field, value) => {
//     setCertifications((prev) =>
//       prev.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
//     );
//   };

//   const addLanguage = () => {
//     if (languages.current.trim() !== "") {
//       setLanguages(prev => ({
//         list: [...prev.list, prev.current.trim()],
//         current: ""
//       }));
//     }
//   };

//   const removeLanguage = (langToRemove) => {
//     setLanguages(prev => ({
//       ...prev,
//       list: prev.list.filter(l => l !== langToRemove)
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const resumeData = {
//       personalInfo,
//       links,
//       edu10,
//       edu12,
//       eduDegree,
//       projects,
//       skills,
//       experiences,
//       certifications,
//       declaration,
//       languages: languages.list
//     };

//     localStorage.setItem("resumeData", JSON.stringify(resumeData));

//     setTimeout(() => {
//       setIsLoading(false);
//       setShowSuccess(true);
//       setTimeout(() => {
//         router.push("/user/resumebuilder/resumepreview");
//       }, 800);
//     }, 1000);
//   };

//   return (
//     <div
//       className="h-full w-full overflow-auto min-h-screen pb-20"
//       style={{
//         background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
//         fontFamily: "'DM Sans', sans-serif",
//       }}
//     >
//       <style>{`
//         .form-section { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .input-focus:focus {
//           box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
//           border-color: #6366f1;
//         }
//         .btn-hover { transition: all 0.2s ease; }
//         .btn-hover:hover { transform: translateY(-1px); }
//         .section-card { transition: all 0.3s ease; }
//         .section-card:hover {
//           box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
//         }
//       `}</style>
//       <UserSidebar />
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <header className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
//             style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-slate-800 mb-2">Resume Builder</h1>
//           <p className="text-slate-500">Fill in your details and choose from 3 unique designs</p>
//         </header>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* PERSONAL INFO */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100" style={{ animationDelay: '0.1s' }}>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
//                 <svg className="w-5 h-5" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
//               </div>
//               <h2 className="text-xl font-semibold text-slate-800">Personal Information</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input type="text" required value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} className={inputStyle} placeholder="Full Name *" />
//               <input type="email" required value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} className={inputStyle} placeholder="Email Address *" />
//               <input type="tel" required value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className={inputStyle} placeholder="Phone Number *" />
//               <input type="text" value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} className={inputStyle} placeholder="Location" />
//               <textarea rows="3" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} className={inputStyle + " resize-none col-span-1 md:col-span-2"} placeholder="Professional Summary..."></textarea>
//             </div>
//           </section>

//           {/* EDUCATION */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">Ed</div>
//               Education Details
//             </h2>
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-widest italic">10th Standard</div>
//               <input placeholder="School Name" className={subInputStyle} value={edu10.school} onChange={(e) => setEdu10({ ...edu10, school: e.target.value })} />
//               <input placeholder="Year" type="number" className={subInputStyle} value={edu10.year} onChange={(e) => setEdu10({ ...edu10, year: e.target.value })} />
//               <input placeholder="Percentage" className={subInputStyle + " col-span-2"} value={edu10.grade} onChange={(e) => setEdu10({ ...edu10, grade: e.target.value })} />
//             </div>
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-widest italic">12th Standard</div>
//               <input placeholder="School/Junior College" className={subInputStyle} value={edu12.school} onChange={(e) => setEdu12({ ...edu12, school: e.target.value })} />
//               <input placeholder="Year" type="number" className={subInputStyle} value={edu12.year} onChange={(e) => setEdu12({ ...edu12, year: e.target.value })} />
//               <input placeholder="Percentage" className={subInputStyle + " col-span-2"} value={edu12.grade} onChange={(e) => setEdu12({ ...edu12, grade: e.target.value })} />
//             </div>
//             <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 italic">Degree / Graduation</p>
//               <div className="grid grid-cols-2 gap-4">
//                 <input placeholder="Course" className={subInputStyle + " col-span-2"} value={eduDegree.course} onChange={(e) => setEduDegree({ ...eduDegree, course: e.target.value })} />
//                 <input placeholder="College Name" className={subInputStyle} value={eduDegree.college} onChange={(e) => setEduDegree({ ...eduDegree, college: e.target.value })} />
//                 <input placeholder="Year" type="number" className={subInputStyle} value={eduDegree.year} onChange={(e) => setEduDegree({ ...eduDegree, year: e.target.value })} />
//                 <input placeholder="Percentage" className={subInputStyle + " col-span-2"} value={eduDegree.grade} onChange={(e) => setEduDegree({ ...eduDegree, grade: e.target.value })} />
//               </div>
//             </div>
//           </section>

//           {/* PROJECTS */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
//                   <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
//                 </div>
//                 Projects
//               </h2>
//               <button type="button" onClick={addProject} className="btn-hover bg-sky-500 px-3 py-1.5 text-sm font-medium rounded-lg text-white"> Add Project </button>
//             </div>
//             {projects.map((proj) => (
//               <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <input placeholder="Project Name" className={subInputStyle + " md:col-span-2"} value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} />
//                 <input placeholder="Frontend" className={subInputStyle} value={proj.frontend} onChange={(e) => updateProject(proj.id, 'frontend', e.target.value)} />
//                 <input placeholder="Backend" className={subInputStyle} value={proj.backend} onChange={(e) => updateProject(proj.id, 'backend', e.target.value)} />
//                 <input placeholder="Database Name" className={subInputStyle + " md:col-span-2"} value={proj.database} onChange={(e) => updateProject(proj.id, 'database', e.target.value)} />
//               </div>
//             ))}
//           </section>

//           {/* EXPERIENCE */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
//                   <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>
//                 </div>
//                 Work Experience
//               </h2>
//               <button type="button" onClick={addExperience} className="btn-hover bg-indigo-600 px-3 py-1.5 text-sm font-medium rounded-lg text-white">Add Role</button>
//             </div>
//             {experiences.map((exp) => (
//               <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 mb-4 grid grid-cols-2 gap-4">
//                 <input placeholder="Job Title" className={subInputStyle} value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} />
//                 <input placeholder="Company" className={subInputStyle} value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
//                 <input type="date" className={subInputStyle} value={exp.start} onChange={(e) => updateExperience(exp.id, 'start', e.target.value)} />
//                 <input type="date" className={subInputStyle} value={exp.end} onChange={(e) => updateExperience(exp.id, 'end', e.target.value)} />
//                 <textarea rows="2" placeholder="Responsibilities" className={subInputStyle + " col-span-2"} value={exp.desc} onChange={(e) => updateExperience(exp.id, 'desc', e.target.value)} />
//               </div>
//             ))}
//           </section>

//           {/* SKILLS */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">S</div> Skills
//             </h2>
//             <textarea placeholder="Technical Skills" className={inputStyle} rows="2" value={skills.tech} onChange={(e) => setSkills({ ...skills, tech: e.target.value })} />
//           </section>

//           {/* LANGUAGES */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">L</div> Languages
//             </h2>
//             <div className="flex gap-2 mb-4">
//               <input
//                 type="text"
//                 placeholder="Type language and click Add"
//                 className={inputStyle}
//                 value={languages.current}
//                 onChange={(e) => setLanguages({ ...languages, current: e.target.value })}
//                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
//               />
//               <button type="button" onClick={addLanguage} className="btn-hover bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Add</button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {languages.list.map((lang, idx) => (
//                 <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-medium animate-fadeIn">
//                   {lang}
//                   <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-red-500 font-bold text-lg leading-none">×</button>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* LINKS */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">L</div> Links
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input type="url" placeholder="GitHub" className={subInputStyle} value={links.github} onChange={(e) => setLinks({ ...links, github: e.target.value })} />
//               <input type="url" placeholder="Portfolio" className={subInputStyle} value={links.portfolio} onChange={(e) => setLinks({ ...links, portfolio: e.target.value })} />
//             </div>
//           </section>

//           {/* DECLARATION */}
//           <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//             <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">D</div> Declaration
//             </h2>
//             <textarea className={inputStyle} rows="3" value={declaration} readOnly />
//           </section>

//           {/* ACTION BUTTONS */}
//           <div className="flex gap-4 justify-center pt-6">
//             <button
//               type="submit"
//               className="btn-hover bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200"
//             >
//               Preview Designs
//             </button>
//             <button
//               type="button"
//               onClick={handleClearAll}
//               className="btn-hover bg-white text-red-500 border border-red-200 px-10 py-4 rounded-xl font-bold shadow-sm"
//             >
//               Clear All
//             </button>
//           </div>
//         </form>

//         {showSuccess && <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50">CV Data Processed!</div>}

//         {isLoading && (
//           <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
//             <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
//               <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//               <p className="font-bold text-slate-600">Generating Designs...</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResumeBuilder;
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";

const ResumeBuilder = () => {
  const router = useRouter();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [declaration] = useState(
    "I hereby declare that the information provided above is true and correct to the best of my knowledge and belief."
  );

  // Initial States
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  });

  const [links, setLinks] = useState({
    github: "",
    portfolio: ""
  });

  const [edu10, setEdu10] = useState({ school: "", year: "", grade: "" });
  const [edu12, setEdu12] = useState({ school: "", year: "", grade: "" });

  const [eduDegree, setEduDegree] = useState({
    course: "",
    college: "",
    year: "",
    grade: "",
  });

  const [projects, setProjects] = useState([
    { id: Date.now(), name: "", frontend: "", backend: "", database: "" },
  ]);

  const [skills, setSkills] = useState({ tech: "", soft: "", lang: "" });

  const [experiences, setExperiences] = useState([
    { id: Date.now(), title: "", company: "", start: "", end: "", desc: "" },
  ]);

  const [certifications, setCertifications] = useState([
    { id: Date.now(), name: "", org: "", date: "", credentialId: "" },
  ]);

  const [languages, setLanguages] = useState({
    list: [],
    current: ""
  });

  // Fetch Dynamic User Profile Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/candidates"); // તમારી પ્રોફાઈલ API નો પાથ
        const userData = await response.json();

        const stored = localStorage.getItem("resumeData");

        // જો localstorage ખાલી હોય તો જ Profile data સેટ કરવો
        if (!stored && userData) {
          setPersonalInfo({
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.mobile || "",
            location: [userData.city, userData.state].filter(Boolean).join(", ") || "",
            summary: userData.profession || "",
          });
          
          setLinks({
            github: userData.github || "",
            portfolio: userData.portfolio || ""
          });

          setEdu10({
            school: userData.classXSchool || "",
            year: userData.classXYear || "",
            grade: userData.classXPercentage || ""
          });

          setEdu12({
            school: userData.classXIISchool || "",
            year: userData.classXIIYear || "",
            grade: userData.classXIIPercentage || ""
          });

          const grad = (userData.formalEducations || []).find(e => e.type === "Graduation") || {};
          setEduDegree({
            course: grad.specialization || userData.graduationSpecialization || "",
            college: grad.institute || userData.graduationInstitute || "",
            year: grad.year || userData.graduationYear || "",
            grade: grad.percentage || userData.graduationPercentage || ""
          });

          if (userData.skills && Array.isArray(userData.skills) && userData.skills.length > 0) {
            setSkills(prev => ({ ...prev, tech: userData.skills.join(", ") }));
          }

          if (userData.workExperiences && userData.workExperiences.length > 0) {
            const exps = userData.workExperiences.map((w, idx) => ({
              id: Date.now() + idx,
              title: w.jobDepartment || w.position || "",
              company: w.currentCompanyName || "",
              start: w.jobFromDate || "",
              end: w.jobToDate || "",
              desc: w.jobDescription || ""
            }));
            setExperiences(exps);
          } else if (userData.currentCompanyName) {
            setExperiences([{
              id: Date.now(),
              title: userData.jobDepartment || userData.position || "",
              company: userData.currentCompanyName || "",
              start: userData.jobFromDate || "",
              end: userData.jobToDate || "",
              desc: userData.jobDescription || ""
            }]);
          }
        }

        if (stored) {
          const data = JSON.parse(stored);
          if (data.personalInfo) setPersonalInfo(data.personalInfo);
          if (data.links) setLinks(data.links);
          if (data.edu10) setEdu10(data.edu10);
          if (data.edu12) setEdu12(data.edu12);
          if (data.eduDegree) setEduDegree(data.eduDegree);
          if (data.projects) setProjects(data.projects);
          if (data.skills) setSkills(data.skills);
          if (data.experiences) setExperiences(data.experiences);
          if (data.certifications) setCertifications(data.certifications);
          if (data.languages) setLanguages({ list: data.languages, current: "" });
        }
      } catch (error) {
        console.error("Error loading user profile", error);
      }
    };

    fetchUserData();
  }, []);

  const inputStyle =
    "input-focus w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none transition-all";

  const subInputStyle =
    "input-focus w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none transition-all";

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all fields? This will also remove saved data.")) {
      setPersonalInfo({ fullName: "", email: "", phone: "", location: "", summary: "" });
      setLinks({ github: "", portfolio: "" });
      setEdu10({ school: "", year: "", grade: "" });
      setEdu12({ school: "", year: "", grade: "" });
      setEduDegree({ course: "", college: "", year: "", grade: "" });
      setProjects([{ id: Date.now(), name: "", frontend: "", backend: "", database: "" }]);
      setSkills({ tech: "", soft: "", lang: "" });
      setExperiences([{ id: Date.now(), title: "", company: "", start: "", end: "", desc: "" }]);
      setCertifications([{ id: Date.now(), name: "", org: "", date: "", credentialId: "" }]);
      setLanguages({ list: [], current: "" });
      localStorage.removeItem("resumeData");
    }
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { id: Date.now(), title: "", company: "", start: "", end: "", desc: "" },
    ]);
  };

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      { id: Date.now(), name: "", frontend: "", backend: "", database: "" },
    ]);
  };

  const updateExperience = (id, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const updateProject = (id, field, value) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj))
    );
  };

  const addCertification = () => {
    setCertifications((prev) => [
      ...prev,
      { id: Date.now(), name: "", org: "", date: "", credentialId: "" },
    ]);
  };

  const updateCertification = (id, field, value) => {
    setCertifications((prev) =>
      prev.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  const addLanguage = () => {
    if (languages.current.trim() !== "") {
      setLanguages(prev => ({
        list: [...prev.list, prev.current.trim()],
        current: ""
      }));
    }
  };

  const removeLanguage = (langToRemove) => {
    setLanguages(prev => ({
      ...prev,
      list: prev.list.filter(l => l !== langToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const resumeData = {
      personalInfo,
      links,
      edu10,
      edu12,
      eduDegree,
      projects,
      skills,
      experiences,
      certifications,
      declaration,
      languages: languages.list
    };

    localStorage.setItem("resumeData", JSON.stringify(resumeData));

    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/user/resumebuilder/resumepreview");
      }, 800);
    }, 1000);
  };

  return (
    <div
      className="h-full w-full overflow-auto min-h-screen pb-20"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        .form-section { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input-focus:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          border-color: #6366f1;
        }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: translateY(-1px); }
        .section-card { transition: all 0.3s ease; }
        .section-card:hover {
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <UserSidebar />
      <div className=" max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Resume Builder</h1>
          <p className="text-slate-500">Fill in your details and choose from 3 unique designs</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
                <svg className="w-5 h-5" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" required value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} className={inputStyle} placeholder="Full Name *" />
              <input type="email" required value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} className={inputStyle} placeholder="Email Address *" />
              <input type="tel" required value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className={inputStyle} placeholder="Phone Number *" />
              <input type="text" value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} className={inputStyle} placeholder="Location" />
              <textarea rows="3" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} className={inputStyle + " resize-none col-span-1 md:col-span-2"} placeholder="Professional Summary..."></textarea>
            </div>
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">Ed</div> Education Details
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-widest italic">10th Standard</div>
              <input placeholder="School Name" className={subInputStyle} value={edu10.school} onChange={(e) => setEdu10({ ...edu10, school: e.target.value })} />
              <input placeholder="Year" type="number" className={subInputStyle} value={edu10.year} onChange={(e) => setEdu10({ ...edu10, year: e.target.value })} />
              <input placeholder="Percentage" className={subInputStyle + " col-span-2"} value={edu10.grade} onChange={(e) => setEdu10({ ...edu10, grade: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-widest italic">12th Standard</div>
              <input placeholder="School/Junior College" className={subInputStyle} value={edu12.school} onChange={(e) => setEdu12({ ...edu12, school: e.target.value })} />
              <input placeholder="Year" type="number" className={subInputStyle} value={edu12.year} onChange={(e) => setEdu12({ ...edu12, year: e.target.value })} />
              <input placeholder="Percentage" className={subInputStyle + " col-span-2"} value={edu12.grade} onChange={(e) => setEdu12({ ...edu12, grade: e.target.value })} />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 italic">Degree / Graduation</p>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Course" className={subInputStyle + " col-span-2"} value={eduDegree.course} onChange={(e) => setEduDegree({ ...eduDegree, course: e.target.value })} />
                <input placeholder="College Name" className={subInputStyle} value={eduDegree.college} onChange={(e) => setEduDegree({ ...eduDegree, college: e.target.value })} />
                <input placeholder="Year" type="number" className={subInputStyle} value={eduDegree.year} onChange={(e) => setEduDegree({ ...eduDegree, year: e.target.value })} />
                <input placeholder="Percentage" className={subInputStyle + " col-span-2"} value={eduDegree.grade} onChange={(e) => setEduDegree({ ...eduDegree, grade: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                Projects
              </h2>
              <button type="button" onClick={addProject} className="btn-hover bg-sky-500 px-3 py-1.5 text-sm font-medium rounded-lg text-white"> Add Project </button>
            </div>
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Project Name" className={subInputStyle + " md:col-span-2"} value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} />
                <input placeholder="Frontend" className={subInputStyle} value={proj.frontend} onChange={(e) => updateProject(proj.id, 'frontend', e.target.value)} />
                <input placeholder="Backend" className={subInputStyle} value={proj.backend} onChange={(e) => updateProject(proj.id, 'backend', e.target.value)} />
                <input placeholder="Database Name" className={subInputStyle + " md:col-span-2"} value={proj.database} onChange={(e) => updateProject(proj.id, 'database', e.target.value)} />
              </div>
            ))}
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>
                </div>
                Work Experience
              </h2>
              <button type="button" onClick={addExperience} className="btn-hover bg-indigo-600 px-3 py-1.5 text-sm font-medium rounded-lg text-white">Add Role</button>
            </div>
            {experiences.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 mb-4 grid grid-cols-2 gap-4">
                <input placeholder="Job Title" className={subInputStyle} value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} />
                <input placeholder="Company" className={subInputStyle} value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                <input type="date" className={subInputStyle} value={exp.start} onChange={(e) => updateExperience(exp.id, 'start', e.target.value)} />
                <input type="date" className={subInputStyle} value={exp.end} onChange={(e) => updateExperience(exp.id, 'end', e.target.value)} />
                <textarea rows="2" placeholder="Responsibilities" className={subInputStyle + " col-span-2"} value={exp.desc} onChange={(e) => updateExperience(exp.id, 'desc', e.target.value)} />
              </div>
            ))}
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">S</div> Skills
            </h2>
            <textarea placeholder="Technical Skills" className={inputStyle} rows="2" value={skills.tech} onChange={(e) => setSkills({ ...skills, tech: e.target.value })} />
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">L</div> Languages
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Type language and click Add"
                className={inputStyle}
                value={languages.current}
                onChange={(e) => setLanguages({ ...languages, current: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <button type="button" onClick={addLanguage} className="btn-hover bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.list.map((lang, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-medium animate-fadeIn">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-red-500 font-bold text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">L</div> Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="url" placeholder="GitHub" className={subInputStyle} value={links.github} onChange={(e) => setLinks({ ...links, github: e.target.value })} />
              <input type="url" placeholder="Portfolio" className={subInputStyle} value={links.portfolio} onChange={(e) => setLinks({ ...links, portfolio: e.target.value })} />
            </div>
          </section>

          <section className="form-section section-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">D</div> Declaration
            </h2>
            <textarea className={inputStyle} rows="3" value={declaration} readOnly />
          </section>

          <div className="flex gap-4 justify-center pt-6">
            <button
              type="submit"
              className="btn-hover bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200"
            >
              Preview Designs
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-hover bg-white text-red-500 border border-red-200 px-10 py-4 rounded-xl font-bold shadow-sm"
            >
              Clear All
            </button>
          </div>
        </form>

        {showSuccess && <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50">CV Data Processed!</div>}

        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-slate-600">Generating Designs...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;