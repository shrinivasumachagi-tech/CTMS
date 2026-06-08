"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import { resetPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(email);
      setSuccess(true);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

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
          {step === 1 && (
            <>
              <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-[#3B4252]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Forgot Password?</h2>
              <p className="text-[#6B7280] text-center mb-6">Enter your email address and we&apos;ll send you a password reset link</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3B4252] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D3342] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"} {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#22C55E]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Check Your Email</h2>
              <p className="text-[#6B7280] mb-2">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-[#1F2937] font-medium mb-6">{email}</p>
              <p className="text-[#6B7280] text-sm mb-6">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
              <button
                onClick={() => { setStep(1); setSuccess(false); setError(""); }}
                className="text-[#3B4252] text-sm font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={14} /> Back to email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          <Link href="/auth/login" className="text-[#3B4252] font-semibold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
