"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  getDetectionSummary,
  getBenchmarkResults,
  runDetectionPipeline,
  DetectionSummary,
  BenchmarkResponse,
} from "@/lib/api";

export default function DetectionPage() {
  const [activeSignal, setActiveSignal] = useState<"cost" | "semantic" | "geographic">("cost");
  const [summary, setSummary] = useState<DetectionSummary | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ flagged: number; analyzed: number; time: number } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  useEffect(() => {
    getDetectionSummary().then(setSummary);
  }, []);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setRunError(null);
    setRunResult(null);
    try {
      const result = await runDetectionPipeline(23000);
      setRunResult({
        flagged: result.flagged_count,
        analyzed: result.works_analyzed,
        time: result.processing_time_seconds,
      });
      // Refresh summary
      const updated = await getDetectionSummary();
      setSummary(updated);
    } catch (e: any) {
      setRunError(e.message || "Pipeline failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    const result = await getBenchmarkResults(300);
    setBenchmark(result);
    setIsBenchmarking(false);
  };

  const pipelineSteps = [
    { num: "01", name: "Data Ingestion", desc: "MPLADS e-Sakshi portal feeds. 23,044 real works loaded from PostgreSQL." },
    { num: "02", name: "Normalization", desc: "Schema standardisation, category normalization, and text cleaning." },
    { num: "03", name: "Peer Baseline", desc: "7-level hierarchical peer grouping by work type, district, state, year (min. 15 peers)." },
    { num: "04", name: "Cost Outlier Analysis", desc: "IQR (primary), Stabilized MAD (supporting), Robust Z-score against peer cohort." },
    { num: "05", name: "Semantic Similarity", desc: "TF-IDF cosine similarity within peer groups. Exact duplicate and high-frequency pattern detection." },
    { num: "06", name: "Pattern Signals", desc: "Cross-work description frequency analysis and contextual duplicate signals." },
    { num: "07", name: "Ensemble Risk Scoring", desc: "Weighted composite 0–100 score: Cost (up to 70pts) + Text (up to 55pts), peer quality adjusted." },
    { num: "08", name: "LangGraph Orchestration", desc: "StateGraph coordinates all detection stages. Each node is deterministic; no LLM calculates scores." },
  ];

  const riskBandColors: Record<string, string> = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MODERATE: "bg-amber-400",
    LOW: "bg-green-500",
    NONE: "bg-slate-300",
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1500px] px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Header Enclosed in Navy Blue Flexbox Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-9 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-xl">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase">
              <span className="w-2.5 h-2.5 bg-orange-500 inline-block rounded-xs"></span>
              SIH26102 · MULTI-SIGNAL DETECTION PIPELINE
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Every flag begins with a measurable deviation.
            </h1>
            <p className="font-sans text-base sm:text-lg text-slate-300 leading-relaxed">
              ArthaSentinel continuously scans sanctioned works against peer groups to isolate statistical, textual, and administrative outliers without subjective bias.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleRunPipeline}
              disabled={isRunning}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-sans text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              {isRunning ? "Running Pipeline..." : "Execute Detection Run"}
            </button>
          </div>
        </div>

        {/* Live Detection Stats */}
        {summary && summary.analyzed_works > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Works Analyzed", value: summary.analyzed_works.toLocaleString(), color: "text-blue-700" },
              { label: "Flagged for Review", value: summary.flagged_works.toLocaleString(), color: "text-red-600" },
              { label: "Cost Anomalies", value: summary.cost_anomaly_count.toLocaleString(), color: "text-orange-700" },
              { label: "Text Anomalies", value: summary.text_anomaly_count.toLocaleString(), color: "text-indigo-700" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className={`font-data text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="font-sans text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Risk Band Distribution */}
        {summary && summary.risk_distribution.length > 0 && (
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-heading text-lg font-bold text-slate-900">Risk Band Distribution</h2>
            <div className="space-y-2">
              {summary.risk_distribution.map((item) => (
                <div key={item.band} className="flex items-center gap-3">
                  <span className="font-emphasis text-xs font-bold w-20 text-slate-600">{item.band}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full ${riskBandColors[item.band] || "bg-slate-400"}`}
                      style={{ width: `${Math.max(0.5, item.percentage)}%` }}
                    />
                  </div>
                  <span className="font-data text-sm text-slate-700 w-24 text-right">
                    {item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run Pipeline + Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-blue-200 bg-blue-50/70 text-sm font-sans">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? "bg-amber-500 animate-pulse" : summary?.analyzed_works ? "bg-green-500" : "bg-slate-400"}`} />
              <span className="font-semibold text-blue-900">
                {isRunning ? "Running detection pipeline…" : summary?.pipeline_status || "Awaiting Detection Run"}
              </span>
            </div>
            {runResult && (
              <div className="text-green-700 font-medium text-xs">
                ✓ Analyzed {runResult.analyzed.toLocaleString()} works · {runResult.flagged.toLocaleString()} flagged · {runResult.time.toFixed(1)}s
              </div>
            )}
            {runError && <div className="text-red-600 text-xs">Error: {runError}</div>}
          </div>
          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-sans text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "Running…" : "▶ Run Detection Pipeline"}
          </button>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold text-slate-950">Scrutiny Pipeline Stages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pipelineSteps.map((step) => (
              <div key={step.num} className="border-l-2 border-slate-300 pl-4 py-1.5 space-y-1.5 hover:border-blue-600 transition-colors">
                <span className="font-emphasis text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                  STAGE {step.num}
                </span>
                <div className="font-heading text-base font-bold text-slate-900">{step.name}</div>
                <div className="font-sans text-sm text-slate-600 leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Signal Drilldown */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-slate-950">Core Detection Signals</h2>
            <span className="font-sans text-sm text-slate-500">Select a signal to view methodology</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { id: "cost", label: "01. Cost Variance", desc: "IQR, MAD & Robust Z" },
              { id: "semantic", label: "02. Semantic Similarity", desc: "TF-IDF Cosine" },
              { id: "geographic", label: "03. Pattern Analysis", desc: "Repetition & Context" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSignal(s.id as any)}
                className={`px-5 py-3 rounded-lg font-sans text-sm sm:text-base font-semibold transition-all cursor-pointer ${
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
                <span className="font-emphasis text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                  SIGNAL: COST DEVIATION
                </span>
                <span className="font-data text-sm text-slate-600 font-medium">
                  {summary?.analyzed_works ? `${summary.cost_anomaly_count.toLocaleString()} flagged` : "Notebook-validated: 97.73% detection rate"}
                </span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">IQR + Stabilized MAD Cost Analysis vs Peer Baseline</h3>
              <p className="font-sans text-base text-slate-600 leading-relaxed">
                IQR fences (primary signal, 60pts) combined with stabilized MAD/Robust-Z (supporting, 30pts). Relative deviation contributes severity only (up to 10pts). MAD=0 is handled with a stabilized fallback — it does NOT auto-flag homogeneous groups.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200 font-data text-sm text-slate-800 space-y-2">
                <div className="text-slate-400 font-mono">// Mathematical Formulation (Notebook Step 4)</div>
                <div>IQR Fence: Lower = Q1 − 1.5×IQR, Upper = Q3 + 1.5×IQR</div>
                <div>Robust Z = (cost − median) / (1.4826 × effective_MAD)</div>
                <div className="text-orange-700 font-semibold mt-1">Anomaly: IQR anomaly OR |Robust Z| &gt; 2.5 · Score: IQR=60pts + MAD=30pts + severity=10pts</div>
              </div>
            </div>
          )}

          {activeSignal === "semantic" && (
            <div className="p-7 rounded-2xl border border-indigo-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-emphasis text-xs sm:text-sm font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200">
                  SIGNAL: SEMANTIC SIMILARITY
                </span>
                <span className="font-data text-sm text-slate-600 font-medium">
                  {summary?.analyzed_works ? `${summary.text_anomaly_count.toLocaleString()} flagged` : "Notebook: 3,098 strong contextual duplicates (13.41%)"}
                </span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">TF-IDF Cosine Similarity — Peer-Group Scoped</h3>
              <p className="font-sans text-base text-slate-600 leading-relaxed">
                Description texts are compared within peer groups using TF-IDF cosine similarity. Exact duplicate detection, high-frequency pattern analysis, and strong contextual duplicate flags are all computed — never labelled as fraud, always as "potentially similar work".
              </p>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200 font-data text-sm text-slate-800 space-y-2">
                <div className="text-slate-400 font-mono">// Notebook Step 6</div>
                <div>Similarity = cos(θ) = (v_A · v_B) / (||v_A|| × ||v_B||)</div>
                <div>Exact duplicate: same cleaned text ≥ 2× in peer group</div>
                <div className="text-indigo-700 font-semibold mt-1">Strong contextual duplicate: similarity ≥ 0.95 OR frequency ≥ 5 in peer group</div>
              </div>
            </div>
          )}

          {activeSignal === "geographic" && (
            <div className="p-7 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-emphasis text-xs sm:text-sm font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-md border border-sky-200">
                  SIGNAL: PATTERN ANALYSIS
                </span>
                <span className="font-data text-sm text-slate-600 font-medium">Categorical grouping — no GIS</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Repetitive Project Pattern Detection</h3>
              <p className="font-sans text-base text-slate-600 leading-relaxed">
                Repeated feature combinations across work records (description, category, MP, constituency, cost, year) are tracked as supporting investigation signals. State, district, constituency are used as categorical grouping fields only — no spatial calculations.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-slate-200 font-data text-sm text-slate-800 space-y-2">
                <div className="text-slate-400 font-mono">// Notebook Step 8</div>
                <div>Pattern strength: NONE / LOW / MODERATE / HIGH / VERY_HIGH</div>
                <div>Pattern is an EVIDENCE SIGNAL only — not a standalone anomaly</div>
                <div className="text-sky-700 font-semibold mt-1">Notebook: 2,427 records with repeated patterns (10.5%)</div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Score Composition */}
        <div className="p-7 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <h2 className="font-heading text-2xl font-bold text-slate-950">Composite Risk Score (0–100)</h2>
          <p className="font-sans text-base text-slate-600 leading-relaxed">
            Multi-signal composite score derived from cost and text signals, adjusted by peer group quality.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-emphasis text-xs sm:text-sm font-bold text-slate-500">Up to 70 pts</span>
              <div className="font-heading text-lg font-bold text-slate-900">Cost Component</div>
              <div className="font-sans text-sm text-slate-600">IQR + MAD/Robust-Z anomaly score, peer-quality adjusted</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-emphasis text-xs sm:text-sm font-bold text-slate-500">Up to 55 pts</span>
              <div className="font-heading text-lg font-bold text-slate-900">Text Component</div>
              <div className="font-sans text-sm text-slate-600">Strong contextual duplicate (45) + very high similarity (10) + frequency (15) + exact (5)</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-emphasis text-xs sm:text-sm font-bold text-slate-500">Quality adjustment</span>
              <div className="font-heading text-lg font-bold text-slate-900">Peer Quality Factor</div>
              <div className="font-sans text-sm text-slate-600">≥50 peers → 1.0 · 15–49 → 0.85 · &lt;15 → 0.65</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { band: "CRITICAL 80–100", cls: "bg-red-100 text-red-800 border-red-200" },
              { band: "HIGH 60–79", cls: "bg-orange-100 text-orange-800 border-orange-200" },
              { band: "MODERATE 40–59", cls: "bg-amber-100 text-amber-800 border-amber-200" },
              { band: "LOW 20–39", cls: "bg-green-100 text-green-800 border-green-200" },
              { band: "NONE <20", cls: "bg-slate-100 text-slate-600 border-slate-200" },
            ].map(({ band, cls }) => (
              <span key={band} className={`px-3 py-1 rounded-full text-xs font-bold font-emphasis border ${cls}`}>{band}</span>
            ))}
          </div>
        </div>

        {/* Synthetic Benchmark */}
        <div className="p-7 rounded-2xl border border-emerald-200 bg-white shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-emphasis text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 inline-block mb-2">
                DETECTION BENCHMARK / SYNTHETIC VALIDATION
              </div>
              <h2 className="font-heading text-2xl font-bold text-slate-950">Synthetic Anomaly Benchmark</h2>
              <p className="font-sans text-sm text-slate-600 mt-1">
                300 synthetic anomalies injected from real data, run through the same pipeline. Never stored in production database.
              </p>
            </div>
            <button
              onClick={handleRunBenchmark}
              disabled={isBenchmarking}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-sans text-sm font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50"
            >
              {isBenchmarking ? "Running…" : "Run Benchmark"}
            </button>
          </div>

          {benchmark && benchmark.n_synthetic > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="font-data text-2xl font-bold text-emerald-700">{benchmark.n_synthetic}</div>
                  <div className="font-sans text-xs text-slate-500">Synthetic Anomalies</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="font-data text-2xl font-bold text-emerald-700">{benchmark.cost_detection_rate_pct.toFixed(1)}%</div>
                  <div className="font-sans text-xs text-slate-500">Cost Detection Rate</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="font-data text-2xl font-bold text-emerald-700">{benchmark.text_detection_rate_pct.toFixed(1)}%</div>
                  <div className="font-sans text-xs text-slate-500">Text Detection Rate</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="font-data text-2xl font-bold text-emerald-700">{benchmark.by_class.length}</div>
                  <div className="font-sans text-xs text-slate-500">Anomaly Classes</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 font-semibold text-slate-600">Anomaly Class</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-600">Count</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-600">Detected</th>
                      <th className="text-right py-2 pl-4 font-semibold text-slate-600">Detection Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmark.by_class.map((cls) => (
                      <tr key={cls.anomaly_class} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-800 capitalize">{cls.anomaly_class.replace("_", " ")}</td>
                        <td className="py-2 px-4 text-right text-slate-600">{cls.count}</td>
                        <td className="py-2 px-4 text-right text-slate-600">{cls.detected}</td>
                        <td className="py-2 pl-4 text-right font-bold text-emerald-700">{cls.detection_rate_pct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-sans text-xs text-slate-400 italic">{benchmark.note}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 font-sans text-sm">
              Click "Run Benchmark" to validate detection against 300 controlled synthetic anomalies.
              <br />
              <span className="text-xs">Notebook baseline: 97.73% cost detection · 13.41% text anomaly rate on real data</span>
            </div>
          )}
        </div>

        {/* Action Links */}
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
