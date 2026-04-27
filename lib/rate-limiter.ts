/**
 * Simple in-memory rate limiter
 * Used for API route protection
 */

class RateLimiterClass {
  private requests: Map<string, number[]> = new Map();
  private static instance: RateLimiterClass;

  private constructor() {}

  static getInstance(): RateLimiterClass {
    if (!RateLimiterClass.instance) {
      RateLimiterClass.instance = new RateLimiterClass();
    }
    return RateLimiterClass.instance;
  }

  async check(key: string, maxRequests: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;
    
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(t => t > windowStart);
    
    const allowed = validTimestamps.length < maxRequests;
    const remaining = Math.max(0, maxRequests - validTimestamps.length);
    const reset = Math.ceil((windowStart + windowMs) / 1000);
    
    if (allowed) {
      validTimestamps.push(now);
      this.requests.set(key, validTimestamps);
    }
    
    return { allowed, remaining, reset };
  }
}

export const RateLimiter = RateLimiterClass.getInstance();
