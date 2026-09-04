import {
  WORKS,
  SEED_MPS,
  SYSTEM_STATS,
  VALIDATION_METRICS,
  Work,
  MP,
  AuditEvent,
  getWorkById,
  getMPById,
  getWorksByMPId,
  calculateDatasetMetrics,
  DatasetMetrics,
  getRiskTier,
} from "./mock-data";

export type { Work, MP, AuditEvent, DatasetMetrics } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ─── MP Queries (Server-Paginated & Filterable) ──────────────────────────────

export interface GetMPsParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  house?: string;
  risk?: string;
  sort?: "risk_score_desc" | "risk_score_asc" | "anomaly_rate_desc" | "works_count_desc" | "expenditure_desc" | "utilization_desc";
}

export interface PaginatedMPsResponse {
  mps: MP[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  datasetMetrics: DatasetMetrics;
}

export async function getMPs(params?: GetMPsParams): Promise<PaginatedMPsResponse> {
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Number(params?.limit) || 12);

  try {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    const res = await fetch(`${API_BASE}/api/mps${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    // Dynamic client-side fallback against active seed dataset
    let filtered = [...SEED_MPS];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.constituency.toLowerCase().includes(q) ||
          m.district.toLowerCase().includes(q) ||
          m.party.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q)
      );
    }

    if (params?.state && params.state !== "ALL") {
      filtered = filtered.filter((m) => m.state === params.state);
    }

    if (params?.house && params.house !== "ALL") {
      filtered = filtered.filter((m) => m.house === params.house);
    }

    if (params?.risk && params.risk !== "ALL") {
      filtered = filtered.filter((m) => getRiskTier(m.risk_score).toUpperCase() === params.risk!.toUpperCase());
    }

    // Dynamic sorting
    const sortKey = params?.sort || "risk_score_desc";
    filtered.sort((a, b) => {
      if (sortKey === "risk_score_desc") return b.risk_score - a.risk_score;
      if (sortKey === "risk_score_asc") return a.risk_score - b.risk_score;
      if (sortKey === "anomaly_rate_desc") return b.anomaly_rate - a.anomaly_rate;
      if (sortKey === "works_count_desc") return b.works_count - a.works_count;
      if (sortKey === "expenditure_desc") return b.recorded_expenditure - a.recorded_expenditure;
      if (sortKey === "utilization_desc") return b.utilization_rate - a.utilization_rate;
      return 0;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const pagedMps = filtered.slice(offset, offset + limit);

    return {
      mps: pagedMps,
      total,
      page,
      limit,
      totalPages,
      datasetMetrics: calculateDatasetMetrics(SEED_MPS, WORKS),
    };
  }
}

export async function getMPDetail(mpId: string): Promise<{ mp: MP; works: Work[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/mps/${mpId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    const mp = getMPById(mpId);
    if (!mp) return null;
    const works = getWorksByMPId(mpId);
    return { mp, works };
  }
}

// ─── Works Queries ───────────────────────────────────────────────────────────

export async function getWorks(params?: Record<string, string>): Promise<{ works: Work[]; total: number }> {
  try {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${API_BASE}/api/works${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    let filtered = [...WORKS];

    if (params?.mp_id) {
      filtered = filtered.filter((w) => w.mp_id === params.mp_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.workId.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.constituency.toLowerCase().includes(q) ||
          w.mp_name.toLowerCase().includes(q) ||
          w.implementingAgency.toLowerCase().includes(q)
      );
    }
    if (params?.tier && params.tier !== "ALL") {
      filtered = filtered.filter((w) => w.riskTier.toUpperCase() === params.tier.toUpperCase());
    }
    if (params?.type && params.type !== "ALL") {
      filtered = filtered.filter((w) => w.anomalyTypes.includes(params.type as any));
    }
    return { works: filtered, total: filtered.length };
  }
}

export async function getWorkDetail(workId: string): Promise<Work | null> {
  try {
    const res = await fetch(`${API_BASE}/api/works/${workId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    const found = getWorkById(workId);
    return found || WORKS[0];
  }
}

export async function submitReviewerAction(
  workId: string,
  action: "escalate" | "reviewed_no_issue" | "note_added",
  note?: string
): Promise<{ success: boolean; auditRecord: AuditEvent }> {
  try {
    const res = await fetch(`${API_BASE}/api/works/${workId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    const auditRecord: AuditEvent = {
      id: "evt-" + Date.now(),
      timestamp: new Date().toISOString(),
      actor: "Dr. K. S. Ramanathan",
      actorType: "investigator",
      action: action === "escalate" ? "Escalated for administrative inquiry" : action === "reviewed_no_issue" ? "Marked as reviewed — within peer variance" : "Investigator observation recorded",
      object: workId,
      result: note || "Action logged to audit trail (client fallback)",
    };
    return { success: true, auditRecord };
  }
}

export async function getHealthStatus(): Promise<{ status: string; version: string; metrics: DatasetMetrics }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      status: "synthetic_mode",
      version: "V2.4",
      metrics: calculateDatasetMetrics(SEED_MPS, WORKS),
    };
  }
}
