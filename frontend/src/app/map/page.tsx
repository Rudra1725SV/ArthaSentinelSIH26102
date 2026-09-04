"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MapRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mps");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5] text-slate-500 font-data text-xs">
      Redirecting to Browse MPs...
    </div>
  );
}
