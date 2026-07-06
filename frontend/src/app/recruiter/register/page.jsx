
// //src/app/recruiter/register/page.jsx
// "use client";
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Eye, EyeOff, Building2, User, Phone, MapPin, Briefcase, Mail, KeyRound, ArrowRight, CheckCircle2, FileText, UploadCloud, CreditCard } from 'lucide-react';

// export default function RecruiterRegister() {
//   const [formData, setFormData] = useState({
//     fullName: '', username: '', email: '', password: '', confirmPassword: '',
//     mobile: '', companyName: '', designation: '', location: '', otp: '',
//     gstNumber: '', aadharNumber: '', panNumber: '', registrationType: 'company'
//   });

//   const [gstDoc, setGstDoc] = useState(null);
//   const [licenseDoc, setLicenseDoc] = useState(null);
//   const [aadharDoc, setAadharDoc] = useState(null);
//   const [panDoc, setPanDoc] = useState(null);

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const router = useRouter();

//   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
//   const handleFileChange = (e, setFile) => {
//     const file = e.target.files[0];
//     if (file) setFile(file);
//   };

//   const sendOTP = async () => {
//     if (!formData.email) return setError("Please enter email first");
//     setLoading(true); setError(''); setSuccess('');
//     try {
//       const res = await fetch('/api/recruiter/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'send-otp', email: formData.email }),
//       });
//       const data = await res.json();
//       if (data.error) throw new Error(data.error);
//       setOtpSent(true);
//       setSuccess("OTP sent successfully!");
//     } catch (err) { setError(err.message); }
//     finally { setLoading(false); }
//   };

//   const handleVerifyOTP = async () => {
//     if (!formData.otp) return setError("Please enter OTP code");
//     setVerifying(true); setError(''); setSuccess('');
//     try {
//       const res = await fetch('/api/recruiter/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'verify-otp', email: formData.email, otp: formData.otp }),
//       });
//       const data = await res.json();
//       if (data.error) throw new Error(data.error);
//       setIsVerified(true);
//       setSuccess("Email verified successfully!");
//     } catch (err) { setError(err.message); }
//     finally { setVerifying(false); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isVerified) return setError("Please verify your email first!");

//     // વેલિડેશન ચેક
//     if (formData.registrationType === 'company') {
//       if (!gstDoc || !licenseDoc) return setError("Please upload GST and License documents!");
//     } else {
//       if (!aadharDoc || !panDoc) return setError("Please upload Aadhar and PAN documents!");
//     }

//     setLoading(true); setError(''); setSuccess('');

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match!");
//       setLoading(false); return;
//     }

//     try {
//       const finalData = new FormData();
//       Object.keys(formData).forEach(key => finalData.append(key, formData[key]));

//       if (formData.registrationType === 'company') {
//         finalData.append('gstDocument', gstDoc);
//         finalData.append('businessLicense', licenseDoc);
//       } else {
//         finalData.append('aadharDocument', aadharDoc);
//         finalData.append('panDocument', panDoc);
//       }

//       finalData.append('action', 'register');

//       const regRes = await fetch('/api/recruiter/register', {
//         method: 'POST',
//         body: finalData,
//       });

//       const rData = await regRes.json();
//       if (rData.error) throw new Error(rData.error);

//       setSuccess("Account created! Redirecting...");
//       setTimeout(() => router.push('/login'), 2000);
//     } catch (err) { setError(err.message); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
//       <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[32px] overflow-hidden border border-slate-100">
//         <div className="p-8 md:p-14">
//           <div className="mb-10 text-center md:text-left">
//             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruiter Signup</h1>
//             <p className="text-slate-500 font-medium">Join us to find the best talent</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">{error}</div>}
//             {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100 text-center">{success}</div>}

//             {/* 01. Account Details */}
//             <div className="space-y-4">
//               <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">01. Account Details</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="relative"><User className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Full Name"/></div>
//                 <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Username"/>
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <Mail className="absolute left-4 top-3.5 text-slate-400" size={18}/>
//                     <input type="email" name="email" required disabled={isVerified} value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Work Email"/>
//                   </div>
//                   <button type="button" onClick={sendOTP} disabled={loading || isVerified} className="px-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all disabled:bg-slate-300">
//                     {loading && !otpSent ? "..." : otpSent ? "Resend" : "Send OTP"}
//                   </button>
//                 </div>
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={18}/>
//                     <input type="text" name="otp" required disabled={isVerified} value={formData.otp} onChange={handleChange} className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 font-bold text-sm ${isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-2 border-indigo-50 focus:ring-indigo-500'}`} placeholder="Verification Code"/>
//                   </div>
//                   <button type="button" onClick={handleVerifyOTP} disabled={verifying || isVerified || !otpSent} className={`px-4 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${isVerified ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-black disabled:bg-slate-300'}`}>
//                     {verifying ? "..." : isVerified ? <><CheckCircle2 size={16}/> Verified</> : "Verify"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* 02. Verification Type Toggle */}
//             <div className="space-y-4">
//               <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">02. Company & Verification</h3>
//               <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl mb-6">
//                 <button type="button" onClick={() => setFormData({...formData, registrationType: 'company'})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.registrationType === 'company' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Company (GST)</button>
//                 <button type="button" onClick={() => setFormData({...formData, registrationType: 'individual'})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.registrationType === 'individual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Individual (Aadhar/PAN)</button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="relative"><Building2 className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Company Name"/></div>

//                 {formData.registrationType === 'company' ? (
//                   <div className="relative"><FileText className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="gstNumber" required value={formData.gstNumber} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="GST Number"/></div>
//                 ) : (
//                   <>
//                     <div className="relative"><CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="aadharNumber" required value={formData.aadharNumber} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Aadhar Number"/></div>
//                     <div className="relative"><FileText className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="panNumber" required value={formData.panNumber} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="PAN Number"/></div>
//                   </>
//                 )}

//                 <div className="relative"><Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="designation" required value={formData.designation} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Designation"/></div>
//                 <div className="relative"><Phone className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Mobile Number"/></div>
//                 <div className="relative md:col-span-2"><MapPin className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Company Location"/></div>
//               </div>

//               {/* Document Upload Section */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//                 {formData.registrationType === 'company' ? (
//                   <>
//                     <div className="space-y-2">
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Certificate</p>
//                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative">
//                         {gstDoc ? <div className="flex flex-col items-center"><CheckCircle2 className="text-emerald-500 mb-1"/><span className="text-xs font-bold text-slate-600">{gstDoc.name}</span></div> : <div className="flex flex-col items-center"><UploadCloud className="text-slate-300 mb-1"/><span className="text-xs font-bold text-slate-400">Upload GST Doc</span></div>}
//                         <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, setGstDoc)} />
//                       </label>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business License</p>
//                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative">
//                         {licenseDoc ? <div className="flex flex-col items-center"><CheckCircle2 className="text-emerald-500 mb-1"/><span className="text-xs font-bold text-slate-600">{licenseDoc.name}</span></div> : <div className="flex flex-col items-center"><UploadCloud className="text-slate-300 mb-1"/><span className="text-xs font-bold text-slate-400">Upload License</span></div>}
//                         <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, setLicenseDoc)} />
//                       </label>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="space-y-2">
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhar Card</p>
//                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative">
//                         {aadharDoc ? <div className="flex flex-col items-center"><CheckCircle2 className="text-emerald-500 mb-1"/><span className="text-xs font-bold text-slate-600">{aadharDoc.name}</span></div> : <div className="flex flex-col items-center"><UploadCloud className="text-slate-300 mb-1"/><span className="text-xs font-bold text-slate-400">Upload Aadhar</span></div>}
//                         <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, setAadharDoc)} />
//                       </label>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Card</p>
//                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative">
//                         {panDoc ? <div className="flex flex-col items-center"><CheckCircle2 className="text-emerald-500 mb-1"/><span className="text-xs font-bold text-slate-600">{panDoc.name}</span></div> : <div className="flex flex-col items-center"><UploadCloud className="text-slate-300 mb-1"/><span className="text-xs font-bold text-slate-400">Upload PAN Doc</span></div>}
//                         <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, setPanDoc)} />
//                       </label>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* 03. Security */}
//             <div className="space-y-4">
//               <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">03. Security</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="relative">
//                   <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Password"/>
//                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
//                 </div>
//                 <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Confirm Password"/>
//               </div>
//             </div>

//             <button type="submit" disabled={loading || !isVerified} className={`w-full py-5 rounded-[22px] font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isVerified ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
//               {loading ? "Registering..." : "Create Account"} <ArrowRight size={20}/>
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Building2, User, Mail, KeyRound, ArrowRight, ShieldCheck, Phone } from 'lucide-react';

export default function RecruiterRegister() {
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', mobile: '', password: '',
    confirmPassword: '', companyName: '', otp: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validatePassword = (pass) => {
    if (!pass) return "";
    const errors = [];
    if (pass.length < 8) errors.push("8 characters");
    if (!/[A-Z]/.test(pass)) errors.push("one uppercase letter");
    if (!/[0-9]/.test(pass)) errors.push("one number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push("one special character");
    return errors.length > 0 ? "❌ Missing: " + errors.join(", ") : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') setPasswordError(validatePassword(value));
  };

  const sendOTP = async () => {
    if (!formData.email) return setError("Please enter email first");
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/recruiter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: formData.email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOtpSent(true);
      setSuccess("OTP sent successfully!");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) return setError("Please enter OTP code");
    setVerifying(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/recruiter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email: formData.email, otp: formData.otp }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIsVerified(true);
      setSuccess("Email verified successfully!");
    } catch (err) { setError(err.message); }
    finally { setVerifying(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return setError("Please verify your email first!");
    const pErr = validatePassword(formData.password);
    if (pErr) return setError(pErr);
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match!");

    setLoading(true); setError(''); setSuccess('');

    try {
      const res = await fetch('/api/recruiter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action: 'register' }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess("Recruiter account created! Redirecting...");
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 overflow-hidden shrink-0">
        <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Recruiter" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">C</div>
            <span className="text-2xl font-bold tracking-tight italic">Career and <span className="text-indigo-400">Naukri</span></span>
          </div>
          <div className="max-w-xs">
            <h2 className="text-4xl font-black mb-6 leading-tight italic">Find Top Talent Faster.</h2>
            <div className="flex gap-4 items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <ShieldCheck className="text-indigo-400 shrink-0" size={32} />
              <p className="text-slate-200 text-xs font-medium italic">Verified Recruiter Access gives you priority listing.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col p-6 md:p-16 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Recruiter <span className="text-indigo-600 underline decoration-indigo-200">Signup</span></h1>
              <p className="text-slate-500 font-medium mt-2">Scale your team today.</p>
            </div>
            <button onClick={() => router.push('/login')} className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">Already Registered?</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-black border border-red-100 text-center">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-sm font-black border border-emerald-100 text-center">{success}</div>}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group md:col-span-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:border-indigo-500 border border-transparent font-bold text-sm transition-all" placeholder="Full Name" />
                </div>
                <div className="relative group md:col-span-1">
                  <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:border-indigo-500 border border-transparent font-bold text-sm transition-all" placeholder="Username" />
                </div>
                {/* NEW MOBILE FIELD */}
                <div className="relative group md:col-span-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:border-indigo-500 border border-transparent font-bold text-sm transition-all" placeholder="Mobile Number" />
                </div>

                <div className="flex gap-2 md:col-span-1">
                  <div className="relative flex-1 group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" name="email" required disabled={isVerified} value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold text-sm transition-all disabled:bg-slate-200" placeholder="Work Email" />
                  </div>
                  <button type="button" onClick={sendOTP} disabled={loading || isVerified} className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all disabled:bg-slate-300">
                    {loading && !otpSent ? "..." : otpSent ? "Resend" : "OTP"}
                  </button>
                </div>
                <div className="flex gap-2 md:col-span-1">
                  <div className="relative flex-1 group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" name="otp" required disabled={isVerified} value={formData.otp} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all font-bold text-sm ${isVerified ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border border-transparent focus:border-indigo-500'}`} placeholder="OTP Code" />
                  </div>
                  <button type="button" onClick={handleVerifyOTP} disabled={verifying || isVerified || !otpSent} className={`px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black disabled:bg-slate-300'}`}>
                    {verifying ? "..." : isVerified ? "Done" : "Verify"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black">02</span>
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Company Information</h3>
              </div>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:border-indigo-500 border border-transparent font-bold text-sm transition-all" placeholder="Legal Company Name" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black">03</span>
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Security Credentials</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 italic">
                <div className="relative group">
                  <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border outline-none font-bold text-sm transition-all ${passwordError ? 'border-red-400' : 'border-transparent focus:border-indigo-500'}`} placeholder="Set Password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  {passwordError && <p className="mt-2 text-[10px] text-red-600 font-bold uppercase tracking-tight">{passwordError}</p>}
                </div>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold text-sm transition-all" placeholder="Confirm Password" />
              </div>
            </div>

            <button type="submit" disabled={loading || !isVerified || !!passwordError} className={`w-full py-6 rounded-[2.5rem] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${isVerified && !passwordError ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {loading ? "Registering..." : "Complete Signup"} <ArrowRight size={22} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}