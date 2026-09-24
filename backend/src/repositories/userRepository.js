// @ts-check
import crypto from 'node:crypto';
import db from '../config/database.js';

/**
 * @typedef {Object} UserRecord
 * @property {string} id
 * @property {string} email
 * @property {string} password_hash
 * @property {string} salt
 * @property {string} name
 * @property {'ADMIN'|'ARCHITECT'|'TAM'|'DEVOPS'} role
 * @property {string} [avatar_url]
 * @property {string} created_at
 * @property {string} updated_at
 */

export const userRepository = {
  /**
   * Find a user by their unique email
   * @param {string} email
   * @returns {UserRecord|undefined}
   */
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    return /** @type {UserRecord|undefined} */ (stmt.get(email));
  },

  /**
   * Find a user by ID
   * @param {string} id
   * @returns {Omit<UserRecord, 'password_hash'|'salt'>|undefined}
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT id, email, name, role, avatar_url, created_at, updated_at 
      FROM users WHERE id = ?
    `);
    return /** @type {any} */ (stmt.get(id));
  },

  /**
   * Get all registered users (excluding sensitive password hash and salt)
   * @returns {Array<Omit<UserRecord, 'password_hash'|'salt'>>}
   */
  listAll() {
    const stmt = db.prepare(`
      SELECT id, email, name, role, avatar_url, created_at, updated_at 
      FROM users ORDER BY created_at ASC
    `);
    return /** @type {any} */ (stmt.all());
  },

  /**
   * Create a new user record
   * @param {Object} params
   * @param {string} [params.id]
   * @param {string} params.email
   * @param {string} params.password_hash
   * @param {string} params.salt
   * @param {string} params.name
   * @param {'ADMIN'|'ARCHITECT'|'TAM'|'DEVOPS'} params.role
   * @param {string} [params.avatar_url]
   * @returns {Omit<UserRecord, 'password_hash'|'salt'>}
   */
  create({
    id = `usr-${crypto.randomUUID()}`,
    email,
    password_hash,
    salt,
    name,
    role,
    avatar_url = '',
  }) {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, name, role, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(id, email.toLowerCase(), password_hash, salt, name, role, avatar_url);

    return {
      id,
      email: email.toLowerCase(),
      name,
      role,
      avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Total count of users
   * @returns {number}
   */
  count() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = /** @type {{ count: number }} */ (stmt.get());
    return result ? result.count : 0;
  },
};
