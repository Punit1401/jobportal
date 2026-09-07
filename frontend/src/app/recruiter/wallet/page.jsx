"use client";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import WalletPanel from "@/components/WalletPanel";

export default function WalletPage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <RecruiterSidebar activePage="wallet" />
      <main className="flex-1 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Digital Wallet</h1>
            <p className="text-slate-500 font-medium mt-1">
              Add money via Razorpay and use your wallet for subscriptions, ads, and storage.
            </p>
          </header>
          <WalletPanel />
        </div>
      </main>
    </div>
  );
}
