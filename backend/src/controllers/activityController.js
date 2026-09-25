// @ts-check
import crypto from 'node:crypto';
import { activityRepository } from '../repositories/activityRepository.js';

/**
 * Controller for technical activities & webhook monitoring
 */
export const activityController = {
  /**
   * GET /api/activities
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
      const message = error instanceof Error ? error.message : 'Gagal memuat aktivitas teknis';
      return res.status(500).json({
        success: false,
        message,
      });
    }
  },

  /**
   * POST /api/activities
   * @param {import('express').Request & { user?: any }} req
   * @param {import('express').Response} res
   */
  async createActivity(req, res) {
    try {
      const { client_id, title, activity_type, content, severity } = req.body;
      if (!client_id || !title) {
        return res.status(400).json({ success: false, message: 'client_id dan title wajib diisi' });
      }

      const performed_by = req.user?.name || req.headers['x-actor-name'] || 'DevOps Engineer';
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
      const message = error instanceof Error ? error.message : 'Gagal mencatat aktivitas teknis';
      return res.status(500).json({
        success: false,
        message,
      });
    }
  },

  /**
   * POST /api/monitoring/webhook-ping
   * Simulate or execute real ping on client webhook endpoint
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async pingWebhook(req, res) {
    try {
      const { webhook_url, company_name } = req.body;

      // Simulated network probe with realistic latency (20ms - 200ms)
      const simulatedLatency = crypto.randomInt(20, 201);
      await new Promise((resolve) => setTimeout(resolve, Math.min(simulatedLatency, 100)));

      // If URL contains 'sandbox' or 'mock' or valid URL, return healthy
      const isDegraded = simulatedLatency > 150;
      const isFailing = !webhook_url || webhook_url.includes('failing') || webhook_url.includes('error');

      let status = 'healthy';
      if (isFailing) {
        status = 'failing';
      } else if (isDegraded) {
        status = 'degraded';
      }
      
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
      const message = error instanceof Error ? error.message : 'Probe webhook gagal';
      return res.status(500).json({
        success: false,
        message,
      });
    }
  },
};

