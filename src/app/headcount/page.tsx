import { Suspense } from "react";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import {
  getHeadcountReporte,
  resumenHeadcount,
  jerarquiasOcupadasDesdeHeadcount,
  headcountASlim,
} from "@/lib/potentor/headcount";
import {
  getVacantes,
  resumenVacantes,
  isVacante2026,
  getMapaFechaCierre,
} from "@/lib/potentor/reclutamiento";
import {
  getJerarquias,
  getOrganigrama,
} from "@/lib/potentor/organigrama";
import { HeadcountKpisClient } from "@/components/headcount-kpis-client";
import { RotacionClient } from "@/components/rotacion-client";

export const revalidate = 60;

async function Content() {
  const [hcRes, vacRes, jerRes, orgRes, cierreRes] = await Promise.allSettled([
    getHeadcountReporte(),
    getVacantes(),
    getJerarquias(),
    getOrganigrama(),
    getMapaFechaCierre(),
  ]);

  if (hcRes.status === "rejected") {
    return (
      <ErrorBanner
        title="No se pudo cargar Head Count"
        detail={String(hcRes.reason)}
      />
    );
  }

  const headcount = hcRes.value;
  const vacantes = vacRes.status === "fulfilled" ? vacRes.value : [];
  const jerarquias = jerRes.status === "fulfilled" ? jerRes.value : [];
  const organigrama = orgRes.status === "fulfilled" ? orgRes.value : [];
  const mapaFechaCierre =
    cierreRes.status === "fulfilled" ? cierreRes.value : new Map<string, string>();

  const hcResumen = resumenHeadcount(headcount);
  const vacResumen = resumenVacantes(vacantes);

  // El endpoint /sucursal/jerarquias devuelve SLOTS de la estructura
  // (incluye vacantes). Para el modal del organigrama queremos personas
  // realmente ocupando, así que sobreescribimos cantidad_puestos con el
  // conteo real desde /headcount/reporte.
  const jerarquiasOcupadas = jerarquiasOcupadasDesdeHeadcount(headcount);
  const jerarquiasReales = jerarquias.map((j) => ({
    ...j,
    cantidad_puestos:
      jerarquiasOcupadas.get(j.nombre.trim().toUpperCase()) ?? 0,
  }));

  // Slim del headcount para el modal anidado por jerarquía (sin RFC/CURP/etc).
  const empleadosSlim = headcountASlim(headcount);

  const vacantesAbiertas2026 = vacResumen.abiertas2026;
  const totalEstructura = hcResumen.total + vacantesAbiertas2026;
  const cobertura =
    totalEstructura > 0 ? (hcResumen.total / totalEstructura) * 100 : 0;

  // Las vacantes 2026 ordenadas por fecha desc para el modal.
  // Slim shape: solo los campos que renderiza la tabla, sin HTML pesado.
  // Enriquecidas con fecha_cierre desde /vacante/info.
  const vacantes2026List = vacantes
    .filter(isVacante2026)
    .sort((a, b) => (b.fecha_creacion ?? "").localeCompare(a.fecha_creacion ?? ""))
    .map((v) => ({
      vacante_id: v.vacante_id,
      nombre: v.nombre,
      puesto: v.puesto,
      sucursal: v.sucursal,
      fecha_creacion: v.fecha_creacion,
      fecha_cierre: mapaFechaCierre.get(v.vacante_id) ?? null,
      estatus: v.estatus,
      link: v.link,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Head Count"
        subtitle="Posiciones dentro de SIMCO y vacantes abiertas"
        tags={["Vista CEO", "Potentor /headcount"]}
      />

      <HeadcountKpisClient
        posiciones={hcResumen.total}
        hintPosiciones="Plantilla actual · click para organigrama"
        coberturaPct={Math.round(cobertura)}
        vacantesAbiertas={vacantesAbiertas2026}
        vacantes2026={vacResumen.vacantes2026}
        hintVacantes="Click para ver detalle"
        vacantesCerradas={vacResumen.vacantes2026 - vacantesAbiertas2026}
        jerarquias={jerarquiasReales}
        organigrama={organigrama}
        vacantes={vacantes2026List}
        empleados={empleadosSlim}
      />

      {/* ─── SECCIÓN ROTACIÓN ─── */}
      <RotacionClient
        plantillaCorp={hcResumen.corporativo}
        plantillaSuc={hcResumen.sucursales}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-[var(--color-text-dim)]">Cargando…</div>
      }
    >
      <Content />
    </Suspense>
  );
}

