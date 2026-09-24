// @ts-check
import crypto from 'node:crypto';
import db from '../config/database.js';

/**
 * @typedef {Object} ClientRecord
 * @property {string} id
 * @property {string} company_name
 * @property {string} technical_tier
 * @property {string} integration_stage
 * @property {string|null} assigned_engineer_id
 * @property {number} rate_limit_rps
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Record<string, any>} technical_metadata
 */

/**
 * @typedef {Object} ClientInput
 * @property {string} [id]
 * @property {string} [company_name]
 * @property {string} [technical_tier]
 * @property {string} [integration_stage]
 * @property {string|null} [assigned_engineer_id]
 * @property {number} [rate_limit_rps]
 * @property {Record<string, any>|string} [technical_metadata]
 */

/**
 * Repository for technical client operations using SQLite
 */
export const clientRepository = {
  /**
   * Find clients with filters, sorting, and pagination
   * @param {Object} options
   * @param {string} [options.search]
   * @param {string} [options.stage]
   * @param {string} [options.tier]
   * @param {string} [options.apiVersion] - Filter via json_extract on technical_metadata
   * @param {number} [options.page=1]
   * @param {number} [options.limit=10]
   * @param {string} [options.sortBy='created_at']
   * @param {'ASC'|'DESC'} [options.sortOrder='DESC']
   * @returns {{ clients: ClientRecord[], totalItems: number, totalPages: number, page: number, limit: number }}
   */
  findAll({
    search = '',
    stage = '',
    tier = '',
    apiVersion = '',
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  }) {
    const conditions = ['1=1'];
    const params = [];

    if (search.trim()) {
      conditions.push('company_name LIKE ?');
      params.push(`%${search.trim()}%`);
    }

    if (stage.trim()) {
      conditions.push('integration_stage = ?');
      params.push(stage.trim());
    }

    if (tier.trim()) {
      conditions.push('technical_tier = ?');
      params.push(tier.trim());
    }

    // Dynamic JSON extraction on technical_metadata
    if (apiVersion.trim()) {
      conditions.push("json_extract(technical_metadata, '$.api_version') = ?");
      params.push(apiVersion.trim());
    }

    const whereClause = conditions.join(' AND ');

    // 1. Total Count
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM clients WHERE ${whereClause}`);
    const countResult = /** @type {{ total: number }} */ (countStmt.get(...params));
    const totalItems = countResult.total;

    // 2. Safe Sorting Column Whitelist
    const allowedSortColumns = [
      'company_name',
      'technical_tier',
      'integration_stage',
      'rate_limit_rps',
      'created_at',
      'updated_at',
    ];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 3. Paginated Data Query
    const safeLimit = Math.max(1, Number(limit) || 10);
    const safePage = Math.max(1, Number(page) || 1);
    const offset = (safePage - 1) * safeLimit;

    const dataStmt = db.prepare(`
      SELECT * FROM clients 
      WHERE ${whereClause} 
      ORDER BY ${safeSortBy} ${safeSortOrder} 
      LIMIT ? OFFSET ?
    `);

    const rows = dataStmt.all(...params, safeLimit, offset);

    // Parse technical_metadata JSON for each row
    /** @type {ClientRecord[]} */
    const clients = rows.map((r) => {
      const row = /** @type {any} */ (r);
      let metadata = {};
      if (typeof row.technical_metadata === 'string') {
        try {
          metadata = JSON.parse(row.technical_metadata);
        } catch {
          metadata = {};
        }
      }
      return {
        ...row,
        technical_metadata: metadata,
      };
    });

    return {
      clients,
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit) || 1,
      page: safePage,
      limit: safeLimit,
    };
  },

  /**
   * Find single client by ID
   * @param {string} id
   * @returns {ClientRecord|null}
   */
  findById(id) {
    const stmt = db.prepare('SELECT * FROM clients WHERE id = ?');
    const row = /** @type {any} */ (stmt.get(id));
    if (!row) return null;

    let metadata = {};
    if (typeof row.technical_metadata === 'string') {
      try {
        metadata = JSON.parse(row.technical_metadata);
      } catch {
        metadata = {};
      }
    }

    return /** @type {ClientRecord} */ ({
      ...row,
      technical_metadata: metadata,
    });
  },

  /**
   * Create new client
   * @param {ClientInput} data
   * @returns {ClientRecord}
   */
  create(data) {
    const id = data.id || crypto.randomUUID();
    let technicalMetadataJson = '{}';
    if (typeof data.technical_metadata === 'string') {
      technicalMetadataJson = data.technical_metadata;
    } else if (data.technical_metadata) {
      technicalMetadataJson = JSON.stringify(data.technical_metadata);
    }

    const stmt = db.prepare(`
      INSERT INTO clients (
        id, company_name, technical_tier, integration_stage, 
        assigned_engineer_id, rate_limit_rps, created_at, updated_at, technical_metadata
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
    `);

    stmt.run(
      id,
      data.company_name || '',
      data.technical_tier || 'Standard',
      data.integration_stage || 'sandbox',
      data.assigned_engineer_id || null,
      Number(data.rate_limit_rps) || 100,
      technicalMetadataJson
    );

    const created = this.findById(id);
    if (!created) {
      throw new Error(`Failed to create client with ID ${id}`);
    }
    return created;
  },

  /**
   * Update existing client
   * @param {string} id
   * @param {ClientInput} data
   * @returns {ClientRecord|null}
   */
  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    let technicalMetadataJson = JSON.stringify(existing.technical_metadata);
    if (typeof data.technical_metadata === 'string') {
      technicalMetadataJson = data.technical_metadata;
    } else if (data.technical_metadata !== undefined) {
      technicalMetadataJson = JSON.stringify(data.technical_metadata);
    }

    const stmt = db.prepare(`
      UPDATE clients SET
        company_name = ?,
        technical_tier = ?,
        integration_stage = ?,
        assigned_engineer_id = ?,
        rate_limit_rps = ?,
        updated_at = datetime('now'),
        technical_metadata = ?
      WHERE id = ?
    `);

    const updatedCompany = data.company_name !== undefined ? data.company_name : existing.company_name;
    const updatedTier = data.technical_tier !== undefined ? data.technical_tier : existing.technical_tier;
    const updatedStage = data.integration_stage !== undefined ? data.integration_stage : existing.integration_stage;
    const updatedEngineer = (data.assigned_engineer_id !== undefined ? data.assigned_engineer_id : existing.assigned_engineer_id) ?? null;
    const updatedRps = data.rate_limit_rps !== undefined ? Number(data.rate_limit_rps) : existing.rate_limit_rps;

    stmt.run(
      updatedCompany,
      updatedTier,
      updatedStage,
      updatedEngineer,
      updatedRps,
      technicalMetadataJson,
      id
    );

    return this.findById(id);
  },

  /**
   * Update client integration stage directly
   * @param {string} id
   * @param {string} stage
   * @returns {ClientRecord|null}
   */
  updateStage(id, stage) {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE clients SET
        integration_stage = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(stage, id);
    return this.findById(id);
  },

  /**
   * Delete client by ID
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const existing = this.findById(id);
    if (!existing) return false;

    const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
    stmt.run(id);
    return true;
  },
};
