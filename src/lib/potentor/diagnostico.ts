import { potentorFetch } from "./client";

/**
 * Endpoint de "Diagnóstico de Clima Organizacional" en Potentor.
 *
 * Este es el módulo ECO. La spec lo llama incorrectamente "Índice de Potencial"
 * (IP), pero confirmado con el cliente: en Potentor este endpoint corresponde
 * a la Encuesta de Clima Organizacional.
 *
 * Convención: "IP" = Índice de Percepción (score de clima, no potencial).
 *
 * Endpoint: GET /diagnostico/lista_ip?sucursal_id=X&consecutivo=Y
 * Respuesta: { data: IPRow[], total: string|number, enviados: string|number }
 *
 * - data: array de respuestas individuales con score `ip`
 * - total: invitados a contestar
 * - enviados: cuántos respondieron
 * - fecha_termino: fecha en que la persona terminó la encuesta (usamos esto
 *   para agrupar por año, ya que el endpoint no tiene filtro `year`).
 */

export interface IPRow {
  consecutivo: string;
  sucursal: string;
  area: string;
  departamento: string;
  nombre: string;
  curp: string;
  email: string;
  /** "YYYY-MM-DD HH:MM:SS" */
  fecha_termino: string;
  fecha_descarga: string;
  /** Score 0-100 (string en la respuesta). 0 = no contestó. */
  ip: string;
}

export interface ListaIPResponse {
  data: IPRow[];
  total: string | number;
  enviados: string | number;
}

/** GET /diagnostico/lista_ip */
export async function getEcoResultados(args?: {
  sucursal_id?: string | number;
  consecutivo?: string | number;
}): Promise<ListaIPResponse> {
  return potentorFetch<ListaIPResponse>("/diagnostico/lista_ip", {
    query: {
      sucursal_id: args?.sucursal_id,
      consecutivo: args?.consecutivo,
    },
    tags: ["diagnostico", "eco"],
  });
}

// ============ Agregados para el dashboard ============

export interface EcoResumenAnio {
  year: number;
  totalInvitados: number;
  respondieron: number;
  tasaRespuesta: number; // 0..1
  promedioIp: number | null; // promedio sobre los que sí contestaron (ip > 0)
  porSucursal: Map<string, { suma: number; n: number; promedio: number }>;
  porArea: Map<string, { suma: number; n: number; promedio: number }>;
}

function yearOf(row: IPRow): number | null {
  const y = (row.fecha_termino || "").slice(0, 4);
  const n = Number(y);
  return Number.isFinite(n) && n > 2000 ? n : null;
}

function scoreOf(row: IPRow): number {
  return Number(row.ip) || 0;
}

/** Particiona las filas por año (de fecha_termino) y devuelve un resumen por año. */
export function resumirEcoPorAnio(rows: IPRow[]): Map<number, EcoResumenAnio> {
  const byYear = new Map<number, IPRow[]>();
  for (const r of rows) {
    const y = yearOf(r);
    if (y === null) continue;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(r);
  }

  const out = new Map<number, EcoResumenAnio>();
  for (const [year, group] of byYear) {
    const respondieron = group.filter((r) => scoreOf(r) > 0).length;
    const totalInvitados = group.length;
    const suma = group.reduce((acc, r) => acc + scoreOf(r), 0);
    const promedioIp = respondieron > 0 ? suma / respondieron : null;

    const porSucursal = new Map<
      string,
      { suma: number; n: number; promedio: number }
    >();
    const porArea = new Map<
      string,
      { suma: number; n: number; promedio: number }
    >();
    for (const r of group) {
      if (scoreOf(r) === 0) continue;
      for (const [bucket, key] of [
        [porSucursal, r.sucursal || "Sin sucursal"] as const,
        [porArea, r.area || "Sin área"] as const,
      ]) {
        const cur = bucket.get(key) ?? { suma: 0, n: 0, promedio: 0 };
        cur.suma += scoreOf(r);
        cur.n += 1;
        cur.promedio = cur.suma / cur.n;
        bucket.set(key, cur);
      }
    }

    out.set(year, {
      year,
      totalInvitados,
      respondieron,
      tasaRespuesta: totalInvitados > 0 ? respondieron / totalInvitados : 0,
      promedioIp,
      porSucursal,
      porArea,
    });
  }
  return out;
}

/** Comparativo 2025 vs 2026 con delta. */
export interface EcoComparativo {
  a: EcoResumenAnio | null;
  b: EcoResumenAnio | null;
  deltaPromedio: number | null;
  deltaTasa: number | null;
}

export function compararEco(
  resumenPorAnio: Map<number, EcoResumenAnio>,
  yearA: number,
  yearB: number,
): EcoComparativo {
  const a = resumenPorAnio.get(yearA) ?? null;
  const b = resumenPorAnio.get(yearB) ?? null;
  return {
    a,
    b,
    deltaPromedio:
      a?.promedioIp != null && b?.promedioIp != null
        ? b.promedioIp - a.promedioIp
        : null,
    deltaTasa:
      a && b ? b.tasaRespuesta - a.tasaRespuesta : null,
  };
}
