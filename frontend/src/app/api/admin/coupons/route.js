// app/api/admin/coupons/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb"; // તમારું DB કનેક્શન પાથ
import Coupon from "@/models/Coupon"; // તમારું Coupon મોડેલ પાથ

// GET: બધી કૂપન્સ મેળવવા માટે
export async function GET() {
    try {
        await connectMongo();
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST: નવી કૂપન બનાવવા માટે
export async function POST(req) {
    try {
        await connectMongo();
        const body = await req.json();
        const newCoupon = await Coupon.create(body);
        return NextResponse.json({ success: true, coupon: newCoupon });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE: કૂપન ડીલીટ કરવા માટે
export async function DELETE(req) {
    try {
        await connectMongo();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        await Coupon.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}