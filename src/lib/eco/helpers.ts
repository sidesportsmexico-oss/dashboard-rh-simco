import type {
  EcoReporte,
  EcoItem,
  EcoMacrodimension,
  EcoSubdimension,
  DistribucionOps,
} from "./types";

/**
 * Aplana todos los items del reporte con su ruta jerárquica
 * (macro → subdim) para listados Top/Bottom y búsquedas.
 */
export interface EcoItemFlat {
  texto: string;
  score: number;
  dist: DistribucionOps;
  macro: string;
  subdim: string;
}

export function todosLosItems(reporte: EcoReporte): EcoItemFlat[] {
  const out: EcoItemFlat[] = [];
  for (const macro of reporte.macrodimensiones) {
    for (const sub of macro.subdimensiones) {
      for (const item of sub.items) {
        out.push({
          texto: item.texto,
          score: item.score,
          dist: item.dist,
          macro: macro.nombre,
          subdim: sub.nombre,
        });
      }
    }
  }
  return out;
}

/** Top N preguntas mejor evaluadas. */
export function topMejorEvaluadas(reporte: EcoReporte, n = 5): EcoItemFlat[] {
  return [...todosLosItems(reporte)]
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/** Top N preguntas peor evaluadas. */
export function topPeorEvaluadas(reporte: EcoReporte, n = 5): EcoItemFlat[] {
  return [...todosLosItems(reporte)]
    .sort((a, b) => a.score - b.score)
    .slice(0, n);
}

/**
 * Distribución global Op1-Op4 calculada como promedio simple de las
 * distribuciones de cada item. Útil para mostrar al CEO la mezcla
 * general de actitudes (favorables vs desfavorables).
 */
export function distribucionGlobal(reporte: EcoReporte): DistribucionOps {
  const items = todosLosItems(reporte);
  if (items.length === 0) return { op1: 0, op2: 0, op3: 0, op4: 0 };
  let s1 = 0,
    s2 = 0,
    s3 = 0,
    s4 = 0;
  for (const it of items) {
    s1 += it.dist.op1;
    s2 += it.dist.op2;
    s3 += it.dist.op3;
    s4 += it.dist.op4;
  }
  const n = items.length;
  return {
    op1: s1 / n,
    op2: s2 / n,
    op3: s3 / n,
    op4: s4 / n,
  };
}

/** Macro-dims ordenadas para el radar (orden fijo del reporte). */
export function macroParaRadar(
  reporte: EcoReporte,
): { dimension: string; score: number; fullMark: number }[] {
  return reporte.macrodimensiones.map((m) => ({
    dimension: m.nombre,
    score: m.score,
    fullMark: 100,
  }));
}

/** Suma de puntuaciones favorables (Op1 + Op2). */
export function favorablesPct(dist: DistribucionOps): number {
  return dist.op1 + dist.op2;
}

/** Suma de puntuaciones desfavorables (Op3 + Op4). */
export function desfavorablesPct(dist: DistribucionOps): number {
  return dist.op3 + dist.op4;
}

/**
 * Color para un score 0-100 con paleta SS. Verde-teal alto, ámbar medio,
 * rojo bajo. Devuelve un nombre de tono para usar con KpiCard o badge.
 */
export type EcoTone = "success" | "warning" | "danger" | "default";

export function toneByScore(score: number): EcoTone {
  if (score >= 80) return "success";
  if (score >= 70) return "default";
  if (score >= 60) return "warning";
  return "danger";
}

export function colorByScore(score: number): string {
  if (score >= 80) return "var(--color-accent-teal)";
  if (score >= 70) return "var(--color-text)";
  if (score >= 60) return "var(--color-accent-yellow)";
  return "var(--color-accent-red)";
}

/** Helper para encontrar una macro-dim por nombre. */
export function findMacro(
  reporte: EcoReporte,
  nombre: string,
): EcoMacrodimension | undefined {
  return reporte.macrodimensiones.find((m) => m.nombre === nombre);
}

/** Helper de stats totales del reporte. */
export function statsReporte(reporte: EcoReporte): {
  totalMacros: number;
  totalSubdims: number;
  totalItems: number;
} {
  const macros = reporte.macrodimensiones;
  return {
    totalMacros: macros.length,
    totalSubdims: macros.reduce((acc, m) => acc + m.subdimensiones.length, 0),
    totalItems: macros.reduce(
      (acc, m) =>
        acc + m.subdimensiones.reduce((a, s) => a + s.items.length, 0),
      0,
    ),
  };
}

export type { EcoItem, EcoMacrodimension, EcoSubdimension };
