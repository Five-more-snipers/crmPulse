// @ts-check
import db, { dbPath } from './database.js';

console.log(`[Migration] Starting SQLite database migration at: ${dbPath}`);

const schema = `
-- 1. Tabel Klien Teknis (Clients)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,                       -- UUID v4 string
    company_name TEXT NOT NULL,
    technical_tier TEXT NOT NULL,              -- 'Standard', 'Enterprise SLA', 'Mission-Critical'
    integration_stage TEXT NOT NULL,           -- 'sandbox', 'review', 'uat', 'production', 'maintenance'
    assigned_engineer_id TEXT,
    rate_limit_rps INTEGER DEFAULT 100,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    technical_metadata TEXT                    -- JSON format (SQLite JSON1)
);

-- Index Relasional & Index JSON
CREATE INDEX IF NOT EXISTS idx_clients_stage ON clients(integration_stage);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(technical_tier);
CREATE INDEX IF NOT EXISTS idx_clients_api_ver ON clients(json_extract(technical_metadata, '$.api_version'));

-- 2. Tabel Timeline Aktivitas & Insiden (Technical Activities)
CREATE TABLE IF NOT EXISTS technical_activities (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,               -- 'INCIDENT', 'MEETING', 'CONFIG_CHANGE', 'KEY_ROTATION'
    title TEXT NOT NULL,
    content TEXT,
    severity TEXT DEFAULT 'LOW',               -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    performed_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 3. Tabel Audit Trail Sistem
CREATE TABLE IF NOT EXISTS audit_trails (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,                 -- 'CLIENT', 'API_KEY', 'WEBHOOK'
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,                      -- 'CREATE', 'UPDATE', 'DELETE', 'ROTATE'
    changed_by TEXT NOT NULL,
    old_data TEXT,                             -- Snapshot data JSON sebelum perubahan
    new_data TEXT,                             -- Snapshot data JSON sesudah perubahan
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Tabel Pengguna (Users) & Role-Based Access Control
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,                        -- 'ADMIN', 'ARCHITECT', 'TAM', 'DEVOPS'
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
`;

try {
  db.exec(schema);
  console.log('✅ [Migration] Database schema and indexes created successfully.');

  // Quick verification
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();
  console.log('📊 [Migration] Existing tables in database:', tables.map(t => t.name).join(', '));
} catch (error) {
  console.error('❌ [Migration] Error executing schema migration:', error);
  process.exit(1);
}
