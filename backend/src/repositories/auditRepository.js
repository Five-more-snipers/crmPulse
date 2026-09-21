// @ts-check
import crypto from 'node:crypto';
import db from '../config/database.js';

/**
 * Repository for logging audit trails
 */
export const auditRepository = {
  /**
   * Log an audit trail entry
   * @param {Object} params
   * @param {string} params.entityType - 'CLIENT' | 'API_KEY' | 'WEBHOOK'
   * @param {string} params.entityId - Target entity UUID
   * @param {'CREATE'|'UPDATE'|'DELETE'|'ROTATE'} params.action
   * @param {string} [params.changedBy] - User or system identifier
   * @param {any} [params.oldData] - Previous snapshot
   * @param {any} [params.newData] - New snapshot
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
   */
  findByEntityId(entityId) {
    const stmt = db.prepare(`
      SELECT * FROM audit_trails 
      WHERE entity_id = ? 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(entityId);
    return rows.map((r) => ({
      ...r,
      old_data: r.old_data ? JSON.parse(r.old_data) : null,
      new_data: r.new_data ? JSON.parse(r.new_data) : null,
    }));
  },
};
