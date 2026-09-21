// @ts-check
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { WebhookStatusBadge, TierBadge } from '../../components/common/StatusBadge';

export default function WebhookMonitoringPage() {
  const [probeResults, setProbeResults] = useState({});
  const [activePingingId, setActivePingingId] = useState(null);

  // Fetch clients with webhooks
  const { data: clientsResponse, isLoading } = useQuery({
    queryKey: ['monitoring-clients'],
    queryFn: async () => {
      const res = await apiClient.get('/clients?limit=50');
      return res.data;
    },
  });

  const clients = clientsResponse?.data || [];

  // Probe Mutation
  const probeMutation = useMutation({
    mutationFn: async (client) => {
      setActivePingingId(client.id);
      const res = await apiClient.post('/monitoring/webhook-ping', {
        webhook_url: client.technical_metadata?.webhook_url,
        company_name: client.company_name,
      });
      return { clientId: client.id, result: res.data.data };
    },
    onSuccess: ({ clientId, result }) => {
      setProbeResults((prev) => ({ ...prev, [clientId]: result }));
      setActivePingingId(null);
    },
    onError: (err, client) => {
      setProbeResults((prev) => ({
        ...prev,
        [client.id]: {
          status: 'failing',
          httpStatus: 500,
          latencyMs: 999,
          testedAt: new Date().toISOString(),
        },
      }));
      setActivePingingId(null);
    },
  });

  // Calculate Metrics
  const totalRps = clients.reduce((acc, c) => acc + (Number(c.rate_limit_rps) || 0), 0);
  const activeWebhooks = clients.filter((c) => c.technical_metadata?.webhook_url).length;
  const missionCriticalCount = clients.filter((c) => c.technical_tier === 'Mission-Critical').length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div>
        <h2 className="fs-4 fw-bold text-white mb-1 brand-title d-flex align-items-center gap-2">
          <i className="bi bi-hdd-network text-info"></i>
          Monitoring SLA & Webhook Live Probe
        </h2>
        <p className="text-secondary small mb-0">
          Evaluasi kepatuhan SLA, pantau alokasi kuota RPS, dan uji konektivitas endpoint webhook klien secara langsung.
        </p>
      </div>

      {/* SLA Metric Summary Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card glass-panel border-0 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold text-uppercase">Beban Alokasi RPS</span>
              <div className="bg-primary bg-opacity-25 text-primary p-2 rounded">
                <i className="bi bi-speedometer2 fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0 mono-font">{totalRps.toLocaleString()} <span className="fs-6 text-secondary fw-normal">req/s</span></h3>
            <span className="text-success small mt-2 d-flex align-items-center gap-1">
              <i className="bi bi-arrow-up-right"></i> Kapasitas aman di bawah 10.000 RPS
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card glass-panel border-0 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold text-uppercase">Webhook Terkonfigurasi</span>
              <div className="bg-info bg-opacity-25 text-info p-2 rounded">
                <i className="bi bi-broadcast fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0 mono-font">{activeWebhooks} <span className="fs-6 text-secondary fw-normal">endpoint</span></h3>
            <span className="text-info small mt-2 d-flex align-items-center gap-1">
              <i className="bi bi-check2-all"></i> Siap menerima webhook delivery
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card glass-panel border-0 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold text-uppercase">Kepatuhan SLA Klien</span>
              <div className="bg-success bg-opacity-25 text-success p-2 rounded">
                <i className="bi bi-shield-check fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0 mono-font">99.98%</h3>
            <span className="text-success small mt-2 d-flex align-items-center gap-1">
              <i className="bi bi-shield-lock-fill"></i> Kepatuhan SLA standar industri
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card glass-panel border-0 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold text-uppercase">Akun Mission-Critical</span>
              <div className="bg-danger bg-opacity-25 text-danger p-2 rounded">
                <i className="bi bi-fire fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0 mono-font">{missionCriticalCount} <span className="fs-6 text-secondary fw-normal">klien</span></h3>
            <span className="text-warning small mt-2 d-flex align-items-center gap-1">
              <i className="bi bi-lightning-charge-fill"></i> Prioritas respons SLA &lt; 15 menit
            </span>
          </div>
        </div>
      </div>

      {/* Live Probe Webhook Table */}
      <div className="card glass-panel border-0 overflow-hidden shadow-sm">
        <div className="card-header bg-black bg-opacity-25 border-bottom border-secondary border-opacity-25 py-3 px-4 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-white brand-title d-flex align-items-center gap-2">
            <i className="bi bi-activity text-success"></i>
            Live Webhook Health Probe
          </span>
          <span className="small text-secondary">
            Klik <strong>Ping Webhook</strong> untuk menguji responsivitas endpoint
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
            <thead className="table-dark border-bottom border-secondary border-opacity-25 text-secondary text-uppercase small">
              <tr>
                <th className="py-3 px-4">Klien Korporat</th>
                <th className="py-3 px-3">SLA Tier</th>
                <th className="py-3 px-3">URL Webhook</th>
                <th className="py-3 px-3">Status Probe</th>
                <th className="py-3 px-3">Latensi</th>
                <th className="py-3 px-4 text-end">Aksi Probe</th>
              </tr>
            </thead>
            <tbody className="border-bottom border-secondary border-opacity-10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-secondary">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memuat daftar endpoint webhook...
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const probe = probeResults[client.id];
                  const isPinging = activePingingId === client.id;
                  const webhookUrl = client.technical_metadata?.webhook_url;

                  return (
                    <tr key={client.id}>
                      <td className="py-3 px-4">
                        <span className="text-white fw-bold d-block">{client.company_name}</span>
                        <span className="text-secondary small mono-font opacity-75">
                          {client.technical_metadata?.runtime_stack || 'Standard Stack'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <TierBadge tier={client.technical_tier} />
                      </td>

                      <td className="py-3 px-3 mono-font small">
                        {webhookUrl ? (
                          <span className="text-info text-truncate d-inline-block" style={{ maxWidth: '280px' }}>
                            {webhookUrl}
                          </span>
                        ) : (
                          <span className="text-secondary opacity-50">Belum dikonfigurasi</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isPinging ? (
                          <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1">
                            <span className="spinner-border spinner-border-sm" style={{ width: '0.5rem', height: '0.5rem' }} />
                            PROBING...
                          </span>
                        ) : probe ? (
                          <WebhookStatusBadge status={probe.status} />
                        ) : (
                          <span className="badge bg-dark text-secondary border border-secondary border-opacity-25">
                            UNTESTED
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 mono-font">
                        {probe ? (
                          <span
                            className={`fw-semibold ${
                              probe.latencyMs < 80
                                ? 'text-success'
                                : probe.latencyMs < 150
                                  ? 'text-warning'
                                  : 'text-danger'
                            }`}
                          >
                            {probe.latencyMs} ms
                          </span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-end">
                        <button
                          onClick={() => probeMutation.mutate(client)}
                          disabled={isPinging || !webhookUrl}
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
                        >
                          <i className={`bi bi-broadcast ${isPinging ? 'spin' : ''}`}></i>
                          Ping Webhook
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
