"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type");
    const hash = searchParams.get("hash") || searchParams.get("token_hash");

    if (type === "recovery" && hash) {
      router.replace(`/auth/reset-password?hash=${hash}&type=${type}`);
    } else {
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F6F8" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#3B4252] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6B7280]">Redirecting...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F6F8" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B4252] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Redirecting...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
