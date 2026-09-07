import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Program from "@/models/Program";
import GovtResource from "@/models/GovtResource";

// GET live programs. ?programType= ?sector= ?mode= ?state= ?q=
export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);

    const programType = searchParams.get("programType");
    const sector = searchParams.get("sector");
    const mode = searchParams.get("mode");
    const state = searchParams.get("state");
    const q = searchParams.get("q");

    const programQuery = { status: "live" };
    if (programType && programType !== "All") programQuery.programType = programType;
    if (sector && sector !== "All") programQuery.sector = sector;
    if (mode && mode !== "All") programQuery.mode = mode;
    if (state && state !== "All") programQuery.state = state;

    const resourceQuery = {
      status: "live",
      category: { $in: ["Internship", "Training", "Apprenticeship", "Industrial Training"] }
    };
    if (programType && programType !== "All") {
      resourceQuery.category = programType === "Industrial Training" ? { $in: ["Training", "Industrial Training"] } : programType;
    }
    if (sector && sector !== "All") resourceQuery.sector = sector;

    const [programs, govtResources] = await Promise.all([
      Program.find(programQuery).sort({ isFeatured: -1, createdAt: -1 }).lean(),
      GovtResource.find(resourceQuery).sort({ createdAt: -1 }).lean(),
    ]);

    const formattedResources = govtResources.map(r => ({
      _id: r._id,
      title: r.title,
      programType: r.category === "Training" ? "Industrial Training" : r.category,
      organization: r.organization || "Government Body",
      sector: r.sector || "General",
      mode: r.mode || "Offline",
      duration: r.duration || "N/A",
      stipend: r.stipend || "As per rules",
      location: r.state || "All India",
      qualification: r.eligibility || "Not specified",
      applyLink: r.applyLink,
      status: r.status,
      createdAt: r.createdAt
    }));

    const combined = [...programs];
    const existingTitles = new Set(programs.map(p => p.title.toLowerCase().trim()));

    formattedResources.forEach(res => {
      const titleLower = res.title.toLowerCase().trim();
      if (!existingTitles.has(titleLower)) {
        existingTitles.add(titleLower);
        if (!mode || mode === "All" || res.mode === mode) {
          combined.push(res);
        }
      }
    });

    let resultData = combined;
    if (q && q.trim()) {
      const qLower = q.trim().toLowerCase();
      resultData = combined.filter(p =>
        p.title?.toLowerCase().includes(qLower) ||
        p.organization?.toLowerCase().includes(qLower) ||
        p.sector?.toLowerCase().includes(qLower)
      );
    }

    const [progSectors, resSectors] = await Promise.all([
      Program.distinct("sector", { status: "live" }),
      GovtResource.distinct("sector", { status: "live", category: { $in: ["Internship", "Training", "Apprenticeship", "Industrial Training"] } }),
    ]);

    const allSectors = Array.from(new Set([...progSectors, ...resSectors])).filter(Boolean).sort();

    return NextResponse.json({
      success: true,
      data: resultData,
      facets: { sectors: allSectors },
    });
  } catch (error) {
    console.error("Fetch Programs Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
