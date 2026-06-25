import { potentorFetch, POTENTOR_DEFAULTS } from "./client";
import type { HeadcountField, HeadcountRow } from "./types";

/**
 * Catálogo de campos disponibles para el reporte headcount.
 * Endpoint: GET /headcount/campos
 */
export async function getHeadcountCampos(): Promise<HeadcountField[]> {
  return potentorFetch<HeadcountField[]>("/headcount/campos", {
    tags: ["headcount", "campos"],
  });
}

/**
 * Reporte de head count. Si no se eligen campos, regresa todos los disponibles.
 * Endpoint: GET /headcount/reporte?potentor_id=X[&campos=A,B,C]
 */
export async function getHeadcountReporte(args?: {
  potentor_id?: string | number;
  campos?: string[];
}): Promise<HeadcountRow[]> {
  const potentor_id = args?.potentor_id ?? POTENTOR_DEFAULTS.potentor_id ?? "";
  return potentorFetch<HeadcountRow[]>("/headcount/reporte", {
    query: {
      potentor_id,
      ...(args?.campos?.length ? { campos: args.campos.join(",") } : {}),
    },
    tags: ["headcount", "reporte"],
  });
}

// ============ Agregados ============

export type HeadcountResumen = {
  total: number;
  conNombre: number; // filas con al menos NOMB no null (descarta placeholders)
  /** Plantilla operativa: rows con departamento === "Sucursales" (Batbox/Mulligans). */
  sucursales: number;
  /** Plantilla corporativa: total - sucursales. */
  corporativo: number;
};

/**
 * Clasificación SIMCO vs CONCEPTS según el campo `departamento` de Potentor:
 * - departamento === "Sucursales" → CONCEPTS (operativo restaurantes)
 * - cualquier otro valor → SIMCO (corporativo)
 *
 * Decisión del CEO 2026-06-24: usar departamento (no area) como discriminador.
 */
function esRowSucursal(r: HeadcountRow): boolean {
  const depto = String((r as Record<string, unknown>).departamento ?? "")
    .trim()
    .toLowerCase();
  return depto === "sucursales";
}

export function resumenHeadcount(rows: HeadcountRow[]): HeadcountResumen {
  let suc = 0;
  let conNombre = 0;
  for (const r of rows) {
    if (esRowSucursal(r)) suc++;
    if (r.NOMB && String(r.NOMB).trim() !== "") conNombre++;
  }
  return {
    total: rows.length,
    conNombre,
    sucursales: suc,
    corporativo: rows.length - suc,
  };
}

/**
 * Cuenta posiciones REALMENTE OCUPADAS por jerarquía a partir del headcount.
 *
 * El endpoint /sucursal/jerarquias devuelve slots de la estructura (incluye
 * posiciones vacantes), no personas. Para el modal del organigrama el CEO
 * quiere ver ocupadas, no slots — esta función nos da eso.
 *
 * Retorna mapa { jerarquia (uppercase) → conteo }.
 */
export function jerarquiasOcupadasDesdeHeadcount(
  rows: HeadcountRow[],
): Map<string, number> {
  const out = new Map<string, number>();
  for (const r of rows) {
    const j = String((r as Record<string, unknown>).jerarquia ?? "")
      .trim()
      .toUpperCase();
    if (!j) continue;
    out.set(j, (out.get(j) ?? 0) + 1);
  }
  return out;
}

/**
 * Shape mínimo que necesita el modal de detalle por jerarquía.
 * Evita serializar al cliente los ~40 campos que tiene cada row de Potentor
 * (RFC, CURP, dirección, IMSS, etc.) — info sensible y no la usamos.
 */
export interface EmpleadoSlim {
  nombre: string;
  puesto: string;
  jerarquia: string;
  area: string;
  departamento: string;
}

export function headcountASlim(rows: HeadcountRow[]): EmpleadoSlim[] {
  return rows.map((r) => {
    const x = r as Record<string, unknown>;
    const nombre = [r.NOMB, r.APAT, r.AMAT]
      .map((s) => (s ?? "").toString().trim())
      .filter(Boolean)
      .join(" ");
    return {
      nombre: nombre || "—",
      puesto: String(x.puesto ?? "").trim(),
      jerarquia: String(x.jerarquia ?? "").trim(),
      area: String(x.area ?? "").trim(),
      departamento: String(x.departamento ?? "").trim(),
    };
  });
}
