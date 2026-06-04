import { Suspense } from "react";
import { ClipboardList, Building2, Utensils, Archive } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import {
  EcoScoreComparativoChart,
  EcoDistribucionPorEncuestaChart,
  EcoTasaRespuestaChart,
  ENCUESTA_COLOR,
} from "@/components/eco-charts";
import {
  getEcoResultados,
  compararEncuestas,
  type EncuestaResumen,
} from "@/lib/potentor/diagnostico";
import { cn, formatPercent } from "@/lib/utils";

export const revalidate = 600;

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
  const encuestas = compararEncuestas(rows);

  // Deltas útiles para el CEO
  const eco24 = encuestas.find((e) => e.def.id === "eco_2024_2");
  const ecoSimco = encuestas.find((e) => e.def.id === "eco_2025_simco");
  const ecoConcepts = encuestas.find((e) => e.def.id === "eco_2025_concepts");

  const deltaSimcoVs24 =
    ecoSimco?.promedioIp != null && eco24?.promedioIp != null
      ? ecoSimco.promedioIp - eco24.promedioIp
      : null;
  const deltaCorpVsOp =
    ecoSimco?.promedioIp != null && ecoConcepts?.promedioIp != null
      ? ecoSimco.promedioIp - ecoConcepts.promedioIp
      : null;

  // Datos para charts
  const scoreComparativo = encuestas.map((e) => ({
    id: e.def.id,
    nombre: e.def.nombre,
    promedioIp: e.promedioIp,
  }));

  // Distribución cross-encuesta
  const distRows = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    encuestas: encuestas.map((e) => ({
      id: e.def.id,
      nombre: e.def.nombre,
      count: e.distribucion[i] ?? 0,
    })),
  }));

  const tasaRows = encuestas.map((e) => ({
    id: e.def.id,
    nombre: e.def.nombre,
    respondieron: e.respondieron,
    total: e.total,
    tasaRespuesta: e.tasaRespuesta,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="ECO — Diagnóstico de Clima Organizacional"
        subtitle="3 ediciones aplicadas · comparativo entre audiencias y años"
        tags={["Vista CEO", "SIMCO + CONCEPTS"]}
      />

      {/* 3 cards con resumen de cada encuesta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EncuestaCard
          resumen={eco24}
          icon={<Archive className="h-5 w-5" />}
        />
        <EncuestaCard
          resumen={ecoSimco}
          icon={<Building2 className="h-5 w-5" />}
          highlight
        />
        <EncuestaCard
          resumen={ecoConcepts}
          icon={<Utensils className="h-5 w-5" />}
        />
      </div>

      {/* Deltas clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Δ SIMCO 2025 vs ECO 2024"
          value={deltaSimcoVs24 !== null ? deltaSimcoVs24.toFixed(1) : "—"}
          hint={
            ecoSimco?.promedioIp != null && eco24?.promedioIp != null
              ? `${eco24.promedioIp.toFixed(1)} → ${ecoSimco.promedioIp.toFixed(1)}`
              : "Sin base de comparación"
          }
          tone={
            deltaSimcoVs24 === null
              ? "default"
              : deltaSimcoVs24 > 0
                ? "success"
                : deltaSimcoVs24 < 0
                  ? "danger"
                  : "default"
          }
        />
        <KpiCard
          label="Δ Corporativo vs Operativo (2025)"
          value={deltaCorpVsOp !== null ? deltaCorpVsOp.toFixed(1) : "—"}
          hint={
            ecoSimco?.promedioIp != null && ecoConcepts?.promedioIp != null
              ? `SIMCO ${ecoSimco.promedioIp.toFixed(1)} vs CONCEPTS ${ecoConcepts.promedioIp.toFixed(1)}`
              : "Sin base"
          }
          tone={
            deltaCorpVsOp === null
              ? "default"
              : Math.abs(deltaCorpVsOp) > 5
                ? "warning"
                : "default"
          }
        />
      </div>

      {/* Comparativo bar chart */}
      <SectionCard
        title="Score promedio por encuesta"
        description="Comparativo lado a lado de las 3 ediciones aplicadas"
      >
        <EcoScoreComparativoChart data={scoreComparativo} />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Distribución de scores"
          description="Cuántas personas respondieron en cada rango (0-100)"
        >
          <EcoDistribucionPorEncuestaChart data={distRows} />
        </SectionCard>

        <SectionCard
          title="Tasa de respuesta"
          description="Respondieron vs no respondieron por encuesta"
        >
          <EcoTasaRespuestaChart data={tasaRows} />
        </SectionCard>
      </div>

      {/* Desgloses tabulares por encuesta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {encuestas.map((e) => (
          <EncuestaBreakdown key={e.def.id} resumen={e} />
        ))}
      </div>
    </div>
  );
}

function EncuestaCard({
  resumen,
  icon,
  highlight = false,
}: {
  resumen: EncuestaResumen | undefined;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  if (!resumen) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-2">
        <span className="text-sm text-[var(--color-text-dim)]">
          Encuesta no encontrada
        </span>
      </div>
    );
  }
  const color = ENCUESTA_COLOR[resumen.def.id] ?? "#7a8fa8";
  const borderStyle = highlight
    ? { borderColor: color, boxShadow: `0 0 36px -18px ${color}` }
    : { borderColor: "#3a4555" };

  return (
    <div
      className="rounded-2xl border bg-[var(--color-bg-card)] p-6 flex flex-col gap-4"
      style={borderStyle}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.16em]"
            style={{ color }}
          >
            {resumen.def.audiencia}
          </p>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mt-1">
            {resumen.def.nombre}
          </h3>
        </div>
        <span style={{ color }}>{icon}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-5xl font-semibold tracking-tight tabular-nums text-[var(--color-text)]">
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
            {resumen.respondieron}
            <span className="text-xs text-[var(--color-text-dim)]">
              {" "}
              / {resumen.total}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">
            Tasa
          </p>
          <p className="text-lg font-medium tabular-nums text-[var(--color-text)]">
            {formatPercent(resumen.tasaRespuesta * 100)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EncuestaBreakdown({ resumen }: { resumen: EncuestaResumen }) {
  const color = ENCUESTA_COLOR[resumen.def.id] ?? "#7a8fa8";
  const sorted = [...resumen.porDepartamento.entries()]
    .filter(([, s]) => s.n > 0)
    .sort((a, b) => b[1].promedio - a[1].promedio)
    .slice(0, 8);
  return (
    <SectionCard
      title={resumen.def.nombre}
      description="Top departamentos · score promedio"
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--color-text-dim)]">Sin respuestas</p>
      ) : (
        <ul className="space-y-1">
          {sorted.map(([name, stats]) => (
            <li
              key={name}
              className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--color-border-subtle)] last:border-0"
            >
              <span className="flex items-center gap-2 truncate pr-2">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[var(--color-text-muted)] truncate">
                  {name}
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
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
