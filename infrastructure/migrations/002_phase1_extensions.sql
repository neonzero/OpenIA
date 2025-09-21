-- Migration: Phase 1 extensions for risk and audit modules
-- Description: Adds supporting tables for follow-ups, working papers, reports and enriches existing structures.

BEGIN;

ALTER TABLE risks
    ADD COLUMN IF NOT EXISTS inherent_score NUMERIC(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS residual_score NUMERIC(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS risk_appetite NUMERIC(5,2);

ALTER TABLE audits
    ADD COLUMN IF NOT EXISTS owner VARCHAR(255),
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE,
    ADD COLUMN IF NOT EXISTS scope TEXT;

ALTER TABLE timesheets
    ADD COLUMN IF NOT EXISTS auditor_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS engagement VARCHAR(255);

CREATE TABLE IF NOT EXISTS risk_follow_ups (
    id            BIGSERIAL PRIMARY KEY,
    risk_id       BIGINT NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    action        TEXT NOT NULL,
    owner         VARCHAR(255) NOT NULL,
    due_date      DATE NOT NULL,
    status        VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'complete')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS working_papers (
    id          BIGSERIAL PRIMARY KEY,
    audit_id    BIGINT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    owner       VARCHAR(255) NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved')),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    owner       VARCHAR(255) NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued')),
    issued_date DATE,
    content     JSONB DEFAULT '{}'::JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
