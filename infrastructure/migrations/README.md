# Database Migrations

This directory stores SQL migrations for the governance, risk, and compliance domain. Migrations are numbered to preserve the order in which they should be executed.

* `001_initial_schema.sql` – creates the baseline tables for risks, controls, audits, findings, timesheets, and files along with indexes for frequent lookups.

Apply migrations with your preferred tool. For example, using `psql`:

```bash
psql "$DATABASE_URL" -f infrastructure/migrations/001_initial_schema.sql
```

Always wrap migrations in transactions to keep the database consistent if any statement fails.
