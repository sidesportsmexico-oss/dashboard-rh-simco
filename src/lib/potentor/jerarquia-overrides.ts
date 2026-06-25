/**
 * Overrides manuales de jerarquía.
 *
 * Potentor a veces clasifica al staff de SIMCO en una jerarquía que no
 * refleja su rol real dentro de la organización. Este archivo permite
 * corregir esas asignaciones sin esperar a que se actualicen los datos
 * de origen.
 *
 * El override se aplica por NOMBRE NORMALIZADO (lowercase + sin acentos
 * + un solo espacio). Si hay homónimos en la plantilla — ej. dos
 * "Juan Pérez" — habrá que extender este sistema con un segundo campo
 * discriminador (puesto, departamento). Por ahora cubrimos overrides
 * únicos.
 */

const POR_NOMBRE_RAW: ReadonlyArray<readonly [string, string]> = [
  // CEO 2026-06-24: a Marcos Galicia (Content Manager · Marketing) lo
  // queremos en JEFATURA, no COORDINADOR.
  ["Marcos Galicia Morales", "JEFATURA"],
];

/** Normaliza un nombre para comparación: lowercase + sin acentos + 1 espacio. */
function normalizeNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita marcas de acento
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const JERARQUIA_POR_NOMBRE = new Map<string, string>(
  POR_NOMBRE_RAW.map(([nombre, jerarquia]) => [
    normalizeNombre(nombre),
    jerarquia.toUpperCase(),
  ]),
);

/**
 * Si hay override para este nombre, devuelve la nueva jerarquía (uppercase).
 * Si no, devuelve null y el caller debe usar la jerarquía original.
 */
export function overrideJerarquia(nombreCompleto: string): string | null {
  return JERARQUIA_POR_NOMBRE.get(normalizeNombre(nombreCompleto)) ?? null;
}
