"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { VALIDATION_METRICS, SYSTEM_STATS } from "@/lib/mock-data";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1500px] px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Header Enclosed in Navy Blue Flexbox Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-9 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-xl">
          <div className="space-y-2 max-w-4xl">
            <div className="flex items-center gap-2 font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              SIH26102 · ARCHITECTURE &amp; ETHICAL FRAMEWORK
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              About ArthaSentinel &amp; Scrutiny Methodology
            </h1>
            <p className="font-sans text-base sm:text-lg text-slate-300 leading-relaxed">
              ArthaSentinel is an investigative decision-support engine engineered to assist public auditors, vigilance officers, and district nodal teams in prioritizing scrutiny across large volumes of MPLADS developmental records.
            </p>
          </div>
        </div>

        {/* Editorial Accent Narrative Quote (GT Super / Newsreader) */}
        <div className="rounded-2xl border-l-4 border-blue-700 bg-white p-7 sm:p-9 shadow-2xs space-y-3">
          <blockquote className="font-editorial text-lg sm:text-2xl text-slate-800 italic leading-relaxed">
            “An anomaly is not proof of corruption, but an imperative for diligent inquiry. In public governance, data without context is reckless; data with empathy is justice.”
          </blockquote>
          <p className="font-emphasis text-xs font-bold tracking-wider text-slate-500 uppercase pt-2">
            ARTHASENTINEL ETHICAL CHARTER · PUBLIC VALUE INTEGRITY
          </p>
        </div>

        {/* Ethical Cardinal Rule Alert */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-7 sm:p-8 space-y-3 font-sans shadow-2xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-heading font-bold text-base sm:text-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-amber-700" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Core Principle: Detection Is Not Determination
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            An anomaly is <strong>not proof of wrongdoing</strong>. Genuine factors such as difficult terrain, urgent disaster relief, seasonal price variations, or localized soil conditions frequently result in valid cost or timeline variances. ArthaSentinel produces structured investigative leads and explainable evidence packages—empowering human reviewers to exercise verified due diligence.
          </p>
        </div>

        {/* Methodology Sections — Bento Cards Grid */}
        <div className="space-y-6">
          {/* 1. Statistical Peer Baselines */}
          <section className="p-7 sm:p-9 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-emphasis text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">MODULE 01</span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Statistical Peer Baseline Computation</h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
              MPLADS works cannot be evaluated with blanket national caps because local market rates, state PWD Schedules of Rates (SoR), and material transport logistics vary widely. ArthaSentinel dynamically constructs localized peer cohorts to establish defensible benchmarks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs sm:text-sm font-sans text-slate-700">
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-1.5">
                <strong className="block text-slate-900 font-heading text-base">Multivariate Cohort Stratification</strong>
                <p className="text-slate-600 leading-relaxed">
                  Projects are stratified by work category, financial year, administrative district, implementing agency classification, and project scale tier.
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-1.5">
                <strong className="block text-slate-900 font-heading text-base">Robust Non-Parametric Estimators</strong>
                <p className="text-slate-600 leading-relaxed">
                  Instead of standard deviations (which are heavily distorted by extreme outliers), the engine calculates Median and Median Absolute Deviation (MAD) with Interquartile Range (IQR) bounding.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Semantic NLP */}
          <section className="p-7 sm:p-9 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-emphasis text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">MODULE 02</span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Semantic DPR &amp; Description Matching</h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
              Tender splitting and duplicate proposals often disguise identical scopes of work under minor wording alterations or varied punctuation. ArthaSentinel extracts and normalizes Detailed Project Report (DPR) descriptions using dense vector sentence embeddings.
            </p>
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-1.5 text-xs sm:text-sm font-sans text-slate-600">
              <p className="leading-relaxed">
                Pairs with cosine similarity exceeding <strong>0.80</strong> across the same Gram Panchayat, contiguous blocks, or consecutive fiscal quarters are automatically flagged as <em>potentially related works</em> requiring scope verification before fund disbursement.
              </p>
            </div>
          </section>

          {/* 3. Administrative Concentration & Cross-Scheme Verification */}
          <section className="p-7 sm:p-9 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-emphasis text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">MODULE 03</span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Administrative Concentration &amp; Cross-Scheme Asset Verification</h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
              Without requiring GPS coordinates, ArthaSentinel scrutinizes administrative entity hierarchies down to the Gram Panchayat and Block level to detect abnormal resource clustering and cross-scheme duplication.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs sm:text-sm font-sans text-slate-700">
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-1.5">
                <strong className="block text-slate-900 font-heading text-base">Entity &amp; Vendor Concentration (HHI)</strong>
                <p className="text-slate-600 leading-relaxed">
                  Computes Herfindahl-Hirschman Index (HHI) scores across implementing agencies and local bodies to surface disproportionate allocations to single entities.
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-1.5">
                <strong className="block text-slate-900 font-heading text-base">Cross-Scheme Registry Overlap</strong>
                <p className="text-slate-600 leading-relaxed">
                  Cross-references sanctioned works against public registry records (Jal Jeevan Mission, PMGSY, state municipal grants) within the same village or ward to flag potential double-funding.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Risk Scoring & Calibration */}
          <section className="p-7 sm:p-9 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-emphasis text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">MODULE 04</span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Composite Risk Scoring &amp; Calibration</h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
              Scores are calibrated on an 0–100 scale using an ensemble of cost deviation Z-scores, semantic textual overlap, administrative concentration, and sanction velocity:
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 py-2">
              <table className="w-full text-left font-data text-sm sm:text-base">
                <thead className="bg-[#F8F7F2] border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider font-emphasis text-xs sm:text-[13px]">
                  <tr>
                    <th className="py-3 px-4">Model Pipeline</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">Recall</th>
                    <th className="py-3 px-4">F1 Score</th>
                    <th className="py-3 px-4">Calibration Set</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-data">
                  {VALIDATION_METRICS.map((vm, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">{vm.model}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">{(vm.precision * 100).toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">{(vm.recall * 100).toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-blue-800 font-bold">{vm.f1Score.toFixed(3)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{vm.benchmarkCases} benchmark cases</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 font-sans">
          <Link href="/detection" className="text-sm sm:text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline">
            View Live Detection Engine →
          </Link>
          <Link href="/investigations" className="px-6 py-3 rounded-xl bg-[#1E3A8A] text-white text-sm sm:text-base font-semibold hover:bg-[#1D4ED8] transition-colors shadow-xs">
            Open Priority Scrutiny Queue
          </Link>
        </div>
      </main>
    </div>
  );
}
