import { Suspense } from "react";
import { ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import {
  getEcoResultados,
  resumirEcoPorAnio,
  compararEco,
  type EcoResumenAnio,
} from "@/lib/potentor/diagnostico";
import { cn, formatPercent } from "@/lib/utils";

export const revalidate = 600;

const YEAR_A = 2025;
const YEAR_B = 2026;

function DeltaPill({ delta, suffix = "" }: { delta: number | null; suffix?: string }) {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <Minus className="h-3 w-3" /> Sin datos
      </span>
    );
  }
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const color =
    delta > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : delta < 0
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-500";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="h-3 w-3" />
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}
      {suffix}
    </span>
  );
}

async function Content() {
  let resp;
  try {
    resp = await getEcoResultados();
  } catch (err) {
    return (
      <ErrorBanner
        title="No se pudo cargar ECO"
        detail={err instanceof Error ? err.message : String(err)}
      />
    );
  }

  const rows = resp.data ?? [];
  const resumenPorAnio = resumirEcoPorAnio(rows);
  const comp = compararEco(resumenPorAnio, YEAR_A, YEAR_B);

  const yearsDisponibles = [...resumenPorAnio.keys()].sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          ECO — Encuesta de Clima Organizacional
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Diagnóstico de Clima ·{" "}
          {yearsDisponibles.length > 0
            ? `Años disponibles: ${yearsDisponibles.join(", ")}`
            : "Sin datos"}
        </p>
      </div>

      {yearsDisponibles.length === 0 && (
        <ErrorBanner
          title="Sin resultados de ECO en el rango consultado"
          detail="El endpoint /diagnostico/lista_ip respondió, pero no hay filas con fecha_termino válida."
        />
      )}

      {/* Comparativo grande 2025 vs 2026 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YearCard year={YEAR_A} resumen={comp.a} />
        <YearCard year={YEAR_B} resumen={comp.b} />
      </div>

      {/* Deltas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label={`Δ Score promedio (${YEAR_B} vs ${YEAR_A})`}
          value={comp.deltaPromedio !== null ? comp.deltaPromedio.toFixed(1) : "—"}
          hint={
            comp.a?.promedioIp != null && comp.b?.promedioIp != null
              ? `${comp.a.promedioIp.toFixed(1)} → ${comp.b.promedioIp.toFixed(1)}`
              : "Sin base de comparación"
          }
          tone={
            comp.deltaPromedio === null
              ? "default"
              : comp.deltaPromedio > 0
                ? "success"
                : comp.deltaPromedio < 0
                  ? "danger"
                  : "default"
          }
        />
        <KpiCard
          label={`Δ Tasa de respuesta`}
          value={
            comp.deltaTasa !== null
              ? `${(comp.deltaTasa * 100).toFixed(1)}%`
              : "—"
          }
          hint={
            comp.a && comp.b
              ? `${formatPercent(comp.a.tasaRespuesta * 100)} → ${formatPercent(comp.b.tasaRespuesta * 100)}`
              : "Sin base de comparación"
          }
          tone={
            comp.deltaTasa === null
              ? "default"
              : comp.deltaTasa > 0
                ? "success"
                : comp.deltaTasa < 0
                  ? "warning"
                  : "default"
          }
        />
      </div>

      {/* Desgloses por sucursal y área del año más reciente */}
      {comp.b && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreakdownCard
            title={`Top sucursales ${YEAR_B}`}
            description="Score promedio (Índice de Percepción)"
            entries={comp.b.porSucursal}
          />
          <BreakdownCard
            title={`Top áreas ${YEAR_B}`}
            description="Score promedio (Índice de Percepción)"
            entries={comp.b.porArea}
          />
        </div>
      )}
    </div>
  );
}

function YearCard({ year, resumen }: { year: number; resumen: EcoResumenAnio | null }) {
  if (!resumen) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          ECO {year}
        </span>
        <p className="text-3xl font-semibold text-zinc-400">Sin datos</p>
        <p className="text-xs text-zinc-500">
          No hay encuestas con fecha_termino en {year}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          ECO {year}
        </span>
        <ClipboardList className="h-5 w-5 text-zinc-400" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
          {resumen.promedioIp !== null ? resumen.promedioIp.toFixed(1) : "—"}
        </p>
        <p className="text-sm text-zinc-500">/ 100</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Respondieron
          </p>
          <p className="text-lg font-medium tabular-nums">
            {resumen.respondieron}{" "}
            <span className="text-xs text-zinc-500">
              / {resumen.totalInvitados}
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Tasa respuesta
          </p>
          <p className="text-lg font-medium tabular-nums">
            {formatPercent(resumen.tasaRespuesta * 100)}
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: Map<string, { suma: number; n: number; promedio: number }>;
}) {
  const sorted = [...entries.entries()]
    .sort((a, b) => b[1].promedio - a[1].promedio)
    .slice(0, 6);
  return (
    <SectionCard title={title} description={description}>
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500">Sin respuestas con score &gt; 0</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(([name, stats]) => (
            <li
              key={name}
              className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <span className="text-zinc-700 dark:text-zinc-300 truncate">
                {name}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 tabular-nums">
                  n={stats.n}
                </span>
                <span className="font-medium tabular-nums">
                  {stats.promedio.toFixed(1)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Cargando…</div>}>
      <Content />
    </Suspense>
  );
}
