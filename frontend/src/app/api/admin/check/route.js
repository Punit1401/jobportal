// src/app/api/admin/check/route.js
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req) {
  try {
    // get token from cookie
    const token = await getToken({ req, secret });
    if (!token) {
      return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
    }

    // Check role
    const isAdmin = token.role === "admin";
    return new Response(JSON.stringify({ loggedIn: Boolean(isAdmin), role: token.role || null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin/check error:", error);
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}
