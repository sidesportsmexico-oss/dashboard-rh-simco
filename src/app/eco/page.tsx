import { Suspense } from "react";
import { ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader
        title="ECO — Encuesta de Clima Organizacional"
        subtitle={
          yearsDisponibles.length > 0
            ? `Años disponibles: ${yearsDisponibles.join(", ")}`
            : "Sin datos"
        }
        tags={["Vista CEO", "Diagnóstico de Clima"]}
      />

      {yearsDisponibles.length === 0 && (
        <ErrorBanner
          title="Sin resultados de ECO en el rango consultado"
          detail="El endpoint /diagnostico/lista_ip respondió, pero no hay filas con fecha_termino válida."
        />
      )}

      {/* Comparativo grande 2025 vs 2026 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YearCard year={YEAR_A} resumen={comp.a} tone="muted" />
        <YearCard year={YEAR_B} resumen={comp.b} tone="primary" />
      </div>

      {/* Deltas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label={`Δ Score promedio (${YEAR_B} vs ${YEAR_A})`}
          value={
            comp.deltaPromedio !== null ? comp.deltaPromedio.toFixed(1) : "—"
          }
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

      {/* Desgloses */}
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

function YearCard({
  year,
  resumen,
  tone,
}: {
  year: number;
  resumen: EcoResumenAnio | null;
  tone: "primary" | "muted";
}) {
  const borderClass =
    tone === "primary"
      ? "border-[var(--color-accent-teal)]/30 shadow-[0_0_36px_-18px_var(--color-accent-teal)]"
      : "border-[var(--color-border)]";

  const labelColor =
    tone === "primary"
      ? "text-[var(--color-accent-teal)]"
      : "text-[var(--color-text-muted)]";

  if (!resumen) {
    return (
      <div
        className={cn(
          "rounded-2xl border bg-[var(--color-bg-card)] p-8 flex flex-col gap-2",
          borderClass,
        )}
      >
        <span
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.18em]",
            labelColor,
          )}
        >
          ECO {year}
        </span>
        <p className="text-3xl font-semibold text-[var(--color-text-dim)]">
          Sin datos
        </p>
        <p className="text-xs text-[var(--color-text-dim)]">
          No hay encuestas con fecha_termino en {year}
        </p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-2xl border bg-[var(--color-bg-card)] p-8 flex flex-col gap-4",
        borderClass,
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.18em]",
            labelColor,
          )}
        >
          ECO {year}
        </span>
        <ClipboardList
          className={cn(
            "h-5 w-5",
            tone === "primary"
              ? "text-[var(--color-accent-teal)]"
              : "text-[var(--color-text-dim)]",
          )}
        />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-6xl font-semibold tracking-tight tabular-nums text-[var(--color-text)]">
          {resumen.promedioIp !== null ? resumen.promedioIp.toFixed(1) : "—"}
        </p>
        <p className="text-sm text-[var(--color-text-dim)]">/ 100</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
        <div>
          <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">
            Respondieron
          </p>
          <p className="text-lg font-medium tabular-nums text-[var(--color-text)]">
            {resumen.respondieron}{" "}
            <span className="text-xs text-[var(--color-text-dim)]">
              / {resumen.totalInvitados}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">
            Tasa respuesta
          </p>
          <p className="text-lg font-medium tabular-nums text-[var(--color-text)]">
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
        <p className="text-sm text-[var(--color-text-dim)]">
          Sin respuestas con score &gt; 0
        </p>
      ) : (
        <ul className="space-y-1">
          {sorted.map(([name, stats]) => (
            <li
              key={name}
              className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border-subtle)] last:border-0"
            >
              <span className="text-[var(--color-text-muted)] truncate pr-3">
                {name}
              </span>
              <span className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-[var(--color-text-dim)] tabular-nums">
                  n={stats.n}
                </span>
                <span className="font-medium tabular-nums text-[var(--color-text)]">
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
    <Suspense
      fallback={
        <div className="text-sm text-[var(--color-text-dim)]">Cargando…</div>
      }
    >
      <Content />
    </Suspense>
  );
}
