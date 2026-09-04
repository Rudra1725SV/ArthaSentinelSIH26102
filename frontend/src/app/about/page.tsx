"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { VALIDATION_METRICS, SYSTEM_STATS } from "@/lib/mock-data";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            SIH26102 · ARCHITECTURE & ETHICAL FRAMEWORK
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            About ArthaSentinel & Methodology
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            ArthaSentinel is an investigative decision-support engine engineered to assist public auditors, vigilance officers, and district nodal teams in prioritizing scrutiny across large volumes of MPLADS developmental records.
          </p>
        </div>

        {/* Ethical Cardinal Rule Alert */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-heading font-semibold text-base">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-amber-700" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Core Principle: Detection Is Not Determination
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            An anomaly is <strong>not proof of wrongdoing</strong>. Genuine factors such as difficult terrain, urgent disaster relief, seasonal price variations, or localized soil conditions frequently result in valid cost or timeline variances. ArthaSentinel produces structured investigative leads and explainable evidence packages—empowering human reviewers to exercise verified due diligence.
          </p>
        </div>

        {/* Methodology Sections */}
        <div className="space-y-10 divide-y divide-slate-200">
          {/* 1. Statistical Peer Baselines */}
          <section className="pt-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">MODULE 01</span>
              <h2 className="font-heading text-xl font-bold text-slate-900">Statistical Peer Baseline Computation</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              MPLADS works cannot be evaluated with blanket national caps because local market rates, state PWD Schedules of Rates (SoR), and geographical accessibility vary widely. ArthaSentinel constructs localized peer cohorts dynamically:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <li className="p-4 rounded-lg bg-white border border-slate-200">
                <strong className="block text-slate-900 text-sm mb-1">Cohort Stratification</strong>
                Projects are stratified by work category, financial year, administrative district, and topographical zone.
              </li>
              <li className="p-4 rounded-lg bg-white border border-slate-200">
                <strong className="block text-slate-900 text-sm mb-1">Robust Non-Parametric Estimators</strong>
                Instead of mean and standard deviation (which are skewed by severe outliers), the engine calculates Median and Median Absolute Deviation (MAD) with Interquartile Range (IQR) bounding.
              </li>
            </ul>
          </section>

          {/* 2. Semantic NLP */}
          <section className="pt-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">MODULE 02</span>
              <h2 className="font-heading text-xl font-bold text-slate-900">Semantic DPR & Description Matching</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tender splitting and duplicate proposals often disguise identical scopes of work under minor wording alterations. ArthaSentinel extracts and normalizes Detailed Project Report (DPR) descriptions using dense vector sentence embeddings.
            </p>
            <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2 text-xs text-slate-600">
              <p>
                Pairs with cosine similarity exceeding <strong>0.80</strong> across adjacent Gram Panchayats or consecutive fiscal quarters are automatically flagged as <em>potentially related works</em>.
              </p>
            </div>
          </section>

          {/* 3. Geospatial Signals */}
          <section className="pt-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">MODULE 03</span>
              <h2 className="font-heading text-xl font-bold text-slate-900">Spatial Proximity & Cross-Scheme Analysis</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every MPLADS record is matched against national geographic registry boundaries and cross-referenced with public infrastructure repositories (including Jal Jeevan Mission and PMGSY).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <strong className="block text-slate-900 text-sm mb-1">DBSCAN Spatial Clustering</strong>
                Identifies abnormally dense asset allocations within localized clusters that warrant geographic verification.
              </div>
              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <strong className="block text-slate-900 text-sm mb-1">Co-location Detection</strong>
                Flags assets situated within 50 meters of existing registered public infrastructure to highlight potential duplicative claims.
              </div>
            </div>
          </section>

          {/* 4. Risk Scoring & Calibration */}
          <section className="pt-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">MODULE 04</span>
              <h2 className="font-heading text-xl font-bold text-slate-900">Composite Risk Scoring & Calibration</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Scores are calibrated from 0 to 100 as an ensemble of cost deviation, textual overlap, geographic isolation, and tender timing:
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7F2] border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Model Pipeline</th>
                    <th className="py-2.5 px-4">Precision</th>
                    <th className="py-2.5 px-4">Recall</th>
                    <th className="py-2.5 px-4">F1 Score</th>
                    <th className="py-2.5 px-4">Calibration Set</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {VALIDATION_METRICS.map((vm, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{vm.model}</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">{(vm.precision * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">{(vm.recall * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-4 text-blue-800 font-semibold">{vm.f1Score.toFixed(3)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{vm.benchmarkCases} cases</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link href="/detection" className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline">
            View Live Detection Engine →
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
            Launch Intelligence Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
