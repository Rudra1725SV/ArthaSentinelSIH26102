"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { getMPs, PaginatedMPsResponse } from "@/lib/api";
import { formatCurrency, getRiskTier, SEED_MPS, MP } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function BrowseMPsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [houseFilter, setHouseFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<
    "risk_score_desc" | "risk_score_asc" | "anomaly_rate_desc" | "works_count_desc" | "expenditure_desc" | "utilization_desc"
  >("risk_score_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<PaginatedMPsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMP, setSelectedMP] = useState<MP | null>(null);

  // Discover distinct states dynamically from seed/loaded dataset
  const availableStates = useMemo(() => {
    const s = new Set<string>();
    SEED_MPS.forEach((m) => s.add(m.state));
    return ["ALL", ...Array.from(s).sort()];
  }, []);

  // Fetch or compute paginated MPs
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    getMPs({
      page: currentPage,
      limit: 15,
      search: searchTerm,
      house: houseFilter,
      state: stateFilter,
      risk: riskFilter,
      sort: sortBy,
    }).then((res) => {
      if (!isCancelled) {
        setData(res);
        setIsLoading(false);
        if (res.mps.length > 0 && !selectedMP) {
          setSelectedMP(res.mps[0]);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, houseFilter, stateFilter, riskFilter, sortBy, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleHouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHouseFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRiskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRiskFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as any);
    setCurrentPage(1);
  };

  const datasetMetrics = data?.datasetMetrics;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ─── Page Header & Inline Analytical Statistics ─── */}
        <div className="space-y-3 pb-6 border-b border-slate-200">
          <div className="font-emphasis text-[11px] font-bold tracking-wider text-blue-800 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            PARLIAMENTARY PORTFOLIO SCRUTINY · DATASET DISCOVERY
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            MP Intelligence &amp; Anomaly Ranking
          </h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 max-w-4xl leading-relaxed">
            Which constituencies and representatives have the strongest anomaly signals? This ranking evaluates statutory fund velocity, unit-cost variance, and vendor concentration across all active parliamentary records.
          </p>

          {/* Compact Inline Analytical Statistics (No heavy boxed cards) */}
          {datasetMetrics && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-data text-slate-600 border-t border-slate-100 mt-3">
              <span>
                <strong className="text-slate-950 font-emphasis text-sm mr-1.5">{datasetMetrics.totalMPs}</strong>
                Representatives Active (Seed Dataset)
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-blue-800 font-emphasis text-sm mr-1.5">{formatCurrency(datasetMetrics.totalAllocated)}</strong>
                Scrutinized Allocation
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-slate-950 font-emphasis text-sm mr-1.5">{datasetMetrics.averageUtilizationRate}%</strong>
                Avg Utilization Rate
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-orange-700 font-emphasis text-sm mr-1.5">{datasetMetrics.flaggedWorks}</strong>
                Works Flagged for Review
              </span>
              <span className="text-slate-300">•</span>
              <span>
                <strong className="text-slate-950 font-emphasis text-sm mr-1.5">{datasetMetrics.criticalMPs}</strong>
                High Attention Profiles (&ge;70)
              </span>
            </div>
          )}
        </div>

        {/* ─── Quiet Filter Toolbar ─── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by MP name, constituency, district, party..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 font-sans text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={houseFilter}
            onChange={handleHouseChange}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Houses</option>
            <option value="Lok Sabha">Lok Sabha</option>
            <option value="Rajya Sabha">Rajya Sabha</option>
          </select>

          <select
            value={stateFilter}
            onChange={handleStateChange}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st === "ALL" ? "All States / UTs" : st}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={handleRiskChange}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical Flag (&ge;80)</option>
            <option value="ELEVATED">Elevated Risk (60–79)</option>
            <option value="MODERATE">Moderate Flag (30–59)</option>
            <option value="LOW">Low Variance (&lt;30)</option>
          </select>

          <select
            value={sortBy}
            onChange={handleSortChange}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-semibold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="risk_score_desc">Sort: Highest Anomaly Risk</option>
            <option value="risk_score_asc">Sort: Lowest Anomaly Risk</option>
            <option value="anomaly_rate_desc">Sort: Highest Anomaly Rate (%)</option>
            <option value="works_count_desc">Sort: Most Sanctioned Works</option>
            <option value="expenditure_desc">Sort: Highest Expenditure</option>
            <option value="utilization_desc">Sort: Highest Utilization %</option>
          </select>
        </div>

        {/* ─── Main Content: Ranking Table + Selected MP Dossier Panel ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left / Dominant Ranking Table (8 cols on XL) */}
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-data text-slate-500 px-1">
              <span>Showing {data ? data.mps.length : 0} of {data ? data.total : 0} ranked representatives</span>
              <span>Click row to preview portfolio drivers</span>
            </div>

            {isLoading ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="font-sans text-xs text-slate-500">Querying active representative repository...</p>
              </div>
            ) : !data || data.mps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <p className="font-sans text-sm text-slate-500">No representatives found matching the criteria.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-data text-xs sm:text-sm">
                    <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-sans font-bold text-slate-700 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 pl-5 pr-2 w-12 text-center">#</th>
                        <th className="px-3 py-3.5">Representative</th>
                        <th className="px-3 py-3.5">Constituency</th>
                        <th className="px-3 py-3.5">Utilization</th>
                        <th className="px-3 py-3.5 text-center">Works</th>
                        <th className="px-3 py-3.5 text-center">Anomaly %</th>
                        <th className="px-3 py-3.5">Risk Score</th>
                        <th className="py-3.5 pr-5 text-right">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.mps.map((mp, index) => {
                        const rank = (data.page - 1) * data.limit + index + 1;
                        const isSelected = selectedMP?.mp_id === mp.mp_id;
                        const tier = getRiskTier(mp.risk_score);

                        return (
                          <tr
                            key={mp.mp_id}
                            onClick={() => setSelectedMP(mp)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-slate-50/70"
                            }`}
                          >
                            <td className="py-3.5 pl-5 pr-2 text-center font-emphasis font-bold text-slate-400">
                              {rank}
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-emphasis text-xs font-bold flex items-center justify-center shrink-0">
                                  {mp.avatar_initials || mp.name.split(" ").pop()?.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-sans text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-700">
                                    {mp.name}
                                  </div>
                                  <div className="font-sans text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <span className="font-semibold text-slate-700">{mp.party}</span>
                                    <span>·</span>
                                    <span>{mp.house}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="font-sans text-xs font-semibold text-slate-800">
                                {mp.constituency}
                              </div>
                              <div className="font-sans text-[11px] text-slate-500">
                                {mp.district}, {mp.state}
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="space-y-1 min-w-[100px]">
                                <div className="flex justify-between text-[11px] font-data">
                                  <span className="font-bold text-slate-800">{mp.utilization_rate}%</span>
                                  <span className="text-slate-400">{formatCurrency(mp.recorded_expenditure)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      mp.utilization_rate > 90
                                        ? "bg-emerald-600"
                                        : mp.utilization_rate > 60
                                        ? "bg-blue-600"
                                        : "bg-amber-500"
                                    }`}
                                    style={{ width: `${Math.min(100, mp.utilization_rate)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <div className="font-bold text-slate-800">{mp.works_count}</div>
                              <div className="text-[11px] text-orange-700 font-semibold">{mp.flagged_works} flagged</div>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <span
                                className={`font-bold ${
                                  mp.anomaly_rate > 20
                                    ? "text-red-700"
                                    : mp.anomaly_rate > 8
                                    ? "text-orange-700"
                                    : "text-slate-600"
                                }`}
                              >
                                {mp.anomaly_rate}%
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <RiskBadge score={mp.risk_score} tier={tier} showScore={true} />
                            </td>
                            <td className="py-3.5 pr-5 text-right">
                              <Link
                                href={`/mps/${mp.mp_id}`}
                                className="font-sans text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                              >
                                Dossier &rarr;
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

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs font-sans">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  &larr; Previous
                </button>
                <span className="font-data text-slate-500">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  disabled={currentPage >= data.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Right / Selected MP Quick Summary & Driving Works (4 cols on XL) */}
          <div className="xl:col-span-4 space-y-4">
            {selectedMP ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 sticky top-28">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-emphasis text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                      SELECTED REPRESENTATIVE
                    </span>
                    <h3 className="font-heading text-lg font-bold text-slate-950 mt-0.5">{selectedMP.name}</h3>
                    <p className="font-sans text-xs text-slate-500">
                      {selectedMP.constituency} ({selectedMP.state}) · {selectedMP.party}
                    </p>
                  </div>
                  <RiskBadge score={selectedMP.risk_score} tier={getRiskTier(selectedMP.risk_score)} showScore={true} />
                </div>

                {/* Financial Velocity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-sans text-slate-500">Statutory Entitlement Utilization</span>
                    <span className="font-data font-bold text-slate-900">{selectedMP.utilization_rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedMP.utilization_rate > 90
                          ? "bg-emerald-600"
                          : selectedMP.utilization_rate > 60
                          ? "bg-blue-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, selectedMP.utilization_rate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-data text-slate-500">
                    <span>Spent: {formatCurrency(selectedMP.recorded_expenditure)}</span>
                    <span>Alloc: {formatCurrency(selectedMP.allocated_amount)}</span>
                  </div>
                </div>

                {/* Portfolio Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 text-center font-sans">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[11px] text-slate-500">Completed Works</div>
                    <div className="font-data text-base font-bold text-slate-900">{selectedMP.completed_works}</div>
                  </div>
                  <div className="p-2.5 bg-orange-50/70 rounded-xl border border-orange-100">
                    <div className="text-[11px] text-orange-800">Flagged For Review</div>
                    <div className="font-data text-base font-bold text-orange-700">{selectedMP.flagged_works}</div>
                  </div>
                </div>

                {/* Scrutiny Insight */}
                <div className="space-y-1 text-xs font-sans text-slate-600">
                  <div className="font-semibold text-slate-800">Scrutiny Context:</div>
                  <p className="text-slate-500 leading-relaxed">
                    {selectedMP.anomaly_rate > 15
                      ? `Portfolio shows elevated anomaly concentration (${selectedMP.anomaly_rate}% flagged). Primary indicators point to unit cost divergence and repetitive agency assignments in this constituency.`
                      : `Portfolio exhibits healthy peer compliance with ${selectedMP.flagged_works} works currently under standard verification.`}
                  </p>
                </div>

                {/* Action CTA */}
                <Link
                  href={`/mps/${selectedMP.mp_id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Open Complete Parliamentary Dossier</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-sans">
                Select a representative to view portfolio drivers
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
