"use client";

import { useState } from "react";

export function BackendStatusBar() {
  const [isWaking, setIsWaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleWake = async () => {
    setIsWaking(true);
    setStatusMessage("Connecting to API backend...");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${apiBase}/api/validation/summary`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        setStatusMessage("Backend online & active!");
      } else {
        setStatusMessage("Backend standby. Fallback engine operational.");
      }
    } catch {
      setStatusMessage("Backend offline (using local Scrutiny Engine V2.4).");
    } finally {
      setIsWaking(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <aside aria-label="System status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-3 bg-slate-900/95 text-slate-200 px-4 py-2 rounded-full shadow-lg border border-slate-800 text-xs backdrop-blur-md">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-medium text-slate-300">
          {statusMessage || "Frontend Preview Only. Please wake servers to enable backend functionality."}
        </span>
        <button
          onClick={handleWake}
          disabled={isWaking}
          className="rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-3 py-1 text-xs font-medium transition-colors border border-emerald-600/40 cursor-pointer disabled:opacity-50"
        >
          {isWaking ? "Pinging..." : "Wake up servers"}
        </button>
      </div>
    </aside>
  );
}
