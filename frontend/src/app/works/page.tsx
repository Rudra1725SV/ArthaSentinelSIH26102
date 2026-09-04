"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

export default function WorksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"riskScore" | "sanctionedAmount">("riskScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const states = useMemo(() => ["ALL", ...new Set(WORKS.map((w) => w.state))], []);
  const categories = useMemo(() => ["ALL", ...new Set(WORKS.map((w) => w.category))], []);

  const filtered = useMemo(() => {
    let result = [...WORKS];
    if (stateFilter !== "ALL") result = result.filter((w) => w.state === stateFilter);
    if (categoryFilter !== "ALL") result = result.filter((w) => w.category === categoryFilter);
    if (riskFilter !== "ALL") result = result.filter((w) => getRiskTier(w.riskScore) === riskFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (w) =>
          w.workId.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.constituency.toLowerCase().includes(q) ||
          w.district.toLowerCase().includes(q) ||
          (w.mp_name && w.mp_name.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      const aVal = sortField === "riskScore" ? a.riskScore : a.sanctionedAmount;
      const bVal = sortField === "riskScore" ? b.riskScore : b.sanctionedAmount;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [searchTerm, stateFilter, categoryFilter, riskFilter, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="font-emphasis text-xs font-bold tracking-wider text-blue-800 uppercase">
            PUBLIC PROJECT REPOSITORY · SIH26102
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">Work Explorer</h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-1">
            Browse, filter, and inspect sanctioned MPLADS infrastructure works across all parliamentary constituencies.
          </p>
        </div>

        {/* Filters in Inter */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Work ID, description, MP name, constituency, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 font-sans text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            {states.map((s) => <option key={s} value={s}>{s === "ALL" ? "All States" : s}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            {categories.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            {["ALL", "Critical", "Elevated", "Moderate", "Low"].map((t) => <option key={t} value={t}>{t === "ALL" ? "All Risk Tiers" : `${t} Risk`}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs font-data text-slate-500">
          <span>{filtered.length} works indexed matching filters</span>
          <span>Sorted by {sortField === "sanctionedAmount" ? "Sanctioned Amount" : "Risk Score"} ({sortDir.toUpperCase()})</span>
        </div>

        {/* Table using Roboto (font-data) for dense numerical readability */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-data text-sm">
              <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-sans font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6 pr-3">Work ID</th>
                  <th className="px-3 py-4">Description</th>
                  <th className="px-3 py-4">Representative (MP)</th>
                  <th className="px-3 py-4">Constituency</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4 cursor-pointer select-none" onClick={() => toggleSort("sanctionedAmount")}>
                    Cost {sortField === "sanctionedAmount" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-4 cursor-pointer select-none" onClick={() => toggleSort("riskScore")}>
                    Risk {sortField === "riskScore" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-data">
                {filtered.map((w) => (
                  <tr key={w.workId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-6 pr-3">
                      <Link href={`/investigations/${w.workId}`} className="font-bold text-blue-800 hover:underline">
                        {w.workId}
                      </Link>
                    </td>
                    <td className="px-3 py-4 max-w-sm">
                      <Link href={`/investigations/${w.workId}`} className="font-sans font-semibold text-slate-900 hover:text-blue-700 line-clamp-1">
                        {w.description}
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-xs font-sans">
                      {w.mp_id ? (
                        <Link href={`/mps/${w.mp_id}`} className="font-medium text-blue-700 hover:text-blue-900 hover:underline">
                          {w.mp_name}
                        </Link>
                      ) : (
                        <span className="text-slate-500">{w.mp_name || "Unassigned"}</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-700">
                      <div>{w.constituency}</div>
                      <div className="text-slate-400">{w.district}, {w.state}</div>
                    </td>
                    <td className="px-3 py-4 text-xs font-sans text-slate-700">{w.category}</td>
                    <td className="px-3 py-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(w.sanctionedAmount)}
                    </td>
                    <td className="px-3 py-4 font-sans">
                      <RiskBadge score={w.riskScore} tier={getRiskTier(w.riskScore)} />
                    </td>
                    <td className="px-3 py-4 pr-6 font-sans">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        w.status === "Flagged" ? "bg-red-50 text-red-800 border-red-200" :
                        w.status === "Escalated" ? "bg-orange-50 text-orange-800 border-orange-200" :
                        w.status === "Under Review" ? "bg-blue-50 text-blue-800 border-blue-200" :
                        w.status === "Triaged" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        w.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>{w.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
