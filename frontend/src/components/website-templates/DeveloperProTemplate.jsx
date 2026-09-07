"use client";

import React from "react";
import ProfessionalPortfolioTemplate from "./ProfessionalPortfolioTemplate";

export default function DeveloperProTemplate({ data, isDraft }) {
  return (
    <ProfessionalPortfolioTemplate
      data={data}
      isDraft={isDraft}
      theme={{
        badge: "Developer Portfolio",
        navKicker: "Code • Product • Delivery",
        heroPrefix: "Building fast, usable",
        heroHighlight: "digital products",
        heroSubtitle:
          data.heroSubtitle ||
          "A developer portfolio highlighting clean architecture, shipped products, and practical problem-solving.",
        snapshotTitle: "Core Stack",
        aboutKicker: "Profile",
        aboutTitle: "About the Developer",
        servicesKicker: "Services",
        servicesLabel: "Development Services",
        servicesTitle: "Development Services",
        workKicker: "Portfolio",
        workTitle: "Shipped Products",
        experienceKicker: "Experience",
        experienceTitle: "Work History",
        educationKicker: "Education",
        educationTitle: "Learning Path",
        contactKicker: "Contact",
        contactTitle: "Let’s build something together",
        primaryCta: "Contact me",
        secondaryCta: "See work",
        bg: "#f4f7fb",
        surface: "#ffffff",
        accent: "#2563eb",
        accentSoft: "#dbeafe",
        accentInk: "#1d4ed8",
        text: "#172033",
        muted: "#64748b",
        border: "#dbeafe",
        navItems: [
          { id: "s-home", label: "Home" },
          { id: "s-about", label: "About" },
          { id: "s-services", label: "Services" },
          { id: "s-work", label: "Projects" },
          { id: "s-contact", label: "Contact" },
        ],
      }}
    />
  );
}
