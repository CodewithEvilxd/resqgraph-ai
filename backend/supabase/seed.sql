-- ResQGraph AI — Isolated Development / Demo Fixtures
-- NOTICE: For development and testing only. Never run in production.

-- 1. Demo Organization
INSERT INTO organizations (id, name, code)
VALUES ('00000000-0000-0000-0000-000000000001', 'Delhi Emergency Management Authority', 'DEMA-NCR')
ON CONFLICT (id) DO NOTHING;

-- 2. Demo Users (Password for all demo users: "Password123!")
-- Pre-computed scrypt hash for Password123!
-- salt: d3adb33f112233445566778899aabbcc
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, phone, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'admin@resqgraph.local', 'd3adb33f112233445566778899aabbcc:728d7b322a36b5bc9cb411dd78819a8a7dbecda83d3b76a91d2179836e788ad7a304fc052fa0f73fbfb019315d9a04bb434d707164993806ff5e46be952219e2', 'System Administrator', 'admin', '+91-9876543210', TRUE),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'commander@resqgraph.local', 'd3adb33f112233445566778899aabbcc:728d7b322a36b5bc9cb411dd78819a8a7dbecda83d3b76a91d2179836e788ad7a304fc052fa0f73fbfb019315d9a04bb434d707164993806ff5e46be952219e2', 'Col. Rajiv Sharma', 'commander', '+91-9876543211', TRUE),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'dispatcher@resqgraph.local', 'd3adb33f112233445566778899aabbcc:728d7b322a36b5bc9cb411dd78819a8a7dbecda83d3b76a91d2179836e788ad7a304fc052fa0f73fbfb019315d9a04bb434d707164993806ff5e46be952219e2', 'Anita Rao', 'dispatcher', '+91-9876543212', TRUE),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'responder1@resqgraph.local', 'd3adb33f112233445566778899aabbcc:728d7b322a36b5bc9cb411dd78819a8a7dbecda83d3b76a91d2179836e788ad7a304fc052fa0f73fbfb019315d9a04bb434d707164993806ff5e46be952219e2', 'Vikas Singh', 'responder', '+91-9876543213', TRUE),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'citizen1@resqgraph.local', 'd3adb33f112233445566778899aabbcc:728d7b322a36b5bc9cb411dd78819a8a7dbecda83d3b76a91d2179836e788ad7a304fc052fa0f73fbfb019315d9a04bb434d707164993806ff5e46be952219e2', 'Meera Patel', 'citizen', '+91-9876543214', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Demo Teams
INSERT INTO teams (id, organization_id, name, category, status, current_location)
VALUES
  ('66666666-6666-6666-6666-666666666661', '00000000-0000-0000-0000-000000000001', 'Rapid Water Rescue Unit Alpha', 'rescue', 'available', ST_SetSRID(ST_Point(77.2710, 28.5450), 4326)),
  ('66666666-6666-6666-6666-666666666662', '00000000-0000-0000-0000-000000000001', 'Medical Triage Unit 1', 'medical', 'available', ST_SetSRID(ST_Point(77.2680, 28.5490), 4326)),
  ('66666666-6666-6666-6666-666666666663', '00000000-0000-0000-0000-000000000001', 'Industrial Fire Response Bravo', 'fire', 'available', ST_SetSRID(ST_Point(77.2800, 28.5380), 4326))
ON CONFLICT (id) DO NOTHING;

-- 4. Demo Responders
INSERT INTO responders (id, user_id, organization_id, team_id, badge_number, capabilities, status, current_location, battery_level)
VALUES
  ('77777777-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666661', 'BADGE-DEMA-401', ARRAY['flood_rescue', 'first_aid', 'boat_operation'], 'available', ST_SetSRID(ST_Point(77.2715, 28.5455), 4326), 92)
ON CONFLICT (id) DO NOTHING;

-- 5. Demo Resources
INSERT INTO resources (id, organization_id, name, category, quantity, available_quantity, location, is_deployable)
VALUES
  ('88888888-8888-8888-8888-888888888881', '00000000-0000-0000-0000-000000000001', 'Inflatable Rescue Boats', 'rescue', 4, 3, ST_SetSRID(ST_Point(77.2710, 28.5450), 4326), TRUE),
  ('88888888-8888-8888-8888-888888888882', '00000000-0000-0000-0000-000000000001', 'Advanced Life Support Ambulances', 'medical', 6, 5, ST_SetSRID(ST_Point(77.2680, 28.5490), 4326), TRUE),
  ('88888888-8888-8888-8888-888888888883', '00000000-0000-0000-0000-000000000001', 'Thermal Imaging Drones', 'drone', 3, 3, ST_SetSRID(ST_Point(77.2710, 28.5450), 4326), TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. Demo Incidents
INSERT INTO incidents (id, organization_id, code, title, description, status, priority, hazard_type, confidence_score, location, address, landmark, affected_people_estimate, reporter_count, evidence_count)
VALUES
  ('99999999-9999-9999-9999-999999999991', '00000000-0000-0000-0000-000000000001', 'INC-2026-0001', 'Urban Flash Flood & Road Inundation', 'Rapid water accumulation under railway underpass blocking vehicles. Multiple commuters stranded on vehicle roofs.', 'active', 'P1_CRITICAL', 'flood', 0.95, ST_SetSRID(ST_Point(77.2730, 28.5440), 4326), 'Underpass Road, Okhla Phase 1', 'Near Kalkaji Metro Station', 15, 4, 3),
  ('99999999-9999-9999-9999-999999999992', '00000000-0000-0000-0000-000000000001', 'INC-2026-0002', 'Commercial Warehouse Fire', 'Dense smoke billowing from chemical packaging warehouse. No confirmed casualties, structural integrity compromised.', 'verified', 'P2_HIGH', 'fire', 0.88, ST_SetSRID(ST_Point(77.2850, 28.5350), 4326), 'Plot 42, Industrial Area Phase 2', 'Opposite Mother Dairy Plant', 0, 2, 2)
ON CONFLICT (id) DO NOTHING;

-- 7. Demo Roads with status
INSERT INTO roads (id, name, status, blocked_reason, hazard_type, geometry, length_meters, speed_limit_kmh)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Okhla Underpass Main Road', 'flooded', 'Water level exceeding 1.2 meters', 'flood', ST_SetSRID(ST_GeomFromText('LINESTRING(77.2700 28.5430, 77.2750 28.5450)'), 4326), 650.00, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Outer Ring Road Flyover', 'open', NULL, NULL, ST_SetSRID(ST_GeomFromText('LINESTRING(77.2600 28.5500, 77.2800 28.5480)'), 4326), 2200.00, 60)
ON CONFLICT (id) DO NOTHING;
