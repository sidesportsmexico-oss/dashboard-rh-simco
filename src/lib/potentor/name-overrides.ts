/**
 * Overrides manuales de nombre por puesto.
 *
 * El API de Potentor devuelve los nombres en caja arbitraria (a veces UPPERCASE,
 * otros mixed case), sin acentos, y a veces incompletos o como "N/A". Este mapa
 * permite que el dashboard muestre los nombres en la forma que el CEO quiere
 * (versión corta, con acentos correctos) sin tener que esperar a que se
 * actualicen los datos en Potentor.
 *
 * La clave es el puesto normalizado (lowercase + sin acentos + sin dobles
 * espacios). El valor es el nombre tal y como queremos mostrarlo.
 *
 * Si una posición no tiene override, se usa el nombre tal cual viene del API.
 */

const OVERRIDES_RAW: ReadonlyArray<readonly [string, string]> = [
  ["Gerente de Recursos Humanos", "Stephanie González"],
  ["Coordinadora de Recursos Humanos", "Paulina Esquivel"],
  ["Analista de Recursos Humanos", "Ana Sofía Dávila"],
  ["Outbound Marketing", "Ximena Palacios"],
  ["Community Manager", "Mariana Garza"],
  ["Coordinadora de Compras y Logística", "Vanessa Uresti"],
  ["Gerente Comercial Concepts", "Paulina Vázquez"],
  ["Project Manager", "Luis Reyes"],
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
  OVERRIDES_RAW.map(([puesto, nombre]) => [normalizePuesto(puesto), nombre]),
);

/**
 * Devuelve el nombre que se debe mostrar para una posición.
 * Si hay un override registrado para ese puesto, devuelve el override.
 * Si no, devuelve el nombre original del API.
 */
export function resolverEmpleado(puesto: string, empleadoApi: string): string {
  const override = NOMBRE_POR_PUESTO.get(normalizePuesto(puesto));
  return override ?? empleadoApi;
}
