"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NetworkGlobe } from "@/components/NetworkGlobe";
import { BackendStatusBar } from "@/components/BackendStatusBar";
import { RiskBadge } from "@/components/RiskBadge";
import { AnomalyTypeBadge } from "@/components/AnomalyTypeBadge";
import { MOCK_WORKS, SYSTEM_STATS, Work } from "@/lib/mock-data";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filteredWorks = useMemo(() => {
    return MOCK_WORKS.filter((work) => {
      const matchesSearch =
        searchTerm === "" ||
        work.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.implementingAgency.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTier =
        selectedTier === "ALL" || work.riskTier.toUpperCase() === selectedTier.toUpperCase();

      const matchesType =
        selectedType === "ALL" ||
        work.anomalyFlags.some((flag) => flag.type.toUpperCase() === selectedType.toUpperCase());

      return matchesSearch && matchesTier && matchesType;
    });
  }, [searchTerm, selectedTier, selectedType]);

  const formatCurrency = (val: number) => {
    return "₹" + (val / 100000).toFixed(2) + " Lakh";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm">
      <Navbar />

      {/* ========================================================
          HERO SECTION (Matching Reference Image Exactly)
          ======================================================== */}
      <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-6">
              {/* Category Pill Tag */}
              <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-slate-700 uppercase">
                <span className="w-2.5 h-2.5 bg-orange-600 inline-block"></span>
                <span>MPLADS · AI ANOMALY DETECTION</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-slate-950 leading-[1.12]">
                From project visibility <br />
                to <span className="text-[#1D4ED8]">intelligent scrutiny.</span>
              </h1>

              {/* Subheading text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                AI-powered anomaly detection and evidence-based review for MPLADS implementation — every sanctioned work, measured against the record.
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#investigations"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-medium px-5 py-3 transition-all shadow-xs active:scale-[0.98]"
                >
                  Enter Intelligence Dashboard
                  <span className="text-base leading-none">→</span>
                </a>

                <a
                  href="#detection"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-medium px-4 py-3 transition-colors shadow-2xs"
                >
                  {/* Target reticle icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 text-slate-500"
                    strokeWidth="1.75"
                  >
                    <circle cx="12" cy="12" r="7" />
                    <line x1="12" y1="2" x2="12" y2="5" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" />
                    <line x1="19" y1="12" x2="22" y2="12" />
                  </svg>
                  Explore Detection Engine
                </a>
              </div>

              {/* Three-Column Metrics Strip */}
              <div className="pt-8 border-t border-slate-300/70">
                <div className="grid grid-cols-3 divide-x divide-slate-300/70">
                  <div className="pr-4">
                    <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                      12,48,320
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">
                      WORKS INDEXED
                    </div>
                  </div>

                  <div className="px-4">
                    <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-orange-600">
                      14
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">
                      FLAGGED THIS CYCLE
                    </div>
                  </div>

                  <div className="pl-4">
                    <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                      36
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">
                      DISTRICTS COVERED
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: 3D Network Globe with Blueprint Frame */}
            <div className="lg:col-span-6 xl:col-span-7 flex justify-center items-center">
              <NetworkGlobe className="max-w-2xl" />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SCRUTINY QUEUE & RISK TRIAGE (The Main Dashboard Section)
          ======================================================== */}
      <section id="investigations" className="py-12 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-blue-700 font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                PRIORITY TRIAGE WORKFLOW
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1">
                Scrutiny Queue & Evidence Triage
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Works flagged for review by statistical models against comparable peer baselines. Review evidence, examine cross-scheme duplicates, and record audit observations.
              </p>
            </div>

            {/* Investigative Principles Pill */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-3 max-w-md text-xs text-amber-950">
              <span className="font-semibold block mb-0.5">Investigative Decision Support Principle:</span>
              Flags denote statistical deviation or co-occurrence requiring verification, not proof of irregularity.
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="mt-6 flex flex-col md:flex-row items-center gap-4 bg-[#FAF9F5] border border-slate-200 p-3.5 rounded-xl">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by Work ID, title, constituency, or contractor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Risk Tier Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Risk Tier:</span>
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 text-xs">
                {["ALL", "CRITICAL", "ELEVATED", "MODERATE"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      selectedTier === tier
                        ? "bg-[#1E3A8A] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Anomaly Type Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Flag Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Anomaly Types</option>
                <option value="COST">Cost Variance</option>
                <option value="DUPLICATE">Potential Duplicate</option>
                <option value="GEOGRAPHIC">Spatial Clustering</option>
                <option value="PATTERN">Pattern Outlier</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchTerm || selectedTier !== "ALL" || selectedType !== "ALL") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTier("ALL");
                  setSelectedType("ALL");
                }}
                className="text-xs text-blue-700 hover:underline font-medium whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          {/* Queue Results Count */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
            <span>Showing {filteredWorks.length} of {MOCK_WORKS.length} prioritized records</span>
            <span>Sorted by composite anomaly score (descending)</span>
          </div>

          {/* Main Table */}
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">Work ID & Category</th>
                    <th scope="col" className="px-3 py-3.5">Location</th>
                    <th scope="col" className="px-3 py-3.5">Agency & Contractor</th>
                    <th scope="col" className="px-3 py-3.5 text-right">Sanction vs Peer Median</th>
                    <th scope="col" className="px-3 py-3.5">Detected Anomaly Signals</th>
                    <th scope="col" className="px-3 py-3.5">Risk Score</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredWorks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                        No flagged works matching selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWorks.map((work) => (
                      <tr key={work.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* ID & Title */}
                        <td className="py-4 pl-4 pr-3 sm:pl-6">
                          <div className="font-mono text-xs font-semibold text-blue-800">
                            {work.id}
                          </div>
                          <div className="font-medium text-slate-900 line-clamp-1 max-w-xs mt-0.5" title={work.title}>
                            {work.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {work.category}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-3 py-4 text-xs">
                          <div className="font-medium text-slate-800">{work.constituency}</div>
                          <div className="text-slate-500">{work.district}, {work.state}</div>
                        </td>

                        {/* Implementing Agency */}
                        <td className="px-3 py-4 text-xs">
                          <div className="font-medium text-slate-800">{work.contractor}</div>
                          <Link
                            href={`/contractors/${encodeURIComponent(work.contractor)}`}
                            className="text-blue-700 hover:underline text-[11px] line-clamp-1"
                          >
                            {work.implementingAgency}
                          </Link>
                        </td>

                        {/* Financial Comparison */}
                        <td className="px-3 py-4 text-xs text-right whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(work.sanctionedAmount)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Peer Med: {formatCurrency(work.peerMedianAmount)}
                          </div>
                        </td>

                        {/* Anomaly Signals */}
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {work.anomalyFlags.map((flag, idx) => (
                              <AnomalyTypeBadge key={idx} type={flag.type} />
                            ))}
                            {work.anomalyFlags.length === 0 && (
                              <span className="text-xs text-slate-400 italic">No flags active</span>
                            )}
                          </div>
                        </td>

                        {/* Composite Risk Score */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <RiskBadge score={work.compositeRiskScore} tier={work.riskTier} />
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Status: {work.status}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap">
                          <Link
                            href={`/works/${work.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-300 hover:border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs transition-all"
                          >
                            Inspect Evidence
                            <span>→</span>
                          </Link>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          DETECTION ENGINE METHODOLOGY OVERVIEW
          ======================================================== */}
      <section id="detection" className="py-16 border-t border-slate-200/80 bg-[#FAF9F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs text-orange-700 font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 bg-orange-600 inline-block"></span>
              MULTI-DIMENSIONAL SCRUTINY ENGINE
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">
              Four Algorithmic Detection Pillars
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              ArthaSentinel synthesizes rule-based heuristics with machine learning to identify projects that deviate from empirical baseline norms. Every score is explainable with underlying records.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-mono text-sm font-bold">
                01
              </div>
              <h3 className="font-heading text-base font-semibold text-slate-900">
                Cost Variance Analysis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates unit cost metrics against statistically comparable peers within the same district and work category using robust Z-scores and Interquartile Range (IQR) bands.
              </p>
              <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                Benchmark: State PWD SoR & District Medians
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono text-sm font-bold">
                02
              </div>
              <h3 className="font-heading text-base font-semibold text-slate-900">
                Semantic Duplicate Detection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Employs neural sentence embeddings and token n-gram cosine matching across Detailed Project Reports (DPRs) to identify identical asset specifications reused across schemes.
              </p>
              <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                Match Threshold: &gt;80% Textual Similarity
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-mono text-sm font-bold">
                03
              </div>
              <h3 className="font-heading text-base font-semibold text-slate-900">
                Spatial Clustering & Co-location
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates spatial autocorrelation and Euclidean distance between geo-tagged works to detect duplicate infrastructure on the same parcel and tight contractor monopolies.
              </p>
              <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                GIS Cross-Reference: JJM & PMGSY Assets
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-700 font-mono text-sm font-bold">
                04
              </div>
              <h3 className="font-heading text-base font-semibold text-slate-900">
                Tender Splitting & Fiscal Clustering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identifies sub-project splitting just beneath technical committee thresholds (e.g., ₹40 Lakh) and unusual sanction clusters concentrated in the final week of the fiscal year.
              </p>
              <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                Model: Threshold Proximity & Timing Anomaly
              </div>
            </div>
          </div>

          {/* Full methodology link */}
          <div className="mt-8 text-center">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
            >
              Read Full Model Calibration & Validation Benchmark Report →
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-heading font-semibold text-slate-900">ArthaSentinel</span> — MPLADS Scrutiny Engine V2.4 · SIH26102
            <p className="mt-1 text-slate-400">
              Built for Ministry of Statistics and Programme Implementation (MoSPI) reviewer-facing risk triage.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/methodology" className="hover:text-slate-800">Methodology</Link>
            <Link href="/contractors/Apex%20Rural%20Infra" className="hover:text-slate-800">Agency Network</Link>
            <span className="font-mono text-[11px]">CLASSIFICATION: OFFICIAL USE ONLY</span>
          </div>
        </div>
      </footer>

      <BackendStatusBar />
    </div>
  );
}
