"use client";
import { useState, useEffect } from "react";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import UserSidebar from "@/components/UserSidebar";
import {
  Loader2, UploadCloud, Building2,
  MessageSquareText, CheckCircle, MapPin,
  Briefcase, User, ShieldCheck, Calendar,
  Clock, ArrowRight, FileText, Image as ImageIcon,
  ExternalLink, Trash2, Edit3
} from "lucide-react";
import { useSession } from "next-auth/react";


export default function CandidateDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // નવું લોડિંગ સ્ટેટ
  const [pastedText, setPastedText] = useState("");
  const [myJobs, setMyJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [postType, setPostType] = useState("form"); // "form" | "image"
  const [imageVacancy, setImageVacancy] = useState({
    title: "",
    type: "Govt",
    image: "",
    fileType: "image",
    fileName: ""
  });

  const handleImageVacancyUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageVacancy({
        ...imageVacancy,
        image: reader.result,
        fileType: isPdf ? "pdf" : "image",
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageVacancySubmit = async (e) => {
    e.preventDefault();
    if (!imageVacancy.title) return alert("Please enter a title");
    if (!imageVacancy.image) return alert("Please upload an Image or PDF file");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bulk-vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageVacancy)
      });
      if (res.ok) {
        alert("🚀 Vacancy file (Image/PDF) submitted successfully for Admin approval!");
        setImageVacancy({ title: "", type: "Govt", image: "", fileType: "image", fileName: "" });
        setPostType("form");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit vacancy");
      }
    } catch (err) {
      alert("Failed to submit vacancy");
    } finally {
      setLoading(false);
    }
  };

  const defaultJob = {
    title: "", category: "", jobType: "Full-time",
    location: "", salaryRange: "", experienceLevel: "",
    description: "", requirements: "", deadline: "",
    industry: "", profession: "", designation: "", department: "",
    Reference: "",
    applyLink: "", applyEmail: "", applyPhone: "",
    applyPersonName: ""
  };
  const [jobsData, setJobsData] = useState([{ ...defaultJob }]);

  const [companyData, setCompanyData] = useState({
    companyName: "", tagline: "", industry: "", department: "",
    profession: "", designation: "", website: "", email: "",
    mobile: "", location: "", address: "",
    companySize: "1 - 5",
    recruiterType: "Client",
    companyType: "Pvt Ltd",
    founded: "", description: "", specialties: "", logo: "",
    contactPersonName: "", contactPersonNumber: "", contactPersonEmail: "",
    ownerName: "", ownerNumber: "", ownerEmail: ""
  });

  const fetchMyJobs = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/candidate-jobs", {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();
      //console.log("Raw API Response:", result); // આ બ્રાઉઝરના console માં ચેક કરજો

      if (res.ok) {
        // ડેટા ક્યાં છે તે ચેક કરવાની બેસ્ટ રીત:
        let finalData = [];

        if (Array.isArray(result)) {
          finalData = result;
        } else if (result.jobs && Array.isArray(result.jobs)) {
          finalData = result.jobs;
        } else if (result.data && Array.isArray(result.data)) {
          finalData = result.data;
        } else if (typeof result === 'object' && result !== null) {
          // જો ઓબ્જેક્ટની અંદર ક્યાંય એરે છુપાયેલો હોય
          const foundArray = Object.values(result).find(val => Array.isArray(val));
          if (foundArray) finalData = foundArray;
        }

        //console.log("Extracted Array:", finalData);
        setMyJobs(finalData);
      } else {
        //console.error("Server returned error:", result.error);
      }
    } catch (err) {
      //console.error("Fetch network error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
    };
    document.body.appendChild(script);
  }, []);

  const processTextWithAI = async (text) => {
    if (!text || text.trim() === "") return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });
      const result = await res.json();
      if (result.jobs && result.jobs.length > 0) setJobsData(result.jobs);
      else if (result.job) setJobsData([{ ...defaultJob, ...result.job }]);
      if (result.company) setCompanyData(prev => ({ ...prev, ...result.company }));
    } catch (err) {
      alert("AI Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    let extractedText = "";
    try {
      if (file.type.startsWith("image/")) {
        const res = await Tesseract.recognize(file, 'eng');
        extractedText = res.data.text;
      } else if (file.type === "application/pdf") {
        if (!window.pdfjsLib) {
          alert("PDF library is still loading...");
          setLoading(false);
          return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(s => s.str).join(" ") + "\n";
        }
        extractedText = fullText;
      } else if (file.type.includes("word") || file.name.endsWith(".docx")) {
        const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        extractedText = res.value;
      }

      if (extractedText.trim()) {
        setPastedText(extractedText);
        processTextWithAI(extractedText);
      } else {
        alert("No text could be extracted from this file.");
        setLoading(false);
      }
    } catch (err) {
      alert("File Error: " + err.message);
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      for (const job of jobsData) {
        let finalDeadline = job.deadline;
        if (!finalDeadline) {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          finalDeadline = date.toISOString().split('T')[0];
        }

        const payload = {
          ...job,
          postedByEmail: session?.user?.email,
          deadline: finalDeadline,
          companyDetails: companyData,
          ...(editingId && { _id: editingId })
        };

        const url = "/api/candidate-jobs";
        const method = editingId ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          successCount++;
        } else {
          const errData = await response.json();
          throw new Error(errData.error || "Upload failed for a job");
        }
      }

      if (successCount > 0) {
        alert(editingId ? "✅ Updated Successfully!" : `🚀 ${successCount} Job(s) Published Successfully!`);
        setEditingId(null);
        resetForm();
        fetchMyJobs();
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`/api/candidate-jobs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Deleted successfully");
        fetchMyJobs();
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setJobsData([{ ...job }]);
    setCompanyData({ ...job.companyDetails });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setJobsData([{ ...defaultJob }]);
    setCompanyData({ companyName: "", tagline: "", industry: "", department: "", profession: "", designation: "", website: "", email: "", mobile: "", location: "", address: "", companySize: "1 - 5", recruiterType: "Client", companyType: "Pvt Ltd", founded: "", description: "", specialties: "", logo: "", contactPersonName: "", contactPersonNumber: "", contactPersonEmail: "", ownerName: "", ownerNumber: "", ownerEmail: "" });
    setPastedText("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 flex-shrink-0 hidden md:block border-r border-slate-200 bg-white">
        <UserSidebar />
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-800">
              {postType === "image" ? "Submit Vacancy Image" : (editingId ? "Update Career Listing" : "Post New Career Listing")}
            </h2>
            {postType === "form" && (
              <div className="flex gap-3">
                {editingId && <button onClick={() => { setEditingId(null); resetForm(); }} className="px-6 py-4 font-bold text-slate-500 uppercase">Cancel</button>}
                <button onClick={handlePublish} disabled={loading} className="btn-primary px-10 py-4 shadow-xl uppercase flex items-center gap-2">
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {editingId ? "Update Now" : "Publish Live"}
                </button>
              </div>
            )}
          </header>

          {/* Toggle Tab */}
          <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit mb-8">
            <button
              onClick={() => setPostType("form")}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                postType === "form" ? "bg-white text-indigo-600 shadow-md" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Standard Job Form
            </button>
            <button
              onClick={() => setPostType("image")}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                postType === "image" ? "bg-white text-indigo-600 shadow-md" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Upload Vacancy Image
            </button>
          </div>

          {postType === "image" ? (
            <div className="max-w-xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6 mb-12">
              <div>
                <h3 className="text-xl font-black text-slate-800">Upload Vacancy Image</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Submit an image-based job alert for Admin approval</p>
              </div>

              <form onSubmit={handleImageVacancySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Job Title / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat Police Recruitment 2024"
                    required
                    value={imageVacancy.title}
                    onChange={(e) => setImageVacancy({ ...imageVacancy, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Vacancy Category</label>
                  <div className="flex gap-4">
                    {["Govt", "Pvt"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setImageVacancy({ ...imageVacancy, type: t })}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${imageVacancy.type === t
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                      >
                        {t} Job
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Vacancy File (Image or PDF Poster)</label>
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleImageVacancyUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className={`aspect-video rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center transition-all ${imageVacancy.image ? "border-emerald-500 bg-emerald-50/20" : "border-slate-100 bg-slate-50 group-hover:bg-slate-100 group-hover:border-indigo-200"
                      }`}>
                      {imageVacancy.image ? (
                        <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                          {imageVacancy.fileType === "pdf" ? (
                            <div className="flex flex-col items-center gap-2 text-center">
                              <FileText className="text-red-500 animate-pulse" size={48} />
                              <span className="text-xs font-black text-slate-800 line-clamp-1">{imageVacancy.fileName || "Uploaded Vacancy Document.pdf"}</span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">PDF Document Attached</span>
                            </div>
                          ) : (
                            <img src={imageVacancy.image} className="w-full h-full object-contain rounded-xl" />
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={28} />
                          </div>
                          <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest group-hover:text-indigo-600">Click to Select Image or PDF Document</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Submit for Admin Approval"}
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

            {/* AI IMPORT SECTION */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card-box border-2 border-indigo-100 bg-indigo-50/20">
                <h3 className="section-title text-indigo-600"> <UploadCloud size={18} /> AI Smart Import </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <label htmlFor="fileIn" className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-all text-slate-600">
                    <FileText size={20} className="mb-1 text-red-500" />
                    <span className="text-[10px] font-bold uppercase">PDF</span>
                  </label>
                  <label htmlFor="fileIn" className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-all text-slate-600">
                    <ImageIcon size={20} className="mb-1 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase">Image</span>
                  </label>
                  <button onClick={() => document.getElementById('jdText').focus()} className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 transition-all text-slate-600">
                    <MessageSquareText size={20} className="mb-1 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase">Text</span>
                  </button>
                </div>
                <input type="file" id="fileIn" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFileUpload} />
                <div className="relative">
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase ml-1">Job Description Text</label>
                  {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl"><Loader2 className="animate-spin text-indigo-600" /></div>}
                  <textarea
                    id="jdText"
                    className="input-style h-40"
                    placeholder="Paste your Job Description here..."
                    value={pastedText || ""}
                    onChange={e => setPastedText(e.target.value)}
                  />
                </div>
                <button onClick={() => processTextWithAI(pastedText)} disabled={loading} className="btn-secondary mt-3 py-3 flex justify-center items-center gap-2 uppercase">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Run AI Extraction Engine
                </button>
              </div>

              {/* COMPANY PROFILE */}
              <div className="card-box">
                <h3 className="section-title"> <Building2 size={18} /> Company Profile </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="label-style">Company Name</label>
                    <input className="input-style" placeholder="Ex: Google" value={companyData.companyName || ""} onChange={e => setCompanyData({ ...companyData, companyName: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-style">Type of Recruiter</label>
                      <select className="input-style" value={companyData.recruiterType || "Client"} onChange={e => setCompanyData({ ...companyData, recruiterType: e.target.value })}>
                        <option value="Client">Client</option>
                        <option value="Placement Agency">Placement Agency</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-style">Company Type</label>
                      <select className="input-style" value={companyData.companyType || "Pvt Ltd"} onChange={e => setCompanyData({ ...companyData, companyType: e.target.value })}>
                        <option value="Pvt Ltd">Pvt Ltd</option>
                        <option value="LLP">LLP</option>
                        <option value="Proprietor">Proprietor</option>
                        <option value="Public Limited">Public Limited</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-style">Industry</label>
                      <input className="input-style" placeholder="Ex: IT" value={companyData.industry || ""} onChange={e => setCompanyData({ ...companyData, industry: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-style">No. of Employees</label>
                      <select className="input-style" value={companyData.companySize || "1 - 5"} onChange={e => setCompanyData({ ...companyData, companySize: e.target.value })}>
                        <option value="1 - 5">1 - 5</option>
                        <option value="6 - 10">6 - 10</option>
                        <option value="11 - 20">11 - 20</option>
                        <option value="21 - 50">21 - 50</option>
                        <option value="51 - 100">51 - 100</option>
                        <option value="> 100">&gt; 100</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label-style">Address</label>
                    <input className="input-style" placeholder="Full Address" value={companyData.address || ""} onChange={e => setCompanyData({ ...companyData, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-style">About Company</label>
                    <textarea className="input-style h-20" placeholder="Brief description..." value={companyData.description || ""} onChange={e => setCompanyData({ ...companyData, description: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* JOB DETAILS SECTION */}
            <div className="lg:col-span-7 space-y-6">
              {jobsData.map((job, index) => (
                <div key={index} className="space-y-6 relative border-b-2 border-indigo-100 pb-8 mb-4 last:border-0">
                  {jobsData.length > 1 && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Job {index + 1}</span>
                      <button
                        onClick={() => {
                          const newJobs = jobsData.filter((_, i) => i !== index);
                          setJobsData(newJobs.length ? newJobs : [{ ...defaultJob }]);
                        }}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs font-bold transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="card-box shadow-lg">
                    <h3 className="section-title"> <Briefcase size={18} /> Job Vacancy Details {jobsData.length > 1 ? `(${index + 1})` : ''} </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="label-style">Job Title</label>
                        <input className="input-style font-bold text-indigo-600" placeholder="Ex: Senior Developer" value={job.title || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].title = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Designation</label>
                        <input className="input-style" placeholder="Ex: Lead" value={job.designation || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].designation = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Reference</label>
                        <input className="input-style" placeholder="Ex: Employee Ref / Source" value={job.Reference || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].Reference = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Job Type</label>
                        <select className="input-style" value={job.jobType || "Full-time"} onChange={e => { const newJobs = [...jobsData]; newJobs[index].jobType = e.target.value; setJobsData(newJobs); }}>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote / Freelance">Remote / Freelance</option>
                        </select>
                      </div>
                      <div>
                        <label className="label-style">Location</label>
                        <input className="input-style" placeholder="Ex: Remote / City" value={job.location || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].location = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Salary Range</label>
                        <input className="input-style" placeholder="Ex: 5L - 8L" value={job.salaryRange || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].salaryRange = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Experience Level</label>
                        <input className="input-style" placeholder="Ex: 2+ Years" value={job.experienceLevel || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].experienceLevel = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Application Deadline</label>
                        <input className="input-style" type="date" value={job.deadline || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].deadline = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div className="col-span-2">
                        <label className="label-style">Job Description</label>
                        <textarea className="input-style h-24" placeholder="Role and responsibilities..." value={job.description || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].description = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div className="col-span-2">
                        <label className="label-style">Key Requirements</label>
                        <textarea className="input-style h-24" placeholder="Skills, education, etc..." value={job.requirements || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].requirements = e.target.value; setJobsData(newJobs); }} />
                      </div>
                    </div>
                  </div>

                  {/* APPLY HERE SECTION */}
                  <div className="card-box border-2 border-emerald-100 bg-emerald-50/10">
                    <h3 className="section-title text-emerald-600"> <ExternalLink size={18} /> Apply Here {jobsData.length > 1 ? `(Job ${index + 1})` : ''} </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-style">Name of Person</label>
                        <input className="input-style" placeholder="Ex: Rahul Sharma" value={job.applyPersonName || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].applyPersonName = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Contact Number</label>
                        <input className="input-style" placeholder="Ex: +91 98765 43210" value={job.applyPhone || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].applyPhone = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">Application Email</label>
                        <input className="input-style" placeholder="Ex: hr@company.com" value={job.applyEmail || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].applyEmail = e.target.value; setJobsData(newJobs); }} />
                      </div>
                      <div>
                        <label className="label-style">URL</label>
                        <input className="input-style" placeholder="Ex: https://forms.gle/..." value={job.applyLink || ""} onChange={e => { const newJobs = [...jobsData]; newJobs[index].applyLink = e.target.value; setJobsData(newJobs); }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div className="card-box bg-emerald-50/30">
                  <h3 className="section-title text-emerald-700"> <User size={16} /> Contact Person </h3>
                  <div className="space-y-2">
                    <input className="input-style" placeholder="Name" value={companyData.contactPersonName || ""} onChange={e => setCompanyData({ ...companyData, contactPersonName: e.target.value })} />
                    <input className="input-style" placeholder="Email" value={companyData.contactPersonEmail || ""} onChange={e => setCompanyData({ ...companyData, contactPersonEmail: e.target.value })} />
                    <input className="input-style" placeholder="Number" value={companyData.contactPersonNumber || ""} onChange={e => setCompanyData({ ...companyData, contactPersonNumber: e.target.value })} />
                  </div>
                </div> */}
                <div className="card-box bg-orange-50/30 md:col-start-1">
                  <h3 className="section-title text-orange-700"> <ShieldCheck size={16} /> Business Owner </h3>
                  <div className="space-y-4">
                    <input className="input-style" placeholder="Name" value={companyData.ownerName || ""} onChange={e => setCompanyData({ ...companyData, ownerName: e.target.value })} />
                    <input className="input-style" placeholder="Email" value={companyData.ownerEmail || ""} onChange={e => setCompanyData({ ...companyData, ownerEmail: e.target.value })} />
                    <input className="input-style" placeholder="Number" value={companyData.ownerNumber || ""} onChange={e => setCompanyData({ ...companyData, ownerNumber: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* LIVE LISTINGS SECTION */}
          <div className="mt-12 border-t pt-10">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <CheckCircle className="text-emerald-500" /> Your Published Career Listings
            </h3>

            {fetching ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={40} /></div>
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-20">
                {myJobs && myJobs.length > 0 ? (
                  myJobs.map((job, index) => (
                    <div key={job._id || index} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex justify-between items-center group">
                      <div>
                        <h4 className="font-black text-slate-800 text-lg">{job.title || "Untitled Job"}</h4>
                        <p className="text-indigo-600 font-bold text-xs uppercase">{job.companyDetails?.companyName || "No Company Name"}</p>
                        <div className="flex gap-4 mt-3 text-[10px] font-black text-slate-400 uppercase">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {job.jobType || 'Full-time'}</span>
                          <span className="flex items-center gap-1 text-red-400"><Calendar size={12} /> Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(job)} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(job._id)} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-sm">
                    No live posts found for: {session?.user?.email}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .card-box { background: white; padding: 1.5rem; border-radius: 1.25rem; border: 1px solid #e2e8f0; }
        .section-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; margin-bottom: 1rem; text-transform: uppercase; font-size: 0.7rem; color: #64748b; letter-spacing: 0.05em; }
        .label-style { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; display: block; margin-left: 4px; }
        .input-style { width: 100%; padding: 0.6rem 1rem; background: #f8fafc; border-radius: 0.75rem; border: 1px solid #e2e8f0; outline: none; font-size: 0.85rem; }
        .input-style:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px #eef2ff; }
        .btn-primary { background: #4f46e5; color: white; border-radius: 1rem; font-weight: 900; transition: 0.2s; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background: #4338ca; }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-secondary { width: 100%; background: #1e293b; color: white; padding: 0.6rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}
