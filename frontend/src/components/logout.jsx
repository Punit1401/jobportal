"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    // 1. NextAuth માંથી સાઈન આઉટ કરો
    // redirect: false રાખવાથી આપણે મેન્યુઅલી રીડાયરેક્ટ કરી શકીએ
    const data = await signOut({ redirect: false, callbackUrl: "/login" });

    // 2. બ્રાઉઝરની કેશ અને સેશન સ્ટોરેજ ક્લિયર કરો
    sessionStorage.clear();
    localStorage.clear();

    // 3. સૌથી મહત્વનું: window.location.replace વાપરો
    // આનાથી બ્રાઉઝરની હિસ્ટ્રી ક્લિયર થશે અને 'Back' બટન કામ નહીં કરે
    window.location.replace("/login");
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded"
    >
      Log Out
    </button>
  );
}