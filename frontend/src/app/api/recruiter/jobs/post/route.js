// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Job from "@/models/Job";
// import Company from "@/models/Recruiter";
// import { checkLimit } from "@/lib/checkSubscription";

// // ✅ GET: Fetch all active jobs for a recruiter (Filter by Deadline)
// export async function GET(req) {
//   try {
//     await connectMongo();

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const company = await Company.findOne().sort({ createdAt: -1 });
//     const recruiterId = company ? company._id.toString() : "TEMP_RECRUITER_ID";

//     // Deadline filter: Fakt te j job batsavse jeni deadline aaje ke aagal ni hoy
//     const jobs = await Job.find({
//       recruiterId,
//       deadline: { $gte: today }
//     }).sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, jobs: jobs || [] });
//   } catch (error) {
//     return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
//   }
// }

// // ✅ POST: Create new job
// export async function POST(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();

//     const company = await Company.findOne().sort({ createdAt: -1 });

//     if (!company) {
//       return NextResponse.json(
//         { error: "Company profile not found" },
//         { status: 400 }
//       );
//     }

//     const skillsArray = body.requirements
//       ? body.requirements.split(",").map(s => s.trim())
//       : [];

//     const newJob = await Job.create({
//       ...body,
//       skills: skillsArray,
//       deadline: new Date(body.deadline),
//       recruiterId: company._id.toString(),
//       companyId: company._id,
//     });

//     return NextResponse.json({ success: true, job: newJob }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // ✅ PUT: Update existing job (Badha fields update thase + Expired job live thase)
// export async function PUT(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();
//     const { jobId, ...updateData } = body;

//     if (!jobId) {
//       return NextResponse.json({ error: "Job ID required" }, { status: 400 });
//     }

//     // Requirements mathi skills array banavvo
//     if (typeof updateData.requirements === "string") {
//       updateData.skills = updateData.requirements.split(",").map(s => s.trim());
//     } else if (Array.isArray(updateData.requirements)) {
//       updateData.skills = updateData.requirements.map(s => s.trim());
//     }

//     // Deadline ne Date object ma convert karvi jethi query ma barabar chale
//     if (updateData.deadline) {
//       const parsedDate = new Date(updateData.deadline);
//       if (!isNaN(parsedDate.getTime())) {
//         updateData.deadline = parsedDate;
//       } else {
//         throw new Error("Invalid deadline date");
//       }
//     }

//     // findByIdAndUpdate badha updateData fields ne database ma save kari dese.
//     // Jo recruiter deadline vadhaarase, to GET API ma $gte today logic mujab job automatically live thai jase.
//     const updatedJob = await Job.findByIdAndUpdate(
//       jobId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedJob) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, job: updatedJob });
//   } catch (error) {
//     console.error("Update Error:", error);
//     return NextResponse.json({ error: "Update failed" }, { status: 500 });
//   }
// }

// // ✅ DELETE: Remove a job
// export async function DELETE(req) {
//   try {
//     await connectMongo();
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get("jobId");

//     if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

//     await Job.findByIdAndDelete(jobId);
//     return NextResponse.json({ success: true, message: "Job deleted" });
//   } catch (error) {
//     return NextResponse.json({ error: "Delete failed" }, { status: 500 });
//   }
// }

// // export const dynamic = "force-dynamic";
// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Job from "@/models/Job";
// import Company from "@/models/Recruiter";
// import { checkLimit } from "@/lib/checkSubscription"; // Step 2 વાળું હેલ્પર

// // ✅ GET: Fetch all active jobs for a recruiter (Filter by Deadline)
// export async function GET(req) {
//   try {
//     await connectMongo();

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const company = await Company.findOne().sort({ createdAt: -1 });
//     const recruiterId = company ? company._id.toString() : "TEMP_RECRUITER_ID";

//     const jobs = await Job.find({
//       recruiterId,
//       deadline: { $gte: today }
//     }).sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, jobs: jobs || [] });
//   } catch (error) {
//     return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
//   }
// }

// // ✅ POST: Create new job (With Subscription Limit Check)
// export async function POST(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();

//     const company = await Company.findOne().sort({ createdAt: -1 });

//     if (!company) {
//       return NextResponse.json(
//         { error: "Company profile not found" },
//         { status: 400 }
//       );
//     }

//     // --- સબ્સ્ક્રિપ્શન લિમિટ ચેક કરવાનું લોજિક (નવું ઉમેરેલું) ---
//     try {
//       await checkLimit(company._id, "POST_JOB");
//     } catch (limitErr) {
//       return NextResponse.json(
//         { success: false, error: limitErr.message },
//         { status: 403 } // 403 Forbidden (Limit reached)
//       );
//     }

//     const skillsArray = body.requirements
//       ? body.requirements.split(",").map(s => s.trim())
//       : [];

//     const newJob = await Job.create({
//       ...body,
//       skills: skillsArray,
//       deadline: new Date(body.deadline),
//       recruiterId: company._id.toString(),
//       companyId: company._id,
//     });

//     // --- જોબ સફળતાપૂર્વક ક્રિએટ થાય તો વપરાયેલી લિમિટમાં +1 કરો ---
//     await Company.findByIdAndUpdate(company._id, {
//       $inc: { "subscription.usedJobs": 1 }
//     });

//     return NextResponse.json({ success: true, job: newJob }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // ✅ PUT: Update existing job
// export async function PUT(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();
//     const { jobId, ...updateData } = body;

//     if (!jobId) {
//       return NextResponse.json({ error: "Job ID required" }, { status: 400 });
//     }

//     if (typeof updateData.requirements === "string") {
//       updateData.skills = updateData.requirements.split(",").map(s => s.trim());
//     } else if (Array.isArray(updateData.requirements)) {
//       updateData.skills = updateData.requirements.map(s => s.trim());
//     }

//     if (updateData.deadline) {
//       const parsedDate = new Date(updateData.deadline);
//       if (!isNaN(parsedDate.getTime())) {
//         updateData.deadline = parsedDate;
//       } else {
//         throw new Error("Invalid deadline date");
//       }
//     }

//     const updatedJob = await Job.findByIdAndUpdate(
//       jobId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedJob) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, job: updatedJob });
//   } catch (error) {
//     console.error("Update Error:", error);
//     return NextResponse.json({ error: "Update failed" }, { status: 500 });
//   }
// }

// // ✅ DELETE: Remove a job
// export async function DELETE(req) {
//   try {
//     await connectMongo();
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get("jobId");

//     if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

//     await Job.findByIdAndDelete(jobId);
//     return NextResponse.json({ success: true, message: "Job deleted" });
//   } catch (error) {
//     return NextResponse.json({ error: "Delete failed" }, { status: 500 });
//   }
// }

// export const dynamic = "force-dynamic";
// export const dynamic = "force-dynamic";
// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Job from "@/models/Job";
// import Company from "@/models/Recruiter";
// // import { checkLimit } from "@/lib/checkSubscription"; // પેમેન્ટ અત્યારે બંધ છે એટલે આની જરૂર નથી

// // ✅ GET: Fetch all active jobs for a recruiter (Filter by Deadline)
// export async function GET(req) {
//   try {
//     await connectMongo();

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const company = await Company.findOne().sort({ createdAt: -1 });
//     const recruiterId = company ? company._id.toString() : "TEMP_RECRUITER_ID";

//     const jobs = await Job.find({
//       recruiterId,
//       deadline: { $gte: today }
//     }).sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, jobs: jobs || [] });
//   } catch (error) {
//     return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
//   }
// }

// // ✅ POST: Create new job (Subscription Limit Disabled)
// export async function POST(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();

//     const company = await Company.findOne().sort({ createdAt: -1 });

//     if (!company) {
//       return NextResponse.json(
//         { error: "Company profile not found" },
//         { status: 400 }
//       );
//     }

//     /* --- સબ્સ્ક્રિપ્શન લિમિટ ચેક કરવાનું લોજિક (કમેન્ટ કરેલું છે) ---
//     try {
//       await checkLimit(company._id, "POST_JOB");
//     } catch (limitErr) {
//       return NextResponse.json(
//         { success: false, error: limitErr.message },
//         { status: 403 }
//       );
//     }
//     */

//     const skillsArray = body.requirements
//       ? body.requirements.split(",").map(s => s.trim())
//       : [];

//     const newJob = await Job.create({
//       ...body,
//       skills: skillsArray,
//       deadline: new Date(body.deadline),
//       recruiterId: company._id.toString(),
//       companyId: company._id,
//     });

//     /* --- જોબ સફળતાપૂર્વક ક્રિએટ થાય તો વપરાયેલી લિમિટમાં +1 કરવાનું લોજિક (કમેન્ટ કરેલું છે) ---
//     await Company.findByIdAndUpdate(company._id, {
//       $inc: { "subscription.usedJobs": 1 }
//     });
//     */

//     return NextResponse.json({ success: true, job: newJob }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // ✅ PUT: Update existing job
// export async function PUT(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();
//     const { jobId, ...updateData } = body;

//     if (!jobId) {
//       return NextResponse.json({ error: "Job ID required" }, { status: 400 });
//     }

//     if (typeof updateData.requirements === "string") {
//       updateData.skills = updateData.requirements.split(",").map(s => s.trim());
//     } else if (Array.isArray(updateData.requirements)) {
//       updateData.skills = updateData.requirements.map(s => s.trim());
//     }

//     if (updateData.deadline) {
//       const parsedDate = new Date(updateData.deadline);
//       if (!isNaN(parsedDate.getTime())) {
//         updateData.deadline = parsedDate;
//       } else {
//         throw new Error("Invalid deadline date");
//       }
//     }

//     const updatedJob = await Job.findByIdAndUpdate(
//       jobId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedJob) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, job: updatedJob });
//   } catch (error) {
//     console.error("Update Error:", error);
//     return NextResponse.json({ error: "Update failed" }, { status: 500 });
//   }
// }

// // ✅ DELETE: Remove a job
// export async function DELETE(req) {
//   try {
//     await connectMongo();
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get("jobId");

//     if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

//     await Job.findByIdAndDelete(jobId);
//     return NextResponse.json({ success: true, message: "Job deleted" });
//   } catch (error) {
//     return NextResponse.json({ error: "Delete failed" }, { status: 500 });
//   }
// }

// export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Company from "@/models/Recruiter";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
// import { checkLimit } from "@/lib/checkSubscription"; // પેમેન્ટ અત્યારે બંધ છે એટલે આની જરૂર નથી

// ✅ GET: Fetch all active jobs for a recruiter (Filter by Session & Deadline)
export async function GET(req) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // લોગિન થયેલા રિક્રુટરને તેના ઈમેલથી શોધો
    const company = await Company.findOne({ email: session.user.email });
    const recruiterId = company ? company._id.toString() : "TEMP_RECRUITER_ID";

    const jobs = await Job.find({
      recruiterId,
      deadline: { $gte: today }
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, jobs: jobs || [] });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// ✅ POST: Create new job (Subscription Limit Disabled)
export async function POST(req) {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // લોગિન થયેલા રિક્રુટરની પ્રોફાઈલ મેળવો
    const company = await Company.findOne({ email: session.user.email });

    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 400 }
      );
    }

    /* --- સબ્સ્ક્રિપ્શન લિમિટ ચેક કરવાનું લોજિક (કમેન્ટ કરેલું છે) ---
    try {
      await checkLimit(company._id, "POST_JOB");
    } catch (limitErr) {
      return NextResponse.json(
        { success: false, error: limitErr.message },
        { status: 403 }
      );
    }
    */

    const skillsArray = body.requirements
      ? body.requirements.split(",").map(s => s.trim())
      : [];

    const newJob = await Job.create({
      ...body,
      skills: skillsArray,
      deadline: new Date(body.deadline),
      recruiterId: company._id.toString(),
      companyId: company._id,
      // નવા ફિલ્ડ્સ body માંથી ઓટોમેટિકલી અહીં આવી જશે
    });

    /* --- જોબ સફળતાપૂર્વક ક્રિએટ થાય તો વપરાયેલી લિમિટમાં +1 કરવાનું લોજિક (કમેન્ટ કરેલું છે) ---
    await Company.findByIdAndUpdate(company._id, {
      $inc: { "subscription.usedJobs": 1 }
    });
    */

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT: Update existing job
export async function PUT(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { jobId, ...updateData } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    if (typeof updateData.requirements === "string") {
      updateData.skills = updateData.requirements.split(",").map(s => s.trim());
    } else if (Array.isArray(updateData.requirements)) {
      updateData.skills = updateData.requirements.map(s => s.trim());
    }

    if (updateData.deadline) {
      const parsedDate = new Date(updateData.deadline);
      if (!isNaN(parsedDate.getTime())) {
        updateData.deadline = parsedDate;
      } else {
        throw new Error("Invalid deadline date");
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE: Remove a job
export async function DELETE(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    await Job.findByIdAndDelete(jobId);
    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";