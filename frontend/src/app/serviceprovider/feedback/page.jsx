"use client";

import ServiceProviderSidebar from "@/components/Serviceprovidersidbar";
import FeedbackForm from "@/components/FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function ServiceProviderFeedbackPage() {
  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <ServiceProviderSidebar activePage="feedback" />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-12">
          <header>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <MessageSquare size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expert Feedback</h1>
            </div>
            <p className="text-slate-500 font-medium italic ml-1">We value your expertise. Tell us how we can improve your visibility.</p>
          </header>
          
          <FeedbackForm />

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <h4 className="text-lg font-black text-slate-900 mb-4">Service Excellence</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              As a service provider, your feedback on lead quality and platform tools is crucial for our shared growth.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
