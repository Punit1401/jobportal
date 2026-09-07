"use client";

import React from "react";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, ExternalLink } from "lucide-react";

export default function BusinessProTemplate({ data, isDraft }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {isDraft && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 text-xs font-bold uppercase tracking-widest">
          Draft preview
        </div>
      )}

      <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-black border border-white/20">
              {data.brandInitial}
            </div>
            <div className="flex-1">
              <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">{data.role}</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{data.brandName}</h1>
              <p className="mt-4 text-blue-100 max-w-xl leading-relaxed">{data.about}</p>
              <div className="flex flex-wrap gap-4 mt-6 text-sm">
                {data.email && (
                  <a href={`mailto:${data.email}`} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20">
                    <Mail size={16} /> Email
                  </a>
                )}
                {data.phone && (
                  <a href={`tel:${data.phone}`} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20">
                    <Phone size={16} /> Call
                  </a>
                )}
                {data.portfolio && (
                  <a href={data.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20">
                    <ExternalLink size={16} /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {data.location && (
          <p className="flex items-center gap-2 text-slate-500 font-medium -mt-8">
            <MapPin size={18} className="text-blue-600" /> {data.location}
          </p>
        )}

        <section>
          <h2 className="text-2xl font-black text-slate-900 mb-6">Services</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.services.map((svc, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg text-slate-900">{svc.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {data.experiences.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={24} /> Experience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-lg">{exp.position || exp.jobDepartment}</h3>
                  <p className="text-blue-600 font-semibold text-sm">{exp.currentCompanyName}</p>
                  <p className="text-slate-500 text-sm mt-3">{exp.jobDescription}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.educations.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={24} /> Education
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.educations.map((edu, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold">{edu.specialization || edu.type}</h3>
                  <p className="text-blue-600 text-sm">{edu.institute || edu.university}</p>
                  {edu.year && <p className="text-xs text-slate-400 mt-2">{edu.year}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.skills.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-bold border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-8 pb-2 text-center text-sm text-slate-400">
          Powered by Career and Naukri
        </footer>
      </main>

    </div>
  );
}
