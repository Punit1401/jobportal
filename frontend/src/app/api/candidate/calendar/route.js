import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AggregatedJob from "@/models/AggregatedJob";
import GovtResource from "@/models/GovtResource";
import Exam from "@/models/Exam";

export async function GET() {
  try {
    await connectMongo();

    const [jobs, govtResources, exams] = await Promise.all([
      AggregatedJob.find({ status: "live" })
        .select("title company postedDate deadline sourceType employmentType applyContact sourceUrl slug")
        .sort({ postedDate: -1 })
        .limit(200)
        .lean(),
      GovtResource.find({ status: "live" })
        .select("title category deadline applyLink createdAt")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
      Exam.find({ status: "live" })
        .select("name conductingAuthority category keyDates applyLink officialWebsite slug createdAt")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
    ]);

    const events = [];

    for (const j of jobs) {
      const isGovt = j.sourceType === "Govt/PSU";
      const eventType = isGovt ? "govt-job" : "job";
      const applyUrl = j.applyContact?.applyUrl || j.sourceUrl || "";

      if (j.postedDate) {
        events.push({
          id: `job-posted-${j._id}`,
          title: j.title,
          subtitle: j.company || j.employmentType || "",
          date: j.postedDate,
          type: eventType,
          status: "posted",
          link: applyUrl,
        });
      }
      if (j.deadline) {
        events.push({
          id: `job-deadline-${j._id}`,
          title: j.title,
          subtitle: j.company || "",
          date: j.deadline,
          type: eventType,
          status: "deadline",
          link: applyUrl,
        });
      }
    }

    for (const g of govtResources) {
      const typeMap = {
        "Govt Job": "govt-job",
        Scheme: "scheme",
        Internship: "scheme",
        Training: "apprenticeship",
        Apprenticeship: "apprenticeship",
      };
      const evtType = typeMap[g.category] || "scheme";

      events.push({
        id: `govt-posted-${g._id}`,
        title: g.title,
        subtitle: g.category,
        date: g.deadline || g.createdAt,
        type: evtType,
        status: g.deadline ? "deadline" : "posted",
        link: g.applyLink || "",
      });
    }

    for (const e of exams) {
      const kd = e.keyDates || {};
      const link = e.applyLink || e.officialWebsite || "";
      const auth = e.conductingAuthority || "";

      if (kd.applicationStart) {
        events.push({ id: `exam-appstart-${e._id}`, title: e.name, subtitle: auth, date: kd.applicationStart, type: "exam", status: "app-open", link });
      }
      if (kd.applicationEnd) {
        events.push({ id: `exam-append-${e._id}`, title: e.name, subtitle: auth, date: kd.applicationEnd, type: "exam", status: "deadline", link });
      }
      if (kd.admitCardDate) {
        events.push({ id: `exam-admit-${e._id}`, title: `Admit Card: ${e.name}`, subtitle: auth, date: kd.admitCardDate, type: "exam", status: "admit-card", link });
      }
      if (kd.examDate) {
        events.push({ id: `exam-date-${e._id}`, title: e.name, subtitle: auth, date: kd.examDate, type: "exam", status: "exam-day", link });
      }
      if (kd.resultDate) {
        events.push({ id: `exam-result-${e._id}`, title: `Result: ${e.name}`, subtitle: auth, date: kd.resultDate, type: "result", status: "result", link });
      }
      if (!kd.applicationStart && !kd.applicationEnd && !kd.examDate && !kd.resultDate) {
        events.push({ id: `exam-posted-${e._id}`, title: e.name, subtitle: auth, date: e.createdAt, type: "exam", status: "posted", link });
      }
    }

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Calendar API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
