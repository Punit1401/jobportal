// Registry of feed sources for the Govt Exam ingestion pipeline.
//
// Each entry is an adapter config. Today they're RSS feeds (free). To add a
// paid aggregator API later, add a new entry with kind:"api" and implement it
// in runImport.js — nothing else in the app needs to change.
//
// `topic` is only used to build Google News search RSS URLs.
const googleNews = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

export const FEED_SOURCES = [
  // --- Aggregator feed (broad coverage) ---
  {
    id: "freejobalert",
    label: "FreeJobAlert",
    kind: "rss",
    url: "https://www.freejobalert.com/feed/",
    enabled: true,
  },

  // --- Google News topic feeds (reliable, current, legal) ---
  {
    id: "gnews-notifications",
    label: "Latest Notifications (Google News)",
    kind: "rss",
    url: googleNews("government job recruitment notification India apply online"),
    enabled: true,
  },
  {
    id: "gnews-admit-card",
    label: "Admit Cards (Google News)",
    kind: "rss",
    url: googleNews("government exam admit card released India"),
    enabled: true,
  },
  {
    id: "gnews-result",
    label: "Results (Google News)",
    kind: "rss",
    url: googleNews("government exam result declared India"),
    enabled: true,
  },
  {
    id: "gnews-answer-key",
    label: "Answer Keys (Google News)",
    kind: "rss",
    url: googleNews("government exam answer key released India"),
    enabled: true,
  },

  // --- Example of a future paid API source (disabled until a key is added) ---
  // {
  //   id: "sarkari-api",
  //   label: "Sarkari Result API (RapidAPI)",
  //   kind: "api",
  //   enabled: false,
  // },
];
