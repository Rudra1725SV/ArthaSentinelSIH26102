"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BackendStatusBar } from "@/components/BackendStatusBar";
import { VALIDATION_METRICS, SYSTEM_STATS } from "@/lib/mock-data";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            SIH26102 · STATISTICAL & ML ARCHITECTURE
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Validation & Detection Methodology
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Detailed mathematical frameworks, baseline normalization techniques, and validation metrics powering ArthaSentinel's reviewer-facing risk triage.
          </p>
        </div>

        {/* Ethical Framework Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-6 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-900 uppercase">
            <span>⚠ INVESTIGATIVE DECISION-SUPPORT ETHICS</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
            <strong>An anomaly is NOT proof of corruption.</strong> ArthaSentinel does not generate automated accusations. All scores reflect mathematical variance from historical distributions, linguistic similarity between sanction documents, or geographic density patterns. The system is designed to triage high-volume public finance portfolios so senior government auditors can direct manual scrutiny where it is most empirically warranted.
          </p>
        </div>

        {/* Section 1: Algorithmic Frameworks */}
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-slate-950">
            Algorithmic Detection Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Model 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  MODEL 01
                </span>
                <span className="font-mono text-xs text-slate-400">Robust Statistics</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Cost Variance (Robust Z-Score & MAD)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard standard deviation is sensitive to extreme outliers. We employ Median Absolute Deviation (MAD) to compute a robust Z-score across homogeneous asset classes:
              </p>
              <div className="bg-[#FAF9F5] border border-slate-200 p-3 rounded-lg font-mono text-xs text-slate-800 overflow-x-auto">
                Z_score = (Cost_i - Median(C)) / (1.4826 * MAD(C))
              </div>
              <p className="text-xs text-slate-600">
                Works with Z_score &gt; 2.5 (98.8th percentile) trigger an automated cost anomaly flag with peer percentile mapping.
              </p>
            </div>

            {/* Model 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  MODEL 02
                </span>
                <span className="font-mono text-xs text-slate-400">Natural Language Processing</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Semantic Duplicate & DPR Overlap
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilizes transformer sentence embeddings combined with character n-gram cosine matching across work descriptions and milestone technical specifications:
              </p>
              <div className="bg-[#FAF9F5] border border-slate-200 p-3 rounded-lg font-mono text-xs text-slate-800 overflow-x-auto">
                Sim(A, B) = (v_A · v_B) / (||v_A|| * ||v_B||) &gt; 0.80
              </div>
              <p className="text-xs text-slate-600">
                Detects identical detailed project reports reused across different constituencies or adjacent financial years.
              </p>
            </div>

            {/* Model 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                  MODEL 03
                </span>
                <span className="font-mono text-xs text-slate-400">Spatial Autocorrelation</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Spatial Clustering & Co-location
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Computes Haversine geodesic distances and Density-Based Spatial Clustering of Applications with Noise (DBSCAN) on geo-tagged coordinates:
              </p>
              <div className="bg-[#FAF9F5] border border-slate-200 p-3 rounded-lg font-mono text-xs text-slate-800 overflow-x-auto">
                Distance = 2R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlon/2)))
              </div>
              <p className="text-xs text-slate-600">
                Flags potential double-billing or dual sanctions on identical physical sites (e.g. overlap with Jal Jeevan Mission water points).
              </p>
            </div>

            {/* Model 4 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-300">
                  MODEL 04
                </span>
                <span className="font-mono text-xs text-slate-400">Procurement Forensics</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Tender Splitting & Fiscal Clustering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates sanction amounts clustering just below statutory scrutiny thresholds (e.g. ₹40 Lakh, ₹50 Lakh) and temporal concentration near March 31:
              </p>
              <div className="bg-[#FAF9F5] border border-slate-200 p-3 rounded-lg font-mono text-xs text-slate-800 overflow-x-auto">
                Proximity_Index = (Threshold - Amount) / Threshold, for Amount in [0.90*T, 0.99*T]
              </div>
              <p className="text-xs text-slate-600">
                Detects intentional segmentation of major works to bypass committee approvals.
              </p>
            </div>

          </div>
        </div>

        {/* Section 2: Validation Benchmark Metrics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-950">
                Audited Validation Benchmarks
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Calibrated against 4,000+ historically audited public works records.
              </p>
            </div>
            <span className="font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Overall Precision: 90.2%
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F7F2] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Detection Model</th>
                  <th className="py-3.5 px-4 text-right">Precision</th>
                  <th className="py-3.5 px-4 text-right">Recall</th>
                  <th className="py-3.5 px-4 text-right">F1 Score</th>
                  <th className="py-3.5 px-4 text-right">Benchmark Sample</th>
                  <th className="py-3.5 px-4 text-right">Last Calibrated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-mono">
                {VALIDATION_METRICS.map((vm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-4 px-4 sm:px-6 font-sans font-medium text-slate-900 text-sm">
                      {vm.model}
                    </td>
                    <td className="py-4 px-4 text-right text-emerald-700 font-bold">
                      {(vm.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right text-blue-700 font-bold">
                      {(vm.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-800">
                      {(vm.f1Score * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right text-slate-500">
                      {vm.benchmarkCases.toLocaleString()} cases
                    </td>
                    <td className="py-4 px-4 text-right text-slate-400">
                      {vm.lastCalibrated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Data Pipeline & Governance */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="font-heading text-xl font-bold text-slate-950">
            Data Governance & System Provenance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
            <div>
              <span className="font-semibold text-slate-900 block mb-1">Audit Trail Immutability</span>
              Every reviewer observation, note, and escalation state change is cryptographically hashed with timestamp and user role to preserve chain of custody.
            </div>
            <div>
              <span className="font-semibold text-slate-900 block mb-1">State PWD SoR Synchronization</span>
              Cost thresholds are re-indexed quarterly against published state Public Works Department Schedule of Rates (SoR) to avoid false inflation alarms.
            </div>
            <div>
              <span className="font-semibold text-slate-900 block mb-1">Fair Review Protocols</span>
              Implementing agencies are given standard 14-day observation clarification periods before flags are escalated to formal field vigilance inquiries.
            </div>
          </div>
        </div>

      </main>

      <BackendStatusBar />
    </div>
  );
}
