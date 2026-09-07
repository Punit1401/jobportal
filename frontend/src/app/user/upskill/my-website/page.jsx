"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Globe,
  Link as LinkIcon,
  Layout,
  Eye,
  Save,
  Loader2,
  Copy,
  CheckCircle2,
  Paintbrush,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import Link from "next/link";
import { WEBSITE_TEMPLATES } from "@/lib/website/templatesCatalog";
import { getPublicSiteUrl } from "@/lib/website/getSiteUrl";
import { getMissingPortfolioProfileFields } from "@/lib/website/profileCompletion";
import FeatureGuard from "@/components/FeatureGuard";

function TemplatePreviewThumb({ id, accent }) {
  const base = "rounded-xl border-2 h-28 w-full overflow-hidden relative";
  if (id === "seo-pro") {
    return (
      <div className={base} style={{ borderColor: accent }}>
        <div className="h-3 bg-emerald-700" />
        <div className="p-2 grid grid-cols-2 gap-1">
          <div className="h-8 bg-emerald-50 rounded" />
          <div className="h-8 bg-teal-100 rounded" />
          <div className="col-span-2 h-4 bg-emerald-100 rounded mt-1" />
        </div>
      </div>
    );
  }
  if (id === "business-pro") {
    return (
      <div className={base} style={{ borderColor: accent }}>
        <div className="h-10 bg-blue-900" />
        <div className="p-2 space-y-1">
          <div className="h-3 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-50 rounded w-1/2" />
        </div>
      </div>
    );
  }
  if (id === "studio-pro") {
    return (
      <div className={`${base} flex`} style={{ borderColor: accent }}>
        <div className="w-1/3 bg-violet-600 h-full" />
        <div className="flex-1 p-2 space-y-1">
          <div className="h-2 bg-slate-200 rounded" />
          <div className="h-2 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    );
  }
  if (id === "architecture-pro") {
    return (
      <div className={base} style={{ borderColor: accent }}>
        <div className="h-8 bg-amber-800" />
        <div className="p-2 grid grid-cols-3 gap-1">
          <div className="h-12 bg-amber-50 rounded col-span-2" />
          <div className="h-12 bg-stone-100 rounded" />
          <div className="h-4 bg-amber-100 rounded col-span-3" />
        </div>
      </div>
    );
  }
  if (id === "interior-pro") {
    return (
      <div className={base} style={{ borderColor: accent }}>
        <div className="h-8 bg-pink-600" />
        <div className="p-2 grid grid-cols-2 gap-1">
          <div className="h-8 bg-pink-50 rounded" />
          <div className="h-8 bg-rose-100 rounded" />
          <div className="h-8 bg-amber-50 rounded col-span-2" />
        </div>
      </div>
    );
  }
  if (id === "developer-pro") {
    return (
      <div className={base} style={{ borderColor: accent }}>
        <div className="h-3 bg-blue-700" />
        <div className="p-2 space-y-1">
          <div className="h-3 bg-blue-100 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="h-8 bg-blue-50 rounded" />
        </div>
      </div>
    );
  }
  if (id === "it-engineer-pro") {
    return (
      <div className={base} style={{ borderColor: accent }}>
        <div className="h-10 bg-teal-800" />
        <div className="p-2 grid grid-cols-2 gap-1">
          <div className="h-6 bg-teal-50 rounded" />
          <div className="h-6 bg-cyan-100 rounded" />
          <div className="h-6 bg-slate-100 rounded col-span-2" />
        </div>
      </div>
    );
  }
  return (
    <div className={`${base} bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 capitalize`}>
      {id}
    </div>
  );
}

export default function MyWebsiteBuilder() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [candidateData, setCandidateData] = useState(null);
  const [siteLinks, setSiteLinks] = useState({ urlPrefix: "", liveUrl: "" });
  const [config, setConfig] = useState({
    username: "",
    theme: "modern",
    template: "seo-pro",
    accentColor: "indigo",
    isPublished: false,
    visibleSections: {
      about: true,
      experience: true,
      education: true,
      skills: true,
      contact: true,
      projects: true,
    },
  });

  useEffect(() => {
    if (session) fetchPortfolio();
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { protocol, hostname, port } = window.location;
    const isLocalHost = hostname === "localhost" || hostname.endsWith(".localhost");
    const envRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    const resolvedHost = envRoot && !envRoot.includes("localhost") ? envRoot.split(":")[0] : hostname;
    
    const hostWithPort = isLocalHost ? `localhost${port ? `:${port}` : ""}` : resolvedHost;
    const prefix = `${protocol}//${hostWithPort}/p/`;
    const live = `${prefix}${config.username || "username"}`;

    setSiteLinks({ urlPrefix: prefix, liveUrl: live });
  }, [config.username]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/portfolio");
      const data = await res.json();
      if (data.success) {
        setCandidateData(data.candidate);
        setConfig({
          username: data.portfolio.username || "",
          theme: data.portfolio.theme || "modern",
          template: data.portfolio.template || "seo-pro",
          accentColor: data.portfolio.accentColor || "indigo",
          isPublished: data.portfolio.isPublished || false,
          visibleSections: data.portfolio.visibleSections || {
            about: true,
            experience: true,
            education: true,
            skills: true,
            contact: true,
            projects: true,
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publishOnly = false) => {
    if (!config.username) {
      alert("Please choose a subdomain username (e.g. johndoe).");
      return;
    }

    if (publishOnly && !profileComplete) {
      alert(`Please complete your profile before publishing. Missing: ${missingProfileFields.join(", ")}.`);
      return;
    }

    const payload = publishOnly ? { ...config, isPublished: true } : config;

    setSaving(true);
    try {
      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (publishOnly) setConfig((c) => ({ ...c, isPublished: true }));
        alert(publishOnly ? "Your website is now live!" : "Website settings saved.");
      } else {
        alert(data.error || "Could not save");
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const liveUrl = siteLinks.liveUrl || (config.username ? getPublicSiteUrl(config.username) : "");
  const previewUrl = config.username ? `/p/${config.username}` : "";

  const copyLink = () => {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section) => {
    setConfig((prev) => ({
      ...prev,
      visibleSections: {
        ...prev.visibleSections,
        [section]: !prev.visibleSections[section],
      },
    }));
  };

  const missingProfileFields = useMemo(() => getMissingPortfolioProfileFields(candidateData), [candidateData]);
  const profileComplete = missingProfileFields.length === 0;

  const colors = ["indigo", "emerald", "rose", "cyan", "amber", "purple"];
  const isLegacyTemplate = ["modern", "minimal", "creative"].includes(config.template);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar />

      <main className="flex-1 w-full p-4 sm:p-8 lg:p-10 mt-16 lg:mt-0 lg:ml-72 transition-all duration-300">
        <FeatureGuard featureName="My Website & Portfolio">
          <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Globe className="text-indigo-600" size={32} />
                My Website
              </h1>
              <p className="text-slate-500 font-medium mt-2 max-w-xl">
                Pick a template, pull details from your profile, save, then publish — your site goes live on your
                subdomain.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="bg-white border-2 border-slate-200 text-slate-800 px-6 py-4 rounded-2xl font-black transition-all flex items-center gap-2 hover:border-indigo-300"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Publish live
              </button>
            </div>
          </div>

          {!profileComplete && !loading && (
            <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm">Complete your profile first</p>
                <p className="text-xs mt-1 opacity-80">
                  Name, skills, experience & contact are pulled from your profile into the template.
                </p>
                <Link href="/user/profile" className="inline-block mt-2 text-xs font-black text-indigo-600 underline">
                  Go to Profile →
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          ) : (
            <>
              {/* Template gallery */}
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                  <Layout size={20} className="text-indigo-500" />
                  Choose template
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Reference-style business sites (SEO Pro is based on your sample). Data auto-fills from profile.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WEBSITE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setConfig({ ...config, template: tpl.id })}
                      className={`text-left p-4 rounded-2xl border-2 transition-all ${
                        config.template === tpl.id
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <TemplatePreviewThumb id={tpl.id} accent={tpl.accent} />
                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-black text-slate-900">{tpl.name}</span>
                        {tpl.isNew && (
                          <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                      <LinkIcon size={20} className="text-indigo-500" />
                      Subdomain & link
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">
                          Website username / slug
                        </label>
                        <div className="flex mt-2 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 ring-indigo-500/20">
                          <span className="bg-slate-100 px-4 flex items-center justify-center font-bold text-slate-400 text-xs border-r border-slate-200 select-none">
                            {siteLinks.urlPrefix || "https://popoal.com/p/"}
                          </span>
                          <input
                            type="text"
                            placeholder="johndoe"
                            value={config.username}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                              })
                            }
                            className="flex-1 px-4 py-4 bg-white outline-none font-black text-slate-800"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 ml-2 font-medium">
                          Live URL: <strong className="text-indigo-600">{siteLinks.liveUrl}</strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Published</p>
                          <p
                            className={`text-xs font-black uppercase tracking-widest mt-1 ${
                              config.isPublished ? "text-emerald-500" : "text-amber-500"
                            }`}
                          >
                            {config.isPublished ? "Live website" : "Draft only"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, isPublished: !config.isPublished })}
                          disabled={!profileComplete && !config.isPublished}
                          className={`p-2 rounded-xl transition-colors ${
                            !profileComplete && !config.isPublished
                              ? "text-slate-300 bg-slate-100 cursor-not-allowed"
                              : config.isPublished
                                ? "text-emerald-500 bg-emerald-50"
                                : "text-slate-400 bg-slate-200"
                          }`}
                        >
                          {config.isPublished ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                      </div>

                      {!profileComplete && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                          <p className="font-black text-sm">Profile completion required to publish</p>
                          <p className="text-xs mt-1 opacity-80">
                            Missing: {missingProfileFields.join(", ")}.
                          </p>
                          <p className="text-xs mt-2 text-amber-800">
                            You can still preview and save a draft, but publishing stays locked until your profile is complete.
                          </p>
                        </div>
                      )}

                      {config.username && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={copyLink}
                            className="flex-1 min-w-[120px] bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                          >
                            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            {copied ? "Copied!" : "Copy URL"}
                          </button>
                          <Link
                            href={previewUrl}
                            target="_blank"
                            className="flex-1 min-w-[120px] bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                          >
                            <Eye size={16} /> Preview
                          </Link>
                          {config.isPublished && liveUrl && (
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 min-w-[120px] bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                            >
                              <ExternalLink size={16} /> Open live
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isLegacyTemplate && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                        <Paintbrush size={20} className="text-indigo-500" />
                        Legacy template options
                      </h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                          {["modern", "dark"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setConfig({ ...config, theme: t === "dark" ? "dark" : "modern" })}
                              className={`p-4 rounded-2xl border-2 font-black text-sm ${
                                config.theme === t || (t === "modern" && config.theme === "modern")
                                  ? "border-indigo-600 bg-indigo-50"
                                  : "border-slate-100"
                              }`}
                            >
                              {t === "modern" ? "Light" : "Dark"}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setConfig({ ...config, accentColor: color })}
                              className={`w-10 h-10 rounded-full bg-${color}-500 border-4 ${
                                config.accentColor === color ? "ring-4 ring-slate-200 scale-110" : ""
                              }`}
                              style={{
                                backgroundColor:
                                  {
                                    indigo: "#6366f1",
                                    emerald: "#10b981",
                                    rose: "#f43f5e",
                                    cyan: "#06b6d4",
                                    amber: "#f59e0b",
                                    purple: "#a855f7",
                                  }[color] || "#6366f1",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                      <User size={20} className="text-indigo-500" />
                      Profile data (auto-filled)
                    </h3>
                    {candidateData ? (
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li>
                          <strong>Name:</strong> {candidateData.fullName || "—"}
                        </li>
                        <li>
                          <strong>Role:</strong> {candidateData.profession || candidateData.position || "—"}
                        </li>
                        <li>
                          <strong>Email:</strong> {candidateData.email || "—"}
                        </li>
                        <li>
                          <strong>Phone:</strong> {candidateData.mobile || "—"}
                        </li>
                        <li>
                          <strong>Location:</strong>{" "}
                          {[candidateData.city, candidateData.state].filter(Boolean).join(", ") || "—"}
                        </li>
                        <li>
                          <strong>Skills:</strong> {(candidateData.skills || []).slice(0, 5).join(", ") || "—"}
                        </li>
                        <li>
                          <strong>Experience entries:</strong> {candidateData.workExperiences?.length || 0}
                        </li>
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">No profile found.</p>
                    )}
                    <Link
                      href="/user/profile"
                      className="inline-block mt-4 text-xs font-black text-indigo-600 hover:underline"
                    >
                      Edit profile →
                    </Link>
                  </div>

                  {isLegacyTemplate && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <h3 className="font-black text-lg mb-6">Section visibility</h3>
                      <div className="space-y-3">
                        {Object.keys(config.visibleSections).map((section) => (
                          <div
                            key={section}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                          >
                            <span className="font-bold text-slate-700 capitalize">{section}</span>
                            <button
                              type="button"
                              onClick={() => toggleSection(section)}
                              className={config.visibleSections[section] ? "text-emerald-500" : "text-slate-300"}
                            >
                              {config.visibleSections[section] ? (
                                <ToggleRight size={28} />
                              ) : (
                                <ToggleLeft size={28} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        </FeatureGuard>
      </main>
    </div>
  );
}
