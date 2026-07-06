import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
  return response;
}
