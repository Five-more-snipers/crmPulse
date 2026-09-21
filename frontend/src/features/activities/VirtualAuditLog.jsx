// @ts-check
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

export default function VirtualAuditLog() {
  const parentRef = useRef(null);

  // Fetch clients to synthesize/display audit records
  const { data: clientsResponse, isLoading } = useQuery({
    queryKey: ['virtual-audit-clients'],
    queryFn: async () => {
      const res = await apiClient.get('/clients?limit=100');
      return res.data;
    },
  });

  const clients = clientsResponse?.data || [];

  // Generate 500 audit log entries from data to demonstrate virtual rendering
  const auditEntries = React.useMemo(() => {
    if (clients.length === 0) return [];
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'ROTATE_KEY', 'WEBHOOK_PROBE', 'RATE_LIMIT_CHANGE'];
    const users = ['Alex T. (Solutions Architect)', 'Maya D. (DevRel)', 'Ryan K. (SRE)', 'Sarah W. (Security)', 'System/Cron'];

    const list = [];
    for (let i = 1; i <= 500; i++) {
      const client = clients[i % clients.length];
      const action = actions[i % actions.length];
      const user = users[i % users.length];

      list.push({
        id: `audit-${i}`,
        index: i,
        entity_type: 'CLIENT',
        company_name: client.company_name,
        action,
        changed_by: user,
        timestamp: new Date(Date.now() - i * 1800000).toLocaleString('id-ID'),
        summary: `Perubahan status / konfigurasi pada ${client.company_name} (${client.technical_tier})`,
      });
    }
    return list;
  }, [clients]);

  // TanStack Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: auditEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  return (
    <div className="card glass-panel border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-cpu text-info"></i>
            DOM Virtualization Engine (@tanstack/react-virtual)
          </h5>
          <span className="small text-secondary">
            Merender <strong>{auditEntries.length} log audit</strong> secara virtual dengan hanya ~15-25 node DOM aktif pada memori browser.
          </span>
        </div>
        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2">
          60 FPS Smooth Scroll
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
          Memuat log audit...
        </div>
      ) : (
        <div
          ref={parentRef}
          className="border border-secondary border-opacity-25 rounded-3 overflow-auto bg-black bg-opacity-30"
          style={{ height: '500px' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const entry = auditEntries[virtualRow.index];
              return (
                <div
                  key={entry.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="d-flex align-items-center justify-content-between px-3 border-bottom border-secondary border-opacity-10 hover-bg transition-all"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-secondary mono-font small" style={{ width: '45px' }}>
                      #{entry.index}
                    </span>
                    <span
                      className={`badge mono-font small ${
                        entry.action === 'CREATE'
                          ? 'bg-success bg-opacity-25 text-success'
                          : entry.action === 'UPDATE'
                            ? 'bg-info bg-opacity-25 text-info'
                            : entry.action === 'DELETE'
                              ? 'bg-danger bg-opacity-25 text-danger'
                              : 'bg-warning bg-opacity-25 text-warning'
                      }`}
                    >
                      {entry.action}
                    </span>
                    <div>
                      <strong className="text-white d-block small">{entry.company_name}</strong>
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                        {entry.summary}
                      </span>
                    </div>
                  </div>

                  <div className="text-end small mono-font">
                    <span className="text-info d-block" style={{ fontSize: '0.75rem' }}>
                      {entry.changed_by}
                    </span>
                    <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                      {entry.timestamp}
                    </span>
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
