// =============================================================================
// ArthaSentinel V2.4 — Full Frontend Data Model
// MPLADS Anomaly Detection & Investigation Platform (SIH26102)
// =============================================================================
// ALL DATA IS SYNTHETIC. Labels marked "demo" or "synthetic" where displayed.
// =============================================================================

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface Work {
  workId: string;
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
  latitude: number;
  longitude: number;
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
  distance: number;
  categoryMatch: boolean;
  costDifference: number;
  relatedDescription: string;
  relatedConstituency: string;
  relatedAmount: number;
  relationshipType: "semantic" | "geographic" | "vendor" | "pattern";
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "system" | "investigator" | "supervisor";
  action: string;
  object: string;
  result: string;
}

export interface MapCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  workIds: string[];
  totalWorks: number;
  flaggedCost: number;
  highlySimilar: number;
  underInvestigation: number;
  label: string;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

export function formatCurrency(val: number): string {
  if (val >= 10000000) return "₹" + (val / 10000000).toFixed(2) + " Cr";
  return "₹" + (val / 100000).toFixed(1) + "L";
}

export function formatCurrencyFull(val: number): string {
  return "₹" + val.toLocaleString("en-IN");
}

export function getRiskTier(score: number): Work["riskTier"] {
  if (score >= 80) return "Critical";
  if (score >= 60) return "Elevated";
  if (score >= 30) return "Moderate";
  return "Low";
}

export function getWorkById(id: string): Work | undefined {
  return WORKS.find((w) => w.workId === id);
}

export function getInvestigationByWorkId(workId: string): Investigation | undefined {
  return INVESTIGATIONS.find((inv) => inv.workId === workId);
}

export function getRelatedWorks(workId: string): RelatedWork[] {
  return RELATED_WORKS.filter((r) => r.workId === workId);
}

export function getInvestigationsByStatus(status?: string): Investigation[] {
  if (!status || status === "ALL") return INVESTIGATIONS;
  return INVESTIGATIONS.filter((inv) => inv.status === status);
}

// ─── System Stats ────────────────────────────────────────────────────────────

export const SYSTEM_STATS = {
  totalWorksAnalyzed: 10482,
  potentialAnomalies: 247,
  highRisk: 38,
  priorityInvestigations: 12,
  districtsCovered: 36,
  statesCovered: 8,
  flaggedThisCycle: 14,
  worksIndexed: 1248320,
};

// ─── Works Dataset (20+ realistic MPLADS entries) ────────────────────────────

export const WORKS: Work[] = [
  {
    workId: "MPL-48291",
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
    latitude: 23.2032,
    longitude: 77.0844,
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
    latitude: 23.1879,
    longitude: 77.0756,
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
    latitude: 26.9855,
    longitude: 75.8513,
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
    latitude: 22.7196,
    longitude: 75.8577,
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
    latitude: 25.3176,
    longitude: 82.9739,
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
    latitude: 9.2876,
    longitude: 79.3129,
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
    latitude: 8.5686,
    longitude: 76.8731,
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
    latitude: 23.0225,
    longitude: 72.5714,
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
    latitude: 18.5204,
    longitude: 73.8567,
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
    latitude: 12.9716,
    longitude: 77.5946,
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
    latitude: 22.5726,
    longitude: 88.3639,
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
    latitude: 28.4595,
    longitude: 77.0266,
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
    latitude: 23.1950,
    longitude: 77.0900,
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
    latitude: 25.6093,
    longitude: 85.1376,
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
    latitude: 26.8467,
    longitude: 80.9462,
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
    latitude: 17.6868,
    longitude: 83.2185,
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
    latitude: 20.2961,
    longitude: 85.8245,
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
    latitude: 13.0827,
    longitude: 80.2707,
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
    latitude: 17.3850,
    longitude: 78.4867,
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
    latitude: 26.2389,
    longitude: 73.0243,
    financialYear: "2023-24",
    status: "Resolved",
    implementingAgency: "Jodhpur Nagar Nigam",
    contractor: "JNN Works",
    sanctionDate: "2023-08-20",
    createdAt: "2026-08-01T10:00:00",
    updatedAt: "2026-08-10T09:00:00",
  },
];

// ─── Investigations (linked to flagged/active works) ─────────────────────────

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
      { dimension: "Spatial Clustering", thisWork: 78, peerBaseline: 25 },
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
      { type: "geographic", severity: "moderate", title: "Spatial Proximity", summary: "Located 1.8km from MPL-48291 with same contractor.", metric: "1.8km distance", peerComparison: "Same constituency cluster." },
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
      { dimension: "Spatial Clustering", thisWork: 72, peerBaseline: 25 },
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
    primarySignal: "Geographic outlier — cluster of 5 road works near FY boundary",
    notes: [],
    evidence: [
      { id: "e4", type: "calculation", title: "Tender Splitting Analysis", description: "5 road segments sanctioned at ₹37.5L–₹39.5L, all below ₹40L committee threshold.", addedAt: "2026-09-02T17:00:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t8", timestamp: "2026-09-02T17:00:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-72819", result: "Tender splitting pattern near threshold." },
    ],
    anomalyFlags: [
      { type: "geographic", severity: "elevated", title: "Geographic Concentration", summary: "5 similar road works within 8.5km corridor, all sanctioned within 3 weeks.", metric: "8.5km cluster", peerComparison: "Regional norm: 1.2 works per 10km." },
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
      { dimension: "Spatial Clustering", thisWork: 72, peerBaseline: 30 },
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
    primarySignal: "Exact co-location with Jal Jeevan Mission asset",
    notes: [
      { id: "n2", timestamp: "2026-09-04T14:00:00", author: "Vigilance Officer R. Singh", content: "Field team dispatched. Preliminary report expected within 7 working days." },
    ],
    evidence: [
      { id: "e5", type: "comparison", title: "Cross-Scheme Co-location", description: "GPS overlap within 18m of operational JJM water ATM installed 2022.", addedAt: "2026-08-28T16:30:00", addedBy: "System" },
    ],
    timeline: [
      { id: "t9", timestamp: "2026-08-28T16:30:00", actor: "ArthaSentinel V2.4", actorType: "system", action: "Anomaly detected", object: "MPL-55301", result: "Cross-scheme spatial match with JJM database." },
      { id: "t10", timestamp: "2026-09-01T10:00:00", actor: "S. Pillai", actorType: "investigator", action: "Case triaged", object: "INV-004", result: "Priority: High. Cross-scheme overlap confirmed." },
      { id: "t11", timestamp: "2026-09-03T11:30:00", actor: "Dr. K. S. Ramanathan", actorType: "supervisor", action: "Case escalated", object: "INV-004", result: "Referred to District Vigilance Cell." },
      { id: "t12", timestamp: "2026-09-04T14:00:00", actor: "R. Singh (DVC)", actorType: "investigator", action: "Evidence added", object: "INV-004", result: "Field inspection order issued." },
    ],
    anomalyFlags: [
      { type: "semantic", severity: "critical", title: "Exact Asset Co-location", summary: "GPS coordinates overlap within 18m of operational central scheme water ATM.", metric: "18m overlap", peerComparison: "Potential duplicate asset on identical parcel." },
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
      { dimension: "Spatial Clustering", thisWork: 88, peerBaseline: 22 },
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
      { dimension: "Spatial Clustering", thisWork: 62, peerBaseline: 25 },
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
      { dimension: "Spatial Clustering", thisWork: 65, peerBaseline: 30 },
      { dimension: "Vendor Concentration", thisWork: 82, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 50, peerBaseline: 40 },
    ],
  },
];

// ─── Related Works ───────────────────────────────────────────────────────────

export const RELATED_WORKS: RelatedWork[] = [
  { workId: "MPL-48291", relatedWorkId: "MPL-38192", similarityScore: 0.92, distance: 1.8, categoryMatch: true, costDifference: 220000, relatedDescription: "Construction of Community Centre with Integrated Training Facility", relatedConstituency: "Bhopal Parliamentary", relatedAmount: 4600000, relationshipType: "semantic" },
  { workId: "MPL-48291", relatedWorkId: "MPL-92104", similarityScore: 0.41, distance: 0.9, categoryMatch: false, costDifference: 2620000, relatedDescription: "Bus Shelter Construction with Solar Powered Lighting", relatedConstituency: "Bhopal Parliamentary", relatedAmount: 2200000, relationshipType: "geographic" },
  { workId: "MPL-38192", relatedWorkId: "MPL-48291", similarityScore: 0.92, distance: 1.8, categoryMatch: true, costDifference: 220000, relatedDescription: "Construction of Multi-Purpose Community Hall & Solar Microgrid", relatedConstituency: "Bhopal Parliamentary", relatedAmount: 4820000, relationshipType: "semantic" },
  { workId: "MPL-55301", relatedWorkId: "MPL-55301-JJM", similarityScore: 0.93, distance: 0.018, categoryMatch: true, costDifference: 850000, relatedDescription: "Community RO Water Purification Unit (Jal Jeevan Mission)", relatedConstituency: "Varanasi Parliamentary", relatedAmount: 2100000, relationshipType: "geographic" },
  { workId: "MPL-63218", relatedWorkId: "MPL-2023-0491", similarityScore: 0.91, distance: 280, categoryMatch: true, costDifference: 2000000, relatedDescription: "RO Desalination Unit, Nagapattinam Coastal Taluk", relatedConstituency: "Nagapattinam Parliamentary", relatedAmount: 3400000, relationshipType: "semantic" },
];

// ─── Map Clusters ────────────────────────────────────────────────────────────

export const MAP_CLUSTERS: MapCluster[] = [
  { id: "CL-01", centerLat: 23.195, centerLng: 77.083, workIds: ["MPL-48291", "MPL-38192", "MPL-92104"], totalWorks: 7, flaggedCost: 4, highlySimilar: 2, underInvestigation: 1, label: "Bhopal–Sehore Cluster" },
  { id: "CL-02", centerLat: 25.32, centerLng: 82.97, workIds: ["MPL-55301"], totalWorks: 3, flaggedCost: 1, highlySimilar: 1, underInvestigation: 1, label: "Varanasi Cross-Scheme Zone" },
  { id: "CL-03", centerLat: 22.72, centerLng: 75.86, workIds: ["MPL-91024"], totalWorks: 4, flaggedCost: 2, highlySimilar: 0, underInvestigation: 0, label: "Indore Solar Lighting Cluster" },
  { id: "CL-04", centerLat: 26.99, centerLng: 75.85, workIds: ["MPL-72819"], totalWorks: 5, flaggedCost: 3, highlySimilar: 0, underInvestigation: 0, label: "Jaipur Road Works Corridor" },
];

// ─── All Audit Events (chronological, system-wide) ───────────────────────────

export const ALL_AUDIT_EVENTS: AuditEvent[] = [
  ...INVESTIGATIONS.flatMap((inv) => inv.timeline),
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ─── Validation Metrics ──────────────────────────────────────────────────────

export const VALIDATION_METRICS = [
  { model: "Cost Outlier Detector (Robust Z / MAD)", precision: 0.912, recall: 0.884, f1Score: 0.898, benchmarkCases: 1450, lastCalibrated: "2026-08-15" },
  { model: "Semantic Text & DPR Overlap (Embeddings + Cosine)", precision: 0.945, recall: 0.862, f1Score: 0.902, benchmarkCases: 820, lastCalibrated: "2026-08-20" },
  { model: "Spatial Clustering & Asset Co-location (DBSCAN)", precision: 0.887, recall: 0.921, f1Score: 0.904, benchmarkCases: 640, lastCalibrated: "2026-08-28" },
  { model: "Tender Splitting & Fiscal Clustering", precision: 0.864, recall: 0.890, f1Score: 0.877, benchmarkCases: 1100, lastCalibrated: "2026-09-01" },
];
