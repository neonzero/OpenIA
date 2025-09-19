-- Migration: Initial governance, risk, and compliance schema
-- Description: Creates core tables for risks, controls, audits, findings, timesheets, and files.

BEGIN;

CREATE TABLE risks (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(120),
    severity_level  VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    likelihood      VARCHAR(50),
    impact          VARCHAR(50),
    status          VARCHAR(50) NOT NULL DEFAULT 'identified',
    owner           VARCHAR(255),
    reported_on     DATE DEFAULT CURRENT_DATE,
    mitigation_plan TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE controls (
    id              BIGSERIAL PRIMARY KEY,
    risk_id         BIGINT REFERENCES risks(id) ON DELETE SET NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    control_type    VARCHAR(120),
    owner           VARCHAR(255),
    status          VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
    effective_date  DATE,
    review_date     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audits (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    audit_date      DATE,
    auditor         VARCHAR(255),
    scope           TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'archived')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE findings (
    id                BIGSERIAL PRIMARY KEY,
    audit_id          BIGINT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    control_id        BIGINT REFERENCES controls(id) ON DELETE SET NULL,
    risk_id           BIGINT REFERENCES risks(id) ON DELETE SET NULL,
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    severity          VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status            VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'mitigated', 'closed')),
    remediation_plan  TEXT,
    owner             VARCHAR(255),
    due_date          DATE,
    closed_at         TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE timesheets (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL,
    project_code    VARCHAR(120),
    entry_date      DATE NOT NULL,
    hours_worked    NUMERIC(5,2) NOT NULL CHECK (hours_worked >= 0),
    description     TEXT,
    billable        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, entry_date, project_code)
);

CREATE TABLE files (
    id              BIGSERIAL PRIMARY KEY,
    finding_id      BIGINT REFERENCES findings(id) ON DELETE CASCADE,
    storage_provider VARCHAR(50) NOT NULL,
    storage_path    VARCHAR(512) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    content_type    VARCHAR(255),
    size_bytes      BIGINT CHECK (size_bytes >= 0),
    checksum        VARCHAR(128),
    metadata        JSONB DEFAULT '{}'::JSONB,
    uploaded_by     UUID,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_controls_risk_id ON controls (risk_id);
CREATE INDEX idx_findings_audit_id ON findings (audit_id);
CREATE INDEX idx_findings_control_id ON findings (control_id);
CREATE INDEX idx_findings_risk_id ON findings (risk_id);
CREATE INDEX idx_files_finding_id ON files (finding_id);

COMMIT;
