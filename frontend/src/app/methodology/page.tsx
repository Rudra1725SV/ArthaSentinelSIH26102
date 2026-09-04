import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <header className="mb-6">
        <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Back to Dashboard
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Validation & Detection Methodology
          </h1>
          <Badge variant="outline">SIH26102</Badge>
        </div>
        <p className="text-sm text-zinc-500">
          Model explainability, statistical baselines, and anomaly scoring rules for MPLADS works.
        </p>
      </header>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistical Variance Scoring</CardTitle>
            <CardDescription>Z-Score & Interquartile Range (IQR)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500">
            Flags cost-per-unit metrics and timeline durations exceeding 2.5 standard deviations from district and category medians.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clustering & Network Co-occurrence</CardTitle>
            <CardDescription>Vendor Concentration & Repeated Allocations</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500">
            Identifies single-vendor monopolies in specific blocks, uncompetitive bidding rings, and sanction clustering near fiscal year-ends.
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Model Validation Metrics</CardTitle>
            <CardDescription>Accuracy, Precision, Recall summary against audited benchmarks</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-500">
            Summary endpoint: /api/validation/summary (available once backend is active).
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
