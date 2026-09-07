"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useRazorpayTopup(onSuccess) {
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(false);

  const topup = useCallback(
    async (amount) => {
      const rupees = Number(amount);
      if (!rupees || rupees <= 0) {
        alert("કૃપા કરીને માન્ય રકમ દાખલ કરો");
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        alert("Payment gateway લોડ થઈ રહ્યું છે. થોડી વાર પછી ફરી પ્રયાસ કરો.");
        return;
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        alert("Razorpay key configured નથી.");
        return;
      }

      setProcessing(true);
      try {
        const res = await fetch("/api/wallet/topup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: rupees }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Order failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: "INR",
          name: "Career & Naukari",
          description: "Digital Wallet Top-up",
          order_id: data.order.id,
          handler: async (response) => {
            try {
              const verifyRes = await fetch("/api/wallet/topup/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  amount: rupees,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                onSuccess?.(verifyData);
              } else {
                alert(verifyData.error || "Payment verification failed");
              }
            } catch {
              alert("Payment verification failed");
            }
          },
          prefill: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
          },
          theme: { color: "#4f46e5" },
        };

        new window.Razorpay(options).open();
      } catch (err) {
        alert(err.message || "Payment start failed");
      } finally {
        setProcessing(false);
      }
    },
    [session, onSuccess]
  );

  return { topup, processing };
}
