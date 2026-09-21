// @ts-check
import { clientRepository } from '../repositories/clientRepository.js';
import { auditRepository } from '../repositories/auditRepository.js';

/**
 * Business logic service for technical clients
 */
export const clientService = {
  /**
   * Get paginated clients with filters
   * @param {Object} query
   */
  async getClients(query) {
    return clientRepository.findAll(query);
  },

  /**
   * Get client by ID with audit history
   * @param {string} id
   */
  async getClientById(id) {
    const client = clientRepository.findById(id);
    if (!client) {
      const error = new Error('Client not found');
      // @ts-ignore
      error.statusCode = 404;
      throw error;
    }
    const auditLogs = auditRepository.findByEntityId(id);
    return { ...client, audit_history: auditLogs };
  },

  /**
   * Create new client and record audit trail
   * @param {Object} data
   * @param {string} [actor]
   */
  async createClient(data, actor = 'Integration Engineer') {
    if (!data.company_name || !data.company_name.trim()) {
      const error = new Error('Company name is required');
      // @ts-ignore
      error.statusCode = 400;
      throw error;
    }

    const created = clientRepository.create(data);

    // Record audit trail
    auditRepository.log({
      entityType: 'CLIENT',
      entityId: created.id,
      action: 'CREATE',
      changedBy: actor,
      newData: created,
    });

    return created;
  },

  /**
   * Update client and record audit trail
   * @param {string} id
   * @param {Object} data
   * @param {string} [actor]
   */
  async updateClient(id, data, actor = 'Solutions Architect') {
    const existing = clientRepository.findById(id);
    if (!existing) {
      const error = new Error('Client not found');
      // @ts-ignore
      error.statusCode = 404;
      throw error;
    }

    const updated = clientRepository.update(id, data);

    // Record audit trail
    auditRepository.log({
      entityType: 'CLIENT',
      entityId: id,
      action: 'UPDATE',
      changedBy: actor,
      oldData: existing,
      newData: updated,
    });

    return updated;
  },

  /**
   * Update client stage and log audit
   * @param {string} id
   * @param {string} newStage
   * @param {string} [actor]
   */
  async updateClientStage(id, newStage, actor = 'Integration Engineer') {
    const existing = clientRepository.findById(id);
    if (!existing) {
      const error = new Error('Client not found');
      // @ts-ignore
      error.statusCode = 404;
      throw error;
    }

    const updated = clientRepository.updateStage(id, newStage);

    auditRepository.log({
      entityType: 'CLIENT',
      entityId: id,
      action: 'UPDATE',
      changedBy: actor,
      oldData: { integration_stage: existing.integration_stage },
      newData: { integration_stage: newStage },
    });

    return updated;
  },

  /**
   * Delete client and record audit trail
   * @param {string} id
   * @param {string} [actor]
   */
  async deleteClient(id, actor = 'Platform Admin') {
    const existing = clientRepository.findById(id);
    if (!existing) {
      const error = new Error('Client not found');
      // @ts-ignore
      error.statusCode = 404;
      throw error;
    }

    clientRepository.delete(id);

    // Record audit trail
    auditRepository.log({
      entityType: 'CLIENT',
      entityId: id,
      action: 'DELETE',
      changedBy: actor,
      oldData: existing,
    });

    return { id, deleted: true };
  },
};
