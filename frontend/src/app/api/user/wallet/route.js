import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // 1. Fetch or Create Wallet
    let wallet = await Wallet.findOne({ userId: session.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: session.user.id, balance: 0 });
    }

    // 2. Fetch recent transactions
    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency,
      transactions,
    });

  } catch (error) {
    console.error("Wallet GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
