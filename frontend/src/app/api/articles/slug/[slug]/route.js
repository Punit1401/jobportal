import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    await connectMongo();
    
    const article = await Article.findOne({ slug });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // If not approved, only admin or author can see it
    if (article.status !== "approved") {
      const isAuthor = session && session.user.id === article.authorId.toString();
      const isAdmin = session && session.user.role === "admin";
      
      if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json(article);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
