import connectMongo from "@/lib/mongodb";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { questionId, answerId, reviewerId, reviewerName, providerEmail, rating, comment } = body;

    if (!questionId || !answerId || !providerEmail || !rating) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedRating = Number(rating);
    const normalizedComment = comment || "";

    const updatePayload = {
      $set: {
        "answers.$.rating": normalizedRating,
        "answers.$.reviewComment": normalizedComment,
      },
    };

    let updateResult = null;

    if (answerId) {
      updateResult = await Question.updateOne(
        { _id: questionId, "answers._id": answerId },
        updatePayload
      );
    }

    if (!updateResult || updateResult.matchedCount === 0) {
      updateResult = await Question.updateOne(
        { _id: questionId, "answers.providerEmail": providerEmail },
        updatePayload
      );
    }

    if (!updateResult || updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    const question = await Question.findById(questionId);
    const answer =
      question?.answers?.id(answerId) ||
      question?.answers?.find((item) => item.providerEmail === providerEmail);

    return NextResponse.json({
        success: true,
        message: "Answer rated successfully!",
        answer: {
            id: answer?._id,
            rating: answer?.rating ?? normalizedRating,
            reviewComment: answer?.reviewComment ?? normalizedComment
        }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to rate answer" }, { status: 500 });
  }
}
