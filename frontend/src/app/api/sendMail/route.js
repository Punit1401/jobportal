// // frontend/src/app/api/sendMail/route.js
// import nodemailer from "nodemailer";
// import connectMongo from "@/lib/mongodb";
// import Application from "@/models/Application";
// import Candidate from "@/models/Candidate";
// import User from "@/models/User";
// import candidateJob from "@/models/CandidateJob";
// import ExcelCandidate from "@/models/ExcelCandidate";
// import EmailQueue from "@/models/EmailQueue";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     await connectMongo();

//     const {
//       subject,
//       message,
//       userIds,
//       allUsers,
//       type,
//       emails = []
//     } = await req.json();

//     if (!subject || !message) {
//       return NextResponse.json(
//         { error: "Missing subject or message" },
//         { status: 400 }
//       );
//     }

//     let users = [];

//     // ---------------------------------
//     // FETCH USERS BASED ON TYPE
//     // ---------------------------------
//     if (type === "excel-candidates") {
//       if (allUsers)
//         users = await ExcelCandidate.find({}, "email unsubscribed mailCount");
//       else if (userIds?.length)
//         users = await ExcelCandidate.find(
//           { _id: { $in: userIds } },
//           "email unsubscribed mailCount"
//         );
//     }

//     else if (type === "candidates") {
//       if (allUsers)
//         users = await Candidate.find({}, "email unsubscribed mailCount");
//       else if (userIds?.length)
//         users = await Candidate.find(
//           { _id: { $in: userIds } },
//           "email unsubscribed mailCount"
//         );
//     }

//     else {
//       if (allUsers)
//         users = await Application.find({}, "email");
//       else if (userIds?.length)
//         users = await Application.find({ _id: { $in: userIds } }, "email");
//     }

//     const dbEmails = users.map(u => u.email).filter(Boolean);
//     const allEmails = Array.from(new Set([...dbEmails, ...emails]));

//     if (allEmails.length === 0)
//       return NextResponse.json({ error: "No valid email addresses found" });

//     // ---------------------------------
//     // REMOVE UNSUBSCRIBED USERS
//     // ---------------------------------
//     let finalEmails = allEmails;

//     if (type === "candidates" || type === "excel-candidates") {
//       const unsubscribedEmails = users
//         .filter(u => u.unsubscribed === true)
//         .map(u => u.email);

//       finalEmails = finalEmails.filter(
//         (email) => !unsubscribedEmails.includes(email)
//       );
//     }

//     if (finalEmails.length === 0) {
//       return NextResponse.json({
//         error: "All selected users are unsubscribed"
//       });
//     }

//     // ---------------------------------
//     // SEND EMAIL
//     // ---------------------------------
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"ShivEn Group Admin" <${process.env.EMAIL_USER}>`,
//       to: finalEmails.join(","),
//       subject,
//       html: `
//         <div style="font-family:sans-serif">
//           <p>${message.replace(/\n/g, "<br/>")}</p>
//           <hr/>
//           <p style="font-size:12px;color:#777">
//             This email was sent from ShivEn Group Admin.
//           </p>
//         </div>
//       `,
//     });

//     // ---------------------------------
//     // UPDATE MAIL COUNT
//     // ---------------------------------
//     if (type === "excel-candidates") {
//       await ExcelCandidate.updateMany(
//         { email: { $in: finalEmails } },
//         { $inc: { mailCount: 1 } }
//       );
//     }

//     if (type === "candidates") {
//       await Candidate.updateMany(
//         { email: { $in: finalEmails } },
//         { $inc: { mailCount: 1 } }
//       );
//     }

//     // ---------------------------------
//     // REMOVE FROM EXCEL + EMAIL QUEUE IF REGISTERED USER
//     // ---------------------------------
//     const registeredApplications = await Application.find(
//       { email: { $in: finalEmails } },
//       "email"
//     );

//     const registeredUsers = await User.find(
//       { email: { $in: finalEmails } },
//       "email"
//     );

//     const registeredEmails = [
//       ...registeredApplications.map(u => u.email),
//       ...registeredUsers.map(u => u.email)
//     ];

//     if (registeredEmails.length > 0) {
//       // REMOVE FROM ExcelCandidate (ONLY UNREGISTERED LIST)
//       await ExcelCandidate.deleteMany({ email: { $in: registeredEmails } });

//       // REMOVE FROM EmailQueue
//       await EmailQueue.deleteMany({ email: { $in: registeredEmails } });


//     }

//     return NextResponse.json({
//       success: true,
//       message: "Email sent successfully!",
//       sentTo: finalEmails.length,
//     });

//   } catch (err) {
//     console.error("Send mail error:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to send mail" },
//       { status: 500 }
//     );
//   }
// }
// // frontend/src/app/api/sendMail/route.js
// import nodemailer from "nodemailer";
// import connectMongo from "@/lib/mongodb";
// import Application from "@/models/Application";
// import Candidate from "@/models/Candidate";
// import User from "@/models/User";
// import candidateJob from "@/models/CandidateJob";
// import Job from "@/models/Job";
// import ExcelCandidate from "@/models/ExcelCandidate";
// import EmailQueue from "@/models/EmailQueue";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     await connectMongo();

//     const {
//       subject,
//       message,
//       userIds,
//       allUsers,
//       type,
//       emails = []
//     } = await req.json();

//     if (!subject || !message) {
//       return NextResponse.json(
//         { error: "Missing subject or message" },
//         { status: 400 }
//       );
//     }

//     let users = [];

//     // ---------------------------------
//     // FETCH USERS BASED ON TYPE
//     // ---------------------------------
//     if (type === "excel-candidates") {
//       if (allUsers)
//         users = await ExcelCandidate.find({}, "email unsubscribed mailCount");
//       else if (userIds?.length)
//         users = await ExcelCandidate.find(
//           { _id: { $in: userIds } },
//           "email unsubscribed mailCount"
//         );
//     }

//     else if (type === "candidates") {
//       if (allUsers)
//         users = await Candidate.find({}, "email unsubscribed mailCount");
//       else if (userIds?.length)
//         users = await Candidate.find(
//           { _id: { $in: userIds } },
//           "email unsubscribed mailCount"
//         );
//     }

//     else {
//       // ✅ FIX: Job અને CandidateJob બંને મોડલમાંથી ડેટા શોધવા માટે
//       const query = allUsers ? {} : { _id: { $in: userIds } };

//       const jobsData = await Job.find(query, "email companyDetails");
//       const candidateJobsData = await candidateJob.find(query, "email companyDetails");

//       // બંને મોડલના ડેટાને ભેગા કર્યા
//       users = [...jobsData, ...candidateJobsData];
//     }

//     // ✅ FIX: ઈમેલ મેળવવાનું લોજિક (Nested fields માટે પણ)
//     const dbEmails = users.map(u => {
//       return u.email || 
//              u.companyDetails?.contactPersonEmail || 
//              u.companyDetails?.ownerEmail || 
//              u.companyDetails?.email;
//     }).filter(Boolean);

//     const allEmails = Array.from(new Set([...dbEmails, ...emails]));

//     if (allEmails.length === 0)
//       return NextResponse.json({ error: "No valid email addresses found" });

//     // ---------------------------------
//     // REMOVE UNSUBSCRIBED USERS
//     // ---------------------------------
//     let finalEmails = allEmails;

//     if (type === "candidates" || type === "excel-candidates") {
//       const unsubscribedEmails = users
//         .filter(u => u.unsubscribed === true)
//         .map(u => u.email);

//       finalEmails = finalEmails.filter(
//         (email) => !unsubscribedEmails.includes(email)
//       );
//     }

//     if (finalEmails.length === 0) {
//       return NextResponse.json({
//         error: "All selected users are unsubscribed"
//       });
//     }

//     // ---------------------------------
//     // SEND EMAIL
//     // ---------------------------------
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//      await transporter.sendMail({
//        from: `"ShivEn Group Admin" <${process.env.EMAIL_USER}>`,
//        to: finalEmails.join(","),
//        subject,
//        html: `  
//          <div style="font-family:sans-serif">
//            <p>${message.replace(/\n/g, "<br/>")}</p>
//            <hr/>
//            <p style="font-size:12px;color:#777">
//              This email was sent from ShivEn Group Admin.
//            </p>
//          </div>
//        `,
//      });
//     // ... બાકીનો કોડ સેમ રહેશે ...

//   // await transporter.sendMail({
//   //   from: `"ShivEn Group Admin" <${process.env.EMAIL_USER}>`,
//   //   to: finalEmails.join(","), // નોંધ: Bulk mail માટે BCC વાપરવું હિતાવહ છે, પણ અત્યારે આ ચાલશે
//   //   subject,
//   //   html: `
//   //     <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
//   //       <div style="margin-bottom: 30px;">
//   //         ${message} 
//   //       </div>
//   //       <hr style="border: none; border-top: 1px solid #eee;" />
//   //       <div style="font-size: 11px; color: #999; text-align: center; margin-top: 20px;">
//   //         <p>You received this email because you are registered with ShivEn Group.</p>
//   //         <p>
//   //           <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe" style="color: #6366f1; text-decoration: underline;">Unsubscribe from this list</a>
//   //         </p>
//   //         <p>&copy; 2026 ShivEn Group. All rights reserved.</p>
//   //       </div>
//   //     </div>
//   //   `,
//   // });

// // ... બાકીનો કોડ સેમ રહેશે ...

//     // ---------------------------------
//     // UPDATE MAIL COUNT
//     // ---------------------------------
//     if (type === "excel-candidates") {
//       await ExcelCandidate.updateMany(
//         { email: { $in: finalEmails } },
//         { $inc: { mailCount: 1 } }
//       );
//     }

//     if (type === "candidates") {
//       await Candidate.updateMany(
//         { email: { $in: finalEmails } },
//         { $inc: { mailCount: 1 } }
//       );
//     }

//     // ---------------------------------
//     // REMOVE FROM EXCEL + EMAIL QUEUE IF REGISTERED USER
//     // ---------------------------------
//     const registeredApplications = await Application.find(
//       { email: { $in: finalEmails } },
//       "email"
//     );

//     const registeredUsers = await User.find(
//       { email: { $in: finalEmails } },
//       "email"
//     );

//     const registeredEmails = [
//       ...registeredApplications.map(u => u.email),
//       ...registeredUsers.map(u => u.email)
//     ];

//     if (registeredEmails.length > 0) {
//       await ExcelCandidate.deleteMany({ email: { $in: registeredEmails } });
//       await EmailQueue.deleteMany({ email: { $in: registeredEmails } });
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Email sent successfully!",
//       sentTo: finalEmails.length,
//     });

//   } catch (err) {
//     console.error("Send mail error:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to send mail" },
//       { status: 500 }
//     );
//   }
// }
import nodemailer from "nodemailer";
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import candidateJob from "@/models/CandidateJob";
import Job from "@/models/Job";
import ExcelCandidate from "@/models/ExcelCandidate";
import EmailQueue from "@/models/EmailQueue";
import { ScheduledMail } from "@/models/Mailing"; // ✅ Added for History
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const {
      subject,
      message,
      userIds,
      allUsers,
      type,
      emails = []
    } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Missing subject or message" },
        { status: 400 }
      );
    }

    let users = [];

    // ---------------------------------
    // FETCH USERS BASED ON TYPE
    // ---------------------------------
    if (type === "excel-candidates") {
      if (allUsers)
        users = await ExcelCandidate.find({}, "email unsubscribed mailCount");
      else if (userIds?.length)
        users = await ExcelCandidate.find(
          { _id: { $in: userIds } },
          "email unsubscribed mailCount"
        );
    }

    else if (type === "candidates") {
      if (allUsers)
        users = await Candidate.find({}, "email unsubscribed mailCount");
      else if (userIds?.length)
        users = await Candidate.find(
          { _id: { $in: userIds } },
          "email unsubscribed mailCount"
        );
    }

    else {
      const query = allUsers ? {} : { _id: { $in: userIds } };
      const jobsData = await Job.find(query, "email companyDetails");
      const candidateJobsData = await candidateJob.find(query, "email companyDetails");
      users = [...jobsData, ...candidateJobsData];
    }

    const dbEmails = users.map(u => {
      return u.email ||
        u.companyDetails?.contactPersonEmail ||
        u.companyDetails?.ownerEmail ||
        u.companyDetails?.email;
    }).filter(Boolean);

    const allEmails = Array.from(new Set([...dbEmails, ...emails]));

    if (allEmails.length === 0)
      return NextResponse.json({ error: "No valid email addresses found" });

    let finalEmails = allEmails;

    if (type === "candidates" || type === "excel-candidates") {
      const unsubscribedEmails = users
        .filter(u => u.unsubscribed === true)
        .map(u => u.email);

      finalEmails = finalEmails.filter(
        (email) => !unsubscribedEmails.includes(email)
      );
    }

    if (finalEmails.length === 0) {
      return NextResponse.json({
        error: "All selected users are unsubscribed"
      });
    }

    // ---------------------------------
    // ✅ HISTORY ENTRY (મેઈલ મોકલતા પહેલા સેવ કરો જેથી ડેટા લોસ ના થાય)
    // ---------------------------------
    const mailRecord = await ScheduledMail.create({
      subject,
      message,
      targetType: req.body.type, // 'custom', 'candidate' વગેરે
      userIds: req.body.userIds, // સિલેક્ટ કરેલા IDs
      isSent: true,
      recipientsCount: finalEmails.length,
      sentEmails: finalEmails,
      failedEmails: [],
      scheduledTime: new Date(),
      createdAt: new Date()
    });

    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/track/${mailRecord._id}`;

    // ---------------------------------
    // SEND EMAIL
    // ---------------------------------
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.verify();

      await transporter.sendMail({
        from: `"ShivEn Group Admin" <${process.env.EMAIL_USER}>`,
        to: finalEmails[0],
        bcc: finalEmails.slice(1),
        subject,
        html: `  
            <div style="font-family:sans-serif">
              <p>${message.replace(/\n/g, "<br/>")}</p>
              <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
              <hr/>
              <p style="font-size:12px;color:#777">
                This email was sent from ShivEn Group Admin.
              </p>
            </div>
          `,
      });
    } catch (verifyErr) {
      console.error("Nodemailer Error:", verifyErr);
      // જો મેઈલ મોકલવામાં ભૂલ આવે તો રેકોર્ડ અપડેટ કરો
      await ScheduledMail.findByIdAndUpdate(mailRecord._id, { isSent: false });
      return NextResponse.json({ error: "Email Sending Failed: " + verifyErr.message }, { status: 500 });
    }

    // ---------------------------------
    // UPDATE MAIL COUNT & CLEANUP
    // ---------------------------------
    if (type === "excel-candidates") {
      await ExcelCandidate.updateMany(
        { email: { $in: finalEmails } },
        { $inc: { mailCount: 1 } }
      );
    }

    if (type === "candidates") {
      await Candidate.updateMany(
        { email: { $in: finalEmails } },
        { $inc: { mailCount: 1 } }
      );
    }

    const registeredApplications = await Application.find(
      { email: { $in: finalEmails } },
      "email"
    );

    const registeredUsers = await User.find(
      { email: { $in: finalEmails } },
      "email"
    );

    const registeredEmails = [
      ...registeredApplications.map(u => u.email),
      ...registeredUsers.map(u => u.email)
    ];

    if (registeredEmails.length > 0) {
      await ExcelCandidate.deleteMany({ email: { $in: registeredEmails } });
      await EmailQueue.deleteMany({ email: { $in: registeredEmails } });
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      sentTo: finalEmails.length,
    });

  } catch (err) {
    console.error("Send mail error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send mail" },
      { status: 500 }
    );
  }
}