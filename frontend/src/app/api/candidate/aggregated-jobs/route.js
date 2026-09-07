import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AggregatedJob from "@/models/AggregatedJob";

// GET live aggregated jobs with filters:
// ?industry= ?employmentType= ?state= ?location= ?sourceType= ?q=
export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);

    const query = { status: "live" };

    const industry = searchParams.get("industry");
    if (industry && industry !== "All") query.industry = industry;

    const employmentType = searchParams.get("employmentType");
    if (employmentType && employmentType !== "All") query.employmentType = employmentType;

    const sourceType = searchParams.get("sourceType");
    if (sourceType && sourceType !== "All") query.sourceType = sourceType;

    const state = searchParams.get("state");
    if (state && state !== "All") query.state = state;

    const location = searchParams.get("location");
    if (location && location.trim()) query.location = new RegExp(location.trim(), "i");

    const sourceLabel = searchParams.get("sourceLabel");
    if (sourceLabel && sourceLabel !== "All") query.sourceLabel = sourceLabel;

    const q = searchParams.get("q");
    if (q && q.trim()) query.$text = { $search: q.trim() };

    const jobs = await AggregatedJob.find(query)
      .sort({ isFeatured: -1, rankScore: -1, postedDate: -1 })
      .limit(300)
      .lean();

    const [industries, locations, employmentTypes, sourceLabels] = await Promise.all([
      AggregatedJob.distinct("industry", { status: "live" }),
      AggregatedJob.distinct("location", { status: "live" }),
      AggregatedJob.distinct("employmentType", { status: "live" }),
      AggregatedJob.distinct("sourceLabel", { status: "live" }),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs,
      facets: {
        industries: industries.filter(Boolean).sort(),
        locations: locations.filter(Boolean).sort(),
        employmentTypes: employmentTypes.filter(Boolean).sort(),
        sourceLabels: sourceLabels.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    console.error("Fetch Aggregated Jobs Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
