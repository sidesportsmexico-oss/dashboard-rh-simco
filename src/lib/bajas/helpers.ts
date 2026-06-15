import type {
  Baja,
  BajaBase,
  BajaSucursal,
  BajaCorporativo,
} from "./types";

/**
 * Detecta si un motivo es un "marcador" (X, x, ✓, etc.) en lugar de un
 * motivo real. Algunas filas del sheet solo marcaron tipo de baja con X
 * sin describir el motivo.
 */
function esMotivoMarcador(s: string): boolean {
  const t = s.trim();
  if (t.length === 0) return true;
  if (t.length <= 2) return true; // X, x, X., etc.
  return false;
}

/** ¿Esta baja fue voluntaria? (tiene cualquier marca en motivo_voluntaria) */
export function esVoluntaria(b: BajaBase): boolean {
  return !!b.motivo_voluntaria?.trim();
}

/** ¿Esta baja fue involuntaria? */
export function esInvoluntaria(b: BajaBase): boolean {
  return !!b.motivo_involuntaria?.trim();
}

/** Motivo limpio del registro: ignora marcadores tipo "X". */
export function motivoLimpio(b: BajaBase): string {
  const v = (b.motivo_voluntaria ?? "").trim();
  const i = (b.motivo_involuntaria ?? "").trim();
  if (v && !esMotivoMarcador(v)) return v;
  if (i && !esMotivoMarcador(i)) return i;
  return "";
}

/** Año de la baja a partir de fecha_salida. null si no hay fecha. */
export function yearBaja(b: BajaBase): number | null {
  const y = (b.fecha_salida ?? "").slice(0, 4);
  const n = Number(y);
  return Number.isFinite(n) && n > 2000 ? n : null;
}

/** Mes (1-12) de la baja. null si no hay fecha. */
export function monthBaja(b: BajaBase): number | null {
  const m = (b.fecha_salida ?? "").slice(5, 7);
  const n = Number(m);
  return Number.isFinite(n) && n >= 1 && n <= 12 ? n : null;
}

/** Filtra por año (descarta sin fecha). */
export function filtrarPorAnio<T extends BajaBase>(bajas: T[], year: number): T[] {
  return bajas.filter((b) => yearBaja(b) === year);
}

/** Filtra por múltiples años (descarta sin fecha). */
export function filtrarPorAnios<T extends BajaBase>(
  bajas: T[],
  years: number[],
): T[] {
  const set = new Set(years);
  return bajas.filter((b) => {
    const y = yearBaja(b);
    return y !== null && set.has(y);
  });
}

/**
 * Índice de rotación anual = (bajas año / plantilla promedio) × 100.
 *
 * Como no tenemos la plantilla histórica de cada año, usamos la actual
 * como proxy (limitación documentada). Devuelve 0 si la plantilla es 0.
 */
export function indiceRotacion(numBajas: number, plantilla: number): number {
  if (plantilla <= 0) return 0;
  return (numBajas / plantilla) * 100;
}

/** Filtra bajas de sucursales por sucursal específica. */
export function filtrarPorSucursal(
  bajas: BajaSucursal[],
  sucursal: string,
): BajaSucursal[] {
  const target = sucursal.toLowerCase().trim();
  return bajas.filter((b) => (b.sucursal ?? "").toLowerCase().trim() === target);
}

export interface ResumenBajas {
  total: number;
  voluntarias: number;
  involuntarias: number;
  sinClasificar: number;
  pctVoluntarias: number;
  motivoTop: { motivo: string; count: number } | null;
}

export function resumenBajas(bajas: BajaBase[]): ResumenBajas {
  const total = bajas.length;
  let voluntarias = 0;
  let involuntarias = 0;
  const motivos = new Map<string, number>();
  for (const b of bajas) {
    if (esVoluntaria(b)) voluntarias++;
    if (esInvoluntaria(b)) involuntarias++;
    const motivo = motivoLimpio(b);
    if (motivo) {
      motivos.set(motivo, (motivos.get(motivo) ?? 0) + 1);
    }
  }
  const sinClasificar = total - voluntarias - involuntarias;
  const sortedMotivos = [...motivos.entries()].sort((a, b) => b[1] - a[1]);
  return {
    total,
    voluntarias,
    involuntarias,
    sinClasificar,
    pctVoluntarias: total > 0 ? (voluntarias / total) * 100 : 0,
    motivoTop: sortedMotivos[0]
      ? { motivo: sortedMotivos[0][0], count: sortedMotivos[0][1] }
      : null,
  };
}

/** Bajas agrupadas por mes 1-12 dado un año. */
export function bajasPorMes(
  bajas: BajaBase[],
  year: number,
): { mes: string; monthIdx: number; count: number }[] {
  const MESES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  const counts = new Array(12).fill(0);
  for (const b of bajas) {
    if (yearBaja(b) !== year) continue;
    const m = monthBaja(b);
    if (m === null) continue;
    counts[m - 1]++;
  }
  return counts.map((c, i) => ({ mes: MESES[i], monthIdx: i + 1, count: c }));
}

/** Top N motivos de baja por frecuencia (excluyendo marcadores X). */
export function topMotivos(
  bajas: BajaBase[],
  n = 5,
): { motivo: string; count: number; tipo: "voluntaria" | "involuntaria" }[] {
  const counts = new Map<
    string,
    { count: number; tipo: "voluntaria" | "involuntaria" }
  >();
  for (const b of bajas) {
    const motivo = motivoLimpio(b);
    if (!motivo) continue;
    const v = (b.motivo_voluntaria ?? "").trim();
    const tipo: "voluntaria" | "involuntaria" =
      v && !esMotivoMarcador(v) ? "voluntaria" : "involuntaria";
    const cur = counts.get(motivo);
    if (cur) {
      cur.count++;
    } else {
      counts.set(motivo, { count: 1, tipo });
    }
  }
  return [...counts.entries()]
    .map(([motivo, v]) => ({ motivo, count: v.count, tipo: v.tipo }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export type { Baja, BajaSucursal, BajaCorporativo };
