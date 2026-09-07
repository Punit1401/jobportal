"use client";

import React from "react";
import ProfessionalPortfolioTemplate from "./ProfessionalPortfolioTemplate";

export default function InteriorProTemplate({ data, isDraft }) {
  return (
    <ProfessionalPortfolioTemplate
      data={data}
      isDraft={isDraft}
      theme={{
        badge: "Interior Design Portfolio",
        navKicker: "Interior Styling & Mood",
        heroPrefix: "Creating interiors that feel",
        heroHighlight: "warm and refined",
        heroSubtitle:
          data.heroSubtitle ||
          "An interior design portfolio that blends mood, texture, color harmony, and practical spatial planning.",
        snapshotTitle: "Style Notes",
        aboutKicker: "Style",
        aboutTitle: "Design Approach",
        servicesKicker: "Services",
        servicesLabel: "Interior Services",
        servicesTitle: "Interior Services",
        workKicker: "Portfolio",
        workTitle: "Moodboards & Projects",
        experienceKicker: "Practice",
        experienceTitle: "Studio Experience",
        educationKicker: "Study",
        educationTitle: "Education & Training",
        contactKicker: "Connect",
        contactTitle: "Start a design conversation",
        primaryCta: "Schedule a call",
        secondaryCta: "Explore projects",
        bg: "#fbf7f2",
        surface: "#ffffff",
        accent: "#db2777",
        accentSoft: "#fce7f3",
        accentInk: "#be185d",
        text: "#27303f",
        muted: "#6b7280",
        border: "#f3d6e3",
        navItems: [
          { id: "s-home", label: "Home" },
          { id: "s-about", label: "Style" },
          { id: "s-services", label: "Services" },
          { id: "s-work", label: "Projects" },
          { id: "s-contact", label: "Contact" },
        ],
      }}
    />
  );
}
