// @ts-check
import { clientRepository } from '../repositories/clientRepository.js';
import { auditRepository } from '../repositories/auditRepository.js';
import db from './database.js';

console.log('🌱 [Seeding] Starting technical clients database seed...');

const sampleClients = [
  {
    company_name: 'StripeGateway Corp',
    technical_tier: 'Mission-Critical',
    integration_stage: 'production',
    assigned_engineer_id: 'eng-alex-01',
    rate_limit_rps: 2500,
    technical_metadata: {
      api_version: 'v2.4',
      runtime_stack: 'Go 1.22',
      webhook_url: 'https://api.stripegateway.internal/v1/webhooks',
      contact_tech_lead: 'alex.t@stripegateway.internal',
      health_check_interval_sec: 15,
      mtls_enabled: true,
    },
  },
  {
    company_name: 'Nexus Cloud Analytics',
    technical_tier: 'Enterprise SLA',
    integration_stage: 'uat',
    assigned_engineer_id: 'eng-maya-02',
    rate_limit_rps: 1200,
    technical_metadata: {
      api_version: 'v2.4',
      runtime_stack: 'Node.js 20',
      webhook_url: 'https://webhook.nexuscloud.io/events/crm',
      contact_tech_lead: 'maya.dev@nexuscloud.io',
      health_check_interval_sec: 30,
      mtls_enabled: false,
    },
  },
  {
    company_name: 'FinTech Pulse Payments',
    technical_tier: 'Mission-Critical',
    integration_stage: 'production',
    assigned_engineer_id: 'eng-ryan-03',
    rate_limit_rps: 3000,
    technical_metadata: {
      api_version: 'v2.4',
      runtime_stack: 'Java Spring Boot 3',
      webhook_url: 'https://gateway.finpulse.net/callbacks',
      contact_tech_lead: 'ryan.k@finpulse.net',
      health_check_interval_sec: 10,
      mtls_enabled: true,
    },
  },
  {
    company_name: 'HyperScale Logistics API',
    technical_tier: 'Enterprise SLA',
    integration_stage: 'review',
    assigned_engineer_id: 'eng-alex-01',
    rate_limit_rps: 800,
    technical_metadata: {
      api_version: 'v2.0',
      runtime_stack: 'Python 3.11 (FastAPI)',
      webhook_url: 'https://dispatch.hyperscale.logistics/hooks',
      contact_tech_lead: 'devs@hyperscale.logistics',
      health_check_interval_sec: 60,
      mtls_enabled: false,
    },
  },
  {
    company_name: 'OmniAuth Identity Systems',
    technical_tier: 'Mission-Critical',
    integration_stage: 'production',
    assigned_engineer_id: 'eng-sarah-04',
    rate_limit_rps: 1500,
    technical_metadata: {
      api_version: 'v2.4',
      runtime_stack: 'Rust (Actix-Web)',
      webhook_url: 'https://auth.omniauth.id/notifications',
      contact_tech_lead: 'security@omniauth.id',
      health_check_interval_sec: 20,
      mtls_enabled: true,
    },
  },
  {
    company_name: 'TeleMed Connect',
    technical_tier: 'Standard',
    integration_stage: 'sandbox',
    assigned_engineer_id: 'eng-maya-02',
    rate_limit_rps: 250,
    technical_metadata: {
      api_version: 'v3.0-beta',
      runtime_stack: 'Node.js 22',
      webhook_url: 'https://sandbox.telemed.app/dev-webhook',
      contact_tech_lead: 'lead@telemed.app',
      health_check_interval_sec: 120,
      mtls_enabled: false,
    },
  },
  {
    company_name: 'BioData Lab Services',
    technical_tier: 'Standard',
    integration_stage: 'sandbox',
    assigned_engineer_id: 'eng-ryan-03',
    rate_limit_rps: 150,
    technical_metadata: {
      api_version: 'v1.0',
      runtime_stack: 'PHP 8.2 (Laravel)',
      webhook_url: 'https://labs.biodata.org/api/callback',
      contact_tech_lead: 'admin@biodata.org',
      health_check_interval_sec: 300,
      mtls_enabled: false,
    },
  },
  {
    company_name: 'Quantum Ledger Blockchain',
    technical_tier: 'Mission-Critical',
    integration_stage: 'review',
    assigned_engineer_id: 'eng-sarah-04',
    rate_limit_rps: 2000,
    technical_metadata: {
      api_version: 'v3.0-beta',
      runtime_stack: 'Go 1.22',
      webhook_url: 'https://node1.quantumledger.io/rpc/webhook',
      contact_tech_lead: 'core@quantumledger.io',
      health_check_interval_sec: 15,
      mtls_enabled: true,
    },
  },
  {
    company_name: 'AeroStream Fleet IoT',
    technical_tier: 'Enterprise SLA',
    integration_stage: 'production',
    assigned_engineer_id: 'eng-alex-01',
    rate_limit_rps: 1800,
    technical_metadata: {
      api_version: 'v2.4',
      runtime_stack: 'C# .NET 8',
      webhook_url: 'https://telemetry.aerostream.aero/inbound',
      contact_tech_lead: 'iot-ops@aerostream.aero',
      health_check_interval_sec: 30,
      mtls_enabled: true,
    },
  },
  {
    company_name: 'UrbanTransit Smart Mobility',
    technical_tier: 'Enterprise SLA',
    integration_stage: 'uat',
    assigned_engineer_id: 'eng-maya-02',
    rate_limit_rps: 1000,
    technical_metadata: {
      api_version: 'v2.0',
      runtime_stack: 'Node.js 20',
      webhook_url: 'https://api.urbantransit.city/webhook/v1',
      contact_tech_lead: 'tech@urbantransit.city',
      health_check_interval_sec: 45,
      mtls_enabled: false,
    },
  },
  {
    company_name: 'Legacy EDI Clearinghouse',
    technical_tier: 'Standard',
    integration_stage: 'maintenance',
    assigned_engineer_id: 'eng-ryan-03',
    rate_limit_rps: 100,
    technical_metadata: {
      api_version: 'v1.0',
      runtime_stack: 'Java 11',
      webhook_url: 'https://edi.clearinghouse.biz/post',
      contact_tech_lead: 'legacy-support@clearinghouse.biz',
      health_check_interval_sec: 600,
      mtls_enabled: false,
    },
  },
  {
    company_name: 'CryptoSettlement Protocol',
    technical_tier: 'Mission-Critical',
    integration_stage: 'uat',
    assigned_engineer_id: 'eng-sarah-04',
    rate_limit_rps: 2500,
    technical_metadata: {
      api_version: 'v3.0-beta',
      runtime_stack: 'Rust',
      webhook_url: 'https://settlement.cryptoprotocol.net/event-stream',
      contact_tech_lead: 'dev@cryptoprotocol.net',
      health_check_interval_sec: 10,
      mtls_enabled: true,
    },
  },
];

// Clear existing clients if any
db.exec('DELETE FROM clients;');
db.exec('DELETE FROM audit_trails;');
db.exec('DELETE FROM technical_activities;');

const createdClients = [];

for (const client of sampleClients) {
  const created = clientRepository.create(client);
  createdClients.push(created);
  auditRepository.log({
    entityType: 'CLIENT',
    entityId: created.id,
    action: 'CREATE',
    changedBy: 'SeedScript',
    newData: created,
  });
}

// Seed sample technical activities & incidents
const sampleActivities = [
  {
    client_id: createdClients[0].id, // StripeGateway Corp
    activity_type: 'CONFIG_CHANGE',
    title: 'Peningkatan Kuota Rate Limit RPS ke 2500',
    content: 'Peningkatan batas rate limit disetujui untuk mengantisipasi lonjakan trafik transaksi kuartal 4.',
    severity: 'LOW',
    performed_by: 'Solutions Architect',
  },
  {
    client_id: createdClients[1].id, // Nexus Cloud Analytics
    activity_type: 'INCIDENT',
    title: 'Webhook 504 Gateway Timeout pada Endpoint CRM',
    content: 'Penerima webhook mengalami timeout berulang selama 12 menit akibat koneksi pool database internal jenuh.',
    severity: 'HIGH',
    performed_by: 'DevOps / SRE',
  },
  {
    client_id: createdClients[2].id, // FinTech Pulse Payments
    activity_type: 'KEY_ROTATION',
    title: 'Rotasi Rutin Kunci API & Pembaruan Sertifikat mTLS',
    content: 'Rotasi secret key API v2.4 dan penandatanganan ulang sertifikat mutual TLS 2048-bit.',
    severity: 'MEDIUM',
    performed_by: 'Security Officer',
  },
  {
    client_id: createdClients[3].id, // HyperScale Logistics API
    activity_type: 'MEETING',
    title: 'Review Arsitektur Migrasi Versi API v2.0 ke v2.4',
    content: 'Rapat evaluasi teknis membahas deprecation query parameter dan payload JSON format baru.',
    severity: 'LOW',
    performed_by: 'Technical Account Manager',
  },
  {
    client_id: createdClients[7].id, // Quantum Ledger Blockchain
    activity_type: 'INCIDENT',
    title: 'Peringatan Latensi Spike > 800ms pada Node RPC',
    content: 'Deteksi spike latensi webhook selama sinkronisasi blok transaksi. Diberikan rekomendasi tuning buffer.',
    severity: 'CRITICAL',
    performed_by: 'Support Tier-3',
  },
];

for (const act of sampleActivities) {
  const stmt = db.prepare(`
    INSERT INTO technical_activities (
      id, client_id, activity_type, title, content, severity, performed_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-${Math.floor(Math.random() * 48)} hours'))
  `);
  stmt.run(
    crypto.randomUUID(),
    act.client_id,
    act.activity_type,
    act.title,
    act.content,
    act.severity,
    act.performed_by
  );
}

console.log(`✅ [Seeding] Successfully seeded ${sampleClients.length} clients and ${sampleActivities.length} technical activities!`);
