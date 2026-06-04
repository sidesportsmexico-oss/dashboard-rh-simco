import { potentorFetch, POTENTOR_DEFAULTS, isSimcoRow } from "./client";
import type { Vacante, VacanteEtapa, Candidato } from "./types";

/**
 * Catálogo de vacantes de SIMCO.
 * Endpoint: GET /reclutamiento/lista (company-wide — incluye Fleet/Lexium,
 * filtramos a SIMCO con `isSimcoRow`).
 */
export async function getVacantes(): Promise<Vacante[]> {
  const all = await potentorFetch<Vacante[]>("/reclutamiento/lista", {
    tags: ["reclutamiento", "vacantes"],
  });
  return all.filter(isSimcoRow);
}

/** Versión sin filtro — útil para debugging o si en el futuro queremos comparar empresas. */
export async function getVacantesTodas(): Promise<Vacante[]> {
  return potentorFetch<Vacante[]>("/reclutamiento/lista", {
    tags: ["reclutamiento", "vacantes", "todas"],
  });
}

/**
 * Catálogo de etapas del proceso de reclutamiento.
 * Endpoint: GET /vacante/etapas?sucursal=X
 * (Sandbox suele responder 403; prod debería tener permiso.)
 */
export async function getEtapasReclutamiento(
  sucursal: string | number = POTENTOR_DEFAULTS.sucursal ?? "",
): Promise<VacanteEtapa[]> {
  return potentorFetch<VacanteEtapa[]>("/vacante/etapas", {
    query: { sucursal },
    tags: ["reclutamiento", "etapas"],
  });
}

/**
 * Listado de candidatos por vacante.
 * Endpoint: GET /reclutamiento/candidatos?vacante_id=X
 */
export async function getCandidatosPorVacante(
  vacante_id: string | number,
): Promise<Candidato[]> {
  return potentorFetch<Candidato[]>("/reclutamiento/candidatos", {
    query: { vacante_id },
    tags: ["reclutamiento", "candidatos", `vacante:${vacante_id}`],
  });
}

/** Agrega un candidato. */
export async function getDetalleCandidato(
  candidato_id: string | number,
): Promise<Candidato> {
  return potentorFetch<Candidato>("/reclutamiento/candidato", {
    query: { candidato_id },
    tags: ["reclutamiento", `candidato:${candidato_id}`],
  });
}

// ============ Agregados para el dashboard ============

export type FunnelStage = {
  estatus: string;
  count: number;
};

/**
 * Cuenta vacantes agrupadas por `estatus`. Útil para un funnel rápido
 * sin tener que jalar candidatos por cada vacante.
 */
export function buildFunnelDesdeVacantes(vacantes: Vacante[]): FunnelStage[] {
  const counts = new Map<string, number>();
  for (const v of vacantes) {
    const key = v.estatus?.trim() || "Sin estatus";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([estatus, count]) => ({ estatus, count }))
    .sort((a, b) => b.count - a.count);
}

export type VacantesResumen = {
  total: number;
  abiertas: number;
  porSucursal: Map<string, number>;
};

export function resumenVacantes(vacantes: Vacante[]): VacantesResumen {
  const porSucursal = new Map<string, number>();
  let abiertas = 0;
  for (const v of vacantes) {
    const sName = v.sucursal || "Sin sucursal";
    porSucursal.set(sName, (porSucursal.get(sName) ?? 0) + 1);
    // Heurística: cualquier estatus que no sea Cubierta/Cancelada/Cerrada cuenta como abierta.
    const e = (v.estatus || "").toLowerCase();
    if (!/cubierta|cancelada|cerrada/.test(e)) abiertas++;
  }
  return { total: vacantes.length, abiertas, porSucursal };
}
