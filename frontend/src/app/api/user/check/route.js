import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const tabSessionId = req.headers.get("x-tab-session-id");

  if (session?.user && session.tabSessionId === tabSessionId) {
    return NextResponse.json({ loggedIn: true, user: session.user });
  }

  return NextResponse.json({ loggedIn: false });
}
