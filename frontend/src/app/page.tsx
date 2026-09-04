import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ArthaSentinel
            </h1>
            <Badge variant="outline">SIH26102</Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            MPLADS Anomaly Detection & Reviewer Risk-Triage Dashboard
          </p>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/">
            <Button variant="default" size="sm">Risk Queue</Button>
          </Link>
          <Link href="/works/DEMO-101">
            <Button variant="outline" size="sm">Evidence View (Demo)</Button>
          </Link>
          <Link href="/contractors/AGENCY-ALPHA">
            <Button variant="outline" size="sm">Contractor Cross-Ref</Button>
          </Link>
          <Link href="/methodology">
            <Button variant="outline" size="sm">Methodology</Button>
          </Link>
        </nav>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filter Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Filter Panel</CardTitle>
            <CardDescription>Refine risk triage queue</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Search Work ID / Agency</label>
              <Input placeholder="e.g. WRK-2024-..." className="mt-1" disabled />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Risk Threshold</label>
              <Input placeholder="High, Critical..." className="mt-1" disabled />
            </div>
            <Button className="w-full" disabled>Apply Filters</Button>
          </CardContent>
        </Card>

        {/* Risk Queue Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Risk Queue</CardTitle>
            <CardDescription>Works flagged for anomaly inspection and review</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work ID</TableHead>
                  <TableHead>Constituency / District</TableHead>
                  <TableHead>Implementing Agency</TableHead>
                  <TableHead>Sanctioned Amount</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">WRK-MPLADS-001</TableCell>
                  <TableCell>North District</TableCell>
                  <TableCell>Agency Alpha</TableCell>
                  <TableCell>₹ 25,00,000</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Critical (0.92)</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href="/works/WRK-MPLADS-001">
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-zinc-400 py-6">
                    Awaiting backend data stream connection (http://localhost:8000/api/works)
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
