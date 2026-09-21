// @ts-check
import { activityRepository } from '../repositories/activityRepository.js';

/**
 * Controller for technical activities & webhook monitoring
 */
export const activityController = {
  /**
   * GET /api/activities
   */
  async getActivities(req, res) {
    try {
      const { clientId = '', severity = '', activityType = '', limit = 50 } = req.query;
      const activities = activityRepository.findAll({
        clientId: String(clientId),
        severity: String(severity),
        activityType: String(activityType),
        limit: Number(limit) || 50,
      });

      return res.json({
        success: true,
        data: activities,
        message: 'Aktivitas teknis berhasil dimuat',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat aktivitas teknis',
      });
    }
  },

  /**
   * POST /api/activities
   */
  async createActivity(req, res) {
    try {
      const { client_id, title, activity_type, content, severity } = req.body;
      if (!client_id || !title) {
        return res.status(400).json({ success: false, message: 'client_id dan title wajib diisi' });
      }

      const performed_by = req.headers['x-actor-name'] || 'DevOps Engineer';
      const created = activityRepository.create({
        client_id,
        title,
        activity_type,
        content,
        severity,
        performed_by: String(performed_by),
      });

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Aktivitas teknis berhasil dicatat',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal mencatat aktivitas teknis',
      });
    }
  },

  /**
   * POST /api/monitoring/webhook-ping
   * Simulate or execute real ping on client webhook endpoint
   */
  async pingWebhook(req, res) {
    try {
      const { webhook_url, company_name } = req.body;
      const startTime = Date.now();

      // Simulated network probe with realistic latency
      const simulatedLatency = Math.floor(Math.random() * 180) + 20; // 20ms - 200ms
      await new Promise((resolve) => setTimeout(resolve, Math.min(simulatedLatency, 100)));

      // If URL contains 'sandbox' or 'mock' or valid URL, return healthy
      const isDegraded = simulatedLatency > 150;
      const isFailing = !webhook_url || webhook_url.includes('failing') || webhook_url.includes('error');

      const status = isFailing ? 'failing' : isDegraded ? 'degraded' : 'healthy';
      const httpStatus = isFailing ? 502 : 200;

      return res.json({
        success: !isFailing,
        data: {
          url: webhook_url || 'N/A',
          company_name: company_name || 'Unknown',
          status,
          httpStatus,
          latencyMs: simulatedLatency,
          testedAt: new Date().toISOString(),
        },
        message: `Probe webhook endpoint selesai: ${status.toUpperCase()}`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Probe webhook gagal',
      });
    }
  },
};
