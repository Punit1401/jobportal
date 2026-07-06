
// "use client";
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import NavBar from '@/components/Navbar';
// import { 
//   Eye, EyeOff, User, Phone, MapPin, Briefcase, Mail, 
//   KeyRound, ArrowRight, GraduationCap, 
//   FileText, Hash, Upload, CheckCircle, ShieldCheck, Stars
// } from 'lucide-react';

// export default function SPRegister() {
//   const [formData, setFormData] = useState({
//     fullName: '', username: '', email: '', password: '', confirmPassword: '',
//     mobile: '', providerName: '', serviceCategory: 'Interview Prep', location: '', 
//     otp: '', gstNumber: '', aadharNumber: '', panNumber: ''
//   });

//   const [files, setFiles] = useState({
//     aadharFile: null,
//     panFile: null,
//     gstFile: null
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   // ✅ પાસવર્ડ એરર માટે નવું સ્ટેટ
//   const [passwordError, setPasswordError] = useState('');
//   const router = useRouter();

//   const validatePassword = (pass) => {
//     if (!pass) return "";
    
//     const errors = [];
//     if (pass.length < 8) errors.push("8 characters");
//     if (!/[A-Z]/.test(pass)) errors.push("one uppercase letter");
//     if (!/[0-9]/.test(pass)) errors.push("one number");
//     if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push("one special character");
  
//     if (errors.length > 0) {
//       return "❌ Missing: " + errors.join(", ");
//     }
    
//     return ""; // કોઈ એરર નથી
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     // ✅ પાસવર્ડ ટાઈપ કરતી વખતે વેલિડેશન ચેક
//     if (name === 'password') {
//       const err = validatePassword(value);
//       setPasswordError(err);
//     }
//   };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     if (files[0]) {
//       setFiles(prev => ({ ...prev, [name]: files[0] }));
//     }
//   };

//   const sendOTP = async () => {
//     if (!formData.email) return setError("Please enter email first");
//     setLoading(true); setError(''); setSuccess('');
//     try {
//       const res = await fetch('/api/serviceprovider/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'send-otp', email: formData.email }),
//       });
//       const data = await res.json();
//       if (data.error) throw new Error(data.error);
//       setOtpSent(true);
//       setSuccess("OTP sent successfully to your email!");
//     } catch (err) { setError(err.message); }
//     finally { setLoading(false); }
//   };

//   const handleVerifyOTP = async () => {
//     if (!formData.otp) return setError("Please enter OTP code");
//     setVerifying(true); setError(''); setSuccess('');
//     try {
//       const res = await fetch('/api/serviceprovider/register', {
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
    
//     // ✅ સબમિટ વખતે પાસવર્ડ વેલિડેશન ચેક
//     const pErr = validatePassword(formData.password);
//     if (pErr) return setError(pErr);

//     if (formData.password !== formData.confirmPassword) return setError("Passwords do not match!");
//     if (!files.aadharFile || !files.panFile) return setError("Aadhar and PAN card files are required!");

//     setLoading(true); setError('');
//     try {
//       const dataToSend = new FormData();
//       dataToSend.append('action', 'register');
//       Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
//       if (files.aadharFile) dataToSend.append('aadharFile', files.aadharFile);
//       if (files.panFile) dataToSend.append('panFile', files.panFile);
//       if (files.gstFile) dataToSend.append('gstFile', files.gstFile);

//       const res = await fetch('/api/serviceprovider/register', {
//         method: 'POST',
//         body: dataToSend,
//       });

//       const data = await res.json();
//       if (data.error) throw new Error(data.error);

//       setSuccess("Registration successful! Admin will verify your documents soon.");
//       setTimeout(() => router.push('/login'), 3000);
//     } catch (err) { setError(err.message); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
//       <NavBar />
      
//       <div className="flex-1 flex flex-col lg:flex-row h-full">
//         {/* Left Side: Expert Branding */}
//         <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 overflow-hidden shrink-0">
//           <img 
//             src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop" 
//             alt="Service Provider" 
//             className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
//           />
//           <div className="relative z-10 flex flex-col justify-end p-12 w-full h-full">
//             <div className="bg-indigo-600/20 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] mb-8">
//               <Stars className="text-indigo-400 mb-4" size={32} />
//               <h2 className="text-4xl font-black text-white leading-tight italic">
//                 Empower <span className="text-indigo-400">Careers.</span> <br />Build Your Network.
//               </h2>
//               <p className="text-slate-300 mt-4 font-medium text-sm leading-relaxed">
//                 Join India's most trusted network of career experts and help candidates land their dream jobs.
//               </p>
//             </div>
            
//             <div className="flex items-center gap-4 text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
//               <ShieldCheck size={16} className="text-emerald-400" />
//               Verified Expert Program
//             </div>
//           </div>
//         </div>

//         {/* Right Side: Form Content */}
//         <div className="w-full lg:w-2/3 overflow-y-auto px-6 py-12 md:px-16 lg:px-20">
//           <div className="max-w-3xl mx-auto">
//             <div className="mb-12">
//               <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Expert <span className="text-indigo-600">Onboarding</span></h1>
//               <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Service Provider Registration</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-12">
//               {error && <div className="bg-red-50 text-red-600 p-5 rounded-3xl text-sm font-black border border-red-100 text-center animate-shake">{error}</div>}
//               {success && <div className="bg-emerald-50 text-emerald-600 p-5 rounded-3xl text-sm font-black border border-emerald-100 text-center">{success}</div>}

//               {/* Step 01: Account Information */}
//               <div className="space-y-6">
//                 <div className="flex items-center gap-4">
//                   <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black">01</span>
//                   <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Personal Identity</h3>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 italic">
//                   <div className="relative group">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18}/>
//                     <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-transparent focus:border-indigo-500 font-bold text-sm transition-all" placeholder="Full Name"/>
//                   </div>
//                   <div className="relative group">
//                     <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
//                     <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-transparent focus:border-indigo-500 font-bold text-sm transition-all" placeholder="Username"/>
//                   </div>
//                   <div className="flex gap-2 md:col-span-2">
//                     <div className="relative flex-1 group">
//                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
//                       <input type="email" name="email" required disabled={isVerified} value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-transparent focus:border-indigo-500 font-bold text-sm transition-all disabled:opacity-50" placeholder="Email Address"/>
//                     </div>
//                     <button type="button" onClick={sendOTP} disabled={loading || isVerified} className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 disabled:bg-slate-300">
//                         {loading && !otpSent ? "..." : "OTP"}
//                     </button>
//                   </div>
//                   <div className="flex gap-2 md:col-span-2">
//                     <div className="relative flex-1 group">
//                       <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
//                       <input type="text" name="otp" required disabled={isVerified} value={formData.otp} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all font-bold text-sm ${isVerified ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} placeholder="Verification Code"/>
//                     </div>
//                     <button type="button" onClick={handleVerifyOTP} disabled={verifying || isVerified || !otpSent} className={`px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white disabled:bg-slate-300'}`}>
//                       {verifying ? "..." : isVerified ? "Done" : "Verify"}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Step 02: Expertise & KYC */}
//               <div className="space-y-6">
//                 <div className="flex items-center gap-4">
//                   <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black">02</span>
//                   <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Service Expertise & KYC</h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 italic">
//                   <div className="relative group">
//                     <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
//                     <input type="text" name="providerName" required value={formData.providerName} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all" placeholder="Expert/Agency Name"/>
//                   </div>
//                   <div className="relative group">
//                     <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18}/>
//                     <select name="serviceCategory" value={formData.serviceCategory} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all appearance-none cursor-pointer">
//                       <option>Interview Prep</option>
//                       <option>Resume Writing</option>
//                       <option>Career Counseling</option>
//                       <option>Soft Skills Training</option>
//                     </select>
//                   </div>
//                   <div className="relative group">
//                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
//                     <input type="text" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all" placeholder="Mobile Number"/>
//                   </div>
//                   <div className="relative group">
//                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
//                     <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all" placeholder="Current Location"/>
//                   </div>
//                 </div>

//                 {/* File Upload Grids */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//                   <div className="group">
//                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Aadhar Card</label>
//                     <div className="relative h-32 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
//                       <input type="file" name="aadharFile" required onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
//                       {files.aadharFile ? <CheckCircle className="text-emerald-500" size={24}/> : <Upload className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={24}/>}
//                       <span className="text-[9px] font-black text-slate-500 mt-2">{files.aadharFile ? "ATTACHED" : "UPLOAD PDF"}</span>
//                     </div>
//                   </div>

//                   <div className="group">
//                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">PAN Card</label>
//                     <div className="relative h-32 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
//                       <input type="file" name="panFile" required onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
//                       {files.panFile ? <CheckCircle className="text-emerald-500" size={24}/> : <Upload className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={24}/>}
//                       <span className="text-[9px] font-black text-slate-500 mt-2">{files.panFile ? "ATTACHED" : "UPLOAD PDF"}</span>
//                     </div>
//                   </div>

//                   <div className="group">
//                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">GST (Opt)</label>
//                     <div className="relative h-32 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
//                       <input type="file" name="gstFile" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
//                       {files.gstFile ? <CheckCircle className="text-emerald-500" size={24}/> : <Upload className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={24}/>}
//                       <span className="text-[9px] font-black text-slate-500 mt-2">{files.gstFile ? "ATTACHED" : "UPLOAD PDF"}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 italic">
//                    <input type="text" name="aadharNumber" required value={formData.aadharNumber} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-indigo-50 outline-none focus:border-indigo-500 font-bold text-xs" placeholder="Aadhar No."/>
//                    <input type="text" name="panNumber" required value={formData.panNumber} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-indigo-50 outline-none focus:border-indigo-500 font-bold text-xs" placeholder="PAN No."/>
//                    <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-indigo-50 outline-none focus:border-indigo-500 font-bold text-xs" placeholder="GST No. (Optional)"/>
//                 </div>
//               </div>

//               {/* Step 03: Security */}
//               <div className="space-y-6">
//                 <div className="flex items-center gap-4">
//                   <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black">03</span>
//                   <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Access Security</h3>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 italic">
//                   <div className="relative group">
//                     <input 
//                       type={showPassword ? "text" : "password"} 
//                       name="password" 
//                       required 
//                       value={formData.password} 
//                       onChange={handleChange} 
//                       className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border outline-none font-bold text-sm transition-all ${passwordError ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} 
//                       placeholder="Create Password"
//                     />
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
//                     {/* ✅ પાસવર્ડ એરર મેસેજ */}
//                   {/* ✅ આ એરર મેસેજ વધારે પ્રોપર લાગશે */}
//                     {passwordError && (
//                       <div className="mt-2 ml-1 p-2 bg-red-50 rounded-lg border border-red-100">
//                         <p className="text-[11px] text-red-600 font-bold leading-tight uppercase tracking-tight">
//                           {passwordError}
//                         </p>
//                       </div>
//                     )}                  
//                     </div>
//                   <div className="relative">
//                     <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all" placeholder="Confirm Password"/>
//                   </div>
//                 </div>
//               </div>

//               <button 
//                 type="submit" 
//                 disabled={loading || !isVerified || !!passwordError} 
//                 className={`w-full py-6 rounded-[2.5rem] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${isVerified && !passwordError ? 'bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
//               >
//                 {loading ? "Processing..." : "Create Expert Profile"} <ArrowRight size={22}/>
//               </button>
//             </form>

//             <div className="mt-12 text-center">
//                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Secure Expert Verification System</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/Navbar';
import { 
  Eye, EyeOff, User, Phone, Mail, 
  KeyRound, ArrowRight, Hash, ShieldCheck, Stars
} from 'lucide-react';

export default function SPRegister() {
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
    mobile: '', otp: ''
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
    if (errors.length > 0) return "❌ Missing: " + errors.join(", ");
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') {
      const err = validatePassword(value);
      setPasswordError(err);
    }
  };

  const sendOTP = async () => {
    if (!formData.email) return setError("Please enter email first");
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/serviceprovider/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: formData.email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOtpSent(true);
      setSuccess("OTP sent successfully to your email!");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) return setError("Please enter OTP code");
    setVerifying(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/serviceprovider/register', {
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

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/serviceprovider/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'register',
          ...formData 
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      <NavBar />
      
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        {/* Left Side branding */}
        <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 overflow-hidden shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop" 
            alt="Service Provider" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
          />
          <div className="relative z-10 flex flex-col justify-end p-12 w-full h-full">
            <div className="bg-indigo-600/20 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] mb-8">
              <Stars className="text-indigo-400 mb-4" size={32} />
              <h2 className="text-4xl font-black text-white leading-tight italic">
                Empower <span className="text-indigo-400">Careers.</span>
              </h2>
              <p className="text-slate-300 mt-4 font-medium text-sm leading-relaxed">
                Join our network of experts and start your journey today.
              </p>
            </div>
            <div className="flex items-center gap-4 text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
              <ShieldCheck size={16} className="text-emerald-400" />
              Verified Expert Program
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-2/3 overflow-y-auto px-6 py-12 md:px-16 lg:px-20">
          <div className="max-w-xl mx-auto">
            <div className="mb-12">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Expert <span className="text-indigo-600">Join</span></h1>
              <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Quick Registration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && <div className="bg-red-50 text-red-600 p-5 rounded-3xl text-sm font-black border border-red-100 text-center">{error}</div>}
              {success && <div className="bg-emerald-50 text-emerald-600 p-5 rounded-3xl text-sm font-black border border-emerald-100 text-center">{success}</div>}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 italic">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-transparent focus:border-indigo-500 font-bold text-sm transition-all" placeholder="Full Name"/>
                  </div>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-transparent focus:border-indigo-500 font-bold text-sm transition-all" placeholder="Username"/>
                  </div>
                  <div className="relative group md:col-span-2">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm transition-all" placeholder="Mobile Number"/>
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <div className="relative flex-1 group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                      <input type="email" name="email" required disabled={isVerified} value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 border border-transparent focus:border-indigo-500 font-bold text-sm transition-all disabled:opacity-50" placeholder="Email Address"/>
                    </div>
                    <button type="button" onClick={sendOTP} disabled={loading || isVerified} className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all disabled:bg-slate-300">
                        {loading && !otpSent ? "..." : "OTP"}
                    </button>
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <div className="relative flex-1 group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                      <input type="text" name="otp" required disabled={isVerified} value={formData.otp} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all font-bold text-sm ${isVerified ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} placeholder="Verification Code"/>
                    </div>
                    <button type="button" onClick={handleVerifyOTP} disabled={verifying || isVerified || !otpSent} className={`px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white disabled:bg-slate-300'}`}>
                      {verifying ? "..." : isVerified ? "Done" : "Verify"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 italic">
                  <div className="relative group">
                    <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border outline-none font-bold text-sm transition-all ${passwordError ? 'border-red-400' : 'border-transparent focus:border-indigo-500'}`} placeholder="Password"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                    {passwordError && <p className="mt-2 text-[10px] text-red-600 font-bold uppercase">{passwordError}</p>}
                  </div>
                  <div className="relative">
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 outline-none font-bold text-sm transition-all" placeholder="Confirm Password"/>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !isVerified || !!passwordError} 
                className={`w-full py-6 rounded-[2.5rem] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${isVerified && !passwordError ? 'bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {loading ? "Processing..." : "Create Account"} <ArrowRight size={22}/>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}