// components/ResumeTemplate.jsx
import React, { useEffect } from "react";

const defaultConfig = {
  full_name: "Alex Thompson",
  email: "alex.thompson@email.com",
  phone: "📱 +1 (555) 987-6543",
  linkedin: "linkedin.com/in/alexthompson",
  github: "github.com/alexthompson",
  summary: "Results-driven Full Stack Developer with 6+ years of experience building scalable web applications. Expertise in modern JavaScript frameworks, cloud architecture, and agile methodologies. Passionate about creating elegant solutions to complex problems and mentoring junior developers.",
  exp1_title: "Senior Full Stack Developer",
  exp1_company: "TechCorp Solutions",
  exp1_start: "Jan 2021",
  exp1_end: "Present",
  exp1_description: "Led development of microservices architecture serving 100K+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored team of 5 developers and conducted code reviews to maintain high quality standards.",
  exp2_title: "Full Stack Developer",
  exp2_company: "Innovation Labs Inc.",
  exp2_start: "Jun 2018",
  exp2_end: "Dec 2020",
  exp2_description: "Developed and maintained React-based web applications with Node.js backends. Collaborated with UX designers to implement responsive interfaces. Optimized database queries improving application performance by 40%.",
  edu1_degree: "Bachelor of Science in Computer Science",
  edu1_university: "Massachusetts Institute of Technology",
  edu1_start: "2014",
  edu1_end: "2018",
  project1_name: "E-Commerce Platform",
  project1_description: "Built a full-stack e-commerce platform using React, Node.js, and PostgreSQL. Implemented secure payment processing, real-time inventory management, and admin dashboard. Platform handles 10K+ daily transactions.",
  project2_name: "Task Management Mobile App",
  project2_description: "Developed a cross-platform mobile application using React Native. Features include real-time collaboration, push notifications, and offline mode. Published on both iOS and Android app stores with 4.8★ rating.",
  skills: "JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, MongoDB, Git",
  certifications: "AWS Certified Solutions Architect, Google Cloud Professional Developer, Certified Scrum Master",
  languages: "English (Native), Spanish (Fluent), Mandarin (Conversational)",
  background_color: "#2563eb",
  paper_color: "#ffffff",
  heading_color: "#1f2937",
  accent_color: "#2563eb",
  text_color: "#4b5563",
  font_family: "Inter",
  font_size: 16
};

const renderBadges = (text, accentColor) => {
  if (!text) return null;
  return text.split(",").map((item, i) => (
    <span
      key={i}
      className="badge"
      style={{
        backgroundColor: `${accentColor}15`,
        color: accentColor,
        border: `1px solid ${accentColor}30`,
      }}
    >
      {item.trim()}
    </span>
  ));
};

export default function ResumeTemplate({ config = defaultConfig }) {
  useEffect(() => {
    document.body.style.fontFamily = `${config.font_family}, -apple-system, BlinkMacSystemFont, sans-serif`;
  }, [config.font_family]);

  const accentColor = config.accent_color || defaultConfig.accent_color;
  const headingColor = config.heading_color || defaultConfig.heading_color;
  const paperColor = config.paper_color || defaultConfig.paper_color;
  const backgroundColor = config.background_color || defaultConfig.background_color;
  const textColor = config.text_color || defaultConfig.text_color;

  return (
    <main className="h-full w-full overflow-auto">
      <div
        className="resume-wrapper min-h-full w-full flex items-center justify-center p-8"
        style={{ background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)` }}
      >
        <div
          className="resume-page w-full max-w-4xl rounded-lg p-12"
          style={{ backgroundColor: paperColor }}
        >
          {/* Header */}
          <header className="text-center mb-10 pb-8 border-b-2" style={{ borderColor: "#e5e7eb" }}>
            <h1
              id="fullName"
              className="text-5xl font-bold mb-3"
              style={{ color: accentColor }}
            >
              {config.full_name}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm mt-4" style={{ color: "#6b7280" }}>
              <a href={`mailto:${config.email}`} className="contact-link" target="_blank" rel="noopener noreferrer">
                📧 {config.email}
              </a>
              <span>{config.phone}</span>
              <a href={config.linkedin.startsWith("http") ? config.linkedin : `https://${config.linkedin}`} className="contact-link" target="_blank" rel="noopener noreferrer">
                💼 {config.linkedin}
              </a>
              <a href={config.github.startsWith("http") ? config.github : `https://${config.github}`} className="contact-link" target="_blank" rel="noopener noreferrer">
                🔗 {config.github}
              </a>
            </div>
          </header>

          {/* Summary */}
          <section className="mb-10">
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Professional Summary
            </h2>
            <p className="leading-relaxed text-base" style={{ color: textColor }}>
              {config.summary}
            </p>
          </section>

          {/* Experience */}
          <section className="mb-10">
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Work Experience
            </h2>
            {[1, 2].map((i) => (
              <div className="experience-item" key={i}>
                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: headingColor }}>
                      {config[`exp${i}_title`]}
                    </h3>
                    <p className="text-base font-medium" style={{ color: accentColor }}>
                      {config[`exp${i}_company`]}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-right" style={{ color: "#6b7280" }}>
                    {config[`exp${i}_start`]} - {config[`exp${i}_end`]}
                  </div>
                </div>
                <p className="leading-relaxed text-base" style={{ color: textColor }}>
                  {config[`exp${i}_description`]}
                </p>
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="mb-10">
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Education
            </h2>
            <div className="education-item">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: headingColor }}>
                    {config.edu1_degree}
                  </h3>
                  <p className="text-base font-medium" style={{ color: accentColor }}>
                    {config.edu1_university}
                  </p>
                </div>
                <div className="text-sm font-medium text-right" style={{ color: "#6b7280" }}>
                  {config.edu1_start} - {config.edu1_end}
                </div>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="mb-10">
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Projects
            </h2>
            {[1, 2].map((i) => (
              <div className="project-item" key={i}>
                <h3 className="text-xl font-semibold mb-2" style={{ color: headingColor }}>
                  {config[`project${i}_name`]}
                </h3>
                <p className="leading-relaxed text-base" style={{ color: textColor }}>
                  {config[`project${i}_description`]}
                </p>
              </div>
            ))}
          </section>

          {/* Skills */}
          <section className="mb-10">
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Skills
            </h2>
            <div className="flex flex-wrap">{renderBadges(config.skills, accentColor)}</div>
          </section>

          {/* Certifications */}
          <section className="mb-10">
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Certifications
            </h2>
            <div className="flex flex-wrap">{renderBadges(config.certifications, accentColor)}</div>
          </section>

          {/* Languages */}
          <section>
            <h2 className="section-heading text-2xl" style={{ borderColor: accentColor, color: headingColor }}>
              Languages
            </h2>
            <div className="flex flex-wrap">{renderBadges(config.languages, accentColor)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
