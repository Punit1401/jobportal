"use client";
import { useState } from "react";
import UserSidebar from "@/components/UserSidebar";
import FeedbackForm from "@/components/FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function UserFeedbackPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 transition-all duration-300 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden
        ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <div className="max-w-4xl mx-auto space-y-12">
          <header>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <MessageSquare size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Feedback</h1>
            </div>
            <p className="text-slate-500 font-medium italic ml-1">Your feedback helps us evolve and serve you better.</p>
          </header>
          
          <FeedbackForm />

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <h4 className="text-lg font-black text-slate-900 mb-4">Why your feedback matters?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              We are constantly working to improve our job matching algorithms and platform features. 
              By sharing your experience, you help us identify areas of improvement and bugs that might be affecting your career growth.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
