import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const data = await req.json();

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();

    const article = await Article.create({
      ...data,
      slug,
      authorId: session.user.id,
      authorName: session.user.name,
      authorType: session.user.role,
      status: "pending" // Always pending for recruiters/providers
    });

    return NextResponse.json({ success: true, article });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");
    const isAdmin = searchParams.get("admin") === "true";
    
    const session = await getServerSession(authOptions);

    await connectMongo();

    let query = { status: "approved" };

    // If author wants to see their own (including pending)
    if (authorId && session && session.user.id === authorId) {
      query = { authorId };
    }

    // If admin wants to see all for review
    if (isAdmin && session && session.user.role === "admin") {
      query = {};
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });
    return NextResponse.json(articles);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
