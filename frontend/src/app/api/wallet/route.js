import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getWalletSummary } from "@/lib/wallet";
import { MIN_TOPUP, MAX_TOPUP, WALLET_ROLES } from "@/lib/walletCatalog";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WALLET_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Wallet not available for this role" }, { status: 403 });
    }

    const summary = await getWalletSummary(session.user.id);

    return NextResponse.json({
      success: true,
      ok: true,
      ...summary,
      catalog: { minTopup: MIN_TOPUP, maxTopup: MAX_TOPUP },
    });
  } catch (error) {
    console.error("Wallet GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
