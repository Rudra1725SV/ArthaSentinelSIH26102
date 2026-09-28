"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { getWorks, PaginatedWorksResponse } from "@/lib/api";
import { formatCurrency, getRiskTier, Work } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function WorksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [houseFilter, setHouseFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"riskScore" | "sanctionedAmount">("sanctionedAmount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<PaginatedWorksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch paginated works from backend API
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const sort_by = sortField === "sanctionedAmount" 
      ? (sortDir === "desc" ? "cost_desc" : "cost_asc")
      : (sortDir === "desc" ? "risk_desc" : "risk_asc");

    getWorks({
      page: currentPage,
      limit: 15,
      search: searchTerm,
      state: stateFilter,
      category: categoryFilter,
      house: houseFilter,
      risk: riskFilter,
      sort_by,
    }).then((res) => {
      if (!isCancelled) {
        setData(res);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, stateFilter, categoryFilter, houseFilter, riskFilter, sortField, sortDir, currentPage]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  const works = data?.works || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const availableStates = data?.availableStates || [];
  const availableCategories = data?.availableCategories || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header Enclosed in Navy Blue Flexbox Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-lg">
          <div className="space-y-1.5">
            <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              PUBLIC PROJECT REPOSITORY · SIH26102
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Work Explorer</h1>
            <p className="font-sans text-sm sm:text-base text-slate-300 max-w-3xl">
              Browse, filter, and inspect {total > 0 ? total.toLocaleString() : "23,044"} sanctioned MPLADS infrastructure works across all parliamentary constituencies.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
            <span>INDEXED: <strong className="text-white">{total > 0 ? total.toLocaleString() : "23,044"}</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400">REAL DATASET</span>
          </div>
        </div>

        {/* Filters in Inter */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Work ID, description, MP name, constituency, district..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 font-sans text-sm sm:text-base bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <select
            value={houseFilter}
            onChange={(e) => {
              setHouseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Houses</option>
            <option value="Lok Sabha">Lok Sabha</option>
            <option value="Rajya Sabha">Rajya Sabha</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 max-w-[180px]"
          >
            <option value="ALL">All States</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 max-w-[200px]"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            {["ALL", "Critical", "Elevated", "Moderate", "Low"].map((t) => (
              <option key={t} value={t}>{t === "ALL" ? "All Risk Tiers" : `${t} Risk`}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-data text-slate-600">
          <div>
            <span><strong className="text-slate-900 font-semibold">{total.toLocaleString()}</strong> works indexed matching filters</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-sans font-medium">Sort by:</span>
            <button
              onClick={() => toggleSort("sanctionedAmount")}
              className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold border transition-all cursor-pointer ${
                sortField === "sanctionedAmount"
                  ? "bg-blue-900 text-white border-blue-900 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Cost {sortField === "sanctionedAmount" && (sortDir === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => toggleSort("riskScore")}
              className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold border transition-all cursor-pointer ${
                sortField === "riskScore"
                  ? "bg-blue-900 text-white border-blue-900 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Risk {sortField === "riskScore" && (sortDir === "desc" ? "↓" : "↑")}
            </button>
          </div>
        </div>

        {/* Work Cards List — Structured Flexbox Cards with Generous Padding and Balanced Bento Styling */}
        <div className="space-y-3.5 relative min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-blue-700 font-sans font-semibold">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading works...
              </div>
            </div>
          )}

          {works.length === 0 && !isLoading ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-sans">No works found matching your filter criteria.</p>
            </div>
          ) : (
            works.map((w) => (
              <div
                key={w.id || w.workId}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all"
              >
                {/* Left Side: Work ID, Category, Description, Sponsoring MP & Constituency */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80">
                      #{w.workId}
                    </span>
                    <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {w.category}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${
                      w.status === "Flagged" ? "bg-red-50 text-red-700 border-red-200" :
                      w.status === "Escalated" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      w.status === "Under Review" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      w.status === "Triaged" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      w.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {w.status || "Compliant / Unflagged"}
                    </span>
                    {w.riskScore !== undefined && (
                      <RiskBadge score={w.riskScore} tier={getRiskTier(w.riskScore)} showScore={true} />
                    )}
                  </div>

                  {/* Description */}
                  <Link
                    href={`/investigations/${w.workId}`}
                    className="block font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug"
                  >
                    {w.description}
                  </Link>

                  {/* Metadata: MP & Geography */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-sans text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Representative:</span>
                      {w.mp_id ? (
                        <Link href={`/mps/${w.mp_id}`} className="font-semibold text-blue-700 hover:underline">
                          {w.mp_name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-800">{w.mp_name || "Unassigned"}</span>
                      )}
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth="2">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-semibold text-slate-800">{w.constituency}</span>
                      <span className="text-slate-500">({w.district}, {w.state})</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Cost and Action Button */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-emphasis font-bold uppercase tracking-wider text-slate-400">
                      Sanctioned Amount
                    </div>
                    <div className="font-emphasis text-xl sm:text-2xl font-extrabold text-slate-950">
                      {formatCurrency(w.sanctionedAmount)}
                    </div>
                  </div>
                  <Link
                    href={`/investigations/${w.workId}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-sans text-xs sm:text-sm font-semibold border border-blue-200 transition-colors shadow-2xs"
                  >
                    <span>Dossier</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Navigation Controls */}
        <div className="flex items-center justify-between pt-2 pb-6 border-b border-slate-200">
          <div className="text-xs sm:text-sm font-sans text-slate-500">
            Showing <span className="font-semibold text-slate-800">{works.length}</span> of <span className="font-semibold text-slate-800">{total.toLocaleString()}</span> works
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-sans font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &larr; Previous
            </button>

            <span className="px-3 py-1 text-xs sm:text-sm font-data font-semibold text-slate-700 bg-slate-100 rounded-lg">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-sans font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
