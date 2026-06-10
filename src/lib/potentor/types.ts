/**
 * TypeScript types for Potentor API responses.
 *
 * Inferred from spec at /docs/api_rest/api.json.php + live sandbox responses.
 * Many fields come back as strings even when semantically numeric — Potentor's
 * convention. Convert at consumption time.
 */

// =============== EMPRESA / SUCURSAL ===============

export interface EmpresaInfo {
  potentor_id: string;
  nombre: string;
  username: string;
  email: string;
  responsable: string;
}

export interface Sucursal {
  sucursal_id: string;
  nombre: string;
  // Add more fields as we discover them in prod
  [key: string]: unknown;
}

// =============== RECLUTAMIENTO ===============

export interface Vacante {
  sucursal: string;
  sucursal_id: string;
  vacante_id: string;
  nombre: string;
  puesto: string;
  contratacion: string;
  requisitos: string; // HTML
  funciones: string; // HTML
  ofrecemos: string; // HTML
  localidad: string;
  confidencialidad: string;
  /** Stage / status: "Standby", "Activa", "Cubierta", "Cancelada"... */
  estatus: string;
  /** Public posting URL. */
  link: string;
  /** "YYYY-MM-DD" — agregado por Potentor 2026-06-04 */
  fecha_creacion: string;
}

export interface VacanteEtapa {
  etapa_id: string;
  nombre: string;
  orden?: number;
  // Confirm with prod data
  [key: string]: unknown;
}

export interface Candidato {
  candidato_id?: string;
  vacante_id?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  etapa?: string;
  fecha_postulacion?: string;
  [key: string]: unknown;
}

// =============== HEADCOUNT ===============

export interface HeadcountField {
  cve: string;
  label: string;
}

/**
 * Headcount report row. Fields depend on which `campos` were requested.
 * We use a permissive shape — known fields are typed, rest are unknown.
 */
export interface HeadcountRow {
  NOMI?: string | null;
  NOMB?: string | null;
  APAT?: string | null;
  AMAT?: string | null;
  FNAC?: string | null;
  GENE?: string | null;
  NUMINTERNO?: string | null;
  MAIL?: string | null;
  CIVI?: string | null;
  FRFC?: string | null;
  CURP?: string | null;
  IMSS?: string | null;
  NACI?: string | null;
  fecha_edad?: string | null;
  puesto_org_id?: string | null;
  id_parent?: string | null;
  [key: string]: unknown;
}

// =============== ÍNDICE DE POTENCIAL (NO ES ECO, pero útil) ===============

export interface IndicePotencialRow {
  consecutivo: string;
  sucursal: string;
  area: string;
  departamento: string;
  nombre: string;
  curp: string;
  email: string;
  fecha_termino: string;
  fecha_descarga: string;
  ip: string; // score as string
}
