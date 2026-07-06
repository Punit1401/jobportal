// open  in email for password reset 
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPassword() {
  const params = useParams();
  const token = params.token;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000); // 2 sec delay before redirect
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
