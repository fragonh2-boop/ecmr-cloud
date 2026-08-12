CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ecmr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  verification_id UUID NOT NULL UNIQUE,
  external_reference TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ecmr_status_check CHECK (status IN ('DRAFT','ISSUED','IN_TRANSIT','DELIVERED','CLOSED','CANCELLED'))
);

CREATE TABLE IF NOT EXISTS ecmr_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecmr_id UUID NOT NULL REFERENCES ecmr(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL,
  canonical_document JSONB NOT NULL,
  document_hash CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ecmr_id, version)
);

CREATE TABLE IF NOT EXISTS ecmr_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecmr_id UUID NOT NULL REFERENCES ecmr(id) ON DELETE RESTRICT,
  sequence_no BIGINT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  document_version INTEGER,
  payload JSONB NOT NULL,
  previous_event_hash CHAR(64),
  event_hash CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ecmr_id, sequence_no),
  UNIQUE(ecmr_id, event_hash)
);

CREATE INDEX IF NOT EXISTS idx_ecmr_external_reference ON ecmr(external_reference);
CREATE INDEX IF NOT EXISTS idx_ecmr_created_at ON ecmr(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecmr_event_ecmr_sequence ON ecmr_event(ecmr_id, sequence_no);

COMMENT ON TABLE ecmr IS 'Current e-CMR aggregate state. Historical content is stored in ecmr_version.';
COMMENT ON TABLE ecmr_version IS 'Immutable canonical document versions with SHA-256 hashes.';
COMMENT ON TABLE ecmr_event IS 'Append-only cryptographic event ledger for each e-CMR.';
