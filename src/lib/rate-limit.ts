const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

/**
 * 🛡️ Anti-Abuse Rate Limiter (Memory-Level)
 * Protects Server Actions from brutal volume spam (DDoS/Brute-force).
 * 
 * @param identifier Unique key representing the action and user (e.g. `user_123_generate_invite`)
 * @param limit Max amount of requests permitted in the temporal window
 * @param windowMs Amount of milliseconds before the counter resets (e.g. 60000 = 1 minute)
 */
export async function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // 1. If no record or expired, reset boundary
  if (!record || now > record.expiresAt) {
    rateLimitStore.set(identifier, { count: 1, expiresAt: now + windowMs });
    
    // Abstract Garbage Collection: Occasionally purge stale memory references
    if (rateLimitStore.size > 5000) {
       for (const [key, val] of rateLimitStore.entries()) {
         if (now > val.expiresAt) rateLimitStore.delete(key);
       }
    }
    return;
  }

  // 2. Check Capacity
  if (record.count >= limit) {
    throw new Error('429 Too Many Requests: Rate limit exceeded. Please wait shortly before trying again.');
  }

  // 3. Increment usage metric
  record.count += 1;
  rateLimitStore.set(identifier, record);
}
