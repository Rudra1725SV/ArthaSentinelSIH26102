const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getWorks(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_BASE}/api/works${query}`);
  return res.json();
}

export async function getWorkDetail(workId: string) {
  const res = await fetch(`${API_BASE}/api/works/${workId}`);
  return res.json();
}

export async function submitReviewerAction(
  workId: string,
  action: "escalate" | "reviewed_no_issue",
  note?: string
) {
  const res = await fetch(`${API_BASE}/api/works/${workId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, note }),
  });
  return res.json();
}

export async function getValidationSummary() {
  const res = await fetch(`${API_BASE}/api/validation/summary`);
  return res.json();
}
