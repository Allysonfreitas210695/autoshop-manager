import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Verified Better Auth 1.6.11 `/api/auth/*` path segments
 * (inspected node_modules/better-auth/dist/api/routes/*.mjs):
 *   sign-in (email):     /api/auth/sign-in/email
 *   sign-up (email):     /api/auth/sign-up/email
 *   password recovery:   /api/auth/request-password-reset  (authClient.requestPasswordReset)
 *                        /api/auth/forget-password         (legacy alias — matched defensively)
 *   password reset:      /api/auth/reset-password
 *
 * Server-only module: never import from a "use client" component and never
 * expose the Upstash credentials via NEXT_PUBLIC_.
 */

type SlidingWindowDuration = Parameters<typeof Ratelimit.slidingWindow>[1];

const hasUpstashEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// Env-guarded singleton: when Upstash is not configured (e.g. local dev) the
// app still boots — limiters resolve to `null` and the gate is skipped.
const redis = hasUpstashEnv ? Redis.fromEnv() : null;

function slidingLimiter(
  tokens: number,
  window: SlidingWindowDuration,
  prefix: string,
): Ratelimit | null {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
  });
}

/** Login (email sign-in): 5 requests / minute / IP (D-07). */
export const loginLimiter = slidingLimiter(5, "1 m", "rl:login");

/** Forgot + reset password: 3 requests / hour / IP (D-07). */
export const passwordRecoveryLimiter = slidingLimiter(
  3,
  "1 h",
  "rl:pwrecovery",
);

/** Register (email sign-up): 5 requests / hour / IP (D-07). */
export const registerLimiter = slidingLimiter(5, "1 h", "rl:register");

const FALLBACK_IP = "127.0.0.1";

/**
 * Resolve the client IP from the `x-forwarded-for` first hop only.
 * Vercel strips client-spoofed values and appends the real edge IP as the
 * first entry, so other proxy headers are intentionally NOT trusted.
 * `NextRequest.ip` was removed and must not be used.
 */
export function clientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return FALLBACK_IP;
  }

  const firstHop = forwardedFor.split(",")[0]?.trim();
  return firstHop || FALLBACK_IP;
}

/**
 * Select the limiter for a given `/api/auth/*` pathname using the verified
 * Better Auth segments. Returns `null` for any path that should not be
 * rate-limited (or when Upstash is not configured).
 */
export function limiterFor(pathname: string): Ratelimit | null {
  if (pathname.endsWith("/sign-in/email")) {
    return loginLimiter;
  }

  if (pathname.endsWith("/sign-up/email")) {
    return registerLimiter;
  }

  if (
    pathname.endsWith("/request-password-reset") ||
    pathname.endsWith("/forget-password") ||
    pathname.endsWith("/reset-password")
  ) {
    return passwordRecoveryLimiter;
  }

  return null;
}
