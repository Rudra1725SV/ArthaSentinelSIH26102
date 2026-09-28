# ArthaSentinel backend foundation

This backend contains the real MPLADS data foundation only. It intentionally
contains no anomaly detection, embeddings, investigation workflow, or AI modules.

## Local setup

1. Create a Python virtual environment and install dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env`, then set `DATABASE_URL` or all required
   `POSTGRES_*` values. Never commit `.env`.

3. Provision PostgreSQL with the pgvector extension available, then run:

   ```powershell
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

4. Verify either `http://localhost:8000/health` or the frontend-compatible
   `http://localhost:8000/api/health`.

The health endpoint returns HTTP 503 when PostgreSQL is unavailable or database
configuration is incomplete. It reports whether pgvector is enabled, but does
not create data or run migrations automatically.

## Ingest authoritative MPLADS JSON

After migrations succeed, pass the source paths explicitly. The ingester does
not modify those files and records invalid source rows, their reasons, and raw
payloads in PostgreSQL.

```powershell
python -m app.cli.ingest_mplads `
  --lok-sabha "C:\path\to\mplads_india_ls18.json" `
  --rajya-sabha "C:\path\to\mplads_india_rs.json"
```

Re-running the same source is safe: source work IDs already stored for the
same House are counted as duplicates rather than inserted again.
