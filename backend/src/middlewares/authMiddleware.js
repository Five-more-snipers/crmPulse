// @ts-check
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devpulse-crm-jwt-secret-key-2026';

/**
 * JWT Authentication Middleware
 * Validates token from HTTP-Only cookie or Authorization header
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  const tokenFromCookie = req.cookies && req.cookies.access_token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Anda harus login terlebih dahulu',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Sesi token tidak valid atau telah kedaluwarsa',
    });
  }
}

/**
 * Optional Authentication Middleware
 * Populates req.user if token is present, but doesn't block if missing
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  const tokenFromCookie = req.cookies && req.cookies.access_token;
  const token = tokenFromHeader || tokenFromCookie;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Ignore invalid token for optional auth
    }
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * ADMIN always has full access to all endpoints.
 * Other roles must be explicitly listed in allowedRoles.
 * @param {Array<'ADMIN'|'ARCHITECT'|'TAM'|'DEVOPS'>} allowedRoles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Autentikasi diperlukan',
      });
    }

    // Platform ADMIN has unrestricted access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Tindakan ini memerlukan role ${allowedRoles.join(' atau ')}. Role Anda saat ini: ${req.user.role}`,
      });
    }

    next();
  };
}
