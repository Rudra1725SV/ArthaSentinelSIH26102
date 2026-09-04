"use client";

import React, { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BackendStatusBar } from "@/components/BackendStatusBar";
import { RiskBadge } from "@/components/RiskBadge";
import { MOCK_WORKS } from "@/lib/mock-data";

export default function ContractorPage({
  params,
}: {
  params: Promise<{ agency: string }>;
}) {
  const resolvedParams = use(params);
  const agencyName = decodeURIComponent(resolvedParams.agency);

  // Filter works associated with this agency or contractor
  const associatedWorks = MOCK_WORKS.filter(
    (w) =>
      w.contractor.toLowerCase().includes(agencyName.toLowerCase()) ||
      w.implementingAgency.toLowerCase().includes(agencyName.toLowerCase())
  );

  const displayWorks = associatedWorks.length > 0 ? associatedWorks : [MOCK_WORKS[0]];

  const totalSanctioned = displayWorks.reduce((sum, w) => sum + w.sanctionedAmount, 0);
  const averageRisk =
    displayWorks.reduce((sum, w) => sum + w.compositeRiskScore, 0) / displayWorks.length;

  const formatCurrency = (val: number) => {
    return "₹" + (val / 100000).toFixed(2) + " Lakh";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/#investigations"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            <span>←</span>
            <span>Back to Scrutiny Queue</span>
          </Link>
          <span className="font-mono text-xs text-slate-500 bg-white border border-slate-300 px-2.5 py-0.5 rounded">
            AGENCY INTELLIGENCE PROFILE
          </span>
        </div>

        {/* Agency Profile Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-slate-500 uppercase">
                CONTRACTOR ENTITY CROSS-REFERENCE
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1">
                {agencyName}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Cross-constituency tendering history, cluster analysis, and associated public sanctions.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-center">
              <span className="font-mono text-[11px] text-blue-700 block uppercase">Composite Profile Risk</span>
              <RiskBadge score={averageRisk} />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Total Sanctions Indexed:</span>
              <span className="font-heading text-lg font-bold text-slate-900">
                {displayWorks.length} Active Works
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Cumulative Sanction Value:</span>
              <span className="font-heading text-lg font-bold text-slate-900">
                {formatCurrency(totalSanctioned)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Constituency Spread:</span>
              <span className="font-heading text-lg font-bold text-slate-900">
                {new Set(displayWorks.map((w) => w.constituency)).size} Parliamentary Area(s)
              </span>
            </div>
          </div>
        </div>

        {/* Associated Works Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-[#F8F7F2]">
            <h2 className="font-heading text-base font-bold text-slate-950">
              Sanctioned Works Awarded to this Agency
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review individual works for cost anomalies or spatial clustering.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Work ID</th>
                  <th className="py-3.5 px-4">Title & Category</th>
                  <th className="py-3.5 px-4">Constituency</th>
                  <th className="py-3.5 px-4 text-right">Sanction Amount</th>
                  <th className="py-3.5 px-4">Risk Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {displayWorks.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-blue-800">
                      {w.id}
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-medium text-slate-900 line-clamp-1">{w.title}</div>
                      <div className="text-[11px] text-slate-500">{w.category}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      {w.constituency} ({w.district})
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(w.sanctionedAmount)}
                    </td>
                    <td className="py-4 px-4">
                      <RiskBadge score={w.compositeRiskScore} tier={w.riskTier} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/works/${w.id}`}
                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
                      >
                        Inspect Evidence →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stretch feature notice */}
        <div className="rounded-xl border border-slate-200 bg-[#FAF9F5] p-6 text-xs text-slate-600 space-y-2">
          <span className="font-semibold text-slate-800 block">
            Agency Cluster & Network Graph (Forensic Intelligence)
          </span>
          <p>
            This module cross-references corporate registry records (MCA-21) to identify shared directorships, common contact addresses, and bidding rings across ostensibly competing implementing agencies. Full corporate entity graph streaming will synchronize once PostgreSQL backend graph nodes are online.
          </p>
        </div>

      </main>

      <BackendStatusBar />
    </div>
  );
}
