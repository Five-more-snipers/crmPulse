// @ts-check
import crypto from 'node:crypto';
import db from '../config/database.js';

/**
 * @typedef {Object} ActivityRecord
 * @property {string} id
 * @property {string} client_id
 * @property {'INCIDENT'|'MEETING'|'CONFIG_CHANGE'|'KEY_ROTATION'|string} activity_type
 * @property {string} title
 * @property {string} content
 * @property {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'|string} severity
 * @property {string} performed_by
 * @property {string} created_at
 * @property {string} [company_name]
 * @property {string} [technical_tier]
 */

/**
 * @typedef {Object} ActivityInput
 * @property {string} [id]
 * @property {string} client_id
 * @property {'INCIDENT'|'MEETING'|'CONFIG_CHANGE'|'KEY_ROTATION'|string} [activity_type]
 * @property {string} title
 * @property {string} [content]
 * @property {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'|string} [severity]
 * @property {string} [performed_by]
 */

/**
 * @typedef {Object} ActivityFilter
 * @property {string} [clientId]
 * @property {string} [severity]
 * @property {string} [activityType]
 * @property {number} [limit]
 */

/**
 * Repository for technical activities and incident tracking
 */
export const activityRepository = {
  /**
   * Find activities with optional filters
   * @param {ActivityFilter} [filter]
   * @returns {ActivityRecord[]}
   */
  findAll({ clientId = '', severity = '', activityType = '', limit = 50 } = {}) {
    const conditions = ['1=1'];
    const params = [];

    if (clientId) {
      conditions.push('a.client_id = ?');
      params.push(clientId);
    }
    if (severity) {
      conditions.push('a.severity = ?');
      params.push(severity);
    }
    if (activityType) {
      conditions.push('a.activity_type = ?');
      params.push(activityType);
    }

    const whereClause = conditions.join(' AND ');

    const stmt = db.prepare(`
      SELECT 
        a.*,
        c.company_name,
        c.technical_tier
      FROM technical_activities a
      JOIN clients c ON a.client_id = c.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ?
    `);

    return /** @type {ActivityRecord[]} */ (stmt.all(...params, limit));
  },

  /**
   * Create new activity/incident
   * @param {ActivityInput} data
   * @returns {ActivityRecord}
   */
  create(data) {
    const id = data.id || crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO technical_activities (
        id, client_id, activity_type, title, content, severity, performed_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      data.client_id,
      data.activity_type || 'INCIDENT',
      data.title,
      data.content || '',
      data.severity || 'LOW',
      data.performed_by || 'DevOps Engineer'
    );

    const checkStmt = db.prepare(`
      SELECT a.*, c.company_name, c.technical_tier 
      FROM technical_activities a
      JOIN clients c ON a.client_id = c.id
      WHERE a.id = ?
    `);
    const created = /** @type {ActivityRecord|undefined} */ (checkStmt.get(id));
    if (!created) {
      throw new Error(`Failed to retrieve newly created activity with id: ${id}`);
    }
    return created;
  },
};
