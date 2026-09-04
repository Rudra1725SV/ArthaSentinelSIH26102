"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-[#FAF9F5]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white shadow-2xs">
            {/* Custom SVG logo representing interconnected nodes with anomaly signal */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5 text-slate-700"
              strokeWidth="1.5"
            >
              {/* Edges */}
              <line x1="4" y1="6" x2="11" y2="18" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="4" y1="6" x2="19" y2="9" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="11" y1="18" x2="19" y2="9" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="19" y1="9" x2="16" y2="19" stroke="#94a3b8" strokeWidth="1.2" />
              
              {/* Normal Nodes */}
              <circle cx="4" cy="6" r="2.2" fill="#1D4ED8" />
              <circle cx="11" cy="18" r="2.2" fill="#1D4ED8" />
              <circle cx="16" cy="19" r="1.8" fill="#64748B" />
              
              {/* Anomaly Node (Orange) */}
              <circle cx="19" cy="9" r="3" fill="#EA580C" />
              <circle cx="19" cy="9" r="4.5" stroke="#EA580C" strokeWidth="0.8" strokeDasharray="1 1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-semibold tracking-tight text-slate-950">
                ArthaSentinel
              </span>
            </div>
            <p className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              MPLADS SCRUTINY ENGINE · V2.4
            </p>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            href="/#overview"
            className="transition-colors hover:text-slate-950"
          >
            Overview
          </Link>
          <Link
            href="/#detection"
            className="transition-colors hover:text-slate-950"
          >
            Detection
          </Link>
          <Link
            href="/#investigations"
            className={`transition-colors hover:text-slate-950 ${
              pathname === "/" ? "text-slate-900 font-semibold" : ""
            }`}
          >
            Investigations
          </Link>
          <Link
            href="/methodology"
            className={`transition-colors hover:text-slate-950 ${
              pathname === "/methodology" ? "text-blue-700 font-semibold" : ""
            }`}
          >
            Methodology
          </Link>
          <Link
            href="/contractors/Apex%20Rural%20Infra"
            className={`transition-colors hover:text-slate-950 ${
              pathname.startsWith("/contractors") ? "text-blue-700 font-semibold" : ""
            }`}
          >
            Agencies
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/#investigations"
            className="inline-flex items-center justify-center rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-medium px-4 py-2 transition-all shadow-xs active:scale-[0.98]"
          >
            Launch Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
