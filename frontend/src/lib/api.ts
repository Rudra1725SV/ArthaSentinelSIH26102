import { MOCK_WORKS, SYSTEM_STATS, VALIDATION_METRICS, Work, AuditRecord } from "./mock-data";

export type { Work, AuditRecord } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getWorks(params?: Record<string, string>): Promise<{ works: Work[]; total: number }> {
  try {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${API_BASE}/api/works${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    // Graceful fallback to rich mock data
    let filtered = [...MOCK_WORKS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.constituency.toLowerCase().includes(q) ||
          w.implementingAgency.toLowerCase().includes(q)
      );
    }
    if (params?.tier && params.tier !== "ALL") {
      filtered = filtered.filter((w) => w.riskTier.toUpperCase() === params.tier.toUpperCase());
    }
    if (params?.type && params.type !== "ALL") {
      filtered = filtered.filter((w) => w.anomalyFlags.some((f) => f.type === params.type));
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
    const found = MOCK_WORKS.find((w) => w.id === workId);
    return found || MOCK_WORKS[0];
  }
}

export async function submitReviewerAction(
  workId: string,
  action: "escalate" | "reviewed_no_issue" | "note_added",
  note?: string
): Promise<{ success: boolean; auditRecord: AuditRecord }> {
  try {
    const res = await fetch(`${API_BASE}/api/works/${workId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    const newRecord: AuditRecord = {
      id: "AUD-" + Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " IST",
      actor: "Reviewer Officer (Active Session)",
      role: "Public Finance Investigator",
      action:
        action === "escalate"
          ? "ESCALATED"
          : action === "reviewed_no_issue"
          ? "REVIEWED_NO_ISSUE"
          : "NOTE_ADDED",
      notes: note || (action === "escalate" ? "Work escalated for field verification." : "Marked reviewed with no anomaly issue."),
    };
    return { success: true, auditRecord: newRecord };
  }
}

export async function getValidationSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/validation/summary`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    return {
      stats: SYSTEM_STATS,
      metrics: VALIDATION_METRICS,
    };
  }
}
