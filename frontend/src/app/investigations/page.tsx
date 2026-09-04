"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, INVESTIGATIONS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { AnomalyTypeBadge } from "@/components/AnomalyTypeBadge";

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
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950">Investigations</h1>
          <p className="text-sm text-slate-600 mt-0.5">Cases requiring human review. Synthetic demonstration data.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl">
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search by Work ID, description, constituency..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600" />
          </div>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            {RISK_TIERS.map((t) => <option key={t} value={t}>{t === "ALL" ? "All Risk Tiers" : t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>)}
          </select>
          <select value={anomalyFilter} onChange={(e) => setAnomalyFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            <option value="ALL">All Anomaly Types</option>
            <option value="cost">Cost Variance</option>
            <option value="semantic">Semantic Overlap</option>
            <option value="geographic">Geographic</option>
            <option value="pattern">Pattern</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">{filtered.length} cases matching filters</div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-5 pr-3 cursor-pointer select-none" onClick={() => toggleSort("riskScore")}>
                    Risk {sortField === "riskScore" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-3.5">Work ID</th>
                  <th className="px-3 py-3.5">Description</th>
                  <th className="px-3 py-3.5">Location</th>
                  <th className="px-3 py-3.5 cursor-pointer select-none" onClick={() => toggleSort("sanctionedAmount")}>
                    Cost {sortField === "sanctionedAmount" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-3.5">Primary Signal</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-500">No cases matching criteria.</td></tr>
                ) : filtered.map((inv) => (
                  <tr key={inv.investigationId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-5 pr-3">
                      <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} />
                    </td>
                    <td className="px-3 py-4">
                      <Link href={`/investigations/${inv.workId}`} className="font-mono text-xs font-semibold text-blue-800 hover:underline">{inv.workId}</Link>
                    </td>
                    <td className="px-3 py-4 max-w-xs">
                      <Link href={`/investigations/${inv.workId}`} className="font-medium text-slate-900 hover:text-blue-700 line-clamp-1">{inv.work.description}</Link>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-600">{inv.work.constituency}<br /><span className="text-slate-400">{inv.work.district}, {inv.work.state}</span></td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-900 whitespace-nowrap">{formatCurrency(inv.work.sanctionedAmount)}</td>
                    <td className="px-3 py-4 text-xs text-orange-700 font-medium max-w-[200px] line-clamp-2">{inv.primarySignal}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                        inv.status === "Flagged" ? "bg-red-50 text-red-800 border-red-200" :
                        inv.status === "Escalated" ? "bg-orange-50 text-orange-800 border-orange-200" :
                        inv.status === "Under Review" ? "bg-blue-50 text-blue-800 border-blue-200" :
                        inv.status === "Triaged" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        inv.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-600">{inv.assignedTo}</td>
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
