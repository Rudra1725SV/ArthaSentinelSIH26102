from enum import StrEnum
from sqlalchemy import Enum as SaEnum


class House(StrEnum):
    LOK_SABHA = "Lok Sabha"
    RAJYA_SABHA = "Rajya Sabha"


class IngestionStatus(StrEnum):
    RUNNING = "running"
    COMPLETED = "completed"
    COMPLETED_WITH_REJECTIONS = "completed_with_rejections"
    FAILED = "failed"


def house_enum():
    return SaEnum(House, values_callable=lambda x: [e.value for e in x], name="house_type")


def ingestion_status_enum():
    return SaEnum(IngestionStatus, values_callable=lambda x: [e.value for e in x], name="ingestion_status")
