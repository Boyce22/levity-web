/**
 * Auth utilities.
 *
 * Since we now delegate authentication to the external API, we no longer
 * sign our own JWTs. Token verification happens at the API level.
 * Here we only decode the JWT payload (without signature verification)
 * to extract the user ID for server action use.
 */

/**
 * Decodes the JWT payload without verifying the signature.
 * Safe to use on the server since the middleware + external API enforce validity.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extracts the user ID from a JWT token.
 * Tries standard fields: id, sub, userId.
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return (payload.id ?? payload.sub ?? payload.userId ?? null) as string | null;
}

/**
 * Returns true if the token looks like a structurally valid JWT.
 * Does NOT verify the signature — used by middleware for fast auth gating.
 */
export function isTokenStructurallyValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return true;
  } catch {
    return false;
  }
}
