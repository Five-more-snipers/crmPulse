// @ts-check
import crypto from 'crypto';

/**
 * Hash a plain text password with a newly generated salt
 * @param {string} password - Plain text password
 * @returns {{ hash: string, salt: string }}
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a plain text password against stored salt and hash
 * @param {string} password - Plain text password input
 * @param {string} salt - Stored hex salt
 * @param {string} storedHash - Stored hex hash
 * @returns {boolean}
 */
export function verifyPassword(password, salt, storedHash) {
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (hashBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch (error) {
    return false;
  }
}
