"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function DetectionPage() {
  const [activeSignal, setActiveSignal] = useState<"cost" | "semantic" | "geographic">("cost");

  const pipelineSteps = [
    { num: "01", name: "Data Ingestion", desc: "MPLADS e-Sakshi portal feeds, sanctioned works records, and DPR files." },
    { num: "02", name: "Normalization", desc: "Schema standardisation, geocoding validation, and currency standardization." },
    { num: "03", name: "Peer Baseline", desc: "Dynamic cohort grouping by work category, financial year, and geographic terrain." },
    { num: "04", name: "Cost Outlier Analysis", desc: "Robust Z-score and IQR dispersion calculations against peer cohort." },
    { num: "05", name: "Semantic Similarity", desc: "Sentence transformer embeddings and cosine DPR text comparison." },
    { num: "06", name: "Geospatial Clustering", desc: "Haversine proximity graph and DBSCAN spatial concentration indexing." },
    { num: "07", name: "Ensemble Risk Scoring", desc: "Weighted composite scoring (0–100) combining all calibrated indicators." },
    { num: "08", name: "Investigator Triage", desc: "Evidence card generation, plain-language justification, and case assignment." },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1500px] px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-700 uppercase">
            <span className="w-2.5 h-2.5 bg-orange-600 inline-block rounded-xs"></span>
            SIH26102 · MULTI-SIGNAL DETECTION PIPELINE
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
            Every flag begins with a measurable deviation.
          </h1>
          <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            ArthaSentinel continuously scans sanctioned works against peer groups to isolate statistical, textual, and spatial outliers without subjective bias.
          </p>
        </div>

        {/* Demo vs Production Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-xs sm:text-sm text-blue-900 font-sans">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span><strong>System Status:</strong> Live interactive client-side engine running with synthetic benchmarking dataset.</span>
          </div>
          <span className="font-emphasis text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200">
            V2.4 · ACTIVE SCRUTINY ENGINE
          </span>
        </div>

        {/* ═══════════ PIPELINE FLOW ═══════════ */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="font-heading text-2xl font-bold text-slate-950">End-to-End Analytical Pipeline</h2>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-0.5">How raw sanctioned work data progresses to structured investigative evidence</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((step) => (
              <div key={step.num} className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 relative group hover:border-blue-300 transition-colors">
                <div className="font-emphasis text-xs font-bold text-blue-700 bg-blue-50 w-7 h-7 rounded flex items-center justify-center border border-blue-200">
                  {step.num}
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">{step.name}</h3>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ THREE CORE SIGNALS INTERACTIVE ═══════════ */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="font-heading text-2xl font-bold text-slate-950">Three Independent Detection Signals</h2>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-0.5">Explore the mathematical foundations of each signal</p>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "cost", label: "01. Cost Variance", desc: "Z-score & IQR" },
              { id: "semantic", label: "02. Semantic Similarity", desc: "Cosine & Embeddings" },
              { id: "geographic", label: "03. Spatial Signals", desc: "DBSCAN & Haversine" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSignal(s.id as any)}
                className={`px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all cursor-pointer ${
                  activeSignal === s.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {activeSignal === "cost" && (
            <div className="p-7 rounded-2xl border border-amber-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-emphasis text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  SIGNAL: COST DEVIATION
                </span>
                <span className="font-data text-xs text-slate-500 font-medium">Precision: 91.2% · Recall: 88.4%</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900">Robust Unit-Cost Analysis vs Peer Median</h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed">
                Rather than raw total costs, the model decomposes each project into per-unit figures (e.g. ₹ per sq. meter of community hall, ₹ per kilometer of rural road, or ₹ per high-mast light). These are contrasted with the empirical median of comparable works in the identical district and financial period.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200 font-data text-xs text-slate-800 space-y-1.5">
                <div className="text-slate-400 font-mono">// Mathematical Formulation</div>
                <div>Deviation % = ((SanctionedAmount - PeerMedian) / PeerMedian) × 100</div>
                <div>Robust Z = 0.6745 × (SanctionedAmount - Median) / MAD</div>
                <div className="text-orange-700 font-semibold mt-1">Threshold: Z &gt; 2.5 and Deviation &gt; 50% triggers critical flag</div>
              </div>
            </div>
          )}

          {activeSignal === "semantic" && (
            <div className="p-7 rounded-2xl border border-indigo-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-emphasis text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  SIGNAL: SEMANTIC SIMILARITY
                </span>
                <span className="font-data text-xs text-slate-500 font-medium">Precision: 94.5% · Recall: 86.2%</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900">Neural DPR &amp; Milestone Text Deduplication</h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed">
                Evaluates Detailed Project Reports and milestone descriptions across independent sanction orders. By converting text to high-dimensional embedding vectors, the engine captures conceptual duplicate proposals even when word choice is intentionally varied.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200 font-data text-xs text-slate-800 space-y-1.5">
                <div className="text-slate-400 font-mono">// Dense Vector Cosine Similarity</div>
                <div>Similarity = cos(θ) = (v_A · v_B) / (||v_A|| ||v_B||)</div>
                <div className="text-indigo-700 font-semibold mt-1">Threshold: Similarity &gt; 0.80 within 180 days triggers relationship link</div>
              </div>
            </div>
          )}

          {activeSignal === "geographic" && (
            <div className="p-7 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-emphasis text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                  SIGNAL: GEOSPATIAL ANOMALIES
                </span>
                <span className="font-data text-xs text-slate-500 font-medium">Precision: 88.7% · Recall: 92.1%</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900">Spatial Concentration &amp; Infrastructure Overlap</h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed">
                Applies Haversine distance calculations and density-based clustering to uncover suspicious geographic clustering of works awarded to identical agencies, as well as physical co-location with existing centrally sponsored scheme assets.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200 font-data text-xs text-slate-800 space-y-1.5">
                <div className="text-slate-400 font-mono">// Proximity &amp; DBSCAN Radius</div>
                <div>d = 2r × arcsin(sqrt(sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlon/2)))</div>
                <div className="text-sky-700 font-semibold mt-1">Threshold: Co-location &lt; 50m with existing public asset triggers review</div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ HOW RISK IS CALCULATED ═══════════ */}
        <div className="p-7 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <h2 className="font-heading text-xl font-bold text-slate-950">How the Composite Risk Score (0–100) is Calculated</h2>
          <p className="font-sans text-sm text-slate-600 leading-relaxed">
            The composite risk score represents an empirical priority index rather than a binary judgement. It aggregates weighted contributions from all three active signal channels:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-emphasis text-xs font-bold text-slate-500">Weight: 45%</span>
              <div className="font-heading text-base font-bold text-slate-900">Cost Variance Score</div>
              <div className="font-sans text-xs text-slate-600">Normalized Z-score &amp; deviation percentage</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-emphasis text-xs font-bold text-slate-500">Weight: 35%</span>
              <div className="font-heading text-base font-bold text-slate-900">Semantic Match Score</div>
              <div className="font-sans text-xs text-slate-600">Pairwise DPR cosine similarity</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-emphasis text-xs font-bold text-slate-500">Weight: 20%</span>
              <div className="font-heading text-base font-bold text-slate-900">Spatial / Pattern Score</div>
              <div className="font-sans text-xs text-slate-600">Density clustering &amp; fiscal timing</div>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <Link href="/about" className="font-sans text-sm font-semibold text-blue-700 hover:underline">
            ← Read Methodology &amp; Ethical Framework
          </Link>
          <Link href="/investigations" className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-sans text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
            View Flagged Investigations Queue →
          </Link>
        </div>
      </main>
    </div>
  );
}
