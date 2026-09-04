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

  // Scatter plot SVG geometry
  const SCATTER_W = 760;
  const SCATTER_H = 420;
  const MARGIN = { top: 24, right: 28, bottom: 44, left: 56 };
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
            SECTION 2: GENERAL GRAPHS & CHARTS (FOLLOWED DOWNSIDE)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pt-6 space-y-8 border-t border-slate-200/90">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-emphasis text-xs font-bold tracking-wider text-blue-800 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                MACRO SCRUTINY SURFACES · GENERAL DISTRIBUTIONS
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1">
                Where should investigators look first?
              </h2>
              <p className="font-sans text-sm text-slate-600 mt-1 max-w-2xl">
                Prioritized anomaly signals across {SYSTEM_STATS.districtsCovered} districts. Outliers isolate projects that warrant forensic due diligence.
              </p>
            </div>

            <Link
              href="/investigations"
              className="font-sans text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
            >
              Open Full Case Queue ({INVESTIGATIONS.length}) →
            </Link>
          </div>

          {/* Grid: Dominant Scatter Plot + Needs Attention Queue */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* ─── GRAPH 1: ANOMALY DISTRIBUTION SCATTER PLOT ─── */}
            <div className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-950">Anomaly Distribution: Cost vs. Risk</h3>
                  <p className="font-sans text-xs text-slate-500">
                    Each point represents an MPLADS work. Visual distance separates peer baselines from severe deviations.
                  </p>
                </div>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                  {categories.slice(0, 5).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setScatterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                        scatterCategory === cat
                          ? "bg-white text-blue-900 shadow-xs border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      {cat === "ALL" ? "All Works" : cat.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive SVG Scatter Plot */}
              <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${SCATTER_W} ${SCATTER_H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  {/* Grid Lines & Y-Axis Labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                    const yVal = MARGIN.top + plotH * (1 - t);
                    return (
                      <g key={i}>
                        <line x1={MARGIN.left} y1={yVal} x2={MARGIN.left + plotW} y2={yVal} stroke="#E2E8F0" strokeWidth="1" />
                        <text x={MARGIN.left - 10} y={yVal + 4} textAnchor="end" className="text-[11px] fill-slate-500 font-data font-medium">
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
                        <line x1={xVal} y1={MARGIN.top} x2={xVal} y2={MARGIN.top + plotH} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={xVal} y={MARGIN.top + plotH + 20} textAnchor="middle" className="text-[10px] fill-slate-500 font-data font-medium">
                          ₹{amount.toFixed(0)}L
                        </text>
                      </g>
                    );
                  })}

                  {/* Axis Title Labels */}
                  <text x={MARGIN.left + plotW / 2} y={SCATTER_H - 8} textAnchor="middle" className="text-[11px] fill-slate-600 font-emphasis font-bold uppercase tracking-wider">
                    Sanctioned Project Cost (₹ Lakhs)
                  </text>
                  <text
                    x={14}
                    y={MARGIN.top + plotH / 2}
                    textAnchor="middle"
                    transform={`rotate(-90, 14, ${MARGIN.top + plotH / 2})`}
                    className="text-[11px] fill-slate-600 font-emphasis font-bold uppercase tracking-wider"
                  >
                    Composite Risk Score (0–100)
                  </text>

                  {/* Scatter Data Points */}
                  {filteredWorks.map((w) => {
                    const cx = MARGIN.left + (w.sanctionedAmount / maxCost) * plotW;
                    const cy = MARGIN.top + plotH - (w.riskScore / maxRisk) * plotH;
                    const isCritical = w.riskScore >= 80;
                    const isElevated = w.riskScore >= 60 && w.riskScore < 80;
                    const r = isCritical ? 8 : isElevated ? 6 : 4.5;

                    return (
                      <g key={w.workId} className="group">
                        {isCritical && (
                          <circle cx={cx} cy={cy} r={r + 5} fill="rgba(234, 88, 12, 0.18)" className="animate-pulse" />
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
                <div className="flex items-center gap-4 font-data">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span> Critical (&gt;80)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> Elevated (60–80)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Moderate (30–60)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Low Baseline</span>
                </div>
                <span className="text-[11px] text-slate-400 font-data">Click any point to open case</span>
              </div>
            </div>

            {/* ─── GRAPH 2: "NEEDS ATTENTION" PRIORITY QUEUE ─── */}
            <div className="xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading text-lg font-bold text-slate-950">Needs Attention</h3>
                  <span className="font-emphasis text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    TOP 5
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mb-4">
                  Ranked by multi-signal risk index for immediate scrutiny.
                </p>

                <div className="space-y-3 divide-y divide-slate-100">
                  {topInvestigations.map((inv, idx) => {
                    const work = WORKS.find((w) => w.workId === inv.workId);
                    if (!work) return null;
                    return (
                      <Link
                        key={inv.investigationId}
                        href={`/investigations/${work.workId}`}
                        className="block group pt-3 first:pt-0"
                      >
                        <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors -mx-1">
                          <div className="font-emphasis text-sm font-bold text-slate-400 mt-0.5 w-5">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-data text-xs font-bold text-blue-800">{work.workId}</span>
                              <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} showScore={false} />
                            </div>
                            <div className="font-sans text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                              {work.description}
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-data text-slate-500">
                              <span>{formatCurrency(work.sanctionedAmount)}</span>
                              <span className="text-orange-700 font-medium line-clamp-1 max-w-[140px]">{inv.primarySignal}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                href="/investigations"
                className="block text-center font-sans text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline pt-3 border-t border-slate-100"
              >
                View All {INVESTIGATIONS.length} Flagged Investigations →
              </Link>
            </div>
          </div>


          {/* ─── GRAPH 3: CATEGORY SCRUTINY & SPENDING DISTRIBUTIONS ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Category Risk Distribution Bars */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-950">
                    Category Scrutiny Distribution
                  </h3>
                  <p className="font-sans text-xs text-slate-500">
                    Comparison of flagged proportion vs. peer baseline across key infrastructure categories
                  </p>
                </div>
                <span className="font-emphasis text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  5 DOMAINS
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { name: "Community Infrastructure", totalCr: "₹142.6 Cr", flaggedPct: 34, normalPct: 66, flaggedCount: 48, status: "Critical" },
                  { name: "Drinking Water & Sanitation", totalCr: "₹98.4 Cr", flaggedPct: 28, normalPct: 72, flaggedCount: 31, status: "Elevated" },
                  { name: "Rural Connectivity & Roads", totalCr: "₹112.8 Cr", flaggedPct: 19, normalPct: 81, flaggedCount: 22, status: "Moderate" },
                  { name: "Renewable Energy & Solar", totalCr: "₹64.2 Cr", flaggedPct: 24, normalPct: 76, flaggedCount: 18, status: "Elevated" },
                  { name: "Public Health Facilities", totalCr: "₹48.1 Cr", flaggedPct: 12, normalPct: 88, flaggedCount: 6, status: "Low" },
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <div className="font-data space-x-2 text-slate-500">
                        <span className="font-semibold text-slate-900">{item.totalCr}</span>
                        <span>·</span>
                        <span className="text-orange-700 font-semibold">{item.flaggedCount} flagged ({item.flaggedPct}%)</span>
                      </div>
                    </div>
                    {/* Distribution Bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${item.flaggedPct}%` }} className="bg-orange-500 transition-all"></div>
                      <div style={{ width: `${item.normalPct}%` }} className="bg-slate-300/80"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-5 pt-3 border-t border-slate-100 text-[11px] font-sans text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> Flagged for Review</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Within Empirical Peer Baseline</span>
              </div>
            </div>

            {/* Signal Calibration & Weights */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-950">
                Detection Signal Composition
              </h3>
              <p className="font-sans text-xs text-slate-500">
                How signals contribute to the composite risk score (0–100)
              </p>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {[
                  { title: "Cost Variance Engine", weight: "45%", desc: "Robust Z-score & IQR dispersion vs peer median", color: "border-amber-300 bg-amber-50/60 text-amber-800" },
                  { title: "Semantic DPR Matching", weight: "35%", desc: "Neural cosine text embeddings across sanction DPRs", color: "border-indigo-300 bg-indigo-50/60 text-indigo-800" },
                  { title: "Constituency & Vendor Clustering", weight: "20%", desc: "Entity concentration, vendor monopolies & cross-scheme overlap", color: "border-sky-300 bg-sky-50/60 text-sky-800" },
                ].map((s) => (
                  <div key={s.title} className={`p-4 rounded-xl border ${s.color} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-bold text-slate-900">{s.title}</span>
                      <span className="font-emphasis text-xs font-extrabold px-2 py-0.5 rounded bg-white shadow-2xs">
                        Weight {s.weight}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-600">{s.desc}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/detection"
                className="block text-center font-sans text-xs font-semibold text-blue-700 hover:underline pt-2"
              >
                Learn more in Detection Engine →
              </Link>
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: FOUR DETECTION PILLARS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pt-4 space-y-6 border-t border-slate-200/90">
          <div>
            <div className="font-emphasis text-xs font-bold tracking-wider text-orange-700 uppercase">
              SIH26102 · MULTI-DIMENSIONAL SCRUTINY ENGINE
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1">
              Four Algorithmic Detection Pillars
            </h2>
            <p className="font-sans text-sm text-slate-600 mt-1 max-w-2xl">
              ArthaSentinel synthesizes robust statistical baselines with deep text embeddings and administrative entity verification to isolate anomalies without subjective bias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Cost Variance Analysis", desc: "Evaluates unit cost metrics against statistically comparable peers using robust Z-scores and IQR bands.", note: "Benchmark: State PWD SoR & District Medians" },
              { num: "02", title: "Semantic Duplicate Detection", desc: "Neural sentence embeddings and cosine matching across DPRs to identify identical asset specifications.", note: "Threshold: >80% Textual Similarity" },
              { num: "03", title: "Constituency & Vendor Clustering", desc: "Graph-based entity linking to detect contractor monopolies, repetitive agency awards, and cross-scheme duplicate assets.", note: "Cross-Reference: JJM, PMGSY & State PWD" },
              { num: "04", title: "Tender Splitting & Fiscal Clustering", desc: "Identifies sub-project splitting beneath committee thresholds and fiscal year-end sanction clusters.", note: "Model: Threshold Proximity & Timing" },
            ].map((p) => (
              <div key={p.num} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
                <div className="font-emphasis text-sm font-extrabold text-blue-700 bg-blue-50 border border-blue-200 w-9 h-9 rounded-lg flex items-center justify-center">
                  {p.num}
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">{p.title}</h3>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                <div className="pt-2 border-t border-slate-100 font-data text-[11px] text-slate-500">{p.note}</div>
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
