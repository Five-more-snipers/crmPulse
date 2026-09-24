// @ts-check
import crypto from 'node:crypto';
import db from '../config/database.js';

/**
 * @typedef {Object} AuditTrailRecord
 * @property {string} id
 * @property {'CLIENT'|'API_KEY'|'WEBHOOK'|string} entity_type
 * @property {string} entity_id
 * @property {'CREATE'|'UPDATE'|'DELETE'|'ROTATE'|string} action
 * @property {string} changed_by
 * @property {any} [old_data]
 * @property {any} [new_data]
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuditLogInput
 * @property {string} entityType - 'CLIENT' | 'API_KEY' | 'WEBHOOK'
 * @property {string} entityId - Target entity UUID
 * @property {'CREATE'|'UPDATE'|'DELETE'|'ROTATE'|string} action
 * @property {string} [changedBy] - User or system identifier
 * @property {any} [oldData] - Previous snapshot
 * @property {any} [newData] - New snapshot
 */

/**
 * Repository for logging audit trails
 */
export const auditRepository = {
  /**
   * Log an audit trail entry
   * @param {AuditLogInput} params
   * @returns {string}
   */
  log({ entityType, entityId, action, changedBy = 'System/Admin', oldData = null, newData = null }) {
    const id = crypto.randomUUID();
    const oldDataJson = oldData ? JSON.stringify(oldData) : null;
    const newDataJson = newData ? JSON.stringify(newData) : null;

    const stmt = db.prepare(`
      INSERT INTO audit_trails (id, entity_type, entity_id, action, changed_by, old_data, new_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(id, entityType, entityId, action, changedBy, oldDataJson, newDataJson);
    return id;
  },

  /**
   * Retrieve audit trails for an entity
   * @param {string} entityId
   * @returns {AuditTrailRecord[]}
   */
  findByEntityId(entityId) {
    const stmt = db.prepare(`
      SELECT * FROM audit_trails 
      WHERE entity_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(entityId);
    /** @type {AuditTrailRecord[]} */
    return rows.map((r) => {
      const row = /** @type {any} */ (r);
      let parsedOld = null;
      let parsedNew = null;
      if (typeof row.old_data === 'string') {
        try {
          parsedOld = JSON.parse(row.old_data);
        } catch {
          parsedOld = null;
        }
      }
      if (typeof row.new_data === 'string') {
        try {
          parsedNew = JSON.parse(row.new_data);
        } catch {
          parsedNew = null;
        }
      }
      return {
        ...row,
        old_data: parsedOld,
        new_data: parsedNew,
      };
    });
  },
};
