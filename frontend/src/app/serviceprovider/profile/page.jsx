// "use client";
// import React, { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react'; 
// import Sidebar from '@/components/Serviceprovidersidbar';
// import { 
//   BadgeCheck, MapPin, Mail, Phone, Edit3, Save, Loader2, 
//   Briefcase, Star, MessageCircle, FileText, Fingerprint, ShieldCheck, Upload, ExternalLink
// } from 'lucide-react';

// export default function ProfilePage() {
//   const { data: session } = useSession(); 
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveStatus, setSaveStatus] = useState("");

//   const [profile, setProfile] = useState({
//     fullName: "",
//     username: "",
//     email: "",
//     mobile: "",
//     whatsappNumber: "", 
//     providerName: "",
//     serviceCategory: "",
//     experience: "",
//     location: "",
//     gstNumber: "",
//     aadharNumber: "",
//     panNumber: "",
//     aadharDoc: "",
//     panDoc: "",
//     gstDoc: "",
//     status: "pending"
//   });

//   useEffect(() => {
//     async function fetchProfile() {
//       if (!session?.user?.email) return; 

//       try {
//         const response = await fetch(`/api/admin/serviceproviders?email=${session.user.email}`);
//         if (!response.ok) throw new Error("Network response was not ok");
        
//         const data = await response.json();
//         if (data.providers) {
//           const currentProfile = data.providers.find(p => p.email === session.user.email);
//           if (currentProfile) {
//             setProfile({
//               ...currentProfile,
//               whatsappNumber: currentProfile.whatsappNumber || "",
//               gstNumber: currentProfile.gstNumber || "",
//               aadharNumber: currentProfile.aadharNumber || "",
//               panNumber: currentProfile.panNumber || "",
//               aadharDoc: currentProfile.aadharDoc || "",
//               panDoc: currentProfile.panDoc || "",
//               gstDoc: currentProfile.gstDoc || ""
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch profile", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     fetchProfile();
//   }, [session]);

//   const handleFileChange = async (e, fieldName) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('action', 'upload'); // આ ખાસ ઉમેરવું
  
//     try {
//       setSaveStatus(`Uploading...`);
//       const res = await fetch('/api/serviceprovider/register', { // API Path બદલાયો
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       if (res.ok && data.success) {
//         setProfile(prev => ({ ...prev, [fieldName]: data.url }));
//         setSaveStatus("Uploaded!");
//       } else {
//         setSaveStatus("Upload Error");
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//       setSaveStatus("Upload Failed");
//     } finally {
//       setTimeout(() => setSaveStatus(""), 2000);
//     }
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     setSaveStatus("");
//     try {
//       const response = await fetch('/api/serviceprovider/register', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(profile), 
//       });

//       const data = await response.json();
//       if (response.ok && data.success) {
//         setProfile(prev => ({ ...prev, ...data.user })); 
//         setIsEditing(false);
//         setSaveStatus("Saved!");
//       } else {
//         setSaveStatus(data.error || "Error!");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       setSaveStatus("Failed!");
//     } finally {
//       setIsSaving(false);
//       setTimeout(() => setSaveStatus(""), 3000);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile(prev => ({ ...prev, [name]: value }));
//   };

//   if (isLoading) return (
//     <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
//       <div className="flex flex-col items-center gap-4">
//         <Loader2 className="animate-spin text-indigo-600" size={40} />
//         <p className="text-slate-500 font-bold animate-pulse text-sm">Loading Profile...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
//       <Sidebar activePage="profile" />

//       <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 mt-16 lg:mt-0">
//         <div className="max-w-5xl mx-auto space-y-6">
          
//           {/* --- PROFILE HEADER --- */}
//           <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
//             <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-6 md:gap-8 relative z-10">
//               <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden">
//                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName || 'User'}`} alt="profile" className="w-full h-full object-cover" />
//               </div>

//               <div className="flex-1 w-full text-center md:text-left">
//                 {isEditing ? (
//                   <div className="space-y-4 max-w-md mx-auto md:mx-0">
//                     <input name="fullName" value={profile.fullName || ""} onChange={handleChange} className="text-xl font-black text-slate-800 outline-none w-full bg-slate-50 p-2 rounded-xl" placeholder="Full Name" />
//                     <input name="providerName" value={profile.providerName || ""} onChange={handleChange} className="text-indigo-600 font-bold outline-none w-full bg-slate-50 p-2 rounded-xl" placeholder="Business Name" />
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex items-center justify-center md:justify-start gap-2">
//                       <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{profile.fullName || "Your Name"}</h1>
//                       {profile.status === "approved" && <BadgeCheck className="text-indigo-600" size={24} />}
//                     </div>
//                     <p className="text-indigo-600 font-bold text-lg">{profile.providerName || "Service Provider"}</p>
//                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${profile.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{profile.status}</span>
//                   </>
//                 )}
//               </div>

//               <div className="flex flex-col items-center gap-3">
//                 <button onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={isSaving} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isEditing ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"}`}>
//                   {isSaving ? <Loader2 className="animate-spin" size={16}/> : isEditing ? "Save Changes" : "Edit Profile"}
//                 </button>
//                 {saveStatus && <div className="text-[10px] font-black uppercase text-indigo-600 animate-pulse">{saveStatus}</div>}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
//               <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-4">Service Details</h3>
//               <div className="space-y-5">
//                 <EditableField label="Category" icon={<Briefcase size={18}/>} name="serviceCategory" value={profile.serviceCategory} isEditing={isEditing} onChange={handleChange} />
//                 <EditableField label="Experience" icon={<Star size={18}/>} name="experience" value={profile.experience} isEditing={isEditing} onChange={handleChange} />
//                 <EditableField label="Location" icon={<MapPin size={18}/>} name="location" value={profile.location} isEditing={isEditing} onChange={handleChange} />
//               </div>
//             </div>

//             <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
//               <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-4">Contact Info</h3>
//               <div className="space-y-5">
//                 <EditableField label="Email" icon={<Mail size={18}/>} name="email" value={profile.email} isEditing={isEditing} onChange={handleChange} readOnly={true} />
//                 <EditableField label="Mobile" icon={<Phone size={18}/>} name="mobile" value={profile.mobile} isEditing={isEditing} onChange={handleChange} />
//                 <EditableField label="WhatsApp" icon={<MessageCircle size={18}/>} name="whatsappNumber" value={profile.whatsappNumber} isEditing={isEditing} onChange={handleChange} />
//               </div>
//             </div>

//             {/* --- VERIFICATION & FILE UPLOADS --- */}
//             <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-8 md:col-span-2">
//               <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-4">KYC Verification & Documents</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 {/* Aadhar Group */}
//                 <div className="space-y-4">
//                   <EditableField label="Aadhar Number" icon={<Fingerprint size={18}/>} name="aadharNumber" value={profile.aadharNumber} isEditing={isEditing} onChange={handleChange} />
//                   <FileField label="Aadhar Document (PDF/Image)" value={profile.aadharDoc} isEditing={isEditing} onFileChange={(e) => handleFileChange(e, 'aadharDoc')} />
//                 </div>

//                 {/* PAN Group */}
//                 <div className="space-y-4">
//                   <EditableField label="PAN Number" icon={<FileText size={18}/>} name="panNumber" value={profile.panNumber} isEditing={isEditing} onChange={handleChange} />
//                   <FileField label="PAN Document (PDF/Image)" value={profile.panDoc} isEditing={isEditing} onFileChange={(e) => handleFileChange(e, 'panDoc')} />
//                 </div>

//                 {/* GST Group */}
//                 <div className="space-y-4">
//                   <EditableField label="GST Number" icon={<ShieldCheck size={18}/>} name="gstNumber" value={profile.gstNumber} isEditing={isEditing} onChange={handleChange} />
//                   <FileField label="GST Document (PDF/Image)" value={profile.gstDoc} isEditing={isEditing} onFileChange={(e) => handleFileChange(e, 'gstDoc')} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// function EditableField({ label, icon, name, value, isEditing, onChange, readOnly = false }) {
//   return (
//     <div className="flex items-center gap-4">
//       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 border shrink-0">{icon}</div>
//       <div className="flex-1 overflow-hidden">
//         <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
//         {isEditing && !readOnly ? (
//           <input name={name} value={value || ""} onChange={onChange} className="w-full bg-slate-50 border-b-2 border-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 py-1" />
//         ) : (
//           <p className="text-sm font-bold truncate text-slate-700">{value || "Not Set"}</p>
//         )}
//       </div>
//     </div>
//   );
// }

// function FileField({ label, value, isEditing, onFileChange }) {
//   return (
//     <div className="bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
//       <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{label}</p>
//       {isEditing ? (
//         <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
//           <Upload size={16} className="text-indigo-600" />
//           <span className="text-xs font-black text-indigo-600 uppercase">Upload File</span>
//           <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileChange} />
//         </label>
//       ) : value ? (
//         <a href={value} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-100 group">
//           <span className="text-xs font-bold text-emerald-700">Document Uploaded</span>
//           <ExternalLink size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
//         </a>
//       ) : (
//         <div className="text-xs font-bold text-slate-400 italic">No document uploaded</div>
//       )}
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; 
import Sidebar from '@/components/Serviceprovidersidbar';
import ReviewSystem from '@/components/ReviewSystem';
import { 
  BadgeCheck, MapPin, Mail, Phone, Edit3, Save, Loader2, 
  Briefcase, Star, MessageCircle, FileText, Fingerprint, ShieldCheck, Upload, ExternalLink, Flag
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession(); 
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    mobile: "",
    whatsappNumber: "", 
    providerName: "",
    serviceCategory: "",
    experience: "",
    location: "",
    gstNumber: "",
    aadharNumber: "",
    panNumber: "",
    aadharDoc: "",
    panDoc: "",
    gstDoc: "",
    status: "pending"
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.email) return; 

      try {
        const response = await fetch(`/api/admin/serviceproviders?email=${session.user.email}`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        if (data.providers) {
          const currentProfile = data.providers.find(p => p.email === session.user.email);
          if (currentProfile) {
            setProfile({
              ...currentProfile,
              whatsappNumber: currentProfile.whatsappNumber || "",
              gstNumber: currentProfile.gstNumber || "",
              aadharNumber: currentProfile.aadharNumber || "",
              panNumber: currentProfile.panNumber || "",
              aadharDoc: currentProfile.aadharDoc || "",
              panDoc: currentProfile.panDoc || "",
              gstDoc: currentProfile.gstDoc || ""
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [session]);

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'upload');
  
    try {
      setSaveStatus(`Uploading...`);
      const res = await fetch('/api/serviceprovider/register', { 
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(prev => ({ ...prev, [fieldName]: data.url }));
        setSaveStatus("Uploaded!");
      } else {
        setSaveStatus("Upload Error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setSaveStatus("Upload Failed");
    } finally {
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      const response = await fetch('/api/serviceprovider/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile), 
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfile(prev => ({ ...prev, ...data.user })); 
        setIsEditing(false);
        setSaveStatus("Saved!");
      } else {
        setSaveStatus(data.error || "Error!");
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("Failed!");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-bold animate-pulse text-sm">Loading Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      <Sidebar activePage="profile" />

      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 mt-16 lg:mt-0">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* --- PROFILE HEADER --- */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-6 md:gap-8 relative z-10">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName || 'User'}`} alt="profile" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4 max-w-md mx-auto md:mx-0">
                    <div className="relative">
                       <label className="text-[9px] font-black uppercase text-indigo-500 absolute -top-2 left-2 bg-white px-1">Full Name *</label>
                       <input name="fullName" value={profile.fullName || ""} onChange={handleChange} className="text-xl font-black text-slate-800 outline-none w-full bg-slate-50 p-2 rounded-xl border border-indigo-50" placeholder="Full Name" />
                    </div>
                    <div className="relative">
                       <label className="text-[9px] font-black uppercase text-indigo-500 absolute -top-2 left-2 bg-white px-1">Business Name *</label>
                       <input name="providerName" value={profile.providerName || ""} onChange={handleChange} className="text-indigo-600 font-bold outline-none w-full bg-slate-50 p-2 rounded-xl border border-indigo-50" placeholder="Business Name" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{profile.fullName || "Your Name"}</h1>
                      {profile.status === "approved" && <BadgeCheck className="text-indigo-600" size={24} />}
                    </div>
                    <p className="text-indigo-600 font-bold text-lg">{profile.providerName || "Service Provider"}</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${profile.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{profile.status}</span>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-3">
                <button onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={isSaving} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isEditing ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"}`}>
                  {isSaving ? <Loader2 className="animate-spin" size={16}/> : isEditing ? "Save Changes" : "Edit Profile"}
                </button>
                {saveStatus && <div className="text-[10px] font-black uppercase text-indigo-600 animate-pulse">{saveStatus}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-4">Service Details</h3>
              <div className="space-y-5">
                <EditableField label="Category *" icon={<Briefcase size={18}/>} name="serviceCategory" value={profile.serviceCategory} isEditing={isEditing} onChange={handleChange} />
                <EditableField label="Experience *" icon={<Star size={18}/>} name="experience" value={profile.experience} isEditing={isEditing} onChange={handleChange} />
                <EditableField label="Location *" icon={<MapPin size={18}/>} name="location" value={profile.location} isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-4">Contact Info</h3>
              <div className="space-y-5">
                <EditableField label="Email" icon={<Mail size={18}/>} name="email" value={profile.email} isEditing={isEditing} onChange={handleChange} readOnly={true} />
                <EditableField label="Mobile *" icon={<Phone size={18}/>} name="mobile" value={profile.mobile} isEditing={isEditing} onChange={handleChange} />
                <EditableField label="WhatsApp *" icon={<MessageCircle size={18}/>} name="whatsappNumber" value={profile.whatsappNumber} isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>

            {/* --- VERIFICATION & FILE UPLOADS --- */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-8 md:col-span-2">
              <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-4">KYC Verification & Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Aadhar Group */}
                <div className="space-y-4">
                  <EditableField label="Aadhar Number *" icon={<Fingerprint size={18}/>} name="aadharNumber" value={profile.aadharNumber} isEditing={isEditing} onChange={handleChange} />
                  <FileField label="Aadhar Document * (PDF/Image)" value={profile.aadharDoc} isEditing={isEditing} onFileChange={(e) => handleFileChange(e, 'aadharDoc')} />
                </div>

                {/* PAN Group */}
                <div className="space-y-4">
                  <EditableField label="PAN Number *" icon={<FileText size={18}/>} name="panNumber" value={profile.panNumber} isEditing={isEditing} onChange={handleChange} />
                  <FileField label="PAN Document * (PDF/Image)" value={profile.panDoc} isEditing={isEditing} onFileChange={(e) => handleFileChange(e, 'panDoc')} />
                </div>

                {/* GST Group */}
                <div className="space-y-4">
                  <EditableField label="GST Number *" icon={<ShieldCheck size={18}/>} name="gstNumber" value={profile.gstNumber} isEditing={isEditing} onChange={handleChange} />
                  <FileField label="GST Document * (PDF/Image)" value={profile.gstDoc} isEditing={isEditing} onFileChange={(e) => handleFileChange(e, 'gstDoc')} />
                </div>
              </div>

              {/* --- IMPORTANT COMPLIANCE NOTE --- */}
              <div className="mt-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl shadow-sm">
                <div className="flex items-start gap-3">
                  <Flag className="text-rose-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight mb-1">Important Compliance Notice</h4>
                    <p className="text-[13px] text-rose-800 leading-relaxed font-medium">
                      If you do not have a GST number, you can fill your profile using your Aadhar Card and PAN Card. However, if you possess a GST number, it <strong>must</strong> be provided. 
                      <span className="block mt-2 font-bold underline text-rose-900">Warning: If it is found later that you withheld these legal documents while they were available, your provider profile will be DEACTIVATED immediately without prior notice.</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Review System Section */}
          <div className="mt-12 mb-20">
            <ReviewSystem targetId={profile.email} targetType="provider" />
          </div>
        </div>
      </main>
    </div>
  );
}

function EditableField({ label, icon, name, value, isEditing, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 border shrink-0">{icon}</div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
        {isEditing && !readOnly ? (
          <input name={name} value={value || ""} onChange={onChange} className="w-full bg-slate-50 border-b-2 border-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 py-1" />
        ) : (
          <p className="text-sm font-bold truncate text-slate-700">{value || "Not Set"}</p>
        )}
      </div>
    </div>
  );
}

function FileField({ label, value, isEditing, onFileChange }) {
  return (
    <div className="bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
      <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{label}</p>
      {isEditing ? (
        <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
          <Upload size={16} className="text-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase">Upload File</span>
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileChange} />
        </label>
      ) : value ? (
        <a href={value} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-100 group">
          <span className="text-xs font-bold text-emerald-700">Document Uploaded</span>
          <ExternalLink size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
        </a>
      ) : (
        <div className="text-xs font-bold text-slate-400 italic">No document uploaded</div>
      )}
    </div>
  );
}