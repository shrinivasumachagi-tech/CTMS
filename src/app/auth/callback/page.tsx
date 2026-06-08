"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Password reset or email confirm redirect — just go to dashboard
    // Session is managed server-side via httpOnly cookie
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F6F8" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#3B4252] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6B7280]">Redirecting...</p>
      </div>
    </div>
  );
}
