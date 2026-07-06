"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Briefcase, Users, Settings, LogOut, Menu, X, CheckCircle2, Calendar, Sparkles, Mail, Layers, Bell, Folder, Wallet, Target, BarChart3, ShoppingBag, Star, FileText } from 'lucide-react';

export default function Sidebar({ activePage }) {
  const [isOpen, setIsOpen] = useState(false); // મોબાઈલ મેનુ માટે સ્ટેટ

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* --- મોબાઈલ માટે ટોપ બાર (જ્યારે સાઈડબાર બંધ હોય ત્યારે દેખાય) --- */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">S</div>
          
        </div>
        <button onClick={toggleSidebar} className="p-2 bg-slate-50 rounded-xl text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- ડાર્ક ઓવરલે (મોબાઈલમાં પાછળનો ભાગ ઝાંખો કરવા માટે) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* --- મેઈન સાઈડબાર --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 p-6 flex flex-col transition-transform duration-300 ease-in-out
        lg:sticky lg:translate-x-0 h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* ક્લોઝ બટન (માત્ર મોબાઈલ માટે) */}
        <button onClick={toggleSidebar} className="lg:hidden absolute right-4 top-6 text-slate-400">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-10 px-2">
          
          
        </div>

        {/* --- સ્ક્રોલેબલ નેવિગેશન --- */}
        <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-2">
          <Link href="/recruiter/dashboard" onClick={() => setIsOpen(false)}>
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activePage === "dashboard"} />
          </Link>
          <Link href="/recruiter/profile" onClick={() => setIsOpen(false)}>
            <NavItem icon="🏢" label="Profile" active={activePage === "profile"} />
          </Link>
          <Link href="/recruiter/postjob" onClick={() => setIsOpen(false)}>
            <NavItem icon={<PlusCircle size={20} />} label="Post a Job" active={activePage === "postjob"} />
          </Link>
          <Link href="/recruiter/livejobs" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Briefcase size={20} />} label="Job Placements" active={activePage === "livejobs"} />
          </Link>
          <Link href="/recruiter/candidate" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Users size={20} />} label="Responses" active={activePage === "candidate"} />
          </Link>
          <Link href="/recruiter/status" onClick={() => setIsOpen(false)}>
            <NavItem icon={<CheckCircle2 size={20} />} label="My Status" active={activePage === "status"} />
          </Link>
          <Link href="/recruiter/events" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Calendar size={20} />} label="Events & Activities" active={activePage === "events"} />
          </Link>
          <Link href="/recruiter/ai-features" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Sparkles size={20} />} label="AI Features" active={activePage === "ai"} />
          </Link>
          <Link href="/recruiter/mailer" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Mail size={20} />} label="Auto-Mailer System" active={activePage === "mailer"} />
          </Link>
          <Link href="/recruiter/mailer/templates" onClick={() => setIsOpen(false)}>
            <NavItem icon={<FileText size={20} />} label="Mail Templates" active={activePage === "templates"} />
          </Link>
          <Link href="/recruiter/mailing-list" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Layers size={20} />} label="Mailing List" active={activePage === "mailinglist"} />
          </Link>
          <Link href="/recruiter/contacts" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Users size={20} />} label="Contact Management" active={activePage === "contacts"} />
          </Link>
          <Link href="/recruiter/notifications" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Bell size={20} />} label="Notifications" active={activePage === "notifications"} />
          </Link>
          <Link href="/recruiter/files" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Folder size={20} />} label="Files & Folder" active={activePage === "files"} />
          </Link>
          <Link href="/recruiter/wallet" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Wallet size={20} />} label="Digital Wallet" active={activePage === "wallet"} />
          </Link>
          <Link href="/recruiter/advertising" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Target size={20} />} label="Advertising" active={activePage === "advertising"} />
          </Link>
          <Link href="/recruiter/analytics" onClick={() => setIsOpen(false)}>
            <NavItem icon={<BarChart3 size={20} />} label="Analytics & Reports" active={activePage === "analytics"} />
          </Link>
          <Link href="/recruiter/service-request" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Settings size={20} />} label="Service Request" active={activePage === "service"} />
          </Link>
          <Link href="/recruiter/subscriptions" onClick={() => setIsOpen(false)}>
            <NavItem icon={<Star size={20} />} label="My Subscriptions" active={activePage === "subscriptions"} />
          </Link>
          <Link href="/recruiter/retail" onClick={() => setIsOpen(false)}>
            <NavItem icon={<ShoppingBag size={20} />} label="Retail Purchase" active={activePage === "retail"} />
          </Link>
          
          {/* <NavItem icon="⚙️" label="Settings" /> */}
        </nav>

        {/* <div className="mt-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Need Help?</p>
          <button className="text-sm font-bold text-indigo-600 hover:underline">Contact Support</button>
        </div> */}
      </aside>
    </>
  );
}

// Sidebar Item Helper
function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </div>
  );
}