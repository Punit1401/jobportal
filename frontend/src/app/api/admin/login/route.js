import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectMongo();

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign(
      { id: admin._id, name: admin.name, email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ ok: true });
    response.headers.append(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
