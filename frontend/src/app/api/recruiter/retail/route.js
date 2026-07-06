import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
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

    const purchases = await Transaction.find({ userId: session.user.id, category: "Purchase" }).sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, data: purchases });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemName, amount } = await req.json();

    const newPurchase = await Transaction.create({
      userId: session.user.id,
      description: `Purchase: ${itemName}`,
      amount,
      type: "debit",
      category: "Purchase",
      status: "Success"
    });

    return NextResponse.json({ ok: true, data: newPurchase });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
