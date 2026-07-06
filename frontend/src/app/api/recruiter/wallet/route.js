import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let wallet = await Wallet.findOne({ userId: session.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: session.user.id, balance: 0 });
    }

    const transactions = await Transaction.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(10);

    return NextResponse.json({ 
      ok: true, 
      balance: wallet.balance, 
      transactions 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
