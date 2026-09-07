import connectMongo from "@/lib/mongodb";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    const reviewType = searchParams.get("reviewType") || "service";

    if (!targetId) return NextResponse.json({ error: "Target ID required" }, { status: 400 });

    const reviewFilter =
      reviewType === "service"
        ? {
          targetId,
          $or: [
            { questionId: { $exists: false } },
            { questionId: "" },
          ],
        }
        : { targetId, reviewType };

    const reviews = await Review.find(reviewFilter).sort({ createdAt: -1 });

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

    let avgWorkCulture = 0;
    let avgCareerGrowth = 0;
    let avgSalary = 0;

    if (reviews.length > 0) {
      let cultureSum = 0;
      let cultureCount = 0;
      let growthSum = 0;
      let growthCount = 0;
      let salarySum = 0;
      let salaryCount = 0;

      reviews.forEach(r => {
        if (r.workCultureRating) {
          cultureSum += r.workCultureRating;
          cultureCount++;
        }
        if (r.careerGrowthRating) {
          growthSum += r.careerGrowthRating;
          growthCount++;
        }
        if (r.salaryRating) {
          salarySum += r.salaryRating;
          salaryCount++;
        }
      });

      avgWorkCulture = cultureCount > 0 ? cultureSum / cultureCount : 0;
      avgCareerGrowth = growthCount > 0 ? growthSum / growthCount : 0;
      avgSalary = salaryCount > 0 ? salarySum / salaryCount : 0;
    }

    return NextResponse.json({ 
      success: true, 
      reviews, 
      averageRating: averageRating.toFixed(1),
      avgWorkCulture: avgWorkCulture.toFixed(1),
      avgCareerGrowth: avgCareerGrowth.toFixed(1),
      avgSalary: avgSalary.toFixed(1)
    });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { 
      targetId, 
      reviewerId, 
      reviewerName, 
      targetType, 
      rating, 
      comment, 
      reviewType = "service",
      workCultureRating,
      careerGrowthRating,
      salaryRating,
      role,
      isAnonymous
    } = body;

    const existing =
      reviewType === "service"
        ? await Review.findOne({
          targetId,
          reviewerId,
          $or: [
            { questionId: { $exists: false } },
            { questionId: "" },
          ],
        })
        : await Review.findOne({ targetId, reviewerId, reviewType });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.reviewType = reviewType;
      if (workCultureRating !== undefined) existing.workCultureRating = workCultureRating;
      if (careerGrowthRating !== undefined) existing.careerGrowthRating = careerGrowthRating;
      if (salaryRating !== undefined) existing.salaryRating = salaryRating;
      if (role !== undefined) existing.role = role;
      if (isAnonymous !== undefined) existing.isAnonymous = isAnonymous;
      await existing.save();
      return NextResponse.json({ success: true, message: "Review Updated!" });
    }

    const newReview = await Review.create({
      targetId,
      reviewerId,
      reviewerName,
      targetType,
      rating,
      comment,
      reviewType,
      workCultureRating,
      careerGrowthRating,
      salaryRating,
      role,
      isAnonymous
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
