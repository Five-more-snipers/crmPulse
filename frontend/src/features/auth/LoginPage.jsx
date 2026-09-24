// @ts-check
import React, { useState } from 'react';
import { useAuthStore, DEMO_CREDENTIALS } from './useAuthStore';

/**
 * Metadata info for each role demo card
 */
const ROLE_DEMO_ITEMS = [
  {
    role: 'ADMIN',
    title: 'Platform Administrator',
    email: DEMO_CREDENTIALS.ADMIN.email,
    password: DEMO_CREDENTIALS.ADMIN.password,
    name: 'Sarah Connor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    badgeClass: 'bg-danger',
    borderClass: 'border-danger border-opacity-50',
    icon: 'bi-shield-lock-fill',
    color: 'text-danger',
    tagline: 'Full Control & Admin Ops',
    description: 'Kontrol penuh ke seluruh modul, audit trail, skema JSON dinamis, dan hapus klien.',
  },
  {
    role: 'ARCHITECT',
    title: 'Solutions Architect',
    email: DEMO_CREDENTIALS.ARCHITECT.email,
    password: DEMO_CREDENTIALS.ARCHITECT.password,
    name: 'Alex Thorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    badgeClass: 'bg-primary',
    borderClass: 'border-primary border-opacity-50',
    icon: 'bi-diagram-3-fill',
    color: 'text-primary',
    tagline: 'Integration Pipeline (Kanban)',
    description: 'Mengelola siklus integrasi kartu Kanban (PoC -> Review -> UAT -> Prod) & probe webhook.',
  },
  {
    role: 'TAM',
    title: 'Tech Account Manager (DevRel)',
    email: DEMO_CREDENTIALS.TAM.email,
    password: DEMO_CREDENTIALS.TAM.password,
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    badgeClass: 'bg-success',
    borderClass: 'border-success border-opacity-50',
    icon: 'bi-person-check-fill',
    color: 'text-success',
    tagline: 'Clients Grid & API Versioning',
    description: 'Memantau versi API deprecated, pencatatan rapat evaluasi, dan kepatuhan SLA klien.',
  },
  {
    role: 'DEVOPS',
    title: 'DevOps / SRE Lead',
    email: DEMO_CREDENTIALS.DEVOPS.email,
    password: DEMO_CREDENTIALS.DEVOPS.password,
    name: 'Ryan Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    badgeClass: 'bg-warning text-dark',
    borderClass: 'border-warning border-opacity-50',
    icon: 'bi-cpu-fill',
    color: 'text-warning',
    tagline: 'Live Webhook SLA & Rate Limiting',
    description: 'Pemantauan live probe SLA webhook, tuning batasan RPS, dan penanganan insiden.',
  },
];

/**
 * Modern Dark Glassmorphism Login Page
 * @param {Object} props
 * @param {(selectedRole: string) => void} [props.onLoginSuccess]
 */
export default function LoginPage({ onLoginSuccess }) {
  const { login, quickLoginAs, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState('');

  /**
   * Handle standard form submit
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success && onLoginSuccess) {
      onLoginSuccess(result.user?.role);
    }
  };

  /**
   * Handle instant 1-click login for demo role
   * @param {string} role
   */
  const handleQuickLogin = async (role) => {
    clearError();
    setActiveRoleLoggingIn(role);
    const cred = DEMO_CREDENTIALS[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
    }
    const result = await quickLoginAs(/** @type {any} */ (role));
    setActiveRoleLoggingIn('');
    if (result.success && onLoginSuccess) {
      onLoginSuccess(role);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3 bg-body-tertiary text-light">
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-circle mb-3 glow-primary">
            <i className="bi bi-activity text-primary fs-2"></i>
          </div>
          <h1 className="fw-bold text-white mb-1">DevPulse CRM</h1>
          <p className="text-secondary small mb-0">
            Technical Operations, SLA Monitoring & API Integration Management Platform
          </p>
        </div>

        <div className="row g-4 justify-content-center align-items-stretch">
          {/* Left Column: 1-Click Role Selector */}
          <div className="col-lg-7">
            <div className="card glass-panel border-0 shadow-lg p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="text-white mb-0 fw-semibold d-flex align-items-center gap-2">
                      <i className="bi bi-person-gear text-info"></i>
                      Pilih Role Demo (1-Click Login)
                    </h5>
                    <span className="text-secondary small">
                      Tersedia 1 akun wajib untuk masing-masing role operasional teknis
                    </span>
                  </div>
                  <span className="badge bg-dark border border-secondary border-opacity-50 text-secondary">
                    4 Akun Tersedia
                  </span>
                </div>

                <div className="d-flex flex-column gap-3 mt-3">
                  {ROLE_DEMO_ITEMS.map((item) => (
                    <div
                      key={item.role}
                      className={`card bg-dark bg-opacity-60 border p-3 transition-all cursor-pointer ${
                        item.borderClass
                      } ${activeRoleLoggingIn === item.role ? 'glow-primary' : ''}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                      onClick={() => handleQuickLogin(item.role)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="rounded-circle border border-secondary"
                            style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="text-white fw-semibold small">{item.name}</span>
                              <span className={`badge ${item.badgeClass} px-2 py-0 small`}>{item.role}</span>
                            </div>
                            <div className="text-secondary small mono-font">{item.email}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 px-3"
                          disabled={isLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(item.role);
                          }}
                        >
                          {activeRoleLoggingIn === item.role ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" />
                              <span>Masuk...</span>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-arrow-in-right"></i>
                              <span>Masuk</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-top border-secondary border-opacity-10 text-secondary small">
                        <i className={`bi ${item.icon} ${item.color} me-1`}></i>
                        <span>{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-secondary small d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-info-circle me-1 text-info"></i> Password bawaan semua akun: <code>password123</code> (atau <code>admin123</code> dsb)
                </span>
                <span className="mono-font text-info small">SQLite WAL • JWT</span>
              </div>
            </div>
          </div>

          {/* Right Column: Manual Credential Login */}
          <div className="col-lg-5">
            <div className="card glass-panel border-0 shadow-lg p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="text-white mb-1 fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-key text-primary"></i>
                  Masuk Manual
                </h5>
                <p className="text-secondary small mb-4">
                  Gunakan alamat email dan password akun terdaftar
                </p>

                {error && (
                  <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger py-2 px-3 small d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-octagon-fill"></i>
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white small"
                      onClick={clearError}
                      aria-label="Close"
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small mb-1">Alamat Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: admin@devpulse.io"
                        className="form-control bg-dark text-light border-secondary border-opacity-25"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-secondary small mb-1">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="form-control bg-dark text-light border-secondary border-opacity-25"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-secondary border-opacity-25"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-medium shadow-sm"
                  >
                    {isLoading && !activeRoleLoggingIn ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Masuk ke Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security Hint */}
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 small text-secondary">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-shield-check text-success"></i>
                  <span className="text-light fw-medium">Keamanan Sesi Terisolasi</span>
                </div>
                <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem' }}>
                  Akses dilindungi token JWT (Bearer) dan HTTP-Only Cookie dengan verifikasi PBKDF2/SHA-512.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
