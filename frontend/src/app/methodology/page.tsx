"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MethodologyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/about");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5] text-slate-500 font-mono text-xs">
      Redirecting to About &amp; Methodology...
    </div>
  );
}
