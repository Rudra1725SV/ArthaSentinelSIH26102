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
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-sans text-sm text-slate-500">Loading representative dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.mp) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900">Representative Not Found</h2>
          <p className="font-sans text-sm text-slate-500 mt-1 mb-6">
            The requested identifier <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{id}</code> is not present in the active dataset.
          </p>
          <Link
            href="/mps"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white font-sans text-xs font-semibold hover:bg-blue-800 transition-colors"
          >
            &larr; Return to Browse MPs
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
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-sans text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/mps" className="hover:text-slate-900 transition-colors">
            Browse MPs
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900">{mp.name}</span>
        </div>

        {/* MP Dossier Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white font-emphasis text-xl font-bold flex items-center justify-center shadow-sm shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-950">{mp.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-sans text-xs font-semibold text-slate-700">
                    {mp.party}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 font-sans text-xs font-semibold text-blue-800">
                    {mp.house}
                  </span>
                </div>

                <div className="font-sans text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    Constituency: <strong className="font-semibold text-slate-800">{mp.constituency}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    District: <strong className="font-semibold text-slate-800">{mp.district}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    State: <strong className="font-semibold text-slate-800">{mp.state}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Tenure: <strong className="font-semibold text-slate-800">{mp.tenure_start} – {mp.tenure_end}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs font-data text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                    MP ID: {mp.mp_id}
                  </span>
                  <span>•</span>
                  <span>Parliamentary Term Active</span>
                </div>
              </div>
            </div>

            {/* Composite Risk Gauge Badge */}
            <div className="flex flex-col md:items-end gap-1.5 shrink-0">
              <span className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
                Composite Risk Assessment
              </span>
              <RiskBadge score={mp.risk_score} tier={riskTier} showScore={true} className="text-sm py-1 px-3" />
              <div className="font-data text-xs text-slate-500 mt-0.5">
                Anomaly Rate: <strong className="font-semibold text-slate-800">{mp.anomaly_rate}%</strong> of works flagged
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Scrutiny KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
              Allocated Entitlement
            </div>
            <div className="font-data text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(mp.allocated_amount)}
            </div>
            <div className="font-sans text-xs text-slate-500 mt-1">
              Statutory 5-Year MPLADS Allocation
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
              Recorded Expenditure
            </div>
            <div className="font-data text-2xl font-bold text-blue-700 mt-1">
              {formatCurrency(mp.recorded_expenditure)}
            </div>
            <div className="font-sans text-xs text-slate-500 mt-1">
              {mp.utilization_rate}% Fund Utilization
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sanctioned Works
            </div>
            <div className="font-data text-2xl font-bold text-slate-900 mt-1">
              {mp.works_count}
            </div>
            <div className="font-sans text-xs text-slate-500 mt-1">
              {mp.completed_works} Completed · {mp.ongoing_works} Ongoing
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
              Flagged for Review
            </div>
            <div className="font-data text-2xl font-bold text-orange-700 mt-1">
              {mp.flagged_works} Works
            </div>
            <div className="font-sans text-xs text-slate-500 mt-1">
              {mp.high_risk_works} High / Critical Tiers
            </div>
          </div>
        </div>

        {/* Utilization Bar & Scrutiny Context */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900">Fund Velocity & Utilization</h2>
              <p className="font-sans text-xs text-slate-500">
                Comparison of sanctioned expenditure relative to the statutory entitlement ceiling
              </p>
            </div>
            <div className="font-data text-xs font-semibold text-slate-700">
              {formatCurrency(mp.recorded_expenditure)} / {formatCurrency(mp.allocated_amount)} ({mp.utilization_rate}%)
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-sans text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="font-semibold text-slate-800 mb-1">Scrutiny Principle</div>
              <p className="text-slate-500 leading-relaxed">
                Flags do not indicate impropriety. High anomaly rates trigger secondary algorithmic verification of cost baselines and vendor concentration.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="font-semibold text-slate-800 mb-1">Geographic Concentration</div>
              <p className="text-slate-500 leading-relaxed">
                Works are monitored for clustering in specific Gram Panchayats or single-contractor execution patterns.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="font-semibold text-slate-800 mb-1">Dataset Adaptability</div>
              <p className="text-slate-500 leading-relaxed">
                Metrics adapt automatically when new parliamentary terms or refreshed state datasets are imported.
              </p>
            </div>
          </div>
        </div>

        {/* Associated Works Table */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Associated Works Portfolio ({works.length})
              </h2>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                All sanctioned infrastructure projects associated with {mp.name} in the active dataset
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter works by keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 font-sans text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-sans text-xs font-semibold text-slate-700"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="font-sans text-sm text-slate-500">
                No works found matching the active filters.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-data text-sm">
                  <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-sans font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Work ID</th>
                      <th className="px-3 py-3.5">Description</th>
                      <th className="px-3 py-3.5">Category</th>
                      <th className="px-3 py-3.5">Sanctioned Cost</th>
                      <th className="px-3 py-3.5">Peer Baseline</th>
                      <th className="px-3 py-3.5">Risk Score</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-3 py-3.5 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorks.map((w) => {
                      const tier = getRiskTier(w.riskScore);
                      return (
                        <tr key={w.workId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 pl-6 pr-3 font-semibold text-blue-700">
                            <Link href={`/investigations/${w.workId}`} className="hover:underline">
                              {w.workId}
                            </Link>
                          </td>
                          <td className="px-3 py-3.5 max-w-[280px]">
                            <div className="font-sans text-xs font-semibold text-slate-900 line-clamp-1">
                              {w.description}
                            </div>
                            <div className="font-sans text-[11px] text-slate-500 mt-0.5">
                              {w.implementingAgency}
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="font-sans text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {w.category}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 font-semibold text-slate-900">
                            {formatCurrency(w.sanctionedAmount)}
                          </td>
                          <td className="px-3 py-3.5 text-xs text-slate-500">
                            {formatCurrency(w.peerMedian)}
                            {w.deviationPercentage !== 0 && (
                              <span
                                className={`ml-1.5 font-bold ${
                                  w.deviationPercentage > 30 ? "text-orange-600" : "text-slate-600"
                                }`}
                              >
                                ({w.deviationPercentage > 0 ? `+${w.deviationPercentage}%` : `${w.deviationPercentage}%`})
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            <RiskBadge score={w.riskScore} tier={tier} showScore={true} />
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="font-sans text-xs font-medium text-slate-700">
                              {w.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 pr-6 text-right">
                            <Link
                              href={`/investigations/${w.workId}`}
                              className="font-sans text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                            >
                              Triage Dossier &rarr;
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
