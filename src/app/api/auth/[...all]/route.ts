import { toNextJsHandler } from "better-auth/next-js";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/_lib/auth";
import { clientIp, limiterFor } from "@/_lib/rate-limit";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const limiter = limiterFor(pathname);

  if (limiter) {
    const { success } = await limiter.limit(clientIp(req));
    if (!success) {
      // Generic message — no email/user signal, prevents account enumeration (D-07).
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
  }

  return handlers.POST(req);
}
