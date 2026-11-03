/**
 * Production-grade password hashing using bcryptjs (pure JS, works in Next.js).
 * Falls back gracefully for legacy $dev$ hashes during migration.
 */

import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, BCRYPT_ROUNDS);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  // Legacy dev hash migration — transparently upgrade on successful verify
  if (hash.startsWith("$dev$")) {
    const legacy = Buffer.from(hash.slice(5), "base64").toString("utf8");
    return legacy === pw;
  }
  return bcrypt.compare(pw, hash);
}

/** Check if a hash needs upgrading from the legacy $dev$ format */
export function needsRehash(hash: string): boolean {
  return hash.startsWith("$dev$");
}
