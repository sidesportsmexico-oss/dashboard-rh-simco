import { Suspense } from "react";
import { Briefcase, Users, ClipboardList, Target } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import {
  getVacantes,
  resumenVacantes,
  buildFunnelDesdeVacantes,
} from "@/lib/potentor/reclutamiento";
import {
  getHeadcountReporte,
  resumenHeadcount,
} from "@/lib/potentor/headcount";
import { getEmpresaInfo } from "@/lib/potentor/empresa";
import {
  getEcoResultados,
  resumirEcoPorAnio,
} from "@/lib/potentor/diagnostico";
import { FunnelChart } from "@/components/funnel-chart";

export const revalidate = 600;

async function EcoKpi() {
  try {
    const resp = await getEcoResultados();
    const byYear = resumirEcoPorAnio(resp.data ?? []);
    const r26 = byYear.get(2026) ?? null;
    const r25 = byYear.get(2025) ?? null;
    return (
      <KpiCard
        label="ECO 2026"
        value={r26?.promedioIp !== null && r26 != null ? r26.promedioIp.toFixed(1) : "—"}
        hint={
          r25?.promedioIp != null
            ? `2025: ${r25.promedioIp.toFixed(1)}`
            : "Sin base 2025"
        }
        trend={
          r25?.promedioIp != null && r26?.promedioIp != null
            ? {
                delta: Number((r26.promedioIp - r25.promedioIp).toFixed(1)),
              }
            : undefined
        }
        icon={<ClipboardList className="h-4 w-4" />}
        tone="teal"
      />
    );
  } catch {
    return (
      <KpiCard
        label="ECO 2026"
        value="—"
        hint="Error al cargar"
        tone="warning"
        icon={<ClipboardList className="h-4 w-4" />}
      />
    );
  }
}

async function OverviewContent() {
  const [vacantesRes, headcountRes, empresaRes] = await Promise.allSettled([
    getVacantes(),
    getHeadcountReporte(),
    getEmpresaInfo(),
  ]);

  const vacantes =
    vacantesRes.status === "fulfilled" ? vacantesRes.value : [];
  const headcount =
    headcountRes.status === "fulfilled" ? headcountRes.value : [];

  const vacResumen = resumenVacantes(vacantes);
  const hcResumen = resumenHeadcount(headcount);
  const funnel = buildFunnelDesdeVacantes(vacantes);

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
        <KpiCard
          label="Posiciones SIMCO"
          value={hcResumen.total}
          hint="Plantilla actual"
          icon={<Users className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          label="Vacantes 2026"
          value={vacResumen.enReclutamiento}
          hint={`${vacResumen.total} históricas totales`}
          icon={<Briefcase className="h-4 w-4" />}
          tone={vacResumen.enReclutamiento > 0 ? "warning" : "default"}
        />
        <Suspense fallback={<KpiCard label="ECO 2026" value="…" />}>
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
          title="Vacantes 2026 por sucursal"
          description="Sucursales con reclutamiento activo"
        >
          <ul className="space-y-2">
            {[...vacResumen.porSucursal2026.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([sucursal, count]) => (
                <li
                  key={sucursal}
                  className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border-subtle)] last:border-0"
                >
                  <span className="text-[var(--color-text-muted)] truncate">
                    {sucursal}
                  </span>
                  <span className="font-medium tabular-nums text-[var(--color-text)]">
                    {count}
                  </span>
                </li>
              ))}
            {vacResumen.porSucursal2026.size === 0 && (
              <li className="text-sm text-[var(--color-text-dim)]">
                Sin vacantes en reclutamiento
              </li>
            )}
          </ul>
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
