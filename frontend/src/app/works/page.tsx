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
          w.district.toLowerCase().includes(q)
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
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950">Work Explorer</h1>
          <p className="text-sm text-slate-600 mt-0.5">{WORKS.length} MPLADS works indexed. Browse, filter, and drill into any project. Synthetic data.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl">
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search by Work ID, description, constituency, district..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600" />
          </div>
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            {states.map((s) => <option key={s} value={s}>{s === "ALL" ? "All States" : s}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            {categories.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            {["ALL", "Critical", "Elevated", "Moderate", "Low"].map((t) => <option key={t} value={t}>{t === "ALL" ? "All Risk Tiers" : t}</option>)}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">{filtered.length} works</div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-5 pr-3">Work ID</th>
                  <th className="px-3 py-3.5">Description</th>
                  <th className="px-3 py-3.5">Constituency</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5 cursor-pointer select-none" onClick={() => toggleSort("sanctionedAmount")}>
                    Cost {sortField === "sanctionedAmount" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-3.5 cursor-pointer select-none" onClick={() => toggleSort("riskScore")}>
                    Risk {sortField === "riskScore" && (sortDir === "desc" ? "↓" : "↑")}
                  </th>
                  <th className="px-3 py-3.5 pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((w) => (
                  <tr key={w.workId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-5 pr-3">
                      <Link href={`/investigations/${w.workId}`} className="font-mono text-xs font-semibold text-blue-800 hover:underline">{w.workId}</Link>
                    </td>
                    <td className="px-3 py-4 max-w-xs">
                      <Link href={`/investigations/${w.workId}`} className="font-medium text-slate-900 hover:text-blue-700 line-clamp-1">{w.description}</Link>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-600">{w.constituency}<br /><span className="text-slate-400">{w.district}, {w.state}</span></td>
                    <td className="px-3 py-4 text-xs text-slate-600">{w.category}</td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-900 whitespace-nowrap">{formatCurrency(w.sanctionedAmount)}</td>
                    <td className="px-3 py-4"><RiskBadge score={w.riskScore} tier={getRiskTier(w.riskScore)} /></td>
                    <td className="px-3 py-4 pr-5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
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
