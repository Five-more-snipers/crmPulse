// @ts-check
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { verifyPassword } from '../utils/password.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devpulse-crm-jwt-secret-key-2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'devpulse-crm-refresh-secret-2026';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: /** @type {'lax'} */ ('lax'),
  path: '/',
};

/**
 * @typedef {Object} TokenUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 * @property {string} [avatar_url]
 */

/**
 * @typedef {import('express').Request & { user?: { id: string; email?: string; name?: string; role?: string; avatar_url?: string } }} AuthenticatedRequest
 */

/**
 * Helper to obtain demo account password safely without hardcoding
 * @param {string} role
 * @returns {string}
 */
function getDemoPassword(role) {
  const envVar = `${role}_PASSWORD`;
  return process.env[envVar] || process.env.SEED_DEFAULT_PASSWORD || `${role.toLowerCase()}123`;
}

/**
 * Generate tokens for user
 * @param {TokenUser} user
 */
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url || '',
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken, user: payload };
}

export const authController = {
  /**
   * User login endpoint
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi',
        });
      }

      const user = userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Kombinasi email atau password salah',
        });
      }

      const isValid = verifyPassword(password, user.salt, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Kombinasi email atau password salah',
        });
      }

      const { accessToken, refreshToken, user: userPayload } = generateTokens(user);

      // Set cookies for secure session handling
      res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      return res.json({
        success: true,
        data: {
          user: userPayload,
          accessToken,
        },
        message: `Selamat datang kembali, ${user.name}!`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current authenticated user profile
   * @param {AuthenticatedRequest} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async me(req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Belum terautentikasi',
        });
      }

      const user = userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Data pengguna tidak ditemukan',
        });
      }

      return res.json({
        success: true,
        data: {
          user,
        },
        message: 'Profil pengguna berhasil dimuat',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh JWT access token
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token tidak ditemukan',
        });
      }

      /** @type {any} */
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      const user = userRepository.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Sesi pengguna tidak valid',
        });
      }

      const { accessToken, refreshToken: newRefreshToken, user: userPayload } = generateTokens(user);

      res.cookie('refresh_token', newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        data: {
          accessToken,
          user: userPayload,
        },
        message: 'Token berhasil diperbarui',
      });
    } catch (_error) {
      // Refresh token verification failed (expired or invalid signature); return 401 response
      return res.status(401).json({
        success: false,
        message: 'Sesi refresh token kedaluwarsa, silakan login kembali',
      });
    }
  },

  /**
   * User logout endpoint
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async logout(req, res) {
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
    res.clearCookie('access_token', COOKIE_OPTIONS);
    return res.json({
      success: true,
      message: 'Sesi berhasil diakhiri (Logout)',
    });
  },

  /**
   * Get pre-seeded demo accounts info for quick-login UI
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getDemoAccounts(req, res) {
    const demoAccounts = [
      {
        role: 'ADMIN',
        roleLabel: 'Platform & Security Administrator',
        email: 'admin@devpulse.io',
        password: getDemoPassword('ADMIN'),
        name: 'Sarah Connor',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        badgeColor: 'danger',
        description: 'Kontrol penuh ke seluruh sistem, audit trail, skema JSON dinamis, dan hapus klien.',
        defaultTab: 'overview',
      },
      {
        role: 'ARCHITECT',
        roleLabel: 'Solutions Architect / Integration Engineer',
        email: 'architect@devpulse.io',
        password: getDemoPassword('ARCHITECT'),
        name: 'Alex Thorne',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        badgeColor: 'primary',
        description: 'Mengelola siklus integrasi kartu Kanban (PoC -> Review -> UAT -> Prod) & probe webhook.',
        defaultTab: 'kanban',
      },
      {
        role: 'TAM',
        roleLabel: 'Technical Account Manager / DevRel',
        email: 'tam@devpulse.io',
        password: getDemoPassword('TAM'),
        name: 'Maya Lin',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        badgeColor: 'success',
        description: 'Memantau kepatuhan versi API usang (deprecated), meeting evaluasi SLA, dan update tech lead.',
        defaultTab: 'clients',
      },
      {
        role: 'DEVOPS',
        roleLabel: 'DevOps / SRE / Support Tier-3',
        email: 'devops@devpulse.io',
        password: getDemoPassword('DEVOPS'),
        name: 'Ryan Vance',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        badgeColor: 'warning',
        description: 'Pemantauan live probe SLA webhook, investigasi error log, dan penyesuaian Rate Limit (RPS).',
        defaultTab: 'monitoring',
      },
    ];

    return res.json({
      success: true,
      data: demoAccounts,
    });
  },
};
