// Lightweight, deterministic classification of a raw feed item into the
// Exam model's `category` and `source` enums — no AI call needed (fast + free
// for bulk ingest). The admin AI extractor is used for deep single-item enrich.

// Order matters: more specific categories first.
const CATEGORY_RULES = [
  [/answer\s*key/i, "Answer Key"],
  [/admit\s*card|hall\s*ticket|call\s*letter/i, "Admit Card"],
  [/\bresult\b|merit\s*list|scorecard|score\s*card|cut\s*off/i, "Result"],
  [/counsel+ing/i, "Counselling"],
  [/document\s*verification|\bDV\b/i, "Document Verification"],
  [/interview\s*(schedule|date|call)/i, "Interview Schedule"],
  [/correction\s*window|edit\s*application/i, "Correction Window"],
  [/last\s*date|deadline|extended|apply\s*by/i, "Application Deadline"],
  [/upcoming|exam\s*date|datesheet|time\s*table/i, "Upcoming Exam"],
];

const SOURCE_RULES = [
  [/\bUPSC\b|union public service/i, "UPSC"],
  [/\bSSC\b|staff selection/i, "SSC"],
  [/\bIBPS\b/i, "IBPS"],
  [/\bSBI\b|state bank/i, "SBI"],
  [/\bRBI\b|reserve bank/i, "RBI"],
  [/railway|\bRRB\b|\bNTPC\b|metro rail/i, "Railway"],
  [/\bPSC\b|public service commission|\bPCS\b/i, "State PSC"],
  [/army|navy|air\s*force|defence|\bDRDO\b|\bSSB\b|agniveer|\bCRPF\b|\bBSF\b|\bCISF\b/i, "Defence"],
  [/teacher|teaching|\bTET\b|\bTGT\b|\bPGT\b|professor|education board|\bKVS\b|\bNVS\b/i, "Teaching"],
  [/police|constable|\bSI\b\b|sub.?inspector/i, "Police"],
  [/universit|\bIIT\b|\bNIT\b|\bIIM\b|college/i, "University"],
  [/\bPSU\b|\bONGC\b|\bNTPC\b|\bBHEL\b|\bSAIL\b|\bGAIL\b|\bIOCL\b|\bNHPC\b|corporation limited/i, "PSU"],
  [/apprentice/i, "Apprenticeship"],
  [/skill\s*(india|mission|development)/i, "Skill Mission"],
  [/employment\s*exchange|rojgar/i, "Employment Exchange"],
];

export function classifyCategory(text = "") {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  return "Job Notification";
}

export function classifySource(text = "") {
  for (const [re, src] of SOURCE_RULES) if (re.test(text)) return src;
  return "Other";
}

// Map an exam to an Indian state. Checks full state names first, then common
// state recruitment-board abbreviations and "<State> Police/TET" patterns.
// Order matters — more specific / less ambiguous patterns first.
const STATE_RULES = [
  // Full state names (most reliable)
  [/andhra pradesh/i, "Andhra Pradesh"],
  [/arunachal/i, "Arunachal Pradesh"],
  [/\bassam\b/i, "Assam"],
  [/\bbihar\b/i, "Bihar"],
  [/chhattisgarh/i, "Chhattisgarh"],
  [/\bgoa\b/i, "Goa"],
  [/gujarat/i, "Gujarat"],
  [/haryana/i, "Haryana"],
  [/himachal/i, "Himachal Pradesh"],
  [/jharkhand/i, "Jharkhand"],
  [/karnataka/i, "Karnataka"],
  [/kerala/i, "Kerala"],
  [/madhya pradesh/i, "Madhya Pradesh"],
  [/maharashtra/i, "Maharashtra"],
  [/manipur/i, "Manipur"],
  [/meghalaya/i, "Meghalaya"],
  [/mizoram/i, "Mizoram"],
  [/nagaland/i, "Nagaland"],
  [/odisha|orissa/i, "Odisha"],
  [/punjab/i, "Punjab"],
  [/rajasthan/i, "Rajasthan"],
  [/sikkim/i, "Sikkim"],
  [/tamil nadu|tamilnadu/i, "Tamil Nadu"],
  [/telangana/i, "Telangana"],
  [/tripura/i, "Tripura"],
  [/uttar pradesh/i, "Uttar Pradesh"],
  [/uttarakhand|uttaranchal/i, "Uttarakhand"],
  [/west bengal/i, "West Bengal"],
  [/\bdelhi\b/i, "Delhi"],

  // State recruitment-board abbreviations & "<state> Police/TET" patterns
  [/\bMPSC\b|MahaTET|\bMaha\s/i, "Maharashtra"],
  [/\bBPSC\b|\bBSSC\b|\bBTSC\b|Bihar Police/i, "Bihar"],
  [/\bUPPSC\b|\bUPSSSC\b|\bUPPCL\b|\bUPTET\b|UP Police|\bUPSC\s?B? ?Ed/i, "Uttar Pradesh"],
  [/\bMPPSC\b|\bMPESB\b|Vyapam|MP Police|\bMPTET\b/i, "Madhya Pradesh"],
  [/\bTNPSC\b|\bTRB\b|\bTNUSRB\b|TN Police/i, "Tamil Nadu"],
  [/\bKPSC\b|\bKEA\b|Karnataka/i, "Karnataka"],
  [/Kerala PSC|\bKPSC\b.*kerala/i, "Kerala"],
  [/\bRPSC\b|\bRSMSSB\b|\bRSSB\b|Rajasthan Police/i, "Rajasthan"],
  [/\bGPSC\b|\bGSSSB\b|\bOJAS\b/i, "Gujarat"],
  [/\bWBPSC\b|\bWBCS\b|\bWBSSC\b/i, "West Bengal"],
  [/\bAPPSC\b|\bAPPSC\b/i, "Andhra Pradesh"],
  [/\bTSPSC\b|\bTGPSC\b/i, "Telangana"],
  [/\bHPSC\b|\bHSSC\b|Haryana/i, "Haryana"],
  [/\bHPPSC\b|\bHPSSC\b|\bHPBOSE\b/i, "Himachal Pradesh"],
  [/\bJPSC\b|\bJSSC\b/i, "Jharkhand"],
  [/\bOPSC\b|\bOSSC\b|\bOSSSC\b/i, "Odisha"],
  [/\bPPSC\b|\bPSSSB\b|Punjab Police/i, "Punjab"],
  [/\bAPSC\b/i, "Assam"],
  [/\bCGPSC\b|CG Vyapam|\bCGPEB\b/i, "Chhattisgarh"],
  [/\bUKPSC\b|\bUKSSSC\b/i, "Uttarakhand"],
  [/\bDSSSB\b|\bDTC\b\s?Delhi/i, "Delhi"],
];

export function detectState(text = "") {
  for (const [re, state] of STATE_RULES) if (re.test(text)) return state;
  return undefined;
}
