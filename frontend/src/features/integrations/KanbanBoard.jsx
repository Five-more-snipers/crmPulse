// @ts-check
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { TierBadge } from '../../components/common/StatusBadge';
import JsonMetadataViewer from '../../components/common/JsonMetadataViewer';
import { Modal } from 'react-bootstrap';

const STAGES = [
  { key: 'sandbox', label: '1. Sandbox Environment', color: 'secondary', icon: 'bi-box-seam' },
  { key: 'review', label: '2. Architecture Review', color: 'warning', icon: 'bi-diagram-3' },
  { key: 'uat', label: '3. UAT Testing', color: 'info', icon: 'bi-bug' },
  { key: 'production', label: '4. Production Go-Live', color: 'success', icon: 'bi-rocket-takeoff-fill' },
  { key: 'maintenance', label: '5. Maintenance & Deprecation', color: 'dark', icon: 'bi-wrench-adjustable' },
];

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const [selectedClientForMeta, setSelectedClientForMeta] = useState(null);
  const [tierFilter, setTierFilter] = useState('');
  const [draggedClientId, setDraggedClientId] = useState(null);

  // Fetch all clients without pagination for Kanban view
  const { data: clientsResponse, isLoading } = useQuery({
    queryKey: ['kanban-clients'],
    queryFn: async () => {
      const res = await apiClient.get('/clients?limit=100');
      return res.data;
    },
  });

  // Stage Update Mutation with Optimistic Updates
  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => apiClient.patch(`/clients/${id}/stage`, { stage }),
    onMutate: async ({ id, stage }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['kanban-clients'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['kanban-clients']);

      // Optimistically update to the new value
      queryClient.setQueryData(['kanban-clients'], (old) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((c) => (c.id === id ? { ...c, integration_stage: stage } : c)),
        };
      });

      return { previousData };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['kanban-clients'], context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate to ensure sync
      queryClient.invalidateQueries({ queryKey: ['kanban-clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const clients = clientsResponse?.data || [];
  const filteredClients = tierFilter
    ? clients.filter((c) => c.technical_tier === tierFilter)
    : clients;

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, id) => {
    setDraggedClientId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (clientId) {
      stageMutation.mutate({ id: clientId, stage: targetStage });
    }
    setDraggedClientId(null);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header & Filter */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="fs-4 fw-bold text-white mb-1 brand-title d-flex align-items-center gap-2">
            <i className="bi bi-kanban text-primary"></i>
            Pipeline Kanban Integrasi Teknis
          </h2>
          <p className="text-secondary small mb-0">
            Geser (*drag-and-drop*) kartu klien antar tahapan integrasi dengan <strong>Optimistic Updates</strong> instan via TanStack Query.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-secondary">Filter Tier:</span>
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">Semua SLA Tier</option>
            <option value="Mission-Critical">Mission-Critical</option>
            <option value="Enterprise SLA">Enterprise SLA</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Kanban Columns */}
      {isLoading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
          Memuat papan kanban integrasi...
        </div>
      ) : (
        <div className="row g-3 flex-nowrap overflow-auto pb-3" style={{ minHeight: '650px' }}>
          {STAGES.map((col) => {
            const columnClients = filteredClients.filter((c) => c.integration_stage === col.key);

            return (
              <div
                key={col.key}
                className="col-12 col-md-6 col-xl"
                style={{ minWidth: '280px', maxWidth: '320px' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="card glass-panel border-0 h-100 d-flex flex-column">
                  {/* Column Header */}
                  <div className="card-header bg-black bg-opacity-30 border-bottom border-secondary border-opacity-25 py-3 px-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold small text-white text-uppercase d-flex align-items-center gap-2">
                      <i className={`bi ${col.icon} text-${col.color}`}></i>
                      {col.label}
                    </span>
                    <span className="badge bg-dark border border-secondary border-opacity-50 text-light px-2 py-1">
                      {columnClients.length}
                    </span>
                  </div>

                  {/* Droppable Card Body */}
                  <div
                    className="card-body p-2 d-flex flex-column gap-2 overflow-y-auto flex-grow-1"
                    style={{ minHeight: '400px' }}
                  >
                    {columnClients.length === 0 ? (
                      <div className="text-center text-secondary py-5 small opacity-50 border border-dashed border-secondary border-opacity-25 rounded-3 m-2">
                        Tarik kartu ke sini
                      </div>
                    ) : (
                      columnClients.map((client) => (
                        <div
                          key={client.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          className="card bg-black bg-opacity-50 border border-secondary border-opacity-25 p-3 rounded-3 shadow-sm cursor-grab user-select-none hover-border-primary transition-all"
                          style={{ cursor: 'grab' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="fw-bold text-white fs-6">{client.company_name}</span>
                            <span className="badge bg-dark text-warning border border-secondary border-opacity-25 mono-font small">
                              {client.technical_metadata?.api_version || 'v2.4'}
                            </span>
                          </div>

                          <div className="mb-2">
                            <TierBadge tier={client.technical_tier} />
                          </div>

                          <div className="d-flex justify-content-between align-items-center small text-secondary mono-font pt-2 border-top border-secondary border-opacity-10">
                            <span>{client.rate_limit_rps.toLocaleString()} RPS</span>
                            <button
                              onClick={() => setSelectedClientForMeta(client)}
                              className="btn btn-xs btn-outline-info py-0 px-2 small"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <i className="bi bi-braces me-1"></i>JSON
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal JSON Metadata */}
      {selectedClientForMeta && (
        <Modal
          show={!!selectedClientForMeta}
          onHide={() => setSelectedClientForMeta(null)}
          centered
          size="lg"
          contentClassName="glass-panel border-secondary border-opacity-25 text-light"
        >
          <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 px-4 py-3">
            <Modal.Title className="fs-5 fw-bold brand-title text-white d-flex align-items-center gap-2">
              <i className="bi bi-braces text-warning"></i>
              Metadata JSON: {selectedClientForMeta.company_name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-3">
            <JsonMetadataViewer data={selectedClientForMeta.technical_metadata} editable={false} />
          </Modal.Body>
          <Modal.Footer className="border-secondary border-opacity-25 px-4 py-3">
            <button className="btn btn-outline-secondary" onClick={() => setSelectedClientForMeta(null)}>
              Tutup
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
