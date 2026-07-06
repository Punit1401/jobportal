// import { NextResponse } from "next/server";
// import connectMongo from "@/lib/mongodb";
// import Job from "@/models/Job"; // તમારું Job મોડેલ
// import Application from "@/models/Application";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function GET(req) {
//   try {
//     await connectMongo();
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== "recruiter") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const recruiterId = session.user.id;

//     // 1. બધી જોબ્સ શોધો જે આ રિક્રુટરની છે
//     const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 });

//     // 2. આ રિક્રુટરની જોબ્સ પર આવેલી કુલ એપ્લિકેશન્સ ગણો
//     const appsCount = await Application.countDocuments({ recruiterId });

//     // 3. પેન્ડિંગ એપ્લિકેશન્સ ગણો
//     const pendingCount = await Application.countDocuments({ 
//       recruiterId, 
//       status: { $regex: /pending/i } 
//     });

//     return NextResponse.json({
//       success: true,
//       stats: {
//         jobsCount: jobs.length,
//         appsCount: appsCount,
//         pendingCount: pendingCount,
//         hiredCount: await Application.countDocuments({ recruiterId, status: { $regex: /approved/i } })
//       },
//       recentJobs: jobs.slice(0, 5), // છેલ્લી 5 જોબ્સ
//     });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    // સેસન ચેક કરો
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ખાતરી કરો કે ID પ્રોપર Format માં છે (String to ObjectId)
    const recruiterId = session.user.id;

    // 1. આ રિક્રુટરની બધી જોબ્સ શોધો
    const jobs = await Job.find({ recruiterId: recruiterId }).sort({ createdAt: -1 });
    const jobIds = jobs.map(job => job._id);

    // 2. જો જોબ્સ જ ના હોય તો સ્ટેટ્સ 0 મોકલો
    if (jobIds.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          jobsCount: 0,
          appsCount: 0,
          pendingCount: 0,
          hiredCount: 0
        },
        recentJobs: [],
      });
    }

    // 3. આ બધી જોબ્સ પર આવેલી એપ્લિકેશન્સ ગણો (jobId ના આધારે)
    // કારણ કે Application મોડેલમાં recruiterId ના બદલે jobId હોવાની શક્યતા વધુ છે
    const appsCount = await Application.countDocuments({ jobId: { $in: jobIds } });

    const pendingCount = await Application.status ?
      await Application.countDocuments({
        jobId: { $in: jobIds },
        status: { $regex: /pending/i }
      }) : 0;

    const hiredCount = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: { $regex: /approved|hired/i }
    });

    return NextResponse.json({
      success: true,
      stats: {
        jobsCount: jobs.length,
        appsCount: appsCount,
        pendingCount: pendingCount,
        hiredCount: hiredCount
      },
      recentJobs: jobs.slice(0, 5), // છેલ્લી 5 જોબ્સ
    });

  } catch (err) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}