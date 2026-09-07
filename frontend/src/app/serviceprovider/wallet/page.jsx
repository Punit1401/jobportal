"use client";
import Serviceprovidersidbar from "@/components/Serviceprovidersidbar.jsx";
import WalletPanel from "@/components/WalletPanel";

export default function DigitalWalletPage() {
  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <Serviceprovidersidbar activePage="wallet" />
      <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
        <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-6xl mx-auto space-y-8 pb-20">
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Digital Wallet</h1>
            <p className="text-slate-500 font-medium mt-1">
              Add balance via Razorpay and manage services from your wallet.
            </p>
          </header>
          <WalletPanel />
        </div>
      </main>
    </div>
  );
}
