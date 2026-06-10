/**
 * Overrides manuales de nombre.
 *
 * El API de Potentor devuelve los nombres en caja arbitraria, sin acentos, y a
 * veces incompletos o como "N/A" cuando la persona ya no está pero el puesto
 * sigue ocupado por alguien más. Este archivo permite que el dashboard muestre
 * los nombres correctos (versión corta + acentos) sin esperar a que se
 * actualicen los datos en Potentor.
 *
 * Dos formas de override:
 *
 *  1. Por CLAVE (ej. "S22"): aplica a esa posición específica del organigrama.
 *     Es la opción más precisa, ideal cuando hay varias posiciones con el
 *     mismo nombre de puesto (ej. 4 Project Managers distintos).
 *
 *  2. Por PUESTO (ej. "Gerente de Recursos Humanos"): aplica a TODAS las
 *     posiciones con ese nombre de puesto. Útil cuando solo hay una.
 *
 * Si una posición tiene override por CLAVE, gana sobre el de puesto.
 *
 * Usa "N/A" como valor para marcar explícitamente una posición como vacante.
 */

const POR_PUESTO_RAW: ReadonlyArray<readonly [string, string]> = [
  ["Gerente de Recursos Humanos", "Stephanie González"],
  ["Coordinadora de Recursos Humanos", "Paulina Esquivel"],
  ["Analista de Recursos Humanos", "Ana Sofía Dávila"],
  ["Outbound Marketing", "Ximena Palacios"],
  ["Community Manager", "Mariana Garza"],
  ["Coordinadora de Compras y Logística", "Vanessa Uresti"],
  ["Gerente Comercial Concepts", "Paulina Vázquez"],
];

/**
 * Overrides por clave de posición (S22, S34, etc.).
 * Más específicos que por puesto — útil cuando hay varias posiciones con el
 * mismo nombre.
 */
const POR_CLAVE_RAW: ReadonlyArray<readonly [string, string]> = [
  ["S22", "Luis Reyes"],         // Project Manager
  ["S34", "Luis Gomez"],          // Project Manager
  ["S118", "Mauricio Mendoza"],   // Project Manager
  ["S95", "N/A"],                 // Project Manager — vacante
];

/** Normaliza un puesto para comparación: lowercase + sin acentos + 1 espacio. */
function normalizePuesto(puesto: string): string {
  return puesto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita marcas de acento
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const NOMBRE_POR_PUESTO = new Map<string, string>(
  POR_PUESTO_RAW.map(([puesto, nombre]) => [normalizePuesto(puesto), nombre]),
);

const NOMBRE_POR_CLAVE = new Map<string, string>(
  POR_CLAVE_RAW.map(([clave, nombre]) => [clave.trim().toUpperCase(), nombre]),
);

/**
 * Devuelve el nombre que se debe mostrar para una posición.
 * Orden de precedencia: clave > puesto > API original.
 */
export function resolverEmpleado(
  clave: string,
  puesto: string,
  empleadoApi: string,
): string {
  const porClave = NOMBRE_POR_CLAVE.get(clave.trim().toUpperCase());
  if (porClave) return porClave;
  const porPuesto = NOMBRE_POR_PUESTO.get(normalizePuesto(puesto));
  if (porPuesto) return porPuesto;
  return empleadoApi;
}
