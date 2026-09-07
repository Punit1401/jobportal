"use client";

import RecruiterSidebar from "@/components/RecruiterSidebar";
import FeedbackForm from "@/components/FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function RecruiterFeedbackPage() {
  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <RecruiterSidebar activePage="feedback" />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-12">
          <header>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <MessageSquare size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruiter Feedback</h1>
            </div>
            <p className="text-slate-500 font-medium italic ml-1">Help us optimize the hiring experience for your organization.</p>
          </header>
          
          <FeedbackForm />

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <h4 className="text-lg font-black text-slate-900 mb-4">Hiring Success</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Whether it's about the quality of candidates or the ease of posting jobs, we value your professional input 
              to make Shiven Jobs the most efficient hiring platform.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
