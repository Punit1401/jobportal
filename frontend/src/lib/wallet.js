import mongoose from "mongoose";
import connectMongo from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function getOrCreateWallet(userId) {
  await connectMongo();
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
}

export async function creditWallet({ userId, amount, purpose, referenceId, metadata = {} }) {
  if (!amount || amount <= 0) throw new Error("Invalid amount");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.status === "frozen") throw new Error("Wallet is frozen");

  if (referenceId) {
    const existing = await Transaction.findOne({ referenceId, status: "success" });
    if (existing) {
      const current = await Wallet.findById(wallet._id);
      return { wallet: current, transaction: existing, duplicate: true };
    }
  }

  const transaction = await Transaction.create({
    userId,
    walletId: wallet._id,
    type: "credit",
    amount,
    purpose,
    status: "success",
    referenceId,
    metadata,
  });

  const updatedWallet = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: amount } },
    { new: true, runValidators: true }
  );

  return { wallet: updatedWallet, transaction, duplicate: false };
}

export async function debitWallet({ userId, amount, purpose, metadata = {} }) {
  if (!amount || amount <= 0) throw new Error("Invalid amount");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.status === "frozen") throw new Error("Wallet is frozen");
  if (wallet.balance < amount) {
    const err = new Error("Insufficient wallet balance");
    err.code = "INSUFFICIENT_BALANCE";
    throw err;
  }

  const transaction = await Transaction.create({
    userId,
    walletId: wallet._id,
    type: "debit",
    amount,
    purpose,
    status: "success",
    metadata,
  });

  const updatedWallet = await Wallet.findOneAndUpdate(
    { _id: wallet._id, balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { new: true, runValidators: true }
  );

  if (!updatedWallet) {
    await Transaction.findByIdAndUpdate(transaction._id, { status: "failed" });
    const err = new Error("Insufficient wallet balance");
    err.code = "INSUFFICIENT_BALANCE";
    throw err;
  }

  return { wallet: updatedWallet, transaction };
}

export async function getWalletSummary(userId) {
  const wallet = await getOrCreateWallet(userId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [transactions, spentAgg] = await Promise.all([
    Transaction.find({ userId }).sort({ createdAt: -1 }).limit(30),
    Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: "debit",
          status: "success",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    balance: wallet.balance,
    currency: wallet.currency,
    status: wallet.status,
    transactions,
    spentThisMonth: spentAgg[0]?.total || 0,
  };
}
