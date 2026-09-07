export const moduleConfigs = {
  "staff-task-management": {
    title: "Staff & Task Management",
    subtitle: "Manage staff records, task boards, and execution states.",
    fields: [
      { key: "assignee", label: "Assignee", required: true, placeholder: "Assign to" },
      { key: "dueDate", label: "Due Date", type: "date", required: true },
      { key: "taskType", label: "Task Type", type: "select", options: ["Feature", "Bug", "Support"] },
    ],
    columns: [
      { key: "assignee", label: "Assignee", source: "meta" },
      { key: "dueDate", label: "Due Date", source: "meta" },
      { key: "taskType", label: "Type", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "libraries": {
    title: "Knowledge Library",
    subtitle: "Upload and manage guidance videos and training resources for users.",
    fields: [
      { key: "category", label: "Target Audience", type: "select", options: ["All", "Candidates", "Recruiters", "Service Providers"] },
      { key: "videoUrl", label: "Video URL (YouTube/Vimeo)", placeholder: "https://youtube.com/watch?v=..." },
      { key: "thumbnail", label: "Thumbnail URL", placeholder: "https://..." },
    ],
    columns: [
      { key: "category", label: "Audience", source: "meta" },
      { key: "videoUrl", label: "Video Link", source: "meta" },
      { key: "status", label: "Status", source: "root" },
    ],
  },
  "third-party-integrations": {
    title: "3rd Party Apps Integration",
    subtitle: "Track connected apps and integration workflow.",
    fields: [
      { key: "provider", label: "Provider", required: true },
      { key: "environment", label: "Environment", type: "select", options: ["Sandbox", "Production"] },
      { key: "owner", label: "Owner" },
    ],
    columns: [
      { key: "provider", label: "Provider", source: "meta" },
      { key: "environment", label: "Env", source: "meta" },
      { key: "owner", label: "Owner", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "reports-graphs": {
    title: "Reports & Graphs",
    subtitle: "Maintain reporting widgets and analytics blocks.",
    fields: [
      { key: "reportType", label: "Report Type", required: true },
      { key: "frequency", label: "Frequency", type: "select", options: ["Daily", "Weekly", "Monthly"] },
      { key: "owner", label: "Owner" },
    ],
    columns: [
      { key: "reportType", label: "Report Type", source: "meta" },
      { key: "frequency", label: "Frequency", source: "meta" },
      { key: "owner", label: "Owner", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "social-media-integration": {
    title: "Social Media Integration",
    subtitle: "Manage channels, campaigns, and posting flow.",
    fields: [
      { key: "platform", label: "Platform", type: "select", options: ["LinkedIn", "Instagram", "Facebook", "Twitter", "YouTube"] },
      { key: "handle", label: "Handle" },
      { key: "campaign", label: "Campaign" },
    ],
    columns: [
      { key: "platform", label: "Platform", source: "meta" },
      { key: "handle", label: "Handle", source: "meta" },
      { key: "campaign", label: "Campaign", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "contact-developer": {
    title: "Contact Developer",
    subtitle: "Track technical support requests and escalations.",
    fields: [
      { key: "requester", label: "Requester", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
    ],
    columns: [
      { key: "requester", label: "Requester", source: "meta" },
      { key: "email", label: "Email", source: "meta" },
      { key: "severity", label: "Severity", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "events-activities": {
    title: "Events & Activities",
    subtitle: "Manage events, activities, and participation entries.",
    fields: [
      { key: "eventDate", label: "Event Date", type: "date", required: true },
      { key: "location", label: "Location" },
      { key: "organizer", label: "Organizer" },
    ],
    columns: [
      { key: "eventDate", label: "Date", source: "meta" },
      { key: "location", label: "Location", source: "meta" },
      { key: "organizer", label: "Organizer", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "contact-management": {
    title: "Contact Management",
    subtitle: "Manage inbound contacts and follow-up tasks.",
    fields: [
      { key: "contactName", label: "Contact Name", required: true },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email", type: "email" },
    ],
    columns: [
      { key: "contactName", label: "Contact", source: "meta" },
      { key: "phone", label: "Phone", source: "meta" },
      { key: "email", label: "Email", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "government-schemes": {
    title: "Government Schemes",
    subtitle: "Manage scheme records and applicant notes.",
    fields: [
      { key: "schemeCode", label: "Scheme Code", required: true },
      { key: "eligibility", label: "Eligibility" },
      { key: "deadline", label: "Deadline", type: "date" },
    ],
    columns: [
      { key: "schemeCode", label: "Code", source: "meta" },
      { key: "eligibility", label: "Eligibility", source: "meta" },
      { key: "deadline", label: "Deadline", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "files-folders": {
    title: "Files & Folder",
    subtitle: "Track file records and folder metadata.",
    fields: [
      { key: "folder", label: "Folder", required: true },
      { key: "fileType", label: "File Type" },
      { key: "owner", label: "Owner" },
    ],
    columns: [
      { key: "folder", label: "Folder", source: "meta" },
      { key: "fileType", label: "File Type", source: "meta" },
      { key: "owner", label: "Owner", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "digital-wallet": {
    title: "Digital Wallet",
    subtitle: "Manage wallet entries, ledger items, and settlements.",
    fields: [
      { key: "txnType", label: "Transaction Type", type: "select", options: ["Credit", "Debit"] },
      { key: "amount", label: "Amount", type: "number", required: true },
      { key: "reference", label: "Reference" },
    ],
    columns: [
      { key: "txnType", label: "Type", source: "meta" },
      { key: "amount", label: "Amount", source: "meta" },
      { key: "reference", label: "Reference", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "feedback": {
    title: "Feedback",
    subtitle: "Manage client feedback and rating notes.",
    fields: [
      { key: "client", label: "Client", required: true },
      { key: "rating", label: "Rating", type: "select", options: ["1", "2", "3", "4", "5"] },
      { key: "channel", label: "Channel", type: "select", options: ["Email", "Call", "Web", "In-app"] },
    ],
    columns: [
      { key: "client", label: "Client", source: "meta" },
      { key: "rating", label: "Rating", source: "meta" },
      { key: "channel", label: "Channel", source: "meta" },
      { key: "description", label: "Feedback", source: "root" },
    ],
  },
  "sms-whatsapp-integration": {
    title: "SMS / WhatsApp Integration",
    subtitle: "Manage messaging templates and campaign status.",
    fields: [
      { key: "provider", label: "Provider", required: true },
      { key: "channel", label: "Channel", type: "select", options: ["SMS", "WhatsApp"] },
      { key: "templateId", label: "Template ID" },
    ],
    columns: [
      { key: "provider", label: "Provider", source: "meta" },
      { key: "channel", label: "Channel", source: "meta" },
      { key: "templateId", label: "Template ID", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "retail-sales": {
    title: "Retail Sales",
    subtitle: "Manage retail sales entries and sales operations.",
    fields: [
      { key: "product", label: "Product", required: true },
      { key: "quantity", label: "Quantity", type: "number", required: true },
      { key: "amount", label: "Amount", type: "number", required: true },
    ],
    columns: [
      { key: "product", label: "Product", source: "meta" },
      { key: "quantity", label: "Qty", source: "meta" },
      { key: "amount", label: "Amount", source: "meta" },
      { key: "description", label: "Description", source: "root" },
    ],
  },
  "enquiries": {
    title: "Enquiries",
    subtitle: "Manage customer enquiries and response progress.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "phone", label: "Phone" },
      { key: "source", label: "Source", type: "select", options: ["Website", "WhatsApp", "Call", "Referral"] },
    ],
    columns: [
      { key: "name", label: "Name", source: "meta" },
      { key: "phone", label: "Phone", source: "meta" },
      { key: "source", label: "Source", source: "meta" },
      { key: "description", label: "Enquiry", source: "root" },
    ],
  },
  "clients-list": {
    title: "Clients List",
    subtitle: "Manage client records, updates, and review states.",
    fields: [
      { key: "company", label: "Company", required: true },
      { key: "contact", label: "Contact" },
      { key: "plan", label: "Plan" },
    ],
    columns: [
      { key: "company", label: "Company", source: "meta" },
      { key: "contact", label: "Contact", source: "meta" },
      { key: "plan", label: "Plan", source: "meta" },
      { key: "description", label: "Notes", source: "root" },
    ],
  },
  "blogs-articles": {
    title: "Blogs / Articles",
    subtitle: "Manage article pipeline and publishing status.",
    fields: [
      { key: "slug", label: "Slug", required: true },
      { key: "author", label: "Author" },
      { key: "publishDate", label: "Publish Date", type: "date" },
    ],
    columns: [
      { key: "slug", label: "Slug", source: "meta" },
      { key: "author", label: "Author", source: "meta" },
      { key: "publishDate", label: "Publish Date", source: "meta" },
      { key: "description", label: "Summary", source: "root" },
    ],
  },
};
