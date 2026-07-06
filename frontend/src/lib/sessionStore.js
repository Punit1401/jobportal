// src/lib/sessionStore.js
import crypto from "crypto";

const SESSIONS = new Map(); // sessionId -> { userId, role, name, email, expiresAt }

const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export function createSession(payload, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const sessionId = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + ttlSeconds * 1000;
  SESSIONS.set(sessionId, { ...payload, expiresAt });
  return sessionId;
}

export function getSession(sessionId) {
  const s = SESSIONS.get(sessionId);
  if (!s) return null;
  if (Date.now() > s.expiresAt) {
    // expired
    SESSIONS.delete(sessionId);
    return null;
  }
  return s;
}

export function deleteSession(sessionId) {
  return SESSIONS.delete(sessionId);
}

// optional: cleanup function
export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, sess] of SESSIONS.entries()) {
    if (sess.expiresAt <= now) SESSIONS.delete(id);
  }
}

export { SESSIONS };
