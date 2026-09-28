"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/AppSidebar";
import { getMPDetail } from "@/lib/api";
import { formatCurrency, getRiskTier, Work, MP } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function MPDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ mp: MP; works: Work[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    let isCancelled = false;
    if (id) {
      setIsLoading(true);
      getMPDetail(id).then((res) => {
        if (!isCancelled) {
          setData(res);
          setIsLoading(false);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const filteredWorks = useMemo(() => {
    if (!data?.works) return [];
    let list = [...data.works];

    if (riskFilter !== "ALL") {
      list = list.filter((w) => getRiskTier(w.riskScore).toUpperCase() === riskFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (w) =>
          w.workId.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, searchTerm, riskFilter]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-sans text-xs text-slate-500">Retrieving parliamentary dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.mp) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-slate-900">Representative Record Not Found</h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1 mb-6">
            The identifier <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">{id}</code> does not exist in the active dataset.
          </p>
          <Link
            href="/mps"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-sans text-xs font-semibold hover:bg-blue-800 transition-colors"
          >
            &larr; Return to MP Intelligence
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { mp, works } = data;
  const riskTier = getRiskTier(mp.risk_score);
  const initials =
    mp.avatar_initials ||
    mp.name
      .replace(/^(Shri|Smt\.|Dr\.)\s*/i, "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("");

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-sans text-slate-500">
          <Link href="/mps" className="hover:text-blue-800 transition-colors">
            MP Intelligence
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{mp.name}</span>
          <span className="text-slate-300">|</span>
          <span className="font-data text-slate-500">ID: {mp.mp_id}</span>
        </div>

        {/* ─── Parliamentary Dossier Header (Open Institutional Surface) ─── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white font-emphasis text-xl font-bold flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950">
                  {mp.name}
                </h1>
                <span className="px-2.5 py-1 rounded bg-slate-100 font-sans text-xs sm:text-sm font-semibold text-slate-700">
                  {mp.party}
                </span>
                <span className="px-2.5 py-1 rounded bg-blue-50 font-sans text-xs sm:text-sm font-semibold text-blue-800 border border-blue-100">
                  {mp.house}
                </span>
              </div>

              <div className="font-sans text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Constituency: <strong className="font-semibold text-slate-900">{mp.constituency}</strong></span>
                <span>•</span>
                <span>District: <strong className="font-semibold text-slate-900">{mp.district}</strong></span>
                <span>•</span>
                <span>State: <strong className="font-semibold text-slate-900">{mp.state}</strong></span>
                <span>•</span>
                <span>Tenure: <span className="font-data font-medium text-slate-700">{mp.tenure_start}–{mp.tenure_end}</span></span>
              </div>
            </div>
          </div>

          {/* Composite Risk Summary */}
          <div className="flex md:flex-col md:items-end gap-2 shrink-0">
            <span className="font-emphasis text-xs font-bold text-slate-500 uppercase tracking-wider">
              PORTFOLIO RISK INDEX
            </span>
            <RiskBadge score={mp.risk_score} tier={riskTier} showScore={true} className="text-sm py-1 px-3" />
            <div className="font-data text-sm text-slate-600">
              <strong className="text-slate-900 font-semibold">{mp.anomaly_rate}%</strong> of works flagged for review
            </div>
          </div>
        </div>

        {/* ─── Financial Velocity & Fund Utilization Bar (Spacious) ─── */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Statutory Fund Velocity &amp; Utilization
              </h2>
              <p className="font-sans text-sm text-slate-500">
                Recorded cumulative expenditure measured against statutory 5-year MPLADS entitlement
              </p>
            </div>
            <div className="font-data text-sm space-x-3 text-slate-700">
              <span>Spent: <strong className="text-slate-950 font-bold">{formatCurrency(mp.recorded_expenditure)}</strong></span>
              <span>/</span>
              <span>Allocated: <strong className="text-slate-950 font-bold">{formatCurrency(mp.allocated_amount)}</strong></span>
              <span>({mp.utilization_rate}%)</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                mp.utilization_rate > 90
                  ? "bg-emerald-600"
                  : mp.utilization_rate > 60
                  ? "bg-blue-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, mp.utilization_rate)}%` }}
            />
          </div>

          {/* Compact Inline Scrutiny Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 text-sm font-sans text-slate-600 border-t border-slate-100">
            <div>
              <div className="font-semibold text-slate-900 mb-0.5">Sanctioned Works Breakdown</div>
              <p className="text-slate-600 leading-relaxed font-data">
                {mp.works_count} total works · {mp.completed_works} completed · {mp.ongoing_works} ongoing execution.
              </p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-0.5">Scrutiny Signals</div>
              <p className="text-slate-600 leading-relaxed">
                {mp.flagged_works} works flagged for review ({mp.high_risk_works} in high/critical attention tiers).
              </p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-0.5">Ethical Investigation Charter</div>
              <p className="text-slate-600 leading-relaxed">
                Flags indicate statistical deviations against peer baselines, not findings of wrongdoing.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Associated Works Portfolio Table (Dominant Tool) ─── */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-950">
                Associated Works Portfolio ({works.length})
              </h2>
              <p className="font-sans text-sm text-slate-600">
                Individual sanctioned schemes sponsored by this representative across all project categories
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search works..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-sans text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-sans text-sm font-semibold text-slate-700"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="CRITICAL">Critical Flag</option>
                <option value="ELEVATED">Elevated Risk</option>
                <option value="MODERATE">Moderate Flag</option>
                <option value="LOW">Low Variance</option>
              </select>
            </div>
          </div>

          {filteredWorks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-sans text-slate-500">
              No projects match the active filter criteria.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-data text-sm sm:text-base">
                  <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs sm:text-[13px] font-sans font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Work ID</th>
                      <th className="px-3 py-3.5">Description</th>
                      <th className="px-3 py-3.5">Category</th>
                      <th className="px-3 py-3.5">Cost</th>
                      <th className="px-3 py-3.5">Peer Median</th>
                      <th className="px-3 py-3.5">Risk Score</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="py-3.5 pr-6 text-right">Triage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorks.map((w) => {
                      const tier = getRiskTier(w.riskScore);
                      return (
                        <tr key={w.workId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 pl-6 pr-3 font-bold text-blue-800">
                            <Link href={`/investigations/${w.workId}`} className="hover:underline">
                              {w.workId}
                            </Link>
                          </td>
                          <td className="px-3 py-4 max-w-[280px]">
                            <div className="font-sans text-sm sm:text-base font-semibold text-slate-900 line-clamp-1">
                              {w.description}
                            </div>
                            <div className="font-sans text-xs sm:text-sm text-slate-500 mt-0.5">
                              {w.implementingAgency}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <span className="font-sans text-sm text-slate-700">
                              {w.category}
                            </span>
                          </td>
                          <td className="px-3 py-4 font-bold text-slate-900">
                            {formatCurrency(w.sanctionedAmount)}
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-600">
                            {formatCurrency(w.peerMedian)}
                            {w.deviationPercentage !== 0 && (
                              <span
                                className={`ml-1.5 font-semibold ${
                                  w.deviationPercentage > 30 ? "text-orange-700" : "text-slate-600"
                                }`}
                              >
                                ({w.deviationPercentage > 0 ? `+${w.deviationPercentage}%` : `${w.deviationPercentage}%`})
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <RiskBadge score={w.riskScore} tier={tier} showScore={true} />
                          </td>
                          <td className="px-3 py-4">
                            <span className="font-sans text-sm font-medium text-slate-700">
                              {w.status}
                            </span>
                          </td>
                          <td className="py-4 pr-6 text-right">
                            <Link
                              href={`/investigations/${w.workId}`}
                              className="font-sans text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline"
                            >
                              Inspect &rarr;
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
