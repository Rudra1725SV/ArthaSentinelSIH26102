"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NetworkGlobe } from "@/components/NetworkGlobe";
import { BackendStatusBar } from "@/components/BackendStatusBar";
import { WORKS, INVESTIGATIONS, SYSTEM_STATS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { getOverview, OverviewData } from "@/lib/api";

export default function OverviewLandingPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [scatterCategory, setScatterCategory] = useState("ALL");

  useEffect(() => {
    let isCancelled = false;
    getOverview()
      .then((data) => {
        if (!isCancelled && data) setOverview(data);
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    if (overview && overview.categories && overview.categories.length > 0) {
      return ["ALL", ...overview.categories.map((c) => c.category)];
    }
    return ["ALL", ...new Set(WORKS.map((w) => w.category))];
  }, [overview]);
  
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

  const totalWorks = overview ? overview.total_works : SYSTEM_STATS.totalWorks;
  const flaggedCases = overview ? overview.flagged_cases_count : SYSTEM_STATS.flaggedWorks;
  const districtsCount = overview ? overview.total_constituencies : SYSTEM_STATS.districtsCovered;
  const totalAllocated = overview ? overview.total_sanctioned_amount : SYSTEM_STATS.totalAllocated;

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

            {/* Left Hero Content Enclosed in Navy Blue Flexbox Container */}
            <div className="lg:col-span-6 flex flex-col justify-between p-7 sm:p-9 lg:p-10 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/50 shadow-xl space-y-7">
              {/* Eyebrow in Montserrat */}
              <div className="flex items-center gap-2 font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase">
                <span className="w-2.5 h-2.5 bg-orange-500 inline-block rounded-xs"></span>
                MPLADS · AI ANOMALY DETECTION ENGINE
              </div>

              {/* Hero Headline in Poppins */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-white leading-[1.15]">
                From project visibility<br />
                to <span className="text-[#60A5FA]">intelligent scrutiny.</span>
              </h1>

              {/* Hero Body in Inter */}
              <p className="font-sans text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                AI-powered anomaly detection and evidence-based review for MPLADS implementation — every sanctioned work, measured against the empirical peer record.
              </p>

              {/* Action Buttons in Inter */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/investigations"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans text-sm sm:text-base font-semibold px-6 py-3.5 transition-all shadow-md active:scale-[0.98]"
                >
                  Investigate Flagged Works
                  <span className="text-base leading-none">→</span>
                </Link>
                <Link
                  href="/detection"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 border border-white/20 font-sans text-sm sm:text-base font-semibold px-5 py-3.5 transition-colors shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-slate-300" strokeWidth="2">
                    <circle cx="12" cy="12" r="7" />
                    <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
                  </svg>
                  Explore Detection Engine
                </Link>
              </div>

              {/* High-Impact Metrics Strip in 2x2 Bento Pods */}
              <div className="pt-6 border-t border-white/15 space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-center">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {totalWorks.toLocaleString()}
                    </div>
                    <div className="font-emphasis text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                      {overview ? "WORKS INDEXED (LIVE)" : "WORKS INDEXED (SEED)"}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-center">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-400">
                      {flaggedCases}
                    </div>
                    <div className="font-emphasis text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                      {overview ? "FLAGGED (0 PENDING ML)" : "FLAGGED THIS CYCLE"}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-center">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {districtsCount}
                    </div>
                    <div className="font-emphasis text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                      DISTRICTS COVERED
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-center">
                    <div className="font-emphasis text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 truncate">
                      {formatCurrency(totalAllocated)}
                    </div>
                    <div className="font-emphasis text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                      SCRUTINIZED VALUE
                    </div>
                  </div>
                </div>

                {/* Live Parliamentary House Breakdown Strip */}
                {overview && (
                  <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-data text-slate-300">
                    <div className="inline-flex items-center gap-2 bg-blue-950/70 border border-blue-800/60 px-3 py-1.5 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <strong className="text-white font-semibold">Lok Sabha:</strong>
                      <span>{overview.lok_sabha_works.toLocaleString()} works ({overview.lok_sabha_mps} MPs)</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-purple-950/70 border border-purple-800/60 px-3 py-1.5 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <strong className="text-white font-semibold">Rajya Sabha:</strong>
                      <span>{overview.rajya_sabha_works.toLocaleString()} works ({overview.rajya_sabha_mps} MPs)</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <strong className="text-white font-semibold">PostgreSQL:</strong>
                      <span>Connected</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Magnified 3D Rotating Network Globe */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <NetworkGlobe />
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: DOMINANT ANALYTICAL VISUALIZATION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pt-8 space-y-10 border-t border-slate-200">
          {/* Section Header Flexbox Container */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-lg">
            <div>
              <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                PRIMARY ANALYTICAL SURFACE · MULTI-SIGNAL ISOLATION
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
                Where should investigators look first?
              </h2>
              <p className="font-sans text-sm sm:text-base text-slate-300 mt-1 max-w-3xl">
                Anomaly distribution across {districtsCount} parliamentary districts. Severe departures from the empirical peer baseline isolate projects for immediate forensic review.
              </p>
            </div>

            <Link
              href="/investigations"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-sm font-semibold transition-all shrink-0 shadow-xs"
            >
              Open Full Case Queue ({topInvestigations.length} Cases) &rarr;
            </Link>
          </div>

          {/* ─── DOMINANT FULL-WIDTH SCATTER VISUALIZATION ─── */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-950">
                  Anomaly Distribution: Sanctioned Cost vs. Composite Risk
                </h3>
                <p className="font-sans text-sm text-slate-500 mt-0.5">
                  Each circle represents a sanctioned MPLADS project. Distance along axes separates normal peer baselines from severe deviations.
                </p>
              </div>

              {/* Category Filter Controls */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setScatterCategory(cat)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-sans font-medium transition-all cursor-pointer ${
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
                      <text x={MARGIN.left - 12} y={yVal + 4} textAnchor="end" className="text-xs fill-slate-500 font-data font-semibold">
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
                      <text x={xVal} y={MARGIN.top + plotH + 22} textAnchor="middle" className="text-xs fill-slate-500 font-data font-semibold">
                        ₹{amount.toFixed(0)}L
                      </text>
                    </g>
                  );
                })}

                {/* Axis Titles in Montserrat (font-emphasis) */}
                <text x={MARGIN.left + plotW / 2} y={SCATTER_H - 6} textAnchor="middle" className="text-xs fill-slate-600 font-emphasis font-bold uppercase tracking-wider">
                  Sanctioned Project Cost (₹ Lakhs)
                </text>
                <text
                  x={16}
                  y={MARGIN.top + plotH / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, 16, ${MARGIN.top + plotH / 2})`}
                  className="text-xs fill-slate-600 font-emphasis font-bold uppercase tracking-wider"
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

            {/* Scatter Legend & Baseline Context */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm font-sans text-slate-600">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span> Critical Risk (&ge;80)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#F97316]"></span> Elevated Risk (60–79)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#94A3B8]"></span> Moderate Risk (30–59)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#CBD5E1]"></span> Within Peer Variance (&lt;30)
                </span>
              </div>
              <div className="font-data text-xs text-slate-500">
                Baseline: Median cost of peer cluster ± 1.5 IQR (Robust Z-Score)
              </div>
            </div>
          </div>

          {/* ─── SPLIT SECTION: TOP FLAGGED WORKS + CATEGORY SCRUTINY ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">

            {/* Left: Priority Scrutiny Cases */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-950">Priority Scrutiny Cases</h3>
                  <p className="font-sans text-sm text-slate-600">Projects exhibiting highest compound statistical divergence</p>
                </div>
                <Link
                  href="/investigations"
                  className="font-sans text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {topInvestigations.map((inv, idx) => {
                  const work = WORKS.find((w) => w.workId === inv.workId) || WORKS[0];
                  return (
                    <Link
                      key={inv.investigationId}
                      href={`/investigations/${work.workId}`}
                      className="block group pt-2.5 first:pt-0"
                    >
                      <div className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200">
                        <div className="font-emphasis text-base font-bold text-slate-400 mt-0.5 w-7">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-data text-sm font-bold text-blue-800">{work.workId}</span>
                            <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} showScore={true} />
                          </div>
                          <div className="font-sans text-sm sm:text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                            {work.description}
                          </div>
                          <div className="flex items-center justify-between text-xs sm:text-sm font-data text-slate-600">
                            <span>{work.constituency} · {formatCurrency(work.sanctionedAmount)}</span>
                            <span className="text-orange-700 font-semibold line-clamp-1 max-w-[220px]">{inv.primarySignal}</span>
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
                    <h3 className="font-heading text-xl font-bold text-slate-950">Category Portfolio Distribution</h3>
                    <p className="font-sans text-sm text-slate-600">Real MPLADS sector breakdown and sanctioned funding</p>
                  </div>
                  <span className="font-emphasis text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                    {overview ? `${overview.categories.length} CATEGORIES` : "5 DOMAINS"}
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {(overview && overview.categories.length > 0 ? overview.categories : [
                    { category: "Normal/Others", count: 22696, total_sanctioned: 12412315177.75, percentage_of_total: 97.95 },
                    { category: "Repair and Renovation", count: 263, total_sanctioned: 173786003, percentage_of_total: 1.37 },
                    { category: "Trust and Society", count: 85, total_sanctioned: 85525152, percentage_of_total: 0.67 },
                  ]).map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm font-sans">
                        <span className="font-medium text-slate-800">{item.category}</span>
                        <div className="font-data space-x-2 text-slate-600 text-xs sm:text-sm">
                          <span className="font-semibold text-slate-900">{formatCurrency(item.total_sanctioned)}</span>
                          <span>·</span>
                          <span className="text-blue-700 font-semibold">{item.count.toLocaleString()} works ({item.percentage_of_total}%)</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${Math.max(item.percentage_of_total, 2)}%` }} className="bg-blue-600 transition-all"></div>
                        <div style={{ width: `${100 - Math.max(item.percentage_of_total, 2)}%` }} className="bg-slate-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal Calibration Weights */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-heading text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Composite Risk Model Weights
                </div>
                <div className="grid grid-cols-3 gap-3 text-center font-sans">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="font-emphasis text-lg sm:text-xl font-extrabold text-amber-700">45%</div>
                    <div className="font-sans text-xs sm:text-sm text-slate-700 font-medium mt-0.5">Cost Variance</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="font-emphasis text-lg sm:text-xl font-extrabold text-indigo-700">35%</div>
                    <div className="font-sans text-xs sm:text-sm text-slate-700 font-medium mt-0.5">Semantic Match</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="font-emphasis text-lg sm:text-xl font-extrabold text-sky-700">20%</div>
                    <div className="font-sans text-xs sm:text-sm text-slate-700 font-medium mt-0.5">Clustering</div>
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
          {/* Section 3 Header Navy Blue Flexbox Container */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                SIH26102 · MULTI-DIMENSIONAL SCRUTINY ENGINE
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
                Four Algorithmic Detection Pillars
              </h2>
              <p className="font-sans text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
                ArthaSentinel synthesizes robust statistical baselines with deep text embeddings and administrative entity verification to isolate anomalies without subjective bias.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-blue-300 bg-white/10 px-3.5 py-2 rounded-xl shrink-0 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE MODELS · 4 SIGNALS
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {[
              { num: "01", title: "Cost Variance Analysis", desc: "Evaluates unit cost metrics against statistically comparable peers using robust Z-scores and IQR bands.", note: "Benchmark: State PWD SoR & District Medians" },
              { num: "02", title: "Semantic Duplicate Detection", desc: "Neural sentence embeddings and cosine matching across DPRs to identify identical asset specifications.", note: "Threshold: >80% Textual Similarity" },
              { num: "03", title: "Constituency & Vendor Clustering", desc: "Graph-based entity linking to detect contractor monopolies, repetitive agency awards, and cross-scheme duplicate assets.", note: "Cross-Reference: JJM, PMGSY & State PWD" },
              { num: "04", title: "Tender Splitting & Fiscal Clustering", desc: "Identifies sub-project splitting beneath committee thresholds and fiscal year-end sanction clusters.", note: "Model: Threshold Proximity & Timing" },
            ].map((p) => (
              <div key={p.num} className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-2 group hover:border-blue-600 hover:shadow-md transition-all">
                <div className="font-emphasis text-xs sm:text-sm font-bold text-blue-700">
                  PILLAR {p.num}
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="font-sans text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                <div className="pt-2 font-data text-xs sm:text-sm text-slate-500">{p.note}</div>
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
