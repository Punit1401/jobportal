"use client";

import RecruiterSidebar from "@/components/RecruiterSidebar";
import ArticleSubmissionForm from "@/components/ArticleSubmissionForm";

export default function RecruiterNewArticle() {
  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <RecruiterSidebar activePage="articles" />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <ArticleSubmissionForm />
        </div>
      </main>
    </div>
  );
}
