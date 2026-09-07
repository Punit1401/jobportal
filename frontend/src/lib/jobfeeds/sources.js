// Registry of job feed sources for the AI Job Aggregation engine.
// RSS today (free); add paid aggregator APIs later as kind:"api" entries
// without touching the rest of the pipeline.
const googleNews = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

export const JOB_FEED_SOURCES = [
  // --- Job portals (Google News keyword feeds) ---
  {
    id: "gnews-naukri",
    label: "Naukri.com",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("site:naukri.com jobs hiring India apply"),
    enabled: true,
  },
  {
    id: "gnews-internshala",
    label: "Internshala",
    sourceType: "Internship Portal",
    kind: "rss",
    url: googleNews("site:internshala.com internship hiring apply India"),
    enabled: true,
  },
  {
    id: "gnews-linkedin",
    label: "LinkedIn Jobs",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("site:linkedin.com/jobs hiring India apply"),
    enabled: true,
  },
  {
    id: "gnews-indeed",
    label: "Indeed India",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("site:indeed.com jobs hiring India apply"),
    enabled: true,
  },
  {
    id: "gnews-foundit",
    label: "Foundit (Monster)",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("site:foundit.in jobs hiring apply India"),
    enabled: true,
  },
  {
    id: "gnews-freshersworld",
    label: "FreshersWorld",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("site:freshersworld.com jobs fresher hiring India"),
    enabled: true,
  },

  // --- IT / Tech jobs ---
  {
    id: "gnews-it-jobs",
    label: "IT / Software Jobs",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("software engineer developer hiring India TCS Infosys Wipro HCL"),
    enabled: true,
  },

  // --- Govt / PSU ---
  {
    id: "gnews-govt-jobs",
    label: "Govt / PSU Jobs",
    sourceType: "Govt/PSU",
    kind: "rss",
    url: googleNews("PSU government company recruitment vacancy apply India"),
    enabled: true,
  },
  {
    id: "gnews-sarkari",
    label: "Sarkari Result",
    sourceType: "Govt/PSU",
    kind: "rss",
    url: googleNews("site:sarkariresult.com recruitment notification apply"),
    enabled: true,
  },

  // --- Internships ---
  {
    id: "gnews-internships",
    label: "Internships",
    sourceType: "Internship Portal",
    kind: "rss",
    url: googleNews("internship opening apply students India stipend"),
    enabled: true,
  },

  // --- Aggregator feeds ---
  {
    id: "gnews-jobs",
    label: "Latest Job Openings",
    sourceType: "Job Portal",
    kind: "rss",
    url: googleNews("hiring job opening apply India 2026"),
    enabled: true,
  },
];
