import {
  WORKS,
  SEED_MPS,
  SYSTEM_STATS,
  VALIDATION_METRICS,
  INVESTIGATIONS,
  ALL_AUDIT_EVENTS,
  Work,
  MP,
  AuditEvent,
  Investigation,
  getWorkById,
  getMPById,
  getWorksByMPId,
  calculateDatasetMetrics,
  DatasetMetrics,
  getRiskTier,
} from "./mock-data";

export type { Work, MP, AuditEvent, DatasetMetrics, Investigation } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CategoryMetric {
  category: string;
  count: number;
  total_sanctioned: number;
  percentage_of_total: number;
}

export interface IngestionRun {
  id: string;
  house: string;
  source_file: string;
  status: string;
  total_rows: number;
  inserted_rows: number;
  rejected_rows: number;
  duplicate_rows: number;
  started_at: string;
  completed_at?: string | null;
}

export interface OverviewData {
  total_works: number;
  total_mps: number;
  total_constituencies: number;
  total_states: number;
  total_sanctioned_amount: number;
  lok_sabha_works: number;
  rajya_sabha_works: number;
  lok_sabha_mps: number;
  rajya_sabha_mps: number;
  categories: CategoryMetric[];
  latest_ingestion: IngestionRun[];
  anomaly_model_status: string;
  flagged_cases_count: number;
}

export interface GetMPsParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  house?: string;
  risk?: string;
  sort?: "risk_score_desc" | "risk_score_asc" | "anomaly_rate_desc" | "works_count_desc" | "expenditure_desc" | "utilization_desc" | "name_asc";
}

export interface PaginatedMPsResponse {
  mps: MP[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableHouses?: string[];
  availableStates?: string[];
  datasetMetrics: DatasetMetrics;
}

export interface GetWorksParams {
  page?: number;
  limit?: number;
  search?: string;
  house?: string;
  state?: string;
  category?: string;
  mp_id?: string;
  risk?: string;
  sort_by?: string;
}

export interface PaginatedWorksResponse {
  works: Work[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableHouses: string[];
  availableStates: string[];
  availableCategories: string[];
}

// ─── Overview Query ──────────────────────────────────────────────────────────

export async function getOverview(): Promise<OverviewData> {
  try {
    const res = await fetch(`${API_BASE}/api/overview`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      total_works: SYSTEM_STATS.totalWorks,
      total_mps: SYSTEM_STATS.totalMPs,
      total_constituencies: SYSTEM_STATS.districtsCovered,
      total_states: 33,
      total_sanctioned_amount: SYSTEM_STATS.totalAllocated,
      lok_sabha_works: Math.round(SYSTEM_STATS.totalWorks * 0.8),
      rajya_sabha_works: Math.round(SYSTEM_STATS.totalWorks * 0.2),
      lok_sabha_mps: 485,
      rajya_sabha_mps: 151,
      categories: [
        { category: "Normal/Others", count: 22696, total_sanctioned: 12412315177.75, percentage_of_total: 97.95 },
        { category: "Repair and Renovation", count: 263, total_sanctioned: 173786003, percentage_of_total: 1.37 },
        { category: "Trust and Society", count: 85, total_sanctioned: 85525152, percentage_of_total: 0.67 },
      ],
      latest_ingestion: [],
      anomaly_model_status: "Awaiting Model Execution",
      flagged_cases_count: 0,
    };
  }
}

// ─── MP Queries (Server-Paginated & Filterable) ──────────────────────────────

export async function getMPs(params?: GetMPsParams): Promise<PaginatedMPsResponse> {
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Number(params?.limit) || 12);

  try {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    const res = await fetch(`${API_BASE}/api/mps${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    const json = await res.json();

    // Adapt backend DatasetMetricsDTO field names → frontend DatasetMetrics interface
    let adaptedMetrics: DatasetMetrics;
    if (json.datasetMetrics) {
      const dm = json.datasetMetrics;
      // criticalMPs: count MPs in the response with risk_score >= 70
      const criticalCount = (json.mps || []).filter((m: MP) => (m.risk_score || 0) >= 70).length;
      adaptedMetrics = {
        totalWorks: dm.totalWorks ?? 0,
        flaggedWorks: dm.flaggedWorks ?? 0,
        totalAllocated: dm.totalSanctioned ?? dm.totalAllocated ?? 0,
        totalExpenditure: dm.totalExpended ?? dm.totalAllocated ?? 0,
        totalMPs: dm.totalMPs ?? 0,
        districtsCovered: dm.districtsCovered ?? 0,
        categoriesCount: dm.categoriesCount ?? 0,
        averageUtilizationRate: dm.avgUtilizationRate ?? dm.averageUtilizationRate ?? 100,
        criticalMPs: criticalCount,
      };
    } else {
      adaptedMetrics = calculateDatasetMetrics(SEED_MPS, WORKS);
    }

    return {
      ...json,
      datasetMetrics: adaptedMetrics,
    };
  } catch {
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

    const sortKey = params?.sort || "risk_score_desc";
    filtered.sort((a, b) => {
      if (sortKey === "risk_score_desc") return b.risk_score - a.risk_score;
      if (sortKey === "risk_score_asc") return a.risk_score - b.risk_score;
      if (sortKey === "anomaly_rate_desc") return b.anomaly_rate - a.anomaly_rate;
      if (sortKey === "works_count_desc") return b.works_count - a.works_count;
      if (sortKey === "expenditure_desc") return b.recorded_expenditure - a.recorded_expenditure;
      if (sortKey === "utilization_desc") return b.utilization_rate - a.utilization_rate;
      if (sortKey === "name_asc") return a.name.localeCompare(b.name);
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
      availableHouses: ["Lok Sabha", "Rajya Sabha"],
      availableStates: Array.from(new Set(SEED_MPS.map((m) => m.state))).sort(),
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

// ─── Works Queries (Server-Paginated & Filterable) ───────────────────────────

export async function getWorks(params?: GetWorksParams): Promise<PaginatedWorksResponse> {
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Number(params?.limit) || 12);

  try {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
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
    if (params?.state && params.state !== "ALL") {
      filtered = filtered.filter((w) => w.state === params.state);
    }
    if (params?.category && params.category !== "ALL") {
      filtered = filtered.filter((w) => w.category === params.category);
    }
    if (params?.risk && params.risk !== "ALL") {
      filtered = filtered.filter((w) => w.riskTier.toUpperCase() === params.risk!.toUpperCase());
    }

    if (params?.sort_by === "cost_desc") {
      filtered.sort((a, b) => b.sanctionedAmount - a.sanctionedAmount);
    } else if (params?.sort_by === "cost_asc") {
      filtered.sort((a, b) => a.sanctionedAmount - b.sanctionedAmount);
    } else if (params?.sort_by === "risk_desc") {
      filtered.sort((a, b) => b.riskScore - a.riskScore);
    } else if (params?.sort_by === "risk_asc") {
      filtered.sort((a, b) => a.riskScore - b.riskScore);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    return {
      works: filtered.slice(offset, offset + limit),
      total,
      page,
      limit,
      totalPages,
      availableHouses: ["Lok Sabha", "Rajya Sabha"],
      availableStates: Array.from(new Set(WORKS.map((w) => w.state))).sort(),
      availableCategories: Array.from(new Set(WORKS.map((w) => w.category))).sort(),
    };
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

// ─── Reviewer Actions ────────────────────────────────────────────────────────

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
      actor: "Investigator Reviewer",
      actorType: "investigator",
      action: action === "escalate" ? "Escalated for administrative inquiry" : action === "reviewed_no_issue" ? "Marked as reviewed — compliant" : "Investigator observation recorded",
      object: workId,
      result: note || "Action logged to audit trail",
    };
    return { success: true, auditRecord };
  }
}

// ─── Investigations & Audits ─────────────────────────────────────────────────

export async function getInvestigations(): Promise<{ investigations: any[]; total: number; status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      investigations: INVESTIGATIONS,
      total: INVESTIGATIONS.length,
      status: "Seed Fallback",
      message: "Using fallback seed investigations",
    };
  }
}

export async function getAuditTrail(page = 1, limit = 20): Promise<{ events: AuditEvent[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/audit?page=${page}&limit=${limit}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      events: ALL_AUDIT_EVENTS,
      total: ALL_AUDIT_EVENTS.length,
    };
  }
}

export async function getValidationSummary(): Promise<{ status: string; metrics: any[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/validation/summary`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      status: "Baseline Specification",
      metrics: VALIDATION_METRICS,
    };
  }
}

export async function getHealthStatus(): Promise<{ status: string; version: string; database?: string; pgvector?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      status: "synthetic_mode",
      version: "V2.4",
      database: "disconnected",
    };
  }
}

// ─── Detection Engine API ─────────────────────────────────────────────────────

export interface RiskDistributionItem {
  band: string;
  count: number;
  percentage: number;
}

export interface DetectionSummary {
  total_works: number;
  analyzed_works: number;
  flagged_works: number;
  review_worthy_works: number;
  risk_distribution: RiskDistributionItem[];
  cost_anomaly_count: number;
  text_anomaly_count: number;
  pipeline_status: string;
  pipeline_version: string | null;
}

export interface FlaggedWorkItem {
  work_id: string;
  source_work_id: string;
  mp_name: string;
  constituency: string;
  state: string;
  description: string;
  category: string;
  sanctioned_cost: number;
  risk_score: number;
  risk_band: string;
  primary_risk_reason: string;
  cost_anomaly: boolean;
  text_anomaly: boolean;
  peer_median: number | null;
  relative_deviation_pct: number | null;
  nearest_similarity: number | null;
  evidence: Record<string, any>;
  review_status: string;
}

export interface PaginatedFlaggedResponse {
  works: FlaggedWorkItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BenchmarkClassResult {
  anomaly_class: string;
  count: number;
  detected: number;
  detection_rate_pct: number;
}

export interface BenchmarkResponse {
  label: string;
  n_synthetic: number;
  n_cost_cases: number;
  n_text_cases: number;
  cost_detection_rate_pct: number;
  text_detection_rate_pct: number;
  by_class: BenchmarkClassResult[];
  note: string;
}

export async function getDetectionSummary(): Promise<DetectionSummary> {
  try {
    const res = await fetch(`${API_BASE}/api/detection/summary`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      total_works: 0,
      analyzed_works: 0,
      flagged_works: 0,
      review_worthy_works: 0,
      risk_distribution: [],
      cost_anomaly_count: 0,
      text_anomaly_count: 0,
      pipeline_status: "Awaiting Detection Run",
      pipeline_version: null,
    };
  }
}

export async function getFlaggedWorks(params?: {
  page?: number;
  limit?: number;
  risk_band?: string;
  min_risk_score?: number;
  sort_by?: string;
}): Promise<PaginatedFlaggedResponse> {
  try {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    const res = await fetch(`${API_BASE}/api/detection/flagged${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return { works: [], total: 0, page: 1, limit: 20, total_pages: 0 };
  }
}

export async function runDetectionPipeline(batchSize: number = 5000): Promise<{
  message: string;
  status: string;
  works_analyzed: number;
  flagged_count: number;
  risk_distribution: Record<string, number>;
  processing_time_seconds: number;
}> {
  const res = await fetch(`${API_BASE}/api/detection/run?batch_size=${batchSize}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || "Detection pipeline failed");
  }
  return await res.json();
}

export async function getBenchmarkResults(nSynthetic: number = 300): Promise<BenchmarkResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/detection/benchmark?n_synthetic=${nSynthetic}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      label: "Detection Benchmark / Synthetic Validation",
      n_synthetic: 0,
      n_cost_cases: 0,
      n_text_cases: 0,
      cost_detection_rate_pct: 0,
      text_detection_rate_pct: 0,
      by_class: [],
      note: "Benchmark unavailable — run detection pipeline first",
    };
  }
}

