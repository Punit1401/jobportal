// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import connectMongo from "@/lib/mongodb";
// import Candidate from "@/models/Candidate";
// import fs from "fs";
// import path from "path";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
//     }

//     await connectMongo();

//     // Admin gets all candidates
//     if (session.user.role === "admin") {
//       const candidates = await Candidate.find({})
//         .sort({ createdAt: -1 })
//         .lean();
//       return new Response(JSON.stringify(candidates), { status: 200 });
//     }

//     // Normal user gets own profile
//     const candidate = await Candidate.findOne({
//       userId: session.user.id,
//     }).lean();

//     return new Response(JSON.stringify(candidate), { status: 200 });

//   } catch (error) {
//     console.error("❌ GET Error:", error);
//     return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return new Response(JSON.stringify({ message: "User not logged in" }), { status: 401 });
//     }

//     await connectMongo();
//     const formData = await req.formData();

//     // ===========================
//     // FILE UPLOAD HANDLING
//     // ===========================
//     const fileFields = ["resume", "coverLetter", "experienceLetter"];
//     const uploadedFiles = {};

//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     for (const field of fileFields) {
//       const file = formData.get(field);
//       if (file && file instanceof File && file.name !== "undefined") {
//         const buffer = Buffer.from(await file.arrayBuffer());
//         const fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
//         const filePath = `/uploads/${fileName}`;
//         fs.writeFileSync(path.join(process.cwd(), `public${filePath}`), buffer);
//         uploadedFiles[field] = filePath;
//       }
//     }

//     // ===========================
//     // MAIN DATA MAPPING
//     // ===========================
//     const updateData = {
//       userId: session.user.id,

//       // Basic Info
//       fullName: formData.get("fullName"),
//       //email: formData.get("email")?.trim() || session.user.email,
//       // હવે ઈમેલ યુઝરના ઇનપુટથી નહીં, પણ તેના લોગિન સેશનથી જ સેટ થશે
//       email: session.user.email,
//       mobile: formData.get("mobile"),
//       dob: formData.get("dob"),
//       gender: formData.get("gender"),
//       profession: formData.get("profession"),
//       position: formData.get("position"),
//       // Reference: formData.get("Reference"),

//       // Address
//       pincode: formData.get("pincode")?.trim() || "",
//       state: formData.get("state"),
//       city: formData.get("city"),
//       address: formData.get("address"),
//       reference: formData.get("reference"),

//       // Links
//       github: formData.get("github"),
//       portfolio: formData.get("portfolio"),

//       // Work Experience
//       currentCompanyName: formData.get("currentCompanyName"),
//       jobDepartment: formData.get("jobDepartment"),
//       jobIndustry: formData.get("jobIndustry"),
//       jobFromDate: formData.get("jobFromDate"),
//       jobToDate: formData.get("jobToDate"),
//       jobDescription: formData.get("jobDescription"),
//       presentEmploymentStatus: formData.get("presentEmploymentStatus"),
//       lastSalary: formData.get("lastSalary"),
//       expectedSalary: formData.get("expectedSalary"),
//       noticePeriod: formData.get("noticePeriod"),

//       // Formal Education
//       classXYear: formData.get("classXYear"),
//       classXBoard: formData.get("classXBoard"),
//       classXSchool: formData.get("classXSchool"),
//       classXPercentage: formData.get("classXPercentage"),

//       classXIIYear: formData.get("classXIIYear"),
//       classXIIBoard: formData.get("classXIIBoard"),
//       classXIISchool: formData.get("classXIISchool"),
//       classXIIPercentage: formData.get("classXIIPercentage"),

//       graduationYear: formData.get("graduationYear"),
//       graduationUniversity: formData.get("graduationUniversity"),
//       graduationInstitute: formData.get("graduationInstitute"),
//       graduationSpecialization: formData.get("graduationSpecialization"),
//       graduationPercentage: formData.get("graduationPercentage"),

//       postGraduationYear: formData.get("postGraduationYear"),
//       postGraduationUniversity: formData.get("postGraduationUniversity"),
//       postGraduationInstitute: formData.get("postGraduationInstitute"),
//       postGraduationSpecialization: formData.get("postGraduationSpecialization"),
//       postGraduationPercentage: formData.get("postGraduationPercentage"),

//       // Non Formal
//       itiYear: formData.get("itiYear"),
//       itiUniversity: formData.get("itiUniversity"),
//       itiInstitute: formData.get("itiInstitute"),
//       itiSpecialization: formData.get("itiSpecialization"),
//       itiPercentage: formData.get("itiPercentage"),

//       diplomaYear: formData.get("diplomaYear"),
//       diplomaUniversity: formData.get("diplomaUniversity"),
//       diplomaInstitute: formData.get("diplomaInstitute"),
//       diplomaSpecialization: formData.get("diplomaSpecialization"),
//       diplomaPercentage: formData.get("diplomaPercentage"),

//       pgDiplomaYear: formData.get("pgDiplomaYear"),
//       pgDiplomaUniversity: formData.get("pgDiplomaUniversity"),
//       pgDiplomaInstitute: formData.get("pgDiplomaInstitute"),
//       pgDiplomaSpecialization: formData.get("pgDiplomaSpecialization"),
//       pgDiplomaPercentage: formData.get("pgDiplomaPercentage"),

//       internshipDetails: formData.get("internshipDetails"),
//       projectsDetails: formData.get("projectsDetails"),
//       apprenticeDetails: formData.get("apprenticeDetails"),

//       ...uploadedFiles,
//     };

//     // ===========================
//     // Skills Parsing
//     // ===========================
//     try {
//       const skillsRaw = formData.get("skills");
//       updateData.skills = skillsRaw ? skillsRaw.split(",").map(skill => skill.trim()) : [];
//     } catch {
//       updateData.skills = [];
//     }

//     // ===========================
//     // Awards Parsing
//     // ===========================
//     try {
//       const awardsRaw = formData.get("awards");
//       updateData.awards = awardsRaw ? JSON.parse(awardsRaw) : [];
//     } catch {
//       updateData.awards = [];
//     }

//     const candidate = await Candidate.findOneAndUpdate(
//       { userId: session.user.id },
//       { $set: updateData },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return new Response(JSON.stringify(candidate), { status: 201 });

//   } catch (error) {
//     console.error("❌ POST Error:", error);
//     return new Response(
//       JSON.stringify({ message: "Server Error", error: error.message }),
//       { status: 500 }
//     );
//   }
// }
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import connectMongo from "@/lib/mongodb";
// import Candidate from "@/models/Candidate";
// import fs from "fs";
// import path from "path";

// export const dynamic = "force-dynamic";

// // ====================== GET ======================
// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
//     }

//     await connectMongo();

//     if (session.user.role === "admin") {
//       const candidates = await Candidate.find({}).sort({ createdAt: -1 }).lean();
//       return new Response(JSON.stringify(candidates), { status: 200 });
//     }

//     const candidate = await Candidate.findOne({
//       userId: session.user.id,
//     }).lean();

//     return new Response(JSON.stringify(candidate), { status: 200 });

//   } catch (error) {
//     console.error("❌ GET Error:", error);
//     return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
//   }
// }

// // ====================== POST ======================
// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
//     }

//     await connectMongo();
//     const formData = await req.formData();

//     // ================= FILE UPLOAD =================
//     const fileFields = ["resume", "coverLetter", "experienceLetter"];
//     const uploadedFiles = {};

//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     for (const field of fileFields) {
//       const file = formData.get(field);

//       if (file && typeof file === "object" && file.name) {
//         const buffer = Buffer.from(await file.arrayBuffer());
//         const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
//         const filePath = `/uploads/${fileName}`;

//         fs.writeFileSync(path.join(process.cwd(), `public${filePath}`), buffer);
//         uploadedFiles[field] = filePath;
//       }
//     }

//     // ================= ARRAY PARSING =================
//     let workExperiences = [];
//     let formalEducations = [];
//     let nonFormalEducations = [];

//     try {
//       workExperiences = JSON.parse(formData.get("workExperiences") || "[]");
//     } catch { }

//     try {
//       formalEducations = JSON.parse(formData.get("formalEducations") || "[]");
//     } catch { }

//     try {
//       nonFormalEducations = JSON.parse(formData.get("nonFormalEducations") || "[]");
//     } catch { }

//     // ================= MAIN DATA =================
//     const updateData = {
//       userId: session.user.id,

//       // Basic Info
//       fullName: formData.get("fullName"),
//       email: session.user.email,
//       mobile: formData.get("mobile"),
//       dob: formData.get("dob"),
//       gender: formData.get("gender"),
//       profession: formData.get("profession"),
//       position: formData.get("position"),
//       Reference: formData.get("reference"), // FIX

//       // Address
//       pincode: formData.get("pincode") || "",
//       state: formData.get("state"),
//       city: formData.get("city"),
//       address: formData.get("address"),

//       // Links
//       github: formData.get("github"),
//       portfolio: formData.get("portfolio"),

//       // Skills
//       skills: [],
//       awards: [],

//       // OLD WORK (keep for compatibility)
//       currentCompanyName: formData.get("currentCompanyName"),
//       jobDepartment: formData.get("jobDepartment"),
//       jobIndustry: formData.get("jobIndustry"),
//       jobFromDate: formData.get("jobFromDate"),
//       jobToDate: formData.get("jobToDate"),
//       jobDescription: formData.get("jobDescription"),
//       presentEmploymentStatus: formData.get("presentEmploymentStatus"),
//       lastSalary: formData.get("lastSalary"),
//       expectedSalary: formData.get("expectedSalary"),
//       noticePeriod: formData.get("noticePeriod"),

//       // Education (old fields)
//       classXYear: formData.get("classXYear"),
//       classXBoard: formData.get("classXBoard"),
//       classXSchool: formData.get("classXSchool"),
//       classXPercentage: formData.get("classXPercentage"),

//       classXIIYear: formData.get("classXIIYear"),
//       classXIIBoard: formData.get("classXIIBoard"),
//       classXIISchool: formData.get("classXIISchool"),
//       classXIIPercentage: formData.get("classXIIPercentage"),

//       // NEW ARRAYS (IMPORTANT FIX 🔥)
//       workExperiences,
//       formalEducations,
//       nonFormalEducations,

//       ...uploadedFiles,
//     };

//     // ================= SKILLS =================
//     try {
//       const skillsRaw = formData.get("skills");
//       updateData.skills = skillsRaw
//         ? JSON.parse(skillsRaw)
//         : [];
//     } catch {
//       updateData.skills = [];
//     }

//     // ================= AWARDS =================
//     try {
//       const awardsRaw = formData.get("awards");
//       updateData.awards = awardsRaw
//         ? JSON.parse(awardsRaw)
//         : [];
//     } catch {
//       updateData.awards = [];
//     }

//     // ================= SAVE =================
//     const candidate = await Candidate.findOneAndUpdate(
//       { userId: session.user.id },
//       { $set: updateData },
//       { new: true, upsert: true }
//     );

//     return new Response(JSON.stringify(candidate), { status: 200 });

//   } catch (error) {
//     console.error("❌ POST Error:", error);
//     return new Response(
//       JSON.stringify({ message: "Server Error", error: error.message }),
//       { status: 500 }
//     );
//   }
// }
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// ====================== GET ======================
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();

    if (session.user.role === "admin") {
      const candidates = await Candidate.find({}).sort({ createdAt: -1 }).lean();
      return new Response(JSON.stringify(candidates), { status: 200 });
    }

    const candidate = await Candidate.findOne({
      userId: session.user.id,
    }).lean();

    return new Response(JSON.stringify(candidate), { status: 200 });

  } catch (error) {
    console.error("❌ GET Error:", error);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}

// ====================== POST ======================
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();
    const formData = await req.formData();

    // ================= FILE UPLOAD =================
    const fileFields = ["resume", "coverLetter", "experienceLetter"];
    const uploadedFiles = {};

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const field of fileFields) {
      const file = formData.get(field);

      if (file && typeof file === "object" && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const filePath = `/uploads/${fileName}`;

        fs.writeFileSync(path.join(process.cwd(), `public${filePath}`), buffer);
        uploadedFiles[field] = filePath;
      }
    }

    // ================= ARRAY PARSING =================
    let workExperiences = [];
    let formalEducations = [];
    let nonFormalEducations = [];

    try {
      workExperiences = JSON.parse(formData.get("workExperiences") || "[]");
    } catch { }

    try {
      formalEducations = JSON.parse(formData.get("formalEducations") || "[]");
    } catch { }

    try {
      nonFormalEducations = JSON.parse(formData.get("nonFormalEducations") || "[]");
    } catch { }

    // ================= MAIN DATA =================
    const updateData = {
      userId: session.user.id,

      // Basic Info
      fullName: formData.get("fullName"),
      email: session.user.email,
      mobile: formData.get("mobile"),
      dob: formData.get("dob"),
      gender: formData.get("gender"),
      profession: formData.get("profession"),
      position: formData.get("position"),
      Reference: formData.get("reference"), // FIX

      // Address
      pincode: formData.get("pincode") || "",
      state: formData.get("state"),
      city: formData.get("city"),
      address: formData.get("address"),

      // Links
      github: formData.get("github"),
      portfolio: formData.get("portfolio"),

      // Skills
      skills: [],
      awards: [],

      // OLD WORK (keep for compatibility)
      currentCompanyName: formData.get("currentCompanyName"),
      jobDepartment: formData.get("jobDepartment"),
      jobIndustry: formData.get("jobIndustry"),
      jobFromDate: formData.get("jobFromDate"),
      jobToDate: formData.get("jobToDate"),
      jobDescription: formData.get("jobDescription"),
      presentEmploymentStatus: formData.get("presentEmploymentStatus"),
      lastSalary: formData.get("lastSalary"),
      expectedSalary: formData.get("expectedSalary"),
      noticePeriod: formData.get("noticePeriod"),

      // Education (old fields)
      classXYear: formData.get("classXYear"),
      classXBoard: formData.get("classXBoard"),
      classXSchool: formData.get("classXSchool"),
      classXPercentage: formData.get("classXPercentage"),

      classXIIYear: formData.get("classXIIYear"),
      classXIIBoard: formData.get("classXIIBoard"),
      classXIISchool: formData.get("classXIISchool"),
      classXIIPercentage: formData.get("classXIIPercentage"),

      // NEW ARRAYS (IMPORTANT FIX 🔥)
      workExperiences,
      formalEducations,
      nonFormalEducations,

      ...uploadedFiles,
    };

    // ================= SKILLS =================
    try {
      const skillsRaw = formData.get("skills");
      updateData.skills = skillsRaw
        ? JSON.parse(skillsRaw)
        : [];
    } catch {
      updateData.skills = [];
    }

    // ================= AWARDS =================
    try {
      const awardsRaw = formData.get("awards");
      updateData.awards = awardsRaw
        ? JSON.parse(awardsRaw)
        : [];
    } catch {
      updateData.awards = [];
    }

    // ================= URGENT NOTIFICATION LOGIC (NO JOB STATUS) =================
    // Read from the first work experience entry since flat presentEmploymentStatus is no longer sent directly
    const firstWorkExp = workExperiences[0] || {};
    const currentStatus = firstWorkExp.presentEmploymentStatus || formData.get("presentEmploymentStatus");

    // Sync legacy flat properties from arrays for backward compatibility
    updateData.currentCompanyName = updateData.currentCompanyName || firstWorkExp.currentCompanyName;
    updateData.jobDepartment = updateData.jobDepartment || firstWorkExp.jobDepartment;
    updateData.jobIndustry = updateData.jobIndustry || firstWorkExp.jobIndustry;
    updateData.jobFromDate = updateData.jobFromDate || firstWorkExp.jobFromDate;
    updateData.jobToDate = updateData.jobToDate || firstWorkExp.jobToDate;
    updateData.jobDescription = updateData.jobDescription || firstWorkExp.jobDescription;
    updateData.presentEmploymentStatus = currentStatus;
    updateData.lastSalary = updateData.lastSalary || firstWorkExp.lastSalary;
    updateData.expectedSalary = updateData.expectedSalary || firstWorkExp.expectedSalary;
    updateData.noticePeriod = updateData.noticePeriod || firstWorkExp.noticePeriod;

    // Sync legacy education properties for backward compatibility
    const graduationExp = formalEducations.find(e => e.type === "Graduation") || {};
    const pgExp = formalEducations.find(e => e.type === "Post Graduation") || {};
    const pgDiplomaExp = formalEducations.find(e => e.type === "PG Diploma") || {};

    updateData.graduationYear = updateData.graduationYear || graduationExp.year;
    updateData.graduationUniversity = updateData.graduationUniversity || graduationExp.university;
    updateData.graduationInstitute = updateData.graduationInstitute || graduationExp.institute;
    updateData.graduationSpecialization = updateData.graduationSpecialization || graduationExp.specialization;
    updateData.graduationPercentage = updateData.graduationPercentage || graduationExp.percentage;

    updateData.postGraduationYear = updateData.postGraduationYear || pgExp.year;
    updateData.postGraduationUniversity = updateData.postGraduationUniversity || pgExp.university;
    updateData.postGraduationInstitute = updateData.postGraduationInstitute || pgExp.institute;
    updateData.postGraduationSpecialization = updateData.postGraduationSpecialization || pgExp.specialization;
    updateData.postGraduationPercentage = updateData.postGraduationPercentage || pgExp.percentage;

    const itiExp = nonFormalEducations.find(e => e.type === "ITI") || {};
    const diplomaExp = nonFormalEducations.find(e => e.type === "Diploma") || {};

    updateData.itiYear = updateData.itiYear || itiExp.year;
    updateData.itiUniversity = updateData.itiUniversity || itiExp.university;
    updateData.itiInstitute = updateData.itiInstitute || itiExp.institute;
    updateData.itiSpecialization = updateData.itiSpecialization || itiExp.specialization;
    updateData.itiPercentage = updateData.itiPercentage || itiExp.percentage;

    updateData.diplomaYear = updateData.diplomaYear || diplomaExp.year;
    updateData.diplomaUniversity = updateData.diplomaUniversity || diplomaExp.university;
    updateData.diplomaInstitute = updateData.diplomaInstitute || diplomaExp.institute;
    updateData.diplomaSpecialization = updateData.diplomaSpecialization || diplomaExp.specialization;
    updateData.diplomaPercentage = updateData.diplomaPercentage || diplomaExp.percentage;

    // પેલા જૂનો ડેટા મેળવો જેથી લિમિટ ચેક કરી શકાય
    const existingCandidate = await Candidate.findOne({ userId: session.user.id });

    if (currentStatus === "No Job") {
      updateData.employmentStatusUpdatedAt = new Date();

      // જો સ્ટેટસ બદલાયું હોય અથવા પહેલી વાર "No Job" થયું હોય
      if (!existingCandidate || existingCandidate.presentEmploymentStatus !== "No Job") {

        const now = new Date();
        let currentBlastCount = existingCandidate?.urgentJobBlastCount || 0;
        let lastBlastDate = existingCandidate?.lastBlastDate;

        // જો છેલ્લો બ્લાસ્ટ 1 વર્ષ પહેલા થયો હોય, તો કાઉન્ટ રીસેટ કરો
        if (lastBlastDate) {
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          if (new Date(lastBlastDate) < oneYearAgo) {
            currentBlastCount = 0;
          }
        }

        // લિમિટ ચેક કરો (૧ વર્ષમાં ૧ વાર)
        if (currentBlastCount < 1) {
          updateData.urgentJobBlastCount = currentBlastCount + 1;
          updateData.lastBlastDate = now;

          // --- Notification Blast Logic ---
          try {
            // 1. Get all regular users/candidates
            const regularUsers = await User.find({ 
              _id: { $ne: session.user.id } 
            }).select("_id role");

            // 2. Get all recruiters from the Recruiter model
            const allRecruiters = await Recruiter.find({
              _id: { $ne: session.user.id }
            }).select("_id role");

            // 3. Combine both lists
            const recipients = [...regularUsers, ...allRecruiters];

            if (recipients.length > 0) {
              const notificationData = recipients.map(r => {
                // Default link for other users/candidates
                let actionLink = "/careers";
                
                // Direct search link for Recruiters (either from User role or Recruiter model)
                if (r.role === "recruiter") {
                   actionLink = `/recruiter/candidate?search=${encodeURIComponent(updateData.fullName)}`;
                }

                return {
                  senderId: session.user.id,
                  senderRole: "System",
                  recipientId: r._id,
                  title: "🚨 URGENT: Job Seeker Alert (No Job)",
                  message: `Candidate Name: ${updateData.fullName}\nEmail: ${session.user.email}\n\nMessage: I am urgently looking for a job and am available for immediate join.`,
                  type: "JobAlert",
                  link: actionLink
                };
              });

              // Batch insert for better performance
              await Notification.insertMany(notificationData);
              console.log(`✅ [BROADCAST SUCCESS] Notification Sent to ${recipients.length} recipients (Users + Recruiters)!`);
            }
          } catch (notifErr) {
            console.error("❌ Notification Blast Error:", notifErr);
          }
        } else {
          console.log("⚠️ Blast Limit Exceeded for this year.");
          // We might want to return an error or a message to the user, 
          // but for now, we'll just not send the notification.
        }
      }
    }

    // ================= SAVE =================
    const candidate = await Candidate.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify(candidate), { status: 200 });

  } catch (error) {
    console.error("❌ POST Error:", error);
    return new Response(
      JSON.stringify({ message: "Server Error", error: error.message }),
      { status: 500 }
    );
  }
}