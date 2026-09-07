import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Job from "@/models/Job";
import CandidateJob from "@/models/CandidateJob";
import ServiceForm from "@/models/serviceform";
import Post from "@/models/Post";
import { fetchWithFallback } from "@/lib/ai-fallback";

export const dynamic = "force-dynamic";

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeText(value, fallback = "N/A") {
  const text = (value || "").toString().trim();
  return text || fallback;
}

function pickJobDetails(job) {
  return {
    title: normalizeText(job.title, "Untitled Job"),
    company: normalizeText(
      job.companyDetails?.companyName ||
        job.companyName ||
        job.company ||
        job.providerName ||
        job.name,
      "Unknown Company"
    ),
    location: normalizeText(job.location, "Remote"),
    experience: normalizeText(job.experienceLevel, "N/A"),
    salary: normalizeText(job.salaryRange || job.projectBudget, "Not Specified"),
    jobType: normalizeText(job.jobType || job.type, "Full-time"),
  };
}

function formatSourceJobs(allJobs) {
  const latestJobs = [...allJobs]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return latestJobs.map(pickJobDetails);
}

async function generatePosterCopy(jobs) {
  const prompt = `
You are creating a social-media hiring poster caption for a recruitment admin panel.
Return ONLY valid JSON with this exact structure:
{
  "headline": "WE ARE HIRING!",
  "subheadline": "short punchy line",
  "intro": "one short intro sentence",
  "jobs": [
    {"title":"...","company":"...","location":"...","experience":"...","salary":"...","jobType":"..."}
  ],
  "cta": "Register now at popoal.com"
}

Rules:
- Use the provided job details only.
- Keep each job line short and poster-friendly.
- Do not add markdown.
- Keep the language clean, bold, and catchy.

Job details:
${JSON.stringify(jobs, null, 2)}
`;

  try {
    const raw = await fetchWithFallback(
      [
        { role: "system", content: "You are a professional social-media poster copywriter." },
        { role: "user", content: prompt },
      ],
      0.4
    );

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      headline: normalizeText(parsed.headline, "WE ARE HIRING!"),
      subheadline: normalizeText(parsed.subheadline, "Latest 5 Jobs"),
      intro: normalizeText(parsed.intro, "Check out the latest opportunities below."),
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs.slice(0, 5).map((job, index) => ({
        title: normalizeText(job.title, jobs[index]?.title || "Untitled Job"),
        company: normalizeText(job.company, jobs[index]?.company || "Unknown Company"),
        location: normalizeText(job.location, jobs[index]?.location || "Remote"),
        experience: normalizeText(job.experience, jobs[index]?.experience || "N/A"),
        salary: normalizeText(job.salary, jobs[index]?.salary || "Not Specified"),
        jobType: normalizeText(job.jobType, jobs[index]?.jobType || "Full-time"),
      })) : jobs,
      cta: normalizeText(parsed.cta, "Register now at popoal.com"),
    };
  } catch (error) {
    return {
      headline: "WE ARE HIRING!",
      subheadline: "Latest 5 Jobs",
      intro: "Check out the latest opportunities below.",
      jobs,
      cta: "Register now at popoal.com",
    };
  }
}

function buildPosterSvg(copy) {
  const jobsMarkup = copy.jobs
    .map((job, index) => {
      const y = 322 + index * 145;
      return `
        <g transform="translate(56, ${y})">
          <rect x="0" y="0" rx="12" ry="12" width="650" height="124" fill="rgba(8,16,33,0.95)" stroke="#f6b21a" stroke-width="2" />
          <rect x="0" y="0" rx="12" ry="12" width="52" height="124" fill="#f6b21a" />
          <text x="26" y="35" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="900" fill="#071022">0${index + 1}</text>
          <circle cx="104" cy="60" r="34" fill="#0b1430" stroke="#f6b21a" stroke-width="2" />
          <path d="M92 62h24M104 50v24" stroke="#f6b21a" stroke-width="3" stroke-linecap="round" />
          <text x="156" y="34" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="#ffffff">${escapeXml(job.title)}</text>
          <text x="156" y="57" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#f6b21a">${escapeXml(job.company)}</text>
          <text x="156" y="82" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#d9dee8">Location: ${escapeXml(job.location)}</text>
          <text x="156" y="101" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#d9dee8">Experience: ${escapeXml(job.experience)}</text>
          <text x="380" y="82" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#d9dee8">Salary: ${escapeXml(job.salary)}</text>
          <text x="380" y="101" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="#d9dee8">Apply: Register now at popoal.com</text>
          <text x="628" y="33" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="800" fill="#f6b21a" text-anchor="end">${escapeXml(job.jobType)}</text>
          <text x="628" y="57" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="end">Apply Now</text>
        </g>
      `;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1600" viewBox="0 0 1080 1600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071022"/>
      <stop offset="100%" stop-color="#0d1730"/>
    </linearGradient>
    <linearGradient id="yellow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f7b500"/>
      <stop offset="100%" stop-color="#ffcc4a"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="1080" height="1600" fill="url(#bg)" />
  <polygon points="742,0 1080,0 1080,610 905,788 660,788" fill="url(#yellow)" opacity="0.98" />
  <polygon points="0,0 392,0 336,182 0,230" fill="#111a33" opacity="0.95" />
  <circle cx="110" cy="170" r="52" fill="none" stroke="#f6b21a" stroke-width="10" opacity="0.18" />
  <circle cx="942" cy="124" r="64" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.08" />
  <g opacity="0.14">
    <rect x="860" y="68" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="884" y="68" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="908" y="68" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="932" y="68" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="956" y="68" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="860" y="92" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="884" y="92" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="908" y="92" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="932" y="92" width="8" height="8" fill="#ffffff" rx="2"/>
    <rect x="956" y="92" width="8" height="8" fill="#ffffff" rx="2"/>
  </g>

  <g filter="url(#shadow)">
    <rect x="106" y="86" width="396" height="82" rx="10" fill="#f6b21a" transform="skewX(-12)" />
    <text x="150" y="143" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900" fill="#071022" transform="skewX(-12)">LATEST JOBS</text>

    <rect x="92" y="178" width="652" height="108" rx="10" fill="#ffffff" transform="skewX(-12)" />
    <text x="128" y="256" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="900" fill="#071022" transform="skewX(-12)">IN POPOAL.COM</text>
  </g>

  <text x="88" y="380" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="#ffffff">${escapeXml(copy.subheadline)}</text>
  <text x="88" y="414" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="500" fill="#d9dee8">${escapeXml(copy.intro)}</text>

  ${jobsMarkup}

  <g filter="url(#shadow)">
    <rect x="748" y="160" width="250" height="220" rx="18" fill="#f6b21a" />
    <text x="873" y="210" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="900" fill="#071022">AI FEATURES</text>
    <text x="873" y="240" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#071022">ON POPOAL.COM</text>
    <text x="873" y="284" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#071022">Career Tools</text>
    <text x="873" y="312" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#071022">Resume Builder</text>
    <text x="873" y="336" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#071022">AI Tutor</text>
    <text x="873" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#071022">Mock Interview</text>
    <text x="873" y="384" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#071022">Headshot / ATS / Salary</text>
  </g>

  <g filter="url(#shadow)">
    <rect x="747" y="455" width="240" height="225" rx="16" fill="#101c38" stroke="#2c3a5e" stroke-width="2" />
    <rect x="767" y="474" width="200" height="134" rx="12" fill="#0c1730" stroke="#2c3a5e" stroke-width="2" />
    <text x="867" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" fill="#f6b21a">AI TOOLS</text>
    <text x="867" y="552" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#d9dee8">Resume Builder</text>
    <text x="867" y="574" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#d9dee8">AI Tutor</text>
    <text x="867" y="596" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#d9dee8">Mock Interview</text>
    <text x="867" y="618" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#d9dee8">Headshot Generator</text>
  </g>

  <g filter="url(#shadow)">
    <rect x="772" y="714" width="188" height="110" rx="18" fill="#f6b21a" />
    <text x="866" y="752" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="900" fill="#071022">CAREER INSIGHTS</text>
    <text x="866" y="778" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#071022">Salary, ATS, Trends</text>
  </g>

  <g filter="url(#shadow)">
    <rect x="772" y="850" width="188" height="110" rx="18" fill="#f6b21a" />
    <text x="866" y="892" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" fill="#071022">LEARN &amp; GROW</text>
    <text x="866" y="918" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#071022">AI learning paths</text>
  </g>

  <g filter="url(#shadow)">
    <rect x="772" y="986" width="188" height="110" rx="18" fill="#f6b21a" />
    <text x="866" y="1028" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" fill="#071022">SMART APPLY</text>
    <text x="866" y="1054" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#071022">Apply faster, smarter</text>
  </g>

  <g filter="url(#shadow)">
    <rect x="56" y="1370" width="968" height="116" rx="20" fill="#101b36" stroke="#f6b21a" stroke-width="3" />
    <text x="110" y="1420" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#ffffff">APPLY NOW -</text>
    <text x="110" y="1450" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="900" fill="#f6b21a">${escapeXml(copy.cta)}</text>
    <rect x="610" y="1388" width="384" height="78" rx="10" fill="#f6b21a" />
    <text x="802" y="1420" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" fill="#071022">APPLY NOW</text>
    <text x="802" y="1446" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="#071022">REGISTER NOW AT POPOAL.COM</text>
  </g>
</svg>`;
}

function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const recruiterJobs = await Job.find({}).populate("companyId").lean();
    const candidateJobs = await CandidateJob.find({}).lean();
    const serviceJobs = await ServiceForm.find({}).lean();

    const formattedRecruiterJobs = recruiterJobs.map((job) => ({
      ...job,
      postedByRole: "recruiter",
      companyDetails: {
        companyName: job.companyId?.name || job.companyName || job.company || "Unknown Company",
        email: job.companyId?.email || "N/A",
        mobile: job.companyId?.phone || "N/A",
      },
    }));

    const formattedCandidateJobs = candidateJobs.map((job) => ({
      ...job,
      postedByRole: "candidate",
    }));

    const formattedServiceJobs = serviceJobs.map((service) => ({
      ...service,
      title: service.title,
      postedByRole: "serviceprovider",
      salaryRange: service.price ? `Rs. ${service.price}` : "Not Specified",
      location: "Service",
      experienceLevel: service.category || "N/A",
      jobType: "Gig/Service",
      companyDetails: {
        companyName: service.providerName || "Service Provider",
        email: service.providerEmail || "N/A",
        mobile: service.providerMobile || "N/A",
      },
    }));

    const allJobs = [
      ...formattedRecruiterJobs,
      ...formattedCandidateJobs,
      ...formattedServiceJobs,
    ];

    const latestJobs = formatSourceJobs(allJobs);

    if (latestJobs.length === 0) {
      return NextResponse.json({ error: "No jobs found" }, { status: 404 });
    }

    const aiCopy = await generatePosterCopy(latestJobs);
    const posterSvg = buildPosterSvg(aiCopy);
    const mediaUrl = toDataUri(posterSvg);

    const caption = [
      aiCopy.headline,
      aiCopy.subheadline,
      "",
      ...latestJobs.map((job, index) => `${index + 1}. ${job.title} | ${job.company} | ${job.location} | ${job.experience} | ${job.salary}`),
      "",
      aiCopy.cta,
    ].join("\n");

    const createdPost = await Post.create({
      userId: session.user.id || session.user.email || "admin",
      userName: session.user.name || "Admin",
      userImage: session.user.image || "",
      content: caption,
      mediaUrl,
    });

    return NextResponse.json(
      {
        success: true,
        post: createdPost,
        content: caption,
        mediaUrl,
        jobs: latestJobs,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Featured post generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
