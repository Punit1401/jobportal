"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Search,
  User,
  PlusCircle,
  Landmark,
  Briefcase,
  Clock,
  Menu,
  X,
  FileText,
  Sparkles,
  Folder,
  Wallet,
  Globe,
  Layout,
  Users,
  Target,
  Lightbulb,
  ShieldCheck,
  Video,
  MessageSquare,
  Wrench,
  HelpCircle,
  ChevronDown,
  UserSquare,
  Star,
  GraduationCap,
  Bookmark,
  CalendarDays,
  Bell,
  AlertTriangle,
  Send,
  TrendingUp,
  ClipboardList
} from "lucide-react";

export default function UserSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { data: session } = useSession();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Group open states
  const [openGroups, setOpenGroups] = useState({
    Opportunities: true,
    BuildPresent: true,
    HomeStatus: true,
    Communities: true,
    AIAssistant: true,
    Grow: true,
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const topQuickLinks = [
    { label: "Post", href: "/user/post", icon: <PlusCircle size={16} /> },
    { label: "Bulk Job", href: "/careers/bulk-vacancies", icon: <Briefcase size={16} /> },
    { label: "Find Jobs", href: "/careers", icon: <Search size={16} /> },
    { label: "AI Job Feed", href: "/user/job-feed", icon: <Sparkles size={16} /> },
    { label: "AI Assistant", href: "/user/upskill/ai-tools", icon: <Sparkles size={16} /> },
    { label: "Grow", href: "/user/upskill/learning-path", icon: <TrendingUp size={16} /> },
  ];

  const sidebarGroups = [
    {
      groupTitle: null,
      items: [
        { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/user/dashboard" }
      ]
    },
    {
      groupKey: "Opportunities",
      groupTitle: "Opportunities",
      items: [
        {
          icon: <GraduationCap size={18} />,
          label: "Internships, Apprenticeship & Training",
          href: "/user/programs",
          isActive: (p) => p === "/user/programs" || p === "/user/apprenticeship-training"
        },
        {
          icon: <Landmark size={18} />,
          label: "Government Exams & Jobs",
          href: "/user/govt-exams"
        },
        {
          icon: <Landmark size={18} />,
          label: "Govt Schemes",
          href: "/user/govt-schemes?tab=Scheme"
        },
        {
          icon: <Target size={18} />,
          label: "Smart Recommendation",
          href: "/user/auto-apply"
        }
      ]
    },
    {
      groupKey: "BuildPresent",
      groupTitle: "Build & Present",
      items: [
        { icon: <Clock size={18} />, label: "My Status", href: "/user/status" },
        { icon: <FileText size={18} />, label: "Resume Builder", href: "/user/resumebuilder" },
        { icon: <Layout size={18} />, label: "Portfolio Builder", href: "/user/upskill/portfolio-builder" },
        { icon: <Globe size={18} />, label: "My Website", href: "/user/upskill/my-website" },
        { icon: <AlertTriangle size={18} />, label: "Notice Period", href: "/user/profile?tab=ProfessionalDetails" },
        { icon: <Bookmark size={18} />, label: "My Workspace", href: "/user/saved-jobs" }
      ]
    },
    {
      groupKey: "HomeStatus",
      groupTitle: "Home & Status Engage",
      items: [
        { icon: <CalendarDays size={18} />, label: "Calendar", href: "/user/calendar" },
        { icon: <Folder size={18} />, label: "Files & Folders", href: "/user/files" },
        { icon: <MessageSquare size={18} />, label: "Chat Inbox", href: "/user/chat" },
        { icon: <Clock size={18} />, label: "Events & Activities", href: "/user/events" }
      ]
    },
    {
      groupKey: "Communities",
      groupTitle: "Communities",
      items: [
        { icon: <Wrench size={18} />, label: "Services Providers", href: "/user/service" },
        { icon: <Video size={18} />, label: "Knowledge Library", href: "/libraries" },
        { icon: <HelpCircle size={18} />, label: "Ask Experts (Q&A)", href: "/user/qa" },
        { icon: <Bell size={18} />, label: "Notifications", href: "/user/notifications" }
      ]
    },
    {
      groupKey: "AIAssistant",
      groupTitle: "AI Assistant",
      items: [
        { icon: <Sparkles size={18} />, label: "AI Tools", href: "/user/upskill/ai-tools" },
        { icon: <UserSquare size={18} />, label: "AI Headshots", href: "/user/headshot" },
        { icon: <Lightbulb size={18} />, label: "Learning", href: "/user/upskill/learning-path" },
        { icon: <Users size={18} />, label: "Work Style Fit", href: "/user/upskill/work-style-fit" },
        { icon: <ShieldCheck size={18} />, label: "Interview Preparation", href: "/user/upskill/mock-interview" },
        { icon: <Star size={18} />, label: "Company Reviews & Ratings", href: "/user/upskill/company-reviews" }
      ]
    },
    {
      groupKey: "Grow",
      groupTitle: "Grow",
      items: [
        { icon: <Send size={18} />, label: "Feedback", href: "/user/feedback" },
        { icon: <User size={18} />, label: "Profile", href: "/user/profile" },
        { icon: <Wallet size={18} />, label: "Digital Wallet", href: "/user/wallet" },
        { icon: <ClipboardList size={18} />, label: "Service Request", href: "/user/service-requests" }
      ]
    }
  ];

  return (
    <>
      {/* --- TOP HORIZONTAL SUB-NAVBAR FOR ALL CANDIDATE PAGES --- */}
      <div className="fixed top-20 left-0 lg:left-72 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-14 px-4 sm:px-8 flex items-center justify-center shadow-xs">
        <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto custom-scrollbar py-1 max-w-7xl mx-auto w-full">
          {topQuickLinks.map((ql, idx) => {
            const active = pathname === ql.href;
            return (
              <Link key={idx} href={ql.href} className="shrink-0">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105"
                    : "bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200 hover:border-indigo-200 shadow-xs"
                    }`}
                >
                  <span className="shrink-0">{ql.icon}</span>
                  <span className="whitespace-nowrap">{ql.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Menu Toggle Button */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 h-10 flex items-center justify-between px-4 shadow-xs">
        <span className="text-xs font-bold text-slate-600">Candidate Menu</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 bg-slate-100 rounded-md text-slate-600 active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`
        fixed left-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300
        lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-72 lg:z-40 lg:translate-x-0
        ${isSidebarOpen
            ? "translate-x-0 w-72 top-0 h-screen z-[120] shadow-2xl"
            : "-translate-x-full top-0 h-screen"
          }
      `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <span className="font-black text-indigo-600 text-base">Navigation</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 bg-slate-50 rounded-xl text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {sidebarGroups.map((group, gIdx) => {
            if (!group.groupTitle) {
              return (
                <div key={gIdx} className="space-y-1">
                  {group.items.map((item, iIdx) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={iIdx} href={item.href}>
                        <div
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-[13px] transition-all cursor-pointer ${isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                            : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            const isOpen = openGroups[group.groupKey];

            return (
              <div key={gIdx} className="space-y-1">
                <div
                  onClick={() => toggleGroup(group.groupKey)}
                  className="flex items-center justify-between px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 cursor-pointer hover:text-slate-700 select-none"
                >
                  <span>{group.groupTitle}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {isOpen && (
                  <div className="space-y-1 pl-1">
                    {group.items.map((item, iIdx) => {
                      const isActive = item.isActive
                        ? item.isActive(pathname)
                        : pathname === item.href.split("?")[0];

                      return (
                        <Link key={iIdx} href={item.href}>
                          <div
                            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-[12.5px] transition-all cursor-pointer ${isActive
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                          >
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="h-10 lg:hidden" />
    </>
  );
}
