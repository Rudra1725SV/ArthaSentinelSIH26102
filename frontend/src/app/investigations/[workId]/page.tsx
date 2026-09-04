"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, getInvestigationByWorkId, getRelatedWorks, formatCurrency, formatCurrencyFull, getRiskTier, formatTimestamp } from "@/lib/mock-data";
import type { AnomalyFlag, Investigation, RelatedWork, AuditEvent } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function InvestigationDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const work = WORKS.find((w) => w.workId === workId);
  const investigation = work ? getInvestigationByWorkId(work.workId) : undefined;
  const relatedWorks = work ? getRelatedWorks(work.workId) : [];

  const [newNote, setNewNote] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!work) {
    return (
      <DashboardLayout>
        <div className="py-12 space-y-3 font-sans">
          <p className="text-slate-600">Work <span className="font-data font-bold text-slate-900">{workId}</span> not found in database.</p>
          <Link href="/investigations" className="text-blue-700 hover:underline text-sm font-semibold inline-block">← Back to Investigations Queue</Link>
        </div>
      </DashboardLayout>
    );
  }

  // Build a fallback investigation if none exists
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
      { id: "auto-1", timestamp: work.createdAt, actor: "ArthaSentinel V2.4", actorType: "system", action: "Work indexed", object: work.workId, result: `Risk score ${work.riskScore}/100.` },
    ],
    anomalyFlags: work.anomalyTypes.map((t) => ({
      type: t,
      severity: work.riskScore >= 80 ? "critical" as const : work.riskScore >= 60 ? "elevated" as const : "moderate" as const,
      title: t === "cost" ? "Cost Variance" : t === "semantic" ? "Semantic Overlap" : t === "geographic" ? "Geographic Signal" : "Pattern Signal",
      summary: "This flag requires further review.",
      metric: t === "cost" ? `+${work.deviationPercentage}%` : "Flagged",
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
      { dimension: "Spatial Clustering", thisWork: work.anomalyTypes.includes("geographic") ? 75 : 25, peerBaseline: 25 },
      { dimension: "Vendor Concentration", thisWork: 50, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 45, peerBaseline: 40 },
    ],
  };

  // Peer Distribution Bar Chart
  const maxPeer = Math.max(...inv.peerDistribution.map((p) => p.amount));
  const barH = 220;

  // Radar Chart
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
    setActionNotice(`Action logged: "${label}" has been recorded to the audit trail.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-sans text-slate-500">
          <Link href="/investigations" className="hover:text-blue-700 font-semibold">Investigations</Link>
          <span>/</span>
          <span className="font-data font-bold text-slate-900">{work.workId}</span>
        </nav>

        {/* ═══════════ WORK HEADER ═══════════ */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="space-y-2.5 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-data text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {work.workId}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-sans font-bold border ${
                inv.status === "Flagged" ? "bg-red-50 text-red-800 border-red-200" :
                inv.status === "Escalated" ? "bg-orange-50 text-orange-800 border-orange-200" :
                inv.status === "Under Review" ? "bg-blue-50 text-blue-800 border-blue-200" :
                inv.status === "Triaged" ? "bg-amber-50 text-amber-800 border-amber-200" :
                inv.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {inv.status}
              </span>
              <span className="font-data text-xs text-slate-500">Sanctioned: {work.sanctionDate}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-snug">
              {work.description}
            </h1>

            <p className="font-sans text-sm text-slate-600">
              {work.constituency} · {work.district}, {work.state} · Financial Year: <span className="font-data font-semibold text-slate-800">{work.financialYear}</span>
            </p>
          </div>

          {/* Risk Gauge */}
          <div className="flex flex-row sm:flex-col items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-center p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
            <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center shadow-xs ${
              work.riskScore >= 80 ? "bg-red-50 border-red-300 text-red-800" :
              work.riskScore >= 60 ? "bg-orange-50 border-orange-300 text-orange-800" :
              "bg-slate-50 border-slate-300 text-slate-700"
            }`}>
              <div className="text-center">
                <div className="font-emphasis text-3xl font-extrabold leading-none">{work.riskScore}</div>
                <div className="font-data text-[10px] text-slate-500 font-semibold mt-1">/ 100</div>
              </div>
            </div>
            <RiskBadge score={work.riskScore} tier={getRiskTier(work.riskScore)} showScore={false} />
          </div>
        </div>

        {/* ═══════════ PROJECT FACTS ═══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          {[
            { label: "SANCTIONED COST", value: formatCurrency(work.sanctionedAmount) },
            { label: "PEER MEDIAN", value: formatCurrency(work.peerMedian) },
            { label: "COMPARABLE WORKS", value: `${work.peerCount} cohort` },
            { label: "PERCENTILE", value: `>${work.deviationPercentage > 100 ? 99 : Math.min(95, 50 + work.deviationPercentage / 4)}th` },
            { label: "DEVIATION", value: `+${work.deviationPercentage}%`, highlight: work.deviationPercentage > 50 },
          ].map((f, i) => (
            <div key={i} className="space-y-1">
              <div className={`font-data text-xl font-bold tracking-tight ${f.highlight ? "text-orange-700" : "text-slate-950"}`}>
                {f.value}
              </div>
              <div className="font-emphasis text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {f.label}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════ CHARTS ROW ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Peer Distribution */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-950">Peer Distribution Benchmark</h2>
              <p className="font-sans text-xs text-slate-500">
                Unit cost compared with {work.peerCount} statistically comparable works in {work.category}, {work.state}
              </p>
            </div>
            <div className="w-full overflow-hidden pt-2">
              <svg viewBox={`0 0 460 ${barH + 40}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {inv.peerDistribution.map((p, i) => {
                  const barWidth = 46;
                  const gap = 16;
                  const x = 30 + i * (barWidth + gap);
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
                      <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="text-[10px] fill-slate-700 font-data font-bold">
                        {formatCurrency(p.amount)}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={barH + 28}
                        textAnchor="middle"
                        className={`text-[10px] font-data font-semibold ${p.isThisWork ? "fill-orange-700 font-bold" : "fill-slate-500"}`}
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Radar */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-950">Multi-Signal Risk Profile</h2>
              <p className="font-sans text-xs text-slate-500">
                Orange polygon = this work · Grey polygon = peer baseline
              </p>
            </div>
            <div className="flex justify-center py-2">
              <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full h-auto max-w-[260px]" preserveAspectRatio="xMidYMid meet">
                {/* Grid rings */}
                {[0.25, 0.5, 0.75, 1].map((t) => (
                  <polygon
                    key={t}
                    points={dims.map((_, i) => { const p = getPoint(i, t * 100); return `${p.x},${p.y}`; }).join(" ")}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="0.8"
                  />
                ))}
                {/* Axes */}
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
                <path d={peerPath} fill="rgba(148,163,184,0.2)" stroke="#94A3B8" strokeWidth="1.2" />
                <path d={workPath} fill="rgba(234,88,12,0.18)" stroke="#EA580C" strokeWidth="2" />
                {dims.map((d, i) => {
                  const p = getPoint(i, d.thisWork);
                  return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#EA580C" />;
                })}
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-data text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span> Work Score</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Baseline (Median)</span>
            </div>
          </div>
        </div>

        {/* ═══════════ WHY WAS THIS FLAGGED? ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="font-heading text-xl font-bold text-slate-950 flex items-center gap-2.5">
            <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
            Why was this flagged for review?
          </h2>
          <p className="font-sans text-sm text-slate-600 leading-relaxed">
            This work was flagged because its financial and structural characteristics differ substantially from comparable projects in the same category and region. The following evidence items were generated automatically by the detection engine.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {inv.anomalyFlags.map((flag, i) => (
              <div key={i} className={`rounded-xl border p-5 space-y-2.5 ${
                flag.severity === "critical" ? "border-red-200 bg-red-50/50" :
                flag.severity === "elevated" ? "border-orange-200 bg-orange-50/50" :
                "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-emphasis text-xs font-bold uppercase tracking-wider text-orange-800">
                    {flag.type.toUpperCase()} ANOMALY
                  </span>
                  <span className={`font-data text-xs font-bold px-2 py-0.5 rounded ${
                    flag.severity === "critical" ? "bg-red-100 text-red-800" :
                    flag.severity === "elevated" ? "bg-orange-100 text-orange-800" :
                    "bg-slate-100 text-slate-700"
                  }`}>{flag.severity.toUpperCase()}</span>
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">{flag.title}</h3>
                <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">{flag.summary}</p>
                <div className="pt-2 border-t border-slate-200/70 font-data text-xs">
                  <span className="text-orange-700 font-bold">{flag.metric}</span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-500">{flag.peerComparison}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ RELATED WORKS ═══════════ */}
        {relatedWorks.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="font-heading text-lg font-bold text-slate-950">Potentially Related Works</h2>
            <div className="space-y-3">
              {relatedWorks.map((rw) => (
                <div key={rw.relatedWorkId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-data text-xs font-bold text-blue-800">{rw.relatedWorkId}</span>
                      <span className={`font-sans text-[11px] px-2 py-0.5 rounded font-semibold border ${
                        rw.relationshipType === "semantic" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                        rw.relationshipType === "geographic" ? "bg-sky-50 text-sky-700 border-sky-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>{rw.relationshipType}</span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm font-medium text-slate-800">{rw.relatedDescription}</p>
                    <p className="font-data text-xs text-slate-500">{rw.relatedConstituency} · {formatCurrency(rw.relatedAmount)}</p>
                  </div>
                  <div className="text-left sm:text-right space-y-0.5">
                    <div className="font-emphasis text-base font-extrabold text-orange-700">{(rw.similarityScore * 100).toFixed(0)}%</div>
                    <div className="font-data text-[11px] text-slate-500">similarity match</div>
                    {rw.distance < 100 && <div className="font-data text-[11px] text-slate-400">{rw.distance}km apart</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ INVESTIGATOR ACTIONS ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-slate-950">Investigator Decision Actions</h2>
            <span className="font-sans text-xs text-slate-400">Actions logged to audit trail</span>
          </div>

          {actionNotice && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 font-sans text-xs text-blue-900 font-semibold animate-fadeIn">
              {actionNotice}
            </div>
          )}

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
                className={`px-4 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${a.style}`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          {inv.notes.length > 0 && (
            <div className="mt-4 space-y-2.5">
              <h3 className="font-emphasis text-xs font-bold text-slate-700 uppercase tracking-wider">Investigator Notes</h3>
              {inv.notes.map((n) => (
                <div key={n.id} className="text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
                  <div className="flex items-center gap-2 font-data text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">{n.author}</span>
                    <span>·</span>
                    <span suppressHydrationWarning>{formatTimestamp(n.timestamp)}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add observation or directive to case file..."
              className="flex-1 px-4 py-2.5 font-sans text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={() => {
                if (newNote.trim()) {
                  handleAction("Note Added: " + newNote);
                  setNewNote("");
                }
              }}
              className="px-5 py-2.5 rounded-xl font-sans text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Add Note
            </button>
          </div>
        </div>

        {/* ═══════════ AUDIT TIMELINE ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="font-heading text-lg font-bold text-slate-950">Audit Trail for this Work</h2>
          <div className="space-y-0">
            {inv.timeline.map((evt) => (
              <div key={evt.id} className="flex gap-4 py-3.5 border-l-2 border-slate-200 pl-6 ml-3 relative">
                <div className={`absolute -left-[9px] top-[20px] w-4 h-4 rounded-full border-2 ${
                  evt.actorType === "system" ? "bg-blue-100 border-blue-600" :
                  evt.actorType === "supervisor" ? "bg-orange-100 border-orange-600" :
                  "bg-emerald-100 border-emerald-600"
                }`}></div>
                <div className="flex-1 space-y-1">
                  <div className="font-sans text-sm font-bold text-slate-900">{evt.action}</div>
                  <div className="font-sans text-xs text-slate-600">{evt.result}</div>
                  <div className="font-data text-[11px] text-slate-400 pt-0.5" suppressHydrationWarning>
                    {evt.actor} · {formatTimestamp(evt.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ DISCLAIMER ═══════════ */}
        <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-4 font-sans text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Important:</strong> Anomaly detection indicates unusual patterns compared with peer baselines and does not establish wrongdoing.
          All flagged works require human investigation, contextual review, and due process before any administrative action.
        </div>
      </div>
    </DashboardLayout>
  );
}
