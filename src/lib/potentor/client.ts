/**
 * Potentor REST API client.
 *
 * Docs: https://campus.potentor.com.mx/docs/api_rest/
 * Auth: header `POTENTOR-API-KEY: <key>`
 *
 * In Next.js 16 fetch() is NOT cached by default. We opt in with
 * `next: { revalidate, tags }` so repeated visits within TTL hit the cache
 * instead of hammering Potentor.
 */

const BASE_URL =
  process.env.POTENTOR_BASE_URL ?? "https://campus.potentor.com.mx/api_rest";

const API_KEY = process.env.POTENTOR_API_KEY ?? "";

const DEFAULT_TTL = Number(process.env.POTENTOR_CACHE_TTL ?? "600");

export const POTENTOR_CACHE_TAG = "potentor";

export class PotentorError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public response?: unknown,
  ) {
    super(message);
    this.name = "PotentorError";
  }
}

export interface PotentorRequestOptions {
  /** Query string parameters. Undefined/null values are dropped. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Cache TTL in seconds. Defaults to POTENTOR_CACHE_TTL env (600s). 0 = no cache. */
  revalidate?: number;
  /** Extra cache tags for granular invalidation via revalidateTag(). */
  tags?: string[];
  /** Override HTTP method (default GET). */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** JSON body for non-GET requests. */
  body?: unknown;
}

/**
 * Server-side Potentor fetch. Call ONLY from Server Components, Server Actions,
 * or Route Handlers — never from the browser (would leak API key).
 */
export async function potentorFetch<T = unknown>(
  endpoint: string,
  options: PotentorRequestOptions = {},
): Promise<T> {
  if (!API_KEY) {
    throw new PotentorError(
      "POTENTOR_API_KEY is not set. Add it to .env.local.",
      0,
      endpoint,
    );
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${BASE_URL}${path}`);

  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const method = options.method ?? "GET";
  const revalidate = options.revalidate ?? DEFAULT_TTL;

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "POTENTOR-API-KEY": API_KEY,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    // Caching: only cache GET requests by default.
    next:
      method === "GET" && revalidate > 0
        ? {
            revalidate,
            tags: [POTENTOR_CACHE_TAG, ...(options.tags ?? [])],
          }
        : { revalidate: 0 },
    cache: method === "GET" && revalidate > 0 ? "force-cache" : "no-store",
  });

  // Potentor sometimes returns 200 with `{status:false, error:"..."}` body.
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new PotentorError(
      `Non-JSON response from Potentor (${res.status})`,
      res.status,
      endpoint,
      text.slice(0, 200),
    );
  }

  if (!res.ok) {
    throw new PotentorError(
      `Potentor ${res.status} on ${endpoint}`,
      res.status,
      endpoint,
      parsed,
    );
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "status" in parsed &&
    (parsed as { status: unknown }).status === false
  ) {
    const errMsg =
      (parsed as { error?: string }).error ?? "Unknown Potentor error";
    throw new PotentorError(errMsg, res.status, endpoint, parsed);
  }

  return parsed as T;
}

export const POTENTOR_DEFAULTS = {
  sucursal: process.env.POTENTOR_DEFAULT_SUCURSAL,
  potentor_id: process.env.POTENTOR_POTENTOR_ID,
};

/**
 * IDs de sucursal que pertenecen a SIMCO. La cuenta de Potentor incluye
 * otras empresas (Fleet, Lexium, etc.), pero el dashboard solo debe
 * mostrar SIMCO. Algunos endpoints son company-wide (/reclutamiento/lista,
 * /diagnostico/lista_ip) y traen TODOS — los filtramos client-side con
 * este conjunto.
 *
 * Configurable vía env `POTENTOR_SIMCO_SUCURSAL_IDS` (comma-separated).
 * Si no está, usa POTENTOR_DEFAULT_SUCURSAL como único ID.
 */
function loadSimcoSucursalIds(): Set<string> {
  const raw =
    process.env.POTENTOR_SIMCO_SUCURSAL_IDS ??
    process.env.POTENTOR_DEFAULT_SUCURSAL ??
    "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export const SIMCO_SUCURSAL_IDS = loadSimcoSucursalIds();

/**
 * Devuelve true si la fila pertenece a una sucursal de SIMCO.
 * La fila puede usar el field `sucursal_id` (reclutamiento) o no traer ID
 * (algunos endpoints solo mandan el nombre); en ese caso comparamos por
 * nombre case-insensitive contra el ID conocido `simco`.
 */
export function isSimcoRow(row: {
  sucursal_id?: string | number | null;
  sucursal?: string | null;
}): boolean {
  if (SIMCO_SUCURSAL_IDS.size === 0) return true; // sin filtro = passthrough
  if (row.sucursal_id != null) {
    return SIMCO_SUCURSAL_IDS.has(String(row.sucursal_id));
  }
  // Fallback por nombre (case insensitive, ignora typos de mayúsculas tipo "SIMCo")
  if (row.sucursal) {
    return /\bsimco\b/i.test(row.sucursal);
  }
  return false;
}
