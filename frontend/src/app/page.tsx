"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NetworkGlobe } from "@/components/NetworkGlobe";
import { BackendStatusBar } from "@/components/BackendStatusBar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm">
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section id="overview" className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">

            {/* Left Hero Content */}
            <div className="lg:col-span-5 space-y-7">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-slate-700 uppercase">
                <span className="w-2.5 h-2.5 bg-orange-600 inline-block"></span>
                MPLADS · AI ANOMALY DETECTION
              </div>

              <h1 className="font-heading text-[44px] sm:text-[52px] lg:text-[56px] font-bold tracking-tight text-slate-950 leading-[1.1]">
                From project visibility<br />
                to <span className="text-[#1D4ED8]">intelligent scrutiny.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                AI-powered anomaly detection and evidence-based review for MPLADS implementation — every sanctioned work, measured against the record.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-medium px-6 py-3.5 transition-all shadow-xs active:scale-[0.98]"
                >
                  Enter Intelligence Dashboard
                  <span className="text-base leading-none">→</span>
                </Link>
                <Link
                  href="/detection"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-medium px-5 py-3.5 transition-colors shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-slate-500" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="7" />
                    <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
                  </svg>
                  Explore Detection Engine
                </Link>
              </div>

              {/* Metrics Strip */}
              <div className="pt-8 border-t border-slate-300/70">
                <div className="grid grid-cols-3 divide-x divide-slate-300/70">
                  <div className="pr-4">
                    <div className="font-heading text-3xl sm:text-[34px] font-bold tracking-tight text-slate-950">12,48,320</div>
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">WORKS INDEXED</div>
                  </div>
                  <div className="px-4">
                    <div className="font-heading text-3xl sm:text-[34px] font-bold tracking-tight text-orange-600">14</div>
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">FLAGGED THIS CYCLE</div>
                  </div>
                  <div className="pl-4">
                    <div className="font-heading text-3xl sm:text-[34px] font-bold tracking-tight text-slate-950">36</div>
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">DISTRICTS COVERED</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Network Globe */}
            <div className="lg:col-span-7 flex justify-center items-center">
              <NetworkGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DETECTION PILLARS ═══════════ */}
      <section id="detection" className="py-16 border-t border-slate-200/80">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs text-orange-700 font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 bg-orange-600 inline-block"></span>
              MULTI-DIMENSIONAL SCRUTINY ENGINE
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">
              Four Algorithmic Detection Pillars
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              ArthaSentinel synthesizes rule-based heuristics with machine learning to identify projects that deviate from empirical baseline norms.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Cost Variance Analysis", desc: "Evaluates unit cost metrics against statistically comparable peers using robust Z-scores and IQR bands.", note: "Benchmark: State PWD SoR & District Medians", color: "amber" },
              { num: "02", title: "Semantic Duplicate Detection", desc: "Neural sentence embeddings and cosine matching across DPRs to identify identical asset specifications.", note: "Threshold: >80% Textual Similarity", color: "indigo" },
              { num: "03", title: "Spatial Clustering", desc: "Haversine distance and DBSCAN to detect duplicate infrastructure and contractor monopolies.", note: "GIS Cross-Reference: JJM & PMGSY Assets", color: "sky" },
              { num: "04", title: "Tender Splitting & Fiscal Clustering", desc: "Identifies sub-project splitting beneath committee thresholds and fiscal year-end sanction clusters.", note: "Model: Threshold Proximity & Timing", color: "stone" },
            ].map((p) => (
              <div key={p.num} className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
                <div className={`w-10 h-10 rounded-lg bg-${p.color}-50 border border-${p.color}-200 flex items-center justify-center text-${p.color}-700 font-mono text-sm font-bold`}>{p.num}</div>
                <h3 className="font-heading text-base font-semibold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">{p.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/detection" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline">
              Full Detection Engine Documentation →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 text-center space-y-3">
          <p className="text-sm text-slate-500 tracking-wide">
            Transparency · Better Governance · Stronger Communities
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="font-heading font-semibold text-slate-700">ArthaSentinel</span>
            <span>MPLADS Scrutiny Engine V2.4</span>
            <span>SIH26102</span>
          </div>
        </div>
      </footer>

      <BackendStatusBar />
    </div>
  );
}
