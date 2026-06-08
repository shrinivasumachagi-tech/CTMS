"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const verifyToken = useCallback(async () => {
    const hash = searchParams.get("hash") || searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!hash || type !== "recovery") {
      setVerifying(false);
      setTokenValid(false);
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: hash,
        type: "recovery",
      });

      if (verifyError) {
        setTokenValid(false);
        setError("This reset link has expired or is invalid. Please request a new one.");
      } else {
        setTokenValid(true);
      }
    } catch {
      setTokenValid(false);
      setError("Failed to verify reset link. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [searchParams]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to reset password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login?reset=true"), 3000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#3B4252] mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="CTMS Logo" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <span className="text-[#3B4252] text-xl font-bold">CTMS</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#D8DDE3] shadow-sm p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#22C55E]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Password Reset Successful</h2>
              <p className="text-[#6B7280] mb-6">
                Your password has been updated. Redirecting to sign in...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Invalid Reset Link</h2>
              <p className="text-[#6B7280] text-center mb-6">
                {error || "This reset link is invalid or has expired."}
              </p>
              <Link
                href="/auth/forgot-password"
                className="text-[#3B4252] text-sm font-medium hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-[#3B4252]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Reset Password</h2>
              <p className="text-[#6B7280] text-center mb-6">Enter your new password below</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 8 characters)"
                      required
                      className="w-full pl-10 pr-12 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && password.length < 8 && (
                    <p className="text-xs text-amber-600 mt-1">Password must be at least 8 characters</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-[#3B4252] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D3342] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          <Link href="/auth/login" className="text-[#3B4252] font-semibold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#3B4252] mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
