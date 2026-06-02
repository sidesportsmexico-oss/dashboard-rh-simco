import { potentorFetch, POTENTOR_DEFAULTS } from "./client";

/**
 * Endpoints de "Proceso de Desempeño" en Potentor.
 *
 * ⚠️ IMPORTANTE: La spec OpenAPI de Potentor no expone un endpoint llamado
 * "360" ni "ECO" explícitamente. Sin embargo, la plataforma (potentor.com.mx)
 * sí tiene esos módulos. Los endpoints de `/desempeno/*` son nuestro mejor
 * candidato para 360 hasta que Potentor confirme la API específica.
 *
 * `working_process_by_date` es el ÚNICO endpoint en toda la spec con
 * parámetro `year` — eso lo hace el match más natural para comparativos
 * 2025 vs 2026.
 */

/** Estructura cruda — Potentor no documenta el schema completo. */
export interface ProcesoDesempeno {
  proceso_id?: string;
  nombre?: string;
  tipo?: string;
  sucursal_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estatus?: string;
  colaboradores?: Colaborador360[];
  indicadores?: Indicador[];
  [key: string]: unknown;
}

export interface Colaborador360 {
  empleado_id?: string;
  nombre?: string;
  calificacion?: number | string;
  [key: string]: unknown;
}

export interface Indicador {
  indicador_id?: string;
  nombre?: string;
  peso?: number | string;
  avance?: number | string;
  [key: string]: unknown;
}

/**
 * Procesos de desempeño en el mes/año indicado para una sucursal.
 * Endpoint: GET /desempeno/working_process_by_date?sucursal_id=X&year=Y
 *
 * Devuelve procesos "en proceso" (no terminados) — para histórico cerrado
 * probablemente necesitemos otro endpoint o filtrado por estatus.
 */
export async function getProcesosDesempenoPorFecha(args: {
  sucursal_id: string | number;
  year?: string | number;
}): Promise<ProcesoDesempeno[]> {
  return potentorFetch<ProcesoDesempeno[]>("/desempeno/working_process_by_date", {
    query: {
      sucursal_id: args.sucursal_id,
      year: args.year,
    },
    tags: ["desempeno", `year:${args.year ?? "all"}`],
  });
}

/** Indicadores de un proceso de desempeño. GET /desempeno/indicadores?proceso_id=X */
export async function getIndicadoresProceso(
  proceso_id: string | number,
): Promise<Indicador[]> {
  return potentorFetch<Indicador[]>("/desempeno/indicadores", {
    query: { proceso_id },
    tags: ["desempeno", `proceso:${proceso_id}`],
  });
}

// ============ Comparativo 2025 vs 2026 ============

export type DesempenoComparativo = {
  year2025: ProcesoDesempeno[] | { error: string };
  year2026: ProcesoDesempeno[] | { error: string };
};

/**
 * Trae procesos de los dos años en paralelo para comparativo.
 * Cada año puede fallar independientemente sin tumbar al otro.
 */
export async function getComparativoDesempeno(
  sucursal_id: string | number = POTENTOR_DEFAULTS.sucursal ?? "",
): Promise<DesempenoComparativo> {
  const [r2025, r2026] = await Promise.allSettled([
    getProcesosDesempenoPorFecha({ sucursal_id, year: 2025 }),
    getProcesosDesempenoPorFecha({ sucursal_id, year: 2026 }),
  ]);

  return {
    year2025:
      r2025.status === "fulfilled"
        ? r2025.value
        : { error: r2025.reason instanceof Error ? r2025.reason.message : String(r2025.reason) },
    year2026:
      r2026.status === "fulfilled"
        ? r2026.value
        : { error: r2026.reason instanceof Error ? r2026.reason.message : String(r2026.reason) },
  };
}

export function resumenProcesos(procesos: ProcesoDesempeno[]): {
  total: number;
  colaboradores: number;
  promedioCalif: number | null;
} {
  let colaboradores = 0;
  let sumaCalif = 0;
  let countCalif = 0;
  for (const p of procesos) {
    if (Array.isArray(p.colaboradores)) {
      colaboradores += p.colaboradores.length;
      for (const c of p.colaboradores) {
        const v = typeof c.calificacion === "string" ? Number(c.calificacion) : c.calificacion;
        if (typeof v === "number" && !Number.isNaN(v)) {
          sumaCalif += v;
          countCalif++;
        }
      }
    }
  }
  return {
    total: procesos.length,
    colaboradores,
    promedioCalif: countCalif > 0 ? sumaCalif / countCalif : null,
  };
}
