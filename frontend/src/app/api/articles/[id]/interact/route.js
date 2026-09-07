import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { id } = await params;
    const { action, content, rating } = await req.json();

    await connectMongo();
    const article = await Article.findById(id);
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    if (action === "like") {
      const index = article.likes.indexOf(session.user.id);
      if (index > -1) article.likes.splice(index, 1); // Unlike
      else article.likes.push(session.user.id); // Like
    } 
    else if (action === "comment") {
      article.comments.push({
        userId: session.user.id,
        userName: session.user.name,
        content
      });
    }
    else if (action === "rate") {
      const existingRating = article.ratings.find(r => r.userId.toString() === session.user.id);
      if (existingRating) {
        existingRating.rating = rating;
      } else {
        article.ratings.push({ userId: session.user.id, rating });
      }
    }
    else if (action === "share") {
      article.shareCount += 1;
    }

    await article.save();
    return NextResponse.json({ success: true, article });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
