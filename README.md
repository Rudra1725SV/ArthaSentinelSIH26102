# ArthaSentinel — SIH 2026 | SIH26102

### MPLADS Scrutiny & Anomaly Detection Platform

ArthaSentinel is an AI-assisted platform designed to support **evidence-based scrutiny of MPLADS works** by identifying potentially anomalous projects and prioritizing them for human review.

## What It Does

- 📊 Ingests and normalizes MPLADS work records
- 🔎 Compares works against relevant peer groups and historical patterns
- ⚠️ Detects potential cost, textual, and pattern-based anomalies
- 🧠 Generates risk scores to prioritize suspicious or unusual works
- 🗂️ Provides investigation views with supporting evidence
- 📈 Enables exploration of MPs, districts, works, and detected anomalies
- 📝 Maintains an audit-oriented trail for review

The system **does not label a work as fraudulent**. It identifies potential anomalies that require further investigation by authorized human reviewers.

## Technology

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- D3 / interactive visualization

**Backend**
- Python
- FastAPI
- PostgreSQL
- pgvector
- SQLAlchemy / Alembic

**Detection Components**
- Cost anomaly detection
- Peer-group analysis
- Text similarity and anomaly detection
- Semantic embeddings
- Pattern analysis
- Risk scoring
- Investigation assistance

## Data

The prototype uses a combination of available MPLADS records and **synthetic benchmark data generated for testing and demonstration purposes**.

Synthetic data is used where required to safely test detection pipelines, edge cases, anomaly scenarios, and system functionality without representing synthetic records as official government records.

## Prototype

The current prototype demonstrates the complete workflow from:

**MPLADS Data → Normalization → Detection → Risk Scoring → Investigation → Evidence-Based Review**

The repository contains both the frontend interface and backend services required to demonstrate the system.

## Disclaimer

ArthaSentinel is a prototype developed for **Smart India Hackathon 2026 (SIH26102)**. Detection results are intended to assist human review and should not be interpreted as definitive findings of wrongdoing.
