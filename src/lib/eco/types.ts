/**
 * Modelo de datos de los reportes ECO (Encuesta de Clima Organizacional).
 *
 * Estructura jerárquica:
 *   Reporte
 *     └─ Macro-dimensiones (6)
 *          └─ Sub-dimensiones (16 en total)
 *               └─ Items / preguntas individuales (63 en total)
 *
 * Cada item tiene:
 *   - texto: la pregunta
 *   - dist: distribución porcentual entre las 4 opciones (Op1..Op4)
 *   - score: calificación %  (calculada por Potentor con el algoritmo de la
 *     plataforma, no necesariamente Op1+Op2)
 */

export type DistribucionOps = {
  /** Totalmente de acuerdo / Mucho / Siempre */
  op1: number;
  /** De acuerdo / Suficiente / Casi siempre */
  op2: number;
  /** En desacuerdo / Poco / Algunas veces */
  op3: number;
  /** Totalmente en desacuerdo / Nada / Nunca */
  op4: number;
};

export interface EcoItem {
  /** Texto de la pregunta tal cual viene del reporte. */
  texto: string;
  /** Distribución porcentual entre las 4 opciones (sumar ≈ 100). */
  dist: DistribucionOps;
  /** Calificación porcentual del item (0-100). */
  score: number;
}

export interface EcoSubdimension {
  /** Nombre de la sub-dimensión (ej. "Principios y valores"). */
  nombre: string;
  /** Score % de la sub-dimensión. */
  score: number;
  /** Preguntas que componen esta sub-dim. */
  items: EcoItem[];
}

export interface EcoMacrodimension {
  /** Nombre de la macro-dimensión (ej. "Filosofía corporativa"). */
  nombre: string;
  /** Score % de la macro-dimensión. */
  score: number;
  /** Sub-dimensiones que componen esta macro-dim. */
  subdimensiones: EcoSubdimension[];
}

export interface EcoReporte {
  /** Slug único del reporte (ej. "eco-2026-06-simco"). */
  id: string;
  /** Título legible (ej. "ECO Junio 2026 — SIMCo"). */
  titulo: string;
  /** Organización (ej. "SIMCo"). */
  organizacion: string;
  /** Fecha de generación del reporte. ISO. */
  fecha: string;
  /** Año del ciclo (para comparativos). */
  year: number;
  /** Mes del ciclo (1-12). */
  month: number;
  /** Índice global de clima organizacional. */
  indiceGlobal: number;
  /** URL pública del reporte en Potentor. */
  urlPotentor?: string;
  /** Macro-dimensiones del reporte. */
  macrodimensiones: EcoMacrodimension[];
}
