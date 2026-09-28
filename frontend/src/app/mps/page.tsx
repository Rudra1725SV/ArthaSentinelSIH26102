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

  // Discover distinct states dynamically from API or seed/loaded dataset
  const availableStates = useMemo(() => {
    if (data?.availableStates && data.availableStates.length > 0) {
      return ["ALL", ...data.availableStates];
    }
    const s = new Set<string>();
    SEED_MPS.forEach((m) => s.add(m.state));
    return ["ALL", ...Array.from(s).sort()];
  }, [data?.availableStates]);

  // Fetch or compute paginated MPs
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    getMPs({
      page: currentPage,
      limit: 16,
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
        {/* ─── Page Header & Analytical Statistics Enclosed in Navy Blue Flexbox ─── */}
        <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-lg">
          <div className="space-y-2">
            <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              PARLIAMENTARY PORTFOLIO SCRUTINY · DATASET DISCOVERY
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              MP Intelligence &amp; Anomaly Ranking
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
              Which constituencies and representatives have the strongest anomaly signals? This ranking evaluates statutory fund velocity, unit-cost variance, and vendor concentration across all active parliamentary records.
            </p>
          </div>

          {/* Inline Analytical Statistics within Navy Flexbox */}
          {datasetMetrics && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-3.5 text-xs sm:text-sm font-data text-slate-300 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <strong className="text-white font-emphasis text-base">{datasetMetrics.totalMPs}</strong>
                <span className="text-slate-400">Representatives Active</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-blue-400 font-emphasis text-base">{formatCurrency(datasetMetrics.totalAllocated)}</strong>
                <span className="text-slate-400">Scrutinized Allocation</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-white font-emphasis text-base">{datasetMetrics.averageUtilizationRate}%</strong>
                <span className="text-slate-400">Avg Utilization</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-orange-400 font-emphasis text-base">{datasetMetrics.flaggedWorks}</strong>
                <span className="text-slate-400">Works Flagged</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-white font-emphasis text-base">{datasetMetrics.criticalMPs}</strong>
                <span className="text-slate-400">High Attention Profiles (&ge;70)</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.mps.map((mp, index) => {
                  const rank = (data.page - 1) * data.limit + index + 1;
                  const isSelected = selectedMP?.mp_id === mp.mp_id;
                  const tier = getRiskTier(mp.risk_score);

                  return (
                    <div
                      key={mp.mp_id}
                      onClick={() => setSelectedMP(mp)}
                      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20"
                          : "border-slate-200/90 hover:border-blue-300"
                      }`}
                    >
                      {/* Top Row: Rank, Avatar, Name & Party */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#0B1528] text-white font-emphasis text-sm font-bold flex items-center justify-center shrink-0 shadow-xs">
                            {mp.avatar_initials || mp.name.split(" ").pop()?.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-emphasis text-xs font-bold text-slate-400">#{rank}</span>
                              <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                {mp.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 font-sans text-xs text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-700">{mp.party}</span>
                              {mp.party !== mp.house && (
                                <>
                                  <span>·</span>
                                  <span>{mp.house}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <RiskBadge score={mp.risk_score} tier={tier} showScore={true} />
                      </div>

                      {/* Middle: Constituency & Geography */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-sans text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth="2">
                            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="font-semibold text-slate-800 truncate">{mp.constituency}</span>
                          <span className="text-slate-400">({mp.state})</span>
                        </div>
                        <span className="font-data font-bold text-xs shrink-0 text-slate-700">
                          {mp.works_count} works
                        </span>
                      </div>

                      {/* Progress: Utilization */}
                      <div className="mt-3 space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-data">
                          <span className="text-slate-500 font-sans">Statutory Utilization</span>
                          <div className="space-x-1.5">
                            <span className="font-bold text-slate-900">{mp.utilization_rate}%</span>
                            <span className="text-slate-400">({formatCurrency(mp.recorded_expenditure)})</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
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

                      {/* Bottom Row: Anomaly Status & Dossier CTA */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                            {mp.flagged_works} flagged
                          </span>
                          <span className={`font-data font-bold ${
                            mp.anomaly_rate > 20 ? "text-red-600" : mp.anomaly_rate > 8 ? "text-orange-600" : "text-slate-500"
                          }`}>
                            {mp.anomaly_rate}% rate
                          </span>
                        </div>
                        <Link
                          href={`/mps/${mp.mp_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                        >
                          Dossier &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs font-sans">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  &larr; Previous
                </button>
                <span className="font-data text-slate-600 font-semibold">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  disabled={currentPage >= data.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Right / Selected MP Quick Summary & Driving Works (4 cols on XL) */}
          <div className="xl:col-span-4 space-y-4">
            {selectedMP ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-5 sticky top-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-emphasis text-xs font-bold text-blue-800 uppercase tracking-wider">
                      SELECTED REPRESENTATIVE
                    </span>
                    <h3 className="font-heading text-xl font-bold text-slate-950 mt-0.5">{selectedMP.name}</h3>
                    <p className="font-sans text-sm text-slate-600 mt-0.5">
                      {selectedMP.constituency} ({selectedMP.state}) · {selectedMP.party}
                      {selectedMP.party !== selectedMP.house && ` · ${selectedMP.house}`}
                    </p>
                  </div>
                  <RiskBadge score={selectedMP.risk_score} tier={getRiskTier(selectedMP.risk_score)} showScore={true} />
                </div>

                {/* Financial Velocity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-sans text-slate-600">Statutory Entitlement Utilization</span>
                    <span className="font-data font-bold text-slate-900">{selectedMP.utilization_rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
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
                  <div className="flex justify-between text-xs sm:text-sm font-data text-slate-500">
                    <span>Spent: {formatCurrency(selectedMP.recorded_expenditure)}</span>
                    <span>Alloc: {formatCurrency(selectedMP.allocated_amount)}</span>
                  </div>
                </div>

                {/* Portfolio Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 text-center font-sans">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Completed Works</div>
                    <div className="font-data text-xl font-bold text-slate-900 mt-0.5">{selectedMP.completed_works}</div>
                  </div>
                  <div className="p-3.5 bg-orange-50/70 rounded-xl border border-orange-200/80">
                    <div className="text-xs sm:text-sm text-orange-800 font-semibold">Flagged For Review</div>
                    <div className="font-data text-xl font-bold text-orange-700 mt-0.5">{selectedMP.flagged_works}</div>
                  </div>
                </div>

                {/* Scrutiny Insight */}
                <div className="space-y-1.5 text-sm font-sans text-slate-600 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Scrutiny Context
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-1">
                    {selectedMP.anomaly_rate > 15
                      ? `Portfolio shows elevated anomaly concentration (${selectedMP.anomaly_rate}% flagged). Primary indicators point to unit cost divergence and repetitive agency assignments in this constituency.`
                      : `Portfolio exhibits healthy peer compliance with ${selectedMP.flagged_works} works currently under standard verification.`}
                  </p>
                </div>

                {/* Action CTA */}
                <Link
                  href={`/mps/${selectedMP.mp_id}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
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
