// "use client";


// import { useState } from "react";


// export default function ForgotPassword() {
// const [email, setEmail] = useState("");
// const [msg, setMsg] = useState("");
// const [loading, setLoading] = useState(false);


// const submit = async () => {
// setLoading(true);
// const res = await fetch("/api/auth/forgot-password", {
// method: "POST",
// headers: { "Content-Type": "application/json" },
// body: JSON.stringify({ email }),
// });
// const data = await res.json();
// setMsg(data.message || data.error);
// setLoading(false);
// };


// return (
// <div className="p-6 max-w-md mx-auto">
// <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
// <input
// className="border p-2 w-full"
// placeholder="Enter your email"
// value={email}
// onChange={(e) => setEmail(e.target.value)}
// />
// <button
// className="mt-3 bg-blue-600 text-white px-4 py-2"
// onClick={submit}
// disabled={loading}
// >
// {loading ? "Sending..." : "Send Reset Link"}
// </button>
// <p className="mt-3 text-green-600">{msg}</p>
// </div>
// );
// }

"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault(); // Form submit handle કરવા માટે
    setLoading(true);
    setMsg("");
    setIsError(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg(data.message || "Reset link sent to your email!");
      } else {
        setIsError(true);
        setMsg(data.error || "Something went wrong.");
      }
    } catch (err) {
      setIsError(true);
      setMsg("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side: Image Section (Matching Login Page) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=2000&auto=format&fit=crop" 
          alt="Forgot Password Illustration" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">J</div>
             <span className="text-white text-2xl font-bold tracking-tight">JobConnect Pro</span>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Don't worry, we'll help you get back on track.
            </h2>
            <p className="text-slate-300">
              Recovering your account is just a few clicks away. Enter your registered email to receive a secure reset link.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          {/* Back to Login */}
          <button 
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors mb-10 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to login
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3 text-italic">Forgot Password?</h1>
            <p className="text-slate-500 font-medium">
              Enter the email address associated with your account.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="relative">
              <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex.jordan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium placeholder:text-slate-400 pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            {msg && (
              <div className={`p-4 rounded-2xl text-center text-sm font-bold border animate-in fade-in zoom-in duration-300 ${
                isError 
                ? "bg-red-50 text-red-600 border-red-100" 
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}>
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending link...
                </>
              ) : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
             <p className="text-slate-500 font-medium text-sm">
                Still having trouble? <a href="/contact" className="text-indigo-600 font-bold hover:underline">Contact Support</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}