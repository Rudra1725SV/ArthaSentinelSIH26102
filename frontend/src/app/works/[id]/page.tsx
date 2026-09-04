"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function WorkRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    router.replace(`/investigations/${resolvedParams.id}`);
  }, [router, resolvedParams.id]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5] text-slate-500 font-mono text-xs">
      Redirecting to Investigation View...
    </div>
  );
}
