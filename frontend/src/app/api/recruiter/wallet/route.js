import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getWalletSummary } from "@/lib/wallet";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getWalletSummary(session.user.id);
    return NextResponse.json({ ok: true, balance: summary.balance, transactions: summary.transactions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
