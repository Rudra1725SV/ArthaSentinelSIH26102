"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContractorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/investigations");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5] text-slate-500 font-mono text-xs">
      Redirecting to Investigations...
    </div>
  );
}
