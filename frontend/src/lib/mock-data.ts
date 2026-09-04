export interface AnomalyFlag {
  type: "cost" | "duplicate" | "geographic" | "pattern";
  severity: "moderate" | "elevated" | "critical";
  title: string;
  summary: string;
  metric: string;
  peerComparison: string;
}

export interface DuplicateCandidate {
  id: string;
  title: string;
  similarityScore: number;
  constituency: string;
  sanctionedAmount: number;
  status: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: "FLAGGED_INITIAL" | "REVIEWED_NO_ISSUE" | "ESCALATED" | "NOTE_ADDED";
  notes: string;
}

export interface Work {
  id: string;
  title: string;
  category: string;
  constituency: string;
  district: string;
  state: string;
  sanctionedAmount: number;
  expenditureAmount: number;
  peerMedianAmount: number;
  implementingAgency: string;
  contractor: string;
  sanctionDate: string;
  status: "Flagged for Review" | "Under Review" | "Reviewed - No Issue" | "Escalated for Field Inspection";
  compositeRiskScore: number;
  riskTier: "Low" | "Moderate" | "Elevated" | "Critical";
  anomalyFlags: AnomalyFlag[];
  duplicateCandidates: DuplicateCandidate[];
  peerDistribution: { label: string; amount: number; isThisWork?: boolean }[];
  radarMetrics: { dimension: string; thisWork: number; peerBaseline: number }[];
  auditTrail: AuditRecord[];
  coordinates: { lat: number; lng: number };
  clusterDistanceKm: number;
  contractorConcentrationRatio: number;
}

export const MOCK_WORKS: Work[] = [
  {
    id: "WRK-MPLADS-2024-0419",
    title: "Construction of Multi-Purpose Community Hall & Solar Microgrid, Block Sehore",
    category: "Community Infrastructure",
    constituency: "Bhopal Parliamentary",
    district: "Sehore",
    state: "Madhya Pradesh",
    sanctionedAmount: 4850000,
    expenditureAmount: 4810000,
    peerMedianAmount: 2600000,
    implementingAgency: "M/s Apex Rural Infra Projects Ltd",
    contractor: "Apex Rural Infra",
    sanctionDate: "2024-03-28",
    status: "Flagged for Review",
    compositeRiskScore: 0.89,
    riskTier: "Critical",
    anomalyFlags: [
      {
        type: "cost",
        severity: "critical",
        title: "Cost Variance vs Peer Median",
        summary: "Sanctioned unit cost exceeds 2.8 standard deviations beyond the district median for Type-B Community Halls.",
        metric: "+86.5% above median",
        peerComparison: "Peer median: ₹26.0 Lakh vs Sanctioned: ₹48.5 Lakh",
      },
      {
        type: "duplicate",
        severity: "elevated",
        title: "High Semantic Similarity with Adjacent Sanction",
        summary: "High textual overlap and identical milestone description with work sanctioned 14 days prior in adjacent Gram Panchayat.",
        metric: "87.4% semantic match",
        peerComparison: "Matches WRK-MPLADS-2024-0388 (Gram Panchayat Ashta)",
      },
      {
        type: "geographic",
        severity: "elevated",
        title: "Spatial Clustering Anomaly",
        summary: "6 works awarded to same agency within a 4.2 km corridor within 45 days before fiscal year-end.",
        metric: "6 works in 4.2 km",
        peerComparison: "Regional spatial density baseline: 1.1 works per 10 km",
      },
      {
        type: "pattern",
        severity: "moderate",
        title: "Fiscal Year-End Sanction Spike",
        summary: "Sanction approved 72 hours before March 31 without prior feasibility survey in initial dossier.",
        metric: "Sanction Date: Mar 28",
        peerComparison: "Constituency approval cycle average: 42 days",
      },
    ],
    duplicateCandidates: [
      {
        id: "WRK-MPLADS-2024-0388",
        title: "Construction of Community Hall and Solar Powered Center, Ashta Block",
        similarityScore: 0.87,
        constituency: "Bhopal Parliamentary",
        sanctionedAmount: 4600000,
        status: "Flagged for Review",
      },
      {
        id: "WRK-MPLADS-2023-1102",
        title: "Gram Panchayat Community Gathering Hall with Renewable Power, Sehore",
        similarityScore: 0.74,
        constituency: "Bhopal Parliamentary",
        sanctionedAmount: 2500000,
        status: "Reviewed - No Issue",
      },
    ],
    peerDistribution: [
      { label: "P10 (Min)", amount: 1800000 },
      { label: "P25", amount: 2200000 },
      { label: "Peer Median", amount: 2600000 },
      { label: "P75", amount: 3100000 },
      { label: "P90 (Threshold)", amount: 3500000 },
      { label: "This Work", amount: 4850000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 92, peerBaseline: 30 },
      { dimension: "Semantic Overlap", thisWork: 87, peerBaseline: 20 },
      { dimension: "Spatial Clustering", thisWork: 78, peerBaseline: 25 },
      { dimension: "Contractor Win Rate", thisWork: 85, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 74, peerBaseline: 40 },
    ],
    auditTrail: [
      {
        id: "AUD-101",
        timestamp: "2026-09-02 11:20 IST",
        actor: "ArthaSentinel Engine V2.4",
        role: "Automated Ingestion Pipeline",
        action: "FLAGGED_INITIAL",
        notes: "Automated triage flag triggered: Cost outlier score 0.91, Semantic similarity 0.87 to WRK-MPLADS-2024-0388.",
      },
      {
        id: "AUD-102",
        timestamp: "2026-09-03 14:45 IST",
        actor: "Dr. K. S. Ramanathan",
        role: "Senior Public Finance Analyst",
        action: "NOTE_ADDED",
        notes: "Preliminary review confirms cost disparity. Notice issued to district nodal officer requesting geo-tagged milestone photos.",
      },
    ],
    coordinates: { lat: 23.2032, lng: 77.0844 },
    clusterDistanceKm: 4.2,
    contractorConcentrationRatio: 0.68,
  },
  {
    id: "WRK-MPLADS-2024-0102",
    title: "Installation of 240W LED High-Mast Solar Lighting Systems, Ward 12 & 14",
    category: "Renewable Energy",
    constituency: "Indore Lok Sabha",
    district: "Indore",
    state: "Madhya Pradesh",
    sanctionedAmount: 3200000,
    expenditureAmount: 3150000,
    peerMedianAmount: 1850000,
    implementingAgency: "Shree Balaji Infra Solutions",
    contractor: "Shree Balaji",
    sanctionDate: "2024-02-14",
    status: "Flagged for Review",
    compositeRiskScore: 0.76,
    riskTier: "Elevated",
    anomalyFlags: [
      {
        type: "cost",
        severity: "elevated",
        title: "Equipment Procurement Rate Discrepancy",
        summary: "Per-unit fixture cost is 72% higher than standard state PWD schedule of rates (SoR).",
        metric: "+72.8% above PWD SoR",
        peerComparison: "Peer average: ₹48,000/pole vs Sanctioned: ₹83,000/pole",
      },
      {
        type: "pattern",
        severity: "moderate",
        title: "Vendor Concentration",
        summary: "Agency received 11 of the 14 solar lighting sanctions in the municipal corporation across 6 months.",
        metric: "78.5% vendor win rate",
        peerComparison: "Expected competitive bidding distribution: max 35%",
      },
    ],
    duplicateCandidates: [
      {
        id: "WRK-MPLADS-2023-0892",
        title: "LED High-Mast Illumination Tower, Sector C Indore",
        similarityScore: 0.62,
        constituency: "Indore Lok Sabha",
        sanctionedAmount: 1900000,
        status: "Reviewed - No Issue",
      },
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
      { dimension: "Contractor Win Rate", thisWork: 82, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 50, peerBaseline: 40 },
    ],
    auditTrail: [
      {
        id: "AUD-201",
        timestamp: "2026-09-01 09:15 IST",
        actor: "ArthaSentinel Engine V2.4",
        role: "Automated Ingestion Pipeline",
        action: "FLAGGED_INITIAL",
        notes: "Triggered by equipment procurement price model against PWD SoR schedule.",
      },
    ],
    coordinates: { lat: 22.7196, lng: 75.8577 },
    clusterDistanceKm: 6.8,
    contractorConcentrationRatio: 0.78,
  },
  {
    id: "WRK-MPLADS-2024-0771",
    title: "Deep Borewell Drilling & Community RO Water Purification Network, Kashi Sector 4",
    category: "Drinking Water & Sanitation",
    constituency: "Varanasi Parliamentary",
    district: "Varanasi",
    state: "Uttar Pradesh",
    sanctionedAmount: 2950000,
    expenditureAmount: 2900000,
    peerMedianAmount: 1700000,
    implementingAgency: "Vanguard Infra Services Pvt Ltd",
    contractor: "Vanguard Infra",
    sanctionDate: "2024-01-19",
    status: "Flagged for Review",
    compositeRiskScore: 0.81,
    riskTier: "Critical",
    anomalyFlags: [
      {
        type: "duplicate",
        severity: "critical",
        title: "Exact Co-location with Jal Jeevan Mission Asset",
        summary: "GPS coordinates overlap within 18 meters of an operational central scheme water ATM installed in 2022.",
        metric: "18m spatial overlap",
        peerComparison: "Potential duplicate asset on identical public land parcel",
      },
      {
        type: "cost",
        severity: "elevated",
        title: "Unit Rate Deviation",
        summary: "Drilling depth quoted at 350 ft in an alluvial river basin where aquifer depth is documented at 140 ft.",
        metric: "+73.5% vs Hydrogeological Norm",
        peerComparison: "Local CGWB aquifer baseline: 140–160 ft",
      },
    ],
    duplicateCandidates: [
      {
        id: "WRK-JJM-UP-2022-9901",
        title: "Community RO Water Purification Unit, Kashi Ward 18",
        similarityScore: 0.93,
        constituency: "Varanasi Parliamentary",
        sanctionedAmount: 2100000,
        status: "Existing Scheme Asset",
      },
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
      { dimension: "Contractor Win Rate", thisWork: 60, peerBaseline: 30 },
      { dimension: "Timeline Compression", thisWork: 62, peerBaseline: 38 },
    ],
    auditTrail: [
      {
        id: "AUD-301",
        timestamp: "2026-08-28 16:30 IST",
        actor: "ArthaSentinel Engine V2.4",
        role: "Automated Ingestion Pipeline",
        action: "FLAGGED_INITIAL",
        notes: "Spatial cross-scheme match detected against Jal Jeevan Mission database.",
      },
    ],
    coordinates: { lat: 25.3176, lng: 82.9739 },
    clusterDistanceKm: 0.018,
    contractorConcentrationRatio: 0.54,
  },
  {
    id: "WRK-MPLADS-2024-0552",
    title: "Upgradation of Rural Link Road with Cement Concrete Pavement, Amber Block",
    category: "Rural Connectivity",
    constituency: "Jaipur Rural",
    district: "Jaipur",
    state: "Rajasthan",
    sanctionedAmount: 3800000,
    expenditureAmount: 3750000,
    peerMedianAmount: 3400000,
    implementingAgency: "National Tech Buildcon",
    contractor: "National Tech",
    sanctionDate: "2024-02-27",
    status: "Under Review",
    compositeRiskScore: 0.48,
    riskTier: "Moderate",
    anomalyFlags: [
      {
        type: "pattern",
        severity: "moderate",
        title: "Sub-project Splitting Indicator",
        summary: "Sanction amount is exactly ₹38.00 Lakh, just below the ₹40.00 Lakh threshold requiring multi-member technical sanction committee.",
        metric: "₹38.00 Lakh (Threshold: ₹40.00L)",
        peerComparison: "5 adjacent road segments sanctioned between ₹37.5L - ₹39.5L",
      },
    ],
    duplicateCandidates: [],
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
      { dimension: "Spatial Clustering", thisWork: 55, peerBaseline: 30 },
      { dimension: "Contractor Win Rate", thisWork: 50, peerBaseline: 35 },
      { dimension: "Timeline Compression", thisWork: 42, peerBaseline: 40 },
    ],
    auditTrail: [
      {
        id: "AUD-401",
        timestamp: "2026-09-02 17:00 IST",
        actor: "ArthaSentinel Engine V2.4",
        role: "Automated Ingestion Pipeline",
        action: "FLAGGED_INITIAL",
        notes: "Tender splitting pattern model triggered.",
      },
    ],
    coordinates: { lat: 26.9855, lng: 75.8513 },
    clusterDistanceKm: 8.5,
    contractorConcentrationRatio: 0.42,
  },
  {
    id: "WRK-MPLADS-2024-0311",
    title: "Construction of Anganwadi Center with Nutrition Storage, Kazhakoottam",
    category: "Public Health",
    constituency: "Thiruvananthapuram Parliamentary",
    district: "Thiruvananthapuram",
    state: "Kerala",
    sanctionedAmount: 1650000,
    expenditureAmount: 1620000,
    peerMedianAmount: 1550000,
    implementingAgency: "Kerala State Coastal Construction Corp",
    contractor: "KSCC Ltd",
    sanctionDate: "2024-01-10",
    status: "Reviewed - No Issue",
    compositeRiskScore: 0.18,
    riskTier: "Low",
    anomalyFlags: [],
    duplicateCandidates: [],
    peerDistribution: [
      { label: "P10", amount: 1300000 },
      { label: "P25", amount: 1450000 },
      { label: "Peer Median", amount: 1550000 },
      { label: "P75", amount: 1700000 },
      { label: "P90", amount: 1850000 },
      { label: "This Work", amount: 1650000, isThisWork: true },
    ],
    radarMetrics: [
      { dimension: "Cost Deviation", thisWork: 22, peerBaseline: 25 },
      { dimension: "Semantic Overlap", thisWork: 15, peerBaseline: 20 },
      { dimension: "Spatial Clustering", thisWork: 18, peerBaseline: 25 },
      { dimension: "Contractor Win Rate", thisWork: 25, peerBaseline: 30 },
      { dimension: "Timeline Compression", thisWork: 20, peerBaseline: 35 },
    ],
    auditTrail: [
      {
        id: "AUD-501",
        timestamp: "2026-08-30 10:10 IST",
        actor: "Audit Officer S. Pillai",
        role: "State Nodal Reviewer",
        action: "REVIEWED_NO_ISSUE",
        notes: "Inspected physical verification geo-tag. Normal parameters confirmed.",
      },
    ],
    coordinates: { lat: 8.5686, lng: 76.8731 },
    clusterDistanceKm: 14.2,
    contractorConcentrationRatio: 0.15,
  },
  {
    id: "WRK-MPLADS-2024-0820",
    title: "Procurement and Installation of Desalination RO Plant, Rameswaram Coast",
    category: "Drinking Water & Sanitation",
    constituency: "Ramanathapuram Parliamentary",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    sanctionedAmount: 5400000,
    expenditureAmount: 5350000,
    peerMedianAmount: 3100000,
    implementingAgency: "Southern Oceanics & Infra Ltd",
    contractor: "Southern Oceanics",
    sanctionDate: "2024-03-12",
    status: "Flagged for Review",
    compositeRiskScore: 0.85,
    riskTier: "Critical",
    anomalyFlags: [
      {
        type: "cost",
        severity: "critical",
        title: "Capital Cost Discrepancy",
        summary: "Capital procurement cost exceeds state coastal utility benchmarks by +74.2%.",
        metric: "+74.2% vs coastal benchmark",
        peerComparison: "Peer benchmark: ₹31.0 Lakh vs Sanctioned: ₹54.0 Lakh",
      },
      {
        type: "duplicate",
        severity: "elevated",
        title: "Cross-District Equipment Specification Reuse",
        summary: "Detailed project report shares 91% identical text with DPR submitted in Nagapattinam in 2023.",
        metric: "91.2% DPR textual match",
        peerComparison: "Source document: WRK-MPLADS-2023-0491",
      },
    ],
    duplicateCandidates: [
      {
        id: "WRK-MPLADS-2023-0491",
        title: "RO Desalination Unit, Nagapattinam Coastal Taluk",
        similarityScore: 0.91,
        constituency: "Nagapattinam Parliamentary",
        sanctionedAmount: 3400000,
        status: "Reviewed - No Issue",
      },
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
      { dimension: "Contractor Win Rate", thisWork: 70, peerBaseline: 30 },
      { dimension: "Timeline Compression", thisWork: 75, peerBaseline: 35 },
    ],
    auditTrail: [
      {
        id: "AUD-601",
        timestamp: "2026-09-01 12:00 IST",
        actor: "ArthaSentinel Engine V2.4",
        role: "Automated Ingestion Pipeline",
        action: "FLAGGED_INITIAL",
        notes: "DPR text reuse and cost benchmark violation flagged.",
      },
    ],
    coordinates: { lat: 9.2876, lng: 79.3129 },
    clusterDistanceKm: 18.0,
    contractorConcentrationRatio: 0.58,
  },
];

export const SYSTEM_STATS = {
  totalWorksIndexed: 1248320,
  flaggedThisCycle: 14,
  districtsCovered: 36,
  averageRiskScore: 0.42,
  underInvestigation: 8,
  reviewedNoIssue: 142,
  escalatedToFieldInspection: 4,
};

export const VALIDATION_METRICS = [
  {
    model: "Cost Outlier Detector (Robust Z / IQR)",
    precision: 0.912,
    recall: 0.884,
    f1Score: 0.898,
    benchmarkCases: 1450,
    lastCalibrated: "2026-08-15",
  },
  {
    model: "Semantic Text & DPR Overlap (Embeddings + Cosine)",
    precision: 0.945,
    recall: 0.862,
    f1Score: 0.902,
    benchmarkCases: 820,
    lastCalibrated: "2026-08-20",
  },
  {
    model: "Spatial Clustering & Asset Co-location (DBSCAN)",
    precision: 0.887,
    recall: 0.921,
    f1Score: 0.904,
    benchmarkCases: 640,
    lastCalibrated: "2026-08-28",
  },
  {
    model: "Tender Splitting & Fiscal Clustering",
    precision: 0.864,
    recall: 0.890,
    f1Score: 0.877,
    benchmarkCases: 1100,
    lastCalibrated: "2026-09-01",
  },
];
