import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("es-MX").format(num);
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

// Conectores en español que se dejan en minúsculas dentro de un título.
const CONNECTORS_ES = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "e",
  "o",
  "u",
  "a",
  "al",
  "con",
  "en",
  "para",
  "por",
  "sin",
  "sobre",
]);

// Acrónimos que se preservan en mayúsculas dentro de un título.
const ACRONYMS = new Set([
  "ceo",
  "cio",
  "cto",
  "coo",
  "cfo",
  "cmo",
  "chro",
  "it",
  "rh",
  "rrhh",
  "bi",
  "hr",
  "ux",
  "ui",
  "qa",
  "kpi",
  "roi",
  "nps",
  "latam",
  "usa",
  "uk",
  "mx",
  "ti",
  "sr",
  "jr",
]);

/**
 * Convierte un texto a Title Case con reglas de español:
 *  - Primera letra de cada palabra en mayúscula
 *  - Resto en minúsculas
 *  - Conectores (de, la, y, etc.) en minúsculas, EXCEPTO si son la primera palabra
 *  - Acrónimos conocidos (CEO, RH, LATAM, etc.) preservados en mayúsculas
 *  - Colapsa dobles espacios
 *  - Conserva caracteres no-letra (guiones, números, slashes)
 *
 * Ejemplos:
 *   "GERENTE DE RECURSOS HUMANOS" → "Gerente de Recursos Humanos"
 *   "ALDO YAHIR RAMIREZ MARTINEZ" → "Aldo Yahir Ramirez Martinez"
 *   "CEO" → "CEO"
 *   "BUSINESS DEVELOPMENT LATAM" → "Business Development LATAM"
 *   "N/A" → "N/A"
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return "";
  const trimmed = text.trim();
  // Preservar casos especiales como N/A
  if (/^n\/?a$/i.test(trimmed)) return trimmed.toUpperCase();
  // Normaliza espacios múltiples → uno solo
  return trimmed
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(/(\s+)/)
    .map((part, i) => {
      if (/^\s+$/.test(part)) return part;
      // Acrónimos: siempre en mayúsculas
      if (ACRONYMS.has(part)) return part.toUpperCase();
      // Conectores en minúscula salvo primera palabra
      if (i > 0 && CONNECTORS_ES.has(part)) return part;
      // Capitalizar primera letra, resto en minúscula
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}
