import { ClipboardList, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { PageHeader } from "@/components/page-header";
import { EcoRadarChart } from "@/components/eco-radar-chart";
import { EcoDistribucionCard } from "@/components/eco-distribucion-card";
import { EcoEscalaIndice } from "@/components/eco-escala-indice";
import { EcoMacroCard } from "@/components/eco-macro-card";
import { ecoReporte202606Simco } from "@/data/eco-2026-06-simco";
import {
  topMejorEvaluadas,
  topPeorEvaluadas,
  macroParaRadar,
  statsReporte,
  colorByScore,
} from "@/lib/eco/helpers";

export const revalidate = 60;

export default function Page() {
  const reporte = ecoReporte202606Simco;
  const stats = statsReporte(reporte);
  const radarData = macroParaRadar(reporte);
  const top5 = topMejorEvaluadas(reporte, 5);
  const bottom5 = topPeorEvaluadas(reporte, 5);

  const fechaFmt = new Date(reporte.fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Diagnóstico de Clima Organizacional"
        subtitle={`${reporte.organizacion} · Reporte ${fechaFmt}`}
        tags={[
          "Vista CEO",
          "Corp + Restaurantes",
          `${stats.totalItems} preguntas`,
          `${stats.totalMacros} dimensiones`,
        ]}
      />

      {/* HERO: Índice global + distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-[var(--color-accent-teal)]/35 bg-[var(--color-bg-card)] p-7 flex flex-col items-center justify-between gap-4 text-center shadow-[0_0_42px_-20px_var(--color-accent-teal)]">
          <div className="flex flex-col items-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent-teal)]">
              Índice de Clima Organizacional
            </p>
            <p className="text-7xl font-semibold tracking-tight tabular-nums text-[var(--color-text)] mt-2 mb-1">
              {reporte.indiceGlobal}
              <span className="text-3xl text-[var(--color-text-dim)] ml-1">
                %
              </span>
            </p>
          </div>

          <EcoEscalaIndice valor={reporte.indiceGlobal} />

          <div className="text-xs text-[var(--color-text-muted)] space-y-2 max-w-xs">
            <p className="leading-relaxed">
              Score global que resume la salud del clima laboral en una sola
              cifra del 0 al 100. Lo calcula Potentor ponderando todas las
              respuestas: <strong>Op.1</strong> pesa 100%, <strong>Op.2</strong>{" "}
              ~67%, <strong>Op.3</strong> ~33%, <strong>Op.4</strong> 0%.
            </p>
            <p className="text-[10px] text-[var(--color-text-dim)] pt-2 border-t border-[var(--color-border-subtle)]">
              Promedio ponderado de las {stats.totalMacros} macro-dimensiones,{" "}
              {stats.totalSubdims} sub-dimensiones y {stats.totalItems}{" "}
              preguntas del reporte.
            </p>
          </div>
        </div>

        <EcoDistribucionCard reporte={reporte} className="lg:col-span-2" />
      </div>

      {/* RADAR de las 6 macro-dimensiones */}
      <SectionCard
        title="Las 6 macro-dimensiones"
        description="Cada eje es una macro-dimensión del clima organizacional · escala 0-100"
      >
        <EcoRadarChart data={radarData} />
      </SectionCard>

      {/* CARDS clickeables — drill-down a sub-dims y preguntas */}
      <SectionCard
        title="Detalle por dimensión"
        description="Click en cualquier card para ver sub-dimensiones y preguntas con su distribución"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reporte.macrodimensiones.map((macro) => (
            <EcoMacroCard key={macro.nombre} macro={macro} />
          ))}
        </div>
      </SectionCard>

      {/* Top / Bottom 5 preguntas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Top 5 — preguntas mejor evaluadas"
          description="Lo que más funciona en SIMCo"
          action={
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-teal)]">
              <TrendingUp className="h-4 w-4" />
              Fortalezas
            </span>
          }
        >
          <ul className="space-y-3">
            {top5.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 pb-3 border-b border-[var(--color-border-subtle)] last:border-0 last:pb-0"
              >
                <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text)] leading-snug">
                    {item.texto}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
                    {item.macro} · {item.subdim}
                  </p>
                </div>
                <span
                  className="text-sm font-semibold tabular-nums shrink-0"
                  style={{ color: colorByScore(item.score) }}
                >
                  {item.score.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Top 5 — preguntas peor evaluadas"
          description="Focos de atención inmediata"
          action={
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-orange)]">
              <TrendingDown className="h-4 w-4" />
              Oportunidades
            </span>
          }
        >
          <ul className="space-y-3">
            {bottom5.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 pb-3 border-b border-[var(--color-border-subtle)] last:border-0 last:pb-0"
              >
                <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-accent-orange)]/15 text-[var(--color-accent-orange)] text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text)] leading-snug">
                    {item.texto}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
                    {item.macro} · {item.subdim}
                  </p>
                </div>
                <span
                  className="text-sm font-semibold tabular-nums shrink-0"
                  style={{ color: colorByScore(item.score) }}
                >
                  {item.score.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Footer con link al PDF original */}
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-[var(--color-text-dim)]">
        <span className="flex items-center gap-2">
          <ClipboardList className="h-3.5 w-3.5" />
          Reporte generado por Potentor — datos capturados manualmente del PDF
          oficial
        </span>
        {reporte.urlPotentor && (
          <a
            href={reporte.urlPotentor}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--color-accent-teal)] transition-colors"
          >
            Ver reporte original
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
