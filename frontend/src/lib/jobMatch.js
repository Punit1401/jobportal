// Rule-based resume/preference ↔ job matching for Auto-Apply.
// Scores an aggregated job against the user's auto-apply preferences and
// profile (skills). Returns 0-100 + reasons + improvement tips.

function tokens(str = "") {
  return String(str).toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length > 1);
}

/**
 * @param {object} job   AggregatedJob
 * @param {object} prefs autoApplyPreferences { industries, locations, employmentTypes, keywords }
 * @param {object} profile { skills: string, title?: string }
 * @returns { score, reasons, tips }
 */
export function scoreJob(job, prefs = {}, profile = {}) {
  const reasons = [];
  const tips = [];
  let score = 0;

  // Industry preference (25)
  if (prefs.industries?.length) {
    if (prefs.industries.includes(job.industry)) {
      score += 25;
      reasons.push(`Industry match: ${job.industry}`);
    }
  } else {
    score += 10; // no preference set → mild neutral credit
  }

  // Location preference (20)
  if (prefs.locations?.length) {
    const loc = (job.location || "").toLowerCase();
    if (prefs.locations.some((l) => loc.includes(l.toLowerCase()))) {
      score += 20;
      reasons.push(`Location match: ${job.location}`);
    } else {
      tips.push("This job is outside your preferred locations.");
    }
  } else {
    score += 8;
  }

  // Employment type (15)
  if (prefs.employmentTypes?.length) {
    if (prefs.employmentTypes.includes(job.employmentType)) {
      score += 15;
      reasons.push(`${job.employmentType} role`);
    }
  } else {
    score += 6;
  }

  // Keyword / skill overlap with the job title + description (40)
  const jobWords = new Set([...tokens(job.title), ...tokens(job.description || job.summary || "")]);
  const userTerms = [
    ...(prefs.keywords || []),
    ...tokens(profile.skills || ""),
  ].map((s) => s.toLowerCase());

  const matchedTerms = [...new Set(userTerms)].filter((t) => jobWords.has(t) || jobWords.has(t.replace(/\s+/g, "")));
  if (userTerms.length) {
    const ratio = matchedTerms.length / Math.min(userTerms.length, 10);
    const pts = Math.round(Math.min(1, ratio) * 40);
    score += pts;
    if (matchedTerms.length) reasons.push(`Skills match: ${matchedTerms.slice(0, 5).join(", ")}`);
    if (ratio < 0.3) tips.push("Add more of this role's keywords to your resume/skills to improve the match.");
  } else {
    tips.push("Add your skills/keywords in preferences to get an accurate match score.");
  }

  score = Math.min(100, Math.round(score));
  return { score, reasons, tips };
}

export function rankJobs(jobs, prefs = {}, profile = {}) {
  return jobs
    .map((j) => ({ job: j, ...scoreJob(j, prefs, profile) }))
    .sort((a, b) => b.score - a.score);
}
