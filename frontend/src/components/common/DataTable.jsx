// @ts-check
import React from 'react';

/**
 * @typedef {Object} ColumnDef
 * @property {string} key - Field key or identifier
 * @property {string} label - Column header label
 * @property {boolean} [sortable] - Whether column is sortable
 * @property {string} [width] - CSS width
 * @property {string} [className] - CSS classes
 * @property {(item: any, index: number) => React.ReactNode} [render] - Custom render function
 */

/**
 * Generic Reusable Data Table Component
 * @param {Object} props
 * @param {ColumnDef[]} props.columns
 * @param {any[]} props.data
 * @param {boolean} [props.isLoading]
 * @param {string} [props.sortBy]
 * @param {'ASC'|'DESC'} [props.sortOrder]
 * @param {(key: string) => void} [props.onSort]
 * @param {number} [props.page=1]
 * @param {number} [props.totalPages=1]
 * @param {number} [props.totalItems=0]
 * @param {number} [props.limit=10]
 * @param {(newPage: number) => void} [props.onPageChange]
 * @param {(newLimit: number) => void} [props.onLimitChange]
 * @param {string} [props.emptyMessage]
 * @param {(item: any) => string} [props.rowKey]
 */
export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  sortBy,
  sortOrder = 'DESC',
  onSort,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
  emptyMessage = 'Tidak ada data ditemukan',
  rowKey = (item) => item.id,
}) {
  const handleSort = (key, sortable) => {
    if (!sortable || !onSort) return;
    onSort(key);
  };

  return (
    <div className="card glass-panel border-0 overflow-hidden shadow-sm">
      {/* Table Container */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
          <thead className="table-dark border-bottom border-secondary border-opacity-25 text-secondary text-uppercase small">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                  className={`py-3 px-3 user-select-none ${col.className || ''}`}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-secondary small">
                        {sortBy === col.key ? (
                          sortOrder === 'ASC' ? (
                            <i className="bi bi-arrow-up text-primary fw-bold"></i>
                          ) : (
                            <i className="bi bi-arrow-down text-primary fw-bold"></i>
                          )
                        ) : (
                          <i className="bi bi-arrow-down-up opacity-25"></i>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="border-bottom border-secondary border-opacity-10">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-secondary">
                  <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                  <span>Memuat data...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-secondary">
                  <i className="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={rowKey(item)} className="transition-all">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 px-3 ${col.className || ''}`}>
                      {col.render ? col.render(item, idx) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="card-footer bg-black bg-opacity-25 border-top border-secondary border-opacity-10 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="text-secondary small">
            Menampilkan <span className="text-white fw-medium">{(page - 1) * limit + 1}</span> -{' '}
            <span className="text-white fw-medium">{Math.min(page * limit, totalItems)}</span> dari{' '}
            <span className="text-white fw-medium">{totalItems}</span> entri
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Limit Selector */}
            {onLimitChange && (
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <span>Baris:</span>
                <select
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="form-select form-select-sm bg-dark text-light border-secondary border-opacity-50 py-0"
                  style={{ width: '70px', height: '28px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}

            {/* Page Buttons */}
            {onPageChange && (
              <nav aria-label="Table navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link bg-dark text-secondary border-secondary border-opacity-25"
                      onClick={() => onPageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  <li className="page-item disabled">
                    <span className="page-link bg-dark text-light border-secondary border-opacity-25 px-3">
                      {page} / {totalPages}
                    </span>
                  </li>

                  <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link bg-dark text-secondary border-secondary border-opacity-25"
                      onClick={() => onPageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
