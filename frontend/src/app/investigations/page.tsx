"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, INVESTIGATIONS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

const STATUSES = ["ALL", "Flagged", "Triaged", "Under Review", "Escalated", "Resolved", "Dismissed"];
const RISK_TIERS = ["ALL", "Critical", "Elevated", "Moderate", "Low"];

export default function InvestigationsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [anomalyFilter, setAnomalyFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"riskScore" | "sanctionedAmount">("riskScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const enrichedInvestigations = useMemo(() => {
    return INVESTIGATIONS.map((inv) => ({
      ...inv,
      work: WORKS.find((w) => w.workId === inv.workId)!,
    })).filter((inv) => inv.work);
  }, []);

  const filtered = useMemo(() => {
    let result = [...enrichedInvestigations];
    if (statusFilter !== "ALL") result = result.filter((inv) => inv.status === statusFilter);
    if (riskFilter !== "ALL") result = result.filter((inv) => getRiskTier(inv.riskScore) === riskFilter);
    if (anomalyFilter !== "ALL") result = result.filter((inv) => inv.work.anomalyTypes.includes(anomalyFilter as any));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((inv) =>
        inv.workId.toLowerCase().includes(q) ||
        inv.work.description.toLowerCase().includes(q) ||
        inv.work.constituency.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = sortField === "riskScore" ? a.riskScore : a.work.sanctionedAmount;
      const bVal = sortField === "riskScore" ? b.riskScore : b.work.sanctionedAmount;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [enrichedInvestigations, statusFilter, riskFilter, anomalyFilter, searchTerm, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="font-emphasis text-xs font-bold tracking-wider text-orange-700 uppercase">
            SCRUTINY QUEUE · PRIORITY TRIAGE
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">Investigations</h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-1">
            Projects flagged by multi-signal detection models requiring verified investigator due diligence.
          </p>
        </div>

        {/* Filters Row in Inter */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Work ID, description, constituency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 font-sans text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            {RISK_TIERS.map((t) => <option key={t} value={t}>{t === "ALL" ? "All Risk Tiers" : `${t} Risk`}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Case Statuses" : s}</option>)}
          </select>
          <select
            value={anomalyFilter}
            onChange={(e) => setAnomalyFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            <option value="ALL">All Anomaly Types</option>
            <option value="cost">Cost Variance</option>
            <option value="semantic">Semantic Overlap</option>
            <option value="geographic">Geographic</option>
            <option value="pattern">Pattern</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs font-data text-slate-500">
          <span>{filtered.length} flagged cases matching filters</span>
          <span>Sorted by {sortField === "riskScore" ? "Risk Score" : "Sanction Cost"} ({sortDir.toUpperCase()})</span>
        </div>

        {/* Table using Roboto (font-data) for dense data */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-data text-sm">
              <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-sans font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6 pr-3 cursor-pointer select-none" onClick={() => toggleSort("riskScore")}>
                    Risk {sortField === "riskScore" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-4">Work ID</th>
                  <th className="px-3 py-4">Description</th>
                  <th className="px-3 py-4">Location</th>
                  <th className="px-3 py-4 cursor-pointer select-none" onClick={() => toggleSort("sanctionedAmount")}>
                    Cost {sortField === "sanctionedAmount" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-4">Primary Signal</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 pr-6">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-data">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-sm font-sans text-slate-500">No cases matching criteria.</td></tr>
                ) : filtered.map((inv) => (
                  <tr key={inv.investigationId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-6 pr-3 font-sans">
                      <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} />
                    </td>
                    <td className="px-3 py-4">
                      <Link href={`/investigations/${inv.workId}`} className="font-bold text-blue-800 hover:underline">
                        {inv.workId}
                      </Link>
                    </td>
                    <td className="px-3 py-4 max-w-sm">
                      <Link href={`/investigations/${inv.workId}`} className="font-sans font-semibold text-slate-900 hover:text-blue-700 line-clamp-1">
                        {inv.work.description}
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-700">
                      <div>{inv.work.constituency}</div>
                      <div className="text-slate-400">{inv.work.district}, {inv.work.state}</div>
                    </td>
                    <td className="px-3 py-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(inv.work.sanctionedAmount)}
                    </td>
                    <td className="px-3 py-4 text-xs text-orange-700 font-semibold max-w-[220px] line-clamp-2">
                      {inv.primarySignal}
                    </td>
                    <td className="px-3 py-4 font-sans">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        inv.status === "Flagged" ? "bg-red-50 text-red-800 border-red-200" :
                        inv.status === "Escalated" ? "bg-orange-50 text-orange-800 border-orange-200" :
                        inv.status === "Under Review" ? "bg-blue-50 text-blue-800 border-blue-200" :
                        inv.status === "Triaged" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        inv.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-3 py-4 pr-6 text-xs text-slate-600">
                      {inv.assignedTo}
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
