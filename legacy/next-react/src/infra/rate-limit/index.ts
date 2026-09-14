import { DomainError } from '@/infra/http/errors';

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

/**
 * 🛡️ Anti-Abuse Rate Limiter (Memory-Level)
 * Protects Server Actions from volume spam (DDoS / Brute-force).
 *
 * @param identifier Unique key representing the action and user (e.g. `user123:generateInvite`)
 * @param limit      Max requests allowed inside the time window
 * @param windowMs   Window length in milliseconds (e.g. 60_000 = 1 min)
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // 1. No record yet, or window expired → reset
  if (!record || now > record.expiresAt) {
    rateLimitStore.set(identifier, { count: 1, expiresAt: now + windowMs });

    // Lazy GC: purge stale entries when map grows large
    if (rateLimitStore.size > 5_000) {
      for (const [key, val] of rateLimitStore.entries()) {
        if (now > val.expiresAt) rateLimitStore.delete(key);
      }
    }
    return;
  }

  // 2. Over limit → reject
  if (record.count >= limit) {
    throw new DomainError(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded. Please wait before trying again.',
    );
  }

  // 3. Within limit → increment
  record.count += 1;
  rateLimitStore.set(identifier, record);
}
