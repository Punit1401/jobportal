// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Application from "@/models/Application";
// import Candidate from "@/models/Candidate";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// // 1. POST: When user applies (Pulling data from Candidate profile)
// export async function POST(req) {
//   try {
//     await connectMongo();

//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: "Please login first" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { jobId, recruiterId, role } = body;

//     const userProfile = await Candidate.findOne({ userId: session.user.id });

//     if (!userProfile) {
//       return NextResponse.json({ 
//         error: "Your profile is incomplete. Please visit the Profile page and fill in the details!" 
//       }, { status: 400 });
//     }

//     // Creating Application with correct mapping
//     const newApp = await Application.create({
//       jobId,
//       recruiterId,
//       name: userProfile.fullName,       // Maps Candidate.fullName -> Application.name
//       email: userProfile.email,   
//       role: role,                 
//       resumeUrl: userProfile.resume,    // Maps Candidate.resume -> Application.resumeUrl
//       mobile: userProfile.mobile,   
//       city: userProfile.city,       
//       state: userProfile.state,
//       profession: userProfile.profession,

//       // Education
//       graduationUniversity: userProfile.graduationUniversity,
//       graduationSpecialization: userProfile.graduationSpecialization,
//       graduationPercentage: userProfile.graduationPercentage,
//       classXIIPercentage: userProfile.classXIIPercentage,
//       classXPercentage: userProfile.classXPercentage,

//       // Work Experience
//       presentEmploymentStatus: userProfile.presentEmploymentStatus,
//       currentCompanyName: userProfile.currentCompanyName,
//       jobDepartment: userProfile.jobDepartment,
//       jobIndustry: userProfile.jobIndustry,
//       jobDescription: userProfile.jobDescription,
//       jobFromDate: userProfile.jobFromDate,
//       jobToDate: userProfile.jobToDate,

//       // Skills & Socials
//       skills: userProfile.skills,
//       github: userProfile.github,
//       portfolio: userProfile.portfolio,

//       status: "Pending", 
//       appliedAt: new Date(),
//       userId: session.user.id
//     });

//     return NextResponse.json({ ok: true, data: newApp });
//   } catch (err) {
//     console.error("Apply Error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // 2. GET: To get the list of all candidates for the recruiter
// // 2. GET: To get the list of candidates only for that specific recruiter
// export async function GET(req) {
//   try {
//     await connectMongo();
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     let apps;
//     if (session.user.role === "recruiter") {
//       apps = await Application.find({ recruiterId: session.user.id }).sort({ appliedAt: -1 });
//     } else {
//       // Change here: Use Regex to find email Case-insensitive
//       const userEmail = session.user.email;
//       // Removed sensitive logging
//       // console.log("Fetching apps for email:", userEmail);
//       console.log("Fetching apps for authenticated user");

//       apps = await Application.find({
//         $or: [
//           { email: userEmail.toLowerCase() },
//           { userId: session.user.id }
//         ]
//       }).collation({ locale: "en", strength: 2 }).sort({ appliedAt: -1 });
//     }

//     return NextResponse.json({ ok: true, data: apps || [] });
//   } catch (err) {
//     console.error("Fetch Error:", err);
//     return NextResponse.json({ ok: false, data: [] }, { status: 500 });
//   }
// }
// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Application from "@/models/Application";
// import Candidate from "@/models/Candidate";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import mongoose from "mongoose";

// // 1. POST: When user applies
// export async function POST(req) {
//   try {
//     await connectMongo();
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Please login first" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { jobId, recruiterId, role } = body;

//     if (!jobId || !recruiterId) {
//       return NextResponse.json({ error: "Missing Job ID or Recruiter ID" }, { status: 400 });
//     }

//     const userProfile = await Candidate.findOne({ userId: session.user.id });

//     if (!userProfile) {
//       return NextResponse.json({
//         error: "Your profile is incomplete. Please visit the Profile page and fill in the details!"
//       }, { status: 400 });
//     }

//     // Application Create - Formatting fields for consistency
//     const newApp = await Application.create({
//       jobId,
//       recruiterId, // Will be saved as String, but will be converted to ObjectId per Schema
//       name: userProfile.fullName,
//       email: userProfile.email.toLowerCase(),
//       role: role || "Not Specified",
//       resumeUrl: userProfile.resume,
//       mobile: userProfile.mobile,
//       city: userProfile.city,
//       state: userProfile.state,
//       profession: userProfile.profession,
//       graduationUniversity: userProfile.graduationUniversity,
//       graduationSpecialization: userProfile.graduationSpecialization,
//       graduationPercentage: userProfile.graduationPercentage,
//       classXIIPercentage: userProfile.classXIIPercentage,
//       classXPercentage: userProfile.classXPercentage,
//       presentEmploymentStatus: userProfile.presentEmploymentStatus,
//       currentCompanyName: userProfile.currentCompanyName,
//       jobDepartment: userProfile.jobDepartment,
//       jobIndustry: userProfile.jobIndustry,
//       jobDescription: userProfile.jobDescription,
//       jobFromDate: userProfile.jobFromDate,
//       jobToDate: userProfile.jobToDate,
//       skills: userProfile.skills,
//       github: userProfile.github,
//       portfolio: userProfile.portfolio,
//       status: "Pending",
//       appliedAt: new Date(),
//       userId: session.user.id
//     });

//     return NextResponse.json({ ok: true, data: newApp });
//   } catch (err) {
//     //console.error("Apply POST Error:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // 2. GET: For retrieving data (Recruiter/Candidate)
// export async function GET(req) {
//   try {
//     await connectMongo();
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = session.user.id;
//     //console.log("Logged in User ID:", userId);
//     //console.log("Logged in User Role:", session.user.role);

//     let apps;
//     if (session.user.role === "recruiter") {
//       // For recruiter, find all applications where recruiterId matches
//       // This query will handle both String and ObjectId
//       apps = await Application.find({
//         $or: [
//           { recruiterId: userId },
//           { recruiterId: new mongoose.Types.ObjectId(userId) }
//         ]
//       }).sort({ appliedAt: -1 });

//       //console.log("Applications Found for Recruiter:", apps.length);
//     } else {
//       apps = await Application.find({
//         $or: [
//           { userId: userId },
//           { email: session.user.email.toLowerCase() }
//         ]
//       }).sort({ appliedAt: -1 });
//     }

//     return NextResponse.json({ ok: true, data: apps });
//   } catch (err) {
//     //console.error("Fetch Error:", err);
//     return NextResponse.json({ ok: false, data: [] }, { status: 500 });
//   }
// }

// // 3. PATCH: For updating status
// export async function PATCH(req) {
//   try {
//     await connectMongo();
//     const { id, status } = await req.json();

//     if (!id || !status) {
//       return NextResponse.json({ error: "Missing ID or Status" }, { status: 400 });
//     }

//     const updatedApp = await Application.findByIdAndUpdate(
//       id,
//       { $set: { status: status } },
//       { new: true }
//     );

//     if (!updatedApp) {
//       return NextResponse.json({ error: "Application not found" }, { status: 404 });
//     }

//     return NextResponse.json({ ok: true, data: updatedApp });
//   } catch (err) {
//     //console.error("Update PATCH Error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // 4. DELETE: For deleting application
// export async function DELETE(req) {
//   try {
//     await connectMongo();
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
//     }

//     const deleted = await Application.findByIdAndDelete(id);

//     if (!deleted) {
//       return NextResponse.json({ error: "Application not found" }, { status: 404 });
//     }

//     return NextResponse.json({ ok: true, message: "Deleted successfully" });
//   } catch (err) {
//     //console.error("Delete Error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// 1. POST: When user applies
export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      jobId, 
      recruiterId, 
      role, 
      bidAmount, 
      timeline, 
      projectName, 
      projectBrief 
    } = body;

    if (!jobId || !recruiterId) {
      return NextResponse.json({ error: "Missing Job ID or Recruiter ID" }, { status: 400 });
    }

    const userProfile = await Candidate.findOne({ userId: session.user.id });

    if (!userProfile) {
      return NextResponse.json({
        error: "Your profile is incomplete. Please visit the Profile page and fill in the details!"
      }, { status: 400 });
    }

    // Application Create - Formatting fields for consistency
    const newApp = await Application.create({
      jobId,
      userId: session.user.id, // This is required in Schema
      recruiterId, // Will be saved as String, but will be converted to ObjectId per Schema
      name: userProfile.fullName,
      email: userProfile.email.toLowerCase(),
      role: role || "Not Specified",
      resumeUrl: userProfile.resume,
      mobile: userProfile.mobile,
      city: userProfile.city,
      state: userProfile.state,
      profession: userProfile.profession,
      graduationUniversity: userProfile.graduationUniversity,
      graduationSpecialization: userProfile.graduationSpecialization,
      graduationPercentage: userProfile.graduationPercentage,
      classXIIPercentage: userProfile.classXIIPercentage,
      classXPercentage: userProfile.classXPercentage,
      presentEmploymentStatus: userProfile.presentEmploymentStatus,
      currentCompanyName: userProfile.currentCompanyName,
      jobDepartment: userProfile.jobDepartment,
      jobIndustry: userProfile.jobIndustry,
      jobDescription: userProfile.jobDescription,
      jobFromDate: userProfile.jobFromDate,
      jobToDate: userProfile.jobToDate,
      skills: userProfile.skills,
      github: userProfile.github,
      portfolio: userProfile.portfolio,
      
      // ✅ Bidding Fields - Explicit conversion
      bidAmount: bidAmount ? Number(bidAmount) : 0, 
      timeline: timeline || "",
      projectName: projectName || "",
      projectBrief: projectBrief || "",
      status: "Pending",
      appliedAt: new Date(),
      //userId: session.user.id
    });

    return NextResponse.json({ ok: true, data: newApp });
  } catch (err) {
    //console.error("Apply POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. GET: For retrieving data (Recruiter/Candidate)
export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    //console.log("Logged in User ID:", userId);
    //console.log("Logged in User Role:", session.user.role);

    let apps;
    if (session.user.role === "recruiter") {
      // For recruiter, find all applications where recruiterId matches
      // This query will handle both String and ObjectId
      apps = await Application.find({
        $or: [
          { recruiterId: userId },
          { recruiterId: new mongoose.Types.ObjectId(userId) }
        ],
        jobId: { $nin: ["manual", null, undefined] }
      }).sort({ appliedAt: -1 });

      //console.log("Applications Found for Recruiter:", apps.length);
    } else {
      apps = await Application.find({
        $or: [
          { userId: userId },
          { email: session.user.email.toLowerCase() }
        ],
        jobId: { $nin: ["manual", null, undefined] }
      }).sort({ appliedAt: -1 });
    }

    return NextResponse.json({ ok: true, data: apps });
  } catch (err) {
    //console.error("Fetch Error:", err);
    return NextResponse.json({ ok: false, data: [] }, { status: 500 });
  }
}

// 3. PATCH: For updating status
export async function PATCH(req) {
  try {
    await connectMongo();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing ID or Status" }, { status: 400 });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: updatedApp });
  } catch (err) {
    //console.error("Update PATCH Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 4. DELETE: For deleting application
export async function DELETE(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const deleted = await Application.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Deleted successfully" });
  } catch (err) {
    //console.error("Delete Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}