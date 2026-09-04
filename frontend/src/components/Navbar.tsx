"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEED_MPS, WORKS, SYSTEM_STATS } from "@/lib/mock-data";

const NAV_TABS = [
  {
    href: "/",
    label: "Overview",
    desc: "Landing & Macro Intelligence",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: "/detection",
    label: "Detection Engine",
    desc: "3 Signals & Algorithms",
    badge: "V2.4",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/investigations",
    label: "Investigations",
    desc: "Case Triage Queue",
    badge: `${SYSTEM_STATS.flaggedWorks} Flagged`,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/works",
    label: "Work Explorer",
    desc: "Project Registry",
    badge: `${SYSTEM_STATS.totalWorks}`,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    href: "/mps",
    label: "Browse MPs",
    desc: "Representatives Explorer",
    badge: `${SYSTEM_STATS.totalMPs}`,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    href: "/audit",
    label: "Audit Trail",
    desc: "Immutable Log",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About & Methodology",
    desc: "Peer Baselines & Ethics",
    badge: null,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function Navbar() {
  const pathname = usePathname();

  const isTabActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-[#FAF9F5]/98 backdrop-blur-md shadow-2xs">
      {/* ─── Top Brand & Institutional Bar ─── */}
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8 border-b border-slate-200/60">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white shadow-xs group-hover:border-blue-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-slate-700" strokeWidth="1.5">
              <line x1="4" y1="6" x2="11" y2="18" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="4" y1="6" x2="19" y2="9" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="11" y1="18" x2="19" y2="9" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="19" y1="9" x2="16" y2="19" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="4" cy="6" r="2.2" fill="#1D4ED8" />
              <circle cx="11" cy="18" r="2.2" fill="#1D4ED8" />
              <circle cx="16" cy="19" r="1.8" fill="#64748B" />
              <circle cx="19" cy="9" r="3.2" fill="#EA580C" />
              <circle cx="19" cy="9" r="5" stroke="#EA580C" strokeWidth="0.8" strokeDasharray="1 1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold tracking-tight text-slate-950">ArthaSentinel</span>
              <span className="hidden sm:inline-block font-emphasis text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">V2.4</span>
            </div>
            <p className="font-emphasis text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              MPLADS SCRUTINY &amp; ANOMALY DETECTION
            </p>
          </div>
        </Link>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Engine Status Pill */}
          <div className="hidden md:flex items-center gap-2 text-xs font-data bg-white/90 border border-slate-200/90 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-800">Scrutiny Engine Online</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Synthetic Record</span>
          </div>

          {/* Quick Metrics Pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-data text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <span className="font-semibold text-slate-900">{SEED_MPS.length}</span> MPs · <span className="font-semibold text-slate-900">{WORKS.length}</span> Works (Seed Data)
          </div>

          {/* Auditor Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:border-l border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-heading text-xs font-bold shadow-2xs">
              KR
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-sans text-xs font-bold text-slate-900">Dr. K. S. Ramanathan</div>
              <div className="font-data text-[10px] text-slate-500">Senior Nodal Auditor</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Subtle Institutional Horizontal Tabs ─── */}
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <nav className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {NAV_TABS.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`group relative flex items-center gap-2 py-3 text-xs sm:text-[13px] font-sans tracking-normal transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "text-blue-950 font-bold"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                {/* Tab Icon */}
                <span className={`transition-colors ${active ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {tab.icon}
                </span>

                {/* Tab Label */}
                <span>{tab.label}</span>

                {/* Optional Subtle Badge */}
                {tab.badge && (
                  <span
                    className={`font-data text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      active
                        ? "bg-blue-100/80 text-blue-900"
                        : tab.badge.includes("Flagged")
                        ? "bg-orange-100/80 text-orange-800"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/60"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Sleek Active Indicator Bar */}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-700" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
