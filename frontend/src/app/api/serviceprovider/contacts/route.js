import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";

export const dynamic = "force-dynamic";
import Inquiry from "@/models/Inquiry";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all inquiries sent to this service provider
    const inquiries = await Inquiry.find({ providerEmail: session.user.email });

    // Identify unique customers from inquiries
    // Group them by email/clientEmail to avoid duplicates.
    const uniqueEmails = [...new Set(inquiries.map(inq => inq.email || inq.clientEmail).filter(e => e))];
    
    // For each unique email, get the most recent inquiry data or User profile if exists
    const contacts = await Promise.all(uniqueEmails.map(async (email) => {
        const lastInq = await Inquiry.findOne({ 
          $or: [{ email }, { clientEmail: email }], 
          providerEmail: session.user.email 
        }).sort({ createdAt: -1 });
        const user = await User.findOne({ email });
        
        return {
            _id: lastInq._id, // Use last inquiry ID as reference
            userId: user?._id || null, 
            name: user?.name || lastInq.clientName || lastInq.name,
            fullName: user?.name || lastInq.clientName || lastInq.name,
            email: email,
            mobile: user?.phone || lastInq.phone || lastInq.mobile || lastInq.clientPhone,
            role: lastInq.role || "Customer",
            city: lastInq.city || "N/A",
            status: lastInq.status || "Inquired",
            profession: lastInq.profession || "Inquirer",
            message: lastInq.message
        };
    }));

    return NextResponse.json({ ok: true, data: contacts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const isArray = Array.isArray(body);
    const contactsToProcess = isArray ? body : [body];

    const results = [];

    for (const item of contactsToProcess) {
      const { name, email, mobile, role, city, state, status, message } = item;
      if (!name || !email) continue;

      const normalizedEmail = email.trim().toLowerCase();

      // Create a manual Inquiry record that links this customer to the service provider
      const inquiry = await Inquiry.create({
        providerEmail: session.user.email,
        clientName: name.trim(),
        clientEmail: normalizedEmail,
        serviceTitle: (role || "Customer").trim(),
        message: message || "Manually added contact",
        status: status === "Inquired" ? "new" : "replied",
        // Include non-schema fields as well, just in case they are queried!
        name: name.trim(),
        email: normalizedEmail,
        phone: String(mobile || "").trim(),
        mobile: String(mobile || "").trim(),
        city: String(city || "").trim(),
        state: String(state || "").trim(),
        role: (role || "Customer").trim(),
      });
      results.push(inquiry);
    }

    return NextResponse.json({ ok: true, count: results.length });
  } catch (err) {
    console.error("POST /api/serviceprovider/contacts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, email, mobile, role, city, state, status, message } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: "ID, Name and Email are required" }, { status: 400 });
    }

    const inquiry = await Inquiry.findOne({ _id: id, providerEmail: session.user.email });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    inquiry.clientName = name.trim();
    inquiry.clientEmail = normalizedEmail;
    inquiry.serviceTitle = (role || "Customer").trim();
    if (message) inquiry.message = message;
    inquiry.status = status === "Inquired" ? "new" : status === "Responded" ? "replied" : "urgent";

    // Set fallback fields if used in query mapping
    inquiry.set("name", name.trim(), { strict: false });
    inquiry.set("email", normalizedEmail, { strict: false });
    inquiry.set("phone", String(mobile || "").trim(), { strict: false });
    inquiry.set("mobile", String(mobile || "").trim(), { strict: false });
    inquiry.set("city", String(city || "").trim(), { strict: false });
    inquiry.set("state", String(state || "").trim(), { strict: false });
    inquiry.set("role", (role || "Customer").trim(), { strict: false });

    await inquiry.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/serviceprovider/contacts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get("id");

    let inquiryIds = [];

    if (singleId) {
      inquiryIds = [singleId];
    } else {
      const body = await req.json();
      inquiryIds = body.ids || [];
    }

    if (inquiryIds.length === 0) {
      return NextResponse.json({ error: "No contact IDs provided" }, { status: 400 });
    }

    await Inquiry.deleteMany({
      _id: { $in: inquiryIds },
      providerEmail: session.user.email
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/serviceprovider/contacts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
