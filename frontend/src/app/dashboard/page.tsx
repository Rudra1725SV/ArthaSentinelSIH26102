"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5] text-slate-500 font-data text-xs">
      Redirecting to Overview Tab...
    </div>
  );
}
