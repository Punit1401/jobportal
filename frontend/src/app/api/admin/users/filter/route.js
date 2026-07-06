import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
// તમારા પ્રોજેક્ટના સાચા પાથ મુજબ Models ઇમ્પોર્ટ કરો
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider"; // અથવા ServiceProvider

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        // પેરામીટર્સ મેળવો
        const type = searchParams.get("type"); // candidates, recruiters, experts
        const city = searchParams.get("city");
        const profession = searchParams.get("profession");
        const gender = searchParams.get("gender");
        const experience = searchParams.get("experience");

        // Dynamic Filter Query તૈયાર કરો
        let query = {};

        // Common Filters (જે બધામાં હોય)
        if (city) {
            query.city = { $regex: city, $options: "i" };
        }
        if (gender) {
            query.gender = gender;
        }

        let users = [];

        // --- ROLE BASED MODEL SELECTION ---

        if (type === "candidates") {
            // કેન્ડિડેટ ફિલ્ટર્સ
            if (profession) query.profession = { $regex: profession, $options: "i" };
            if (experience) query.experience = experience;

            users = await Candidate.find(query).select("name email city profession gender experience").lean();
        }

        else if (type === "recruiters") {
            // રિક્રુટર ફિલ્ટર્સ (કંપની વાઈઝ કે ઇન્ડસ્ટ્રી વાઈઝ)
            if (profession) query.industry = { $regex: profession, $options: "i" };

            users = await Recruiter.find(query).select("name email city industry companyName").lean();
        }

        // અહીં 'experts' ચેક કરવું પડશે કારણ કે ફ્રન્ટએન્ડમાંથી 'experts' આવે છે
        else if (type === "experts" || type === "serviceprovider") {
            // સર્વિસ પ્રોવાઈડર / એક્સપર્ટ ફિલ્ટર્સ
            if (profession) query.specialization = { $regex: profession, $options: "i" };

            users = await ServiceProvider.find(query).select("name email city specialization").lean();
        }

        else {
            // જો 'all' હોય તો બધામાંથી ડેટા લાવવો (Optional)
            const [cands, recs, sps] = await Promise.all([
                Candidate.find(query).select("name email city").lean(),
                Recruiter.find(query).select("name email city").lean(),
                ServiceProvider.find(query).select("name email city").lean()
            ]);
            users = [...cands, ...recs, ...sps];
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