"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NetworkGlobe } from "@/components/NetworkGlobe";
import { BackendStatusBar } from "@/components/BackendStatusBar";
import { WORKS, INVESTIGATIONS, SYSTEM_STATS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function OverviewLandingPage() {
  const [scatterCategory, setScatterCategory] = useState("ALL");

  const categories = useMemo(() => ["ALL", ...new Set(WORKS.map((w) => w.category))], []);
  
  const filteredWorks = useMemo(() => {
    if (scatterCategory === "ALL") return WORKS;
    return WORKS.filter((w) => w.category === scatterCategory);
  }, [scatterCategory]);

  const topInvestigations = useMemo(() => {
    return INVESTIGATIONS.filter((inv) => inv.status !== "Resolved" && inv.status !== "Dismissed")
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, []);

  // Scatter plot SVG geometry (Dominant wide-screen layout)
  const SCATTER_W = 1000;
  const SCATTER_H = 460;
  const MARGIN = { top: 28, right: 36, bottom: 48, left: 60 };
  const plotW = SCATTER_W - MARGIN.left - MARGIN.right;
  const plotH = SCATTER_H - MARGIN.top - MARGIN.bottom;

  const maxCost = Math.max(...filteredWorks.map((w) => w.sanctionedAmount));
  const maxRisk = 100;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm flex flex-col">
      {/* ─── Unified Header with Big Tabs ─── */}
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1500px] px-4 sm:px-8 py-6 sm:py-10 space-y-16">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: HERO (LANDING IN OVERVIEW TAB)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-2 pb-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">

            {/* Left Hero Content */}
            <div className="lg:col-span-5 space-y-7">
              {/* Eyebrow in Montserrat */}
              <div className="flex items-center gap-2 font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-700 uppercase">
                <span className="w-2.5 h-2.5 bg-orange-600 inline-block rounded-xs"></span>
                MPLADS · AI ANOMALY DETECTION ENGINE
              </div>

              {/* Hero Headline in Poppins */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                From project visibility<br />
                to <span className="text-[#1D4ED8]">intelligent scrutiny.</span>
              </h1>

              {/* Hero Body in Inter */}
              <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                AI-powered anomaly detection and evidence-based review for MPLADS implementation — every sanctioned work, measured against the empirical peer record.
              </p>

              {/* Action Buttons in Inter */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/investigations"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-sans text-sm sm:text-base font-semibold px-6 py-3.5 transition-all shadow-xs active:scale-[0.98]"
                >
                  Investigate Flagged Works
                  <span className="text-base leading-none">→</span>
                </Link>
                <Link
                  href="/detection"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-sans text-sm sm:text-base font-semibold px-5 py-3.5 transition-colors shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-slate-500" strokeWidth="2">
                    <circle cx="12" cy="12" r="7" />
                    <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
                  </svg>
                  Explore Detection Engine
                </Link>
              </div>

              {/* High-Impact Metrics Strip in Montserrat + Inter */}
              <div className="pt-8 border-t border-slate-300/70">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x-0 sm:divide-x divide-slate-300/70">
                  <div className="sm:pr-3">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                      {SYSTEM_STATS.totalWorks.toLocaleString()}
                    </div>
                    <div className="font-emphasis text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-1">
                      WORKS INDEXED (SEED)
                    </div>
                  </div>
                  <div className="sm:px-3">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-600">
                      {SYSTEM_STATS.flaggedWorks}
                    </div>
                    <div className="font-emphasis text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-1">
                      FLAGGED THIS CYCLE
                    </div>
                  </div>
                  <div className="sm:px-3">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                      {SYSTEM_STATS.districtsCovered}
                    </div>
                    <div className="font-emphasis text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-1">
                      DISTRICTS COVERED
                    </div>
                  </div>
                  <div className="sm:pl-3">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-800">
                      {formatCurrency(SYSTEM_STATS.totalAllocated)}
                    </div>
                    <div className="font-emphasis text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-1">
                      SCRUTINIZED VALUE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Magnified 3D Rotating Network Globe */}
            <div className="lg:col-span-7 flex justify-center items-center">
              <NetworkGlobe />
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: DOMINANT ANALYTICAL VISUALIZATION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pt-8 space-y-10 border-t border-slate-200">
          {/* Section Title with proper typography hierarchy */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-emphasis text-[11px] font-bold tracking-wider text-blue-800 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                PRIMARY ANALYTICAL SURFACE · MULTI-SIGNAL ISOLATION
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1.5">
                Where should investigators look first?
              </h2>
              <p className="font-sans text-sm sm:text-base text-slate-600 mt-1 max-w-3xl">
                Anomaly distribution across {SYSTEM_STATS.districtsCovered} parliamentary districts. Severe departures from the empirical peer baseline isolate projects for immediate forensic review.
              </p>
            </div>

            <Link
              href="/investigations"
              className="font-sans text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1.5 shrink-0"
            >
              Open Full Case Queue ({INVESTIGATIONS.length} Flagged) &rarr;
            </Link>
          </div>

          {/* ─── DOMINANT FULL-WIDTH SCATTER VISUALIZATION ─── */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-950">
                  Anomaly Distribution: Sanctioned Cost vs. Composite Risk
                </h3>
                <p className="font-sans text-xs text-slate-500 mt-0.5">
                  Each circle represents a sanctioned MPLADS project. Distance along axes separates normal peer baselines from severe deviations.
                </p>
              </div>

              {/* Category Filter Controls */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setScatterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                      scatterCategory === cat
                        ? "bg-white text-blue-950 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/50"
                    }`}
                  >
                    {cat === "ALL" ? "All Categories" : cat.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Expansive SVG Scatter Plot */}
            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${SCATTER_W} ${SCATTER_H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {/* Grid Lines & Y-Axis Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                  const yVal = MARGIN.top + plotH * (1 - t);
                  return (
                    <g key={i}>
                      <line x1={MARGIN.left} y1={yVal} x2={MARGIN.left + plotW} y2={yVal} stroke="#E2E8F0" strokeWidth="0.8" />
                      <text x={MARGIN.left - 12} y={yVal + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-data font-medium">
                        {Math.round(t * maxRisk)}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Cost Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                  const xVal = MARGIN.left + plotW * t;
                  const amount = (t * maxCost) / 100000;
                  return (
                    <g key={i}>
                      <line x1={xVal} y1={MARGIN.top} x2={xVal} y2={MARGIN.top + plotH} stroke="#F1F5F9" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x={xVal} y={MARGIN.top + plotH + 22} textAnchor="middle" className="text-[10px] fill-slate-400 font-data font-medium">
                        ₹{amount.toFixed(0)}L
                      </text>
                    </g>
                  );
                })}

                {/* Axis Titles in Montserrat (font-emphasis) */}
                <text x={MARGIN.left + plotW / 2} y={SCATTER_H - 6} textAnchor="middle" className="text-[10px] fill-slate-500 font-emphasis font-bold uppercase tracking-wider">
                  Sanctioned Project Cost (₹ Lakhs)
                </text>
                <text
                  x={16}
                  y={MARGIN.top + plotH / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, 16, ${MARGIN.top + plotH / 2})`}
                  className="text-[10px] fill-slate-500 font-emphasis font-bold uppercase tracking-wider"
                >
                  Composite Risk Score (0–100)
                </text>

                {/* Scatter Data Points */}
                {filteredWorks.map((w) => {
                  const cx = MARGIN.left + (w.sanctionedAmount / maxCost) * plotW;
                  const cy = MARGIN.top + plotH - (w.riskScore / maxRisk) * plotH;
                  const isCritical = w.riskScore >= 80;
                  const isElevated = w.riskScore >= 60 && w.riskScore < 80;
                  const r = isCritical ? 7.5 : isElevated ? 5.5 : 4;

                  return (
                    <g key={w.workId} className="group">
                      {isCritical && (
                        <circle cx={cx} cy={cy} r={r + 6} fill="rgba(234, 88, 12, 0.15)" className="animate-pulse" />
                      )}
                      <Link href={`/investigations/${w.workId}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={isCritical ? "#EA580C" : isElevated ? "#F97316" : w.riskScore >= 30 ? "#94A3B8" : "#CBD5E1"}
                          stroke={isCritical ? "#C2410C" : "#FFFFFF"}
                          strokeWidth={isCritical ? "2" : "1"}
                          className="cursor-pointer transition-transform hover:scale-125"
                        />
                      </Link>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Scatter Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs font-sans text-slate-600">
              <div className="flex items-center gap-5 font-data text-xs">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span> Critical Flag (&ge;80)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> Elevated Risk (60–79)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Moderate Variance (30–59)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Low Baseline (&lt;30)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-data">Click any point to open investigative triage dossier</span>
            </div>
          </div>

          {/* ─── SUPPORTING INSIGHTS: PRIORITY QUEUE & CATEGORY SCRUTINY ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Priority Investigation Queue (Unboxed Clean List) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-950">Immediate Scrutiny Priority</h3>
                  <p className="font-sans text-xs text-slate-500">Highest composite anomaly indices requiring nodal due diligence</p>
                </div>
                <span className="font-emphasis text-[10px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  TOP 5 CASES
                </span>
              </div>

              <div className="space-y-2.5 divide-y divide-slate-100">
                {topInvestigations.map((inv, idx) => {
                  const work = WORKS.find((w) => w.workId === inv.workId);
                  if (!work) return null;
                  return (
                    <Link
                      key={inv.investigationId}
                      href={`/investigations/${work.workId}`}
                      className="block group pt-2.5 first:pt-0"
                    >
                      <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200">
                        <div className="font-emphasis text-sm font-bold text-slate-400 mt-0.5 w-6">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-data text-xs font-bold text-blue-800">{work.workId}</span>
                            <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} showScore={true} />
                          </div>
                          <div className="font-sans text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                            {work.description}
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-data text-slate-500">
                            <span>{work.constituency} · {formatCurrency(work.sanctionedAmount)}</span>
                            <span className="text-orange-700 font-medium line-clamp-1 max-w-[200px]">{inv.primarySignal}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Category Scrutiny & Detection Signal Weights */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category Scrutiny */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-950">Category Scrutiny Distribution</h3>
                    <p className="font-sans text-xs text-slate-500">Proportion of flagged works across infrastructure sectors</p>
                  </div>
                  <span className="font-emphasis text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    5 DOMAINS
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    { name: "Community Infrastructure", totalCr: "₹142.6 Cr", flaggedPct: 34, normalPct: 66, flaggedCount: 48 },
                    { name: "Drinking Water & Sanitation", totalCr: "₹98.4 Cr", flaggedPct: 28, normalPct: 72, flaggedCount: 31 },
                    { name: "Rural Connectivity & Roads", totalCr: "₹112.8 Cr", flaggedPct: 19, normalPct: 81, flaggedCount: 22 },
                    { name: "Renewable Energy & Solar", totalCr: "₹64.2 Cr", flaggedPct: 24, normalPct: 76, flaggedCount: 18 },
                    { name: "Public Health Facilities", totalCr: "₹48.1 Cr", flaggedPct: 12, normalPct: 88, flaggedCount: 6 },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <div className="font-data space-x-2 text-slate-500 text-[11px]">
                          <span className="font-semibold text-slate-900">{item.totalCr}</span>
                          <span>·</span>
                          <span className="text-orange-700 font-semibold">{item.flaggedCount} flagged ({item.flaggedPct}%)</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${item.flaggedPct}%` }} className="bg-orange-500 transition-all"></div>
                        <div style={{ width: `${item.normalPct}%` }} className="bg-slate-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal Calibration Weights */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Composite Risk Model Weights
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-sans">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="font-emphasis text-base font-bold text-amber-700">45%</div>
                    <div className="font-sans text-[11px] text-slate-600 mt-0.5">Cost Variance</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="font-emphasis text-base font-bold text-indigo-700">35%</div>
                    <div className="font-sans text-[11px] text-slate-600 mt-0.5">Semantic Match</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="font-emphasis text-base font-bold text-sky-700">20%</div>
                    <div className="font-sans text-[11px] text-slate-600 mt-0.5">Clustering</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: FOUR DETECTION PILLARS (OPEN ANALYTICAL GRID)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pt-8 space-y-6 border-t border-slate-200">
          <div>
            <div className="font-emphasis text-[11px] font-bold tracking-wider text-orange-700 uppercase">
              SIH26102 · MULTI-DIMENSIONAL SCRUTINY ENGINE
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1">
              Four Algorithmic Detection Pillars
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
              ArthaSentinel synthesizes robust statistical baselines with deep text embeddings and administrative entity verification to isolate anomalies without subjective bias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {[
              { num: "01", title: "Cost Variance Analysis", desc: "Evaluates unit cost metrics against statistically comparable peers using robust Z-scores and IQR bands.", note: "Benchmark: State PWD SoR & District Medians" },
              { num: "02", title: "Semantic Duplicate Detection", desc: "Neural sentence embeddings and cosine matching across DPRs to identify identical asset specifications.", note: "Threshold: >80% Textual Similarity" },
              { num: "03", title: "Constituency & Vendor Clustering", desc: "Graph-based entity linking to detect contractor monopolies, repetitive agency awards, and cross-scheme duplicate assets.", note: "Cross-Reference: JJM, PMGSY & State PWD" },
              { num: "04", title: "Tender Splitting & Fiscal Clustering", desc: "Identifies sub-project splitting beneath committee thresholds and fiscal year-end sanction clusters.", note: "Model: Threshold Proximity & Timing" },
            ].map((p) => (
              <div key={p.num} className="border-t-2 border-slate-300 pt-4 space-y-2 group hover:border-blue-600 transition-colors">
                <div className="font-emphasis text-xs font-bold text-blue-700">
                  PILLAR {p.num}
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">{p.title}</h3>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                <div className="pt-2 font-data text-[11px] text-slate-400">{p.note}</div>
              </div>
            ))}
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: INSTITUTIONAL FOOTER
        ═══════════════════════════════════════════════════════════════ */}
        <footer className="pt-10 pb-6 border-t border-slate-200 text-center space-y-4">
          <p className="font-sans text-sm text-slate-500 tracking-wide">
            Transparency · Better Governance · Stronger Communities
          </p>
          <div className="max-w-2xl mx-auto rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs font-sans text-amber-900 leading-relaxed">
            <strong>Important:</strong> Anomaly detection indicates unusual patterns compared with peer baselines and does not establish wrongdoing. All flagged works require human investigation, contextual review, and due process.
          </div>
          <div className="flex items-center justify-center gap-6 font-data text-xs text-slate-400 pt-2">
            <span className="font-heading font-bold text-slate-700">ArthaSentinel</span>
            <span>MPLADS Scrutiny Engine V2.4</span>
            <span>SIH26102</span>
          </div>
        </footer>

      </main>

      <BackendStatusBar />
    </div>
  );
}
