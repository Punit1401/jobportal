import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'received' or 'sent' or 'filters'
    const userId = session.user.id;

    if (type === 'filters') {
      const [candidates, recruiters, providers] = await Promise.all([
        Candidate.find().select('profession industry jobIndustry city').lean(),
        Recruiter.find().select('industry city').lean(),
        ServiceProvider.find().select('profession industry city').lean()
      ]);

      const industries = new Set();
      const professions = new Set();
      const locations = new Set();

      candidates.forEach(c => {
        if (c.industry) industries.add(c.industry.trim());
        if (c.jobIndustry) industries.add(c.jobIndustry.trim());
        if (c.profession) professions.add(c.profession.trim());
        if (c.city) locations.add(c.city.trim());
      });

      recruiters.forEach(r => {
        if (r.industry) industries.add(r.industry.trim());
        if (r.city) locations.add(r.city.trim());
      });

      providers.forEach(p => {
        if (p.industry) industries.add(p.industry.trim());
        if (p.profession) professions.add(p.profession.trim());
        if (p.city) locations.add(p.city.trim());
      });

      return NextResponse.json({
        ok: true,
        industries: ["All", ...Array.from(industries).sort()],
        professions: ["All", ...Array.from(professions).sort()],
        locations: ["All", ...Array.from(locations).sort()]
      });
    }

    if (!userId) {
        return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    let query = {};
    try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        if (type === 'sent') {
            query = { senderId: { $in: [userObjId, userId] } };
        } else {
            query = { recipientId: { $in: [userObjId, userId] } };
        }
    } catch (idError) {
        if (type === 'sent') {
            query = { senderId: userId };
        } else {
            query = { recipientId: userId };
        }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ ok: true, data: notifications });
  } catch (err) {
    console.error("Notification GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { recipientIds, targetRole, title, message, type, link, industry, profession, location } = body;

    let finalRecipientIds = recipientIds || [];

    const hasFilters = 
      (industry && industry !== "All") || 
      (profession && profession !== "All") || 
      (location && location !== "All");

    if (hasFilters) {
      let candidateIds = [];
      let recruiterIds = [];
      let spIds = [];

      // Query Candidate if targetRole is candidate or all
      if (targetRole === 'candidate' || targetRole === 'all') {
        let conds = {};
        if (industry && industry !== "All") {
          conds.$or = [{ jobIndustry: industry }, { industry: industry }];
        }
        if (profession && profession !== "All") {
          conds.profession = profession;
        }
        if (location && location !== "All") {
          conds.city = { $regex: new RegExp(`^${location}$`, 'i') };
        }
        const matches = await Candidate.find(conds).select('userId').lean();
        candidateIds = matches.map(m => m.userId).filter(Boolean);
      }

      // Query Recruiter if targetRole is recruiter or all
      if (targetRole === 'recruiter' || targetRole === 'all') {
        let conds = {};
        if (industry && industry !== "All") {
          conds.industry = industry;
        }
        if (location && location !== "All") {
          conds.city = { $regex: new RegExp(`^${location}$`, 'i') };
        }
        if (profession && profession !== "All") {
          recruiterIds = [];
        } else {
          const matches = await Recruiter.find(conds).select('userId').lean();
          recruiterIds = matches.map(m => m.userId).filter(Boolean);
        }
      }

      // Query ServiceProvider if targetRole is serviceprovider or all
      if (targetRole === 'serviceprovider' || targetRole === 'all') {
        let conds = {};
        if (industry && industry !== "All") {
          conds.industry = industry;
        }
        if (profession && profession !== "All") {
          conds.profession = profession;
        }
        if (location && location !== "All") {
          conds.city = { $regex: new RegExp(`^${location}$`, 'i') };
        }
        const matches = await ServiceProvider.find(conds).select('userId').lean();
        spIds = matches.map(m => m.userId).filter(Boolean);
      }

      const mergedUserIds = [...new Set([...candidateIds, ...recruiterIds, ...spIds])];
      if (mergedUserIds.length > 0) {
        const validObjectIds = mergedUserIds.map(id => {
          try { return new mongoose.Types.ObjectId(id); } catch(e) { return null; }
        }).filter(Boolean);
        
        const users = await User.find({ _id: { $in: validObjectIds } }).select('_id').lean();
        finalRecipientIds = users.map(u => u._id);
      }
    } else {
      // Role-based targeting
      if (targetRole) {
        if (targetRole === 'candidate') {
            const users = await User.find({ role: { $in: ['user', 'candidate'] } }).select('_id');
            finalRecipientIds = users.map(u => u._id);
        } else if (targetRole === 'recruiter') {
            const users = await User.find({ role: 'recruiter' }).select('_id');
            finalRecipientIds = users.map(u => u._id);
        } else if (targetRole === 'serviceprovider') {
            const users = await User.find({ role: 'serviceprovider' }).select('_id');
            finalRecipientIds = users.map(u => u._id);
        } else if (targetRole === 'all') {
            const users = await User.find({}).select('_id');
            finalRecipientIds = users.map(u => u._id);
        }
      }
    }

    if (finalRecipientIds.length === 0 || !title || !message) {
      return NextResponse.json({ error: "Missing required fields or recipients" }, { status: 400 });
    }

    // Dynamic Sender Role Labeling
    let senderRoleLabel = "System";
    if (session.user.role === 'admin') senderRoleLabel = "Admin";
    else if (session.user.role === 'recruiter') senderRoleLabel = "Recruiter";
    else if (session.user.role === 'serviceprovider') senderRoleLabel = "ServiceProvider";

    const notifications = finalRecipientIds.map(id => ({
      senderId: new mongoose.Types.ObjectId(session.user.id),
      senderRole: senderRoleLabel,
      recipientId: new mongoose.Types.ObjectId(id),
      title,
      message,
      type: type || 'Info',
      link: link || ''
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ ok: true, message: "Notifications sent successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
