// "use client";
// import React, { useState, useEffect } from 'react';
// import { ArrowLeft, Send, Loader2, Sparkles, FileText } from 'lucide-react';
// import RecruiterSidebar from '@/components/RecruiterSidebar';
// import { useRouter } from 'next/navigation';
// import Tesseract from 'tesseract.js';
// import { useSession } from "next-auth/react"; // સેશન ચેક કરવા માટે

// export default function PostJobForm() {
//   const router = useRouter();
//   const { data: session, status } = useSession(); // સેશન ડેટા મેળવો
//   const [loading, setLoading] = useState(false);
//   const [isScanning, setIsScanning] = useState(false);
//   const [pdfjs, setPdfjs] = useState(null);

//   const [categories, setCategories] = useState([]);
//   const [experienceLevels, setExperienceLevels] = useState([]);
//   const [industries, setIndustries] = useState([]);
//   const [professions, setProfessions] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [formData, setFormData] = useState({
//     title: '',
//     category: '',
//     jobType: 'Full-time',
//     location: '',
//     salaryRange: '',
//     experienceLevel: '',
//     description: '',
//     requirements: '',
//     deadline: '',
//     industry: '',
//     profession: '',
//     designation: '',
//     department: '',
//   });

//   // --- 🔒 Payment & Approval Check ---
//   useEffect(() => {
//     const checkAccess = async () => {
//       if (status === "unauthenticated") {
//         router.push("/login");
//         return;
//       }

//       if (status === "authenticated" && session?.user?.email) {
//         try {
//           const res = await fetch(`/api/admin/recruiters?email=${session.user.email}`, {
//             cache: 'no-store'
//           });
//           const data = await res.json();

//           if (data.success) {
//             const rec = data.recruiter;
//             // જો પેમેન્ટ ના થયું હોય અથવા એકાઉન્ટ એપ્રૂવ ના હોય તો ડેશબોર્ડ પર મોકલી દો
//             if (!rec.isPaid || !rec.isApproved) {
//               alert("Please complete your payment and wait for admin approval to post jobs.");
//               router.push("/recruiter/dashboard");
//             }
//           }
//         } catch (err) {
//           console.error("Access Check Error:", err);
//         }
//       }
//     };

//     checkAccess();
//   }, [session, status, router]);

//   // --- 📡 Fetch Admin Settings (તમારો ઓરિજિનલ કોડ) ---
//   useEffect(() => {
//     const fetchAdminSettings = async () => {
//       try {
//         const res = await fetch('/api/dropdowns');
//         if (res.ok) {
//           const allData = await res.json();
//           setCategories(allData.filter(item => item.type === 'jobCategory'));
//           setExperienceLevels(allData.filter(item => item.type === 'experienceLevel'));
//           setIndustries(allData.filter(item => item.type === 'industry'));
//           setProfessions(allData.filter(item => item.type === 'profession'));
//           setDesignations(allData.filter(item => item.type === 'designation'));
//           setDepartments(allData.filter(item => item.type === 'department'));
//         }
//       } catch (err) {
//         console.error("Error fetching dynamic fields:", err);
//       }
//     };
//     fetchAdminSettings();
//   }, []);

//   // ... બાકીનો બધો જ કોડ (handleFileUpload, handleSubmit વગેરે) સેમ રહેશે ...
//   // મેં નીચેનો કોઈ જ કોડ બદલ્યો નથી જેથી તમારી ફંક્શનાલિટી જળવાઈ રહે.

//   useEffect(() => {
//     const loadPdfJS = async () => {
//       const pdfjsLib = await import('pdfjs-dist');
//       pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
//       setPdfjs(pdfjsLib);
//     };
//     loadPdfJS();
//   }, []);

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setIsScanning(true);
//     try {
//       let extractedText = "";
//       if (file.type.startsWith('image/')) {
//         const { data: { text } } = await Tesseract.recognize(file, 'eng');
//         extractedText = text;
//       }
//       else if (file.type === 'application/pdf') {
//         if (!pdfjs) {
//           alert("PDF library is still loading, please wait...");
//           return;
//         }
//         const arrayBuffer = await file.arrayBuffer();
//         const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
//         const pdf = await loadingTask.promise;
//         let fullText = "";
//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page = await pdf.getPage(i);
//           const textContent = await page.getTextContent();
//           const pageText = textContent.items.map(item => item.str).join(" ");
//           fullText += pageText + "\n";
//         }
//         extractedText = fullText;
//       }
//       if (extractedText.trim()) {
//         parseAndFillForm(extractedText);
//       }
//     } catch (err) {
//       console.error("Scan Error:", err);
//       alert("Scan Error: " + err.message);
//     } finally {
//       setIsScanning(false);
//     }
//   };

//   const parseAndFillForm = (text) => {
//     const lowerText = text.toLowerCase();
//     const lines = text.split('\n');
//     let newDetails = { ...formData };
//     const titleKeywords = ["developer", "manager", "expert", "designer", "engineer", "specialist"];
//     for (let line of lines) {
//       if (titleKeywords.some(key => line.toLowerCase().includes(key))) {
//         newDetails.title = line.trim();
//         break;
//       }
//     }
//     if (lowerText.includes("marketing")) newDetails.category = "Marketing";
//     if (lowerText.includes("remote")) newDetails.jobType = "Remote";
//     const salaryMatch = text.match(/(₹|\$)\s?\d+[kLML]\s?-\s?(₹|\$)\s?\d+[kLML]/i);
//     if (salaryMatch) newDetails.salaryRange = salaryMatch[0];
//     newDetails.requirements = lines.filter(l => l.includes('•') || l.includes('-')).join(', ').substring(0, 200);
//     newDetails.description = text.substring(0, 500);
//     setFormData(prev => ({ ...prev, ...newDetails }));
//     alert("Form pre-filled successfully!");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch("/api/recruiter/jobs/post", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         alert("🚀 Job Published Successfully!");
//         router.push("/recruiter/dashboard");
//       } else {
//         if (data.error === "Company profile not found" || data.error === "Profile incomplete") {
//           alert("Profile not found. Please complete your registration first.");
//           router.push("/recruiter/register");
//         } else {
//           alert("❌ Error: " + (data.error || "Something went wrong"));
//         }
//       }
//     } catch (err) {
//       alert("❌ Failed to connect to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ... (તમારો બાકીનો JSX રિટર્ન કોડ પણ સેમ રહેશે) ...
//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
//       <RecruiterSidebar activePage="postjob" />
//       <main className="flex-1 p-4 sm:p-6 md:p-10 mt-16 lg:mt-0 overflow-x-hidden">
//         <div className="max-w-4xl mx-auto">
//           <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-indigo-600 transition-all">
//             <ArrowLeft size={18} /> Back
//           </button>

//           <div className="bg-white shadow-2xl shadow-indigo-100/30 rounded-[30px] border border-slate-100 overflow-hidden">
//             <div className="bg-indigo-600 p-8 md:p-12 text-white">
//               <h1 className="text-3xl font-black mb-2">Post a Job</h1>
//               <p className="text-indigo-100 text-sm opacity-90">Fill in the details to find your next star hire.</p>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-10">
//               <section className="space-y-6">
//                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
//                   <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">01</span>
//                   Job Basics
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="md:col-span-2">
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Job Title</label>
//                     <input type="text" name="title" required onChange={handleChange} value={formData.title}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
//                       placeholder="e.g. Senior React Developer" />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
//                     <select name="category" required onChange={handleChange} value={formData.category}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
//                       <option value="">Select Category</option>
//                       {categories.map((cat, idx) => (
//                         <option key={idx} value={cat.value}>{cat.value}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Job Type</label>
//                     <select name="jobType" onChange={handleChange} value={formData.jobType}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800">
//                       <option value="Full-time">Full-time</option>
//                       <option value="Part-time">Part-time</option>
//                       <option value="Remote">Remote</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Industry</label>
//                     <select name="industry" required onChange={handleChange} value={formData.industry}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
//                       <option value="">Select Industry</option>
//                       {industries.map((ind, idx) => (
//                         <option key={idx} value={ind.value}>{ind.value}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Profession</label>
//                     <select name="profession" required onChange={handleChange} value={formData.profession}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
//                       <option value="">Select Profession</option>
//                       {professions.map((prof, idx) => (
//                         <option key={idx} value={prof.value}>{prof.value}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </section>

//               <section className="pt-8 border-t border-slate-100 space-y-6">
//                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
//                   <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">02</span>
//                   Details & Salary
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Location</label>
//                     <input type="text" name="location" required onChange={handleChange} value={formData.location}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" placeholder="e.g. Ahmedabad" />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Salary Range</label>
//                     <input type="text" name="salaryRange" required onChange={handleChange} value={formData.salaryRange}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" placeholder="e.g. ₹10L - ₹15L PA" />
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Experience Level</label>
//                     <select name="experienceLevel" required onChange={handleChange} value={formData.experienceLevel}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800">
//                       <option value="">Select Experience</option>
//                       {experienceLevels.map((lvl, idx) => (
//                         <option key={idx} value={lvl.value}>{lvl.value}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deadline</label>
//                     <input type="date" name="deadline" required onChange={handleChange} value={formData.deadline}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" />
//                   </div>

//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Designation</label>
//                     <select name="designation" required onChange={handleChange} value={formData.designation}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
//                       <option value="">Select Designation</option>
//                       {designations.map((des, idx) => (
//                         <option key={idx} value={des.value}>{des.value}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Department</label>
//                     <select name="department" required onChange={handleChange} value={formData.department}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
//                       <option value="">Select Department</option>
//                       {departments.map((dept, idx) => (
//                         <option key={idx} value={dept.value}>{dept.value}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </section>

//               <section className="pt-8 border-t border-slate-100 space-y-6">
//                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
//                   <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">03</span>
//                   Role Description
//                 </h3>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">About the Role</label>
//                     <textarea name="description" rows="4" required onChange={handleChange} value={formData.description}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-sm text-slate-800" placeholder="Job duties..."></textarea>
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Requirements (Skills)</label>
//                     <textarea name="requirements" rows="3" required onChange={handleChange} value={formData.requirements}
//                       className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-sm text-slate-800" placeholder="React, Node.js, MongoDB (separate with commas)"></textarea>
//                   </div>
//                 </div>
//               </section>

//               <div className="pt-10">
//                 <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
//                   {loading ? <><Loader2 className="animate-spin" /> Publishing...</> : <><Send size={20} /> Publish Job</>}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, Sparkles, FileText, Briefcase, Zap } from 'lucide-react'; // Briefcase, Zap ઉમેર્યા
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { useRouter } from 'next/navigation';
import Tesseract from 'tesseract.js';
import { useSession } from "next-auth/react";

export default function PostJobForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pdfjs, setPdfjs] = useState(null);

  const [categories, setCategories] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ✅ New State for Tab Selection
  const [postType, setPostType] = useState('regular'); // 'regular' or 'freelance'

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    jobType: 'Full-time',
    location: '',
    salaryRange: '',
    experienceLevel: '',
    description: '',
    requirements: '',
    deadline: '',
    industry: '',
    profession: '',
    designation: '',
    department: '',
    // ✅ Freelance specific fields
    isFreelance: false,
    projectBudget: '',
    budgetType: 'Fixed',
    projectDuration: '',
  });

  // --- 🔒 Access Check: Approval Mandatory, Payment Optional ---
  useEffect(() => {
    const checkAccess = async () => {
      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch(`/api/admin/recruiters?email=${session.user.email}`, {
            cache: 'no-store'
          });
          const data = await res.json();

          if (data.success) {
            const rec = data.recruiter;

            if (!rec.isApproved) {
              alert("Your account is pending admin approval. You can post jobs once approved.");
              router.push("/recruiter/dashboard");
            }
          }
        } catch (err) {
          console.error("Access Check Error:", err);
        }
      }
    };

    checkAccess();
  }, [session, status, router]);

  // --- 📡 Fetch Admin Settings ---
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const res = await fetch('/api/dropdowns');
        if (res.ok) {
          const allData = await res.json();
          setCategories(allData.filter(item => item.type === 'jobCategory'));
          setExperienceLevels(allData.filter(item => item.type === 'experienceLevel'));
          setIndustries(allData.filter(item => item.type === 'industry'));
          setProfessions(allData.filter(item =>
            item.type === 'profession' || item.type === 'jobProfession'
          ));
          setDesignations(allData.filter(item => item.type === 'designation'));
          setDepartments(allData.filter(item => item.type === 'department'));
        }
      } catch (err) {
        console.error("Error fetching dynamic fields:", err);
      }
    };
    fetchAdminSettings();
  }, []);

  useEffect(() => {
    const loadPdfJS = async () => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      setPdfjs(pdfjsLib);
    };
    loadPdfJS();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsScanning(true);
    try {
      let extractedText = "";
      if (file.type.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        extractedText = text;
      }
      else if (file.type === 'application/pdf') {
        if (!pdfjs) {
          alert("PDF library is still loading, please wait...");
          return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          fullText += pageText + "\n";
        }
        extractedText = fullText;
      }
      if (extractedText.trim()) {
        parseAndFillForm(extractedText);
      }
    } catch (err) {
      console.error("Scan Error:", err);
      alert("Scan Error: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const parseAndFillForm = (text) => {
    const lowerText = text.toLowerCase();
    const lines = text.split('\n');
    let newDetails = { ...formData };
    const titleKeywords = ["developer", "manager", "expert", "designer", "engineer", "specialist"];
    for (let line of lines) {
      if (titleKeywords.some(key => line.toLowerCase().includes(key))) {
        newDetails.title = line.trim();
        break;
      }
    }
    if (lowerText.includes("marketing")) newDetails.category = "Marketing";
    if (lowerText.includes("remote")) newDetails.jobType = "Remote";
    const salaryMatch = text.match(/(₹|\$)\s?\d+[kLML]\s?-\s?(₹|\$)\s?\d+[kLML]/i);
    if (salaryMatch) newDetails.salaryRange = salaryMatch[0];
    newDetails.requirements = lines.filter(l => l.includes('•') || l.includes('-')).join(', ').substring(0, 200);
    newDetails.description = text.substring(0, 500);
    setFormData(prev => ({ ...prev, ...newDetails }));
    alert("Form pre-filled successfully!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Final form data mapping based on type
    const finalData = {
        ...formData,
        isFreelance: postType === 'freelance',
        jobType: postType === 'freelance' ? 'Freelance' : formData.jobType,
        salaryRange: formData.isFreelance ? (formData.projectBudget || "Project Based") : formData.salaryRange,
        experienceLevel: formData.isFreelance ? (formData.experienceLevel || "Any") : formData.experienceLevel,
  
    };

    try {
      const res = await fetch("/api/recruiter/jobs/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(postType === 'freelance' ? "🚀 Project Published Successfully!" : "🚀 Job Published Successfully!");
        router.push("/recruiter/dashboard");
      } else {
        if (data.error === "Company profile not found" || data.error === "Profile incomplete") {
          alert("Profile not found. Please complete your registration first.");
          router.push("/recruiter/register");
        } else {
          alert("❌ Error: " + (data.error || "Something went wrong"));
        }
      }
    } catch (err) {
      alert("❌ Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingSkills, setGeneratingSkills] = useState(false);

  const generateAIContent = async (type) => {
    if (!formData.title) return alert("Please enter a job title first!");
    
    if (type === 'jd') setGeneratingDesc(true);
    else setGeneratingSkills(true);

    try {
        const res = await fetch('/api/ai/recruiter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, input: formData.title })
        });
        const data = await res.json();
        if (data.success) {
            if (type === 'jd') setFormData(prev => ({ ...prev, description: data.result }));
            else setFormData(prev => ({ ...prev, requirements: data.result }));
        }
    } catch (error) {
        alert("AI Generation failed");
    } finally {
        setGeneratingDesc(false);
        setGeneratingSkills(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
      <RecruiterSidebar activePage="postjob" />
      <main className="flex-1 p-4 sm:p-6 md:p-10 mt-16 lg:mt-0 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-indigo-600 transition-all">
            <ArrowLeft size={18} /> Back
          </button>

          <div className="bg-white shadow-2xl shadow-indigo-100/30 rounded-[30px] border border-slate-100 overflow-hidden">
            <div className="bg-indigo-600 p-8 md:p-12 text-white">
              <h1 className="text-3xl font-black mb-2">Create a Posting</h1>
              <p className="text-indigo-100 text-sm opacity-90">Find the right talent for your company or project.</p>
            </div>

            {/* ✅ Custom Tab Selector */}
            <div className="flex p-2 bg-slate-100 mx-6 md:mx-12 mt-8 rounded-2xl">
              <button 
                onClick={() => setPostType('regular')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${postType === 'regular' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Briefcase size={18} /> Regular Job
              </button>
              <button 
                onClick={() => setPostType('freelance')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${postType === 'freelance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Zap size={18} /> Freelance Project
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-10">
              
              <section className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">01</span>
                  {postType === 'regular' ? 'Job Basics' : 'Project Basics'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{postType === 'regular' ? 'Job Title' : 'Project Title'}</label>
                    <input type="text" name="title" required onChange={handleChange} value={formData.title}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      placeholder={postType === 'regular' ? "e.g. Senior React Developer" : "e.g. Website Redesign for E-commerce"} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                    <select name="category" required onChange={handleChange} value={formData.category}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">Select Category</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat.value}>{cat.value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{postType === 'regular' ? 'Job Type' : 'Work Mode'}</label>
                    <select name="jobType" onChange={handleChange} value={postType === 'freelance' ? 'Freelance' : formData.jobType} disabled={postType === 'freelance'}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800">
                      {postType === 'regular' ? (
                        <>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Remote">Remote</option>
                        </>
                      ) : (
                        <option value="Freelance">Freelance / Project</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Industry</label>
                    <select name="industry" required onChange={handleChange} value={formData.industry}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">Select Industry</option>
                      {industries.map((ind, idx) => (
                        <option key={idx} value={ind.value}>{ind.value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Profession</label>
                    <select name="profession" required onChange={handleChange} value={formData.profession}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">Select Profession</option>
                      {professions.map((prof, idx) => (
                        <option key={idx} value={prof.value}>{prof.value}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">02</span>
                  {postType === 'regular' ? 'Details & Salary' : 'Budget & Timeline'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Location</label>
                    <input type="text" name="location" required onChange={handleChange} value={formData.location}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" placeholder="e.g. Ahmedabad / Remote" />
                  </div>

                  {postType === 'regular' ? (
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Salary Range</label>
                        <input type="text" name="salaryRange" required onChange={handleChange} value={formData.salaryRange}
                        className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" placeholder="e.g. ₹10L - ₹15L PA" />
                    </div>
                  ) : (
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Project Budget (Est.)</label>
                        <div className="flex gap-2">
                            <select name="budgetType" onChange={handleChange} value={formData.budgetType} className="mt-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800 text-xs">
                                <option value="Fixed">Fixed</option>
                                <option value="Hourly">Hourly</option>
                            </select>
                            <input type="text" name="projectBudget" required onChange={handleChange} value={formData.projectBudget}
                            className="mt-2 flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" placeholder="e.g. ₹50,000" />
                        </div>
                    </div>
                  )}

                  {postType === 'regular' ? (
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Experience Level</label>
                        <select name="experienceLevel" required onChange={handleChange} value={formData.experienceLevel}
                        className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800">
                        <option value="">Select Experience</option>
                        {experienceLevels.map((lvl, idx) => (
                            <option key={idx} value={lvl.value}>{lvl.value}</option>
                        ))}
                        </select>
                    </div>
                  ) : (
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Expected Duration</label>
                        <input type="text" name="projectDuration" required onChange={handleChange} value={formData.projectDuration}
                        className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" placeholder="e.g. 2 Weeks / 3 Months" />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{postType === 'regular' ? 'Application Deadline' : 'Bidding Deadline'}</label>
                    <input type="date" name="deadline" required onChange={handleChange} value={formData.deadline}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-800" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Designation</label>
                    <select name="designation" required onChange={handleChange} value={formData.designation}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">Select Designation</option>
                      {designations.map((des, idx) => (
                        <option key={idx} value={des.value}>{des.value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Department</label>
                    <select name="department" required onChange={handleChange} value={formData.department}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">Select Department</option>
                      {departments.map((dept, idx) => (
                        <option key={idx} value={dept.value}>{dept.value}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">03</span>
                  {postType === 'regular' ? 'Role Description' : 'Project Details'}
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">{postType === 'regular' ? 'About the Role' : 'About the Project'}</label>
                        <button 
                            type="button"
                            onClick={() => generateAIContent('jd')}
                            disabled={generatingDesc}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
                        >
                            {generatingDesc ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                            {generatingDesc ? "Generating..." : "AI Assist"}
                        </button>
                    </div>
                    <textarea name="description" rows="4" required onChange={handleChange} value={formData.description}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder={postType === 'regular' ? "Job duties..." : "Detailed project requirements and scope..."}></textarea>
                  </div>
                  <div>
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Skills Required</label>
                        <button 
                            type="button"
                            onClick={() => generateAIContent('skills')}
                            disabled={generatingSkills}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
                        >
                            {generatingSkills ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                            {generatingSkills ? "Generating..." : "Suggest Skills"}
                        </button>
                    </div>
                    <textarea name="requirements" rows="3" required onChange={handleChange} value={formData.requirements}
                      className="mt-2 w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-medium text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="React, Node.js, MongoDB (separate with commas)"></textarea>
                  </div>
                </div>
              </section>

              <div className="pt-10">
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <><Loader2 className="animate-spin" /> Publishing...</> : <><Send size={20} /> {postType === 'regular' ? 'Publish Job' : 'Publish Project'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}