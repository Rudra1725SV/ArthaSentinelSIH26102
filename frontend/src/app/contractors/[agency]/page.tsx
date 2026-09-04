import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ContractorPageProps {
  params: Promise<{ agency: string }>;
}

export default async function ContractorPage({ params }: ContractorPageProps) {
  const { agency } = await params;
  const decodedAgency = decodeURIComponent(agency);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <header className="mb-6">
        <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Back to Dashboard
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Contractor Cross-Reference
          </h1>
          <Badge variant="secondary">Stretch Feature Stub</Badge>
        </div>
        <p className="text-sm text-zinc-500">Agency: {decodedAgency}</p>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle>Cross-Agency Cluster Analysis</CardTitle>
            <CardDescription>
              Cross-referencing tenders, contract awards, and shared entities across constituencies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Contractor network graph and cross-constituency aggregation will populate when backend contractor endpoint is available.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
