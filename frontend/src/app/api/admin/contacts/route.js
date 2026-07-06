import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import Candidate from "@/models/Candidate";
import CandidateJob from "@/models/CandidateJob";
import AdminModuleItem from "@/models/AdminModuleItem";

export async function GET() {
  try {
    await connectMongo();

    // 1. Fetch all Recruiters
    const recruiters = await Recruiter.find({}).lean();
    
    // 2. Fetch all Service Providers
    const serviceProviders = await ServiceProvider.find({}).lean();

    // 3. Fetch all Candidates
    const candidates = await Candidate.find({}).lean();

    // 4. Fetch all Candidate Jobs (for extraction of hidden contacts)
    const candidateJobs = await CandidateJob.find({}).lean();

    // 5. Fetch Manual Contacts
    const manualContacts = await AdminModuleItem.find({ moduleKey: "contact-management" }).lean();

    const contactsMap = new Map();

    // Helper to add contact with deduplication
    const addContact = (email, phone, data) => {
      const emailKey = email?.toLowerCase()?.trim();
      const phoneKey = phone?.toString()?.trim();
      
      const key = emailKey || phoneKey;
      if (!key || key === "n/a") return;

      if (!contactsMap.has(key)) {
        contactsMap.set(key, {
          name: data.name || "N/A",
          email: emailKey || "N/A",
          phone: phoneKey || "N/A",
          role: data.role || "N/A",
          company: data.company || "N/A",
          source: data.source || "N/A",
          location: data.location || "N/A",
          details: data.details || {},
          createdAt: data.createdAt || new Date()
        });
      }
    };

    // Process Manual Contacts
    manualContacts.forEach(mc => {
      addContact(mc.meta?.email, mc.meta?.phone, {
        name: mc.title || mc.meta?.contactName,
        role: "Manual",
        company: "N/A",
        source: "Manual Entry",
        location: "N/A",
        createdAt: mc.createdAt,
        details: { description: mc.description }
      });
    });

    // Process Recruiters
    recruiters.forEach(r => {
      addContact(r.email, r.mobile, {
        name: r.fullName,
        role: "Recruiter",
        company: r.companyName,
        source: "Recruiter Registration",
        location: r.location || r.city,
        createdAt: r.createdAt,
        details: { designation: r.designation, recruiterType: r.recruiterType }
      });
    });

    // Process Service Providers
    serviceProviders.forEach(sp => {
      addContact(sp.email, sp.mobile, {
        name: sp.fullName,
        role: "ServiceProvider",
        company: sp.providerName || "Service Business",
        source: "SP Registration",
        location: sp.location,
        createdAt: sp.createdAt,
        details: { category: sp.serviceCategory, experience: sp.experience }
      });
    });

    // Process Candidates
    candidates.forEach(c => {
      addContact(c.email, c.mobile, {
        name: c.fullName,
        role: "Candidate",
        company: "Individual",
        source: "Candidate Profile",
        location: c.city || c.state,
        createdAt: c.createdAt,
        details: { profession: c.profession, position: c.position }
      });
    });

    // Process Candidate Jobs (Company Details, Apply Here, and Poster)
    candidateJobs.forEach(cj => {
      // 1. From Company Details (General)
      if (cj.companyDetails) {
        const companyEmail = cj.companyDetails.email || cj.companyDetails.contactPersonEmail;
        const companyPhone = cj.companyDetails.mobile || cj.companyDetails.contactPersonNumber || cj.companyDetails.phone;

        if (companyEmail || companyPhone) {
          addContact(companyEmail, companyPhone, {
            name: cj.companyDetails.contactPersonName || cj.companyDetails.companyName || "Company Contact",
            role: "Candidate Job (Company)",
            company: cj.companyDetails.companyName || "N/A",
            source: "Job Post - Company Section",
            location: cj.companyDetails.location || cj.location,
            createdAt: cj.createdAt,
            details: { website: cj.companyDetails.website, industry: cj.companyDetails.industry }
          });
        }
      }

      // 2. From Apply Here section
      if (cj.applyEmail || cj.applyPhone) {
        addContact(cj.applyEmail, cj.applyPhone, {
          name: cj.applyPersonName || "Apply Contact",
          role: "Candidate Job (Apply)",
          company: cj.companyDetails?.companyName || "N/A",
          source: "Job Post - Apply Section",
          location: cj.location,
          createdAt: cj.createdAt,
          details: { jobTitle: cj.title }
        });
      }

      // 3. From Poster (The Candidate who posted the job)
      if (cj.postedByEmail) {
        addContact(cj.postedByEmail, null, {
          name: "Job Poster",
          role: "Candidate (Poster)",
          company: "Individual",
          source: "Job Post - Poster",
          location: cj.location,
          createdAt: cj.createdAt,
          details: { jobTitle: cj.title }
        });
      }
    });


    const allContacts = Array.from(contactsMap.values());
    
    // Sort by newest first
    allContacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(allContacts, { status: 200 });
  } catch (error) {
    console.error("Contacts API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

