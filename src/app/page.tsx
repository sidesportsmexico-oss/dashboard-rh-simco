import { Suspense } from "react";
import { Briefcase, Users, ClipboardList, Target } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
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

export const revalidate = 600;

async function OverviewContent() {
  // Disparamos los 3 en paralelo para no acumular latencia.
  const [vacantesRes, headcountRes, empresaRes] = await Promise.allSettled([
    getVacantes(),
    getHeadcountReporte(),
    getEmpresaInfo(),
  ]);

  const vacantes =
    vacantesRes.status === "fulfilled" ? vacantesRes.value : [];
  const headcount =
    headcountRes.status === "fulfilled" ? headcountRes.value : [];
  const empresa =
    empresaRes.status === "fulfilled" ? empresaRes.value : null;

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          SIMCO — vista ejecutiva de Recursos Humanos
        </p>
      </div>

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
        />
        <KpiCard
          label="Vacantes abiertas"
          value={vacResumen.abiertas}
          hint={`${vacResumen.total} totales`}
          icon={<Briefcase className="h-4 w-4" />}
          tone={vacResumen.abiertas > 0 ? "warning" : "default"}
        />
        <Suspense fallback={<KpiCard label="ECO 2026" value="…" />}>
          <EcoKpi />
        </Suspense>
        <KpiCard
          label="Evaluación 360 2026"
          value="—"
          hint="Pendiente endpoint API"
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
          title="Vacantes por sucursal"
          description="Top 6 con más vacantes registradas"
        >
          <ul className="space-y-2">
            {[...vacResumen.porSucursal.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([sucursal, count]) => (
                <li
                  key={sucursal}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {sucursal}
                  </span>
                  <span className="font-medium tabular-nums">{count}</span>
                </li>
              ))}
            {vacResumen.porSucursal.size === 0 && (
              <li className="text-sm text-zinc-500">Sin datos</li>
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
      <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}
