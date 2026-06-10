import { potentorFetch, POTENTOR_DEFAULTS } from "./client";

/**
 * Endpoints de organigrama / jerarquía organizacional.
 */

export interface Jerarquia {
  potentor_id: string;
  nombre: string;
  /** Orden jerárquico (0 = más alto). String en la API. */
  orden: string;
  cantidad_puestos: number;
}

/**
 * Catálogo de niveles jerárquicos.
 * GET /sucursal/jerarquias?potentor_id=X
 */
export async function getJerarquias(
  potentor_id: string | number = POTENTOR_DEFAULTS.potentor_id ?? "",
): Promise<Jerarquia[]> {
  return potentorFetch<Jerarquia[]>("/sucursal/jerarquias", {
    query: { potentor_id },
    tags: ["organigrama", "jerarquias"],
  });
}

/**
 * Nodo del organigrama. La API devuelve tuplas anidadas:
 *   { "S01": ["CEO-Jose Daniel Vargas Elizondo", { "S02": [...], "S03": [...] }] }
 *
 * Cada tupla es [label, hijos?] donde label tiene formato "PUESTO-NOMBRE_PERSONA"
 * y hijos es un objeto opcional con la misma estructura.
 */
export type OrgRaw = {
  [clave: string]: [string] | [string, OrgRaw];
};

export interface OrgNode {
  clave: string; // ej "S01"
  puesto: string; // ej "CEO"
  empleado: string; // ej "Jose Daniel Vargas Elizondo" o "N/A"
  hijos: OrgNode[];
}

/** Parsea el árbol crudo a una forma más usable. */
export function parseOrganigrama(raw: OrgRaw): OrgNode[] {
  const out: OrgNode[] = [];
  for (const [clave, value] of Object.entries(raw)) {
    const label = value[0] ?? "";
    const childrenRaw = value[1];
    const dashIdx = label.indexOf("-");
    const puesto = dashIdx > -1 ? label.slice(0, dashIdx).trim() : label.trim();
    const empleado =
      dashIdx > -1 ? label.slice(dashIdx + 1).trim() : "";
    out.push({
      clave,
      puesto,
      empleado,
      hijos: childrenRaw ? parseOrganigrama(childrenRaw) : [],
    });
  }
  return out;
}

/**
 * GET /puesto/organigrama?sucursal_id=X
 * Devuelve el árbol organizacional completo.
 */
export async function getOrganigrama(
  sucursal_id: string | number = POTENTOR_DEFAULTS.sucursal ?? "",
): Promise<OrgNode[]> {
  const raw = await potentorFetch<OrgRaw>("/puesto/organigrama", {
    query: { sucursal_id },
    tags: ["organigrama", "tree"],
  });
  return parseOrganigrama(raw);
}

/** Total de nodos en el árbol (recursivo). */
export function totalNodos(nodos: OrgNode[]): number {
  let total = 0;
  for (const n of nodos) {
    total += 1 + totalNodos(n.hijos);
  }
  return total;
}

/** Cuenta por nivel de profundidad (0 = raíz). */
export function contarPorProfundidad(
  nodos: OrgNode[],
  profundidad = 0,
  acc = new Map<number, number>(),
): Map<number, number> {
  for (const n of nodos) {
    acc.set(profundidad, (acc.get(profundidad) ?? 0) + 1);
    contarPorProfundidad(n.hijos, profundidad + 1, acc);
  }
  return acc;
}
