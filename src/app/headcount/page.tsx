import { Suspense } from "react";
import { LogOut, TrendingDown, UserMinus, UserX, Activity } from "lucide-react";
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
  filtrarPorAnios,
  bajasPorMes,
  topMotivos,
  indiceRotacion,
} from "@/lib/bajas/helpers";
import type { BajaBase } from "@/lib/bajas/types";

/**
 * Cuenta bajas de un año hasta cierto mes inclusive (Ene = 1).
 * Útil para comparativos YTD vs mismo periodo del año anterior.
 */
function countBajasHastaMes(
  bajas: ReadonlyArray<BajaBase>,
  year: number,
  mesMax: number,
): number {
  let count = 0;
  for (const b of bajas) {
    const fecha = b.fecha_salida ?? "";
    const y = Number(fecha.slice(0, 4));
    const m = Number(fecha.slice(5, 7));
    if (y === year && m >= 1 && m <= mesMax) count++;
  }
  return count;
}

/** Delta porcentual seguro. Devuelve null si la base es 0. */
function deltaPct(actual: number, base: number): number | null {
  if (base <= 0) return null;
  return ((actual - base) / base) * 100;
}

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
      <RotacionSection
        plantillaCorp={hcResumen.corporativo}
        plantillaSuc={hcResumen.sucursales}
      />
    </div>
  );
}

/**
 * Sección de Rotación dentro de Head Count.
 *
 * Solo contempla bajas de **2025 y 2026** (per CEO 2026-06-15).
 *
 * 2 sub-secciones:
 *   1. Bajas Sucursales — con tabs General / Mulligans / Batbox
 *   2. Bajas Corporativo — tabla única
 *
 * Plus KPIs (Bajas, Voluntarias, Involuntarias, Índice de rotación) y
 * gráfica comparativa 2025 vs 2026.
 *
 * Fuente: Google Sheet "Bajas SIMCO" (sheet ID 1zThxQQJHFXcl…).
 * Captura manual a TS. Ver src/data/bajas-2026.ts.
 */
function RotacionSection({
  plantillaCorp,
  plantillaSuc,
}: {
  plantillaCorp: number;
  plantillaSuc: number;
}) {
  const ANIOS = [2025, 2026];

  // Filtra todo a 2025+2026
  const allSuc = filtrarPorAnios(bajasSucursales, ANIOS);
  const allCorp = filtrarPorAnios(bajasCorporativo, ANIOS);
  const todasBajas = [...allSuc, ...allCorp];

  // Resúmenes 2025+2026
  const resTotal = resumenBajas(todasBajas);

  // Por año
  const suc2025 = filtrarPorAnio(allSuc, 2025);
  const corp2025 = filtrarPorAnio(allCorp, 2025);
  const suc2026 = filtrarPorAnio(allSuc, 2026);
  const corp2026 = filtrarPorAnio(allCorp, 2026);
  const total2025 = suc2025.length + corp2025.length;
  const total2026 = suc2026.length + corp2026.length;

  // Comparativos YoY justos: el año actual va YTD (parcial),
  // así que comparamos contra el mismo periodo del año anterior.
  // Se recalcula en cada revalidate (60s) porque es server component.
  const hoy = new Date();
  const HOY_MES = hoy.getMonth() + 1; // 1-12
  const suc2025YTD = countBajasHastaMes(bajasSucursales, 2025, HOY_MES);
  const corp2025YTD = countBajasHastaMes(bajasCorporativo, 2025, HOY_MES);
  const sucDeltaPct = deltaPct(suc2026.length, suc2025YTD);
  const corpDeltaPct = deltaPct(corp2026.length, corp2025YTD);

  // Índices de rotación SEPARADOS por empresa (% bajas vs su propia plantilla)
  // Solicitud del CEO 2026-06-24: split SIMCO Corporativo vs CONCEPTS Sucursales.
  // Denominadores vienen de Potentor /headcount/reporte clasificados por
  // departamento === "Sucursales" → CONCEPTS, resto → SIMCO.
  const corpRot2025 = indiceRotacion(corp2025.length, plantillaCorp);
  const corpRot2026 = indiceRotacion(corp2026.length, plantillaCorp);
  const sucRot2025 = indiceRotacion(suc2025.length, plantillaSuc);
  const sucRot2026 = indiceRotacion(suc2026.length, plantillaSuc);

  // Gráfica mensual comparativa 2025 vs 2026 (total bajas)
  const mesesSuc25 = bajasPorMes(bajasSucursales, 2025);
  const mesesCorp25 = bajasPorMes(bajasCorporativo, 2025);
  const mesesSuc26 = bajasPorMes(bajasSucursales, 2026);
  const mesesCorp26 = bajasPorMes(bajasCorporativo, 2026);
  const chartData = mesesSuc25.map((m, i) => ({
    mes: m.mes,
    bajas2025: m.count + mesesCorp25[i].count,
    bajas2026: mesesSuc26[i].count + mesesCorp26[i].count,
  }));

  // Top 5 motivos del periodo
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
          Bajas de SIMCO (Sucursales · Corporativo) · 2025 y 2026 — fuente:
          Google Sheets &ldquo;Bajas SIMCO&rdquo;
        </p>
      </header>

      {/* KPIs principales (cuenta agregada del periodo) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Bajas 2026 YTD"
          value={total2026}
          hint={`vs ${total2025} en 2025`}
          tone="warning"
          icon={<UserMinus className="h-4 w-4" />}
          progress={{
            pct:
              total2025 + total2026 > 0
                ? (total2026 / (total2025 + total2026)) * 100
                : 0,
            primaryLabel: `${total2026} en 2026`,
            secondaryLabel: `${total2025} en 2025`,
          }}
        />
        <KpiCard
          label="Bajas Voluntarias"
          value={resTotal.voluntarias}
          hint={`${Math.round(resTotal.pctVoluntarias)}% del periodo 2025-2026`}
          tone="default"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          label="Bajas Involuntarias"
          value={resTotal.involuntarias}
          hint={`${Math.round(100 - resTotal.pctVoluntarias)}% del periodo 2025-2026`}
          tone="danger"
          icon={<UserX className="h-4 w-4" />}
        />
      </div>

      {/* Índices de Rotación separados por empresa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Índice Rotación · SIMCO Corporativo"
          value={`${corpRot2026.toFixed(1)}%`}
          hint={`2026 YTD · 2025 fue ${corpRot2025.toFixed(1)}% · plantilla ${plantillaCorp}`}
          tone={
            corpRot2026 > 25
              ? "danger"
              : corpRot2026 > 15
                ? "warning"
                : "success"
          }
          icon={<Activity className="h-4 w-4" />}
          trend={{
            delta: Number((corpRot2026 - corpRot2025).toFixed(1)),
            suffix: " pts",
            inverse: true,
          }}
        />
        <KpiCard
          label="Índice Rotación · CONCEPTS Sucursales"
          value={`${sucRot2026.toFixed(1)}%`}
          hint={`2026 YTD · 2025 fue ${sucRot2025.toFixed(1)}% · plantilla ${plantillaSuc}`}
          tone={
            sucRot2026 > 40
              ? "danger"
              : sucRot2026 > 25
                ? "warning"
                : "success"
          }
          icon={<Activity className="h-4 w-4" />}
          trend={{
            delta: Number((sucRot2026 - sucRot2025).toFixed(1)),
            suffix: " pts",
            inverse: true,
          }}
        />
      </div>

      {/* Sub-KPIs: desglose Sucursales vs Corporativo con delta YoY YTD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RotacionSubCard
          label="Bajas Sucursales · 2025+2026"
          total={allSuc.length}
          n2025={suc2025.length}
          n2026={suc2026.length}
          base2025YTD={suc2025YTD}
          deltaPct={sucDeltaPct}
          color="orange"
        />
        <RotacionSubCard
          label="Bajas Corporativo · 2025+2026"
          total={allCorp.length}
          n2025={corp2025.length}
          n2026={corp2026.length}
          base2025YTD={corp2025YTD}
          deltaPct={corpDeltaPct}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Bajas mensuales · 2025 vs 2026"
          description={`Comparativo mensual del total de bajas por año · plantilla SIMCO ${plantillaCorp} · CONCEPTS ${plantillaSuc}`}
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

      {/* Bajas Corporativo (PRIMERO per CEO 2026-06-15) */}
      <SectionCard
        title="Bajas Corporativo · 2025-2026"
        description={`${allCorp.length} bajas en el periodo`}
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
          emptyMessage="Sin bajas corporativo registradas en 2025-2026."
        />
      </SectionCard>

      {/* Bajas Sucursales con tabs */}
      <SectionCard
        title="Bajas Sucursales · 2025-2026"
        description={`${allSuc.length} bajas en el periodo · filtra por sucursal con las pestañas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-orange)]">
            <UserMinus className="h-4 w-4" />
            Operativo
          </span>
        }
      >
        <RotacionSucursalesClient bajas={allSuc} />
      </SectionCard>

      <div className="text-[10px] text-[var(--color-text-dim)] italic text-right">
        Captura del Google Sheet al 2026-06-11 · solo 2025-2026 visibles ·
        Índices = bajas por empresa / plantilla por empresa (Potentor:
        departamento &ldquo;Sucursales&rdquo; → CONCEPTS, resto → SIMCO)
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

/**
 * Sub-card de desglose Sucursales / Corporativo con delta YoY YTD.
 *
 * Para el delta: 2026 es YTD (mid-año), así que se compara contra
 * el mismo periodo del año anterior (Ene-Jun 2025) — sólo así el %
 * es interpretable. El total grande sigue siendo 2025+2026 acumulado.
 */
function RotacionSubCard({
  label,
  total,
  n2025,
  n2026,
  base2025YTD,
  deltaPct,
  color,
}: {
  label: string;
  total: number;
  n2025: number;
  n2026: number;
  base2025YTD: number;
  deltaPct: number | null;
  color: "orange" | "blue";
}) {
  const accent =
    color === "orange"
      ? "text-[var(--color-accent-orange)]"
      : "text-[var(--color-accent-blue)]";

  // En contexto HR: bajar bajas = bueno (verde). Subir = malo (rojo).
  const isDown = deltaPct !== null && deltaPct < 0;
  const isUp = deltaPct !== null && deltaPct > 0;
  const deltaColor = isDown
    ? "text-[var(--color-accent-teal)] border-[var(--color-accent-teal)]/35 bg-[var(--color-accent-teal)]/10"
    : isUp
      ? "text-[var(--color-accent-red)] border-[var(--color-accent-red)]/35 bg-[var(--color-accent-red)]/10"
      : "text-[var(--color-text-dim)] border-[var(--color-border-subtle)] bg-transparent";
  const arrow = isDown ? "↓" : isUp ? "↑" : "→";
  const deltaTxt =
    deltaPct === null
      ? "Sin base 2025"
      : `${arrow} ${Math.abs(deltaPct).toFixed(0)}%`;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className={`text-[11px] uppercase tracking-[0.14em] ${accent} font-medium`}>
          {label}
        </p>
        <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)] mt-1">
          {total}
        </p>
        <p className="text-[11px] text-[var(--color-text-dim)] mt-1">
          {n2025} en 2025 · {n2026} en 2026
        </p>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-2 italic">
          {n2026} en 2026 YTD vs {base2025YTD} mismo periodo 2025
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <UserMinus
          className={`h-6 w-6 ${accent} opacity-60`}
        />
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${deltaColor}`}
          title="2026 YTD vs mismo periodo 2025"
        >
          {deltaTxt}
        </span>
        <span className="text-[9px] text-[var(--color-text-dim)] uppercase tracking-wider">
          YoY YTD
        </span>
      </div>
    </div>
  );
}
