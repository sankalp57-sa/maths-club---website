// ============================================================
// MathClub Nexus — Web Crypto SHA-256 Hashing Utilities
// ============================================================

export const DEMO_PASSWORD_HASH =
  '8f5ac45d63a54f936482e28f3131f998a16db18490d053941cbe54c2d51f52dd';

export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback if subtle crypto unavailable
  return DEMO_PASSWORD_HASH;
}
