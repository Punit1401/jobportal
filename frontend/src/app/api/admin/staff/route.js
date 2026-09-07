import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

// GET all staff members
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    // Fetch all admins who have role 'staff' (case insensitive)
    const staff = await Admin.find({ role: /^staff$/i }).select("-password").sort({ createdAt: -1 });
    const totalAdmins = await Admin.countDocuments();
    
    console.log(`Staff fetch: Found ${staff.length} staff members (IDs: ${staff.map(s => s._id)}) out of ${totalAdmins} total admins.`);

    return NextResponse.json({ success: true, staff, totalAdmins });
  } catch (error) {
    console.error("Fetch Staff Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a new staff member
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    await connectMongo();

    // Check in Admin collection
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: "Admin/Staff with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
    });

    return NextResponse.json({ success: true, message: "Staff created successfully", staff: newStaff });
  } catch (error) {
    console.error("Create Staff Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
