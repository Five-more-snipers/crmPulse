// @ts-check
import React, { useState } from 'react';
import { WebhookStatusBadge, SeverityBadge, TierBadge, StageBadge } from '../../components/common/StatusBadge';
import JsonMetadataViewer from '../../components/common/JsonMetadataViewer';
import DataTable from '../../components/common/DataTable';

export default function ComponentShowcase() {
  const [sampleJson, setSampleJson] = useState({
    api_version: 'v2.4',
    runtime_stack: 'Node.js 20 LTS',
    rate_limit_rps: 1500,
    mtls_enabled: true,
    webhook_url: 'https://api.client.internal/events',
  });

  const sampleColumns = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'component', label: 'Nama Komponen' },
    { key: 'status', label: 'Varian UI' },
  ];

  const sampleData = [
    { id: '1', component: 'WebhookStatusBadge', status: 'Healthy, Degraded, Failing' },
    { id: '2', component: 'SeverityBadge', status: 'LOW, MEDIUM, HIGH, CRITICAL' },
    { id: '3', component: 'JsonMetadataViewer', status: 'Inspect & Live Edit' },
    { id: '4', component: 'DataTable', status: 'Sortable, Paginated, Loading State' },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div>
        <h2 className="fs-4 fw-bold text-white mb-1 brand-title d-flex align-items-center gap-2">
          <i className="bi bi-palette-fill text-primary"></i>
          Katalog Komponen Storybook & Design System
        </h2>
        <p className="text-secondary small mb-0">
          Isolasi pengujian dan visualisasi varian UI status badges, data grid, dan editor JSON dinamis.
        </p>
      </div>

      <div className="row g-4">
        {/* Status & Severity Badges */}
        <div className="col-12 col-lg-6">
          <div className="card glass-panel border-0 p-4 h-100">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-tag-fill text-warning"></i>
              1. Status & Severity Badges
            </h5>

            <div className="mb-4">
              <span className="small text-secondary d-block mb-2 fw-semibold">Webhook Status (Pulsing Dot):</span>
              <div className="d-flex flex-wrap gap-2">
                <WebhookStatusBadge status="healthy" label="HEALTHY (200 OK)" />
                <WebhookStatusBadge status="degraded" label="DEGRADED (>150ms)" />
                <WebhookStatusBadge status="failing" label="FAILING (502 / TIMEOUT)" />
              </div>
            </div>

            <div className="mb-4">
              <span className="small text-secondary d-block mb-2 fw-semibold">Incident Severity Badges:</span>
              <div className="d-flex flex-wrap gap-2">
                <SeverityBadge severity="CRITICAL" />
                <SeverityBadge severity="HIGH" />
                <SeverityBadge severity="MEDIUM" />
                <SeverityBadge severity="LOW" />
              </div>
            </div>

            <div className="mb-4">
              <span className="small text-secondary d-block mb-2 fw-semibold">SLA Technical Tiers:</span>
              <div className="d-flex flex-wrap gap-2">
                <TierBadge tier="Mission-Critical" />
                <TierBadge tier="Enterprise SLA" />
                <TierBadge tier="Standard" />
              </div>
            </div>

            <div>
              <span className="small text-secondary d-block mb-2 fw-semibold">Pipeline Integration Stages:</span>
              <div className="d-flex flex-wrap gap-2">
                <StageBadge stage="sandbox" />
                <StageBadge stage="review" />
                <StageBadge stage="uat" />
                <StageBadge stage="production" />
                <StageBadge stage="maintenance" />
              </div>
            </div>
          </div>
        </div>

        {/* Live JsonMetadataViewer */}
        <div className="col-12 col-lg-6">
          <div className="card glass-panel border-0 p-4 h-100">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-braces text-info"></i>
              2. Interactive JsonMetadataViewer
            </h5>
            <p className="small text-secondary mb-3">
              Uji manipulasi objek JSON SQLite secara real-time. Klik <strong>Edit JSON</strong> untuk mengubah nilai atau menambah properti baru.
            </p>
            <JsonMetadataViewer
              data={sampleJson}
              editable={true}
              onSave={(updated) => setSampleJson(updated)}
            />
          </div>
        </div>

        {/* DataTable Preview */}
        <div className="col-12">
          <div className="card glass-panel border-0 p-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-table text-success"></i>
              3. Generic Reusable DataTable
            </h5>
            <DataTable
              columns={sampleColumns}
              data={sampleData}
              totalItems={sampleData.length}
              page={1}
              totalPages={1}
              limit={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
