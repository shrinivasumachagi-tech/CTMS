"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, Building2, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { getDepartments, signUpWithEmail } from "@/lib/api";

interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", mobile: "", departmentId: "", password: "", confirmPassword: "",
  });

  useEffect(() => {
    setLoadingDepts(true);
    getDepartments()
      .then((data) => {
        setDepartments(data);
        setLoadingDepts(false);
      })
      .catch((err) => {
        console.error("[Register] Failed to load departments:", err);
        setDepartments([]);
        setLoadingDepts(false);
        setError("Failed to load departments. Please refresh the page or contact administrator.");
      });
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError("Full name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!form.mobile.trim()) { setError("Mobile number is required"); return; }
    if (!form.departmentId) { setError("Please select a department"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    setError("");
    try {
      await signUpWithEmail(form.email, form.password, form.fullName, form.mobile, form.departmentId);
      // signUpWithEmail does auto-login — redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      // "Account created" message means registration succeeded but auto-login failed — send to login
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (msg.includes("Account created")) {
        router.push("/auth/login?registered=true");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="CTMS Logo" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <span className="text-[#3B4252] text-xl font-bold">CTMS</span>
        </div>
        <div className="bg-white rounded-2xl border border-[#D8DDE3] shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Create Account</h2>
          <p className="text-[#6B7280] text-center mb-6">Fill in your details to get started</p>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input type="text" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="Enter your full name" required className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="Enter your email" required className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input type="tel" value={form.mobile} onChange={(e) => updateForm("mobile", e.target.value)} placeholder="Enter your mobile number" required className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Department</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] z-10" />
                {loadingDepts ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm bg-gray-50 flex items-center gap-2 text-[#6B7280]">
                    <Loader2 size={16} className="animate-spin" />
                    Loading departments...
                  </div>
                ) : (
                  <select
                    value={form.departmentId}
                    onChange={(e) => updateForm("departmentId", e.target.value)}
                    required
                    className="w-full pl-10 pr-8 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] bg-white transition-all cursor-pointer"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
                {!loadingDepts && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
              {!loadingDepts && departments.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No departments available. Please contact admin.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateForm("password", e.target.value)} placeholder="Create a password (min 8 characters)" required className="w-full pl-10 pr-12 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && form.password.length < 8 && (
                <p className="text-xs text-amber-600 mt-1">Password must be at least 8 characters</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input type="password" value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} placeholder="Confirm your password" required className="w-full pl-10 pr-4 py-2.5 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all" />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || loadingDepts}
              className="w-full bg-[#3B4252] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D3342] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#3B4252] font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
