"use client";

import React from "react";
import { Mail, MapPin, Github, ExternalLink } from "lucide-react";

export default function StudioProTemplate({ data, isDraft }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f0f12] text-slate-200 font-sans">
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-center py-1 text-xs font-bold">
          Draft preview
        </div>
      )}

      <aside className="md:w-[38%] md:min-h-screen bg-gradient-to-br from-violet-600 to-fuchsia-700 p-10 md:p-14 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 space-y-6">
          <div className="w-28 h-28 rounded-3xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center text-5xl font-black">
            {data.brandInitial}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{data.brandName}</h1>
          <p className="text-xl text-white/90 font-medium">{data.role}</p>
          <p className="text-white/70 leading-relaxed text-sm">{data.about}</p>
          <div className="space-y-3 pt-4 text-sm font-semibold">
            {data.location && (
              <span className="flex items-center gap-2">
                <MapPin size={18} /> {data.location}
              </span>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                <Mail size={18} /> Email me
              </a>
            )}
            {data.github && (
              <a href={data.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                <Github size={18} /> GitHub
              </a>
            )}
            {data.portfolio && (
              <a href={data.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                <ExternalLink size={18} /> Portfolio
              </a>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 space-y-16 overflow-y-auto">
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-4xl font-black tracking-tighter mb-8">Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-6 py-3 rounded-full border border-violet-500/30 bg-violet-500/10 font-bold hover:bg-violet-500 hover:text-white transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.experiences.length > 0 && (
          <section>
            <h2 className="text-4xl font-black tracking-tighter mb-8">Work</h2>
            <div className="grid gap-6">
              {data.experiences.map((exp, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/50 transition-colors">
                  <h3 className="text-xl font-black">{exp.position || exp.jobDepartment}</h3>
                  <p className="text-violet-400 font-bold mt-1">{exp.currentCompanyName}</p>
                  <p className="text-slate-400 mt-4 leading-relaxed">{exp.jobDescription}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.educations.length > 0 && (
          <section>
            <h2 className="text-4xl font-black tracking-tighter mb-8">Education</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.educations.map((edu, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="font-bold">{edu.specialization || edu.type}</h3>
                  <p className="text-violet-400 text-sm mt-1">{edu.institute || edu.university}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-4xl font-black tracking-tighter mb-6">Let&apos;s connect</h2>
          {data.email ? (
            <a
              href={`mailto:${data.email}`}
              className="inline-flex px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 font-black text-white hover:scale-105 transition-transform"
            >
              Start a conversation
            </a>
          ) : (
            <p className="text-slate-500">Add your email in profile settings.</p>
          )}
        </section>

        <p className="pt-8 text-xs text-slate-500 uppercase tracking-[0.35em]">
          Powered by Career and Naukri
        </p>

      </main>
    </div>
  );
}
