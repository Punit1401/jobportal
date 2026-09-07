// Rule-based eligibility matching for government schemes.
// Scores each scheme against a user profile and returns a match score (0-100)
// plus human-readable reasons. Deterministic and free (no AI call needed);
// AI can layer an explanation on top later.

// Derive audience tags that apply to a user profile.
export function deriveUserAudiences(profile = {}) {
  const a = new Set(["All"]);
  const status = (profile.employmentStatus || "").toLowerCase();
  if (/unemploy|seeking|fresher|student/.test(status) || profile.isStudent) a.add("Unemployed");
  if (/employ|working|job/.test(status)) a.add("Employed");
  if (/self.?employ|freelanc|business/.test(status)) a.add("Self-Employed");
  if (profile.isStudent) a.add("Students");

  const gender = (profile.gender || "").toLowerCase();
  if (gender.startsWith("f") || gender === "female" || gender === "woman") a.add("Women");

  const cat = (profile.category || "").toUpperCase();
  if (/SC|ST|OBC/.test(cat)) a.add("SC/ST/OBC");
  if (/MINORITY/.test(cat)) a.add("Minorities");

  if (profile.isFarmer) a.add("Farmers");
  if (profile.isEntrepreneur) a.add("Entrepreneurs");
  if (profile.hasDisability) a.add("Persons with Disability");
  if (profile.lowIncome) a.add("BPL / Low Income");

  const age = Number(profile.age);
  if (age >= 60) a.add("Senior Citizens");

  return [...a];
}

/**
 * Score one scheme against a user profile.
 * @returns { score:0-100, reasons:string[], eligible:boolean }
 */
export function scoreScheme(scheme, profile = {}) {
  const reasons = [];
  let score = 0;
  let hardFail = false;

  const userAud = deriveUserAudiences(profile);
  const schemeAud = scheme.audience && scheme.audience.length ? scheme.audience : ["All"];

  // Audience overlap (strongest signal).
  const overlap = schemeAud.filter((x) => userAud.includes(x) && x !== "All");
  if (overlap.length) {
    score += 50;
    reasons.push(`Matches your profile: ${overlap.join(", ")}`);
  } else if (schemeAud.includes("All")) {
    score += 20;
    reasons.push("Open to all citizens");
  }

  // Age window.
  const age = Number(profile.age);
  if (age && (scheme.minAge || scheme.maxAge)) {
    const okMin = !scheme.minAge || age >= scheme.minAge;
    const okMax = !scheme.maxAge || age <= scheme.maxAge;
    if (okMin && okMax) {
      score += 20;
      reasons.push(`Your age (${age}) is within the eligible range`);
    } else {
      hardFail = true;
      reasons.push(`Age requirement not met (${scheme.minAge || 0}–${scheme.maxAge || "∞"})`);
    }
  }

  // State match.
  const userState = (profile.state || "").trim();
  if (userState && scheme.state && scheme.state !== "All India") {
    if (userState.toLowerCase() === scheme.state.toLowerCase()) {
      score += 15;
      reasons.push(`Available in your state (${scheme.state})`);
    } else {
      hardFail = true;
      reasons.push(`State-specific (${scheme.state})`);
    }
  } else if (scheme.state === "All India") {
    score += 10;
  }

  // Sector interest (optional soft boost).
  if (profile.interestSector && scheme.sector &&
      profile.interestSector.toLowerCase() === scheme.sector.toLowerCase()) {
    score += 10;
    reasons.push(`Relevant to ${scheme.sector}`);
  }

  score = Math.min(100, score);
  return { score, reasons, eligible: !hardFail && score >= 30 };
}

// Rank a list of schemes for a profile.
export function rankSchemes(schemes, profile = {}) {
  return schemes
    .map((s) => ({ scheme: s, ...scoreScheme(s, profile) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
