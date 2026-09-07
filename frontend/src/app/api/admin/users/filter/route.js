import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
// Import Models according to your project's correct path
import User from "@/models/User";
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider"; // or ServiceProvider

export async function GET(request) {
    try {
        await connectMongo();

        const { searchParams } = new URL(request.url);

        // Get parameters
        const type = searchParams.get("type"); // candidates, recruiters, experts
        const city = searchParams.get("city");
        const profession = searchParams.get("profession");
        const gender = searchParams.get("gender");
        const experience = searchParams.get("experience");

        // Prepare Dynamic Filter Query
        let query = {};

        // Common Filters (that are present in all)
        if (city) {
            query.city = { $regex: city, $options: "i" };
        }
        if (gender) {
            query.gender = gender;
        }

        let users = [];

        // --- ROLE BASED MODEL SELECTION ---

        if (type === "candidates") {
            // Candidate filters
            if (profession) query.profession = { $regex: profession, $options: "i" };
            if (experience) query.experience = experience;

            const registeredUsers = await User.find({ password: { $exists: true } }, "_id").lean();
            const registeredUserIds = registeredUsers.map(u => u._id);
            query.userId = { $in: registeredUserIds };

            const cands = await Candidate.find(query).select("fullName name email city profession gender experience").lean();
            users = cands.map(c => ({
                ...c,
                name: c.fullName || c.name || "Untitled Candidate"
            }));
        }

        else if (type === "recruiters") {
            // Recruiter filters (Company wise or Industry wise)
            if (profession) query.industry = { $regex: profession, $options: "i" };

            const recs = await Recruiter.find(query).select("name email city industry companyName").lean();
            users = recs.map(r => ({
                ...r,
                name: r.companyName || r.name || "Untitled Recruiter"
            }));
        }

        // Need to check for 'experts' here because 'experts' comes from the frontend
        else if (type === "experts" || type === "serviceprovider") {
            // Service Provider / Expert filters
            if (profession) query.specialization = { $regex: profession, $options: "i" };

            const sps = await ServiceProvider.find(query).select("name email city specialization companyName").lean();
            users = sps.map(s => ({
                ...s,
                name: s.companyName || s.name || "Untitled Expert"
            }));
        }

        else {
            // If it's 'all', fetch data from everyone (Optional)
            const registeredUsers = await User.find({ password: { $exists: true } }, "_id").lean();
            const registeredUserIds = registeredUsers.map(u => u._id);
            const candidateQuery = { ...query, userId: { $in: registeredUserIds } };

            const [cands, recs, sps] = await Promise.all([
                Candidate.find(candidateQuery).select("fullName name email city").lean(),
                Recruiter.find(query).select("name email city companyName").lean(),
                ServiceProvider.find(query).select("name email city companyName").lean()
            ]);
            users = [
                ...cands.map(c => ({ ...c, name: c.fullName || c.name || "Untitled Candidate" })),
                ...recs.map(r => ({ ...r, name: r.companyName || r.name || "Untitled Recruiter" })),
                ...sps.map(s => ({ ...s, name: s.companyName || s.name || "Untitled Expert" }))
            ];
        }

        return NextResponse.json({
            success: true,
            count: users.length,
            users
        }, { status: 200 });

    } catch (error) {
        console.error("Database Filter Error:", error);
        return NextResponse.json({
            success: false,
            error: "Data fetch fail: " + error.message
        }, { status: 500 });
    }
}