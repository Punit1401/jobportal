/**
 * Maps Candidate profile + optional overrides into template-ready site data.
 */
export function mapProfileToSiteData(candidate, overrides = {}) {
  if (!candidate) {
    return {
      brandName: "Your Brand",
      brandInitial: "Y",
      role: "Professional",
      tagline: "Build your online presence",
      heroTitle: "Welcome to my website",
      heroSubtitle: "Complete your profile to personalize this site.",
      email: "",
      phone: "",
      location: "",
      about: "",
      skills: [],
      experiences: [],
      educations: [],
      services: [],
      stats: [],
      products: [],
      blogs: [],
    };
  }

  const brandName = overrides.brandName || candidate.fullName || "Professional";
  const role = overrides.role || candidate.profession || candidate.position || "Professional";
  const location = [candidate.city, candidate.state].filter(Boolean).join(", ");
  const about =
    overrides.about ||
    candidate.jobDescription ||
    `Experienced ${role}${location ? ` based in ${location}` : ""}.`;

  const skills = (candidate.skills || []).filter(Boolean);
  const experiences = candidate.workExperiences || [];
  const educations = candidate.formalEducations || [];

  const services =
    overrides.services?.length > 0
      ? overrides.services
      : skills.slice(0, 6).map((skill) => ({
          title: skill,
          desc: `Professional ${skill} services tailored to your needs.`,
          features: ["Expert delivery", "Quality focused", "Client-first"],
        }));

  if (services.length === 0) {
    services.push(
      {
        title: role,
        desc: about.slice(0, 120) || "Professional services you can trust.",
        features: ["Reliable", "Experienced", "Results-driven"],
      },
      {
        title: "Consultation",
        desc: "One-on-one guidance for your career or business goals.",
        features: ["Personalized", "Flexible", "Actionable"],
      },
      {
        title: "Project Work",
        desc: "End-to-end delivery for short and long-term engagements.",
        features: ["On time", "Transparent", "Collaborative"],
      }
    );
  }

  const stats = [
    {
      num: String(Math.max(experiences.length, 1)) + "+",
      label: experiences.length ? "Roles" : "Focus",
    },
    { num: String(skills.length || 3), label: "Skills" },
    { num: String(educations.length || 1), label: educations.length ? "Education" : "Ready" },
  ];

  const products = skills.slice(0, 3).map((skill, i) => ({
    title: `${skill} Package`,
    price: overrides.productPrices?.[i] || `₹${(4999 + i * 3000).toLocaleString("en-IN")}`,
    badge: i === 0 ? "Popular" : "",
    emoji: ["🔍", "📈", "📝"][i % 3],
  }));

  if (products.length === 0) {
    products.push(
      { title: "Starter Package", price: "₹4,999", badge: "Popular", emoji: "⭐" },
      { title: "Professional Package", price: "₹9,999", badge: "", emoji: "🚀" },
      { title: "Premium Package", price: "₹14,999", badge: "", emoji: "💎" }
    );
  }

  const blogs = experiences.slice(0, 3).map((exp, i) => ({
    title: `${exp.position || exp.jobDepartment || "Experience"} at ${exp.currentCompanyName || "Company"}`,
    excerpt: (exp.jobDescription || "").slice(0, 100) + ((exp.jobDescription || "").length > 100 ? "..." : ""),
    category: exp.jobIndustry || "Career",
    emoji: ["📘", "⚡", "🎯"][i % 3],
  }));

  if (blogs.length === 0) {
    blogs.push({
      title: `About ${brandName.split(" ")[0]}`,
      excerpt: about.slice(0, 100) + (about.length > 100 ? "..." : ""),
      category: role,
      emoji: "✨",
    });
  }

  return {
    brandName,
    brandInitial: brandName.charAt(0).toUpperCase(),
    role,
    tagline: overrides.tagline || `${role}${location ? ` · ${location}` : ""}`,
    heroTitle: overrides.heroTitle || `Hi, I'm ${brandName.split(" ")[0]}`,
    heroSubtitle: overrides.heroSubtitle || about.slice(0, 160),
    email: candidate.email || "",
    phone: candidate.mobile || "",
    location,
    address: candidate.address || "",
    about,
    skills,
    experiences,
    educations,
    github: candidate.github || "",
    portfolio: candidate.portfolio || "",
    services,
    stats,
    products,
    blogs,
    isDraft: false,
  };
}
