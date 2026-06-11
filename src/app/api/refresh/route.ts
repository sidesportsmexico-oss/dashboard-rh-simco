import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { POTENTOR_CACHE_TAG } from "@/lib/potentor/client";

/**
 * Endpoint de refresh manual del dashboard.
 *
 * Uso: GET /api/refresh?key=<REFRESH_KEY>
 *
 * Invalida:
 *  - Todos los fetches cacheados con tag "potentor" (data en Next.js fetch cache)
 *  - El render ISR de las 5 páginas (page, /reclutamiento, /headcount, /eco,
 *    /evaluacion-360) recargándolas con data fresca de Potentor
 *
 * La key se compara contra REFRESH_KEY del env. Si no está definida, acepta
 * la string default "simco-refresh" para no bloquear si olvidan configurarla.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedKey = url.searchParams.get("key") ?? "";
  const expectedKey = process.env.REFRESH_KEY ?? "simco-refresh";

  if (providedKey !== expectedKey) {
    return NextResponse.json(
      { ok: false, error: "Invalid key" },
      { status: 401 },
    );
  }

  // 1. Invalida todos los fetches a Potentor.
  // Next.js 16: el segundo argumento es obligatorio. { expire: 0 } fuerza
  // expiración inmediata (la próxima visita hace fetch fresco en bloqueo).
  revalidateTag(POTENTOR_CACHE_TAG, { expire: 0 });

  // 2. Invalida el render ISR de cada página
  const paths = ["/", "/reclutamiento", "/headcount", "/eco", "/evaluacion-360"];
  for (const p of paths) {
    revalidatePath(p);
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      tag: POTENTOR_CACHE_TAG,
      paths,
      at: new Date().toISOString(),
    },
  });
}

// Evita que esta ruta sea cacheada — siempre debe ejecutar.
export const dynamic = "force-dynamic";
