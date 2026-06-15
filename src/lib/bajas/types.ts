/**
 * Tipos para las bajas (terminaciones laborales) de SIMCO + CONCEPTS.
 */

export interface BajaBase {
  /** Nombre completo del colaborador. */
  nombre: string;
  /** Puesto al momento de la baja. */
  puesto: string;
  /** Fecha de ingreso "YYYY-MM-DD" o vacío. */
  fecha_ingreso: string;
  /** Fecha de salida "YYYY-MM-DD" o vacío. */
  fecha_salida: string;
  /** Tiempo laborado en formato "X años, Y meses". */
  tiempo: string;
  /** Motivo si la baja fue voluntaria (vacío si no). */
  motivo_voluntaria: string;
  /** Motivo si la baja fue involuntaria (vacío si no). */
  motivo_involuntaria: string;
}

export interface BajaSucursal extends BajaBase {
  /** Sucursal: Batbox, Mulligans, Sikara, etc. */
  sucursal: string;
}

export interface BajaCorporativo extends BajaBase {
  /** Departamento corporativo: Operaciones, Marketing, etc. */
  departamento: string;
}

export type Baja = BajaSucursal | BajaCorporativo;
