"use client";

import React from "react";

function SectionHeading({ kicker, title, accent }) {
  return (
    <div className="mb-6">
      {kicker ? (
        <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-2" style={{ color: accent }}>
          {kicker}
        </p>
      ) : null}
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--prof-text)]">{title}</h2>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="px-4 py-2 rounded-full text-sm font-bold bg-[var(--prof-surface)] border border-[color:var(--prof-border)] text-[var(--prof-text)] shadow-sm">
      {children}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--prof-border)] bg-white/50 p-8 text-sm text-slate-500">
      {text}
    </div>
  );
}

export default function ProfessionalPortfolioTemplate({ data, isDraft, theme }) {
  const navItems = theme.navItems || [
    { id: "s-home", label: "Home" },
    { id: "s-about", label: "About" },
    { id: "s-services", label: theme.servicesLabel || "Services" },
    { id: "s-work", label: theme.workLabel || "Work" },
    { id: "s-contact", label: "Contact" },
  ];

  const services = (data.services || []).slice(0, 6);
  const workItems = (data.products || []).slice(0, 3);
  const experiences = (data.experiences || []).slice(0, 4);
  const educations = (data.educations || []).slice(0, 3);
  const skills = (data.skills || []).slice(0, 8);
  const stats = data.stats || [];

  return (
    <div
      className="prof-site min-h-screen text-sm font-sans"
      style={{
        "--prof-bg": theme.bg,
        "--prof-surface": theme.surface,
        "--prof-accent": theme.accent,
        "--prof-accent-soft": theme.accentSoft,
        "--prof-accent-ink": theme.accentInk,
        "--prof-text": theme.text,
        "--prof-muted": theme.muted,
        "--prof-border": theme.border,
        background: "var(--prof-bg)",
      }}
    >
      <style jsx global>{`
        .prof-site .prof-wrap {
          width: 100%;
          min-height: 100vh;
          color: var(--prof-text);
        }
        .prof-site .prof-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          background: color-mix(in srgb, var(--prof-surface) 86%, transparent);
          border-bottom: 1px solid var(--prof-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }
        .prof-site .prof-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 900;
          letter-spacing: -0.03em;
        }
        .prof-site .prof-logo {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(135deg, var(--prof-accent), var(--prof-accent-ink));
          box-shadow: 0 10px 30px color-mix(in srgb, var(--prof-accent) 25%, transparent);
        }
        .prof-site .prof-navlinks {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          justify-content: flex-end;
        }
        .prof-site .prof-navlink {
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 0.5rem 0.85rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--prof-muted);
          background: transparent;
          cursor: pointer;
        }
        .prof-site .prof-navlink:hover {
          background: var(--prof-accent-soft);
          color: var(--prof-accent-ink);
        }
        .prof-site .prof-hero {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 2rem;
          align-items: center;
          padding: 3rem 1.25rem 2rem;
        }
        @media (max-width: 900px) {
          .prof-site .prof-hero {
            grid-template-columns: 1fr;
          }
        }
        .prof-site .prof-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          border: 1px solid var(--prof-border);
          background: color-mix(in srgb, var(--prof-accent-soft) 65%, white);
          color: var(--prof-accent-ink);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 0.68rem;
          font-weight: 900;
        }
        .prof-site .prof-title {
          margin-top: 1rem;
          font-size: clamp(2.3rem, 4vw, 4.4rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
          font-weight: 950;
          max-width: 12ch;
        }
        .prof-site .prof-title span {
          color: var(--prof-accent-ink);
        }
        .prof-site .prof-subtitle {
          margin-top: 1rem;
          max-width: 46rem;
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--prof-muted);
        }
        .prof-site .prof-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .prof-site .prof-btn {
          border-radius: 999px;
          padding: 0.9rem 1.3rem;
          font-weight: 900;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .prof-site .prof-btn:hover {
          transform: translateY(-1px);
        }
        .prof-site .prof-btn-primary {
          background: linear-gradient(135deg, var(--prof-accent), var(--prof-accent-ink));
          color: white;
          box-shadow: 0 18px 30px color-mix(in srgb, var(--prof-accent) 24%, transparent);
        }
        .prof-site .prof-btn-secondary {
          border: 2px solid var(--prof-accent-ink);
          color: var(--prof-accent-ink);
          background: transparent;
        }
        .prof-site .prof-panel {
          background: var(--prof-surface);
          border: 1px solid var(--prof-border);
          border-radius: 2rem;
          padding: 1.35rem;
          box-shadow: 0 25px 50px rgba(15, 23, 42, 0.08);
        }
        .prof-site .prof-panel-soft {
          background: color-mix(in srgb, var(--prof-accent-soft) 22%, var(--prof-surface));
        }
        .prof-site .prof-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .prof-site .prof-stat {
          background: color-mix(in srgb, var(--prof-surface) 70%, white);
          border: 1px solid var(--prof-border);
          border-radius: 1.25rem;
          padding: 1rem;
        }
        .prof-site .prof-section {
          padding: 2rem 1.25rem;
        }
        .prof-site .prof-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .prof-site .prof-grid {
            grid-template-columns: 1fr;
          }
        }
        .prof-site .prof-card {
          background: var(--prof-surface);
          border: 1px solid var(--prof-border);
          border-radius: 1.5rem;
          padding: 1.2rem;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
        }
        .prof-site .prof-footer {
          margin-top: 1rem;
          padding: 1.75rem 1.25rem 2.5rem;
          text-align: center;
          color: var(--prof-muted);
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
      `}</style>

      {isDraft && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 text-xs font-bold uppercase tracking-widest">
          Draft - only you can see this until you publish
        </div>
      )}

      <div className="prof-wrap">
        <nav className="prof-nav">
          <div className="prof-brand">
            <div className="prof-logo">{data.brandInitial}</div>
            <div>
              <div className="text-base md:text-lg">{data.brandName}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: "var(--prof-accent-ink)" }}>
                {theme.navKicker}
              </div>
            </div>
          </div>
          <div className="prof-navlinks">
            {navItems.map((item) => (
              <button key={item.id} type="button" className="prof-navlink" onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <section className="prof-hero" id="s-home">
          <div>
            <div className="prof-badge">
              {theme.badge}
            </div>
            <h1 className="prof-title">
              {theme.heroPrefix} <span>{theme.heroHighlight}</span>
            </h1>
            <p className="prof-subtitle">{theme.heroSubtitle || data.heroSubtitle}</p>

            <div className="prof-actions">
              <a href="#s-contact" className="prof-btn prof-btn-primary">
                {theme.primaryCta || "Get in touch"}
              </a>
              <a href="#s-services" className="prof-btn prof-btn-secondary">
                {theme.secondaryCta || `View ${theme.servicesLabel || "services"}`}
              </a>
            </div>

            <div className="prof-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="prof-stat">
                  <div className="text-2xl font-black" style={{ color: "var(--prof-accent-ink)" }}>
                    {stat.num}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="prof-panel prof-panel-soft">
            <div className="text-[10px] uppercase tracking-[0.35em] font-black" style={{ color: "var(--prof-accent-ink)" }}>
              {theme.snapshotTitle}
            </div>
            <div className="mt-4 space-y-3">
              {skills.slice(0, 5).length ? (
                skills.slice(0, 5).map((skill) => (
                  <div key={skill} className="flex items-center justify-between gap-3 border-b border-[color:var(--prof-border)] pb-3">
                    <span className="font-medium">{skill}</span>
                    <span style={{ color: "var(--prof-accent-ink)" }}>★</span>
                  </div>
                ))
              ) : (
                <EmptyState text="Add some skills to personalize this template." />
              )}
            </div>
            {data.location ? (
              <div className="mt-5 text-center text-sm font-black" style={{ color: "var(--prof-accent-ink)" }}>
                📍 {data.location}
              </div>
            ) : null}
          </div>
        </section>

        <section className="prof-section" id="s-about">
          <SectionHeading kicker={theme.aboutKicker} title={theme.aboutTitle} accent={"var(--prof-accent-ink)"} />
          <div className="prof-panel">
            <p className="text-base md:text-lg leading-8 text-slate-600">{data.about}</p>
          </div>
        </section>

        <section className="prof-section" id="s-services">
          <SectionHeading kicker={theme.servicesKicker} title={theme.servicesTitle || theme.servicesLabel || "Services"} accent={"var(--prof-accent-ink)"} />
          {services.length ? (
            <div className="prof-grid">
              {services.map((svc) => (
                <div key={svc.title} className="prof-card">
                  <div className="text-2xl mb-3">✦</div>
                  <h3 className="text-lg font-black">{svc.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{svc.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(svc.features || []).slice(0, 3).map((feature) => (
                      <Pill key={feature}>{feature}</Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No services available yet." />
          )}
        </section>

        <section className="prof-section" id="s-work">
          <SectionHeading kicker={theme.workKicker} title={theme.workTitle || "Selected Work"} accent={"var(--prof-accent-ink)"} />
          {workItems.length ? (
            <div className="prof-grid">
              {workItems.map((item) => (
                <div key={item.title} className="prof-card">
                  <div className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: "var(--prof-accent-ink)" }}>
                    {item.badge || theme.workLabel || "Featured"}
                  </div>
                  <h3 className="mt-3 text-xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{item.price}</p>
                  <div className="mt-5 text-3xl">{item.emoji}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Add portfolio items or projects to display here." />
          )}
        </section>

        <section className="prof-section" id="s-experience">
          <SectionHeading kicker={theme.experienceKicker} title={theme.experienceTitle || "Experience"} accent={"var(--prof-accent-ink)"} />
          {experiences.length ? (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={`${exp.currentCompanyName}-${exp.position || exp.jobDepartment}`} className="prof-card">
                  <h3 className="text-lg font-black">{exp.position || exp.jobDepartment || "Role"}</h3>
                  <p className="mt-1 font-bold" style={{ color: "var(--prof-accent-ink)" }}>
                    {exp.currentCompanyName || "Company"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{exp.jobDescription}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Experience entries will appear here once added to the profile." />
          )}
        </section>

        <section className="prof-section" id="s-education">
          <SectionHeading kicker={theme.educationKicker} title={theme.educationTitle || "Education"} accent={"var(--prof-accent-ink)"} />
          {educations.length ? (
            <div className="prof-grid">
              {educations.map((edu) => (
                <div key={`${edu.institute || edu.university || edu.specialization}`} className="prof-card">
                  <h3 className="text-lg font-black">{edu.specialization || edu.type || "Education"}</h3>
                  <p className="mt-2 font-bold" style={{ color: "var(--prof-accent-ink)" }}>
                    {edu.institute || edu.university}
                  </p>
                  {edu.year ? <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400">{edu.year}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Education entries will appear here once added to the profile." />
          )}
        </section>

        <section className="prof-section" id="s-contact">
          <SectionHeading kicker={theme.contactKicker} title={theme.contactTitle || "Contact"} accent={"var(--prof-accent-ink)"} />
          <div className="prof-grid">
            <div className="prof-card">
              <h3 className="text-lg font-black">Email</h3>
              <p className="mt-2 text-slate-500">{data.email || "Add your email to enable contact."}</p>
            </div>
            <div className="prof-card">
              <h3 className="text-lg font-black">Phone</h3>
              <p className="mt-2 text-slate-500">{data.phone || "Add your phone number to enable calls."}</p>
            </div>
            <div className="prof-card">
              <h3 className="text-lg font-black">Location</h3>
              <p className="mt-2 text-slate-500">{data.location || "Location will show here."}</p>
            </div>
          </div>
        </section>

        <footer className="prof-footer">
          Powered by Career and Naukri
        </footer>

      </div>
    </div>
  );
}
