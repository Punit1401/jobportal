"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, LayoutDashboard, Calendar, Star, Wallet, Settings, User,
  Bell, Folder, Share2, Mail, Users, FileText, BarChart3, ShieldCheck,
  ShoppingBag, Sparkles, Megaphone, HelpCircle, Layout, MessageSquare, Video, MessageCircleQuestion
} from 'lucide-react';

export default function Sidebar({ activePage }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/serviceprovider/dashboard" },
    //{ id: "profile", icon: <User size={20} />, label: "My Profile", href: "/serviceprovider/profile" },
    { id: "serviceform", icon: <Layout size={20} />, label: "Service Setup", href: "/serviceprovider/serviceform" },
    { id: "responses", icon: <MessageSquare size={20} />, label: "Responses", href: "/serviceprovider/responses" },
    { id: "stats", icon: <ShieldCheck size={20} />, label: "My Status", href: "/serviceprovider/stats" },

    // --- New Premium Features ---
    { id: "events", icon: <Calendar size={20} />, label: "Events & Activities", href: "/serviceprovider/events" },
    { id: "ai", icon: <Sparkles size={20} />, label: "AI Features", href: "/serviceprovider/ai-features" },
    { id: "mailer", icon: <Mail size={20} />, label: "Auto-Mailer System", href: "/serviceprovider/mailer" },
    { id: "mailinglist", icon: <FileText size={20} />, label: "Mailing List", href: "/serviceprovider/mailing-list" },
    { id: "customers", icon: <Users size={20} />, label: "Contact Management", href: "/serviceprovider/customers" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications", href: "/serviceprovider/notifications" },
    { id: "files", icon: <Folder size={20} />, label: "Files & Folder", href: "/serviceprovider/files" },
    //{ id: "wallet", icon: <Wallet size={20} />, label: "Digital Wallet", href: "/serviceprovider/wallet" },
    { id: "advertising", icon: <Megaphone size={20} />, label: "Advertising", href: "/serviceprovider/advertising" },
    { id: "analytics", icon: <BarChart3 size={20} />, label: "Analytics & Reports", href: "/serviceprovider/analytics" },
    //{ id: "servicerequest", icon: <HelpCircle size={20} />, label: "Service Request", href: "/serviceprovider/service-request" },
    { id: "qa", icon: <MessageCircleQuestion size={20} />, label: "User Questions", href: "/serviceprovider/qa" },
    { id: "subscriptions", icon: <Star size={20} />, label: "My Subscriptions", href: "/serviceprovider/subscriptions" },
    { id: "retail", icon: <ShoppingBag size={20} />, label: "Retail Purchase", href: "/serviceprovider/retail" },
    { id: "articles", icon: <FileText size={20} />, label: "Blogs / Articles", href: "/serviceprovider/articles" },
    { id: "libraries", icon: <Video size={20} />, label: "Knowledge Library", href: "/libraries" },
    { id: "feedback", icon: <MessageSquare size={20} />, label: "Feedback", href: "/serviceprovider/feedback" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings", href: "/serviceprovider/settings" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-40 flex items-center justify-between px-4 bg-white border-b border-slate-200 h-12 shadow-sm">
        <span className="text-sm font-bold text-slate-600">Dashboard Menu</span>
        <button onClick={toggleSidebar} className="p-1.5 bg-slate-50 rounded-lg text-slate-600 active:scale-95 transition-all">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className="h-12 lg:hidden" />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out
        lg:sticky lg:translate-x-0 h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* Desktop Logo */}
        <div className="hidden lg:flex items-center px-8 h-24 border-b border-slate-50 mb-4">
          <Link href="/serviceprovider/dashboard" className="text-2xl font-black text-indigo-600 tracking-tighter">
            Expert<span className="text-slate-900">Portal</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
          {menuItems.map((item) => {
            const isActive = activePage === item.id || pathname === item.href;
            return (
              <Link key={item.id} href={item.href} onClick={() => setIsOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[13.5px] transition-all cursor-pointer mb-1 group
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}
                `}>
                  <span className={`transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-[28px] border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">Partner Pro</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Provider</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}