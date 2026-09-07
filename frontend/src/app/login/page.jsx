
"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ જો યુઝર પહેલેથી લોગિન હોય, તો તેને ડેશબોર્ડ પર મોકલી દેવો
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      let targetPath = "/user/dashboard";
      
      if (role === "admin" || role === "staff") targetPath = "/admin/dashboard";
      else if (role === "recruiter") targetPath = "/recruiter/dashboard";
      else if (role === "serviceprovider") targetPath = "/serviceprovider/dashboard";
      else if (role === "user" || role === "candidate") targetPath = "/user/dashboard";
      
      // હાર્ડ રિડાયરેક્ટ (Cookies સિંક કરવા માટે)
      window.location.href = targetPath;
    }
  }, [session, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ New Redirection Logic (Proper Fix)
      const roleRes = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      let role = "user"; // Default
      if (roleRes.ok) {
        const data = await roleRes.json();
        role = data.role;
      }

      let targetPath = "/user/dashboard";
      if (role === "admin" || role === "staff") targetPath = "/admin/dashboard";
      else if (role === "recruiter") targetPath = "/recruiter/dashboard";
      else if (role === "serviceprovider") targetPath = "/serviceprovider/dashboard";
      else if (role === "user" || role === "candidate") targetPath = "/user/dashboard";

      const res = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (res?.ok) {
        // ✅ સફળ લોગિન પછી મેન્યુઅલ રિડાયરેક્ટ
        window.location.href = targetPath;
      } else {
        setError(res?.error || "Invalid credentials");
        setLoading(false);
      }

      /* 
      // --- Old Code Commented Out ---
      const res = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (!res) {
        setError("Unknown error occurred");
        setLoading(false);
        return;
      }

      if (res.error) {
        setError(res.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (!session || !session.user) {
        setError("Session failed. Please try again.");
        setLoading(false);
        return;
      }

      const role = session.user.role;
      let targetPath = "/user/dashboard"; 

      if (role === "admin" || role === "staff") {
        targetPath = "/admin/dashboard";
      } else if (role === "recruiter") {
        try {
          localStorage.setItem("recruiterEmail", email);
        } catch (err) {
          console.error("Storage error:", err);
        }
        targetPath = "/recruiter/dashboard";
      } else if (role === "serviceprovider") {
        targetPath = "/serviceprovider/dashboard";
      } else {
        targetPath = "/user/dashboard";
      }

      window.location.href = targetPath;
      */

    } catch (err) {
      console.error("Login Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side: Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop"
          alt="Login Workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-2">
            {/* <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl"></div>
            <span className="text-white text-2xl font-bold tracking-tight">Job Portal</span> */}
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              "Simply all the tools that my team and I need."
            </h2>
            <div>
              <p className="text-white font-bold text-lg">Venshita Foundation</p>
              <p className="text-slate-300 text-sm">Director of Digital Marketing Technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Build your career effortlessly with our powerful platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex.jordan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="/forgot-password" title="Forgot Password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-slate-500 font-medium mt-8">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}