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

/**
 * Vacantes creadas en 2026. Filtro real desde 2026-06-04 cuando Potentor
 * agregó `fecha_creacion` al response de /reclutamiento/lista.
 */
export function isVacante2026(v: Vacante): boolean {
  return (v.fecha_creacion ?? "").startsWith("2026");
}

/** Vacantes "En Proceso" — activamente reclutando, sin importar año de creación. */
export function isVacanteEnReclutamiento(v: Vacante): boolean {
  const e = (v.estatus || "").toLowerCase().trim();
  return /en\s*proceso/.test(e);
}

export type VacantesResumen = {
  total: number; // todas las históricas
  abiertas: number; // no cerradas
  vacantes2026: number; // fecha_creacion en 2026
  enReclutamiento: number; // estatus En Proceso (cualquier año)
  abiertas2026: number; // creadas en 2026 + estatus no cerrado
  porSucursal: Map<string, number>;
  porSucursal2026: Map<string, number>; // creadas en 2026
};

export function resumenVacantes(vacantes: Vacante[]): VacantesResumen {
  const porSucursal = new Map<string, number>();
  const porSucursal2026 = new Map<string, number>();
  let abiertas = 0;
  let vacantes2026 = 0;
  let enReclutamiento = 0;
  let abiertas2026 = 0;
  for (const v of vacantes) {
    const sName = v.sucursal || "Sin sucursal";
    porSucursal.set(sName, (porSucursal.get(sName) ?? 0) + 1);
    const e = (v.estatus || "").toLowerCase();
    const cerrada = /cubierta|cancelada|cerrada/.test(e);
    if (!cerrada) abiertas++;
    if (isVacanteEnReclutamiento(v)) enReclutamiento++;
    if (isVacante2026(v)) {
      vacantes2026++;
      porSucursal2026.set(sName, (porSucursal2026.get(sName) ?? 0) + 1);
      if (!cerrada) abiertas2026++;
    }
  }
  return {
    total: vacantes.length,
    abiertas,
    vacantes2026,
    enReclutamiento,
    abiertas2026,
    porSucursal,
    porSucursal2026,
  };
}
