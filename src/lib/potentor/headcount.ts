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
