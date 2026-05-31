import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In docker-compose: BACKEND_URL=http://datastream-backend:8000
// In local dev (next dev outside compose): falls back to localhost
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  let body: { source?: string; destination?: string; transform?: string; lang?: "fr" | "en" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.trim().slice(0, 100) : "";
  const destination = typeof body.destination === "string" ? body.destination.trim().slice(0, 100) : "";
  const transform = typeof body.transform === "string" ? body.transform.trim().slice(0, 400) : "";
  const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

  if (!source || !destination) {
    return NextResponse.json(
      {
        error:
          lang === "fr"
            ? "Indiquez au moins une source et une destination."
            : "Provide at least source and destination.",
      },
      { status: 400 }
    );
  }

  try {
    const r = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, destination, transform, lang }),
      cache: "no-store",
    });
    const j = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: j.detail || "backend_error" }, { status: r.status });
    }
    return NextResponse.json({
      brief: j.brief,
      model: j.model,
      generatedAt: j.generated_at,
      staticMode: Boolean(j.static_mode),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ error: `backend_unreachable: ${msg}` }, { status: 502 });
  }
}
