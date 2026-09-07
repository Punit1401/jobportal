import { NextResponse } from "next/server";

function buildFallbackAnalysis({
  personalityTraits = "",
  workPreferences = "",
  targetCompany = "",
  targetRole = "",
  jobDescription = "",
}) {
  const text = `${personalityTraits} ${workPreferences} ${targetCompany} ${targetRole} ${jobDescription}`.toLowerCase();

  const patterns = [
    { words: ["collaborative", "team", "feedback", "cross-functional"], label: "Works well in collaborative teams" },
    { words: ["independent", "ownership", "autonomy", "self-driven"], label: "Thrives with ownership and autonomy" },
    { words: ["fast", "paced", "startup", "agile", "ambitious"], label: "Fits fast-moving environments" },
    { words: ["structured", "process", "organized", "predictable"], label: "Prefers structure and clarity" },
    { words: ["creative", "experimental", "innovation", "open-minded"], label: "Brings creative, innovative thinking" },
  ];

  const strongMatches = patterns
    .filter((item) => item.words.some((word) => text.includes(word)))
    .map((item) => item.label);

  const potentialGaps = [];
  if (!text.includes("feedback")) potentialGaps.push("You may need to show how you respond to feedback.");
  if (!text.includes("team") && !text.includes("collaborative")) potentialGaps.push("The role may expect stronger collaboration examples.");
  if (!text.includes("structured") && !text.includes("process")) potentialGaps.push("You should clarify how you work in process-driven environments.");
  if (!text.includes("autonomy") && !text.includes("ownership")) potentialGaps.push("The interviewer may want evidence of independent ownership.");

  const fitScore = Math.min(
    95,
    Math.max(35, 45 + strongMatches.length * 10 + (targetCompany || targetRole || jobDescription ? 5 : 0))
  );

  return {
    fitScore,
    fitSummary: `Your work style appears moderately aligned with ${targetCompany || targetRole || "the target opportunity"}.`,
    strongMatches: strongMatches.length > 0
      ? strongMatches.slice(0, 5)
      : [
          "You have a flexible work style that can adapt to different environments",
          "You can position your strengths around reliability and learning speed",
        ],
    potentialGaps: potentialGaps.length > 0
      ? potentialGaps.slice(0, 4)
      : [
          "Share more concrete examples that prove your work style",
          "Clarify what kind of manager and team environment helps you succeed",
        ],
    idealEnvironments: [
      targetCompany ? `${targetCompany} if its culture values your preferred style` : "Teams with similar values and communication style",
      "Environments that match your pace, feedback, and ownership preferences",
      "Roles that reward the strengths you described",
    ],
    interviewTalkingPoints: [
      "Use one strong example that shows how your style helps the team succeed",
      "Explain which work environments bring out your best performance",
      "Connect your preferences to results and reliability",
    ],
    growthAdvice:
      "Prepare 1 to 2 stories that prove your preferred work style. If the company culture is different, show how you adapt while still delivering outcomes.",
  };
}

export async function POST(req) {
  try {
    const {
      personalityTraits,
      workPreferences,
      targetCompany,
      targetRole,
      jobDescription,
    } = await req.json();

    if (!personalityTraits && !workPreferences) {
      return NextResponse.json(
        { error: "Please provide your work style traits or preferences." },
        { status: 400 }
      );
    }

    if (!targetCompany && !targetRole && !jobDescription) {
      return NextResponse.json(
        { error: "Please provide a target company, role, or job description." },
        { status: 400 }
      );
    }

    const fallback = () =>
      NextResponse.json({
        success: true,
        analysis: buildFallbackAnalysis({
          personalityTraits,
          workPreferences,
          targetCompany,
          targetRole,
          jobDescription,
        }),
      });

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return fallback();
    }

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    let content = null;
    try {
      content = await fetchWithFallback([
        {
            role: "system",
            content: `You are an expert Work Style Fit Analyst for job seekers.
Analyze how a person's work style, personality traits, and preferences match a target company or role.
Return ONLY a valid JSON object matching this exact schema:
{
  "fitScore": number from 0 to 100,
  "fitSummary": "A concise summary of the overall fit",
  "strongMatches": ["3 to 5 matching strengths"],
  "potentialGaps": ["2 to 4 possible mismatches or risks"],
  "idealEnvironments": ["The best work environments for this person"],
  "interviewTalkingPoints": ["How to position yourself in interviews"],
  "growthAdvice": "Practical advice to improve fit or present yourself better"
}`
        },
        {
            role: "user",
            content: `Personality Traits:
${personalityTraits || "Not provided"}

Work Preferences:
${workPreferences || "Not provided"}

Target Company:
${targetCompany || "Not provided"}

Target Role:
${targetRole || "Not provided"}

Job Description:
${jobDescription || "Not provided"}`
        }
      ]);
    } catch (e) {
      console.warn("fetchWithFallback failed", e);
    }

    if (!content) {
      return fallback();
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      return fallback();
    }

    return NextResponse.json({ success: true, analysis: result });
  } catch (error) {
    console.error("Work Style Fit API Error:", error);
    return NextResponse.json({
      success: true,
      analysis: buildFallbackAnalysis({}),
    });
  }
}
