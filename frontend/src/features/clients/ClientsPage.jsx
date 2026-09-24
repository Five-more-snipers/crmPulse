// @ts-check
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '../../services/apiClient';
import DataTable from '../../components/common/DataTable';
import JsonMetadataViewer from '../../components/common/JsonMetadataViewer';
import ModalForm from '../../components/common/ModalForm';
import { Modal } from 'react-bootstrap';
import { useAuthStore } from '../auth/useAuthStore';

// Zod Schema for Client Form
const clientSchema = z.object({
  company_name: z.string().min(2, 'Nama korporasi minimal 2 karakter'),
  technical_tier: z.enum(['Standard', 'Enterprise SLA', 'Mission-Critical']),
  integration_stage: z.enum(['sandbox', 'review', 'uat', 'production', 'maintenance']),
  rate_limit_rps: z.coerce.number().min(1, 'Rate limit minimal 1 RPS').max(10000, 'Maksimal 10.000 RPS'),
  api_version: z.string().default('v2.4'),
  runtime_stack: z.string().default('Node.js 20'),
  webhook_url: z.string().url('URL webhook tidak valid').or(z.literal('')).optional(),
});

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // State Filters & Pagination
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [apiVersionFilter, setApiVersionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [inspectMetadataClient, setInspectMetadataClient] = useState(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch Clients Query
  const { data: clientsResponse, isLoading, isFetching } = useQuery({
    queryKey: ['clients', { debouncedSearch, stageFilter, tierFilter, apiVersionFilter, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (stageFilter) params.set('stage', stageFilter);
      if (tierFilter) params.set('tier', tierFilter);
      if (apiVersionFilter) params.set('apiVersion', apiVersionFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const res = await apiClient.get(`/clients?${params.toString()}`);
      return res.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newClient) => apiClient.post('/clients', newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowCreateModal(false);
      reset();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/clients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditClient(null);
      setInspectMetadataClient(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDeleteConfirmClient(null);
    },
  });

  // React Hook Form for Create
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: '',
      technical_tier: 'Standard',
      integration_stage: 'sandbox',
      rate_limit_rps: 100,
      api_version: 'v2.4',
      runtime_stack: 'Node.js 20',
      webhook_url: '',
    },
  });

  // React Hook Form for Edit
  const editForm = useForm({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (editClient) {
      editForm.reset({
        company_name: editClient.company_name,
        technical_tier: editClient.technical_tier,
        integration_stage: editClient.integration_stage,
        rate_limit_rps: editClient.rate_limit_rps,
        api_version: editClient.technical_metadata?.api_version || 'v2.4',
        runtime_stack: editClient.technical_metadata?.runtime_stack || 'Node.js 20',
        webhook_url: editClient.technical_metadata?.webhook_url || '',
      });
    }
  }, [editClient]);

  const handleSort = (colKey) => {
    if (sortBy === colKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(colKey);
      setSortOrder('ASC');
    }
  };

  const onSubmitCreate = (formData) => {
    const payload = {
      company_name: formData.company_name,
      technical_tier: formData.technical_tier,
      integration_stage: formData.integration_stage,
      rate_limit_rps: formData.rate_limit_rps,
      technical_metadata: {
        api_version: formData.api_version,
        runtime_stack: formData.runtime_stack,
        webhook_url: formData.webhook_url,
      },
    };
    createMutation.mutate(payload);
  };

  const onSubmitEdit = (formData) => {
    if (!editClient) return;
    const payload = {
      company_name: formData.company_name,
      technical_tier: formData.technical_tier,
      integration_stage: formData.integration_stage,
      rate_limit_rps: formData.rate_limit_rps,
      technical_metadata: {
        ...editClient.technical_metadata,
        api_version: formData.api_version,
        runtime_stack: formData.runtime_stack,
        webhook_url: formData.webhook_url,
      },
    };
    updateMutation.mutate({ id: editClient.id, data: payload });
  };

  // Status Badge Helpers
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Mission-Critical':
        return <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1"><i className="bi bi-shield-fill-check me-1"></i>Mission-Critical</span>;
      case 'Enterprise SLA':
        return <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-2 py-1"><i className="bi bi-award-fill me-1"></i>Enterprise SLA</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50 px-2 py-1">Standard</span>;
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'production':
        return <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1"><i className="bi bi-check-circle me-1"></i>Production</span>;
      case 'uat':
        return <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 px-2 py-1">UAT</span>;
      case 'review':
        return <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1">Arch Review</span>;
      case 'sandbox':
        return <span className="badge bg-secondary bg-opacity-25 text-light px-2 py-1">Sandbox</span>;
      default:
        return <span className="badge bg-dark text-secondary px-2 py-1">{stage}</span>;
    }
  };

  // Columns definition for DataTable
  const columns = [
    {
      key: 'company_name',
      label: 'Klien Korporat',
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-white fw-bold d-block">{item.company_name}</span>
          <span className="text-secondary small mono-font opacity-75">{item.id.slice(0, 8)}...</span>
        </div>
      ),
    },
    {
      key: 'technical_tier',
      label: 'SLA Tier',
      sortable: true,
      render: (item) => getTierBadge(item.technical_tier),
    },
    {
      key: 'integration_stage',
      label: 'Tahapan Integrasi',
      sortable: true,
      render: (item) => getStageBadge(item.integration_stage),
    },
    {
      key: 'rate_limit_rps',
      label: 'Batas Rate (RPS)',
      sortable: true,
      render: (item) => (
        <div className="d-flex align-items-center gap-2 mono-font">
          <span className="text-info fw-semibold">{item.rate_limit_rps.toLocaleString()}</span>
          <span className="text-secondary small">req/s</span>
        </div>
      ),
    },
    {
      key: 'technical_metadata',
      label: 'Dynamic JSON (API Ver / Stack)',
      render: (item) => {
        const meta = item.technical_metadata || {};
        return (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-dark border border-secondary border-opacity-50 text-warning mono-font">
              {meta.api_version || 'v?.?'}
            </span>
            <span className="text-secondary small d-none d-md-inline">
              {meta.runtime_stack || '—'}
            </span>
            <button
              onClick={() => setInspectMetadataClient(item)}
              className="btn btn-xs btn-outline-info py-0 px-2 ms-auto"
              style={{ fontSize: '0.75rem' }}
              title="Inspeksi & Edit JSON Metadata"
            >
              <i className="bi bi-braces me-1"></i>JSON
            </button>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      className: 'text-end',
      render: (item) => (
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => setEditClient(item)}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            title="Edit Klien"
          >
            <i className="bi bi-pencil"></i>
          </button>
          {user?.role === 'ADMIN' ? (
            <button
              onClick={() => setDeleteConfirmClient(item)}
              className="btn btn-sm btn-outline-danger py-1 px-2"
              title="Hapus Klien (Khusus Platform Admin)"
            >
              <i className="bi bi-trash"></i>
            </button>
          ) : (
            <button
              disabled
              className="btn btn-sm btn-outline-secondary py-1 px-2 opacity-25"
              title="Hanya Platform Admin yang memiliki izin hapus klien"
              style={{ cursor: 'not-allowed' }}
            >
              <i className="bi bi-lock-fill"></i>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Action Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="fs-4 fw-bold text-white mb-1 brand-title d-flex align-items-center gap-2">
            <i className="bi bi-database-check text-primary"></i>
            Technical Clients Data Grid
          </h2>
          <p className="text-secondary small mb-0">
            Dikelola dengan arsitektur Controller-Service-Repository dan query filter dinamis SQLite JSON1 (<code>json_extract</code>).
          </p>
        </div>

        {user?.role !== 'DEVOPS' ? (
          <button
            onClick={() => {
              reset();
              setShowCreateModal(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i>
            Tambah Klien Teknis
          </button>
        ) : (
          <div className="badge bg-dark border border-secondary border-opacity-50 text-secondary py-2 px-3 small d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock text-warning"></i>
            <span>DevOps: Onboarding dikelola oleh TAM & Architect</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card glass-panel border-0 p-3">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                placeholder="Cari korporasi klien (debounced)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  className="btn btn-outline-secondary border-secondary border-opacity-50 text-secondary"
                  onClick={() => setSearchInput('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* SLA Tier Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50"
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua SLA Tier</option>
              <option value="Mission-Critical">Mission-Critical</option>
              <option value="Enterprise SLA">Enterprise SLA</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          {/* Integration Stage Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50"
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Tahapan Integrasi</option>
              <option value="sandbox">Sandbox</option>
              <option value="review">Architecture Review</option>
              <option value="uat">UAT</option>
              <option value="production">Production</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* API Version Filter (SQLite json_extract test) */}
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary border-opacity-50 text-warning small mono-font">
                json_extract
              </span>
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50"
                value={apiVersionFilter}
                onChange={(e) => {
                  setApiVersionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua Versi API</option>
                <option value="v1.0">v1.0 (Legacy)</option>
                <option value="v2.0">v2.0</option>
                <option value="v2.4">v2.4 (Current Stable)</option>
                <option value="v3.0-beta">v3.0-beta</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={clientsResponse?.data || []}
        isLoading={isLoading || isFetching}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={clientsResponse?.meta?.page || page}
        totalPages={clientsResponse?.meta?.totalPages || 1}
        totalItems={clientsResponse?.meta?.totalItems || 0}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />

      {/* Modal Tambah Klien */}
      <ModalForm
        show={showCreateModal}
        title="Registrasi Klien Teknis Baru"
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmit(onSubmitCreate)}
        isSubmitting={createMutation.isPending}
        submitLabel="Daftarkan Klien"
      >
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small text-secondary">Nama Perusahaan / Korporasi *</label>
            <input
              type="text"
              className={`form-control bg-dark text-light border-secondary border-opacity-50 ${errors.company_name ? 'is-invalid' : ''}`}
              placeholder="e.g. Acme Cloud Corp"
              {...register('company_name')}
            />
            {errors.company_name && <div className="invalid-feedback">{errors.company_name.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Technical Tier (SLA)</label>
            <select
              className="form-select bg-dark text-light border-secondary border-opacity-50"
              {...register('technical_tier')}
            >
              <option value="Standard">Standard</option>
              <option value="Enterprise SLA">Enterprise SLA</option>
              <option value="Mission-Critical">Mission-Critical</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Tahapan Integrasi</label>
            <select
              className="form-select bg-dark text-light border-secondary border-opacity-50"
              {...register('integration_stage')}
            >
              <option value="sandbox">Sandbox</option>
              <option value="review">Architecture Review</option>
              <option value="uat">UAT</option>
              <option value="production">Production</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Rate Limit (RPS)</label>
            <input
              type="number"
              className={`form-control bg-dark text-light border-secondary border-opacity-50 ${errors.rate_limit_rps ? 'is-invalid' : ''}`}
              {...register('rate_limit_rps')}
            />
            {errors.rate_limit_rps && <div className="invalid-feedback">{errors.rate_limit_rps.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Versi API Klien (JSON Metadata)</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary border-opacity-50"
              placeholder="e.g. v2.4"
              {...register('api_version')}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Runtime Stack (JSON Metadata)</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary border-opacity-50"
              placeholder="e.g. Go 1.22, Node.js 20"
              {...register('runtime_stack')}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Webhook URL (Opsional)</label>
            <input
              type="text"
              className={`form-control bg-dark text-light border-secondary border-opacity-50 ${errors.webhook_url ? 'is-invalid' : ''}`}
              placeholder="https://api.client.com/webhook"
              {...register('webhook_url')}
            />
            {errors.webhook_url && <div className="invalid-feedback">{errors.webhook_url.message}</div>}
          </div>
        </div>
      </ModalForm>

      {/* Modal Edit Klien */}
      {editClient && (
        <ModalForm
          show={!!editClient}
          title={`Edit Klien: ${editClient.company_name}`}
          onClose={() => setEditClient(null)}
          onSubmit={editForm.handleSubmit(onSubmitEdit)}
          isSubmitting={updateMutation.isPending}
          submitLabel="Simpan Perubahan"
        >
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small text-secondary">Nama Perusahaan / Korporasi *</label>
              <input
                type="text"
                className={`form-control bg-dark text-light border-secondary border-opacity-50 ${editForm.formState.errors.company_name ? 'is-invalid' : ''}`}
                {...editForm.register('company_name')}
              />
              {editForm.formState.errors.company_name && (
                <div className="invalid-feedback">{editForm.formState.errors.company_name.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">Technical Tier (SLA)</label>
              <select
                className="form-select bg-dark text-light border-secondary border-opacity-50"
                {...editForm.register('technical_tier')}
              >
                <option value="Standard">Standard</option>
                <option value="Enterprise SLA">Enterprise SLA</option>
                <option value="Mission-Critical">Mission-Critical</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">Tahapan Integrasi</label>
              <select
                className="form-select bg-dark text-light border-secondary border-opacity-50"
                {...editForm.register('integration_stage')}
              >
                <option value="sandbox">Sandbox</option>
                <option value="review">Architecture Review</option>
                <option value="uat">UAT</option>
                <option value="production">Production</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">Rate Limit (RPS)</label>
              <input
                type="number"
                className={`form-control bg-dark text-light border-secondary border-opacity-50 ${editForm.formState.errors.rate_limit_rps ? 'is-invalid' : ''}`}
                {...editForm.register('rate_limit_rps')}
              />
              {editForm.formState.errors.rate_limit_rps && (
                <div className="invalid-feedback">{editForm.formState.errors.rate_limit_rps.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">Versi API Klien</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                {...editForm.register('api_version')}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">Runtime Stack</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                {...editForm.register('runtime_stack')}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">Webhook URL</label>
              <input
                type="text"
                className={`form-control bg-dark text-light border-secondary border-opacity-50 ${editForm.formState.errors.webhook_url ? 'is-invalid' : ''}`}
                {...editForm.register('webhook_url')}
              />
              {editForm.formState.errors.webhook_url && (
                <div className="invalid-feedback">{editForm.formState.errors.webhook_url.message}</div>
              )}
            </div>
          </div>
        </ModalForm>
      )}

      {/* Modal Dynamic JSON Metadata Inspector */}
      {inspectMetadataClient && (
        <Modal
          show={!!inspectMetadataClient}
          onHide={() => setInspectMetadataClient(null)}
          centered
          size="lg"
          contentClassName="glass-panel border-secondary border-opacity-25 text-light"
        >
          <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 px-4 py-3">
            <Modal.Title className="fs-5 fw-bold brand-title text-white d-flex align-items-center gap-2">
              <i className="bi bi-braces text-warning"></i>
              Metadata JSON: {inspectMetadataClient.company_name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-3">
            <p className="small text-secondary mb-3">
              Kolom <code>technical_metadata</code> disimpan dalam format JSON SQLite (JSON1 Extension). Anda dapat mengedit atribut kunci atau menambahkan parameter baru secara langsung.
            </p>
            <JsonMetadataViewer
              data={inspectMetadataClient.technical_metadata}
              editable={true}
              onSave={(updatedJson) => {
                updateMutation.mutate({
                  id: inspectMetadataClient.id,
                  data: { technical_metadata: updatedJson },
                });
              }}
            />
          </Modal.Body>
          <Modal.Footer className="border-secondary border-opacity-25 px-4 py-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setInspectMetadataClient(null)}
            >
              Tutup
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal Hapus Klien Confirmation */}
      {deleteConfirmClient && (
        <Modal
          show={!!deleteConfirmClient}
          onHide={() => setDeleteConfirmClient(null)}
          centered
          contentClassName="glass-panel border-danger border-opacity-25 text-light"
        >
          <Modal.Header closeButton closeVariant="white" className="border-danger border-opacity-25 px-4 py-3">
            <Modal.Title className="fs-5 fw-bold text-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-octagon-fill"></i>
              Konfirmasi Hapus Klien
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-3">
            <p className="mb-2">
              Apakah Anda yakin ingin menghapus data klien <strong>{deleteConfirmClient.company_name}</strong>?
            </p>
            <p className="small text-secondary mb-0">
              Tindakan ini akan mencatat riwayat penghapusan ke dalam <code>audit_trails</code> dan menghapus aktivitas teknis terkait.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-danger border-opacity-25 px-4 py-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setDeleteConfirmClient(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </button>
            <button
              className="btn btn-danger d-flex align-items-center gap-2"
              onClick={() => deleteMutation.mutate(deleteConfirmClient.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <span className="spinner-border spinner-border-sm" role="status" />}
              Hapus Klien
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
