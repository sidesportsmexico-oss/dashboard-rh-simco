import { Suspense } from "react";
import { Briefcase, Users, ClipboardList, Target } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { KpiCardClickable } from "@/components/kpi-card-clickable";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { VacantesTableModal } from "@/components/organigrama-tree";
import { OrganigramaModalBody } from "@/components/organigrama-modal-body";
import {
  getVacantes,
  resumenVacantes,
  buildPipelineMensual,
  isVacante2026,
  getMapaFechaCierre,
} from "@/lib/potentor/reclutamiento";
import {
  getHeadcountReporte,
  resumenHeadcount,
  jerarquiasOcupadasDesdeHeadcount,
  headcountASlim,
} from "@/lib/potentor/headcount";
import { getEmpresaInfo } from "@/lib/potentor/empresa";
import { ecoReporte202606Simco } from "@/data/eco-2026-06-simco";
import { EcoDistribucionCard } from "@/components/eco-distribucion-card";
import { getJerarquias, getOrganigrama } from "@/lib/potentor/organigrama";
import { PipelineMensualChart } from "@/components/pipeline-mensual-chart";

export const revalidate = 60;


async function OverviewContent() {
  const [
    vacantesRes,
    headcountRes,
    empresaRes,
    jerarquiasRes,
    organigramaRes,
    cierreRes,
  ] = await Promise.allSettled([
    getVacantes(),
    getHeadcountReporte(),
    getEmpresaInfo(),
    getJerarquias(),
    getOrganigrama(),
    getMapaFechaCierre(),
  ]);

  const vacantes =
    vacantesRes.status === "fulfilled" ? vacantesRes.value : [];
  const headcount =
    headcountRes.status === "fulfilled" ? headcountRes.value : [];
  const jerarquias =
    jerarquiasRes.status === "fulfilled" ? jerarquiasRes.value : [];
  const organigrama =
    organigramaRes.status === "fulfilled" ? organigramaRes.value : [];
  const mapaFechaCierre =
    cierreRes.status === "fulfilled" ? cierreRes.value : new Map<string, string>();

  const vacResumen = resumenVacantes(vacantes);
  const hcResumen = resumenHeadcount(headcount);

  // Jerarquías con conteo REAL (no slots de estructura) + empleados slim
  // para el modal anidado por jerarquía.
  const jerarquiasOcupadas = jerarquiasOcupadasDesdeHeadcount(headcount);
  const jerarquiasReales = jerarquias.map((j) => ({
    ...j,
    cantidad_puestos:
      jerarquiasOcupadas.get(j.nombre.trim().toUpperCase()) ?? 0,
  }));
  const empleadosSlim = headcountASlim(headcount);
  // Pipeline mensual de vacantes 2026 (Ene-Dic) por estatus
  const pipelineMensual2026 = buildPipelineMensual(vacantes, 2026);

  // Métricas derivadas para las barras de % de las cards
  const estructuraTotal = hcResumen.total + vacResumen.abiertas2026;
  const coberturaPct =
    estructuraTotal > 0
      ? Math.round((hcResumen.total / estructuraTotal) * 100)
      : 0;
  const vacantesCerradas2026 =
    vacResumen.vacantes2026 - vacResumen.abiertas2026;
  const pctAbiertas2026 =
    vacResumen.vacantes2026 > 0
      ? Math.round((vacResumen.abiertas2026 / vacResumen.vacantes2026) * 100)
      : 0;
  const pctCerradas2026 =
    vacResumen.vacantes2026 > 0
      ? Math.round((vacantesCerradas2026 / vacResumen.vacantes2026) * 100)
      : 0;

  // Slim shape para el modal y la sección. Enriquecido con fecha_cierre
  // desde /vacante/info.
  const vacantes2026Slim = vacantes
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

  const errors: { module: string; error: string }[] = [];
  if (vacantesRes.status === "rejected")
    errors.push({ module: "Reclutamiento", error: String(vacantesRes.reason) });
  if (headcountRes.status === "rejected")
    errors.push({ module: "Head Count", error: String(headcountRes.reason) });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle="Vista ejecutiva de Recursos Humanos · SIMCO"
        tags={["Vista CEO", "Potentor API"]}
      />

      {errors.map((e, i) => (
        <ErrorBanner
          key={i}
          title={`Error al cargar ${e.module}`}
          detail={e.error}
        />
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCardClickable
          label="Posiciones SIMCO"
          value={hcResumen.total}
          hint="Plantilla actual · click para organigrama"
          icon={<Users className="h-4 w-4" />}
          tone="teal"
          progress={{
            pct: coberturaPct,
            primaryLabel: `${coberturaPct}% cobertura`,
            secondaryLabel: `${hcResumen.total}/${estructuraTotal} ocupadas`,
          }}
          modalTitle="Organigrama SIMCO"
          modalSubtitle={`Posiciones por nivel jerárquico · ${hcResumen.total} empleados en plantilla`}
          modalSize="full"
        >
          <OrganigramaModalBody
            jerarquias={jerarquiasReales}
            organigrama={organigrama}
            empleados={empleadosSlim}
          />
        </KpiCardClickable>

        <KpiCardClickable
          label="Vacantes 2026"
          value={vacResumen.vacantes2026}
          hint="Click para ver detalle"
          icon={<Briefcase className="h-4 w-4" />}
          tone={vacResumen.vacantes2026 > 0 ? "warning" : "default"}
          progress={{
            pct: pctAbiertas2026,
            primaryLabel: `${pctAbiertas2026}% abiertas`,
            secondaryLabel: `${pctCerradas2026}% cerradas`,
          }}
          modalTitle="Vacantes creadas en 2026"
          modalSubtitle={`${vacantes2026Slim.length} registros · ordenadas por fecha de creación`}
          modalSize="xl"
        >
          {vacantes2026Slim.length === 0 ? (
            <p className="text-sm text-[var(--color-text-dim)] py-4">
              No hay vacantes registradas con fecha de creación en 2026.
            </p>
          ) : (
            <VacantesTableModal vacantes={vacantes2026Slim} />
          )}
        </KpiCardClickable>

        <KpiCard
          label="Evaluación 360"
          value="—"
          hint="Pendiente prod data"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      <EcoDistribucionCard
        reporte={ecoReporte202606Simco}
        showIndice
        title="ECO"
        description="Distribución global de respuestas · Junio 2026 — SIMCO + CONCEPTS"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Pipeline de reclutamiento 2026"
          description="Vacantes creadas por mes — Ene a Dic · stacked por etapa"
        >
          <PipelineMensualChart data={pipelineMensual2026} />
        </SectionCard>

        <SectionCard
          title="Vacantes 2026 — recientes"
          description={`Las ${Math.min(vacantes2026Slim.length, 6)} más recientes · ordenadas por fecha de creación`}
        >
          {vacantes2026Slim.length === 0 ? (
            <p className="text-sm text-[var(--color-text-dim)]">
              Sin vacantes 2026
            </p>
          ) : (
            <ul className="space-y-1">
              {vacantes2026Slim.slice(0, 6).map((v) => {
                const closed = /cerrada|cubierta|cancelada/i.test(v.estatus ?? "");
                return (
                  <li
                    key={v.vacante_id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-[var(--color-border-subtle)] last:border-0 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      {v.link ? (
                        <a
                          href={v.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent-teal)] hover:underline truncate block"
                        >
                          {v.nombre}
                        </a>
                      ) : (
                        <span className="font-medium text-[var(--color-text)] truncate block">
                          {v.nombre}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-dim)] tabular-nums">
                        Creada {v.fecha_creacion}
                      </span>
                    </div>
                    <span
                      className={
                        closed
                          ? "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)]"
                          : "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 px-2 py-0.5 text-[10px] text-[var(--color-accent-teal)]"
                      }
                    >
                      <span
                        className={
                          closed
                            ? "h-1.5 w-1.5 rounded-full bg-[var(--color-text-dim)]"
                            : "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)]"
                        }
                      />
                      {v.estatus || "—"}
                    </span>
                  </li>
                );
              })}
              {vacantes2026Slim.length > 6 && (
                <li className="pt-2 text-[10px] text-[var(--color-text-dim)] italic">
                  +{vacantes2026Slim.length - 6} más · click en el KPI &ldquo;Vacantes 2026&rdquo; para ver todas
                </li>
              )}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 w-48 bg-[var(--color-bg-elevated)] rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]"
          />
        ))}
      </div>
    </div>
  );
}
