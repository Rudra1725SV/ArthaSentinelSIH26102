// =============================================================================
// ArthaSentinel V2.4 — Full Frontend Data Model & Dataset-Driven Architecture
// MPLADS Anomaly Detection & Investigation Platform (SIH26102)
// =============================================================================
// ALL DATA IS SYNTHETIC SEED DATA.
// The system is designed to dynamically accept external datasets (CSV/Excel/API)
// without frontend code modifications. All rankings and KPIs are dynamically computed.
// =============================================================================

// ─── Core MP Entity ──────────────────────────────────────────────────────────

export interface MP {
  mp_id: string;
  name: string;
  house: "Lok Sabha" | "Rajya Sabha";
  constituency: string;
  state: string;
  district: string;
  party: string;
  tenure_start: string;
  tenure_end: string;
  works_count: number;
  completed_works: number;
  ongoing_works: number;
  allocated_amount: number; // ₹
  recorded_expenditure: number; // ₹
  utilization_rate: number; // %
  flagged_works: number;
  high_risk_works: number;
  anomaly_rate: number; // %
  risk_score: number; // 0–100 composite
  avatar_initials?: string;
}

// ─── Work Entity ─────────────────────────────────────────────────────────────

export interface Work {
  id?: string;
  workId: string;
  mp_id: string;
  mp_name: string;
  description: string;
  state: string;
  district: string;
  constituency: string;
  category: string;
  sanctionedAmount: number;
  expenditureAmount: number;
  peerMedian: number;
  peerCount: number;
  deviationPercentage: number;
  riskScore: number;
  riskTier: "Low" | "Moderate" | "Elevated" | "Critical";
  anomalyTypes: AnomalyType[];
  financialYear: string;
  status: "Flagged" | "Triaged" | "Under Review" | "Escalated" | "Resolved" | "Dismissed";
  implementingAgency: string;
  contractor: string;
  sanctionDate: string;
  createdAt: string;
  updatedAt: string;
}

export type AnomalyType = "cost" | "semantic" | "geographic" | "pattern";

export interface AnomalyFlag {
  type: AnomalyType;
  severity: "moderate" | "elevated" | "critical";
  title: string;
  summary: string;
  metric: string;
  peerComparison: string;
}

export interface Investigation {
  investigationId: string;
  workId: string;
  riskScore: number;
  status: "Flagged" | "Triaged" | "Under Review" | "Escalated" | "Resolved" | "Dismissed";
  assignedTo: string;
  primarySignal: string;
  notes: InvestigationNote[];
  evidence: EvidenceItem[];
  timeline: AuditEvent[];
  anomalyFlags: AnomalyFlag[];
  peerDistribution: { label: string; amount: number; isThisWork?: boolean }[];
  radarMetrics: { dimension: string; thisWork: number; peerBaseline: number }[];
}

export interface InvestigationNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
}

export interface EvidenceItem {
  id: string;
  type: "document" | "photo" | "calculation" | "comparison";
  title: string;
  description: string;
  addedAt: string;
  addedBy: string;
}

export interface RelatedWork {
  workId: string;
  relatedWorkId: string;
  similarityScore: number;
  categoryMatch: boolean;
  costDifference: number;
  relatedDescription: string;
  relatedConstituency: string;
  relatedAmount: number;
  relationshipType: "semantic" | "constituency" | "vendor" | "pattern";
  administrativeOverlap: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "system" | "investigator" | "supervisor" | "validator";
  action: string;
  object: string;
  result: string;
}

// ─── Dynamic Dataset Metrics Calculator ──────────────────────────────────────

export interface DatasetMetrics {
  totalMPs: number;
  totalWorks: number;
  totalAllocated: number;
  totalExpenditure: number;
  overallUtilization: number;
  averageUtilizationRate: number;
  flaggedWorks: number;
  highRiskWorks: number;
  anomalyRate: number;
  criticalMPs: number;
  statesCovered: number;
  districtsCovered: number;
  worksIndexed: number;
  flaggedThisCycle: number;
}

export function calculateDatasetMetrics(mps: MP[], works: Work[]): DatasetMetrics {
  const totalMPs = mps.length;
  const totalWorks = works.length;
  const totalAllocated = mps.reduce((acc, m) => acc + m.allocated_amount, 0);
  const totalExpenditure = mps.reduce((acc, m) => acc + m.recorded_expenditure, 0);
  const overallUtilization = totalAllocated > 0 ? Number(((totalExpenditure / totalAllocated) * 100).toFixed(1)) : 0;
  const flaggedWorks = works.filter((w) => w.status === "Flagged" || w.status === "Under Review" || w.status === "Escalated").length;
  const highRiskWorks = works.filter((w) => w.riskScore >= 70).length;
  const anomalyRate = totalWorks > 0 ? Number(((flaggedWorks / totalWorks) * 100).toFixed(1)) : 0;
  const criticalMPs = mps.filter((m) => m.risk_score >= 70).length;
  const statesCovered = new Set(mps.map((m) => m.state)).size;
  const districtsCovered = new Set(mps.map((m) => m.district)).size;

  return {
    totalMPs,
    totalWorks,
    totalAllocated,
    totalExpenditure,
    overallUtilization,
    averageUtilizationRate: overallUtilization,
    flaggedWorks,
    highRiskWorks,
    anomalyRate,
    criticalMPs,
    statesCovered,
    districtsCovered,
    worksIndexed: totalWorks,
    flaggedThisCycle: flaggedWorks,
  };
}

// ─── Format Helpers ──────────────────────────────────────────────────────────

export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) return "₹0.0L";
  const num = Number(val);
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
  return "₹" + (num / 100000).toFixed(1) + "L";
}

export function formatCurrencyFull(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) return "₹0";
  return "₹" + Number(val).toLocaleString("en-IN");
}

export function formatTimestamp(iso: string): string {
  if (!iso) return "";
  try {
    const parts = iso.split("T");
    const datePart = parts[0];
    const timePart = parts[1] ? parts[1].slice(0, 5) : "";
    const [y, m, d] = datePart.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}${timePart ? `, ${timePart}` : ""}`;
  } catch {
    return iso;
  }
}

export function getRiskTier(score: number): Work["riskTier"] {
  if (score >= 80) return "Critical";
  if (score >= 60) return "Elevated";
  if (score >= 30) return "Moderate";
  return "Low";
}

// ─── Seed MP Dataset (Representative, Scalable) ──────────────────────────────

export const SEED_MPS: MP[] = [
  {
    mp_id: "MP-MP-01",
    name: "Alok Kumar Verma",
    house: "Lok Sabha",
    constituency: "Bhopal Parliamentary",
    state: "Madhya Pradesh",
    district: "Sehore",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 58,
    completed_works: 32,
    ongoing_works: 26,
    allocated_amount: 250000000,
    recorded_expenditure: 218000000,
    utilization_rate: 87.2,
    flagged_works: 7,
    high_risk_works: 3,
    anomaly_rate: 12.1,
    risk_score: 87,
    avatar_initials: "AV",
  },
  {
    mp_id: "MP-UP-01",
    name: "Virendra Singh",
    house: "Lok Sabha",
    constituency: "Varanasi Parliamentary",
    state: "Uttar Pradesh",
    district: "Varanasi",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 72,
    completed_works: 44,
    ongoing_works: 28,
    allocated_amount: 250000000,
    recorded_expenditure: 234000000,
    utilization_rate: 93.6,
    flagged_works: 5,
    high_risk_works: 2,
    anomaly_rate: 6.9,
    risk_score: 81,
    avatar_initials: "VS",
  },
  {
    mp_id: "MP-TN-01",
    name: "K. Navaskani",
    house: "Lok Sabha",
    constituency: "Ramanathapuram Parliamentary",
    state: "Tamil Nadu",
    district: "Ramanathapuram",
    party: "IUML",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 46,
    completed_works: 24,
    ongoing_works: 22,
    allocated_amount: 250000000,
    recorded_expenditure: 198000000,
    utilization_rate: 79.2,
    flagged_works: 4,
    high_risk_works: 2,
    anomaly_rate: 8.7,
    risk_score: 85,
    avatar_initials: "KN",
  },
  {
    mp_id: "MP-MP-02",
    name: "Shankar Lalwani",
    house: "Lok Sabha",
    constituency: "Indore Lok Sabha",
    state: "Madhya Pradesh",
    district: "Indore",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 64,
    completed_works: 41,
    ongoing_works: 23,
    allocated_amount: 250000000,
    recorded_expenditure: 225000000,
    utilization_rate: 90.0,
    flagged_works: 4,
    high_risk_works: 1,
    anomaly_rate: 6.3,
    risk_score: 76,
    avatar_initials: "SL",
  },
  {
    mp_id: "MP-RJ-01",
    name: "Rao Rajendra Singh",
    house: "Lok Sabha",
    constituency: "Jaipur Rural",
    state: "Rajasthan",
    district: "Jaipur",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 51,
    completed_works: 30,
    ongoing_works: 21,
    allocated_amount: 250000000,
    recorded_expenditure: 205000000,
    utilization_rate: 82.0,
    flagged_works: 5,
    high_risk_works: 1,
    anomaly_rate: 9.8,
    risk_score: 72,
    avatar_initials: "RS",
  },
  {
    mp_id: "MP-WB-01",
    name: "Mala Roy",
    house: "Lok Sabha",
    constituency: "Kolkata South",
    state: "West Bengal",
    district: "Kolkata",
    party: "AITC",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 62,
    completed_works: 38,
    ongoing_works: 24,
    allocated_amount: 250000000,
    recorded_expenditure: 212000000,
    utilization_rate: 84.8,
    flagged_works: 4,
    high_risk_works: 1,
    anomaly_rate: 6.5,
    risk_score: 71,
    avatar_initials: "MR",
  },
  {
    mp_id: "MP-BR-01",
    name: "Ravi Shankar Prasad",
    house: "Lok Sabha",
    constituency: "Patna Sahib",
    state: "Bihar",
    district: "Patna",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 59,
    completed_works: 35,
    ongoing_works: 24,
    allocated_amount: 250000000,
    recorded_expenditure: 219000000,
    utilization_rate: 87.6,
    flagged_works: 4,
    high_risk_works: 1,
    anomaly_rate: 6.8,
    risk_score: 69,
    avatar_initials: "RP",
  },
  {
    mp_id: "MP-AP-01",
    name: "M. Sribharat",
    house: "Lok Sabha",
    constituency: "Visakhapatnam Parliamentary",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    party: "TDP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 48,
    completed_works: 28,
    ongoing_works: 20,
    allocated_amount: 250000000,
    recorded_expenditure: 201000000,
    utilization_rate: 80.4,
    flagged_works: 3,
    high_risk_works: 1,
    anomaly_rate: 6.2,
    risk_score: 74,
    avatar_initials: "MS",
  },
  {
    mp_id: "MP-TN-02",
    name: "Dayanidhi Maran",
    house: "Lok Sabha",
    constituency: "Chennai Central",
    state: "Tamil Nadu",
    district: "Chennai",
    party: "DMK",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 55,
    completed_works: 40,
    ongoing_works: 15,
    allocated_amount: 250000000,
    recorded_expenditure: 231000000,
    utilization_rate: 92.4,
    flagged_works: 2,
    high_risk_works: 0,
    anomaly_rate: 3.6,
    risk_score: 55,
    avatar_initials: "DM",
  },
  {
    mp_id: "MP-TG-01",
    name: "Asaduddin Owaisi",
    house: "Lok Sabha",
    constituency: "Hyderabad Parliamentary",
    state: "Telangana",
    district: "Hyderabad",
    party: "AIMIM",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 68,
    completed_works: 48,
    ongoing_works: 20,
    allocated_amount: 250000000,
    recorded_expenditure: 240000000,
    utilization_rate: 96.0,
    flagged_works: 2,
    high_risk_works: 0,
    anomaly_rate: 2.9,
    risk_score: 48,
    avatar_initials: "AO",
  },
  {
    mp_id: "MP-KA-01",
    name: "P. C. Mohan",
    house: "Lok Sabha",
    constituency: "Bangalore Central",
    state: "Karnataka",
    district: "Bengaluru Urban",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 53,
    completed_works: 37,
    ongoing_works: 16,
    allocated_amount: 250000000,
    recorded_expenditure: 228000000,
    utilization_rate: 91.2,
    flagged_works: 2,
    high_risk_works: 0,
    anomaly_rate: 3.8,
    risk_score: 42,
    avatar_initials: "PM",
  },
  {
    mp_id: "MP-HR-01",
    name: "Rao Inderjit Singh",
    house: "Lok Sabha",
    constituency: "Gurugram Parliamentary",
    state: "Haryana",
    district: "Gurugram",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 60,
    completed_works: 45,
    ongoing_works: 15,
    allocated_amount: 250000000,
    recorded_expenditure: 236000000,
    utilization_rate: 94.4,
    flagged_works: 1,
    high_risk_works: 0,
    anomaly_rate: 1.7,
    risk_score: 38,
    avatar_initials: "IS",
  },
  {
    mp_id: "MP-MH-01",
    name: "Murlidhar Mohol",
    house: "Lok Sabha",
    constituency: "Pune Parliamentary",
    state: "Maharashtra",
    district: "Pune",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 49,
    completed_works: 39,
    ongoing_works: 10,
    allocated_amount: 250000000,
    recorded_expenditure: 238000000,
    utilization_rate: 95.2,
    flagged_works: 1,
    high_risk_works: 0,
    anomaly_rate: 2.0,
    risk_score: 34,
    avatar_initials: "MM",
  },
  {
    mp_id: "MP-OD-01",
    name: "Aparajita Sarangi",
    house: "Lok Sabha",
    constituency: "Bhubaneswar Parliamentary",
    state: "Odisha",
    district: "Bhubaneswar",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 66,
    completed_works: 52,
    ongoing_works: 14,
    allocated_amount: 250000000,
    recorded_expenditure: 242000000,
    utilization_rate: 96.8,
    flagged_works: 0,
    high_risk_works: 0,
    anomaly_rate: 0.0,
    risk_score: 28,
    avatar_initials: "AS",
  },
  {
    mp_id: "MP-RJ-02",
    name: "Gajendra Singh Shekhawat",
    house: "Lok Sabha",
    constituency: "Jodhpur Parliamentary",
    state: "Rajasthan",
    district: "Jodhpur",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 54,
    completed_works: 46,
    ongoing_works: 8,
    allocated_amount: 250000000,
    recorded_expenditure: 245000000,
    utilization_rate: 98.0,
    flagged_works: 0,
    high_risk_works: 0,
    anomaly_rate: 0.0,
    risk_score: 25,
    avatar_initials: "GS",
  },
  {
    mp_id: "MP-GJ-01",
    name: "Hasmukh Patel",
    house: "Lok Sabha",
    constituency: "Ahmedabad East",
    state: "Gujarat",
    district: "Ahmedabad",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 61,
    completed_works: 53,
    ongoing_works: 8,
    allocated_amount: 250000000,
    recorded_expenditure: 247000000,
    utilization_rate: 98.8,
    flagged_works: 0,
    high_risk_works: 0,
    anomaly_rate: 0.0,
    risk_score: 22,
    avatar_initials: "HP",
  },
  {
    mp_id: "MP-KL-01",
    name: "Dr. Shashi Tharoor",
    house: "Lok Sabha",
    constituency: "Thiruvananthapuram Parliamentary",
    state: "Kerala",
    district: "Thiruvananthapuram",
    party: "INC",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 70,
    completed_works: 62,
    ongoing_works: 8,
    allocated_amount: 250000000,
    recorded_expenditure: 248000000,
    utilization_rate: 99.2,
    flagged_works: 0,
    high_risk_works: 0,
    anomaly_rate: 0.0,
    risk_score: 18,
    avatar_initials: "ST",
  },
  // Rajya Sabha representatives
  {
    mp_id: "MP-RS-01",
    name: "Jairam Ramesh",
    house: "Rajya Sabha",
    constituency: "Karnataka (Statewide)",
    state: "Karnataka",
    district: "Bengaluru",
    party: "INC",
    tenure_start: "2022",
    tenure_end: "2028",
    works_count: 38,
    completed_works: 29,
    ongoing_works: 9,
    allocated_amount: 250000000,
    recorded_expenditure: 220000000,
    utilization_rate: 88.0,
    flagged_works: 1,
    high_risk_works: 0,
    anomaly_rate: 2.6,
    risk_score: 32,
    avatar_initials: "JR",
  },
  {
    mp_id: "MP-RS-02",
    name: "Sanjay Raut",
    house: "Rajya Sabha",
    constituency: "Maharashtra (Statewide)",
    state: "Maharashtra",
    district: "Mumbai",
    party: "SS(UBT)",
    tenure_start: "2022",
    tenure_end: "2028",
    works_count: 42,
    completed_works: 31,
    ongoing_works: 11,
    allocated_amount: 250000000,
    recorded_expenditure: 215000000,
    utilization_rate: 86.0,
    flagged_works: 2,
    high_risk_works: 0,
    anomaly_rate: 4.8,
    risk_score: 45,
    avatar_initials: "SR",
  },
  {
    mp_id: "MP-RS-03",
    name: "Sarbananda Sonowal",
    house: "Rajya Sabha",
    constituency: "Assam (Statewide)",
    state: "Assam",
    district: "Dibrugarh",
    party: "BJP",
    tenure_start: "2021",
    tenure_end: "2027",
    works_count: 45,
    completed_works: 33,
    ongoing_works: 12,
    allocated_amount: 250000000,
    recorded_expenditure: 222000000,
    utilization_rate: 88.8,
    flagged_works: 1,
    high_risk_works: 0,
    anomaly_rate: 2.2,
    risk_score: 29,
    avatar_initials: "SS",
  },
  {
    mp_id: "MP-RS-04",
    name: "K. Keshava Rao",
    house: "Rajya Sabha",
    constituency: "Telangana (Statewide)",
    state: "Telangana",
    district: "Hyderabad",
    party: "INC",
    tenure_start: "2020",
    tenure_end: "2026",
    works_count: 36,
    completed_works: 28,
    ongoing_works: 8,
    allocated_amount: 250000000,
    recorded_expenditure: 218000000,
    utilization_rate: 87.2,
    flagged_works: 1,
    high_risk_works: 0,
    anomaly_rate: 2.8,
    risk_score: 35,
    avatar_initials: "KR",
  },
  {
    mp_id: "MP-RS-05",
    name: "Manoj Kumar Jha",
    house: "Rajya Sabha",
    constituency: "Bihar (Statewide)",
    state: "Bihar",
    district: "Patna",
    party: "RJD",
    tenure_start: "2024",
    tenure_end: "2030",
    works_count: 31,
    completed_works: 22,
    ongoing_works: 9,
    allocated_amount: 250000000,
    recorded_expenditure: 195000000,
    utilization_rate: 78.0,
    flagged_works: 2,
    high_risk_works: 0,
    anomaly_rate: 6.5,
    risk_score: 44,
    avatar_initials: "MJ",
  },
  {
    mp_id: "MP-UP-02",
    name: "Rajnath Singh",
    house: "Lok Sabha",
    constituency: "Lucknow Parliamentary",
    state: "Uttar Pradesh",
    district: "Lucknow",
    party: "BJP",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 75,
    completed_works: 58,
    ongoing_works: 17,
    allocated_amount: 250000000,
    recorded_expenditure: 244000000,
    utilization_rate: 97.6,
    flagged_works: 2,
    high_risk_works: 0,
    anomaly_rate: 2.7,
    risk_score: 45,
    avatar_initials: "RS",
  },
  {
    mp_id: "MP-PB-01",
    name: "Gurjeet Singh Aujla",
    house: "Lok Sabha",
    constituency: "Amritsar Parliamentary",
    state: "Punjab",
    district: "Amritsar",
    party: "INC",
    tenure_start: "2024",
    tenure_end: "2029",
    works_count: 52,
    completed_works: 36,
    ongoing_works: 16,
    allocated_amount: 250000000,
    recorded_expenditure: 214000000,
    utilization_rate: 85.6,
    flagged_works: 3,
    high_risk_works: 0,
    anomaly_rate: 5.8,
    risk_score: 52,
    avatar_initials: "GA",
  },
];

// ─── Works Dataset (Linked to MP entities) ───────────────────────────────────

export const WORKS: Work[] = [
  {
    workId: "MPL-48291",
    mp_id: "MP-MP-01",
    mp_name: "Alok Kumar Verma",
    description: "Construction of Multi-Purpose Community Hall & Solar Microgrid",
    state: "Madhya Pradesh",
    district: "Sehore",
    constituency: "Bhopal Parliamentary",
    category: "Community Infrastructure",
    sanctionedAmount: 4820000,
    expenditureAmount: 4780000,
    peerMedian: 1700000,
    peerCount: 34,
    deviationPercentage: 184,
    riskScore: 87,
    riskTier: "Critical",
    anomalyTypes: ["cost", "semantic"],
    financialYear: "2024-25",
    status: "Flagged",
    implementingAgency: "M/s Apex Rural Infra Projects Ltd",
    contractor: "Apex Rural Infra",
    sanctionDate: "2024-03-28",
    createdAt: "2026-09-02T11:20:00",
    updatedAt: "2026-09-03T14:45:00",
  },
  {
    workId: "MPL-38192",
    mp_id: "MP-MP-01",
    mp_name: "Alok Kumar Verma",
    description: "Construction of Community Centre with Integrated Training Facility",
    state: "Madhya Pradesh",
    district: "Sehore",
    constituency: "Bhopal Parliamentary",
    category: "Community Infrastructure",
    sanctionedAmount: 4600000,
    expenditureAmount: 4550000,
    peerMedian: 1700000,
    peerCount: 34,
    deviationPercentage: 171,
    riskScore: 82,
    riskTier: "Critical",
    anomalyTypes: ["cost", "semantic", "geographic"],
    financialYear: "2024-25",
    status: "Under Review",
    implementingAgency: "M/s Apex Rural Infra Projects Ltd",
    contractor: "Apex Rural Infra",
    sanctionDate: "2024-03-14",
    createdAt: "2026-09-02T11:22:00",
    updatedAt: "2026-09-04T09:30:00",
  },
  {
    workId: "MPL-72819",
    mp_id: "MP-RJ-01",
    mp_name: "Rao Rajendra Singh",
    description: "Upgradation of Rural Link Road with Cement Concrete Pavement",
    state: "Rajasthan",
    district: "Jaipur",
    constituency: "Jaipur Rural",
    category: "Rural Connectivity",
    sanctionedAmount: 3800000,
    expenditureAmount: 3750000,
    peerMedian: 3400000,
    peerCount: 48,
    deviationPercentage: 12,
    riskScore: 72,
    riskTier: "Elevated",
    anomalyTypes: ["geographic", "pattern"],
    financialYear: "2024-25",
    status: "Flagged",
    implementingAgency: "National Tech Buildcon",
    contractor: "National Tech",
    sanctionDate: "2024-02-27",
    createdAt: "2026-09-01T09:00:00",
    updatedAt: "2026-09-02T17:00:00",
  },
  {
    workId: "MPL-91024",
    mp_id: "MP-MP-02",
    mp_name: "Shankar Lalwani",
    description: "Installation of 240W LED High-Mast Solar Lighting Systems, Ward 12 & 14",
    state: "Madhya Pradesh",
    district: "Indore",
    constituency: "Indore Lok Sabha",
    category: "Renewable Energy",
    sanctionedAmount: 3200000,
    expenditureAmount: 3150000,
    peerMedian: 1850000,
    peerCount: 26,
    deviationPercentage: 73,
    riskScore: 76,
    riskTier: "Elevated",
    anomalyTypes: ["cost", "pattern"],
    financialYear: "2024-25",
    status: "Triaged",
    implementingAgency: "Shree Balaji Infra Solutions",
    contractor: "Shree Balaji",
    sanctionDate: "2024-02-14",
    createdAt: "2026-09-01T09:15:00",
    updatedAt: "2026-09-03T11:00:00",
  },
  {
    workId: "MPL-55301",
    mp_id: "MP-UP-01",
    mp_name: "Virendra Singh",
    description: "Deep Borewell Drilling & Community RO Water Purification Network",
    state: "Uttar Pradesh",
    district: "Varanasi",
    constituency: "Varanasi Parliamentary",
    category: "Drinking Water & Sanitation",
    sanctionedAmount: 2950000,
    expenditureAmount: 2900000,
    peerMedian: 1700000,
    peerCount: 41,
    deviationPercentage: 74,
    riskScore: 81,
    riskTier: "Critical",
    anomalyTypes: ["cost", "semantic", "geographic"],
    financialYear: "2024-25",
    status: "Escalated",
    implementingAgency: "Vanguard Infra Services Pvt Ltd",
    contractor: "Vanguard Infra",
    sanctionDate: "2024-01-19",
    createdAt: "2026-08-28T16:30:00",
    updatedAt: "2026-09-04T14:00:00",
  },
  {
    workId: "MPL-63218",
    mp_id: "MP-TN-01",
    mp_name: "K. Navaskani",
    description: "Procurement and Installation of Desalination RO Plant, Rameswaram Coast",
    state: "Tamil Nadu",
    district: "Ramanathapuram",
    constituency: "Ramanathapuram Parliamentary",
    category: "Drinking Water & Sanitation",
    sanctionedAmount: 5400000,
    expenditureAmount: 5350000,
    peerMedian: 3100000,
    peerCount: 19,
    deviationPercentage: 74,
    riskScore: 85,
    riskTier: "Critical",
    anomalyTypes: ["cost", "semantic"],
    financialYear: "2024-25",
    status: "Flagged",
    implementingAgency: "Southern Oceanics & Infra Ltd",
    contractor: "Southern Oceanics",
    sanctionDate: "2024-03-12",
    createdAt: "2026-09-01T12:00:00",
    updatedAt: "2026-09-01T12:00:00",
  },
  {
    workId: "MPL-18402",
    mp_id: "MP-KL-01",
    mp_name: "Dr. Shashi Tharoor",
    description: "Construction of Anganwadi Center with Nutrition Storage, Kazhakoottam",
    state: "Kerala",
    district: "Thiruvananthapuram",
    constituency: "Thiruvananthapuram Parliamentary",
    category: "Public Health",
    sanctionedAmount: 1650000,
    expenditureAmount: 1620000,
    peerMedian: 1550000,
    peerCount: 52,
    deviationPercentage: 6,
    riskScore: 18,
    riskTier: "Low",
    anomalyTypes: [],
    financialYear: "2024-25",
    status: "Resolved",
    implementingAgency: "Kerala State Coastal Construction Corp",
    contractor: "KSCC Ltd",
    sanctionDate: "2024-01-10",
    createdAt: "2026-08-30T10:00:00",
    updatedAt: "2026-08-30T10:10:00",
  },
  {
    workId: "MPL-29104",
    mp_id: "MP-GJ-01",
    mp_name: "Hasmukh Patel",
    description: "Solar Panel Installation for Government Primary School",
    state: "Gujarat",
    district: "Ahmedabad",
    constituency: "Ahmedabad East",
    category: "Renewable Energy",
    sanctionedAmount: 1200000,
    expenditureAmount: 1180000,
    peerMedian: 1100000,
    peerCount: 38,
    deviationPercentage: 9,
    riskScore: 22,
    riskTier: "Low",
    anomalyTypes: [],
    financialYear: "2023-24",
    status: "Resolved",
    implementingAgency: "Gujarat Solar Corp",
    contractor: "Gujarat Solar",
    sanctionDate: "2023-11-15",
    createdAt: "2026-08-20T09:00:00",
    updatedAt: "2026-08-25T15:00:00",
  },
  {
    workId: "MPL-44810",
    mp_id: "MP-MH-01",
    mp_name: "Murlidhar Mohol",
    description: "Construction of Public Library and Digital Resource Center",
    state: "Maharashtra",
    district: "Pune",
    constituency: "Pune Parliamentary",
    category: "Education & Culture",
    sanctionedAmount: 2800000,
    expenditureAmount: 2750000,
    peerMedian: 2400000,
    peerCount: 29,
    deviationPercentage: 17,
    riskScore: 34,
    riskTier: "Moderate",
    anomalyTypes: ["pattern"],
    financialYear: "2024-25",
    status: "Dismissed",
    implementingAgency: "Pune Municipal Works",
    contractor: "PMW Division",
    sanctionDate: "2024-01-22",
    createdAt: "2026-08-22T13:00:00",
    updatedAt: "2026-09-01T09:30:00",
  },
  {
    workId: "MPL-50192",
    mp_id: "MP-KA-01",
    mp_name: "P. C. Mohan",
    description: "Renovation of Government Hospital Ward & ICU Equipment",
    state: "Karnataka",
    district: "Bengaluru Urban",
    constituency: "Bangalore Central",
    category: "Public Health",
    sanctionedAmount: 4200000,
    expenditureAmount: 4100000,
    peerMedian: 3800000,
    peerCount: 21,
    deviationPercentage: 11,
    riskScore: 42,
    riskTier: "Moderate",
    anomalyTypes: ["cost"],
    financialYear: "2024-25",
    status: "Triaged",
    implementingAgency: "KHD Infrastructure",
    contractor: "KHD Infra",
    sanctionDate: "2024-02-08",
    createdAt: "2026-09-01T08:00:00",
    updatedAt: "2026-09-02T10:00:00",
  },
  {
    workId: "MPL-67201",
    mp_id: "MP-WB-01",
    mp_name: "Mala Roy",
    description: "Construction of Covered Drain and Sewage Treatment Unit",
    state: "West Bengal",
    district: "Kolkata",
    constituency: "Kolkata South",
    category: "Sanitation & Drainage",
    sanctionedAmount: 3500000,
    expenditureAmount: 3450000,
    peerMedian: 2100000,
    peerCount: 33,
    deviationPercentage: 67,
    riskScore: 71,
    riskTier: "Elevated",
    anomalyTypes: ["cost", "pattern"],
    financialYear: "2024-25",
    status: "Under Review",
    implementingAgency: "Bengal Civil Works Ltd",
    contractor: "BCW Ltd",
    sanctionDate: "2024-03-20",
    createdAt: "2026-09-01T14:00:00",
    updatedAt: "2026-09-03T16:30:00",
  },
  {
    workId: "MPL-81039",
    mp_id: "MP-HR-01",
    mp_name: "Rao Inderjit Singh",
    description: "Village Playground and Open Gymnasium Equipment Installation",
    state: "Haryana",
    district: "Gurugram",
    constituency: "Gurugram Parliamentary",
    category: "Sports & Recreation",
    sanctionedAmount: 1800000,
    expenditureAmount: 1780000,
    peerMedian: 1400000,
    peerCount: 44,
    deviationPercentage: 29,
    riskScore: 38,
    riskTier: "Moderate",
    anomalyTypes: ["cost"],
    financialYear: "2023-24",
    status: "Resolved",
    implementingAgency: "Haryana Rural Dev Board",
    contractor: "HRDB Contractor",
    sanctionDate: "2023-12-01",
    createdAt: "2026-08-15T11:00:00",
    updatedAt: "2026-08-28T09:00:00",
  },
  {
    workId: "MPL-92104",
    mp_id: "MP-MP-01",
    mp_name: "Alok Kumar Verma",
    description: "Bus Shelter Construction with Solar Powered Lighting",
    state: "Madhya Pradesh",
    district: "Sehore",
    constituency: "Bhopal Parliamentary",
    category: "Transport Infrastructure",
    sanctionedAmount: 2200000,
    expenditureAmount: 2180000,
    peerMedian: 1200000,
    peerCount: 31,
    deviationPercentage: 83,
    riskScore: 78,
    riskTier: "Elevated",
    anomalyTypes: ["cost", "geographic"],
    financialYear: "2024-25",
    status: "Flagged",
    implementingAgency: "M/s Apex Rural Infra Projects Ltd",
    contractor: "Apex Rural Infra",
    sanctionDate: "2024-03-25",
    createdAt: "2026-09-02T11:30:00",
    updatedAt: "2026-09-02T11:30:00",
  },
  {
    workId: "MPL-33019",
    mp_id: "MP-BR-01",
    mp_name: "Ravi Shankar Prasad",
    description: "Gram Panchayat Bhawan Construction with Meeting Hall",
    state: "Bihar",
    district: "Patna",
    constituency: "Patna Sahib",
    category: "Community Infrastructure",
    sanctionedAmount: 3100000,
    expenditureAmount: 3050000,
    peerMedian: 1800000,
    peerCount: 39,
    deviationPercentage: 72,
    riskScore: 69,
    riskTier: "Elevated",
    anomalyTypes: ["cost", "semantic"],
    financialYear: "2024-25",
    status: "Triaged",
    implementingAgency: "Bihar Construction Corp",
    contractor: "BCC Projects",
    sanctionDate: "2024-02-20",
    createdAt: "2026-09-01T10:00:00",
    updatedAt: "2026-09-02T14:00:00",
  },
  {
    workId: "MPL-77502",
    mp_id: "MP-UP-02",
    mp_name: "Rajnath Singh",
    description: "Footbridge Over Canal with Approach Road",
    state: "Uttar Pradesh",
    district: "Lucknow",
    constituency: "Lucknow Parliamentary",
    category: "Rural Connectivity",
    sanctionedAmount: 2600000,
    expenditureAmount: 2550000,
    peerMedian: 2200000,
    peerCount: 27,
    deviationPercentage: 18,
    riskScore: 45,
    riskTier: "Moderate",
    anomalyTypes: ["pattern"],
    financialYear: "2023-24",
    status: "Dismissed",
    implementingAgency: "UP PWD Div-II",
    contractor: "UP PWD",
    sanctionDate: "2023-10-05",
    createdAt: "2026-08-10T08:00:00",
    updatedAt: "2026-08-20T11:00:00",
  },
  {
    workId: "MPL-10284",
    mp_id: "MP-AP-01",
    mp_name: "M. Sribharat",
    description: "Construction of SC/ST Community Welfare Center",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    constituency: "Visakhapatnam Parliamentary",
    category: "Community Infrastructure",
    sanctionedAmount: 3400000,
    expenditureAmount: 3350000,
    peerMedian: 2000000,
    peerCount: 36,
    deviationPercentage: 70,
    riskScore: 74,
    riskTier: "Elevated",
    anomalyTypes: ["cost", "geographic"],
    financialYear: "2024-25",
    status: "Under Review",
    implementingAgency: "AP Rural Works Dept",
    contractor: "AP Rural Works",
    sanctionDate: "2024-01-30",
    createdAt: "2026-09-01T07:00:00",
    updatedAt: "2026-09-03T13:00:00",
  },
  {
    workId: "MPL-85410",
    mp_id: "MP-OD-01",
    mp_name: "Aparajita Sarangi",
    description: "Public Toilet Complex with Biogas Plant",
    state: "Odisha",
    district: "Bhubaneswar",
    constituency: "Bhubaneswar Parliamentary",
    category: "Sanitation & Drainage",
    sanctionedAmount: 1900000,
    expenditureAmount: 1870000,
    peerMedian: 1600000,
    peerCount: 45,
    deviationPercentage: 19,
    riskScore: 28,
    riskTier: "Low",
    anomalyTypes: [],
    financialYear: "2023-24",
    status: "Resolved",
    implementingAgency: "Odisha Municipal Corp",
    contractor: "OMC Works",
    sanctionDate: "2023-09-12",
    createdAt: "2026-08-05T09:00:00",
    updatedAt: "2026-08-15T10:00:00",
  },
  {
    workId: "MPL-42199",
    mp_id: "MP-TN-02",
    mp_name: "Dayanidhi Maran",
    description: "Boundary Wall and Gate Construction for Govt Higher Secondary School",
    state: "Tamil Nadu",
    district: "Chennai",
    constituency: "Chennai Central",
    category: "Education & Culture",
    sanctionedAmount: 2100000,
    expenditureAmount: 2080000,
    peerMedian: 1500000,
    peerCount: 42,
    deviationPercentage: 40,
    riskScore: 55,
    riskTier: "Moderate",
    anomalyTypes: ["cost"],
    financialYear: "2024-25",
    status: "Triaged",
    implementingAgency: "Chennai Corp Eng Dept",
    contractor: "CCED Div",
    sanctionDate: "2024-01-05",
    createdAt: "2026-08-28T14:00:00",
    updatedAt: "2026-09-01T08:00:00",
  },
  {
    workId: "MPL-59820",
    mp_id: "MP-TG-01",
    mp_name: "Asaduddin Owaisi",
    description: "Installation of CCTV Surveillance System at Market Complex",
    state: "Telangana",
    district: "Hyderabad",
    constituency: "Hyderabad Parliamentary",
    category: "Public Safety",
    sanctionedAmount: 2400000,
    expenditureAmount: 2380000,
    peerMedian: 1800000,
    peerCount: 23,
    deviationPercentage: 33,
    riskScore: 48,
    riskTier: "Moderate",
    anomalyTypes: ["cost", "pattern"],
    financialYear: "2024-25",
    status: "Flagged",
    implementingAgency: "Hyderabad Smart City SPV",
    contractor: "HSC SPV",
    sanctionDate: "2024-03-01",
    createdAt: "2026-09-01T15:00:00",
    updatedAt: "2026-09-01T15:00:00",
  },
  {
    workId: "MPL-15903",
    mp_id: "MP-RJ-02",
    mp_name: "Gajendra Singh Shekhawat",
    description: "Cremation Ground Upgradation with Shed and Water Facility",
    state: "Rajasthan",
    district: "Jodhpur",
    constituency: "Jodhpur Parliamentary",
    category: "Community Infrastructure",
    sanctionedAmount: 1400000,
    expenditureAmount: 1380000,
    peerMedian: 1200000,
    peerCount: 51,
    deviationPercentage: 17,
    riskScore: 25,
    riskTier: "Low",
    anomalyTypes: [],
    financialYear: "2023-24",
    status: "Resolved",
    implementingAgency: "Jodhpur Nagar Nigam",
    contractor: "JNN Works",
    sanctionDate: "2023-08-20",
    createdAt: "2026-08-01T10:00:00",
    updatedAt: "2026-08-10T09:00:00",
  },
];

// ─── Dynamic Aggregation for Active Dataset ──────────────────────────────────

export const SYSTEM_STATS = calculateDatasetMetrics(SEED_MPS, WORKS);

// ─── Query Functions ─────────────────────────────────────────────────────────

export function getWorkById(id: string): Work | undefined {
  return WORKS.find((w) => w.workId === id);
}

export function getMPById(id: string): MP | undefined {
  return SEED_MPS.find((m) => m.mp_id === id);
}

export function getWorksByMPId(mpId: string): Work[] {
  return WORKS.filter((w) => w.mp_id === mpId);
}

export function getInvestigationByWorkId(workId: string): Investigation | undefined {
  return INVESTIGATIONS.find((inv) => inv.workId === workId);
}

export function getRelatedWorks(workId: string): RelatedWork[] {
  return RELATED_WORKS.filter((r) => r.workId === workId);
}

// ─── Investigations ──────────────────────────────────────────────────────────

export const INVESTIGATIONS: Investigation[] = [
  {
    investigationId: "INV-001",
    workId: "MPL-48291",
    riskScore: 87,
    status: "Flagged",
    assignedTo: "Dr. K. S. Ramanathan",
    primarySignal: "Cost deviation +184% vs peer baseline",
    notes: [
      { id: "n1", timestamp: "2026-09-03T14:45:00", author: "Dr. K. S. Ramanathan", content: "Preliminary review confirms cost disparity. Notice issued to district nodal officer requesting geo-tagged milestone photos." },
    ],
    evidence: [
      { id: "e1", type: "calculation", title: "Robust Z-Score Analysis", description: "Z = 3.42 against district+category peer group of 34 comparable works.", addedAt: "2026-09-02T11:20:00", addedBy: "System" },
      { id: "e2", type: "comparison", title: "Semantic DPR Match", description: "92% textual overlap with MPL-38192 milestone descriptions.", addedAt: "2026-09-02T11:21:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t1", timestamp: "2026-09-02T11:20:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-48291", result: "Risk score 87/100. Cost outlier + semantic match flagged." },
      { id: "t2", timestamp: "2026-09-02T11:21:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Peer baseline calculated", object: "MPL-48291", result: "34 comparable works. Median ₹17.0L. Deviation +184%." },
      { id: "t3", timestamp: "2026-09-02T11:22:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Semantic similarity analysis", object: "MPL-48291 vs MPL-38192", result: "92% cosine similarity in DPR text." },
      { id: "t4", timestamp: "2026-09-03T09:45:00", actor: "Dr. K. S. Ramanathan", actorType: "investigator", action: "Investigator opened case", object: "INV-001", result: "Case assigned for preliminary review." },
      { id: "t5", timestamp: "2026-09-03T14:45:00", actor: "Dr. K. S. Ramanathan", actorType: "investigator", action: "Evidence note added", object: "INV-001", result: "Notice issued to district nodal officer." },
    ],
    anomalyFlags: [
      { type: "cost", severity: "critical", title: "Cost Variance vs Peer Median", summary: "Sanctioned cost is substantially higher than comparable works in the same category and peer region.", metric: "+184% above median", peerComparison: "Peer median: ₹17.0L vs Sanctioned: ₹48.2L" },
      { type: "semantic", severity: "elevated", title: "High Semantic Similarity", summary: "92% textual overlap with MPL-38192 milestone descriptions in adjacent Gram Panchayat.", metric: "92% semantic match", peerComparison: "Threshold: >80% triggers flag" },
    ],
    peerDistribution: [
      { label: "P10", amount: 1200000 },
      { label: "P25", amount: 1450000 },
      { label: "Peer Median", amount: 1700000 },
      { label: "P75", amount: 2100000 },
      { label: "P90", amount: 2800000 },
      { label: "This Work", amount: 4820000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 92, peerBaseline: 30 },
      { dimension: "Semantic Overlap", thisWork: 87, peerBaseline: 20 },
      { dimension: "Constituency Clust.", thisWork: 78, peerBaseline: 25 },
      { dimension: "Vendor Concentration", thisWork: 85, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 74, peerBaseline: 40 },
    ],
  },
  {
    investigationId: "INV-002",
    workId: "MPL-38192",
    riskScore: 82,
    status: "Under Review",
    assignedTo: "S. Pillai",
    primarySignal: "92% semantic similarity with MPL-48291",
    notes: [],
    evidence: [
      { id: "e3", type: "comparison", title: "DPR Text Comparison", description: "Identical milestone text detected across two different sanctions.", addedAt: "2026-09-02T11:22:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t6", timestamp: "2026-09-02T11:22:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-38192", result: "Semantic overlap with MPL-48291." },
      { id: "t7", timestamp: "2026-09-04T09:30:00", actor: "S. Pillai", actorType: "investigator", action: "Case opened for review", object: "INV-002", result: "Under Review status." },
    ],
    anomalyFlags: [
      { type: "semantic", severity: "critical", title: "Potential Duplicate Work", summary: "Near-identical milestone descriptions to MPL-48291, sanctioned 14 days apart.", metric: "92% semantic match", peerComparison: "Same agency, adjacent block." },
      { type: "cost", severity: "elevated", title: "Cost Above Peer Median", summary: "Sanctioned amount exceeds comparable works.", metric: "+171%", peerComparison: "Peer median: ₹17.0L vs Sanctioned: ₹46.0L" },
      { type: "geographic", severity: "moderate", title: "Constituency Proximity", summary: "Located in same Gram Panchayat block with same contractor.", metric: "Adjacent block", peerComparison: "Same constituency cluster." },
    ],
    peerDistribution: [
      { label: "P10", amount: 1200000 },
      { label: "P25", amount: 1450000 },
      { label: "Peer Median", amount: 1700000 },
      { label: "P75", amount: 2100000 },
      { label: "P90", amount: 2800000 },
      { label: "This Work", amount: 4600000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 88, peerBaseline: 30 },
      { dimension: "Semantic Overlap", thisWork: 92, peerBaseline: 20 },
      { dimension: "Constituency Clust.", thisWork: 72, peerBaseline: 25 },
      { dimension: "Vendor Concentration", thisWork: 85, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 68, peerBaseline: 40 },
    ],
  },
  {
    investigationId: "INV-003",
    workId: "MPL-72819",
    riskScore: 72,
    status: "Flagged",
    assignedTo: "Unassigned",
    primarySignal: "Tender splitting pattern — 5 road works below ₹40L committee threshold",
    notes: [],
    evidence: [
      { id: "e4", type: "calculation", title: "Tender Splitting Analysis", description: "5 road segments sanctioned at ₹37.5L–₹39.5L, all below ₹40L committee threshold.", addedAt: "2026-09-02T17:00:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t8", timestamp: "2026-09-02T17:00:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-72819", result: "Tender splitting pattern near threshold." },
    ],
    anomalyFlags: [
      { type: "geographic", severity: "elevated", title: "Constituency Concentration", summary: "5 similar road works within same corridor, all sanctioned within 3 weeks.", metric: "Corridor cluster", peerComparison: "Regional norm: 1.2 works per block." },
      { type: "pattern", severity: "moderate", title: "Fiscal Year-End Clustering", summary: "All sanctions approved in final week of March.", metric: "March 20–28", peerComparison: "Normal approval spread: 42 days." },
    ],
    peerDistribution: [
      { label: "P10", amount: 2800000 },
      { label: "P25", amount: 3100000 },
      { label: "Peer Median", amount: 3400000 },
      { label: "P75", amount: 3650000 },
      { label: "P90", amount: 3950000 },
      { label: "This Work", amount: 3800000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 48, peerBaseline: 35 },
      { dimension: "Semantic Overlap", thisWork: 35, peerBaseline: 25 },
      { dimension: "Constituency Clust.", thisWork: 72, peerBaseline: 30 },
      { dimension: "Vendor Concentration", thisWork: 50, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 65, peerBaseline: 40 },
    ],
  },
  {
    investigationId: "INV-004",
    workId: "MPL-55301",
    riskScore: 81,
    status: "Escalated",
    assignedTo: "District Vigilance Cell",
    primarySignal: "Co-location with Jal Jeevan Mission asset",
    notes: [
      { id: "n2", timestamp: "2026-09-04T14:00:00", author: "Vigilance Officer R. Singh", content: "Field team dispatched. Preliminary report expected within 7 working days." },
    ],
    evidence: [
      { id: "e5", type: "comparison", title: "Cross-Scheme Co-location", description: "Identical site location with operational JJM water ATM installed 2022.", addedAt: "2026-08-28T16:30:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t9", timestamp: "2026-08-28T16:30:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-55301", result: "Cross-scheme match with JJM database." },
      { id: "t10", timestamp: "2026-09-01T10:00:00", actor: "S. Pillai", actorType: "investigator", action: "Case triaged", object: "INV-004", result: "Priority: High. Cross-scheme overlap confirmed." },
      { id: "t11", timestamp: "2026-09-03T11:30:00", actor: "Dr. K. S. Ramanathan", actorType: "supervisor", action: "Case escalated", object: "INV-004", result: "Referred to District Vigilance Cell." },
      { id: "t12", timestamp: "2026-09-04T14:00:00", actor: "R. Singh (DVC)", actorType: "investigator", action: "Evidence added", object: "INV-004", result: "Field inspection order issued." },
    ],
    anomalyFlags: [
      { type: "semantic", severity: "critical", title: "Asset Co-location", summary: "Identical site location with operational central scheme water ATM.", metric: "Co-location", peerComparison: "Potential duplicate asset on identical parcel." },
      { type: "cost", severity: "elevated", title: "Drilling Depth Discrepancy", summary: "Quoted 350ft in alluvial basin where aquifer documented at 140ft.", metric: "+74% vs norm", peerComparison: "CGWB baseline: 140–160ft." },
    ],
    peerDistribution: [
      { label: "P10", amount: 1200000 },
      { label: "P25", amount: 1450000 },
      { label: "Peer Median", amount: 1700000 },
      { label: "P75", amount: 2050000 },
      { label: "P90", amount: 2350000 },
      { label: "This Work", amount: 2950000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 81, peerBaseline: 25 },
      { dimension: "Semantic Overlap", thisWork: 93, peerBaseline: 18 },
      { dimension: "Constituency Clust.", thisWork: 88, peerBaseline: 22 },
      { dimension: "Vendor Concentration", thisWork: 60, peerBaseline: 30 },
      { dimension: "Timeline Compression", thisWork: 62, peerBaseline: 38 },
    ],
  },
  {
    investigationId: "INV-005",
    workId: "MPL-63218",
    riskScore: 85,
    status: "Flagged",
    assignedTo: "Unassigned",
    primarySignal: "DPR text reuse (91%) + capital cost +74%",
    notes: [],
    evidence: [
      { id: "e6", type: "comparison", title: "DPR Reuse Detection", description: "91% identical text with Nagapattinam DPR from 2023.", addedAt: "2026-09-01T12:00:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t13", timestamp: "2026-09-01T12:00:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-63218", result: "DPR text reuse and cost benchmark violation." },
    ],
    anomalyFlags: [
      { type: "cost", severity: "critical", title: "Capital Cost Discrepancy", summary: "Capital procurement cost exceeds coastal utility benchmarks by +74%.", metric: "+74% vs benchmark", peerComparison: "Peer: ₹31.0L vs Sanctioned: ₹54.0L." },
      { type: "semantic", severity: "elevated", title: "Cross-District DPR Reuse", summary: "91% identical DPR text with Nagapattinam project from prior year.", metric: "91% match", peerComparison: "Source: MPL-2023-0491." },
    ],
    peerDistribution: [
      { label: "P10", amount: 2400000 },
      { label: "P25", amount: 2800000 },
      { label: "Peer Median", amount: 3100000 },
      { label: "P75", amount: 3700000 },
      { label: "P90", amount: 4200000 },
      { label: "This Work", amount: 5400000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 88, peerBaseline: 28 },
      { dimension: "Semantic Overlap", thisWork: 91, peerBaseline: 20 },
      { dimension: "Constituency Clust.", thisWork: 62, peerBaseline: 25 },
      { dimension: "Vendor Concentration", thisWork: 70, peerBaseline: 30 },
      { dimension: "Timeline Compression", thisWork: 75, peerBaseline: 35 },
    ],
  },
  {
    investigationId: "INV-006",
    workId: "MPL-91024",
    riskScore: 76,
    status: "Triaged",
    assignedTo: "S. Pillai",
    primarySignal: "Equipment rate +73% vs PWD SoR",
    notes: [],
    evidence: [
      { id: "e7", type: "calculation", title: "PWD SoR Comparison", description: "Per-unit fixture cost ₹83K vs state schedule ₹48K.", addedAt: "2026-09-01T09:15:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t14", timestamp: "2026-09-01T09:15:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-91024", result: "Equipment procurement rate above PWD schedule." },
      { id: "t15", timestamp: "2026-09-03T11:00:00", actor: "S. Pillai", actorType: "investigator", action: "Case triaged", object: "INV-006", result: "Vendor concentration review initiated." },
    ],
    anomalyFlags: [
      { type: "cost", severity: "elevated", title: "Equipment Rate Discrepancy", summary: "Per-unit fixture cost 73% above state PWD SoR.", metric: "+73% vs SoR", peerComparison: "₹48K/pole (SoR) vs ₹83K/pole (sanctioned)." },
      { type: "pattern", severity: "moderate", title: "Vendor Concentration", summary: "Agency won 11 of 14 solar lighting sanctions in 6 months.", metric: "78.5% win rate", peerComparison: "Expected: max 35%." },
    ],
    peerDistribution: [
      { label: "P10", amount: 1400000 },
      { label: "P25", amount: 1650000 },
      { label: "Peer Median", amount: 1850000 },
      { label: "P75", amount: 2200000 },
      { label: "P90", amount: 2600000 },
      { label: "This Work", amount: 3200000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 78, peerBaseline: 28 },
      { dimension: "Semantic Overlap", thisWork: 42, peerBaseline: 22 },
      { dimension: "Constituency Clust.", thisWork: 65, peerBaseline: 30 },
      { dimension: "Vendor Concentration", thisWork: 82, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 50, peerBaseline: 40 },
    ],
  },
];

// ─── Related Works ───────────────────────────────────────────────────────────

export const RELATED_WORKS: RelatedWork[] = [
  { workId: "MPL-48291", relatedWorkId: "MPL-38192", similarityScore: 0.92, categoryMatch: true, costDifference: 220000, relatedDescription: "Construction of Community Centre with Integrated Training Facility", relatedConstituency: "Bhopal Parliamentary", relatedAmount: 4600000, relationshipType: "semantic", administrativeOverlap: "Same Block & Implementing Agency" },
  { workId: "MPL-48291", relatedWorkId: "MPL-92104", similarityScore: 0.41, categoryMatch: false, costDifference: 2620000, relatedDescription: "Bus Shelter Construction with Solar Powered Lighting", relatedConstituency: "Bhopal Parliamentary", relatedAmount: 2200000, relationshipType: "constituency", administrativeOverlap: "Same Parliamentary Constituency Corridor" },
  { workId: "MPL-38192", relatedWorkId: "MPL-48291", similarityScore: 0.92, categoryMatch: true, costDifference: 220000, relatedDescription: "Construction of Multi-Purpose Community Hall & Solar Microgrid", relatedConstituency: "Bhopal Parliamentary", relatedAmount: 4820000, relationshipType: "semantic", administrativeOverlap: "Same Block & Implementing Agency" },
  { workId: "MPL-55301", relatedWorkId: "MPL-55301-JJM", similarityScore: 0.93, categoryMatch: true, costDifference: 850000, relatedDescription: "Community RO Water Purification Unit (Jal Jeevan Mission)", relatedConstituency: "Varanasi Parliamentary", relatedAmount: 2100000, relationshipType: "constituency", administrativeOverlap: "Identical Gram Panchayat Parcel (JJM Registry Overlap)" },
  { workId: "MPL-63218", relatedWorkId: "MPL-2023-0491", similarityScore: 0.91, categoryMatch: true, costDifference: 2000000, relatedDescription: "RO Desalination Unit, Nagapattinam Coastal Taluk", relatedConstituency: "Nagapattinam Parliamentary", relatedAmount: 3400000, relationshipType: "semantic", administrativeOverlap: "Adjacent Coastal Taluk Specification" },
];

// ─── All Audit Events (chronological, system-wide) ───────────────────────────

export const ALL_AUDIT_EVENTS: AuditEvent[] = [
  ...INVESTIGATIONS.flatMap((inv) => inv.timeline),
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ─── Validation Metrics ──────────────────────────────────────────────────────

export const VALIDATION_METRICS = [
  { model: "Cost Outlier Detector (Robust Z / MAD)", precision: 0.912, recall: 0.884, f1Score: 0.898, benchmarkCases: 1450, lastCalibrated: "2026-08-15" },
  { model: "Semantic Text & DPR Overlap (Embeddings + Cosine)", precision: 0.945, recall: 0.862, f1Score: 0.902, benchmarkCases: 820, lastCalibrated: "2026-08-20" },
  { model: "Constituency & Vendor Monopolies (Clustering)", precision: 0.887, recall: 0.921, f1Score: 0.904, benchmarkCases: 640, lastCalibrated: "2026-08-28" },
  { model: "Tender Splitting & Fiscal Clustering", precision: 0.864, recall: 0.890, f1Score: 0.877, benchmarkCases: 1100, lastCalibrated: "2026-09-01" },
];
