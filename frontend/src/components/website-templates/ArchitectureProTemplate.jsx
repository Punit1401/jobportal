"use client";

import React from "react";
import ProfessionalPortfolioTemplate from "./ProfessionalPortfolioTemplate";

export default function ArchitectureProTemplate({ data, isDraft }) {
  return (
    <ProfessionalPortfolioTemplate
      data={data}
      isDraft={isDraft}
      theme={{
        badge: "Architecture Portfolio",
        navKicker: "Architecture & Spatial Design",
        heroPrefix: "Designing spaces that feel",
        heroHighlight: "timeless",
        heroSubtitle:
          data.heroSubtitle ||
          "A curated architecture portfolio focused on form, balance, light, and enduring material choices.",
        snapshotTitle: "Design Focus",
        aboutKicker: "Concept",
        aboutTitle: "Design Philosophy",
        servicesKicker: "Services",
        servicesLabel: "Architecture Services",
        servicesTitle: "Architectural Services",
        workKicker: "Portfolio",
        workTitle: "Selected Spaces",
        experienceKicker: "Practice",
        experienceTitle: "Project Experience",
        educationKicker: "Study",
        educationTitle: "Education & Credentials",
        contactKicker: "Connect",
        contactTitle: "Let’s discuss your next project",
        primaryCta: "Book a consultation",
        secondaryCta: "View portfolio",
        bg: "#f7f4ef",
        surface: "#ffffff",
        accent: "#c2410c",
        accentSoft: "#ffedd5",
        accentInk: "#9a3412",
        text: "#1f2937",
        muted: "#6b7280",
        border: "#f1d7c7",
        navItems: [
          { id: "s-home", label: "Home" },
          { id: "s-about", label: "Concept" },
          { id: "s-services", label: "Services" },
          { id: "s-work", label: "Projects" },
          { id: "s-contact", label: "Contact" },
        ],
      }}
    />
  );
}
