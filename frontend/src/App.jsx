import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from './services/apiClient';
import ClientsPage from './features/clients/ClientsPage';
import KanbanBoard from './features/integrations/KanbanBoard';
import WebhookMonitoringPage from './features/monitoring/WebhookMonitoringPage';
import TechnicalTimelinePage from './features/activities/TechnicalTimelinePage';
import ComponentShowcase from './features/storybook/ComponentShowcase';

/**
 * Fetch backend health status
 */
async function fetchHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('clients');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchHealth,
  });

  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary text-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-xl navbar-dark border-bottom border-secondary border-opacity-25 px-4 py-3 bg-dark sticky-top shadow-sm">
        <div className="container-fluid px-0">
          {/* Brand */}
          <div className="d-flex align-items-center gap-2 me-4">
            <div className="bg-primary rounded p-2 text-white d-flex align-items-center justify-content-center glow-primary" style={{ width: 38, height: 38 }}>
              <i className="bi bi-activity fs-5"></i>
            </div>
            <div>
              <span className="navbar-brand brand-title mb-0 fs-5 text-white">DevPulse CRM</span>
              <span className="badge bg-secondary bg-opacity-25 text-info border border-info border-opacity-25 ms-2 px-2 py-1 small">
                Technical Ops & SLA
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="d-flex flex-wrap align-items-center gap-1 my-2 my-xl-0 flex-grow-1">
            <button
              onClick={() => setActiveTab('clients')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'clients' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-database-check"></i>
              <span>Data Grid Klien</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'kanban' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-kanban"></i>
              <span>Pipeline Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'monitoring' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-broadcast"></i>
              <span>Monitoring & SLA</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'timeline' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-clock-history"></i>
              <span>Timeline Insiden</span>
            </button>

            <button
              onClick={() => setActiveTab('showcase')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'showcase' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-palette"></i>
              <span>Katalog Storybook</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'overview' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-speedometer2"></i>
              <span>Status Fondasi</span>
            </button>
          </div>

          {/* Right Status & Swagger Link */}
          <div className="d-flex align-items-center gap-3">
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
              title="Buka dokumentasi interaktif Swagger / OpenAPI"
            >
              <i className="bi bi-journal-code"></i>
              <span>OpenAPI Docs</span>
            </a>

            <span className="text-secondary small d-none d-lg-inline">
              <i className="bi bi-circle-fill text-success me-1 status-pulse"></i>
              API: {data?.success ? 'Connected' : isLoading ? 'Connecting...' : 'Disconnected'}
            </span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
              title="Perbarui status koneksi"
            >
              <i className={`bi bi-arrow-clockwise ${isFetching ? 'spin' : ''}`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container-fluid px-4 px-lg-5 my-4 flex-grow-1">
        {activeTab === 'clients' && <ClientsPage />}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'monitoring' && <WebhookMonitoringPage />}
        {activeTab === 'timeline' && <TechnicalTimelinePage />}
        {activeTab === 'showcase' && <ComponentShowcase />}

        {activeTab === 'overview' && (
          <div className="row g-4 justify-content-center">
            {/* Header Banner */}
            <div className="col-12 text-center mb-2">
              <h1 className="display-6 fw-bold text-white mb-2">
                Technical Operations & API Management
              </h1>
              <p className="text-secondary lead mx-auto" style={{ maxWidth: 650 }}>
                Fondasi infrastruktur DevPulse CRM berbasis React.js, Express.js, SQLite (WAL Mode), dan Bootstrap 5.
              </p>
            </div>

            {/* System Health Check Card */}
            <div className="col-md-8 col-lg-6">
              <div className="card glass-panel glow-primary border-0 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title text-white mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-hdd-network text-primary"></i>
                    Status Koneksi API & Database
                  </h5>
                  <span className={`badge ${data?.success ? 'bg-success' : isLoading ? 'bg-warning text-dark' : 'bg-danger'} px-2 py-1`}>
                    {isLoading ? 'Checking...' : data?.success ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                {isLoading && (
                  <div className="text-center py-4 text-secondary">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memeriksa konektivitas backend dan SQLite...
                  </div>
                )}

                {isError && (
                  <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger py-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Gagal menghubungi backend: {error?.message || 'Pastikan backend server berjalan di port 5000'}
                  </div>
                )}

                {data && (
                  <div className="mt-2">
                    <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-10 mono-font small">
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-10">
                        <span className="text-secondary">Service:</span>
                        <span className="text-white fw-semibold">{data.service}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-10">
                        <span className="text-secondary">Database Engine:</span>
                        <span className="text-info fw-semibold">{data.database?.engine} (v{data.database?.version})</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-10">
                        <span className="text-secondary">Database Connection:</span>
                        <span className="text-success fw-semibold">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Connected (WAL Mode)
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-secondary">Server Timestamp:</span>
                        <span className="text-light">{data.timestamp}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Sprints Checklist */}
                <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <h6 className="text-white small fw-bold mb-3 text-uppercase text-secondary">
                    Status Progres Seluruh Sprint (1 - 5)
                  </h6>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                    <li className="d-flex align-items-center gap-2 text-light">
                      <i className="bi bi-check2-circle text-success fs-6"></i>
                      <span>Sprint 1: Fondasi Monorepo, Express, SQLite WAL, React Bootstrap 5</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 text-light">
                      <i className="bi bi-check2-circle text-success fs-6"></i>
                      <span>Sprint 2: Data Grid Klien, Filter Dynamic SQLite JSON (<code>json_extract</code>), Audit Trail</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 text-light">
                      <i className="bi bi-check2-circle text-success fs-6"></i>
                      <span>Sprint 3: Pipeline Kanban Integrasi Teknis dengan Drag-and-Drop & Optimistic Updates</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 text-light">
                      <i className="bi bi-check2-circle text-success fs-6"></i>
                      <span>Sprint 4: Monitoring SLA, Live Probe Webhook & Feed Kronologis Insiden Teknis</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 text-light">
                      <i className="bi bi-check2-circle text-success fs-6"></i>
                      <span>Sprint 5: DOM Virtualization (@tanstack/react-virtual), OpenAPI 3.0 Swagger UI & Storybook Showcase</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 border-top border-secondary border-opacity-10 text-center text-secondary small">
        DevPulse CRM &copy; {new Date().getFullYear()} &mdash; Technical Operations, SLA Monitoring & API Integration Management Platform
      </footer>
    </div>
  );
}
