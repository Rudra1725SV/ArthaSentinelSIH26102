"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { getMPs, PaginatedMPsResponse } from "@/lib/api";
import { formatCurrency, getRiskTier, SEED_MPS } from "@/lib/mock-data";
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
      limit: 9,
      search: searchTerm,
      house: houseFilter,
      state: stateFilter,
      risk: riskFilter,
      sort: sortBy,
    }).then((res) => {
      if (!isCancelled) {
        setData(res);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, houseFilter, stateFilter, riskFilter, sortBy, currentPage]);

  // Reset to page 1 on filter changes
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="font-emphasis text-xs font-bold tracking-wider text-blue-800 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              PARLIAMENTARY SCRUTINY REPOSITORY · SIH26102
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">
              Browse Members of Parliament
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-600 mt-1 max-w-3xl">
              Dataset-driven portfolio scrutiny: track fund utilization velocity, peer deviation scores, and category
              clustering across Lok Sabha and Rajya Sabha representatives.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-data bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 text-blue-600" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Dynamic Discovery Mode · Seed Dataset</span>
          </div>
        </div>

        {/* Dynamic Aggregated Metrics Strip */}
        {datasetMetrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
              <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Representatives
              </div>
              <div className="font-emphasis text-2xl font-bold text-slate-900 mt-1">
                {datasetMetrics.totalMPs.toLocaleString()}
                <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">(Dataset Active)</span>
              </div>
              <div className="font-data text-xs text-slate-500 mt-1">
                {datasetMetrics.statesCovered} States · {datasetMetrics.districtsCovered} Districts
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
              <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
                Scrutinized Allocation
              </div>
              <div className="font-emphasis text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(datasetMetrics.totalAllocated)}
              </div>
              <div className="font-data text-xs text-slate-500 mt-1">
                {formatCurrency(datasetMetrics.totalExpenditure)} Recorded ({datasetMetrics.averageUtilizationRate}% utilized)
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
              <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
                Indexed Works
              </div>
              <div className="font-emphasis text-2xl font-bold text-slate-900 mt-1">
                {datasetMetrics.totalWorks.toLocaleString()}
              </div>
              <div className="font-data text-xs text-slate-500 mt-1">
                {datasetMetrics.flaggedWorks} flagged ({datasetMetrics.anomalyRate}% anomaly baseline)
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
              <div className="font-sans text-xs font-medium text-slate-500 uppercase tracking-wider">
                High Attention Profiles
              </div>
              <div className="font-emphasis text-2xl font-bold text-orange-700 mt-1">
                {datasetMetrics.criticalMPs}
                <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">require priority review</span>
              </div>
              <div className="font-data text-xs text-slate-500 mt-1">
                Composite anomaly score &ge; 70
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
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
                placeholder="Search MP name, constituency, district, party..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 font-sans text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* House Dropdown */}
            <div className="md:col-span-2">
              <select
                value={houseFilter}
                onChange={handleHouseChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Parliamentary Houses</option>
                <option value="Lok Sabha">Lok Sabha</option>
                <option value="Rajya Sabha">Rajya Sabha</option>
              </select>
            </div>

            {/* State Dropdown */}
            <div className="md:col-span-2">
              <select
                value={stateFilter}
                onChange={handleStateChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st === "ALL" ? "All States / UTs" : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Tier Dropdown */}
            <div className="md:col-span-2">
              <select
                value={riskFilter}
                onChange={handleRiskChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="CRITICAL">Critical Flag (&ge;80)</option>
                <option value="ELEVATED">Elevated Risk (60–79)</option>
                <option value="MODERATE">Moderate Flag (30–59)</option>
                <option value="LOW">Low Variance (&lt;30)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 font-sans text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="risk_score_desc">Risk Score (High → Low)</option>
                <option value="risk_score_asc">Risk Score (Low → High)</option>
                <option value="anomaly_rate_desc">Anomaly Rate (%)</option>
                <option value="works_count_desc">Works Count</option>
                <option value="expenditure_desc">Expenditure (₹)</option>
                <option value="utilization_desc">Utilization Rate (%)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-data text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing {data ? data.mps.length : 0} of {data ? data.total : 0} filtered representatives
            </span>
            <span>
              Page {data?.page || 1} of {data?.totalPages || 1}
            </span>
          </div>
        </div>

        {/* MP Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-sans text-sm text-slate-500">Querying MP repository...</p>
          </div>
        ) : !data || data.mps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="font-heading text-base font-semibold text-slate-800">No representatives match your criteria</h3>
            <p className="font-sans text-sm text-slate-500 mt-1">
              Try adjusting your search terms or clearing state/risk filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.mps.map((mp) => {
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
                <div
                  key={mp.mp_id}
                  className="bg-white border border-slate-200 hover:border-blue-400/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Avatar, Name, House & Party */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-emphasis text-sm font-bold flex items-center justify-center shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <Link
                            href={`/mps/${mp.mp_id}`}
                            className="font-heading text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1"
                          >
                            {mp.name}
                          </Link>
                          <div className="font-sans text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700">{mp.party}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                              {mp.house}
                            </span>
                          </div>
                        </div>
                      </div>

                      <RiskBadge score={mp.risk_score} tier={riskTier} showScore={true} />
                    </div>

                    {/* Constituency & State */}
                    <div className="bg-slate-50 rounded-xl p-2.5 mb-4 border border-slate-100">
                      <div className="font-sans text-xs text-slate-500">Constituency & District</div>
                      <div className="font-sans text-xs font-semibold text-slate-800 mt-0.5">
                        {mp.constituency} ({mp.district}, {mp.state})
                      </div>
                    </div>

                    {/* Financial Utilization Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sans text-slate-500">Fund Utilization</span>
                        <span className="font-data font-semibold text-slate-900">{mp.utilization_rate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
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
                      <div className="flex justify-between text-[11px] font-data text-slate-500 pt-0.5">
                        <span>Spent: {formatCurrency(mp.recorded_expenditure)}</span>
                        <span>Alloc: {formatCurrency(mp.allocated_amount)}</span>
                      </div>
                    </div>

                    {/* Scrutiny Work Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-slate-100 mb-4 text-center">
                      <div>
                        <div className="font-sans text-[11px] text-slate-500">Total Works</div>
                        <div className="font-data text-sm font-bold text-slate-800">{mp.works_count}</div>
                      </div>
                      <div>
                        <div className="font-sans text-[11px] text-slate-500">Flagged</div>
                        <div className="font-data text-sm font-bold text-orange-700">{mp.flagged_works}</div>
                      </div>
                      <div>
                        <div className="font-sans text-[11px] text-slate-500">Anomaly Rate</div>
                        <div
                          className={`font-data text-sm font-bold ${
                            mp.anomaly_rate > 25
                              ? "text-red-600"
                              : mp.anomaly_rate > 10
                              ? "text-orange-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {mp.anomaly_rate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <Link
                    href={`/mps/${mp.mp_id}`}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-1"
                  >
                    <span>Inspect Parliamentary Dossier</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-sans text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &larr; Previous Page
            </button>

            <div className="flex items-center gap-1.5 font-data text-xs">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                    currentPage === num
                      ? "bg-blue-700 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage >= data.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-sans text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next Page &rarr;
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
