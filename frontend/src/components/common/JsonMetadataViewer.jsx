// @ts-check
import React, { useState } from 'react';

/**
 * Interactive Key-Value Inspector & Editor for SQLite JSON Metadata
 * @param {Object} props
 * @param {Record<string, any>} props.data - JSON metadata object
 * @param {boolean} [props.editable=false]
 * @param {(updatedData: Record<string, any>) => void} [props.onSave]
 */
export default function JsonMetadataViewer({ data = {}, editable = false, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [jsonString, setJsonString] = useState(() => JSON.stringify(data, null, 2));
  const [parseError, setParseError] = useState('');

  const handleStartEdit = () => {
    setJsonString(JSON.stringify(data, null, 2));
    setParseError('');
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setParseError('');
      setIsEditing(false);
      if (onSave) {
        onSave(parsed);
      }
    } catch (err) {
      setParseError('Format JSON tidak valid: ' + err.message);
    }
  };

  const entries = Object.entries(data || {});

  return (
    <div className="card bg-black bg-opacity-40 border border-secondary border-opacity-25 rounded-3 p-3">
      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
        <span className="small text-secondary fw-semibold text-uppercase d-flex align-items-center gap-2">
          <i className="bi bi-braces text-info"></i>
          SQLite Dynamic JSON (technical_metadata)
        </span>
        {editable && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="btn btn-xs btn-outline-secondary py-0 px-2 small d-flex align-items-center gap-1"
            style={{ fontSize: '0.75rem' }}
          >
            <i className="bi bi-pencil-square"></i>
            Edit JSON
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            className="form-control mono-font bg-dark text-light border-secondary border-opacity-50 small mb-2"
            rows={8}
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
          />
          {parseError && (
            <div className="text-danger small mb-2">
              <i className="bi bi-exclamation-circle me-1"></i>
              {parseError}
            </div>
          )}
          <div className="d-flex justify-content-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-sm btn-outline-secondary px-3"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="btn btn-sm btn-primary px-3"
            >
              Simpan Metadata
            </button>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <span className="text-secondary small fst-italic">Tidak ada metadata JSON</span>
      ) : (
        <div className="d-flex flex-column gap-1 small mono-font">
          {entries.map(([key, val]) => (
            <div key={key} className="d-flex justify-content-between align-items-center py-1 px-2 rounded hover-bg">
              <span className="text-info">{key}:</span>
              <span className="text-light text-end">
                {typeof val === 'boolean' ? (
                  <span className={`badge ${val ? 'bg-success' : 'bg-secondary'} bg-opacity-25 text-light`}>
                    {String(val)}
                  </span>
                ) : typeof val === 'number' ? (
                  <span className="text-warning">{val}</span>
                ) : typeof val === 'object' ? (
                  <span className="text-secondary">{JSON.stringify(val)}</span>
                ) : (
                  <span className="text-light">"{String(val)}"</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
