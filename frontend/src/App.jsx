// @ts-check
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from './services/apiClient';
import ClientsPage from './features/clients/ClientsPage';
import KanbanBoard from './features/integrations/KanbanBoard';
import WebhookMonitoringPage from './features/monitoring/WebhookMonitoringPage';
import TechnicalTimelinePage from './features/activities/TechnicalTimelinePage';
import ComponentShowcase from './features/storybook/ComponentShowcase';
import LoginPage from './features/auth/LoginPage';
import { useAuthStore, DEMO_CREDENTIALS } from './features/auth/useAuthStore';

/**
 * Fetch backend health status
 */
async function fetchHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

/**
 * Role badge styling configuration
 */
const ROLE_BADGE_CONFIG = {
  ADMIN: { label: 'ADMIN', bgClass: 'bg-danger text-white', icon: 'bi-shield-lock-fill' },
  ARCHITECT: { label: 'ARCHITECT', bgClass: 'bg-primary text-white', icon: 'bi-diagram-3-fill' },
  TAM: { label: 'TAM', bgClass: 'bg-success text-white', icon: 'bi-person-check-fill' },
  DEVOPS: { label: 'DEVOPS', bgClass: 'bg-warning text-dark', icon: 'bi-cpu-fill' },
};

export default function App() {
  const { user, isAuthenticated, isCheckingAuth, checkAuth, logout, quickLoginAs, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('clients');
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Initialize and check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Adjust default tab when user changes
  useEffect(() => {
    if (user?.role && DEMO_CREDENTIALS[user.role]?.defaultTab) {
      setActiveTab(DEMO_CREDENTIALS[user.role].defaultTab);
    }
  }, [user?.role]);

  const { data, isLoading: isHealthLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchHealth,
    enabled: isAuthenticated,
  });

  /**
   * Handle fast role switching from navbar
   * @param {'ADMIN'|'ARCHITECT'|'TAM'|'DEVOPS'} role
   */
  const handleSwitchRole = async (role) => {
    setIsSwitchingRole(true);
    await quickLoginAs(role);
    setIsSwitchingRole(false);
  };

  // 1. Loading screen while verifying stored token/session
  if (isCheckingAuth) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-body-tertiary text-light">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Memuat sesi...</span>
        </div>
        <p className="text-secondary small mono-font">Memeriksa sesi otentikasi DevPulse CRM...</p>
      </div>
    );
  }

  // 2. Render Login Page if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          if (role && DEMO_CREDENTIALS[role]?.defaultTab) {
            setActiveTab(DEMO_CREDENTIALS[role].defaultTab);
          }
        }}
      />
    );
  }

  const roleConfig = ROLE_BADGE_CONFIG[user.role] || {
    label: user.role,
    bgClass: 'bg-secondary',
    icon: 'bi-person',
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary text-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-xl navbar-dark border-bottom border-secondary border-opacity-25 px-4 py-2 bg-dark sticky-top shadow-sm">
        <div className="container-fluid px-0">
          {/* Brand */}
          <div className="d-flex align-items-center gap-2 me-4">
            <div
              className="bg-primary rounded p-2 text-white d-flex align-items-center justify-content-center glow-primary"
              style={{ width: 38, height: 38 }}
            >
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
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 position-relative ${
                activeTab === 'clients'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-database-check"></i>
              <span>Data Grid Klien</span>
              {user.role === 'TAM' && (
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-1 py-0 ms-1 small" style={{ fontSize: '0.65rem' }}>
                  Fokus Role
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 position-relative ${
                activeTab === 'kanban'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-kanban"></i>
              <span>Pipeline Kanban</span>
              {user.role === 'ARCHITECT' && (
                <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-1 py-0 ms-1 small" style={{ fontSize: '0.65rem' }}>
                  Fokus Role
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 position-relative ${
                activeTab === 'monitoring'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-broadcast"></i>
              <span>Monitoring & SLA</span>
              {user.role === 'DEVOPS' && (
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25 px-1 py-0 ms-1 small" style={{ fontSize: '0.65rem' }}>
                  Fokus Role
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'timeline'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-clock-history"></i>
              <span>Timeline Insiden</span>
            </button>

            <button
              onClick={() => setActiveTab('showcase')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'showcase'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-palette"></i>
              <span>Katalog Storybook</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${
                activeTab === 'overview'
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary text-secondary border-0'
              }`}
            >
              <i className="bi bi-speedometer2"></i>
              <span>Status Fondasi</span>
            </button>
          </div>

          {/* Right Section: Swagger, API Status, and User Profile Dropdown */}
          <div className="d-flex align-items-center gap-3">
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 d-none d-md-flex"
              title="Buka dokumentasi interaktif Swagger / OpenAPI"
            >
              <i className="bi bi-journal-code"></i>
              <span>OpenAPI Docs</span>
            </a>

            <span className="text-secondary small d-none d-lg-inline">
              <i className="bi bi-circle-fill text-success me-1 status-pulse"></i>
              API: {data?.success ? 'Connected' : isHealthLoading ? 'Connecting...' : 'Disconnected'}
            </span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 d-none d-sm-flex"
              title="Perbarui status koneksi"
            >
              <i className={`bi bi-arrow-clockwise ${isFetching ? 'spin' : ''}`}></i>
            </button>

            {/* User Profile Pill & Quick Role Switcher */}
            <div className="dropdown">
              <button
                className="btn btn-sm btn-dark border border-secondary border-opacity-50 dropdown-toggle d-flex align-items-center gap-2 py-1 px-2"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="rounded-circle border border-secondary"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                    style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}
                  >
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="text-start d-none d-sm-block">
                  <div className="small fw-semibold text-white lh-1">{user.name}</div>
                </div>
                <span className={`badge ${roleConfig.bgClass} px-2 py-0 small`}>
                  <i className={`bi ${roleConfig.icon} me-1`}></i>
                  {roleConfig.label}
                </span>
              </button>

              <ul
                className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-secondary border-opacity-25"
                aria-labelledby="userDropdown"
                style={{ minWidth: '260px' }}
              >
                <li className="px-3 py-2 border-bottom border-secondary border-opacity-25">
                  <div className="fw-semibold text-white small">{user.name}</div>
                  <div className="text-secondary small mono-font" style={{ fontSize: '0.75rem' }}>
                    {user.email}
                  </div>
                </li>

                <li className="px-3 pt-2 pb-1">
                  <span className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                    Ganti Role Demo (1-Click Switch)
                  </span>
                </li>

                <li>
                  <button
                    className={`dropdown-item small d-flex align-items-center justify-content-between py-2 ${
                      user.role === 'ADMIN' ? 'active' : ''
                    }`}
                    onClick={() => handleSwitchRole('ADMIN')}
                    disabled={isSwitchingRole}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-shield-lock-fill text-danger"></i>
                      <span>Sarah Connor</span>
                    </div>
                    <span className="badge bg-danger py-0">ADMIN</span>
                  </button>
                </li>

                <li>
                  <button
                    className={`dropdown-item small d-flex align-items-center justify-content-between py-2 ${
                      user.role === 'ARCHITECT' ? 'active' : ''
                    }`}
                    onClick={() => handleSwitchRole('ARCHITECT')}
                    disabled={isSwitchingRole}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-diagram-3-fill text-primary"></i>
                      <span>Alex Thorne</span>
                    </div>
                    <span className="badge bg-primary py-0">ARCHITECT</span>
                  </button>
                </li>

                <li>
                  <button
                    className={`dropdown-item small d-flex align-items-center justify-content-between py-2 ${
                      user.role === 'TAM' ? 'active' : ''
                    }`}
                    onClick={() => handleSwitchRole('TAM')}
                    disabled={isSwitchingRole}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-check-fill text-success"></i>
                      <span>Maya Lin</span>
                    </div>
                    <span className="badge bg-success py-0">TAM</span>
                  </button>
                </li>

                <li>
                  <button
                    className={`dropdown-item small d-flex align-items-center justify-content-between py-2 ${
                      user.role === 'DEVOPS' ? 'active' : ''
                    }`}
                    onClick={() => handleSwitchRole('DEVOPS')}
                    disabled={isSwitchingRole}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-cpu-fill text-warning"></i>
                      <span>Ryan Vance</span>
                    </div>
                    <span className="badge bg-warning text-dark py-0">DEVOPS</span>
                  </button>
                </li>

                <li>
                  <hr className="dropdown-divider border-secondary border-opacity-25" />
                </li>

                <li>
                  <button
                    className="dropdown-item small text-danger d-flex align-items-center gap-2 py-2"
                    onClick={() => logout()}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Keluar (Logout)</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Role Context Bar */}
      <div className="bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-10 py-1 px-4 px-lg-5">
        <div className="container-fluid px-0 d-flex flex-wrap justify-content-between align-items-center small text-secondary">
          <div className="d-flex align-items-center gap-2 py-1">
            <span className="text-secondary">Sesi Aktif:</span>
            <span className="text-light fw-medium">{user.name}</span>
            <span className={`badge ${roleConfig.bgClass} px-2 py-0`}>
              {roleConfig.label}
            </span>
            <span className="d-none d-md-inline text-secondary">•</span>
            <span className="d-none d-md-inline text-secondary small">
              {user.role === 'ADMIN' && 'Hak akses penuh ke semua konfigurasi, audit trail, dan data klien.'}
              {user.role === 'ARCHITECT' && 'Fokus pada Pipeline Kanban integrasi teknis dan verifikasi webhook probe.'}
              {user.role === 'TAM' && 'Fokus pada filter versi API usang di Data Grid Klien & pencatatan timeline SLA.'}
              {user.role === 'DEVOPS' && 'Fokus pada monitoring SLA live probe, log error insiden & pengaturan Rate Limit (RPS).'}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 py-1">
            <span className="text-secondary small d-none d-sm-inline">Demo Switch:</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 ${user.role === 'ADMIN' ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => handleSwitchRole('ADMIN')}
                title="Beralih ke Platform Admin"
              >
                Admin
              </button>
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 ${user.role === 'ARCHITECT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleSwitchRole('ARCHITECT')}
                title="Beralih ke Solutions Architect"
              >
                Architect
              </button>
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 ${user.role === 'TAM' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => handleSwitchRole('TAM')}
                title="Beralih ke Tech Account Manager"
              >
                TAM
              </button>
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 ${user.role === 'DEVOPS' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleSwitchRole('DEVOPS')}
                title="Beralih ke DevOps / SRE"
              >
                DevOps
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  <span className={`badge ${data?.success ? 'bg-success' : isHealthLoading ? 'bg-warning text-dark' : 'bg-danger'} px-2 py-1`}>
                    {isHealthLoading ? 'Checking...' : data?.success ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                {isHealthLoading && (
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
                    Status Progres Seluruh Sprint (1 - 5 + Multi-Role Auth)
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
                    <li className="d-flex align-items-center gap-2 text-info fw-medium">
                      <i className="bi bi-shield-check text-info fs-6"></i>
                      <span>Sprint Auth: Multi-Role Login System (ADMIN, ARCHITECT, TAM, DEVOPS) & 1-Click Role Switcher</span>
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
