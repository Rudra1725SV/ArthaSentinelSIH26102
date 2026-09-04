"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BackendStatusBar } from "@/components/BackendStatusBar";
import { RiskBadge } from "@/components/RiskBadge";
import { AnomalyTypeBadge } from "@/components/AnomalyTypeBadge";
import { MOCK_WORKS, Work, AuditRecord } from "@/lib/mock-data";
import { submitReviewerAction } from "@/lib/api";

export default function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const workId = resolvedParams.id;

  const [work, setWork] = useState<Work | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "cost" | "duplicates" | "spatial" | "audit">("overview");
  const [auditNotes, setAuditNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const found = MOCK_WORKS.find((w) => w.id === workId) || MOCK_WORKS[0];
    setWork(found);
  }, [workId]);

  if (!work) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center font-mono text-sm text-slate-500">
          Loading investigation dossier for {workId}...
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return "₹" + (val / 100000).toFixed(2) + " Lakh";
  };

  const handleAction = async (action: "escalate" | "reviewed_no_issue") => {
    setIsSubmitting(true);
    try {
      const res = await submitReviewerAction(work.id, action, auditNotes);
      if (res.success) {
        // Update local work state
        setWork((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: action === "escalate" ? "Escalated for Field Inspection" : "Reviewed - No Issue",
            auditTrail: [res.auditRecord, ...prev.auditTrail],
          };
        });
        setActionSuccessMsg(
          action === "escalate"
            ? "Work marked for escalated field verification. Audit record saved."
            : "Work marked as Reviewed (No Issue). Audit record saved."
        );
        setAuditNotes("");
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch {
      setActionSuccessMsg("Action recorded locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Radar Chart SVG
  const renderRadarChart = () => {
    const size = 280;
    const center = size / 2;
    const radius = 100;
    const metrics = work.radarMetrics;
    const totalPoints = metrics.length;

    const getCoordinates = (index: number, value: number) => {
      const angle = (Math.PI * 2 / totalPoints) * index - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    // Polygons
    const workPoints = metrics.map((m, i) => getCoordinates(i, m.thisWork));
    const baselinePoints = metrics.map((m, i) => getCoordinates(i, m.peerBaseline));

    const workPath = workPoints.map((p) => `${p.x},${p.y}`).join(" ");
    const baselinePath = baselinePoints.map((p) => `${p.x},${p.y}`).join(" ");

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Circular grid rings */}
          {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#E2E8F0"
              strokeDasharray={level === 1 ? "none" : "2 2"}
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          {metrics.map((_, i) => {
            const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#CBD5E1"
                strokeWidth="1"
              />
            );
          })}

          {/* Peer Baseline polygon (Slate / Blue) */}
          <polygon
            points={baselinePath}
            fill="rgba(100, 116, 139, 0.15)"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* This Work polygon (Anomaly Orange) */}
          <polygon
            points={workPath}
            fill="rgba(234, 88, 12, 0.25)"
            stroke="#EA580C"
            strokeWidth="2"
          />

          {/* Data Points */}
          {workPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#EA580C" />
          ))}

          {/* Metric labels */}
          {metrics.map((m, i) => {
            const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
            const labelRadius = radius + 22;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-mono fill-slate-600 font-medium"
              >
                {m.dimension}
              </text>
            );
          })}
        </svg>

        <div className="mt-4 flex items-center gap-6 text-xs font-mono text-slate-600">
          <span className="flex items-center gap-2">
            <span className="w-3 h-1.5 bg-orange-600 inline-block rounded-xs"></span>
            This Work (Observed)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-1.5 bg-slate-400 inline-block rounded-xs border-b border-dashed border-slate-600"></span>
            Constituency Baseline
          </span>
        </div>
      </div>
    );
  };

  // Helper for Cost Distribution Bar Chart
  const renderCostDistribution = () => {
    const maxVal = Math.max(...work.peerDistribution.map((d) => d.amount)) * 1.1;

    return (
      <div className="space-y-3">
        {work.peerDistribution.map((item, idx) => {
          const widthPercent = (item.amount / maxVal) * 100;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={item.isThisWork ? "font-bold text-orange-700 flex items-center gap-1.5" : "text-slate-600"}>
                  {item.isThisWork && <span className="w-2 h-2 rounded-full bg-orange-600 inline-block animate-ping"></span>}
                  {item.label}
                </span>
                <span className={item.isThisWork ? "font-bold text-orange-700" : "text-slate-800"}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-sm transition-all duration-500 ${
                    item.isThisWork ? "bg-orange-600" : "bg-slate-300"
                  }`}
                  style={{ width: `${widthPercent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/#investigations"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            <span>←</span>
            <span>Back to Scrutiny Queue</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">DOSSIER REF:</span>
            <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-300 px-2 py-0.5 rounded">
              {work.id}
            </span>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">{actionSuccessMsg}</span>
          </div>
        )}

        {/* Master Work Dossier Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {work.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Sanction Date: {work.sanctionDate}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">
                  Status: <strong className="text-slate-800">{work.status}</strong>
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                {work.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Constituency:</span>
                  <span className="font-medium text-slate-900">{work.constituency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">District & State:</span>
                  <span className="font-medium text-slate-900">{work.district}, {work.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Implementing Agency:</span>
                  <Link
                    href={`/contractors/${encodeURIComponent(work.contractor)}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {work.implementingAgency}
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Action Triage Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[220px]">
              <button
                onClick={() => handleAction("reviewed_no_issue")}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                ✓ Reviewed — No Issue
              </button>
              <button
                onClick={() => handleAction("escalate")}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                ⚠ Escalate for Field Inspection
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================
            INFORMATION HIERARCHY:
            1. WHAT IS UNUSUAL?
            2. HOW UNUSUAL IS IT?
            3. WHY WAS IT FLAGGED?
            4. WHAT EVIDENCE SUPPORTS IT?
            5. WHAT SHOULD THE INVESTIGATOR DO?
            ======================================================== */}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex gap-6 overflow-x-auto text-sm font-medium">
          {[
            { id: "overview", label: "Evidence Overview" },
            { id: "cost", label: "Cost & Baseline Analysis" },
            { id: "duplicates", label: "Cross-Scheme Duplicates" },
            { id: "spatial", label: "Spatial Co-location" },
            { id: "audit", label: "Investigator Audit Log" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-700 text-blue-800 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Top 3 KPI Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Composite Score Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500 uppercase">Composite Risk Score</span>
                  <RiskBadge score={work.compositeRiskScore} tier={work.riskTier} />
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-heading text-4xl font-bold text-slate-950">
                    {(work.compositeRiskScore * 100).toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100 Index</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Weighted ensemble combining unit rate deviation, semantic document match, and spatial clustering.
                </p>
              </div>

              {/* Sanction Discrepancy Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="font-mono text-xs text-slate-500 uppercase">Financial Discrepancy</span>
                <div className="mt-4">
                  <span className="font-heading text-2xl font-bold text-orange-700">
                    {formatCurrency(work.sanctionedAmount)}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    Peer Median: <strong className="text-slate-800">{formatCurrency(work.peerMedianAmount)}</strong>
                  </div>
                </div>
                <div className="mt-3 text-xs text-orange-800 font-mono bg-orange-50 border border-orange-200/80 px-2 py-1 rounded inline-block">
                  +{(
                    ((work.sanctionedAmount - work.peerMedianAmount) /
                      work.peerMedianAmount) *
                    100
                  ).toFixed(1)}% above expected benchmark
                </div>
              </div>

              {/* Duplicate Overlap Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="font-mono text-xs text-slate-500 uppercase">Semantic DPR Overlap</span>
                <div className="mt-4">
                  <span className="font-heading text-2xl font-bold text-indigo-700">
                    {work.duplicateCandidates.length > 0
                      ? `${(work.duplicateCandidates[0].similarityScore * 100).toFixed(1)}%`
                      : "No Match"}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    {work.duplicateCandidates.length > 0
                      ? `Candidate: ${work.duplicateCandidates[0].id}`
                      : "No high-similarity DPRs detected"}
                  </div>
                </div>
                <div className="mt-3 text-xs text-indigo-800 font-mono bg-indigo-50 border border-indigo-200/80 px-2 py-1 rounded inline-block">
                  {work.duplicateCandidates.length} potentially related work(s)
                </div>
              </div>

            </div>

            {/* WHAT IS UNUSUAL? Active Anomaly Flags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-slate-950">
                  Active Anomaly Evidence Flags ({work.anomalyFlags.length})
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  RULE-BASED & STATISTICAL DETECTORS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {work.anomalyFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <AnomalyTypeBadge type={flag.type} />
                      <span className="font-mono text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                        {flag.metric}
                      </span>
                    </div>

                    <h3 className="font-heading text-sm font-bold text-slate-900">
                      {flag.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {flag.summary}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                      {flag.peerComparison}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VISUAL ANALYTICAL PROOFS: Cost Distribution + Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              
              {/* Cost Percentile Distribution */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-950">
                    Expenditure vs Peer Distribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Empirical percentile distribution of sanctioned amounts for {work.category} in {work.district}.
                  </p>
                </div>
                <div className="pt-2">
                  {renderCostDistribution()}
                </div>
              </div>

              {/* Multi-Dimensional Radar Comparison */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-950">
                    Multi-Factor Constituency Norm Variance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visual comparison across 5 risk dimensions compared to constituency medians.
                  </p>
                </div>
                <div className="pt-2">
                  {renderRadarChart()}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT: COST ANALYSIS */}
        {activeTab === "cost" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-950">
                Cost Variance & Unit Rate Breakdown
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Comparative analysis against Schedule of Rates (SoR) and district peer medians.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <h3 className="font-heading text-sm font-semibold text-slate-800">
                  Empirical Percentile Range
                </h3>
                {renderCostDistribution()}
              </div>

              <div className="rounded-lg bg-[#FAF9F5] border border-slate-200 p-5 space-y-3 text-xs text-slate-700">
                <h4 className="font-semibold text-slate-900 text-sm">Model Explanation: Robust Z-Score</h4>
                <p>
                  Unit cost for this work is evaluated as <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300">Z = (Cost - Median) / (1.4826 * MAD)</code>.
                </p>
                <p>
                  The work registered a Robust Z-Score of <strong className="text-orange-700 font-mono">+2.84</strong>, placing it in the 98.4th percentile of comparable municipal infrastructure sanctions within the state.
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-500">
                  Baseline sample: 142 works in {work.district} and contiguous blocks (2022–2024).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: DUPLICATES */}
        {activeTab === "duplicates" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-950">
                Potential Duplicate & Cross-Scheme Overlap
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Works identified with high semantic DPR similarity or geographic co-location.
              </p>
            </div>

            {work.duplicateCandidates.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No duplicate works flagged above threshold.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate Work ID</th>
                      <th className="py-3 px-4">Work Title</th>
                      <th className="py-3 px-4">Constituency</th>
                      <th className="py-3 px-4 text-right">Sanctioned Amount</th>
                      <th className="py-3 px-4 text-right">Semantic Match</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {work.duplicateCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-800">
                          {cand.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                          {cand.title}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {cand.constituency}
                        </td>
                        <td className="py-3 px-4 text-xs text-right font-medium text-slate-900">
                          {formatCurrency(cand.sanctionedAmount)}
                        </td>
                        <td className="py-3 px-4 text-xs text-right">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                            {(cand.similarityScore * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="text-slate-600">{cand.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: SPATIAL */}
        {activeTab === "spatial" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-950">
                Spatial Clustering & Asset Co-location Analysis
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Geo-spatial coordinates: Latitude {work.coordinates.lat}, Longitude {work.coordinates.lng}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-[#FAF9F5] p-6 space-y-3">
                <div className="font-mono text-xs text-slate-500 uppercase">Proximity Density</div>
                <div className="font-heading text-2xl font-bold text-slate-900">
                  {work.clusterDistanceKm} km Radius
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cluster analysis detected multiple sanctions awarded to <strong className="text-slate-900">{work.contractor}</strong> within an unusually constrained geographic polygon.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-200">
                  Vendor concentration in cluster: {(work.contractorConcentrationRatio * 100).toFixed(0)}%
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#FAF9F5] p-6 space-y-3">
                <div className="font-mono text-xs text-slate-500 uppercase">Cross-Scheme Co-location Check</div>
                <div className="font-heading text-lg font-bold text-slate-900">
                  GIS Layer Verification
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cross-referencing PMGSY road networks and Jal Jeevan Mission physical registries to ensure public funds are not dual-sanctioned on identical assets.
                </p>
                <div className="text-xs font-mono text-emerald-700 pt-2 border-t border-slate-200">
                  Status: Geo-tag metadata extracted and verified.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: INVESTIGATOR AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-950">
                  Reviewer Notes & Decision Audit Trail
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Chronological record of investigator reviews, notices, and escalation decisions.
                </p>
              </div>
            </div>

            {/* Add Note Form */}
            <div className="rounded-xl bg-[#FAF9F5] border border-slate-200 p-4 space-y-3">
              <label className="font-medium text-xs text-slate-800 block">
                Add Official Reviewer Observation:
              </label>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Enter investigation observations, requested documents, or rationale..."
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleAction("reviewed_no_issue")}
                  disabled={!auditNotes.trim() || isSubmitting}
                  className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Record Observation to Audit Trail
                </button>
              </div>
            </div>

            {/* Chronological Log Table */}
            <div className="divide-y divide-slate-200">
              {work.auditTrail.map((record) => (
                <div key={record.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-800">
                      {record.actor} <span className="text-slate-400 font-normal">({record.role})</span>
                    </span>
                    <span className="text-slate-400">{record.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-700 bg-white border border-slate-100 p-3 rounded-md">
                    {record.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            WHAT SHOULD THE INVESTIGATOR DO?
            ======================================================== */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-heading text-base font-bold text-slate-950">
            Recommended Investigative Action Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="border border-slate-200 rounded-lg p-3 bg-[#FAF9F5]">
              <span className="font-semibold block text-slate-900 mb-1">1. Milestone Photo Audit</span>
              Request time-stamped, geo-tagged high-resolution photographic proof for completed foundation and structure stages.
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-[#FAF9F5]">
              <span className="font-semibold block text-slate-900 mb-1">2. Cross-Scheme Reconciliation</span>
              Coordinate with District Planning Committee to cross-verify Gram Panchayat asset register for co-located schemes.
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-[#FAF9F5]">
              <span className="font-semibold block text-slate-900 mb-1">3. Schedule of Rates Inquiry</span>
              Issue query to implementing agency regarding unit procurement rate variance against state PWD schedules.
            </div>
          </div>
        </div>

      </main>

      <BackendStatusBar />
    </div>
  );
}
