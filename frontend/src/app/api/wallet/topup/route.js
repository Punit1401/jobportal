import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRazorpayInstance } from "@/lib/razorpay";
import { MIN_TOPUP, MAX_TOPUP, WALLET_ROLES } from "@/lib/walletCatalog";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!WALLET_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { amount } = await req.json();
    const rupees = Number(amount);
    if (!rupees || rupees < MIN_TOPUP || rupees > MAX_TOPUP) {
      return NextResponse.json(
        { error: `Amount must be between ₹${MIN_TOPUP} and ₹${MAX_TOPUP}` },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: Math.round(rupees * 100),
      currency: "INR",
      receipt: `wallet_${session.user.id.slice(-6)}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        purpose: "wallet_topup",
        role: session.user.role,
      },
    });

    return NextResponse.json({ success: true, order, amount: rupees });
  } catch (error) {
    console.error("Wallet topup order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Could not create payment order" },
      { status: 500 }
    );
  }
}
