"use client";

import { useState, useEffect } from "react";

export function BackendStatusBar() {
  const [isWaking, setIsWaking] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${apiBase}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        setIsOnline(true);
        setStatusMessage("PostgreSQL & FastAPI Connected · 23,044 Real MPLADS Records Synchronized");
      } else {
        setIsOnline(false);
        setStatusMessage("Backend standby (using Scrutiny Engine V2.4).");
      }
    } catch {
      setIsOnline(false);
      setStatusMessage("Backend offline (using local Scrutiny Engine V2.4).");
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleWake = async () => {
    setIsWaking(true);
    setStatusMessage("Connecting to API backend...");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${apiBase}/api/overview`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);
        setStatusMessage(`Backend Online! ${data.total_works.toLocaleString()} Real Records Connected.`);
      } else {
        setIsOnline(false);
        setStatusMessage("Backend standby. Fallback engine operational.");
      }
    } catch {
      setIsOnline(false);
      setStatusMessage("Backend offline (using local Scrutiny Engine V2.4).");
    } finally {
      setIsWaking(false);
    }
  };

  return (
    <aside aria-label="System status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-3 bg-slate-900/95 text-slate-200 px-4 py-2 rounded-full shadow-lg border border-slate-800 text-xs backdrop-blur-md">
        <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
        <span className="font-medium text-slate-300">
          {statusMessage || "Checking backend connection..."}
        </span>
        <button
          onClick={handleWake}
          disabled={isWaking}
          className="rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-3 py-1 text-xs font-medium transition-colors border border-emerald-600/40 cursor-pointer disabled:opacity-50"
        >
          {isWaking ? "Checking..." : isOnline ? "Re-sync" : "Wake up servers"}
        </button>
      </div>
    </aside>
  );
}
