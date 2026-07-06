import React from 'react';
import Link from 'next/link'; // ✅ Link ઇમ્પોર્ટ કર્યું
import { Heart, Users, HandHelping, School, Globe, Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';


const PhilanthropyPage = () => {
    const services = [
      { 
        title: "Health Care", 
        desc: "Medical camps, health awareness, and hospital support programs for underserved communities.", 
        icon: <Heart className="text-red-500" />, 
        color: "bg-red-50",
        href: "/pages/services/healthcare"
      },
      { 
        title: "Social Welfare", 
        desc: "Support for women, children, elderly, and disaster relief initiatives.", 
        icon: <HandHelping className="text-orange-500" />, 
        color: "bg-orange-50",
        href: "https://venshitafoundation.org/socialwelfare"
      },
      { 
        title: "Education", 
        desc: "Scholarships, school support, and literacy programs for children and youth.", 
        icon: <School className="text-emerald-500" />, 
        color: "bg-emerald-50",
        href: "https://venshitafoundation.org/education"
      },
      { 
        title: "Environment", 
        desc: "Tree plantation, cleanliness drives, and sustainable development projects.", 
        icon: <Globe className="text-cyan-500" />, 
        color: "bg-cyan-50",
        href: "https://venshitafoundation.org/environment"
      }
    ];

    const activities = [
      { 
        title: "Volunteer", 
        desc: "Join our team of dedicated volunteers and make a difference through impactful projects.", 
        icon: <Users />, 
        btnColor: "bg-blue-600",
        href: "https://venshitafoundation.org/registration"
      },
      { 
        title: "Donate", 
        desc: "Support our mission with your generous donation. Every contribution builds stronger communities.", 
        icon: <Heart />, 
        btnColor: "bg-indigo-600",
        href: "https://venshitafoundation.org/donate"
      },
      { 
        title: "Sponsor", 
        desc: "Become a sponsor and gain visibility while supporting impactful construction initiatives.", 
        icon: <ArrowRight />, 
        btnColor: "bg-cyan-600",
        href: "https://venshitafoundation.org/sponsorship"
      },
      { 
        title: "Upcoming Events", 
        desc: "Stay informed about our community gatherings, training sessions, and sustainable events.", 
        icon: <Calendar />, 
        btnColor: "bg-purple-600",
        href: "https://venshitafoundation.org/participation"
      }
    ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Philanthropy Hero"
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 italic tracking-tight">Philanthropy Services</h1>
          <p className="text-lg md:text-xl font-light tracking-wide">Giving with Purpose • Creating Lasting Impact • Building Your Legacy</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Section 1: Core Services */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Service Areas</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">We are committed to creating meaningful change through focused programs. Choose the cause that resonates with you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {services.map((item, index) => (
            <div key={index} className={`${item.color} p-8 rounded-[2rem] border border-slate-100 transition-transform hover:-translate-y-2 text-center`}>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{item.desc}</p>
              {/* ✅ External link check */}
              <Link 
                href={item.href} 
                target={item.href.startsWith('http') ? "_blank" : "_self"}
                className="inline-block px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg uppercase tracking-widest hover:bg-indigo-600 transition-colors"
              >
                Explore More
              </Link>
            </div>
          ))}
        </div>

        {/* Section 2: Join Us Cards */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md mb-4">Get Involved Today</div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 italic">Join Us In Creating Lasting Change</h2>
          <p className="text-slate-500">Whether through your time, resources, or support — every action counts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {activities.map((item, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center flex flex-col items-center">
              <div className="text-indigo-600 mb-4">{item.icon}</div>
              <h3 className="text-lg font-black uppercase mb-3 italic tracking-tight">{item.title}</h3>
              <p className="text-slate-500 text-xs mb-6 h-12">{item.desc}</p>
              <Link 
                href={item.href}
                target="_blank"
                className={`w-full py-3 ${item.btnColor} text-white text-center text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100`}
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>

        {/* Section 3: Gallery & Activities (Links Added Here) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6"><ArrowRight /></div>
             <h3 className="text-2xl font-bold mb-4 italic">Upcoming Activities</h3>
             <p className="text-indigo-100 text-sm mb-8">Discover our planned activities, training programs, and initiatives designed to empower communities.</p>
             <Link 
                href="https://venshitafoundation.org/upcoming" 
                target="_blank"
                className="px-10 py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest"
             >
                Explore Activities
             </Link>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6"><ImageIcon /></div>
             <h3 className="text-2xl font-bold mb-4 italic">Gallery</h3>
             <p className="text-slate-400 text-sm mb-8">Explore our collection of photos capturing meaningful moments from community events and success stories.</p>
             <Link 
                href="https://venshitafoundation.org/gallary" 
                target="_blank"
                className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
             >
                View Gallery
             </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default PhilanthropyPage;