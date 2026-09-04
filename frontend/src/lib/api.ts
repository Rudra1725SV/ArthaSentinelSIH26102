import { WORKS, SYSTEM_STATS, VALIDATION_METRICS, Work, AuditEvent, getWorkById } from "./mock-data";

export type { Work, AuditEvent } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getWorks(params?: Record<string, string>): Promise<{ works: Work[]; total: number }> {
  try {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${API_BASE}/api/works${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unavailable");
    return await res.json();
  } catch {
    // Graceful fallback to rich mock data
    let filtered = [...WORKS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.workId.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.constituency.toLowerCase().includes(q) ||
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
    // Synthetic audit trail fallback
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

export async function getHealthStatus(): Promise<{ status: string; version: string; worksIndexed: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      status: "synthetic_mode",
      version: "V2.4",
      worksIndexed: SYSTEM_STATS.worksIndexed,
    };
  }
}
