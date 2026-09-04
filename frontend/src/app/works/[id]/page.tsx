import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              ← Back to Risk Queue
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Work Detail & Evidence View
          </h1>
          <p className="font-mono text-sm text-zinc-500">ID: {id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Reviewed (No Issue)</Button>
          <Button variant="destructive">Escalate Flag</Button>
        </div>
      </header>

      <main className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Breakdown</TabsTrigger>
            <TabsTrigger value="evidence">Evidence & Documents</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Risk Score</CardTitle>
                  <CardDescription>Composite Anomaly Metric</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">Pending</div>
                  <p className="mt-1 text-xs text-zinc-500">Placeholder for Bklit Gauge Chart</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Financial Discrepancy</CardTitle>
                  <CardDescription>Sanction vs Expenditure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">--</div>
                  <p className="mt-1 text-xs text-zinc-500">Placeholder for Bklit Bar Chart</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Peer Comparison</CardTitle>
                  <CardDescription>Constituency Norm Variance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">--</div>
                  <p className="mt-1 text-xs text-zinc-500">Placeholder for Bklit Radar Chart</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Breakdown</CardTitle>
                <CardDescription>Rule-based & ML detector flags for {id}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-500">
                Awaiting backend connection: /api/works/{id}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Evidence & Artifacts</CardTitle>
                <CardDescription>Work orders, milestone certificates, contractor bids</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-500">
                Awaiting documents payload from backend.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Audit Log</CardTitle>
                <CardDescription>Historical actions taken on this work</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-500">
                No actions recorded yet.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
