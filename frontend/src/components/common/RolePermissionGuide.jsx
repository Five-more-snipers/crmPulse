// @ts-check
import React, { useState } from 'react';

/**
 * @typedef {Object} RolePermissionDetail
 * @property {string} status
 * @property {string} statusClass
 * @property {string[]} allowed
 * @property {string[]} restricted
 */

/**
 * @typedef {Object} MenuPermissionDetail
 * @property {string} title
 * @property {string} icon
 * @property {string} color
 * @property {Record<string, RolePermissionDetail>} roles
 */

/**
 * Detailed permission dictionary for each tab and role
 * @type {Record<string, MenuPermissionDetail>}
 */
const MENU_PERMISSIONS = {
  clients: {
    title: 'Data Grid Klien Teknis',
    icon: 'bi-database-check',
    color: 'primary',
    roles: {
      ADMIN: {
        status: 'FULL ACCESS',
        statusClass: 'bg-success text-white',
        allowed: [
          'Tambah klien korporat baru (POST)',
          'Edit seluruh atribut & JSON metadata',
          'Hapus klien dari database (DELETE)',
        ],
        restricted: [],
      },
      ARCHITECT: {
        status: 'TECHNICAL EDIT',
        statusClass: 'bg-info bg-opacity-25 text-info border border-info border-opacity-50',
        allowed: [
          'Tambah klien baru (Onboarding integrasi)',
          'Edit runtime stack & webhook callback URL',
          'Saring versi API klien',
        ],
        restricted: ['Dilarang menghapus akun klien (DELETE 403)'],
      },
      TAM: {
        status: 'ACCOUNT & SLA EDIT',
        statusClass: 'bg-success bg-opacity-25 text-success border border-success border-opacity-50',
        allowed: [
          'Tambah klien baru (Registrasi kemitraan)',
          'Edit kontak Tech Lead & SLA Tier',
          'Filter versi API usang (deprecated)',
        ],
        restricted: ['Dilarang menghapus akun klien (DELETE 403)'],
      },
      DEVOPS: {
        status: 'RATE LIMIT ONLY',
        statusClass: 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50',
        allowed: [
          'Inspeksi seluruh profil & metrik klien',
          'Menyesuaikan kuota batas Rate Limit (RPS)',
        ],
        restricted: [
          'Dilarang mendaftar klien baru (Onboarding via TAM/Architect)',
          'Dilarang menghapus klien (DELETE 403)',
        ],
      },
    },
  },
  kanban: {
    title: 'Pipeline Kanban Integrasi Teknis',
    icon: 'bi-kanban',
    color: 'primary',
    roles: {
      ADMIN: {
        status: 'FULL ACCESS',
        statusClass: 'bg-success text-white',
        allowed: [
          'Geser kartu antar tahapan (Drag & Drop)',
          'Update tahapan integrasi (PATCH /stage)',
          'Inspeksi & edit JSON metadata kartu',
        ],
        restricted: [],
      },
      ARCHITECT: {
        status: 'FULL ACCESS (FOKUS UTAMA)',
        statusClass: 'bg-primary text-white',
        allowed: [
          'Pemilik alur integrasi (PoC -> Review -> UAT -> Prod)',
          'Geser kartu antar tahapan (Drag & Drop)',
          'Validasi parameter webhook & MTLS',
        ],
        restricted: [],
      },
      TAM: {
        status: 'VIEW-ONLY (RESTRICTED)',
        statusClass: 'bg-primary text-white',
        allowed: [
          'Melihat posisi tahapan integrasi klien',
          'Inspeksi metadata dan SLA Tier',
        ],
        restricted: [
          'Kartu dikunci (Non-draggable)',
          'Dilarang memindahkan tahapan integrasi (PATCH 403)',
        ],
      },
      DEVOPS: {
        status: 'VIEW-ONLY (RESTRICTED)',
        statusClass: 'bg-primary text-white',
        allowed: [
          'Memantau kesiapan klien menuju tahapan Go-Live',
          'Inspeksi konfigurasi teknis',
        ],
        restricted: [
          'Kartu dikunci (Non-draggable)',
          'Dilarang memindahkan tahapan integrasi (PATCH 403)',
        ],
      },
    },
  },
  monitoring: {
    title: 'Monitoring & SLA Webhook',
    icon: 'bi-broadcast',
    color: 'info',
    roles: {
      ADMIN: {
        status: 'FULL ACCESS',
        statusClass: 'bg-success text-white',
        allowed: [
          'Pantau statistik latensi & metrik kegagalan',
          'Eksekusi Live Network Probe (Ping Webhook)',
          'Akses konfigurasi interval SLA probe',
        ],
        restricted: [],
      },
      ARCHITECT: {
        status: 'INTERACTIVE PROBE',
        statusClass: 'bg-info text-white',
        allowed: [
          'Eksekusi Live Probe (Ping Webhook)',
          'Verifikasi endpoint callback URL',
          'Analisis status HTTP & response header',
        ],
        restricted: [],
      },
      TAM: {
        status: 'SLA VIEW ONLY (RESTRICTED)',
        statusClass: 'bg-info text-white',
        allowed: [
          'Melihat riwayat status kesehatan SLA klien',
          'Meninjau total RPS dan status degradasi',
        ],
        restricted: [
          'Tombol probe dinonaktifkan (SLA View)',
          'Dilarang melakukan network ping teknis (POST 403)',
        ],
      },
      DEVOPS: {
        status: 'FULL ACCESS (FOKUS UTAMA)',
        statusClass: 'bg-warning text-dark fw-bold',
        allowed: [
          'Eksekusi live network ping probe ke klien',
          'Analisis lonjakan latensi (>150ms) & spike 5xx',
          'Pemeriksaan kepatuhan SLA Mission-Critical',
        ],
        restricted: [],
      },
    },
  },
  timeline: {
    title: 'Timeline Aktivitas & Insiden',
    icon: 'bi-clock-history',
    color: 'warning',
    roles: {
      ADMIN: {
        status: 'FULL ACCESS',
        statusClass: 'bg-success text-white',
        allowed: [
          'Catat insiden, evaluasi, dan rotasi kunci',
          'Akses penuh ke Virtual Audit Trail sistem (@virtual)',
          'Filter log berdasarkan level keparahan',
        ],
        restricted: [],
      },
      ARCHITECT: {
        status: 'FEED VIEW ONLY (RESTRICTED)',
        statusClass: 'bg-primary text-white',
        allowed: [
          'Membaca feed kronologis seluruh aktivitas teknis',
          'Analisis histori kendala integrasi',
        ],
        restricted: [
          'Tombol pencatatan aktivitas dinonaktifkan',
          'Sub-tab Virtual Audit Log TERKUNCI (403 Forbidden)',
        ],
      },
      TAM: {
        status: 'MEETINGS LOG ONLY (RESTRICTED)',
        statusClass: 'bg-primary text-white',
        allowed: [
          'Mencatat aktivitas evaluasi bulanan & meeting klien',
          'Melihat riwayat insiden SLA',
        ],
        restricted: [
          'Sub-tab Virtual Audit Log TERKUNCI (403 Forbidden)',
        ],
      },
      DEVOPS: {
        status: 'FULL ACCESS (FOKUS UTAMA)',
        statusClass: 'bg-warning text-dark fw-bold',
        allowed: [
          'Mencatat insiden gangguan teknis & mitigasi',
          'Akses penuh ke Virtual Audit Trail (@virtual) 500+ entri',
          'Investigasi root-cause failure klien',
        ],
        restricted: [],
      },
    },
  },
  showcase: {
    title: 'Katalog Storybook Komponen',
    icon: 'bi-palette',
    color: 'secondary',
    roles: {
      ADMIN: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Inspeksi seluruh katalog UI'], restricted: [] },
      ARCHITECT: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Inspeksi seluruh katalog UI'], restricted: [] },
      TAM: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Inspeksi seluruh katalog UI'], restricted: [] },
      DEVOPS: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Inspeksi seluruh katalog UI'], restricted: [] },
    },
  },
  overview: {
    title: 'Status Fondasi & Arsitektur',
    icon: 'bi-speedometer2',
    color: 'secondary',
    roles: {
      ADMIN: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Pantau SQLite WAL & API Health'], restricted: [] },
      ARCHITECT: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Pantau SQLite WAL & API Health'], restricted: [] },
      TAM: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Pantau SQLite WAL & API Health'], restricted: [] },
      DEVOPS: { status: 'FULL ACCESS', statusClass: 'bg-success text-white', allowed: ['Pantau SQLite WAL & API Health'], restricted: [] },
    },
  },
};

const ROLE_INFO = [
  {
    key: 'ADMIN',
    name: 'Sarah Connor',
    label: 'Platform Admin',
    badge: 'bg-danger text-white',
    icon: 'bi-shield-lock-fill',
  },
  {
    key: 'ARCHITECT',
    name: 'Alex Thorne',
    label: 'Solutions Architect',
    badge: 'bg-primary text-white',
    icon: 'bi-diagram-3-fill',
  },
  {
    key: 'TAM',
    name: 'Maya Lin',
    label: 'Tech Account Mgr',
    badge: 'bg-success text-white',
    icon: 'bi-person-check-fill',
  },
  {
    key: 'DEVOPS',
    name: 'Ryan Vance',
    label: 'DevOps / SRE',
    badge: 'bg-warning text-dark',
    icon: 'bi-cpu-fill',
  },
];

/**
 * Interactive Role Permission Guide Footer Component for Demo Mode
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab key
 * @param {string} [props.currentRole] - Role of currently logged in user
 * @param {(role: any) => void} props.onSwitchRole - Function to switch role
 * @param {boolean} [props.isSwitchingRole]
 */
export default function RolePermissionGuide({
  activeTab,
  currentRole = 'ADMIN',
  onSwitchRole,
  isSwitchingRole = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuData = MENU_PERMISSIONS[activeTab] || MENU_PERMISSIONS.clients;

  return (
    <div className="card glass-panel border border-secondary border-opacity-25 shadow-lg rounded-3 overflow-hidden">
      {/* Header Bar */}
      <div
        className="card-header bg-dark bg-opacity-90 border-bottom border-secondary border-opacity-25 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2 cursor-pointer"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-20 p-2 rounded text-primary d-flex align-items-center justify-content-center">
            <i className={`bi ${menuData.icon} fs-5`}></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-white fw-bold">
                Matriks Hak Akses Role pada Menu: {menuData.title}
              </span>
              <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 small">
                Demo Guide
              </span>
            </div>
            <span className="text-secondary small">
              Pelajari pembatasan fitur dan aksi yang berlaku untuk setiap role di menu ini. Klik salah satu tombol role untuk langsung menguji perbedaannya.
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-3"
            onClick={(/** @type {any} */ e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            <span>{isExpanded ? 'Sembunyikan' : 'Buka Matriks'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Content Body */}
      {isExpanded && (
        <div className="card-body p-4 bg-black bg-opacity-30">
          <div className="row g-3">
            {ROLE_INFO.map((roleItem) => {
              const isCurrent = currentRole === roleItem.key;
              const perm = menuData.roles[roleItem.key] || {
                status: 'VIEW ACCESS',
                statusClass: 'bg-secondary',
                allowed: ['Melihat informasi halaman'],
                restricted: [],
              };

              return (
                <div key={roleItem.key} className="col-12 col-md-6 col-xl-3">
                  <div
                    className={`card h-100 border p-3 transition-all ${
                      isCurrent
                        ? 'bg-dark bg-opacity-90 border-primary shadow glow-primary'
                        : 'bg-dark bg-opacity-50 border-secondary border-opacity-25'
                    }`}
                    style={{
                      transform: isCurrent ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    {/* Role Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className={`badge ${roleItem.badge} px-2 py-0 small`}>
                            <i className={`bi ${roleItem.icon} me-1`}></i>
                            {roleItem.key}
                          </span>
                          {isCurrent && (
                            <span className="badge bg-primary text-white px-2 py-0 small d-flex align-items-center gap-1">
                              <i className="bi bi-person-badge-fill"></i>
                              Role Anda
                            </span>
                          )}
                        </div>
                        <div className="text-white fw-semibold small">{roleItem.name}</div>
                        <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                          {roleItem.label}
                        </div>
                      </div>
                    </div>

                    {/* Permission Status Pill */}
                    <div className="my-2">
                      <span className={`badge ${perm.statusClass} w-100 py-1 text-center small`}>
                        {perm.status}
                      </span>
                    </div>

                    {/* Permissions Detail Lists */}
                    <div className="flex-grow-1 d-flex flex-column gap-2 mt-2 pt-2 border-top border-secondary border-opacity-10 small">
                      {/* Allowed items */}
                      {perm.allowed.length > 0 && (
                        <div>
                          <div className="text-success fw-semibold small d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-check-circle-fill"></i>
                            <span>Akses Diizinkan:</span>
                          </div>
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                            {perm.allowed.map((item, idx) => (
                              <li key={idx} className="d-flex align-items-start gap-1">
                                <i className="bi bi-check2 text-success mt-1"></i>
                                <span className="text-light">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Restricted items */}
                      {perm.restricted.length > 0 ? (
                        <div className="mt-1">
                          <div className="text-danger fw-semibold small d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-slash-circle-fill"></i>
                            <span>Aksi Dibatasi (Restricted):</span>
                          </div>
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                            {perm.restricted.map((item, idx) => (
                              <li key={idx} className="d-flex align-items-start gap-1">
                                <i className="bi bi-lock-fill text-danger mt-1"></i>
                                <span className="text-danger-emphasis">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small w-100 text-center" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-shield-check me-1"></i> Tidak ada batasan pada menu ini
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 1-Click Role Switch Action */}
                    <div className="mt-3 pt-2 border-top border-secondary border-opacity-10">
                      {isCurrent ? (
                        <div className="text-center py-1 text-primary small fw-semibold">
                          <i className="bi bi-check-circle me-1"></i>
                          Sedang Aktif
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isSwitchingRole}
                          onClick={() => onSwitchRole(roleItem.key)}
                          className="btn btn-xs btn-outline-light w-100 py-1 d-flex align-items-center justify-content-center gap-1 small"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-arrow-repeat"></i>
                          <span>Uji sebagai {roleItem.key}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
