// @ts-check
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../../services/apiClient';
import { SeverityBadge, TierBadge } from '../../components/common/StatusBadge';
import ModalForm from '../../components/common/ModalForm';
import VirtualAuditLog from './VirtualAuditLog';
import { useAuthStore } from '../auth/useAuthStore';

export default function TechnicalTimelinePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canAccessAudit = user?.role === 'ADMIN' || user?.role === 'DEVOPS';
  const canRecordActivity = user?.role === 'ADMIN' || user?.role === 'TAM' || user?.role === 'DEVOPS';

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('timeline'); // 'timeline' | 'audit'

  // Fetch technical activities
  const { data: activitiesResponse, isLoading } = useQuery({
    queryKey: ['activities', { severityFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (severityFilter) params.set('severity', severityFilter);
      const res = await apiClient.get(`/activities?${params.toString()}`);
      return res.data;
    },
  });

  // Fetch clients for incident association
  const { data: clientsResponse } = useQuery({
    queryKey: ['clients-for-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/clients?limit=50');
      return res.data;
    },
  });

  // Create Activity Mutation
  const createActivityMutation = useMutation({
    mutationFn: (newActivity) => apiClient.post('/activities', newActivity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowIncidentModal(false);
      reset();
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      client_id: '',
      activity_type: 'INCIDENT',
      title: '',
      content: '',
      severity: 'HIGH',
    },
  });

  const onSubmit = (data) => {
    createActivityMutation.mutate(data);
  };

  const activities = activitiesResponse?.data || [];
  const clients = clientsResponse?.data || [];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'INCIDENT':
        return { icon: 'bi-exclamation-triangle-fill', color: 'text-danger', bg: 'bg-danger bg-opacity-20' };
      case 'KEY_ROTATION':
        return { icon: 'bi-key-fill', color: 'text-warning', bg: 'bg-warning bg-opacity-20' };
      case 'CONFIG_CHANGE':
        return { icon: 'bi-gear-wide-connected', color: 'text-primary', bg: 'bg-primary bg-opacity-20' };
      case 'MEETING':
        return { icon: 'bi-people-fill', color: 'text-info', bg: 'bg-info bg-opacity-20' };
      default:
        return { icon: 'bi-check-circle-fill', color: 'text-success', bg: 'bg-success bg-opacity-20' };
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="fs-4 fw-bold text-white mb-1 brand-title d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-warning"></i>
            Timeline Aktivitas Teknis & Insiden
          </h2>
          <p className="text-secondary small mb-0">
            Pencatatan kronologis riwayat evaluasi teknis, insiden SLA, rotasi kredensial, dan virtualisasi audit trail.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => setActiveSubTab('timeline')}
              className={`btn ${activeSubTab === 'timeline' ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              <i className="bi bi-list-nested me-1"></i>
              Feed Insiden
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`btn ${activeSubTab === 'audit' ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              {canAccessAudit ? (
                <>
                  <i className="bi bi-shield-check me-1"></i>
                  Virtual Audit Log (@virtual)
                </>
              ) : (
                <>
                  <i className="bi bi-lock-fill text-warning me-1"></i>
                  Audit Trail (Terkunci)
                </>
              )}
            </button>
          </div>

          {canRecordActivity ? (
            <button
              onClick={() => {
                reset();
                setShowIncidentModal(true);
              }}
              className="btn btn-sm btn-danger d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle"></i>
              Catat Insiden / Aktivitas
            </button>
          ) : (
            <button
              disabled
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 opacity-50"
              title="Solutions Architect berfokus pada alur Kanban (Pencatatan insiden dikelola oleh DevOps/TAM)"
              style={{ cursor: 'not-allowed' }}
            >
              <i className="bi bi-lock-fill"></i>
              Catat Aktivitas
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        canAccessAudit ? (
          <VirtualAuditLog />
        ) : (
          <div className="card glass-panel border-0 p-5 text-center my-3">
            <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger mb-3 mx-auto">
              <i className="bi bi-shield-slash fs-1"></i>
            </div>
            <h4 className="text-white fw-bold mb-2">Akses Audit Trail Dibatasi (403 Forbidden)</h4>
            <p className="text-secondary small mx-auto mb-3" style={{ maxWidth: 520 }}>
              Virtual Audit Trail memuat rekam jejak investigasi keamanan sistem dan perubahan parameter teknis sensitif. Modul ini dibatasi khusus untuk Platform Security Administrator dan DevOps / SRE Lead.
            </p>
            <div className="badge bg-dark border border-secondary border-opacity-50 text-secondary py-2 px-3 mx-auto">
              Role Anda saat ini: <strong className="text-white ms-1">{user?.role}</strong> (Akses Ditolak)
            </div>
          </div>
        )
      ) : (
        <>
          {/* Filter Bar */}
          <div className="card glass-panel border-0 p-3">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small text-secondary fw-semibold">Saring berdasarkan Keparahan (Severity):</span>
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">Semua Level Keparahan</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Timeline Feed Container */}
          <div className="card glass-panel border-0 p-4">
            {isLoading ? (
              <div className="text-center py-5 text-secondary">
                <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                Memuat riwayat aktivitas teknis...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-5 text-secondary opacity-50">
                <i className="bi bi-check-all fs-1 d-block mb-2"></i>
                Tidak ada aktivitas atau insiden yang tercatat.
              </div>
            ) : (
              <div className="position-relative ps-4 ps-md-5 border-start border-secondary border-opacity-25 ms-3 d-flex flex-column gap-4">
                {activities.map((item) => {
                  const iconConfig = getActivityIcon(item.activity_type);

                  return (
                    <div key={item.id} className="position-relative">
                      {/* Timeline Dot Icon */}
                      <div
                        className={`position-absolute top-0 start-0 translate-middle rounded-circle d-flex align-items-center justify-content-center ${iconConfig.bg} ${iconConfig.color}`}
                        style={{ width: '36px', height: '36px', border: '2px solid rgba(255,255,255,0.1)' }}
                      >
                        <i className={`bi ${iconConfig.icon} fs-6`}></i>
                      </div>

                      {/* Event Card */}
                      <div className="card bg-black bg-opacity-40 border border-secondary border-opacity-25 p-3 rounded-3 shadow-sm">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-white fs-6">{item.title}</span>
                            <span className="badge bg-dark border border-secondary border-opacity-25 text-info mono-font small">
                              {item.activity_type}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <SeverityBadge severity={item.severity} />
                            <span className="text-secondary small mono-font">{item.created_at}</span>
                          </div>
                        </div>

                        <p className="text-light small mb-2">{item.content}</p>

                        <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-10 small text-secondary">
                          <span className="d-flex align-items-center gap-2">
                            <i className="bi bi-building"></i>
                            <strong className="text-white">{item.company_name}</strong>
                            <TierBadge tier={item.technical_tier} />
                          </span>

                          <span className="d-flex align-items-center gap-1">
                            <i className="bi bi-person-badge text-primary"></i>
                            {item.performed_by}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Catat Insiden / Aktivitas */}
      <ModalForm
        show={showIncidentModal}
        title="Catat Insiden / Aktivitas Teknis Baru"
        onClose={() => setShowIncidentModal(false)}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={createActivityMutation.isPending}
        submitLabel="Simpan Insiden"
      >
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small text-secondary">Pilih Klien Terkait *</label>
            <select
              className={`form-select bg-dark text-light border-secondary border-opacity-50 ${errors.client_id ? 'is-invalid' : ''}`}
              {...register('client_id', { required: 'Pilih klien korporat' })}
            >
              <option value="">-- Pilih Klien Korporat --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.technical_tier})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Tipe Aktivitas</label>
            <select className="form-select bg-dark text-light border-secondary border-opacity-50" {...register('activity_type')}>
              <option value="INCIDENT">INCIDENT (Insiden Teknis)</option>
              <option value="CONFIG_CHANGE">CONFIG_CHANGE (Perubahan Konfigurasi)</option>
              <option value="KEY_ROTATION">KEY_ROTATION (Rotasi Kunci API)</option>
              <option value="MEETING">MEETING (Review Arsitektur)</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Tingkat Keparahan (Severity)</label>
            <select className="form-select bg-dark text-light border-secondary border-opacity-50" {...register('severity')}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label small text-secondary">Judul Insiden / Evaluasi *</label>
            <input
              type="text"
              className={`form-control bg-dark text-light border-secondary border-opacity-50 ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Latensi Webhook Spike > 500ms"
              {...register('title', { required: 'Judul wajib diisi' })}
            />
          </div>

          <div className="col-12">
            <label className="form-label small text-secondary">Deskripsi / Hasil Analisis Teknis</label>
            <textarea
              className="form-control bg-dark text-light border-secondary border-opacity-50 small"
              rows={4}
              placeholder="Detail investigasi root-cause atau ringkasan perubahan..."
              {...register('content')}
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
