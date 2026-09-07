function normalizeSkills(skills) {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }
  return [];
}

export function getMissingPortfolioProfileFields(candidate) {
  const missing = [];

  if (!candidate) {
    return ["full name", "email", "phone", "location", "skills", "experience"];
  }

  const fullName = candidate.fullName || "";
  const email = candidate.email || "";
  const phone = candidate.mobile || candidate.phone || "";
  const location = [candidate.city, candidate.state].filter(Boolean).join(", ");
  const skills = normalizeSkills(candidate.skills);
  const experienceCount = Array.isArray(candidate.workExperiences) ? candidate.workExperiences.length : 0;

  if (!fullName.trim()) missing.push("full name");
  if (!email.trim()) missing.push("email");
  if (!phone.trim()) missing.push("phone");
  if (!location.trim()) missing.push("location");
  if (skills.length === 0) missing.push("skills");
  if (experienceCount === 0) missing.push("experience");

  return missing;
}

export function isPortfolioProfileComplete(candidate) {
  return getMissingPortfolioProfileFields(candidate).length === 0;
}
