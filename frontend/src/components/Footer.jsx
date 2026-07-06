// export default function Footer() {
//   return (
//     <footer className="bg-gray-900 text-gray-300 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Top Section */}

//         {/* Divider */}
//         <div className="border-t border-gray-700 mt-6"></div>

//         {/* Bottom Section */}
//         <div className="mt-4 text-center text-xs text-gray-500">
//           © {new Date().getFullYear()}{" "}
//           <span className="text-white font-medium">Shivengroup</span>. All
//           rights reserved.
//         </div>
//       </div>
//     </footer>
//   );
// }
"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Briefcase
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Browse Jobs", href: "/careers" },
      { name: "Companies", href: "#" },
      //{ name: "Salaries", href: "#" },
      { name: "Career Advice", href: "/pages/services" },
    ],
    support: [
      { name: "About Us", href: "/pages/aboutus" },
      { name: "Contact Us", href: "/pages/contactus" },
      { name: "FAQs", href: "/pages/faqs" },
      //{ name: "Privacy Policy", href: "#" },
    ],
    services: [
      { name: "For Companies ", href: "/register" },
      { name: "For Candidates", href: "/register" },
      //{ name: "Skill Tests", href: "#" },
      { name: "Philanthropy", href: "/pages/philanthropy" },
    ]
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tighter">
              Career and<span className="text-slate-900">Naukri</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Connecting talented professionals with world-class opportunities. Your journey to a dream career starts here.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={<Linkedin size={18} />} href="#" />
              <SocialIcon icon={<Twitter size={18} />} href="#" />
              <SocialIcon icon={<Instagram size={18} />} href="#" />
              <SocialIcon icon={<Facebook size={18} />} href="#" />
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* <div className="md:col-span-2 bg-indigo-50/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100/50">
              <div className="text-center md:text-left">
                <h4 className="text-xl font-black text-slate-900 mb-2">Subscribe to News</h4>
                <p className="text-sm text-slate-500 font-medium">Get the latest job alerts in your inbox.</p>
              </div>
              <div className="relative w-full md:w-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full md:w-64 bg-white border-none rounded-2xl py-4 px-6 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button className="absolute right-2 top-2 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div> */}

            {/* <div className="flex flex-col justify-center items-center md:items-start p-6">
                <div className="flex items-center gap-3 text-slate-700 font-bold mb-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Phone size={18} />
                    </div>
                    <span className="text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Mail size={18} />
                    </div>
                    <span className="text-sm">help@jobconnectpro.com</span>
                </div>
            </div> */}
          </div>
        </div>

        <hr className="border-slate-100 mb-16" />

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Platform</h5>
            <ul className="space-y-4">
              {footerLinks.platform.map(link => (
                <li key={link.name}><FooterLink href={link.href}>{link.name}</FooterLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Support</h5>
            <ul className="space-y-4">
              {footerLinks.support.map(link => (
                <li key={link.name}><FooterLink href={link.href}>{link.name}</FooterLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Services</h5>
            <ul className="space-y-4">
              {footerLinks.services.map(link => (
                <li key={link.name}><FooterLink href={link.href}>{link.name}</FooterLink></li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <Briefcase className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-125 transition-transform duration-700" size={120} />
              <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest">Hiring?</p>
              <h4 className="text-lg font-black leading-tight mb-4">Post a job and find top talent today.</h4>
              <Link href="../recruiter/register" className="inline-flex items-center gap-2 text-xs font-black bg-white text-slate-900 px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-50">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © {currentYear} CareerandNaukri. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-colors">Terms</Link>
            <Link href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
            <Link href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components
function SocialIcon({ icon, href }) {
  return (
    <a href={href} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:-translate-y-1 transition-all duration-300">
      {icon}
    </a>
  );
}

function FooterLink({ children, href }) {
  return (
    <Link href={href} className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors flex items-center group">
      <span className="w-0 group-hover:w-2 h-[2px] bg-indigo-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
      {children}
    </Link>
  );
}
