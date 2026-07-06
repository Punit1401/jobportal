"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Search, User,
  Clock, Menu, X, FileText, Sparkles, Mic2, Folder, Wallet, Globe, Layout, Users, DollarSign, ClipboardCheck, Bell,TrendingUp, Target, Lightbulb, LineChart, ShieldCheck, BrainCircuit
} from 'lucide-react';

export default function UserSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNavOpen(false);
  }, [pathname]);

   const sidebarMenuItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/user/dashboard" },
  { icon: <User size={20} />, label: "Profile", href: "/user/profile" },
  { icon: <Search size={20} />, label: "Find Jobs", href: "/careers" },
  { icon: <FileText size={20} />, label: "Saved Jobs", href: "/user/saved-jobs" },
  { icon: <Folder size={20} />, label: "Files & Folders", href: "/user/files" },
  { icon: <Wallet size={20} />, label: "Digital Wallet", href: "/user/wallet" },
  { icon: <Globe size={20} />, label: "My Website", href: "/user/upskill/my-website" },
  { icon: <FileText size={20} />, label: "Post", href: "/user/post" },
  { icon: <Clock size={20} />, label: "My Status", href: "/user/status" },
  { icon: <FileText size={20} />, label: "Resume Builder", href: "/user/resumebuilder" },
  { icon: <Layout size={20} />, label: "Portfolio Builder", href: "/user/upskill/portfolio-builder" },
  { icon: <Sparkles size={20} />, label: "AI Tools", href: "/user/upskill/ai-tools" },
  { icon: <Mic2 size={20} />, label: "Mock Interview", href: "/user/upskill/mock-interview" },
  { icon: <Lightbulb size={20} />, label: "Learning Path", href: "/user/upskill/learning-path" },
  { icon: <BrainCircuit size={20} />, label: "AI Career Tutor", href: "/user/upskill/ai-tutor" },
  { icon: <TrendingUp size={20} />, label: "Industry Trends", href: "/user/upskill/industry-trends" }, // Updated ✨
  { icon: <Target size={20} />, label: "Skill Gap Analysis", href: "/user/upskill/SkillGapAnalysis" }, // Updated ✨
  { icon: <FileText size={20} />, label: "Service Requests", href: "/user/service-requests" },
  { icon: <LineChart size={20} />, label: "Company Insights", href: "/user/upskill/CompanyInsights" }, // Updated ✨
  { icon: <ShieldCheck size={20} />, label: "Fake Job Checker", href: "/user/upskill/fake-job-check" }, // Updated ✨
  { icon: <User size={20} />, label: "Behavioral Coaching", href: "/user/upskill/behavioral-coaching" },
  { icon: <Users size={20} />, label: "Networking Suggestions", href: "/user/upskill/networking-suggestions" },
  { icon: <DollarSign size={20} />, label: "Salary Benchmarking", href: "/user/upskill/salary-benchmarking" },
  { icon: <ClipboardCheck size={20} />, label: "Assessments & Test", href: "/user/upskill/assessments" },
  { icon: <Bell size={20} />, label: "Notifications", href: "/user/notifications" }
];

  return (
    <>
      {/* --- ✅ MOBILE NAVBAR (Height: 16 / 4rem) --- */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-100 h-16 shadow-sm">
        <div className="flex justify-between items-center h-full px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-all"
          >
            <Menu size={22} />
          </button>
          <Link href="/" className="text-lg font-black text-indigo-600 tracking-tighter">
            JobConnect<span className="text-slate-900">Pro</span>
          </Link>
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="p-2 bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-all"
          >
            {isNavOpen ? <X size={22} /> : <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0) || "U"}</div>}
          </button>
        </div>
      </nav>

      {/* --- ✅ OVERLAY --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- ✅ SIDEBAR --- */}
      <aside className={`
        fixed left-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300
        /* Desktop: Starts below navbar (top-20), height is viewport minus navbar */
        lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-72 lg:z-40 lg:translate-x-0
        /* Mobile: Full height when open */
        ${isSidebarOpen ? "translate-x-0 w-72 top-0 h-screen z-[120] shadow-2xl" : "-translate-x-full top-0 h-screen"}
      `}>

        {/* Mobile Header (Close Button) */}
        <div className="lg:hidden flex justify-between items-center px-6 py-6 border-b border-slate-50 shrink-0">
          <span className="font-black text-indigo-600">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-600">
            <X size={22} />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link key={index} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[13px] transition-all cursor-pointer mb-1 group
                  ${isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}
                `}>
                  <span className={`shrink-0 ${!isActive && "group-hover:scale-110 transition-transform"}`}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Spacer for Mobile */}
      <div className="h-16 lg:hidden" />
    </>
  );
}