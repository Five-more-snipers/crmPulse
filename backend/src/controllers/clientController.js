// @ts-check
import { clientService } from '../services/clientService.js';

/**
 * Controller for handling technical client HTTP endpoints
 */
export const clientController = {
  /**
   * GET /api/clients
   */
  async getClients(req, res) {
    try {
      const {
        search = '',
        stage = '',
        tier = '',
        apiVersion = '',
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = req.query;

      const result = await clientService.getClients({
        search: String(search),
        stage: String(stage),
        tier: String(tier),
        apiVersion: String(apiVersion),
        page: Number(page),
        limit: Number(limit),
        sortBy: String(sortBy),
        // @ts-ignore
        sortOrder: String(sortOrder),
      });

      return res.json({
        success: true,
        data: result.clients,
        meta: {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        },
        message: 'Data klien teknis berhasil dimuat',
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Gagal memuat data klien teknis',
      });
    }
  },

  /**
   * GET /api/clients/:id
   */
  async getClientById(req, res) {
    try {
      const client = await clientService.getClientById(req.params.id);
      return res.json({
        success: true,
        data: client,
        message: 'Detail klien teknis berhasil dimuat',
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Gagal memuat detail klien',
      });
    }
  },

  /**
   * POST /api/clients
   */
  async createClient(req, res) {
    try {
      const actor = req.headers['x-actor-name'] || 'Solutions Architect';
      const created = await clientService.createClient(req.body, String(actor));
      return res.status(201).json({
        success: true,
        data: created,
        message: 'Klien teknis berhasil didaftarkan',
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Gagal mendaftarkan klien teknis',
      });
    }
  },

  /**
   * PUT /api/clients/:id
   */
  async updateClient(req, res) {
    try {
      const actor = req.headers['x-actor-name'] || 'Technical Account Manager';
      const updated = await clientService.updateClient(req.params.id, req.body, String(actor));
      return res.json({
        success: true,
        data: updated,
        message: 'Data klien teknis berhasil diperbarui',
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Gagal memperbarui klien',
      });
    }
  },

  /**
   * PATCH /api/clients/:id/stage
   */
  async updateClientStage(req, res) {
    try {
      const { stage } = req.body;
      if (!stage) {
        return res.status(400).json({ success: false, message: 'Stage wajib disertakan' });
      }
      const actor = req.headers['x-actor-name'] || 'Integration Engineer';
      const updated = await clientService.updateClientStage(req.params.id, String(stage), String(actor));
      return res.json({
        success: true,
        data: updated,
        message: `Tahapan integrasi berhasil diubah ke ${stage}`,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Gagal memperbarui tahapan klien',
      });
    }
  },

  /**
   * DELETE /api/clients/:id
   */
  async deleteClient(req, res) {
    try {
      const actor = req.headers['x-actor-name'] || 'Platform Admin';
      const result = await clientService.deleteClient(req.params.id, String(actor));
      return res.json({
        success: true,
        data: result,
        message: 'Klien teknis berhasil dihapus',
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Gagal menghapus klien',
      });
    }
  },
};
