import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import mongoose from "mongoose";

// Ensure dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Fetch all transactions, sorted by most recent
    const transactions = await Transaction.find().sort({ createdAt: -1 }).lean();

    // Get unique user IDs
    const userIds = [...new Set(transactions.map(t => t.userId ? t.userId.toString() : "").filter(Boolean))];
    
    // Fetch from all collections
    const [users, recruiters, providers] = await Promise.all([
      User.find({ _id: { $in: userIds } }, "name email role").lean(),
      Recruiter.find({ _id: { $in: userIds } }, "name email role companyName").lean(),
      ServiceProvider.find({ _id: { $in: userIds } }, "name email role companyName").lean(),
    ]);

    // Map them
    const userMap = {};
    users.forEach(u => {
      if (u.role === "admin") {
        userMap[u._id.toString()] = { ...u, name: "Admin / Platform (System Outflow)", type: "Admin" };
      } else {
        userMap[u._id.toString()] = { ...u, type: "Candidate" };
      }
    });
    recruiters.forEach(r => userMap[r._id.toString()] = { ...r, name: r.companyName || r.name, type: "Recruiter" });
    providers.forEach(p => userMap[p._id.toString()] = { ...p, name: p.companyName || p.name, type: "Service Provider" });

    // Attach user details to transactions
    const enrichedTransactions = transactions.map(t => ({
      ...t,
      user: (t.userId && userMap[t.userId.toString()]) ? userMap[t.userId.toString()] : { name: "Platform Admin", email: "admin@system.com", type: "Admin" }
    }));

    // Platform-wide totals
    const totals = {
      totalCredit: transactions.filter(t => t.type === "credit" && t.status === "success").reduce((sum, t) => sum + (t.amount || 0), 0),
      totalDebit: transactions.filter(t => t.type === "debit" && t.status === "success").reduce((sum, t) => sum + (t.amount || 0), 0)
    };

    // Fetch dropdown users
    const [allCands, allRecs, allProvs] = await Promise.all([
      User.find({}, "name email").lean(),
      Recruiter.find({}, "companyName name email").lean(),
      ServiceProvider.find({}, "companyName name email").lean(),
    ]);

    const dropdownUsers = [
      { id: session.user.id, name: "Admin / Platform (System Outflow)", email: session.user.email, role: "Admin" },
      ...allCands.map(c => ({ id: c._id.toString(), name: c.name, email: c.email, role: "Candidate" })),
      ...allRecs.map(r => ({ id: r._id.toString(), name: r.companyName || r.name, email: r.email, role: "Recruiter" })),
      ...allProvs.map(p => ({ id: p._id.toString(), name: p.companyName || p.name, email: p.email, role: "Service Provider" }))
    ].filter(u => u.name && u.email);

    return NextResponse.json({ 
      success: true, 
      transactions: enrichedTransactions, 
      totals,
      users: dropdownUsers
    });
  } catch (error) {
    console.error("Fetch Wallet Transactions Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();
    const { userId, amount, purpose, referenceId, type } = body;
    const targetUserId = userId || session.user.id;

    if (!targetUserId || !amount || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const txnType = type || "debit";

    const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      balance: { type: Number, required: true, default: 0, min: 0 },
      currency: { type: String, default: "INR" },
      status: { type: String, enum: ["active", "frozen"], default: "active" }
    }));

    let wallet = await Wallet.findOne({ userId: targetUserId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: targetUserId, balance: 0 });
    }

    const transaction = await Transaction.create({
      userId: targetUserId,
      walletId: wallet._id,
      type: txnType,
      amount: amt,
      purpose,
      status: "success",
      referenceId: referenceId || (txnType === "credit" ? `IN-${Date.now()}` : `OUT-${Date.now()}`)
    });

    return NextResponse.json({ success: true, message: "Transaction recorded successfully", transaction });
  } catch (error) {
    console.error("Record Outgoing Fund Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();
    const { id, amount, purpose, referenceId, type, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const updateFields = {};
    if (amount !== undefined) {
      const amt = parseFloat(amount);
      if (!isNaN(amt) && amt > 0) updateFields.amount = amt;
    }
    if (purpose) updateFields.purpose = purpose;
    if (referenceId !== undefined) updateFields.referenceId = referenceId;
    if (type) updateFields.type = type;
    if (status) updateFields.status = status;

    const updatedTxn = await Transaction.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updatedTxn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction: updatedTxn });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
