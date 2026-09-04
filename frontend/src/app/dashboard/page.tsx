"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, INVESTIGATIONS, SYSTEM_STATS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function DashboardPage() {
  const [scatterAxis, setScatterAxis] = useState<"cost" | "risk">("risk");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const categories = useMemo(() => ["ALL", ...new Set(WORKS.map((w) => w.category))], []);
  const filteredWorks = useMemo(() => {
    if (filterCategory === "ALL") return WORKS;
    return WORKS.filter((w) => w.category === filterCategory);
  }, [filterCategory]);

  const topInvestigations = INVESTIGATIONS.filter((inv) => inv.status !== "Resolved" && inv.status !== "Dismissed")
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // Scatter plot constants
  const SCATTER_W = 720;
  const SCATTER_H = 400;
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotW = SCATTER_W - MARGIN.left - MARGIN.right;
  const plotH = SCATTER_H - MARGIN.top - MARGIN.bottom;

  const maxCost = Math.max(...filteredWorks.map((w) => w.sanctionedAmount));
  const maxRisk = 100;
  const maxDeviation = Math.max(...filteredWorks.map((w) => w.deviationPercentage));

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950">
            Where should investigators look first?
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Prioritized anomaly signals across {SYSTEM_STATS.districtsCovered} districts. Synthetic demonstration data.
          </p>
        </div>

        {/* Compact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: SYSTEM_STATS.totalWorksAnalyzed.toLocaleString(), label: "WORKS ANALYZED" },
            { value: SYSTEM_STATS.potentialAnomalies.toString(), label: "POTENTIAL ANOMALIES", highlight: true },
            { value: SYSTEM_STATS.highRisk.toString(), label: "HIGH-RISK", highlight: true },
            { value: SYSTEM_STATS.priorityInvestigations.toString(), label: "PRIORITY INVESTIGATIONS" },
          ].map((m, i) => (
            <div key={i} className="space-y-0.5">
              <div className={`font-heading text-2xl font-bold tracking-tight ${m.highlight ? "text-orange-700" : "text-slate-950"}`}>
                {m.value}
              </div>
              <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* ─── SCATTER PLOT (Dominant) ─── */}
          <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-base font-bold text-slate-950">Anomaly Distribution</h2>
                <p className="text-xs text-slate-500">Each point represents an MPLADS work. Outliers separate visually from baseline.</p>
              </div>
              <div className="flex items-center gap-2">
                {(["ALL", ...categories.filter(c => c !== "ALL").slice(0, 4)] as string[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      filterCategory === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat === "ALL" ? "All" : cat.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <svg viewBox={`0 0 ${SCATTER_W} ${SCATTER_H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                <g key={i}>
                  <line x1={MARGIN.left} y1={MARGIN.top + plotH * (1 - t)} x2={MARGIN.left + plotW} y2={MARGIN.top + plotH * (1 - t)} stroke="#E2E8F0" strokeWidth="1" />
                  <text x={MARGIN.left - 8} y={MARGIN.top + plotH * (1 - t) + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{Math.round(t * maxRisk)}</text>
                </g>
              ))}
              {/* Axis labels */}
              <text x={MARGIN.left + plotW / 2} y={SCATTER_H - 4} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">Sanctioned Cost (₹)</text>
              <text x={12} y={MARGIN.top + plotH / 2} textAnchor="middle" transform={`rotate(-90, 12, ${MARGIN.top + plotH / 2})`} className="text-[10px] fill-slate-500 font-mono">Risk Score</text>

              {/* Data points */}
              {filteredWorks.map((w) => {
                const cx = MARGIN.left + (w.sanctionedAmount / maxCost) * plotW;
                const cy = MARGIN.top + plotH - (w.riskScore / maxRisk) * plotH;
                const isHigh = w.riskScore >= 70;
                const isCritical = w.riskScore >= 80;
                const r = isCritical ? 7 : isHigh ? 5.5 : 4;
                return (
                  <g key={w.workId}>
                    {isHigh && <circle cx={cx} cy={cy} r={r + 4} fill={isCritical ? "rgba(234,88,12,0.15)" : "rgba(234,88,12,0.08)"} />}
                    <Link href={`/investigations/${w.workId}`}>
                      <circle
                        cx={cx} cy={cy} r={r}
                        fill={isCritical ? "#EA580C" : isHigh ? "#F97316" : w.riskScore >= 30 ? "#94A3B8" : "#CBD5E1"}
                        stroke={isCritical ? "#C2410C" : "none"}
                        strokeWidth="1.5"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                  </g>
                );
              })}
            </svg>

            <div className="flex items-center gap-6 mt-3 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>Critical (&gt;80)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>Elevated (60–80)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>Moderate (30–60)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>Low (&lt;30)</span>
            </div>
          </div>

          {/* ─── NEEDS ATTENTION ─── */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h2 className="font-heading text-base font-bold text-slate-950 mb-1">Needs Attention</h2>
            <p className="text-xs text-slate-500 mb-4">Ranked by composite risk score.</p>

            <div className="space-y-4">
              {topInvestigations.map((inv, idx) => {
                const work = WORKS.find((w) => w.workId === inv.workId);
                if (!work) return null;
                return (
                  <Link key={inv.investigationId} href={`/investigations/${work.workId}`} className="block group">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-1">
                      <div className="font-mono text-xs font-bold text-slate-400 mt-0.5 w-5">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="font-mono text-xs font-semibold text-blue-800">{work.workId}</div>
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">{work.description}</div>
                        <div className="text-xs text-slate-500">{formatCurrency(work.sanctionedAmount)}</div>
                        <div className="text-xs text-orange-700 font-medium">{inv.primarySignal}</div>
                      </div>
                      <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} showScore={false} className="mt-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link href="/investigations" className="block text-center text-xs text-blue-700 hover:underline font-medium mt-4 pt-3 border-t border-slate-100">
              View All Investigations →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
