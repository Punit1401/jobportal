"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import {
  User, Mail, Phone, Briefcase, MapPin,
  Link as LinkIcon, FileText, Save, Loader2, GraduationCap, Globe, BookOpen, Star, Trash2, Plus, Eye, Edit3, ExternalLink, Calendar, Award, Sliders
} from 'lucide-react';
import { AlertCircle, Info } from "lucide-react";

// --- Components ---

const InputField = ({ label, name, type = "text", placeholder = "", value, onChange, maxLength, readOnly }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-600 ml-1">{label}</label>
    <input
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      maxLength={maxLength}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full p-4 border-2 rounded-xl outline-none transition-all shadow-sm font-bold ${readOnly
        ? "bg-slate-100 cursor-not-allowed border-slate-200 text-slate-400"
        : "bg-white border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-slate-700"
        }`}
    />
  </div>
);

const PreviewItem = ({ label, value, icon: Icon, color = "indigo" }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} className={`text-${color}-500`} />}
      <p className="text-base font-bold text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-600 ml-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm appearance-none cursor-pointer font-bold text-slate-700"
    >
      <option value="">Select {label}</option>
      {options.map((opt, index) => (
        <option key={index} value={typeof opt === 'string' ? opt : (opt.value || opt.label)}>
          {typeof opt === 'string' ? opt : (opt.value || opt.label)}
        </option>
      ))}
    </select>
  </div>
);

const UniversitySearchField = ({ label, name, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2 relative">
    <label className="text-sm font-bold text-slate-600 ml-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none shadow-sm transition-all font-bold text-slate-700"
    />
  </div>
);

const BoardSearchField = ({ label, name, value, onChange, placeholder, type = "board" }) => (
  <div className="flex flex-col gap-2 relative">
    <label className="text-sm font-bold text-slate-600 ml-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none shadow-sm transition-all font-bold text-slate-700"
    />
  </div>
);

// --- Main Page ---

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const allStates = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const [dropdownOptions, setDropdownOptions] = useState({
    profession: [], position: [], reference: [], jobCategory: [], experienceLevel: [], jobDepartment: []
  });

  const years = Array.from({ length: 40 }, (_, i) => (new Date().getFullYear() - i).toString());

  const emptyWorkExperience = {
    currentCompanyName: "", designation: "", jobDepartment: "", jobIndustry: "",
    jobFromDate: "", jobToDate: "", jobDescription: "",
    presentEmploymentStatus: "", lastSalary: "", expectedSalary: "", noticePeriod: ""
  };

  const emptyFormalEducation = {
    type: "Graduation", // graduation | postGraduation | classX | classXII | pgDiploma
    year: "", university: "", institute: "", specialization: "", percentage: "", board: "", level: ""
  };

  const emptyNonFormalEducation = {
    type: "ITI", // iti | diploma
    year: "", university: "", institute: "", specialization: "", percentage: ""
  };

  const [formData, setFormData] = useState({
    fullName: "", email: "", mobile: "", dob: "",
    religion: "", motherTongue: "", profession: "", position: "", role: "",
    pincode: "", state: "", city: "", address: "",
    reference: "",
    skills: "",
    linkedin: "", portfolio: "", github: "",
    gender: "", jobIndustry: "",
    classXYear: "", classXBoard: "", classXSchool: "", classXPercentage: "",
    classXIIYear: "", classXIIBoard: "", classXIILevel: "", classXIISchool: "", classXIIPercentage: "",
    awards: [{ recognition: "", year: "", field: "", affiliation: "", level: "" }],
    presentEmploymentStatus: "",
    preferredJobTypes: [],
    placementLocation: "",
    placementPincode: "",
  });

  const [workExperiences, setWorkExperiences] = useState([{ ...emptyWorkExperience }]);
  const [formalEducations, setFormalEducations] = useState([{
    type: "graduation", year: "", university: "", institute: "", specialization: "", percentage: "", board: "", level: ""
  }]);
  const [nonFormalEducations, setNonFormalEducations] = useState([{
    type: "iti", year: "", university: "", institute: "", specialization: "", percentage: ""
  }]);

  const [files, setFiles] = useState({ resume: null, coverLetter: null, experienceLetter: null });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, router]);

  useEffect(() => {
    const loadData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;
      try {
        const dropRes = await fetch("/api/dropdowns");
        if (dropRes.ok) {
          const drops = await dropRes.json();
          setDropdownOptions({
            profession: drops.filter(d => d.type === "profession"),
            position: drops.filter(d => d.type === "position"),
            reference: drops.filter(d => d.type === "reference"),
            jobCategory: drops.filter(d => d.type === "jobIndustry"),
            experienceLevel: drops.filter(d => d.type === "presentEmploymentStatus"),
            jobDepartment: drops.filter(d => d.type === "jobDepartment"),
          });
        }
        const res = await fetch(`/api/candidates?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            if (!data.awards || data.awards.length === 0) {
              data.awards = [{ recognition: "", year: "", field: "", affiliation: "", level: "" }];
            }
            if (Array.isArray(data.skills)) {
              data.skills = data.skills.join(", ");
            }
            if (data.workExperiences && data.workExperiences.length > 0) {
              setWorkExperiences(data.workExperiences);
            } else if (data.currentCompanyName || data.jobDepartment || data.presentEmploymentStatus) {
              setWorkExperiences([{
                currentCompanyName: data.currentCompanyName || "",
                designation: data.designation || "",
                jobDepartment: data.jobDepartment || "",
                jobIndustry: data.jobIndustry || "",
                jobFromDate: data.jobFromDate || "",
                jobToDate: data.jobToDate || "",
                jobDescription: data.jobDescription || "",
                presentEmploymentStatus: data.presentEmploymentStatus || "",
                lastSalary: data.lastSalary || "",
                expectedSalary: data.expectedSalary || "",
                noticePeriod: data.noticePeriod || ""
              }]);
            }

            if (data.formalEducations && data.formalEducations.length > 0) {
              setFormalEducations(data.formalEducations);
            } else {
              const legacyFormal = [];
              if (data.graduationYear || data.graduationUniversity) {
                legacyFormal.push({
                  type: "Graduation", year: data.graduationYear || "", university: data.graduationUniversity || "",
                  institute: data.graduationInstitute || "", specialization: data.graduationSpecialization || "",
                  percentage: data.graduationPercentage || "", board: "", level: ""
                });
              }
              if (data.postGraduationYear || data.postGraduationUniversity) {
                legacyFormal.push({
                  type: "Post Graduation", year: data.postGraduationYear || "", university: data.postGraduationUniversity || "",
                  institute: data.postGraduationInstitute || "", specialization: data.postGraduationSpecialization || "",
                  percentage: data.postGraduationPercentage || "", board: "", level: ""
                });
              }
              if (data.pgDiplomaYear || data.pgDiplomaUniversity) {
                legacyFormal.push({
                  type: "PG Diploma", year: data.pgDiplomaYear || "", university: data.pgDiplomaUniversity || "",
                  institute: data.pgDiplomaInstitute || "", specialization: data.pgDiplomaSpecialization || "",
                  percentage: data.pgDiplomaPercentage || "", board: "", level: ""
                });
              }
              if (legacyFormal.length > 0) setFormalEducations(legacyFormal);
            }

            if (data.nonFormalEducations && data.nonFormalEducations.length > 0) {
              setNonFormalEducations(data.nonFormalEducations);
            } else {
              const legacyNonFormal = [];
              if (data.itiYear || data.itiUniversity) {
                legacyNonFormal.push({
                  type: "ITI", year: data.itiYear || "", university: data.itiUniversity || "",
                  institute: data.itiInstitute || "", specialization: data.itiSpecialization || "",
                  percentage: data.itiPercentage || ""
                });
              }
              if (data.diplomaYear || data.diplomaUniversity) {
                legacyNonFormal.push({
                  type: "Diploma", year: data.diplomaYear || "", university: data.diplomaUniversity || "",
                  institute: data.diplomaInstitute || "", specialization: data.diplomaSpecialization || "",
                  percentage: data.diplomaPercentage || ""
                });
              }
              if (legacyNonFormal.length > 0) setNonFormalEducations(legacyNonFormal);
            }
            setFormData(prev => ({
              ...prev,
              ...data,
              reference: data.reference || data.Reference || "",
              fullName: prev.fullName || data.fullName || session?.user?.name || "",
              email: session?.user?.email
            }));
            setIsExistingUser(true);
            setFormData(prev => ({
              ...prev,
              email: session?.user?.email,
              fullName: session?.user?.name || ""
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [status, session]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "pincode" && value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0]?.Status === "Success") {
          const details = data[0].PostOffice[0];
          setFormData(prev => ({ ...prev, city: details.District, state: details.State }));
        }
      } catch (err) { console.error("Pincode fetch error:", err); }
    }
  };

  // Work Experience handlers
  const handleWorkChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...workExperiences];
    updated[index][name] = value;
    setWorkExperiences(updated);
  };
  const addWork = () => setWorkExperiences(prev => [...prev, { ...emptyWorkExperience }]);
  const removeWork = (index) => {
    if (workExperiences.length > 1) setWorkExperiences(prev => prev.filter((_, i) => i !== index));
  };

  // Formal Education handlers
  const handleFormalChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formalEducations];
    updated[index][name] = value;
    setFormalEducations(updated);
  };
  const addFormal = () => setFormalEducations(prev => [...prev, { ...emptyFormalEducation }]);
  const removeFormal = (index) => {
    if (formalEducations.length > 1) setFormalEducations(prev => prev.filter((_, i) => i !== index));
  };

  // Non Formal Education handlers
  const handleNonFormalChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...nonFormalEducations];
    updated[index][name] = value;
    setNonFormalEducations(updated);
  };
  const addNonFormal = () => setNonFormalEducations(prev => [...prev, { ...emptyNonFormalEducation }]);
  const removeNonFormal = (index) => {
    if (nonFormalEducations.length > 1) setNonFormalEducations(prev => prev.filter((_, i) => i !== index));
  };

  const handleAwardChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAwards = [...formData.awards];
    updatedAwards[index][name] = value;
    setFormData(prev => ({ ...prev, awards: updatedAwards }));
  };

  const addAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, { recognition: "", year: "", field: "", affiliation: "", level: "" }]
    }));
  };

  const removeAward = (index) => {
    if (formData.awards.length > 1) {
      const updatedAwards = formData.awards.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, awards: updatedAwards }));
    } else {
      setFormData(prev => ({
        ...prev,
        awards: [{ recognition: "", year: "", field: "", affiliation: "", level: "" }]
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      const excludeKeys = ['workExperiences', 'formalEducations', 'nonFormalEducations', 'resume', 'coverLetter', 'experienceLetter', '_id', 'userId', 'createdAt', 'updatedAt', '__v'];
      Object.keys(formData).forEach(key => {
        if (excludeKeys.includes(key)) return;
        if (key === 'skills') {
          const skillsArray = typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== "") : formData.skills;
          data.append(key, JSON.stringify(skillsArray));
        } else if (key === 'awards') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === 'preferredJobTypes') {
          data.append(key, JSON.stringify(formData.preferredJobTypes || []));
        } else {
          data.append(key, formData[key] || "");
        }
      });
      data.append("workExperiences", JSON.stringify(workExperiences));
      data.append("formalEducations", JSON.stringify(formalEducations));
      data.append("nonFormalEducations", JSON.stringify(nonFormalEducations));
      if (files.resume) data.append("resume", files.resume);
      if (files.coverLetter) data.append("coverLetter", files.coverLetter);
      if (files.experienceLetter) data.append("experienceLetter", files.experienceLetter);

      const res = await fetch("/api/candidates", { method: "POST", body: data });
      if (res.ok) {
        const savedData = await res.json();
        if (savedData) {
          if (Array.isArray(savedData.skills)) {
            savedData.skills = savedData.skills.join(", ");
          }
          setFormData(prev => ({ ...prev, ...savedData }));
          if (savedData.workExperiences) setWorkExperiences(savedData.workExperiences);
          if (savedData.formalEducations) setFormalEducations(savedData.formalEducations);
          if (savedData.nonFormalEducations) setNonFormalEducations(savedData.nonFormalEducations);
        }
        setFiles({ resume: null, coverLetter: null, experienceLetter: null });
        alert(isExistingUser ? "Profile updated successfully!" : "Profile created successfully!");
        setIsExistingUser(true);
        setIsPreview(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Error saving profile");
      }
    } catch (err) { alert("Error saving profile"); } finally { setSaving(false); }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <UserSidebar />
      <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">

          {/* Header with Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {isPreview ? "Candidate Profile" : (isExistingUser ? "Edit Profile" : "Complete Profile")}
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                {isPreview ? "How recruiters see your information" : "Fill all details as per your documents"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all shadow-md ${isPreview ? 'bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
              >
                {isPreview ? <><Edit3 size={18} /> Edit Profile</> : <><Eye size={18} /> View Preview</>}
              </button>

              {!isPreview && (
                <button onClick={handleSubmit} disabled={saving} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? "Processing..." : "Save Profile"}
                </button>
              )}
            </div>
          </div>

          <form className="space-y-10 pb-20" onSubmit={(e) => e.preventDefault()}>

            {/* 1. PERSONAL PROFILE + ADDRESS (Merged) */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><User size={22} /></div>
                <h2 className="text-2xl font-extrabold text-slate-800">Personal Profile</h2>
              </div>

              {isPreview ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <PreviewItem label="Full Name" value={formData.fullName} />
                    <PreviewItem label="Email Address" value={formData.email} icon={Mail} />
                    <PreviewItem label="Mobile Number" value={formData.mobile} icon={Phone} />
                    <PreviewItem label="Date of Birth" value={formData.dob} icon={Calendar} />
                    <PreviewItem label="Gender" value={formData.gender} />
                    <PreviewItem label="Religion" value={formData.religion} />
                    <PreviewItem label="Mother Tongue" value={formData.motherTongue} />
                    <PreviewItem label="Profession" value={formData.profession} />
                    <PreviewItem label="Desired Position" value={formData.position} />
                    <PreviewItem label="Reference" value={formData.reference} />
                    <PreviewItem label="Industry" value={formData.jobIndustry} />
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Address</p>
                      <p className="text-lg font-bold text-slate-800 leading-relaxed">{formData.address || "—"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <PreviewItem label="City" value={formData.city} />
                      <PreviewItem label="State" value={formData.state} />
                      <PreviewItem label="Pincode" value={formData.pincode} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Row 1: Name, Email, Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                    <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} readOnly={true} />
                    <InputField label="Mobile Number" name="mobile" type="tel" value={formData.mobile} onChange={handleInputChange} />
                  </div>
                  {/* Row 2: DOB, Gender, Position */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                    <SelectField label="Gender" name="gender" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleInputChange} />
                    <SelectField label="Religion" name="religion" options={["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"]} value={formData.religion} onChange={handleInputChange} />
                  </div>
                  {/* Row 3: Reference, Industry, Profession — all in one line */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleInputChange} />
                    <SelectField label="Desired Position" name="position" options={dropdownOptions.position} value={formData.position} onChange={handleInputChange} />
                    <SelectField label="Reference" name="reference" options={dropdownOptions.reference} value={formData.reference} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Industry" name="jobIndustry" options={dropdownOptions.jobCategory} value={formData.jobIndustry} onChange={handleInputChange} />
                    <SelectField label="Profession" name="profession" options={dropdownOptions.profession} value={formData.profession} onChange={handleInputChange} />
                  </div>
                  {/* Divider */}
                  <hr className="border-slate-100" />
                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600 ml-1">Full Address</label>
                      <textarea name="address" rows="2" value={formData.address || ""} onChange={handleInputChange} className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 shadow-sm font-bold text-slate-700" />
                    </div>
                    <InputField label="Pincode" name="pincode" maxLength={6} placeholder="6 Digit Pincode" value={formData.pincode} onChange={handleInputChange} />
                    <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} />
                    <SelectField label="State" name="state" options={allStates} value={formData.state} onChange={handleInputChange} />
                  </div>
                </div>
              )}
            </div>

            {/* 2. FORMAL EDUCATION */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap size={22} /></div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Formal Education</h2>
                </div>
                {!isPreview && (
                  <button type="button" onClick={addFormal} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm">
                    <Plus size={18} /> Add Education
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {/* Class X & XII — fixed, always shown */}
                {isPreview ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          <th className="py-4 text-xs font-black text-slate-400 uppercase">Level</th>
                          <th className="py-4 text-xs font-black text-slate-400 uppercase">Board</th>
                          <th className="py-4 text-xs font-black text-slate-400 uppercase">Year</th>
                          <th className="py-4 text-xs font-black text-slate-400 uppercase text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-slate-700">
                        {formData.classXIIYear && (
                          <tr className="border-b border-slate-50">
                            <td className="py-4">Class XII</td>
                            <td className="py-4">{formData.classXIIBoard}</td>
                            <td className="py-4">{formData.classXIIYear}</td>
                            <td className="py-4 text-right text-indigo-600">{formData.classXIIPercentage}%</td>
                          </tr>
                        )}
                        {formData.classXYear && (
                          <tr className="border-b border-slate-50">
                            <td className="py-4">Class X</td>
                            <td className="py-4">{formData.classXBoard}</td>
                            <td className="py-4">{formData.classXYear}</td>
                            <td className="py-4 text-right text-indigo-600">{formData.classXPercentage}%</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <SelectField label="Class X Passing Year" name="classXYear" options={years} value={formData.classXYear} onChange={handleInputChange} />
                      <BoardSearchField label="Class X Board" name="classXBoard" placeholder="" value={formData.classXBoard} onChange={handleInputChange} />
                      <InputField label="School Name" name="classXSchool" value={formData.classXSchool} onChange={handleInputChange} />
                      <InputField label="Percentage (%)" name="classXPercentage" value={formData.classXPercentage} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <SelectField label="Class XII Passing Year" name="classXIIYear" options={years} value={formData.classXIIYear} onChange={handleInputChange} />
                      <BoardSearchField label="Class XII Board" name="classXIIBoard" placeholder="" value={formData.classXIIBoard} onChange={handleInputChange} />
                      <InputField label="School Name" name="classXIISchool" value={formData.classXIISchool} onChange={handleInputChange} />
                      <InputField label="Percentage (%)" name="classXIIPercentage" value={formData.classXIIPercentage} onChange={handleInputChange} />
                    </div>
                  </div>
                )}

                {/* Dynamic Formal Education Entries (Graduation, PG, PG Diploma, etc.) */}
                {isPreview ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {formalEducations.map((edu, index) => (
                      edu.year && (
                        <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-black text-indigo-500 uppercase mb-2">{edu.type}</p>
                          <h4 className="text-xl font-black text-slate-800">{edu.specialization}</h4>
                          <p className="font-bold text-slate-600">{edu.university}</p>
                          <p className="text-sm text-slate-500 font-medium">{edu.institute}</p>
                          <div className="flex justify-between mt-4 text-sm font-black text-slate-400">
                            <span>Year: {edu.year}</span>
                            <span className="text-indigo-600">Score: {edu.percentage}</span>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formalEducations.map((edu, index) => (
                      <div key={index} className="relative group bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        {formalEducations.length > 1 && (
                          <button type="button" onClick={() => removeFormal(index)} className="absolute -top-3 -right-3 bg-white text-rose-500 p-2 rounded-full shadow-md border border-rose-100 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 z-10">
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                          <SelectField
                            label="Education Type"
                            name="type"
                            options={["Graduation", "Post Graduation", "PG Diploma"]}
                            value={edu.type}
                            onChange={(e) => handleFormalChange(index, e)}
                          />
                          <SelectField label="Passing Year" name="year" options={years} value={edu.year} onChange={(e) => handleFormalChange(index, e)} />
                          <UniversitySearchField label="University" name="university" placeholder="" value={edu.university} onChange={(e) => handleFormalChange(index, e)} />
                          <InputField label="College/Institute" name="institute" value={edu.institute} onChange={(e) => handleFormalChange(index, e)} />
                          <InputField label="Specialization" name="specialization" value={edu.specialization} onChange={(e) => handleFormalChange(index, e)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <InputField label="CGPA / %" name="percentage" value={edu.percentage} onChange={(e) => handleFormalChange(index, e)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. NON FORMAL EDUCATION */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><BookOpen size={22} /></div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Non Formal Education</h2>
                </div>
                {!isPreview && (
                  <button type="button" onClick={addNonFormal} className="flex items-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-2 rounded-xl font-bold hover:bg-cyan-100 transition-all text-sm">
                    <Plus size={18} /> Add Course
                  </button>
                )}
              </div>

              {isPreview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {nonFormalEducations.map((edu, index) => (
                    edu.year && (
                      <div key={index} className="p-5 border border-slate-100 rounded-2xl">
                        <p className="text-[10px] font-black text-cyan-600 uppercase">{edu.type}</p>
                        <p className="text-lg font-black text-slate-800">{edu.specialization}</p>
                        <p className="text-sm font-bold text-slate-500">{edu.institute} ({edu.year})</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {nonFormalEducations.map((edu, index) => (
                    <div key={index} className="relative group bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      {nonFormalEducations.length > 1 && (
                        <button type="button" onClick={() => removeNonFormal(index)} className="absolute -top-3 -right-3 bg-white text-rose-500 p-2 rounded-full shadow-md border border-rose-100 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 z-10">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <SelectField
                          label="Type"
                          name="type"
                          options={["ITI", "Diploma"]}
                          value={edu.type}
                          onChange={(e) => handleNonFormalChange(index, e)}
                        />
                        <SelectField label="Passing Year" name="year" options={years} value={edu.year} onChange={(e) => handleNonFormalChange(index, e)} />
                        <BoardSearchField label="Board" name="university" type="iti_diploma" placeholder="" value={edu.university} onChange={(e) => handleNonFormalChange(index, e)} />
                        <InputField label="Institute" name="institute" value={edu.institute} onChange={(e) => handleNonFormalChange(index, e)} />
                        <InputField label="Specialization" name="specialization" value={edu.specialization} onChange={(e) => handleNonFormalChange(index, e)} />
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Percentage (%)" name="percentage" value={edu.percentage} onChange={(e) => handleNonFormalChange(index, e)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. PROFILE & STATUS MANAGEMENT */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[#EEF2F6] text-slate-700 rounded-xl"><Sliders size={22} /></div>
                <h2 className="text-2xl font-extrabold text-slate-800">Profile & Status Management</h2>
              </div>

              {isPreview ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Employment Status</p>
                      <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100">
                        <User size={14} /> {formData.presentEmploymentStatus || "Not Specified"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Preferred Job Types</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.preferredJobTypes && formData.preferredJobTypes.length > 0 ? (
                          formData.preferredJobTypes.map((type, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs border border-slate-200">
                              {type}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 font-bold text-sm">No preferences selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Preferred Placement Area</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Preferred Location</p>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" /> {formData.placementLocation || "Not Specified"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Preferred Pincode</p>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" /> {formData.placementPincode || "Not Specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employment Status Selector */}
                    <SelectField
                      label="Employment Status"
                      name="presentEmploymentStatus"
                      options={Array.from(new Set([
                        "Open for Change",
                        "Bench",
                        "No Job",
                        "Employed",
                        ...(dropdownOptions.experienceLevel || []).map(opt => typeof opt === 'string' ? opt : (opt.value || opt.label))
                      ].filter(Boolean)))}
                      value={formData.presentEmploymentStatus}
                      onChange={handleInputChange}
                    />

                    {/* Preferred Job Types Radio Buttons */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600 ml-1">Preferred Job Types</label>
                      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl">
                        {[
                          "Full-time",
                          "Part-time",
                          "Freelance",
                          "Remote",
                          "Project Based",
                          "Offline / On-site",
                          "Hourly Basis"
                        ].map((type) => {
                          const isChecked = Array.isArray(formData.preferredJobTypes) && formData.preferredJobTypes.includes(type);
                          return (
                            <label key={type} className="flex items-center gap-3 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="preferredJobType"
                                value={type}
                                checked={isChecked}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, preferredJobTypes: [type] }));
                                }}
                                className="w-5 h-5 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="text-sm font-bold text-slate-700">{type}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Placement Area */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-indigo-600" /> Placement Area (Preferred Job Location)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Preferred Location"
                        name="placementLocation"
                        placeholder="e.g. Ahmedabad, Mumbai"
                        value={formData.placementLocation}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Preferred Pincode"
                        name="placementPincode"
                        placeholder="e.g. 380001"
                        value={formData.placementPincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Urgent Broadcast Box if status is "No Job" */}
                  {formData.presentEmploymentStatus === "No Job" && (
                    <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <h4 className="text-amber-800 font-black text-base uppercase tracking-wider flex items-center gap-2 mb-3">
                        <AlertCircle size={20} className="text-amber-600" /> Urgent: Broadcast My Status
                      </h4>
                      <div className="text-amber-700 text-sm space-y-3 font-bold leading-relaxed">
                        <p className="bg-white/80 p-4 rounded-2xl border border-amber-100 text-slate-800">
                          <span className="text-rose-600 font-black">Important Notice:</span> By selecting <span className="underline">"No Job"</span>, the system will broadcast an automated notification to all <b>Candidates</b> and <b>Recruiters</b> stating that you are looking for immediate employment.
                        </p>
                        <div className="flex items-start gap-3 p-2">
                          <Info size={16} className="shrink-0 mt-1" />
                          <p>Please use this feature responsibly. It is designed to highlight your profile to potential employers when you are in urgent need.</p>
                        </div>
                        <p className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] inline-block uppercase tracking-widest">
                          🔒 Usage Limit: This feature can only be triggered <b>once per year</b>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. WORK EXPERIENCE */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Briefcase size={22} /></div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Work Experience</h2>
                </div>
                {!isPreview && (
                  <button type="button" onClick={addWork} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-all text-sm">
                    <Plus size={18} /> Add Experience
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {workExperiences.map((work, index) => (
                  isPreview ? (
                    <div key={index} className="border-l-4 border-emerald-500 pl-6 space-y-2">
                      <h3 className="text-2xl font-black text-slate-800">{work.currentCompanyName || "Company Name Not Set"}</h3>
                      <p className="text-emerald-700 font-bold text-base">{work.designation || "Designation not set"}</p>
                      <p className="text-indigo-600 font-bold text-lg">{work.jobDepartment} • {work.jobIndustry}</p>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full"><Calendar size={14} /> {work.jobFromDate} to {work.jobToDate || "Present"}</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Role Description</p>
                        <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl">{work.jobDescription || "No description provided."}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-slate-100">
                        <PreviewItem label="Current CTC" value={work.lastSalary} />
                        <PreviewItem label="Expected CTC" value={work.expectedSalary} />
                        <PreviewItem label="Notice Period" value={work.noticePeriod} />
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="relative group bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      {workExperiences.length > 1 && (
                        <button type="button" onClick={() => removeWork(index)} className="absolute -top-3 -right-3 bg-white text-rose-500 p-2 rounded-full shadow-md border border-rose-100 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 z-10">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InputField label="Current/Last Company" name="currentCompanyName" value={work.currentCompanyName} onChange={(e) => handleWorkChange(index, e)} />
                        <InputField label="Designation / Position Held" name="designation" value={work.designation} onChange={(e) => handleWorkChange(index, e)} />
                        <SelectField label="Department" name="jobDepartment" options={dropdownOptions.jobDepartment} value={work.jobDepartment} onChange={(e) => handleWorkChange(index, e)} />
                        <SelectField label="Industry" name="jobIndustry" options={dropdownOptions.jobCategory} value={work.jobIndustry} onChange={(e) => handleWorkChange(index, e)} />
                        <InputField label="From Date" name="jobFromDate" type="date" value={work.jobFromDate} onChange={(e) => handleWorkChange(index, e)} />
                        <InputField label="To Date" name="jobToDate" type="date" value={work.jobToDate} onChange={(e) => handleWorkChange(index, e)} />
                        <InputField label="Current CTC" name="lastSalary" value={work.lastSalary} onChange={(e) => handleWorkChange(index, e)} />
                        <InputField label="Expected CTC" name="expectedSalary" value={work.expectedSalary} onChange={(e) => handleWorkChange(index, e)} />
                        <SelectField label="Notice Period" name="noticePeriod" options={["Immediate", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"]} value={work.noticePeriod} onChange={(e) => handleWorkChange(index, e)} />
                        <div className="md:col-span-3">
                          <InputField label="Job Description" name="jobDescription" value={work.jobDescription} onChange={(e) => handleWorkChange(index, e)} />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* 6. AWARDS & RECOGNITION */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Star size={22} /></div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Awards & Recognition</h2>
                </div>
                {!isPreview && (
                  <button type="button" onClick={addAward} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-all text-sm">
                    <Plus size={18} /> Add Award
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {formData.awards?.map((award, index) => (
                  isPreview ? (
                    award.recognition && (
                      <div key={index} className="flex items-start gap-4 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                        <Award className="text-yellow-600 shrink-0" size={24} />
                        <div>
                          <p className="text-lg font-black text-slate-800">{award.recognition} ({award.year})</p>
                          <p className="text-sm font-bold text-slate-500">{award.field} • {award.affiliation} ({award.level})</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div key={index} className="relative group grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <button type="button" onClick={() => removeAward(index)} className="absolute -top-3 -right-3 bg-white text-rose-500 p-2 rounded-full shadow-md border border-rose-100 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 z-10">
                        <Trash2 size={16} />
                      </button>
                      <InputField label={`Award Name`} name="recognition" value={award.recognition} onChange={(e) => handleAwardChange(index, e)} />
                      <SelectField label="Year" name="year" options={years} value={award.year} onChange={(e) => handleAwardChange(index, e)} />
                      <InputField label="Field" name="field" value={award.field} onChange={(e) => handleAwardChange(index, e)} />
                      <InputField label="Affiliation" name="affiliation" value={award.affiliation} onChange={(e) => handleAwardChange(index, e)} />
                      <SelectField label="Level" name="level" options={["Local", "State", "National", "International"]} value={award.level} onChange={(e) => handleAwardChange(index, e)} />
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* 7. SKILLS & SOCIALS */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Globe size={22} /></div>
                <h2 className="text-2xl font-extrabold text-slate-800">Skills & Socials</h2>
              </div>

              {isPreview ? (
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(',').map((skill, i) => (
                        <span key={i} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold text-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {formData.github && (
                      <a href={formData.github} target="_blank" className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 transition-all">
                        <Globe size={18} /> GitHub
                      </a>
                    )}
                    {formData.portfolio && (
                      <a href={formData.portfolio} target="_blank" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 transition-all">
                        <ExternalLink size={18} /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField
                      label="Skills (Comma separated)"
                      name="skills"
                      placeholder="React, Python, Management..."
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>
                  <InputField label="GitHub URL" name="github" value={formData.github} onChange={handleInputChange} />
                  <InputField label="Portfolio URL" name="portfolio" value={formData.portfolio} onChange={handleInputChange} />
                </div>
              )}
            </div>

            {/* 8. DOCUMENTS */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><FileText size={22} /></div>
                <h2 className="text-2xl font-extrabold text-slate-800">Documents</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['resume', 'coverLetter', 'experienceLetter'].map((fileKey) => {
                  const existingUrl = formData[fileKey];
                  const selectedFile = files[fileKey];
                  const displayName = selectedFile
                    ? selectedFile.name
                    : (existingUrl ? existingUrl.split('/').pop().replace(/^\d+-/, '') : "No file uploaded");
                  const hasFile = selectedFile || existingUrl;

                  return (
                    <div key={fileKey} className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center min-h-[160px]">
                      <FileText size={30} className={`mb-3 ${hasFile ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                        {fileKey.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <p className="text-[11px] font-bold text-slate-700 truncate max-w-[180px] mb-4" title={displayName}>
                        {displayName}
                      </p>
                      
                      <div className="flex gap-2 z-20">
                        {existingUrl && (
                          <a
                            href={existingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all animate-in fade-in duration-200"
                          >
                            <Eye size={12} /> View
                          </a>
                        )}
                        {!isPreview && (
                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer">
                            <Plus size={12} /> {existingUrl ? "Change" : "Upload"}
                            <input 
                              type="file" 
                              name={fileKey} 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
