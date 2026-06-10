import { Suspense } from "react";
import { Briefcase, Users, ClipboardList, Target } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { KpiCardClickable } from "@/components/kpi-card-clickable";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import {
  OrganigramaTree,
  JerarquiasResumen,
  VacantesTableModal,
} from "@/components/organigrama-tree";
import {
  getVacantes,
  resumenVacantes,
  buildFunnelDesdeVacantes,
  isVacante2026,
} from "@/lib/potentor/reclutamiento";
import {
  getHeadcountReporte,
  resumenHeadcount,
} from "@/lib/potentor/headcount";
import { getEmpresaInfo } from "@/lib/potentor/empresa";
import {
  getEcoResultados,
  compararEncuestas,
} from "@/lib/potentor/diagnostico";
import { getJerarquias, getOrganigrama } from "@/lib/potentor/organigrama";
import { FunnelChart } from "@/components/funnel-chart";

export const revalidate = 600;

async function EcoKpi() {
  try {
    const resp = await getEcoResultados();
    const encuestas = compararEncuestas(resp.data ?? []);
    const ecoSimco = encuestas.find((e) => e.def.id === "eco_2025_simco");
    return (
      <KpiCard
        label="IP Corporativo 2025"
        value={
          ecoSimco?.promedioIp != null
            ? ecoSimco.promedioIp.toFixed(1)
            : "—"
        }
        hint="Índice de Potencial · ECO pendiente"
        icon={<ClipboardList className="h-4 w-4" />}
      />
    );
  } catch {
    return (
      <KpiCard
        label="IP Corporativo 2025"
        value="—"
        hint="Error al cargar"
        tone="warning"
        icon={<ClipboardList className="h-4 w-4" />}
      />
    );
  }
}

async function OverviewContent() {
  const [vacantesRes, headcountRes, empresaRes, jerarquiasRes, organigramaRes] =
    await Promise.allSettled([
      getVacantes(),
      getHeadcountReporte(),
      getEmpresaInfo(),
      getJerarquias(),
      getOrganigrama(),
    ]);

  const vacantes =
    vacantesRes.status === "fulfilled" ? vacantesRes.value : [];
  const headcount =
    headcountRes.status === "fulfilled" ? headcountRes.value : [];
  const jerarquias =
    jerarquiasRes.status === "fulfilled" ? jerarquiasRes.value : [];
  const organigrama =
    organigramaRes.status === "fulfilled" ? organigramaRes.value : [];

  const vacResumen = resumenVacantes(vacantes);
  const hcResumen = resumenHeadcount(headcount);
  const funnel = buildFunnelDesdeVacantes(vacantes);

  // Slim shape para el modal y la sección
  const vacantes2026Slim = vacantes
    .filter(isVacante2026)
    .sort((a, b) => (b.fecha_creacion ?? "").localeCompare(a.fecha_creacion ?? ""))
    .map((v) => ({
      vacante_id: v.vacante_id,
      nombre: v.nombre,
      puesto: v.puesto,
      sucursal: v.sucursal,
      fecha_creacion: v.fecha_creacion,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCardClickable
          label="Posiciones SIMCO"
          value={hcResumen.total}
          hint="Plantilla actual · click para organigrama"
          icon={<Users className="h-4 w-4" />}
          tone="teal"
          modalTitle="Organigrama SIMCO"
          modalSubtitle={`Posiciones por nivel jerárquico · ${hcResumen.total} empleados en plantilla`}
          modalSize="xl"
        >
          <JerarquiasResumen jerarquias={jerarquias} />
          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-baseline justify-between">
              <span>Árbol organizacional</span>
              <span className="text-xs font-normal text-[var(--color-text-dim)]">
                Click en chevron para expandir/colapsar
              </span>
            </h3>
            <OrganigramaTree nodos={organigrama} defaultExpandLevel={2} />
          </div>
        </KpiCardClickable>

        <KpiCardClickable
          label="Vacantes 2026"
          value={vacResumen.vacantes2026}
          hint={`${vacResumen.abiertas2026} abiertas · click para ver`}
          icon={<Briefcase className="h-4 w-4" />}
          tone={vacResumen.vacantes2026 > 0 ? "warning" : "default"}
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

        <Suspense
          fallback={<KpiCard label="IP Corporativo 2025" value="…" />}
        >
          <EcoKpi />
        </Suspense>
        <KpiCard
          label="Evaluación 360"
          value="—"
          hint="Pendiente prod data"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Pipeline de reclutamiento"
          description="Vacantes agrupadas por estatus"
        >
          <FunnelChart data={funnel} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]"
          />
        ))}
      </div>
    </div>
  );
}
