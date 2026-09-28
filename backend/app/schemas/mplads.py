"""Read schemas for the normalized MPLADS foundation."""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import House


class ConstituencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    house: House
    name: str
    state: str
    district: str


class RepresentativeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    house: House
    name: str
    name_hi: str | None
    constituency_id: UUID


class WorkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    house: House
    source_record_id: str
    source_work_id: str
    work_description: str
    category: str
    sanctioned_cost: Decimal
    completion_date: date | None
    completion_year: int | None = None
    geo_district: str | None = None
    representative_id: UUID
    constituency_id: UUID


# ─── Frontend-Aligned API DTOs ────────────────────────────────────────────────

class WorkItemDTO(BaseModel):
    id: str
    workId: str
    sourceRecordId: str
    house: str
    description: str
    category: str
    sanctionedAmount: float
    expenditureAmount: float = 0.0
    peerMedian: float = 0.0
    peerCount: int = 0
    deviationPercentage: float = 0.0
    financialYear: str
    state: str
    district: str
    constituency: str
    mp_id: str
    mp_name: str
    status: str = "Compliant / Unflagged"
    riskScore: float = 0.0
    riskTier: str = "Low"
    anomalyTypes: list[str] = Field(default_factory=list)
    completionDate: str | None = None
    beneficiaries: int | None = None
    location: str | None = None
    implementingAgency: str = "District Implementing Agency"
    contractor: str = "Standard Public Allocation"
    sanctionDate: str = ""
    createdAt: str = ""
    updatedAt: str = ""


class PaginatedWorksResponse(BaseModel):
    works: list[WorkItemDTO]
    total: int
    page: int
    limit: int
    totalPages: int
    availableHouses: list[str]
    availableStates: list[str]
    availableCategories: list[str]


class MPItemDTO(BaseModel):
    mp_id: str
    name: str
    house: str
    constituency: str
    state: str
    district: str
    party: str
    works_count: int
    allocated_amount: float
    recorded_expenditure: float
    utilization_rate: float
    flagged_works: int = 0
    high_risk_works: int = 0
    anomaly_rate: float = 0.0
    risk_score: float = 0.0
    avatar_initials: str = ""


class DatasetMetricsDTO(BaseModel):
    totalWorks: int
    flaggedWorks: int = 0
    totalSanctioned: float
    totalExpended: float
    totalMPs: int
    districtsCovered: int
    categoriesCount: int
    avgUtilizationRate: float


class PaginatedMPsResponse(BaseModel):
    mps: list[MPItemDTO]
    total: int
    page: int
    limit: int
    totalPages: int
    availableHouses: list[str]
    availableStates: list[str]
    datasetMetrics: DatasetMetricsDTO | None = None


class MPDetailDTO(BaseModel):
    mp: MPItemDTO
    works: list[WorkItemDTO]


class CategoryMetric(BaseModel):
    category: str
    count: int
    total_sanctioned: float
    percentage_of_total: float


class IngestionRunDTO(BaseModel):
    id: str
    house: str
    source_file: str
    status: str
    total_rows: int
    inserted_rows: int
    rejected_rows: int
    duplicate_rows: int
    started_at: datetime
    completed_at: datetime | None = None


class OverviewResponse(BaseModel):
    total_works: int
    total_mps: int
    total_constituencies: int
    total_states: int
    total_sanctioned_amount: float
    lok_sabha_works: int
    rajya_sabha_works: int
    lok_sabha_mps: int
    rajya_sabha_mps: int
    categories: list[CategoryMetric]
    latest_ingestion: list[IngestionRunDTO]
    anomaly_model_status: str = "Awaiting Model Execution"
    flagged_cases_count: int = 0


class AuditEventDTO(BaseModel):
    id: str
    timestamp: str
    actor: str
    actorType: str
    action: str
    object: str
    result: str
    status: str


class AuditTrailResponse(BaseModel):
    events: list[AuditEventDTO]
    total: int


class InvestigationWorkSummaryDTO(BaseModel):
    description: str = ""
    sanctionedAmount: float = 0.0
    constituency: str = ""
    district: str = ""
    state: str = ""
    category: str = ""
    anomalyTypes: list[str] = Field(default_factory=list)


class InvestigationCaseDTO(BaseModel):
    investigationId: str
    workId: str
    riskScore: float = 0.0
    status: str = "Compliant / Unflagged"
    assignedTo: str = "Unassigned"
    primarySignal: str = "None — No statistical anomaly detected"
    work: InvestigationWorkSummaryDTO | None = None
    notes: list[dict[str, Any]] = Field(default_factory=list)
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    anomalyFlags: list[dict[str, Any]] = Field(default_factory=list)


class InvestigationListResponse(BaseModel):
    investigations: list[InvestigationCaseDTO] = Field(default_factory=list)
    total: int = 0
    status: str = "Awaiting Model Execution"
    message: str = "No investigations generated. Statistical & semantic anomaly detection models have not been executed on the ingested dataset."


class ValidationMetricDTO(BaseModel):
    model: str
    precision: float
    recall: float
    f1Score: float
    benchmarkCases: int
    lastCalibrated: str


class ValidationSummaryResponse(BaseModel):
    status: str = "Baseline Specification"
    metrics: list[ValidationMetricDTO]


class ReviewerActionRequest(BaseModel):
    action: str
    note: str | None = None


class ReviewerActionResponse(BaseModel):
    success: bool
    auditRecord: AuditEventDTO

