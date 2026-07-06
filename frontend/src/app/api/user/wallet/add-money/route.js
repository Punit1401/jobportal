import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import crypto from "crypto";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, purpose = "Add Money" } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectMongo();

    // 1. Get or Create Wallet
    let wallet = await Wallet.findOne({ userId: session.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: session.user.id, balance: 0 });
    }

    // 2. Generate a secure Mock Reference ID (Like a Razorpay payment ID)
    const mockPaymentId = `pay_${crypto.randomBytes(8).toString("hex")}`;

    // 3. Create Transaction Record (Pending first, then success)
    // In a real scenario, this would stay 'pending' until the webhook verifies payment.
    const transaction = await Transaction.create({
      userId: session.user.id,
      walletId: wallet._id,
      type: "credit",
      amount: Number(amount),
      purpose: purpose,
      status: "success", // Auto-success for this demo implementation
      referenceId: mockPaymentId,
    });

    // 4. Securely Increment Balance using $inc (Atomic Update to avoid Race Conditions)
    const updatedWallet = await Wallet.findOneAndUpdate(
      { _id: wallet._id },
      { $inc: { balance: Number(amount) } },
      { new: true, runValidators: true } // runValidators ensures it doesn't go below 0 via schema rules
    );

    return NextResponse.json({
      success: true,
      message: "Money added successfully",
      newBalance: updatedWallet.balance,
      transaction,
    });

  } catch (error) {
    console.error("Wallet Add Money Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
