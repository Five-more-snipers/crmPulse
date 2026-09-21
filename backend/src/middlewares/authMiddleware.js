// @ts-check
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devpulse-crm-jwt-secret-key-2026';

/**
 * JWT Authentication Middleware
 * Validates token from HTTP-Only cookie or Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  const tokenFromCookie = req.cookies && req.cookies.access_token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    // For development convenience, fallback to default user if no token provided
    req.user = {
      id: 'usr-default',
      name: req.headers['x-actor-name'] || 'Solutions Architect',
      role: 'ADMIN',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Sesi token tidak valid atau telah kedaluwarsa',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string[]} allowedRoles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Anda tidak memiliki izin untuk melakukan tindakan ini',
      });
    }
    next();
  };
}
