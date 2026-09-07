import React from "react";
import { mapProfileToSiteData } from "@/lib/website/mapProfileToSiteData";
import SeoProTemplate from "./SeoProTemplate";
import BusinessProTemplate from "./BusinessProTemplate";
import StudioProTemplate from "./StudioProTemplate";
import ArchitectureProTemplate from "./ArchitectureProTemplate";
import InteriorProTemplate from "./InteriorProTemplate";
import DeveloperProTemplate from "./DeveloperProTemplate";
import ITEngineerProTemplate from "./ITEngineerProTemplate";

const NEW_TEMPLATES = [
  "seo-pro",
  "business-pro",
  "studio-pro",
  "architecture-pro",
  "interior-pro",
  "developer-pro",
  "it-engineer-pro",
];

export function isNewWebsiteTemplate(templateId) {
  return NEW_TEMPLATES.includes(templateId);
}

export default function WebsiteTemplateRenderer({ candidate, portfolio, legacyRender }) {
  const template = portfolio?.template || "modern";
  const isDraft = !portfolio?.isPublished;

  if (!isNewWebsiteTemplate(template)) {
    return legacyRender ? legacyRender() : null;
  }

  const data = mapProfileToSiteData(candidate, portfolio?.siteOverrides || {});
  data.isDraft = isDraft;

  switch (template) {
    case "seo-pro":
      return <SeoProTemplate data={data} isDraft={isDraft} />;
    case "business-pro":
      return <BusinessProTemplate data={data} isDraft={isDraft} />;
    case "studio-pro":
      return <StudioProTemplate data={data} isDraft={isDraft} />;
    case "architecture-pro":
      return <ArchitectureProTemplate data={data} isDraft={isDraft} />;
    case "interior-pro":
      return <InteriorProTemplate data={data} isDraft={isDraft} />;
    case "developer-pro":
      return <DeveloperProTemplate data={data} isDraft={isDraft} />;
    case "it-engineer-pro":
      return <ITEngineerProTemplate data={data} isDraft={isDraft} />;
    default:
      return legacyRender ? legacyRender() : null;
  }
}
