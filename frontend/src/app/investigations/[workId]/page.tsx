"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, getInvestigationByWorkId, getRelatedWorks, formatCurrency, formatCurrencyFull, getRiskTier } from "@/lib/mock-data";
import type { AnomalyFlag, Investigation, RelatedWork, AuditEvent } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function InvestigationDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const work = WORKS.find((w) => w.workId === workId);
  const investigation = work ? getInvestigationByWorkId(work.workId) : undefined;
  const relatedWorks = work ? getRelatedWorks(work.workId) : [];

  const [newNote, setNewNote] = useState("");

  if (!work) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-slate-600">Work <span className="font-mono">{workId}</span> not found.</p>
          <Link href="/investigations" className="text-blue-700 hover:underline text-sm mt-2 inline-block">← Back to Investigations</Link>
        </div>
      </DashboardLayout>
    );
  }

  // Build a default investigation if none exists (for works that aren't in INVESTIGATIONS array)
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
  const barH = 200;

  // Radar Chart
  const radarSize = 220;
  const radarCenter = radarSize / 2;
  const radarRadius = 85;
  const dims = inv.radarMetrics;
  const angleStep = (2 * Math.PI) / dims.length;
  const getPoint = (i: number, val: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (val / 100) * radarRadius;
    return { x: radarCenter + r * Math.cos(angle), y: radarCenter + r * Math.sin(angle) };
  };
  const peerPath = dims.map((d, i) => getPoint(i, d.peerBaseline)).map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  const workPath = dims.map((d, i) => getPoint(i, d.thisWork)).map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 font-mono space-x-1">
          <Link href="/investigations" className="hover:text-blue-700">Investigations</Link>
          <span>/</span>
          <span className="text-slate-800">{work.workId}</span>
        </nav>

        {/* ═══════════ WORK HEADER ═══════════ */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{work.workId}</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                inv.status === "Flagged" ? "bg-red-50 text-red-800 border-red-200" :
                inv.status === "Escalated" ? "bg-orange-50 text-orange-800 border-orange-200" :
                inv.status === "Under Review" ? "bg-blue-50 text-blue-800 border-blue-200" :
                inv.status === "Triaged" ? "bg-amber-50 text-amber-800 border-amber-200" :
                inv.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                "bg-slate-100 text-slate-600 border-slate-200"
              }`}>{inv.status}</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-950">{work.description}</h1>
            <p className="text-sm text-slate-600">{work.constituency} · {work.district}, {work.state} · {work.financialYear}</p>
          </div>

          {/* Risk Gauge */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center ${
              work.riskScore >= 80 ? "bg-red-50 border-red-300 text-red-800" :
              work.riskScore >= 60 ? "bg-orange-50 border-orange-300 text-orange-800" :
              "bg-slate-50 border-slate-300 text-slate-700"
            }`}>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold leading-none">{work.riskScore}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">/ 100</div>
              </div>
            </div>
            <RiskBadge score={work.riskScore} tier={getRiskTier(work.riskScore)} showScore={false} />
          </div>
        </div>

        {/* ═══════════ PROJECT FACTS ═══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          {[
            { label: "SANCTIONED COST", value: formatCurrency(work.sanctionedAmount) },
            { label: "PEER MEDIAN", value: formatCurrency(work.peerMedian) },
            { label: "COMPARABLE WORKS", value: work.peerCount.toString() },
            { label: "PERCENTILE", value: `>${work.deviationPercentage > 100 ? 99 : Math.min(95, 50 + work.deviationPercentage / 4)}th` },
            { label: "DEVIATION", value: `+${work.deviationPercentage}%`, highlight: work.deviationPercentage > 50 },
          ].map((f, i) => (
            <div key={i}>
              <div className={`font-heading text-lg font-bold tracking-tight ${f.highlight ? "text-orange-700" : "text-slate-950"}`}>{f.value}</div>
              <div className="font-mono text-[9px] tracking-widest text-slate-500 uppercase mt-0.5">{f.label}</div>
            </div>
          ))}
        </div>

        {/* ═══════════ CHARTS ROW ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Peer Distribution */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h2 className="font-heading text-sm font-bold text-slate-950 mb-1">Peer Distribution</h2>
            <p className="text-[11px] text-slate-500 mb-4">{work.peerCount} comparable works in {work.category}, {work.state}</p>
            <svg viewBox={`0 0 420 ${barH + 40}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {inv.peerDistribution.map((p, i) => {
                const barWidth = 42;
                const gap = 14;
                const x = 30 + i * (barWidth + gap);
                const h = (p.amount / maxPeer) * barH;
                const y = barH - h + 10;
                return (
                  <g key={p.label}>
                    <rect x={x} y={y} width={barWidth} height={h} rx={3} fill={p.isThisWork ? "#EA580C" : "#CBD5E1"} />
                    <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[9px] fill-slate-600 font-mono">{formatCurrency(p.amount)}</text>
                    <text x={x + barWidth / 2} y={barH + 26} textAnchor="middle" className={`text-[9px] font-mono ${p.isThisWork ? "fill-orange-700 font-bold" : "fill-slate-500"}`}>{p.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Radar */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h2 className="font-heading text-sm font-bold text-slate-950 mb-1">Risk Profile</h2>
            <p className="text-[11px] text-slate-500 mb-3">Orange = this work · Grey = peer baseline</p>
            <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full h-auto max-w-[240px] mx-auto" preserveAspectRatio="xMidYMid meet">
              {/* Grid rings */}
              {[0.25, 0.5, 0.75, 1].map((t) => (
                <polygon key={t} points={dims.map((_, i) => { const p = getPoint(i, t * 100); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
              ))}
              {/* Axes */}
              {dims.map((d, i) => {
                const p = getPoint(i, 100);
                const lp = getPoint(i, 115);
                return (
                  <g key={d.dimension}>
                    <line x1={radarCenter} y1={radarCenter} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="0.5" />
                    <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="text-[7px] fill-slate-500 font-mono">{d.dimension.split(" ")[0]}</text>
                  </g>
                );
              })}
              <polygon points={peerPath.replace(/[MLZ]/g, "").trim().replace(/\s+/g, " ").split(" ").join(" ")} fill="none" stroke="none" />
              <path d={peerPath} fill="rgba(148,163,184,0.2)" stroke="#94A3B8" strokeWidth="1" />
              <path d={workPath} fill="rgba(234,88,12,0.15)" stroke="#EA580C" strokeWidth="1.5" />
              {dims.map((d, i) => {
                const p = getPoint(i, d.thisWork);
                return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#EA580C" />;
              })}
            </svg>
          </div>
        </div>

        {/* ═══════════ WHY WAS THIS FLAGGED? ═══════════ */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-heading text-base font-bold text-slate-950 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
            Why was this flagged for review?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This work was flagged because its financial and structural characteristics differ substantially from comparable projects in the same category and region. The following evidence items were generated automatically by the detection engine.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {inv.anomalyFlags.map((flag, i) => (
              <div key={i} className={`rounded-lg border p-4 space-y-2 ${
                flag.severity === "critical" ? "border-red-200 bg-red-50/50" :
                flag.severity === "elevated" ? "border-orange-200 bg-orange-50/50" :
                "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    flag.type === "cost" ? "text-amber-700" :
                    flag.type === "semantic" ? "text-indigo-700" :
                    flag.type === "geographic" ? "text-sky-700" :
                    "text-stone-700"
                  }`}>{flag.type.toUpperCase()}</span>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    flag.severity === "critical" ? "bg-red-100 text-red-800" :
                    flag.severity === "elevated" ? "bg-orange-100 text-orange-800" :
                    "bg-slate-100 text-slate-700"
                  }`}>{flag.severity}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{flag.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{flag.summary}</p>
                <div className="pt-1 border-t border-slate-200/70 text-xs">
                  <span className="text-orange-700 font-semibold">{flag.metric}</span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-500">{flag.peerComparison}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ RELATED WORKS ═══════════ */}
        {relatedWorks.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h2 className="font-heading text-sm font-bold text-slate-950">Potentially Related Works</h2>
            <div className="space-y-3">
              {relatedWorks.map((rw) => (
                <div key={rw.relatedWorkId} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-800">{rw.relatedWorkId}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                        rw.relationshipType === "semantic" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                        rw.relationshipType === "geographic" ? "bg-sky-50 text-sky-700 border-sky-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>{rw.relationshipType}</span>
                    </div>
                    <p className="text-xs text-slate-700">{rw.relatedDescription}</p>
                    <p className="text-[11px] text-slate-500">{rw.relatedConstituency} · {formatCurrency(rw.relatedAmount)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-bold text-orange-700">{(rw.similarityScore * 100).toFixed(0)}%</div>
                    <div className="text-[10px] text-slate-500 font-mono">similarity</div>
                    {rw.distance < 100 && <div className="text-[10px] text-slate-500 font-mono">{rw.distance}km apart</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ INVESTIGATOR ACTIONS ═══════════ */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-heading text-sm font-bold text-slate-950">Investigator Actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Assign Investigator", style: "bg-blue-700 text-white hover:bg-blue-800" },
              { label: "Add Note", style: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50" },
              { label: "Attach Evidence", style: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50" },
              { label: "Escalate", style: "bg-orange-50 text-orange-800 border border-orange-300 hover:bg-orange-100" },
              { label: "Mark Reviewed", style: "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100" },
              { label: "Resolve", style: "bg-emerald-700 text-white hover:bg-emerald-800" },
            ].map((a) => (
              <button key={a.label} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${a.style}`}>
                {a.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          {inv.notes.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Investigator Notes</h3>
              {inv.notes.map((n) => (
                <div key={n.id} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-1">
                    <span>{n.author}</span>
                    <span>·</span>
                    <span>{new Date(n.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-slate-700">{n.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add investigation note..." className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600" />
            <button className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer">Add Note</button>
          </div>
        </div>

        {/* ═══════════ AUDIT TIMELINE ═══════════ */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-heading text-sm font-bold text-slate-950">Audit Trail</h2>
          <div className="space-y-0">
            {inv.timeline.map((evt, idx) => (
              <div key={evt.id} className="flex gap-4 py-3 border-l-2 border-slate-200 pl-5 ml-3 relative">
                <div className={`absolute -left-[9px] top-[18px] w-4 h-4 rounded-full border-2 ${
                  evt.actorType === "system" ? "bg-blue-100 border-blue-400" :
                  evt.actorType === "supervisor" ? "bg-orange-100 border-orange-400" :
                  "bg-emerald-100 border-emerald-400"
                }`}></div>
                <div className="flex-1 space-y-0.5">
                  <div className="text-xs font-medium text-slate-800">{evt.action}</div>
                  <div className="text-[11px] text-slate-600">{evt.result}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {evt.actor} · {new Date(evt.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ DISCLAIMER ═══════════ */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
          <strong>Important:</strong> Anomaly detection indicates unusual patterns compared with peer baselines and does not establish wrongdoing.
          All flagged works require human investigation, contextual review, and due process before any administrative action.
        </div>
      </div>
    </DashboardLayout>
  );
}
