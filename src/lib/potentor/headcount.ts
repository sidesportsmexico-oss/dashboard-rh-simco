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
};

export function resumenHeadcount(rows: HeadcountRow[]): HeadcountResumen {
  return {
    total: rows.length,
    conNombre: rows.filter((r) => r.NOMB && String(r.NOMB).trim() !== "").length,
  };
}
