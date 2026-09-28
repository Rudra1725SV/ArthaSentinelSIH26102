"""Ingest authoritative Lok Sabha and Rajya Sabha JSON files."""

import argparse
import sys
from pathlib import Path

from app.db.session import get_session_factory
from app.models.enums import House
from app.services.ingestion import ingest_json_file


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest authoritative MPLADS JSON datasets into PostgreSQL")
    parser.add_argument("--lok-sabha", required=True, type=Path, help="Path to mplads_india_ls18.json")
    parser.add_argument("--rajya-sabha", required=True, type=Path, help="Path to mplads_india_rs.json")
    args = parser.parse_args()

    session_factory = get_session_factory()
    with session_factory() as session:
        for path, house in ((args.lok_sabha, House.LOK_SABHA), (args.rajya_sabha, House.RAJYA_SABHA)):
            if not path.is_file():
                print(f"Error: File not found: {path}", file=sys.stderr)
                sys.exit(1)

            print(f"\n--- Ingesting {house.value} from {path.name} ---")
            summary = ingest_json_file(session, path, house)
            print(f"Status:         {summary.status.value}")
            print(f"Total rows:     {summary.total_rows:,}")
            print(f"Inserted works: {summary.inserted_rows:,}")
            print(f"Rejected rows:  {summary.rejected_rows:,}")
            print(f"Duplicate rows: {summary.duplicate_rows:,}")
            print(f"JSON Result:    {summary.model_dump_json()}")


if __name__ == "__main__":
    main()
