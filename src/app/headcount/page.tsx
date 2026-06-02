import { Suspense } from "react";
import { Users, Briefcase } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { formatNumber } from "@/lib/utils";
import {
  getHeadcountReporte,
  resumenHeadcount,
} from "@/lib/potentor/headcount";
import { getVacantes, resumenVacantes } from "@/lib/potentor/reclutamiento";

export const revalidate = 600;

async function Content() {
  const [hcRes, vacRes] = await Promise.allSettled([
    getHeadcountReporte(),
    getVacantes(),
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
  const hcResumen = resumenHeadcount(headcount);
  const vacResumen = resumenVacantes(vacantes);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Head Count</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Posiciones dentro de SIMCO y vacantes abiertas
        </p>
      </div>

      {/* DOS KPIs grandes, estilo ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Posiciones SIMCO
            </span>
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
            {formatNumber(hcResumen.total)}
          </p>
          <p className="text-xs text-zinc-500">
            Total de posiciones registradas en la compañía
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Vacantes abiertas
            </span>
            <Briefcase className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-6xl font-semibold tracking-tight text-amber-900 dark:text-amber-100 tabular-nums">
            {formatNumber(vacResumen.abiertas)}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {vacResumen.total} vacantes registradas en total
          </p>
        </div>
      </div>

      <SectionCard
        title="Cobertura de plantilla"
        description="Ocupadas vs ocupadas + abiertas"
      >
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${
                    hcResumen.total + vacResumen.abiertas > 0
                      ? (hcResumen.total /
                          (hcResumen.total + vacResumen.abiertas)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>{formatNumber(hcResumen.total)} ocupadas</span>
              <span>{formatNumber(vacResumen.abiertas)} abiertas</span>
            </div>
          </div>
          <div className="text-3xl font-semibold tabular-nums">
            {hcResumen.total + vacResumen.abiertas > 0
              ? `${Math.round(
                  (hcResumen.total /
                    (hcResumen.total + vacResumen.abiertas)) *
                    100,
                )}%`
              : "—"}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Cargando…</div>}>
      <Content />
    </Suspense>
  );
}
