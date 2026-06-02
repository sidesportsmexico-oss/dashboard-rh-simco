import { potentorFetch } from "./client";
import type { EmpresaInfo, Sucursal } from "./types";

/** Información de la cuenta (empresa). GET /empresa/info */
export async function getEmpresaInfo(): Promise<EmpresaInfo> {
  return potentorFetch<EmpresaInfo>("/empresa/info", {
    tags: ["empresa", "info"],
  });
}

/** Sucursales de la empresa. GET /empresa/sucursales */
export async function getSucursales(): Promise<Sucursal[]> {
  return potentorFetch<Sucursal[]>("/empresa/sucursales", {
    tags: ["empresa", "sucursales"],
  });
}
