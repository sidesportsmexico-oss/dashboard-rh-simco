import { Suspense } from "react";
import { LogOut, TrendingDown, UserMinus } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { BajasTable } from "@/components/bajas-table";
import { RotacionSucursalesClient } from "@/components/rotacion-sucursales-client";
import { RotacionMesChart } from "@/components/rotacion-mes-chart";
import {
  getHeadcountReporte,
  resumenHeadcount,
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
import {
  bajasSucursales,
  bajasCorporativo,
} from "@/data/bajas-2026";
import {
  resumenBajas,
  filtrarPorAnio,
  bajasPorMes,
  topMotivos,
} from "@/lib/bajas/helpers";

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
        jerarquias={jerarquias}
        organigrama={organigrama}
        vacantes={vacantes2026List}
      />

      {/* ─── SECCIÓN ROTACIÓN ─── */}
      <RotacionSection />
    </div>
  );
}

/**
 * Sección de Rotación dentro de Head Count.
 *
 * 2 sub-secciones (per CEO):
 *   1. Bajas Sucursales — con tabs General / Mulligans / Batbox
 *   2. Bajas Corporativo — tabla única
 *
 * Plus KPIs arriba y gráfica mensual.
 *
 * Fuente: Google Sheet "Bajas SIMCO" (sheet ID 1zThxQQJHFXcl…).
 * Captura manual a TS (no hay API). Ver src/data/bajas-2026.ts.
 */
function RotacionSection() {
  const allSuc = bajasSucursales;
  const allCorp = bajasCorporativo;
  const todasBajas = [...allSuc, ...allCorp];

  // Resúmenes globales (todos los años)
  const resTotal = resumenBajas(todasBajas);
  const resSuc = resumenBajas(allSuc);
  const resCorp = resumenBajas(allCorp);

  // 2026 stats
  const suc2026 = filtrarPorAnio(allSuc, 2026);
  const corp2026 = filtrarPorAnio(allCorp, 2026);
  const total2026 = suc2026.length + corp2026.length;

  // Gráfica mensual 2026 — bajas Sucursales vs Corporativo
  const mesesSuc = bajasPorMes(allSuc, 2026);
  const mesesCorp = bajasPorMes(allCorp, 2026);
  const chartData = mesesSuc.map((m, i) => ({
    mes: m.mes,
    sucursales: m.count,
    corporativo: mesesCorp[i].count,
  }));

  // Top 5 motivos globales
  const top5Motivos = topMotivos(todasBajas, 5);

  return (
    <section className="space-y-6 pt-2">
      <header className="border-t border-[var(--color-border-subtle)] pt-8">
        <div className="flex items-center gap-3 mb-1">
          <LogOut className="h-5 w-5 text-[var(--color-accent-orange)]" />
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Rotación
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-dim)]">
          Bajas históricas de SIMCO (Sucursales · Corporativo) — fuente:
          Google Sheets &ldquo;Bajas SIMCO&rdquo;
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Bajas 2026 YTD"
          value={total2026}
          hint={`${resTotal.total} históricas totales`}
          tone="warning"
          icon={<UserMinus className="h-4 w-4" />}
        />
        <KpiCard
          label="Bajas Sucursales"
          value={allSuc.length}
          hint={`${suc2026.length} en 2026 · Batbox/Mulligans/+`}
        />
        <KpiCard
          label="Bajas Corporativo"
          value={allCorp.length}
          hint={`${corp2026.length} en 2026`}
        />
        <KpiCard
          label="% Voluntarias"
          value={`${Math.round(resTotal.pctVoluntarias)}%`}
          hint={`${resTotal.voluntarias} vol · ${resTotal.involuntarias} invol`}
          tone="default"
          icon={<TrendingDown className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Bajas mensuales 2026"
          description="Sucursales vs Corporativo · Ene a Dic"
          className="lg:col-span-2"
        >
          <RotacionMesChart data={chartData} />
        </SectionCard>

        <SectionCard
          title="Top 5 motivos"
          description="Históricos globales"
        >
          <ul className="space-y-2">
            {top5Motivos.length === 0 && (
              <li className="text-sm text-[var(--color-text-dim)]">
                Sin motivos registrados
              </li>
            )}
            {top5Motivos.map((m, i) => (
              <li
                key={m.motivo}
                className="flex items-center justify-between gap-3 py-1.5 border-b border-[var(--color-border-subtle)] last:border-0 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-bg-elevated)] text-[10px] tabular-nums text-[var(--color-text-dim)]">
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-text)] truncate">
                    {m.motivo}
                  </span>
                </div>
                <span className="shrink-0 flex items-center gap-2">
                  <span
                    className={
                      m.tipo === "voluntaria"
                        ? "inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-yellow)]"
                        : "inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-red)]"
                    }
                  />
                  <span className="font-medium tabular-nums text-[var(--color-text)]">
                    {m.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Bajas Sucursales con tabs */}
      <SectionCard
        title="Bajas Sucursales"
        description={`${allSuc.length} bajas históricas · filtra por sucursal con las pestañas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-orange)]">
            <UserMinus className="h-4 w-4" />
            Operativo
          </span>
        }
      >
        <RotacionSucursalesClient bajas={allSuc} />
      </SectionCard>

      {/* Bajas Corporativo */}
      <SectionCard
        title="Bajas Corporativo"
        description={`${allCorp.length} bajas históricas de personal corporativo`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-blue)]">
            <UserMinus className="h-4 w-4" />
            Corporativo
          </span>
        }
      >
        <BajasTable
          bajas={allCorp}
          modo="departamento"
          emptyMessage="Sin bajas corporativo registradas."
        />
      </SectionCard>

      <div className="text-[10px] text-[var(--color-text-dim)] italic text-right">
        Captura del Google Sheet al 2026-06-11 · 193 bajas históricas total
      </div>
    </section>
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
