// @ts-check
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevPulse CRM API Specification',
      version: '1.0.0',
      description: 'Technical Operations, SLA Monitoring & API Integration Management Platform REST API Documentation',
      contact: {
        name: 'DevPulse Engineering Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      schemas: {
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            company_name: { type: 'string', example: 'Nexus Cloud Analytics' },
            technical_tier: { type: 'string', enum: ['Standard', 'Enterprise SLA', 'Mission-Critical'], example: 'Enterprise SLA' },
            integration_stage: { type: 'string', enum: ['sandbox', 'review', 'uat', 'production', 'maintenance'], example: 'uat' },
            assigned_engineer_id: { type: 'string', example: 'eng-maya-02' },
            rate_limit_rps: { type: 'integer', example: 1200 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            technical_metadata: {
              type: 'object',
              properties: {
                api_version: { type: 'string', example: 'v2.4' },
                runtime_stack: { type: 'string', example: 'Node.js 20' },
                webhook_url: { type: 'string', example: 'https://webhook.nexuscloud.io/events/crm' },
              },
            },
          },
        },
        TechnicalActivity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            client_id: { type: 'string', format: 'uuid' },
            activity_type: { type: 'string', enum: ['INCIDENT', 'MEETING', 'CONFIG_CHANGE', 'KEY_ROTATION'] },
            title: { type: 'string' },
            content: { type: 'string' },
            severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            performed_by: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Periksa status kesehatan server dan database SQLite',
          responses: {
            200: {
              description: 'Server dan SQLite beroperasi normal',
            },
          },
        },
      },
      '/api/clients': {
        get: {
          summary: 'Dapatkan daftar klien teknis terpaginasi dengan filter JSON dinamis',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari nama korporasi' },
            { name: 'stage', in: 'query', schema: { type: 'string' }, description: 'Filter tahapan integrasi' },
            { name: 'tier', in: 'query', schema: { type: 'string' }, description: 'Filter SLA tier' },
            { name: 'apiVersion', in: 'query', schema: { type: 'string' }, description: 'Filter versi API via SQLite json_extract' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Daftar klien berhasil dimuat' },
          },
        },
        post: {
          summary: 'Registrasi klien teknis baru dan catat ke audit trail',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Client' },
              },
            },
          },
          responses: {
            201: { description: 'Klien berhasil didaftarkan' },
          },
        },
      },
      '/api/clients/{id}/stage': {
        patch: {
          summary: 'Pembaruan cepat tahapan integrasi klien (untuk Kanban Board)',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stage: { type: 'string', enum: ['sandbox', 'review', 'uat', 'production', 'maintenance'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Tahapan berhasil diperbarui' },
          },
        },
      },
      '/api/activities': {
        get: {
          summary: 'Dapatkan feed aktivitas dan insiden teknis kronologis',
          responses: {
            200: { description: 'Feed aktivitas berhasil dimuat' },
          },
        },
        post: {
          summary: 'Catat insiden atau aktivitas teknis baru',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TechnicalActivity' },
              },
            },
          },
          responses: {
            201: { description: 'Aktivitas berhasil dicatat' },
          },
        },
      },
      '/api/monitoring/webhook-ping': {
        post: {
          summary: 'Simulasi probe langsung webhook klien untuk mengukur latensi dan SLA',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    webhook_url: { type: 'string' },
                    company_name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Hasil probe webhook' },
          },
        },
      },
    },
  },
  apis: [], // Defined inline in specification above
};

export const swaggerSpec = swaggerJsdoc(options);
