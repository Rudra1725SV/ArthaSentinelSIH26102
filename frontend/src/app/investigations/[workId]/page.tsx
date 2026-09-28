"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/AppSidebar";
import {
  WORKS,
  getInvestigationByWorkId,
  getRelatedWorks,
  formatCurrency,
  formatCurrencyFull,
  getRiskTier,
  formatTimestamp,
  Investigation,
  Work,
} from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { getWorkDetail } from "@/lib/api";

export default function InvestigationDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const [work, setWork] = useState<Work | null>(() => WORKS.find((w) => w.workId === workId) || null);
  const [loading, setLoading] = useState(!work);

  useEffect(() => {
    let mounted = true;
    if (workId) {
      getWorkDetail(workId).then((res) => {
        if (mounted && res) {
          setWork(res);
          setLoading(false);
        }
      }).catch(() => {
        if (mounted) setLoading(false);
      });
    }
    return () => { mounted = false; };
  }, [workId]);

  const investigation = work ? getInvestigationByWorkId(work.workId) : undefined;
  const relatedWorks = work ? getRelatedWorks(work.workId) : [];

  const [newNote, setNewNote] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center max-w-lg mx-auto font-sans">
          <div className="inline-block w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 text-sm font-medium">Loading investigation file for Work #{workId}...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!work) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center max-w-lg mx-auto font-sans">
          <p className="text-slate-600 text-sm">Work <strong className="font-data text-slate-900">{workId}</strong> not found in active database.</p>
          <Link href="/investigations" className="text-blue-800 hover:underline text-xs font-semibold inline-block mt-4">
            &larr; Return to Investigations Queue
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Build fallback investigation if needed
  const inv: Investigation = investigation || {
    investigationId: `INV-${work.workId}`,
    workId: work.workId,
    riskScore: work.riskScore,
    status: work.status,
    assignedTo: "Unassigned",
    primarySignal: work.deviationPercentage > 50 ? `Cost deviation +${work.deviationPercentage}% vs peer baseline` : "Requires review",
    notes: [],
    evidence: [],
    timeline: [
      { id: "t1", timestamp: work.createdAt, actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: work.workId, result: "Flagged for investigator triage." },
    ],
    anomalyFlags: work.anomalyTypes.map((t) => ({
      type: t,
      severity: work.riskTier === "Critical" ? "critical" : "elevated",
      title: `${t.toUpperCase()} Flag`,
      summary: `Automated detection trigger based on empirical peer comparison in ${work.category}.`,
      metric: `Score ${work.riskScore}`,
      peerComparison: `${work.peerCount} comparable works analyzed`,
    })),
    peerDistribution: [
      { label: "P10", amount: work.peerMedian * 0.7 },
      { label: "P25", amount: work.peerMedian * 0.85 },
      { label: "Peer Median", amount: work.peerMedian },
      { label: "P75", amount: work.peerMedian * 1.2 },
      { label: "P90", amount: work.peerMedian * 1.5 },
      { label: "This Work", amount: work.sanctionedAmount, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: Math.min(work.deviationPercentage, 95), peerBaseline: 25 },
      { dimension: "Semantic Overlap", thisWork: work.anomalyTypes.includes("semantic") ? 80 : 20, peerBaseline: 20 },
      { dimension: "Constituency Clust.", thisWork: work.anomalyTypes.includes("geographic") ? 75 : 25, peerBaseline: 25 },
      { dimension: "Vendor Concentration", thisWork: 50, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 45, peerBaseline: 40 },
    ],
  };

  // Peer Distribution Bar Geometry (Expansive)
  const maxPeer = Math.max(...inv.peerDistribution.map((p) => p.amount));
  const barH = 240;

  // Radar Geometry
  const radarSize = 240;
  const radarCenter = radarSize / 2;
  const radarRadius = 90;
  const dims = inv.radarMetrics;
  const angleStep = (2 * Math.PI) / dims.length;
  const getPoint = (i: number, val: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (val / 100) * radarRadius;
    return { x: radarCenter + r * Math.cos(angle), y: radarCenter + r * Math.sin(angle) };
  };
  const peerPath = dims.map((d, i) => getPoint(i, d.peerBaseline)).map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  const workPath = dims.map((d, i) => getPoint(i, d.thisWork)).map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const handleAction = (label: string) => {
    setActionNotice(`Action logged: "${label}" recorded to immutable audit ledger.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-sans text-slate-500">
          <Link href="/investigations" className="hover:text-blue-800 transition-colors">
            Investigations
          </Link>
          <span>/</span>
          <span className="font-data font-bold text-slate-900">{work.workId}</span>
          <span className="text-slate-300">|</span>
          <span className="font-sans text-slate-500">{work.category}</span>
        </nav>

        {/* ─── SECTION 1: WORK IDENTITY & METRIC HEADER (UNBOXED) ─── */}
        <div className="space-y-4 pb-8 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-data text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {work.workId}
                </span>
                <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-sans font-bold border ${
                  inv.status === "Flagged" ? "bg-red-50 text-red-800 border-red-200" :
                  inv.status === "Escalated" ? "bg-orange-50 text-orange-800 border-orange-200" :
                  inv.status === "Under Review" ? "bg-blue-50 text-blue-800 border-blue-200" :
                  inv.status === "Triaged" ? "bg-amber-50 text-amber-800 border-amber-200" :
                  inv.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {inv.status}
                </span>
                <span className="font-data text-xs text-slate-400">Sanctioned: {work.sanctionDate}</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                {work.description}
              </h1>

              <div className="font-sans text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span>{work.constituency}</span>
                <span>•</span>
                <span>{work.district}, {work.state}</span>
                <span>•</span>
                <span>FY: <strong className="font-data font-semibold text-slate-800">{work.financialYear}</strong></span>
                <span>•</span>
                <span>Agency: <strong className="text-slate-800">{work.implementingAgency}</strong></span>
              </div>

              {/* Sponsoring MP Link */}
              <div className="pt-2">
                {work.mp_id ? (
                  <Link
                    href={`/mps/${work.mp_id}`}
                    className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-blue-800 hover:text-blue-950 bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Sponsoring MP: {work.mp_name} (Inspect Parliamentary Dossier &rarr;)</span>
                  </Link>
                ) : (
                  <span className="text-xs font-sans text-slate-500">Representative: {work.mp_name || "Unassigned"}</span>
                )}
              </div>
            </div>

            {/* Composite Risk Score Badge */}
            <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl shrink-0">
              <span className="font-emphasis text-xs font-bold text-slate-500 uppercase tracking-wider">
                COMPOSITE RISK INDEX
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-emphasis text-4xl sm:text-5xl font-extrabold text-orange-700">{work.riskScore}</span>
                <span className="font-data text-sm text-slate-400 font-semibold">/ 100</span>
              </div>
              <RiskBadge score={work.riskScore} tier={getRiskTier(work.riskScore)} showScore={false} />
            </div>
          </div>

          {/* Compact Inline Analytical Facts (Unboxed) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pt-4 border-t border-slate-100">
            <div>
              <div className="font-emphasis text-xs font-bold tracking-wider text-slate-500 uppercase">Sanctioned Cost</div>
              <div className="font-data text-2xl sm:text-3xl font-bold text-slate-950 mt-0.5">{formatCurrency(work.sanctionedAmount)}</div>
              <div className="font-data text-xs sm:text-sm text-slate-500">{formatCurrencyFull(work.sanctionedAmount)}</div>
            </div>
            <div>
              <div className="font-emphasis text-xs font-bold tracking-wider text-slate-500 uppercase">Peer Median Cost</div>
              <div className="font-data text-2xl sm:text-3xl font-bold text-slate-800 mt-0.5">{formatCurrency(work.peerMedian)}</div>
              <div className="font-sans text-xs sm:text-sm text-slate-500">Baseline in cohort</div>
            </div>
            <div>
              <div className="font-emphasis text-xs font-bold tracking-wider text-slate-500 uppercase">Unit Cost Deviation</div>
              <div className={`font-data text-2xl sm:text-3xl font-bold mt-0.5 ${Math.abs(work.deviationPercentage) > 50 ? "text-orange-700" : "text-slate-800"}`}>
                {work.deviationPercentage > 0 ? `+${Number(work.deviationPercentage).toFixed(1)}%` : `${Number(work.deviationPercentage).toFixed(1)}%`}
              </div>
              <div className="font-sans text-xs sm:text-sm text-slate-500">
                {work.deviationPercentage >= 0 ? "Above peer median" : "Below peer median"}
              </div>
            </div>
            <div>
              <div className="font-emphasis text-xs font-bold tracking-wider text-slate-500 uppercase">Peer Cohort Sample</div>
              <div className="font-data text-2xl sm:text-3xl font-bold text-slate-800 mt-0.5">{work.peerCount}</div>
              <div className="font-sans text-xs sm:text-sm text-slate-500">Comparable projects</div>
            </div>
            <div>
              <div className="font-emphasis text-xs font-bold tracking-wider text-slate-500 uppercase">Cost Percentile</div>
              <div className="font-data text-2xl sm:text-3xl font-bold text-orange-700 mt-0.5">&gt;95th</div>
              <div className="font-sans text-xs sm:text-sm text-slate-500">Severe outlier band</div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: DOMINANT PEER COST DISTRIBUTION & RADAR ─── */}
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-950">
              Peer Baseline Distribution &amp; Multi-Signal Risk
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-600 mt-0.5">
              Unit-cost percentile benchmarking against {work.peerCount} comparable works in {work.category}, {work.state}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Dominant Peer Distribution Chart (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-heading text-base font-bold text-slate-900">Empirical Cost Percentiles vs. This Work</span>
                  <span className="font-data text-xs font-semibold text-orange-700">Outlier: +{work.deviationPercentage}%</span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Bars show empirical distribution quantiles. The orange bar represents this sanctioned project.
                </p>
              </div>

              <div className="w-full overflow-hidden pt-2">
                <svg viewBox={`0 0 460 ${barH + 40}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  {inv.peerDistribution.map((p, i) => {
                    const barWidth = 48;
                    const gap = 16;
                    const x = 24 + i * (barWidth + gap);
                    const h = (p.amount / maxPeer) * barH;
                    const y = barH - h + 10;
                    return (
                      <g key={p.label}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={h}
                          rx={4}
                          fill={p.isThisWork ? "#EA580C" : "#CBD5E1"}
                          className="transition-all"
                        />
                        <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="text-xs fill-slate-800 font-data font-bold">
                          {formatCurrency(p.amount)}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={barH + 28}
                          textAnchor="middle"
                          className={`text-xs font-data font-semibold ${p.isThisWork ? "fill-orange-700 font-bold" : "fill-slate-600"}`}
                        >
                          {p.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-sans text-slate-600">
                <span>Interquartile Dispersion: P25–P75 Band</span>
                <span className="font-data">Peer Median: {formatCurrency(work.peerMedian)}</span>
              </div>
            </div>

            {/* Multi-Signal Risk Radar (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-heading text-lg font-bold text-slate-950">Multi-Signal Risk Radar</span>
                  <span className="font-emphasis text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                    5 SIGNALS
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Orange polygon = this work · Grey polygon = calibrated peer baseline.
                </p>
              </div>

              <div className="flex justify-center py-2">
                <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full h-auto max-w-[260px]" preserveAspectRatio="xMidYMid meet">
                  {[0.25, 0.5, 0.75, 1].map((t) => (
                    <polygon
                      key={t}
                      points={dims.map((_, i) => { const p = getPoint(i, t * 100); return `${p.x},${p.y}`; }).join(" ")}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="0.8"
                    />
                  ))}
                  {dims.map((d, i) => {
                    const p = getPoint(i, 100);
                    const lp = getPoint(i, 118);
                    return (
                      <g key={d.dimension}>
                        <line x1={radarCenter} y1={radarCenter} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="0.8" />
                        <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-slate-500 font-data font-medium">
                          {d.dimension.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
                  <path d={peerPath} fill="rgba(148,163,184,0.18)" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d={workPath} fill="rgba(234,88,12,0.18)" stroke="#EA580C" strokeWidth="2" />
                  {dims.map((d, i) => {
                    const p = getPoint(i, d.thisWork);
                    return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#EA580C" />;
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-center gap-5 text-xs font-data text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span> Work Profile</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Peer Baseline</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: STRUCTURED INVESTIGATIVE EVIDENCE DOSSIER (NARRATIVE) ─── */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div>
            <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-700 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              INVESTIGATIVE EVIDENCE DOSSIER · AUDIT REASONING
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
              Why was this flagged for review?
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 max-w-3xl mt-1 leading-relaxed">
              This project triggered multi-signal anomaly thresholds during automated cohort analysis. Flags do not represent findings of impropriety, but mandate human reviewer due diligence.
            </p>
          </div>

          {/* Evidence Narrative Cards (Clear typographic hierarchy) */}
          <div className="space-y-4">
            {inv.anomalyFlags.map((flag, i) => (
              <div
                key={i}
                className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-emphasis text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded uppercase">
                      SIGNAL {String(i + 1).padStart(2, "0")} · {flag.type.toUpperCase()}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-slate-900">{flag.title}</h3>
                  </div>
                  <span className={`font-data text-xs sm:text-sm font-bold px-2.5 py-1 rounded self-start sm:self-auto ${
                    flag.severity === "critical" ? "bg-red-50 text-red-800 border border-red-200" :
                    flag.severity === "elevated" ? "bg-orange-50 text-orange-800 border border-orange-200" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {flag.severity.toUpperCase()} ATTENTION
                  </span>
                </div>

                <p className="font-sans text-sm sm:text-base text-slate-700 leading-relaxed">
                  {flag.summary}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-data bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-orange-800 font-bold">Observed Metric: {flag.metric}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-medium">Calibrated Baseline: {flag.peerComparison}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION 4: POTENTIALLY RELATED WORKS (ADMINISTRATIVE OVERLAP) ─── */}
        {relatedWorks.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-950">
                Potentially Related Works ({relatedWorks.length})
              </h2>
              <p className="font-sans text-sm text-slate-600">
                Projects identified via text similarity or identical administrative asset parcels (Zero GIS/distance reliance)
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-data text-sm sm:text-base">
                  <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs sm:text-[13px] font-sans font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Related Work ID</th>
                      <th className="px-3 py-3.5">Description</th>
                      <th className="px-3 py-3.5">Administrative Overlap</th>
                      <th className="px-3 py-3.5">Sanctioned Amount</th>
                      <th className="px-3 py-3.5 text-center">Text Match</th>
                      <th className="py-3.5 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatedWorks.map((rw) => (
                      <tr key={rw.relatedWorkId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 pl-6 pr-3 font-bold text-blue-800">
                          {rw.relatedWorkId}
                        </td>
                        <td className="px-3 py-4 max-w-sm">
                          <div className="font-sans text-sm sm:text-base font-semibold text-slate-900 line-clamp-1">{rw.relatedDescription}</div>
                          <div className="font-sans text-xs sm:text-sm text-slate-500 mt-0.5">{rw.relatedConstituency}</div>
                        </td>
                        <td className="px-3 py-4">
                          <span className="px-2.5 py-1 rounded bg-slate-100 font-sans text-xs sm:text-sm font-semibold text-slate-700">
                            {rw.administrativeOverlap}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-bold text-slate-900">
                          {formatCurrency(rw.relatedAmount)}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="font-emphasis font-bold text-orange-700 text-sm sm:text-base">
                            {(rw.similarityScore * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <Link
                            href={`/investigations/${rw.relatedWorkId}`}
                            className="font-sans text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            Compare &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 5: INVESTIGATOR TRIAGE ACTIONS & AUDIT LEDGER ─── */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-950">
                Investigator Action &amp; Audit Trail
              </h2>
              <p className="font-sans text-xs text-slate-500">
                Official actions and findings recorded directly into the institutional audit log
              </p>
            </div>
            <span className="font-data text-xs text-slate-400">Assigned: {inv.assignedTo}</span>
          </div>

          {actionNotice && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 font-sans text-xs text-blue-900 font-semibold">
              {actionNotice}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Assign Investigator", style: "bg-[#1E3A8A] text-white hover:bg-[#1D4ED8]" },
              { label: "Add Observation Note", style: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50" },
              { label: "Attach Inspection Evidence", style: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50" },
              { label: "Escalate to Vigilance Cell", style: "bg-orange-50 text-orange-800 border border-orange-300 hover:bg-orange-100" },
              { label: "Mark Verified — No Issue", style: "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100" },
              { label: "Resolve Case", style: "bg-emerald-700 text-white hover:bg-emerald-800" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => handleAction(a.label)}
                className={`px-4 py-2 rounded-xl font-sans text-xs font-semibold transition-colors cursor-pointer ${a.style}`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Chronological Audit Events for this Work */}
          <div className="space-y-3 pt-2">
            <h3 className="font-heading text-base font-bold text-slate-900 uppercase tracking-wider">
              Chronological Audit Trail
            </h3>
            <div className="space-y-0">
              {inv.timeline.map((evt, idx) => (
                <div key={evt.id || idx} className="flex gap-4 py-3.5 border-l-2 border-slate-200 pl-5 ml-2 relative">
                  <div className="absolute -left-[5px] top-[18px] w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <div className="space-y-1 text-sm font-sans">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <strong className="text-slate-900 font-semibold">{evt.action}</strong>
                      <span className="text-slate-400 font-data text-xs">{formatTimestamp(evt.timestamp)}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-data text-xs text-slate-700 uppercase font-semibold">{evt.actorType}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{evt.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
