"use client";

import React from "react";
import ProfessionalPortfolioTemplate from "./ProfessionalPortfolioTemplate";

export default function ITEngineerProTemplate({ data, isDraft }) {
  return (
    <ProfessionalPortfolioTemplate
      data={data}
      isDraft={isDraft}
      theme={{
        badge: "IT Engineer Portfolio",
        navKicker: "Systems • Support • Reliability",
        heroPrefix: "Keeping systems",
        heroHighlight: "stable and secure",
        heroSubtitle:
          data.heroSubtitle ||
          "An IT engineer portfolio focused on infrastructure, support, reliability, and strong operational execution.",
        snapshotTitle: "Operational Strengths",
        aboutKicker: "Role",
        aboutTitle: "Engineering Profile",
        servicesKicker: "Services",
        servicesLabel: "IT Services",
        servicesTitle: "IT Services",
        workKicker: "Portfolio",
        workTitle: "Systems & Support",
        experienceKicker: "Experience",
        experienceTitle: "Operational Experience",
        educationKicker: "Credentials",
        educationTitle: "Education & Certifications",
        contactKicker: "Contact",
        contactTitle: "Need dependable support?",
        primaryCta: "Get support",
        secondaryCta: "View systems",
        bg: "#f5faf8",
        surface: "#ffffff",
        accent: "#0f766e",
        accentSoft: "#ccfbf1",
        accentInk: "#0f5f5b",
        text: "#16232a",
        muted: "#64748b",
        border: "#bce8df",
        navItems: [
          { id: "s-home", label: "Home" },
          { id: "s-about", label: "Profile" },
          { id: "s-services", label: "Services" },
          { id: "s-work", label: "Systems" },
          { id: "s-contact", label: "Contact" },
        ],
      }}
    />
  );
}
