import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job"; 
import Candidate from "@/models/Candidate"; 
import CandidateJob from "@/models/CandidateJob"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Please login first" }, { status: 401 });
    }

    // 1. યુઝરની પ્રોફાઇલ મેળવો
    const candidateProfile = await Candidate.findOne({ email: session.user.email });

    if (!candidateProfile || !candidateProfile.skills || candidateProfile.skills.length === 0) {
      return NextResponse.json({ 
        success: false, 
        isProfileIncomplete: true, 
        error: "Please add your Skills in profile first." 
      }, { status: 200 });
    }

    // Skills Clean કરો
    let userSkills = candidateProfile.skills.flatMap(s => {
        try { 
            const parsed = JSON.parse(s);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch(e) { return s; }
    }).map(s => s.toLowerCase().trim()).filter(s => s !== "");

    console.log("User Skills Found:", userSkills); // Debug Log

    // 2. બંને મોડલમાંથી બધી જ જોબ્સ લાવો (Status ફિલ્ટર હમણાં કાઢી નાખ્યું છે ચેક કરવા માટે)
    const [jobsFromMain, jobsFromCandidate] = await Promise.all([
      Job.find({}).lean(),
      CandidateJob.find({}).lean()
    ]);

    const allAvailableJobs = [...jobsFromMain, ...jobsFromCandidate];
    console.log("Total Jobs Found in DB:", allAvailableJobs.length); // Debug Log

    // 3. મેચિંગ લોજિક
    const recommendedJobs = allAvailableJobs.map(job => {
      // બધા પોસિબલ ફિલ્ડ્સ ચેક કરો
      const title = (job.title || job.jobTitle || job.position || "").toLowerCase();
      const desc = (job.description || job.jobDescription || "").toLowerCase();
      const industry = (job.jobIndustry || "").toLowerCase();
      const reqs = Array.isArray(job.requirements) ? job.requirements.join(" ") : (job.requirements || "");
      
      const jobDetails = `${title} ${desc} ${reqs} ${industry}`.toLowerCase();
      
      let matchedSkillsList = [];

      // પ્રોફાઇલની સ્કિલ્સ જોબમાં શોધો
      userSkills.forEach(skill => {
        if (skill && jobDetails.includes(skill)) {
          matchedSkillsList.push(skill);
        }
      });

      const score = userSkills.length > 0 
        ? Math.round((matchedSkillsList.length / userSkills.length) * 100) 
        : 0;

      return {
        _id: job._id,
        title: job.title || job.jobTitle || job.position || "Untitled Job",
        companyName: job.companyName || job.currentCompanyName || "Company",
        location: job.location || "Not Specified",
        salaryRange: job.salaryRange || job.expectedSalary || "N/A",
        matchScore: score,
        matchedSkills: matchedSkillsList
      };
    })
    .filter(job => job.matchedSkills.length > 0) // માત્ર જે મેચ થાય તે જ બતાવો
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);

    //console.log("Final Recommended Jobs:", recommendedJobs.length); // Debug Log

    return NextResponse.json({ success: true, jobs: recommendedJobs });

  } catch (err) {
    //console.error("AI_RECO_ERROR:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}