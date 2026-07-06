import connectMongo from "@/lib/mongodb";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

// રિવ્યુ મેળવવા (GET)
export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) return NextResponse.json({ error: "Target ID required" }, { status: 400 });

    const reviews = await Review.find({ targetId }).sort({ createdAt: -1 });
    
    // સરેરાશ રેટિંગની ગણતરી
    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({ success: true, reviews, averageRating: averageRating.toFixed(1) });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// રિવ્યુ સેવ કરવા (POST)
export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { targetId, reviewerId, reviewerName, targetType, rating, comment } = body;

    // એક જ યુઝર એક જ વ્યક્તિને ફરી રિવ્યુ ના આપી શકે તે ચેક કરવું હોય તો:
    const existing = await Review.findOne({ targetId, reviewerId });
    if (existing) {
        // જો અપડેટ કરવું હોય તો update કરો, નહીંતર એરર આપો
        existing.rating = rating;
        existing.comment = comment;
        await existing.save();
        return NextResponse.json({ success: true, message: "Review Updated!" });
    }

    const newReview = await Review.create({
      targetId, reviewerId, reviewerName, targetType, rating, comment
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}