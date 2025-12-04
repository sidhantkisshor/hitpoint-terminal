import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a rate limiter that allows 10 requests per 10 seconds
// For production, use Upstash Redis. For development, use in-memory store.
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Production: Use Upstash Redis
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }
} catch (error) {
  console.warn('Rate limiting is disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.');
}

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If rate limiting is not configured, allow all requests
  if (!ratelimit) {
    return {
      success: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 10000,
    };
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}
