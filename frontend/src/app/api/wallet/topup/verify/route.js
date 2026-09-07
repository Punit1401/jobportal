import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { creditWallet } from "@/lib/wallet";
import { WALLET_ROLES } from "@/lib/walletCatalog";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!WALLET_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    const rupees = Number(amount);
    if (!rupees || rupees <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const { wallet, transaction, duplicate } = await creditWallet({
      userId: session.user.id,
      amount: rupees,
      purpose: "Wallet Top-up (Razorpay)",
      referenceId: razorpay_payment_id,
      metadata: { orderId: razorpay_order_id, role: session.user.role },
    });

    return NextResponse.json({
      success: true,
      duplicate,
      balance: wallet.balance,
      transaction,
      message: duplicate ? "Payment already credited" : "Wallet topped up successfully",
    });
  } catch (error) {
    console.error("Wallet topup verify:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
