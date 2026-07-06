import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";


export async function POST(req) {
try {
await connectMongo();
const { token, password } = await req.json();


if (!token || !password) {
return NextResponse.json({ message: "Token and password required" }, { status: 400 });
}


const user = await User.findOne({
resetPasswordToken: token,
resetPasswordExpire: { $gt: Date.now() },
});


if (!user) {
return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
}


user.password = await bcrypt.hash(password, 10);
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;


await user.save();


return NextResponse.json({ message: "Password reset successful!" });
} catch (error) {
console.error("Reset-password error:", error);
return NextResponse.json({ error: error.message }, { status: 500 });
}
}