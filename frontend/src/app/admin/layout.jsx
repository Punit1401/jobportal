// src/app/admin/layout.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarLayout from "@/components/admin/SidebarLayout";

export default function AdminWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      if (pathname === "/admin/login" || pathname === "/login") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/check", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        if (data.loggedIn) {
          setIsLoggedInAdmin(true);
        } else {
          router.replace("/admin/login"); // or "/login" depending on your route
        }
      } catch (err) {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Checking session...</div>;

  return isLoggedInAdmin ? <SidebarLayout>{children}</SidebarLayout> : null;
}
