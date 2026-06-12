// CSP report-uri sink (SEC-04 / D-02). Unauthenticated by spec; side-effect-free
// (always 204), logs only outside production to avoid noisy/abusable prod logs.
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (process.env.NODE_ENV !== "production") {
      console.log("[csp-report]", body);
    }
  } catch {
    // Tolerate empty/invalid bodies — never throw on a report POST.
  }

  return new Response(null, { status: 204 });
}
