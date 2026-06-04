import { potentorFetch, isSimcoRow } from "./client";

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

/**
 * GET /diagnostico/lista_ip
 *
 * El endpoint es company-wide (devuelve respuestas de SIMCO + Fleet + otras
 * empresas en la misma cuenta). Filtramos a SIMCO usando `isSimcoRow`
 * sobre cada fila — las filas no traen `sucursal_id` pero sí `sucursal`
 * como string, así que el filtro compara por nombre.
 */
export async function getEcoResultados(args?: {
  sucursal_id?: string | number;
  consecutivo?: string | number;
}): Promise<ListaIPResponse> {
  const resp = await potentorFetch<ListaIPResponse>("/diagnostico/lista_ip", {
    query: {
      sucursal_id: args?.sucursal_id,
      consecutivo: args?.consecutivo,
    },
    tags: ["diagnostico", "eco"],
  });
  const filtered = (resp.data ?? []).filter((r) =>
    isSimcoRow({ sucursal: r.sucursal }),
  );
  return { ...resp, data: filtered };
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

// ============ Modelo de Encuestas ECO ============
//
// El API /diagnostico/lista_ip mezcla TODAS las respuestas de TODOS los
// diagnósticos sin un campo encuesta_id. SIMCO confirmó (2026-06-04) la
// segmentación interna:
//
// - SIMCO    = personal corporativo  → sucursal=SIMCo AND area ≠ "Operativa"
// - CONCEPTS = personal operativo de restaurantes (Batbox + Mulligans)
//              → sucursal=SIMCo AND area = "Operativa"
//
// La fecha (fecha_termino) define a qué edición (año) pertenece la respuesta.

export type EncuestaDef = {
  id: string;
  nombre: string;
  audiencia: "Corporativo" | "Operativo" | "Mixto";
  year: number;
  filter: (row: IPRow) => boolean;
};

function inSimco(r: IPRow): boolean {
  return /\bsimco\b/i.test(r.sucursal ?? "");
}
function isOperativa(r: IPRow): boolean {
  return /\boperativa\b/i.test(r.area ?? "");
}
function yearStartsWith(r: IPRow, year: number): boolean {
  return (r.fecha_termino ?? "").startsWith(String(year));
}

export const ENCUESTAS_ECO: EncuestaDef[] = [
  {
    id: "eco_2024_2",
    nombre: "ECO 2024 (2)",
    audiencia: "Mixto",
    year: 2024,
    filter: (r) => inSimco(r) && yearStartsWith(r, 2024),
  },
  {
    id: "eco_2025_simco",
    nombre: "ECO 2025 SIMCO",
    audiencia: "Corporativo",
    year: 2025,
    filter: (r) => inSimco(r) && yearStartsWith(r, 2025) && !isOperativa(r),
  },
  {
    id: "eco_2025_concepts",
    nombre: "ECO 2025 CONCEPTS",
    audiencia: "Operativo",
    year: 2025,
    filter: (r) => inSimco(r) && yearStartsWith(r, 2025) && isOperativa(r),
  },
];

export type EncuestaResumen = {
  def: EncuestaDef;
  rows: IPRow[];
  respondieron: number;
  total: number;
  tasaRespuesta: number;
  promedioIp: number | null;
  porArea: Map<string, { suma: number; n: number; promedio: number }>;
  porDepartamento: Map<string, { suma: number; n: number; promedio: number }>;
  distribucion: number[]; // 10 buckets de 10 puntos
};

function bucketIndex(ip: number): number {
  return Math.min(Math.max(Math.floor(ip / 10), 0), 9);
}

export function resumirEncuesta(rows: IPRow[], def: EncuestaDef): EncuestaResumen {
  const filtered = rows.filter(def.filter);
  const distribucion = new Array(10).fill(0);
  const porArea = new Map<string, { suma: number; n: number; promedio: number }>();
  const porDepartamento = new Map<
    string,
    { suma: number; n: number; promedio: number }
  >();
  let suma = 0;
  let respondieron = 0;
  for (const r of filtered) {
    const ip = scoreOf(r);
    if (ip <= 0) continue;
    respondieron++;
    suma += ip;
    distribucion[bucketIndex(ip)]++;
    const areaKey = r.area?.trim() || "Sin área";
    const depKey = r.departamento?.trim() || "Sin departamento";
    const ax = porArea.get(areaKey) ?? { suma: 0, n: 0, promedio: 0 };
    ax.suma += ip;
    ax.n += 1;
    ax.promedio = ax.suma / ax.n;
    porArea.set(areaKey, ax);
    const dx = porDepartamento.get(depKey) ?? { suma: 0, n: 0, promedio: 0 };
    dx.suma += ip;
    dx.n += 1;
    dx.promedio = dx.suma / dx.n;
    porDepartamento.set(depKey, dx);
  }
  return {
    def,
    rows: filtered,
    respondieron,
    total: filtered.length,
    tasaRespuesta: filtered.length > 0 ? respondieron / filtered.length : 0,
    promedioIp: respondieron > 0 ? suma / respondieron : null,
    porArea,
    porDepartamento,
    distribucion,
  };
}

export function compararEncuestas(rows: IPRow[]): EncuestaResumen[] {
  return ENCUESTAS_ECO.map((def) => resumirEncuesta(rows, def));
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

// ============ Helpers para gráficas ============

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export type MonthlyTrendPoint = {
  month: string;
  monthIdx: number;
  yearA: number | null;
  yearB: number | null;
  nA: number;
  nB: number;
};

/**
 * Tendencia mensual de IP por año. Devuelve los 12 meses (1-12) con el
 * promedio de IP de yearA y yearB en cada uno. null cuando no hay respuestas.
 */
export function buildTendenciaMensual(
  rows: IPRow[],
  yearA: number,
  yearB: number,
): MonthlyTrendPoint[] {
  const acc = new Map<
    string,
    { suma: number; n: number }
  >();
  for (const r of rows) {
    const ft = r.fecha_termino ?? "";
    if (ft.length < 7) continue;
    const ip = Number(r.ip);
    if (!Number.isFinite(ip) || ip <= 0) continue;
    const y = Number(ft.slice(0, 4));
    const m = Number(ft.slice(5, 7));
    if (y !== yearA && y !== yearB) continue;
    const key = `${y}-${m}`;
    const cur = acc.get(key) ?? { suma: 0, n: 0 };
    cur.suma += ip;
    cur.n += 1;
    acc.set(key, cur);
  }
  const out: MonthlyTrendPoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const a = acc.get(`${yearA}-${m}`);
    const b = acc.get(`${yearB}-${m}`);
    out.push({
      month: MONTHS_SHORT[m - 1],
      monthIdx: m,
      yearA: a ? a.suma / a.n : null,
      yearB: b ? b.suma / b.n : null,
      nA: a?.n ?? 0,
      nB: b?.n ?? 0,
    });
  }
  return out;
}

export type AreaComparison = {
  area: string;
  yearA: number | null;
  yearB: number | null;
  nA: number;
  nB: number;
  delta: number | null;
};

/**
 * Score promedio por área en cada año. Solo devuelve áreas que tienen al
 * menos una respuesta en alguno de los dos años. Ordenado por delta desc.
 */
export function buildComparativoPorArea(
  rows: IPRow[],
  yearA: number,
  yearB: number,
): AreaComparison[] {
  const acc = new Map<
    string,
    {
      sumA: number;
      nA: number;
      sumB: number;
      nB: number;
    }
  >();
  for (const r of rows) {
    const ft = r.fecha_termino ?? "";
    if (ft.length < 4) continue;
    const ip = Number(r.ip);
    if (!Number.isFinite(ip) || ip <= 0) continue;
    const y = Number(ft.slice(0, 4));
    if (y !== yearA && y !== yearB) continue;
    const area = r.area?.trim() || "Sin área";
    const cur = acc.get(area) ?? { sumA: 0, nA: 0, sumB: 0, nB: 0 };
    if (y === yearA) {
      cur.sumA += ip;
      cur.nA += 1;
    } else {
      cur.sumB += ip;
      cur.nB += 1;
    }
    acc.set(area, cur);
  }
  const out: AreaComparison[] = [];
  for (const [area, s] of acc) {
    const a = s.nA > 0 ? s.sumA / s.nA : null;
    const b = s.nB > 0 ? s.sumB / s.nB : null;
    out.push({
      area,
      yearA: a,
      yearB: b,
      nA: s.nA,
      nB: s.nB,
      delta: a !== null && b !== null ? b - a : null,
    });
  }
  return out.sort((x, y) => (y.delta ?? -Infinity) - (x.delta ?? -Infinity));
}

export type DistribucionBucket = {
  range: string;
  yearA: number;
  yearB: number;
};

/**
 * Distribución de scores en buckets de 10 puntos (0-10, 10-20, ..., 90-100).
 * Sirve para comparar cómo se polarizan las respuestas año vs año.
 */
export function buildDistribucionScores(
  rows: IPRow[],
  yearA: number,
  yearB: number,
): DistribucionBucket[] {
  const a = new Array(10).fill(0);
  const b = new Array(10).fill(0);
  for (const r of rows) {
    const ft = r.fecha_termino ?? "";
    if (ft.length < 4) continue;
    const ip = Number(r.ip);
    if (!Number.isFinite(ip) || ip <= 0) continue;
    const y = Number(ft.slice(0, 4));
    if (y !== yearA && y !== yearB) continue;
    const bucket = Math.min(Math.floor(ip / 10), 9);
    if (y === yearA) a[bucket]++;
    else b[bucket]++;
  }
  return Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    yearA: a[i],
    yearB: b[i],
  }));
}
