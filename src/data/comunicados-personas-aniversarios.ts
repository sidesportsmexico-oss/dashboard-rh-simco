/**
 * Listado maestro de personas para el módulo /comunicados.
 *
 * Fuente: Google Sheet compartido por RH el 2026-07-10
 * (https://docs.google.com/spreadsheets/d/1i-KijBXxan_OLohojFhDKx6wXvq0GRDovE6yhaQUZr0).
 *
 * Normalizado:
 *   - nombres a Title Case
 *   - división a canonical (Batbox / Mulligans / MulliBox)
 *   - fechas a ISO YYYY-MM-DD
 *
 * Regenerar cuando RH avise que hubo alta/baja/cambio en el sheet.
 */

export interface PersonaComunicado {
  /** Slug estable para usar como key/query. */
  id: string;
  nombre: string;
  puesto: string;
  /** "Batbox" | "Mulligans" | "MulliBox" | otro. */
  division: string;
  departamento: string;
  /** ISO YYYY-MM-DD o "" si no hay dato. */
  fecha_ingreso: string;
  /** ISO YYYY-MM-DD o "" si no hay dato. */
  fecha_nacimiento: string;
}

export const personasAniversarios: PersonaComunicado[] = [
  {
    id: "aldo-sanchez-contreras",
    nombre: "Aldo Sanchez Contreras",
    puesto: "Mesero",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2022-03-23",
    fecha_nacimiento: "1997-06-09",
  },
  {
    id: "carlos-alberto-moreno-gonzalez",
    nombre: "Carlos Alberto Moreno González",
    puesto: "Gerente De Operaciones",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2019-06-25",
    fecha_nacimiento: "1983-07-16",
  },
  {
    id: "carlos-alberto-ponce-mancilla",
    nombre: "Carlos Alberto Ponce Mancilla",
    puesto: "Chef Corporativo",
    division: "MulliBox",
    departamento: "Sucursales",
    fecha_ingreso: "2023-01-05",
    fecha_nacimiento: "1994-07-19",
  },
  {
    id: "carlos-humberto-vladimir-huerta-montemayor",
    nombre: "Carlos Humberto Vladimir Huerta Montemayor",
    puesto: "Bartender",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2022-07-14",
    fecha_nacimiento: "2002-07-05",
  },
  {
    id: "jose-enrique-rincon-armendariz",
    nombre: "Jose Enrique Rincon Armendariz",
    puesto: "Mesero",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2016-10-28",
    fecha_nacimiento: "1981-07-13",
  },
  {
    id: "josep-anthony-castro-contreras",
    nombre: "Josep Anthony Castro Contreras",
    puesto: "Encargado De Cocina",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2021-12-03",
    fecha_nacimiento: "2001-10-16",
  },
  {
    id: "juan-arturo-mendez-ruiz",
    nombre: "Juan Arturo Mendez Ruiz",
    puesto: "Jefe De Barra",
    division: "MulliBox",
    departamento: "Sucursales",
    fecha_ingreso: "2016-11-15",
    fecha_nacimiento: "1981-04-27",
  },
  {
    id: "juventino-gaspar-manuel",
    nombre: "Juventino Gaspar Manuel",
    puesto: "Mesero",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2019-06-24",
    fecha_nacimiento: "1982-01-05",
  },
  {
    id: "karla-iveth-castillo-gonzalez",
    nombre: "Karla Iveth Castillo Gonzalez",
    puesto: "Capitan De Sucursal",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "",
    fecha_nacimiento: "",
  },
  {
    id: "lucero-marisol-ramirez-alvarez",
    nombre: "Lucero Marisol Ramirez Alvarez",
    puesto: "Hostess",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2020-11-03",
    fecha_nacimiento: "1993-11-29",
  },
  {
    id: "maria-de-la-luz-nino-galicia",
    nombre: "Maria De La Luz Niño Galicia",
    puesto: "Limpieza",
    division: "MulliBox",
    departamento: "Sucursales",
    fecha_ingreso: "2020-01-07",
    fecha_nacimiento: "1988-10-22",
  },
  {
    id: "miguel-ricardo-malacara-soto",
    nombre: "Miguel Ricardo Malacara Soto",
    puesto: "Profesor De Golf",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "",
    fecha_nacimiento: "",
  },
  {
    id: "ricardo-noe-zamora-rosales",
    nombre: "Ricardo Noe Zamora Rosales",
    puesto: "Gerente De Operaciones",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2016-10-25",
    fecha_nacimiento: "1980-07-03",
  },
  {
    id: "selenia-scarleth-maldonado-silva",
    nombre: "Selenia Scarleth Maldonado Silva",
    puesto: "Mesero",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2021-07-15",
    fecha_nacimiento: "1996-08-24",
  },
  {
    id: "serapio-mendoza-jimenez",
    nombre: "Serapio Mendoza Jimenez",
    puesto: "Técnico En Mantenimiento",
    division: "MulliBox",
    departamento: "Sucursales",
    fecha_ingreso: "2019-09-09",
    fecha_nacimiento: "1973-10-26",
  },
  {
    id: "iriam-belen-villanueva-silva",
    nombre: "Iriam Belen Villanueva Silva",
    puesto: "Hostess",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2024-06-28",
    fecha_nacimiento: "1997-02-03",
  },
  {
    id: "cristian-manuel-bolanos-tadeo",
    nombre: "Cristian Manuel Bolaños Tadeo",
    puesto: "Bartender",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-05-03",
    fecha_nacimiento: "2005-04-18",
  },
  {
    id: "yahaira-yaraseth-rivera-garcia",
    nombre: "Yahaira Yaraseth Rivera Garcia",
    puesto: "Mesera",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-05-29",
    fecha_nacimiento: "1992-07-29",
  },
  {
    id: "libni-semei-garcia-reyes",
    nombre: "Libni Semei Garcia Reyes",
    puesto: "Mesera",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-05-29",
    fecha_nacimiento: "1993-02-23",
  },
  {
    id: "ailice-abigail-hernandez-sanchez",
    nombre: "Ailice Abigail Hernandez Sanchez",
    puesto: "Hostess",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-07-22",
    fecha_nacimiento: "2005-11-21",
  },
  {
    id: "pavel-arturo-robledo-galvan",
    nombre: "Pavel Arturo Robledo Galvan",
    puesto: "Cocinero A",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-08-04",
    fecha_nacimiento: "1999-01-09",
  },
  {
    id: "juan-everette-paez-ramos",
    nombre: "Juan Everette Paez Ramos",
    puesto: "Encargado De Cocina",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-09-20",
    fecha_nacimiento: "1992-09-29",
  },
  {
    id: "paola-hernandez-espinosa",
    nombre: "Paola Hernandez Espinosa",
    puesto: "Hostess",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2025-11-10",
    fecha_nacimiento: "2005-10-02",
  },
  {
    id: "erik-alejandro-saucedo-gutierrez",
    nombre: "Erik Alejandro Saucedo Gutiérrez",
    puesto: "Mesero",
    division: "Mulligans",
    departamento: "Sucursales",
    fecha_ingreso: "2025-11-18",
    fecha_nacimiento: "2000-01-20",
  },
  {
    id: "edgar-noe-garcia-alvarez",
    nombre: "Edgar Noe Garcia Alvarez",
    puesto: "Mesero",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2026-02-27",
    fecha_nacimiento: "1997-06-11",
  },
  {
    id: "norma-zamora-sandoval",
    nombre: "Norma Zamora Sandoval",
    puesto: "Lavaloza",
    division: "MulliBox",
    departamento: "Sucursales",
    fecha_ingreso: "2026-04-15",
    fecha_nacimiento: "1973-04-23",
  },
  {
    id: "kevin-limon-zamora",
    nombre: "Kevin Limon Zamora",
    puesto: "Bartender",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2026-05-02",
    fecha_nacimiento: "1996-08-30",
  },
  {
    id: "cristian-javier-vazquez-martinez",
    nombre: "Cristian Javier Vazquez Martinez",
    puesto: "Capitan De Sucursal",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2026-06-05",
    fecha_nacimiento: "1985-08-08",
  },
  {
    id: "erick-sergei-peralta-loria",
    nombre: "Erick Sergei Peralta Loria",
    puesto: "Cocinero A",
    division: "Batbox",
    departamento: "Sucursales",
    fecha_ingreso: "2026-06-15",
    fecha_nacimiento: "",
  },
];
