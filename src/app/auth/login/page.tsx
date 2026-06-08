"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { signInWithEmail } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await signInWithEmail(email, password);
      // Session is managed server-side by Supabase — no localStorage needed
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("not found")) {
        setError("Account not found. Please register.");
      } else if (message.includes("Invalid email or password")) {
        setError("Invalid email or password.");
      } else if (message.includes("disabled")) {
        setError("Your account has been disabled. Contact administrator.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="CTMS Logo" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <span className="text-[#3B4252] text-xl font-bold">CTMS</span>
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Welcome back</h2>
        <p className="text-[#6B7280] mb-8">Sign in to your account to continue</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" required
                className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" required
                className="w-full pl-10 pr-12 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-[#D8DDE3] text-[#3B4252] focus:ring-[#3B4252]/20" />
              <span className="text-sm text-[#6B7280]">Remember Me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-[#3B4252] hover:underline font-medium">Forgot Password?</Link>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#3B4252] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D3342] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7280] mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#3B4252] font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#3B4252] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <Image src="/login-screen-logo.png" alt="CTMS Background" fill className="object-cover opacity-30" priority />
        </div>
        <div className="absolute inset-0 bg-[#3B4252]/60" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <Image src="/logo.png" alt="CTMS Logo" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <span className="text-white text-2xl font-bold">CTMS</span>
          </div>
          <h1 className="text-4xl lg:text-5xl text-white font-bold leading-tight mb-6">
            Track, Manage and Resolve Complaints Efficiently
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            A centralized platform for streamlined complaint management with real-time tracking, escalation workflows, and powerful analytics.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#22C55E] rounded-full" />SLA Monitoring</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#22C55E] rounded-full" />Real-time Tracking</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#22C55E] rounded-full" />Smart Escalations</div>
          </div>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-[#3B4252] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
