import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import Plan from "@/models/Plan";
import { getPartnerAccess } from "@/lib/partnerAccess";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (!["recruiter", "serviceprovider"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongo();

    let user = null;
    let plans = [];

    if (role === "recruiter") {
      user = await Recruiter.findOne({ email: session.user.email }).populate(
        "subscription.planId"
      );
      plans = await Plan.find({
        userType: { $in: ["Recruiter", "recruiter"] },
        $or: [{ isActive: true }, { isActive: { $exists: false } }],
      }).sort({ displayOrder: 1 });
    } else {
      user = await ServiceProvider.findOne({ email: session.user.email }).populate(
        "subscription.planId"
      );
      plans = await Plan.find({
        userType: { $in: ["ServiceProvider", "serviceprovider"] },
        $or: [{ isActive: true }, { isActive: { $exists: false } }],
      }).sort({ displayOrder: 1 });
    }

    const access = getPartnerAccess(user, role);

    return NextResponse.json({
      success: true,
      access,
      user: user
        ? {
            fullName: user.fullName,
            companyName: user.companyName,
            providerName: user.providerName,
            isApproved: user.isApproved,
            status: user.status,
            isRejected: user.isRejected,
            subscription: user.subscription,
          }
        : null,
      plans,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
