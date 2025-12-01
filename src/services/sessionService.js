import { query } from '../config/db.js';
import { config } from '../config/env.js';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate UUID for session ID
 * Uses crypto.randomUUID if available (Node 18+), otherwise falls back to uuid library
 */
function cryptoRandomUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback to uuid library
  return uuidv4();
}

/**
 * Create session row in user_sessions table
 */
export async function createSessionForUser(userId, token, ip, userAgent) {
  const sessionId = cryptoRandomUUID();
  const now = Date.now();
  const utcTime = now;

  // Calculate expiration time in configured timezone
  const timezone = config.timezone || 'Asia/Kolkata';
  const expiresAt = moment(utcTime)
    .tz(timezone)
    .add(config.session.ttlHours, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');

  const lastActivity = new Date().toISOString();

  const sql = `
    INSERT INTO user_sessions
      (session_id, user_id, jwt_token, device_type,
       ip_address, user_agent, expires_at, last_activity_at,
       created_at, is_active)
    VALUES
      ($1, $2, $3, 'system',
       $4, $5, $6, $7,
       $6, true)
    RETURNING *;
  `;

  const { rows } = await query(sql, [
    sessionId,
    userId,
    token,
    ip || null,
    userAgent || null,
    expiresAt,
    lastActivity,
  ]);

  return { sessionId, expiresAt, dbRow: rows[0] };
}

/**
 * Validate session by session_id
 */
export async function validateSession(sessionId) {
  const sql = `
    SELECT
      session_id,
      user_id,
      jwt_token,
      expires_at,
      is_active
    FROM public.user_sessions
    WHERE session_id = $1;
  `;

  const { rows } = await query(sql, [sessionId]);
  if (!rows.length) {
    return { valid: false, reason: 'not_found' };
  }

  const session = rows[0];
  const now = new Date();

  if (!session.is_active) {
    return { valid: false, reason: 'inactive' };
  }

  if (new Date(session.expires_at) <= now) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, session };
}

/**
 * Destroy session by session_id (logout)
 */
export async function destroySession(sessionId) {
  const sql = `
    UPDATE public.user_sessions
    SET is_active = false,
        last_activity_at = NOW()
    WHERE session_id = $1;
  `;

  await query(sql, [sessionId]);
}

/**
 * Destroy all sessions for a user (force logout everywhere)
 */
export async function destroyAllSessionsForUser(userId) {
  const sql = `
    UPDATE public.user_sessions
    SET is_active = false,
        last_activity_at = NOW()
    WHERE user_id = $1;
  `;
  await query(sql, [userId]);
}