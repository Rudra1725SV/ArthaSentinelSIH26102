"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { WORKS, INVESTIGATIONS as FALLBACK_INVESTIGATIONS, formatCurrency, getRiskTier } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { getInvestigations } from "@/lib/api";

const STATUSES = ["ALL", "Flagged", "Triaged", "Under Review", "Escalated", "Resolved", "Dismissed", "Pending Review"];
const RISK_TIERS = ["ALL", "Critical", "Elevated", "Moderate", "Low"];

export default function InvestigationsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [anomalyFilter, setAnomalyFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"riskScore" | "sanctionedAmount">("riskScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rawInvestigations, setRawInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getInvestigations().then((res) => {
      if (mounted) {
        if (res.investigations && res.investigations.length > 0) {
          setRawInvestigations(res.investigations);
        } else {
          setRawInvestigations(FALLBACK_INVESTIGATIONS);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setRawInvestigations(FALLBACK_INVESTIGATIONS);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const enrichedInvestigations = useMemo(() => {
    return rawInvestigations.map((inv) => {
      // If the backend already attached work summary, use it; otherwise fallback to WORKS lookup
      const workData = inv.work || WORKS.find((w) => w.workId === inv.workId) || {
        description: "MPLADS Work",
        sanctionedAmount: 0,
        constituency: "Unknown",
        district: "Unknown",
        state: "Unknown",
        category: "General",
        anomalyTypes: ["cost"],
      };
      return {
        ...inv,
        work: workData,
      };
    });
  }, [rawInvestigations]);

  const filtered = useMemo(() => {
    let result = [...enrichedInvestigations];
    if (statusFilter !== "ALL") result = result.filter((inv) => inv.status === statusFilter);
    if (riskFilter !== "ALL") result = result.filter((inv) => getRiskTier(inv.riskScore) === riskFilter);
    if (anomalyFilter !== "ALL") result = result.filter((inv) => (inv.work?.anomalyTypes || []).includes(anomalyFilter as any));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((inv) =>
        inv.workId?.toLowerCase().includes(q) ||
        inv.work?.description?.toLowerCase().includes(q) ||
        inv.work?.constituency?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = sortField === "riskScore" ? a.riskScore : (a.work?.sanctionedAmount || 0);
      const bVal = sortField === "riskScore" ? b.riskScore : (b.work?.sanctionedAmount || 0);
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
        {/* Page Header Enclosed in Navy Blue Flexbox Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-lg">
          <div className="space-y-1.5">
            <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              SCRUTINY QUEUE · PRIORITY TRIAGE
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Investigations</h1>
            <p className="font-sans text-sm sm:text-base text-slate-300 max-w-3xl">
              Projects flagged by multi-signal detection models requiring verified investigator due diligence.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
            <span>TOTAL CASES: <strong className="text-white">{filtered.length}</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-orange-300">ACTIVE SCRUTINY</span>
          </div>
        </div>

        {/* Filters Row in Inter */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Work ID, description, constituency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 font-sans text-sm sm:text-base bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            {RISK_TIERS.map((t) => <option key={t} value={t}>{t === "ALL" ? "All Risk Tiers" : `${t} Risk`}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Case Statuses" : s}</option>)}
          </select>
          <select
            value={anomalyFilter}
            onChange={(e) => setAnomalyFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Anomaly Signals</option>
            <option value="cost">Cost Variance (MAD/Z-Score)</option>
            <option value="semantic">Semantic Overlap (NLP)</option>
            <option value="geographic">Constituency &amp; Vendor Clustering</option>
            <option value="pattern">Temporal &amp; Category Pattern</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm font-data text-slate-600">
          <span><strong className="text-slate-900 font-semibold">{filtered.length}</strong> priority cases under scrutiny</span>
          <span>Sorted by {sortField === "riskScore" ? "Composite Risk" : "Sanction Cost"} ({sortDir.toUpperCase()})</span>
        </div>

        {/* Investigations List — Structured Flexbox Cards with Generous Padding */}
        <div className="space-y-3.5 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-blue-700 font-sans font-semibold">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading cases...
              </div>
            </div>
          )}

          {filtered.length === 0 && !loading ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-sans">No priority cases matching your filter criteria.</p>
            </div>
          ) : (
            filtered.map((inv) => (
              <div
                key={inv.investigationId}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all"
              >
                {/* Left Side: Risk Badge, Work ID, Title, Primary Signal, Constituency */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge score={inv.riskScore} tier={getRiskTier(inv.riskScore)} showScore={true} />
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80">
                      #{inv.workId}
                    </span>
                    <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {inv.work.category}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${
                      inv.status === "Flagged" ? "bg-red-50 text-red-700 border-red-200" :
                      inv.status === "Escalated" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      inv.status === "Under Review" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      inv.status === "Triaged" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      inv.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>{inv.status}</span>
                  </div>

                  <Link
                    href={`/investigations/${inv.workId}`}
                    className="block font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug"
                  >
                    {inv.work.description}
                  </Link>

                  {/* Signal & Location */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-sans">
                    <div className="flex items-center gap-1.5 text-orange-800 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                      <span>Signal: {inv.primarySignal}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth="2">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-semibold text-slate-800">{inv.work.constituency}</span>
                      <span className="text-slate-500">({inv.work.district}, {inv.work.state})</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Cost and Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-emphasis font-bold uppercase tracking-wider text-slate-400">
                      Sanctioned Cost
                    </div>
                    <div className="font-emphasis text-xl sm:text-2xl font-extrabold text-slate-950">
                      {formatCurrency(inv.work.sanctionedAmount)}
                    </div>
                  </div>
                  <Link
                    href={`/investigations/${inv.workId}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-sans text-xs sm:text-sm font-semibold border border-blue-200 transition-colors shadow-2xs"
                  >
                    <span>Inspect Case</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
