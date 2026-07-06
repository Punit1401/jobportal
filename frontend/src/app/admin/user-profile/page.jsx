"use client";
import { useEffect, useState } from "react";
import UserProfile from "@/components/UserProfile";

export default function Page({ searchParams }) {
  const { email, mode } = searchParams; // mode=view
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/candidates?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setInitialData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [email]);

  if (loading) return <p className="p-6 text-center">Loading user profile...</p>;
  if (!initialData) return <p className="p-6 text-center text-red-500">User not found</p>;

  return <UserProfile initialData={initialData} readOnly={mode === "view"} />;
}
