/**
 * Request Utility Functions
 * Helper functions for extracting and normalizing request data
 */

/**
 * Normalize IP address from request headers
 * Handles IPv6 mapped IPv4 addresses and localhost
 */
export function normalizeIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

  if (!rawIp) return null;

  // ::1 → 127.0.0.1
  if (rawIp === '::1') return '127.0.0.1';

  // ::ffff:192.168.1.10 → 192.168.1.10
  if (rawIp.startsWith('::ffff:')) return rawIp.replace('::ffff:', '');

  return rawIp;
}

/**
 * Extract user agent from request
 */
export function getUserAgent(req) {
  return req.headers['user-agent'] || null;
}

/**
 * Extract client information from request
 */
export function getClientInfo(req) {
  return {
    ip: normalizeIp(req),
    userAgent: getUserAgent(req),
  };
}

