-- ResQGraph AI — Baseline PostgreSQL / PostGIS Schema
-- Migration: 20261002000000_baseline_schema.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    jurisdiction_geofence GEOMETRY(Polygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'responder', 'dispatcher', 'commander', 'admin')),
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Teams & Responders
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('medical', 'fire', 'rescue', 'police', 'heavy_equipment', 'drone', 'shelter')),
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'en_route', 'on_scene', 'offline')),
    current_location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    badge_number VARCHAR(100) NOT NULL,
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'en_route', 'on_scene', 'offline')),
    current_location GEOMETRY(Point, 4326),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responders_team ON responders(team_id);
CREATE INDEX IF NOT EXISTS idx_responders_status ON responders(status);
CREATE INDEX IF NOT EXISTS idx_responders_location ON responders USING GIST(current_location);

-- 4. Vehicles & Resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('medical', 'fire', 'rescue', 'police', 'heavy_equipment', 'drone', 'shelter')),
    quantity INTEGER NOT NULL DEFAULT 1,
    available_quantity INTEGER NOT NULL DEFAULT 1,
    location GEOMETRY(Point, 4326),
    is_deployable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'triaged', 'dispatched', 'active', 'contained', 'resolved', 'closed', 'merged', 'dismissed')),
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW')),
    hazard_type VARCHAR(50) NOT NULL,
    confidence_score NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    location GEOMETRY(Point, 4326) NOT NULL,
    address VARCHAR(255),
    landmark VARCHAR(255),
    affected_people_estimate INTEGER DEFAULT 0,
    reporter_count INTEGER NOT NULL DEFAULT 1,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    verified_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    merged_into_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

-- 6. Incident Status Audit History
CREATE TABLE IF NOT EXISTS incident_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_incident ON incident_status_history(incident_id);

-- 7. Reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_event_id UUID UNIQUE,
    source_type VARCHAR(50) NOT NULL,
    raw_content TEXT NOT NULL,
    transcription TEXT,
    language_detected VARCHAR(20),
    location GEOMETRY(Point, 4326),
    extraction JSONB DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_incident ON reports(incident_id);
CREATE INDEX IF NOT EXISTS idx_reports_client_event ON reports(client_event_id);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST(location);

-- 8. Evidence
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    source_type VARCHAR(50) NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('text', 'image', 'audio', 'video', 'sensor_telemetry')),
    media_url TEXT,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    sha256_hash VARCHAR(64),
    location GEOMETRY(Point, 4326),
    location_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.8 CHECK (location_confidence BETWEEN 0.0 AND 1.0),
    extraction_confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.8 CHECK (extraction_confidence BETWEEN 0.0 AND 1.0),
    observations JSONB NOT NULL DEFAULT '[]',
    contradiction_flags TEXT[] NOT NULL DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_incident ON evidence(incident_id);
CREATE INDEX IF NOT EXISTS idx_evidence_media_type ON evidence(media_type);

-- 9. Evidence Links (Supports / Contradicts / Duplicates)
CREATE TABLE IF NOT EXISTS evidence_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id_a UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    evidence_id_b UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN ('supports', 'contradicts', 'duplicates', 'corroborates')),
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.80,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Hazards & Roads
CREATE TABLE IF NOT EXISTS hazards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    hazard_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    boundary GEOMETRY(Polygon, 4326),
    location GEOMETRY(Point, 4326),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hazards_boundary ON hazards USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_hazards_location ON hazards USING GIST(location);

CREATE TABLE IF NOT EXISTS roads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'restricted', 'flooded', 'blocked')),
    blocked_reason TEXT,
    hazard_type VARCHAR(50),
    geometry GEOMETRY(LineString, 4326) NOT NULL,
    length_meters NUMERIC(10, 2) NOT NULL,
    speed_limit_kmh INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roads_geometry ON roads USING GIST(geometry);

-- 11. Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    responder_id UUID REFERENCES responders(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'dispatched', 'en_route', 'on_scene', 'completed', 'cancelled')),
    proposed_by_ai_job_id UUID,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_reason TEXT,
    override_reason TEXT,
    dispatched_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_incident ON assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_assignments_team ON assignments(team_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- 12. AI Jobs & Decision Traces
CREATE TABLE IF NOT EXISTS decision_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    recommended_action TEXT NOT NULL,
    confidence_score NUMERIC(3, 2) NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    uncertainty_score NUMERIC(3, 2) NOT NULL CHECK (uncertainty_score BETWEEN 0.0 AND 1.0),
    factors JSONB NOT NULL DEFAULT '[]',
    cited_evidence_ids UUID[] NOT NULL DEFAULT '{}',
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    latency_ms INTEGER NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    is_approved_by_human BOOLEAN,
    human_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    human_override_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_traces_incident ON decision_traces(incident_id);

-- 13. Devices & Hardware Telemetry
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    hardware_uid VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('sos_button', 'environmental_sensor', 'drone', 'cctv_gateway', 'beacon')),
    firmware_version VARCHAR(50) NOT NULL,
    battery_percentage INTEGER CHECK (battery_percentage BETWEEN 0 AND 100),
    status VARCHAR(50) NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'degraded', 'tampered')),
    assigned_location GEOMETRY(Point, 4326),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_event_id UUID UNIQUE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    location GEOMETRY(Point, 4326),
    telemetry JSONB NOT NULL DEFAULT '{}',
    signature VARCHAR(255),
    associated_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    acknowledged_by_server_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_events_client_event ON device_events(client_event_id);
CREATE INDEX IF NOT EXISTS idx_device_events_device ON device_events(device_id);

-- 14. Offline Sync Events & Idempotency Keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    operation_name VARCHAR(100) NOT NULL,
    response_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_entity_id VARCHAR(100) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_org ON audit_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC);
