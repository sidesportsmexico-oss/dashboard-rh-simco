import { SectionCard } from "@/components/section-card";
import {
  EcoDistribucionBar,
  EcoDistribucionLegend,
} from "@/components/eco-distribucion-bar";
import { distribucionGlobal, favorablesPct } from "@/lib/eco/helpers";
import type { EcoReporte } from "@/lib/eco/types";

interface Props {
  reporte: EcoReporte;
  /** Si true, agrega el badge con el índice global arriba a la derecha. */
  showIndice?: boolean;
  /** Título del card. Default: "Distribución global de respuestas". */
  title?: string;
  /**
   * Descripción del card. Default: "X% de respuestas favorables (Op1 + Op2)"
   * (calculada del reporte).
   */
  description?: string;
  className?: string;
}

/**
 * Card visual que muestra la distribución global Op1-Op4 del reporte ECO.
 * Reutilizada en /eco y en Overview /. Incluye:
 *  - Título + favorables %
 *  - Barra apilada Op1-Op4
 *  - Leyenda
 *  - 4 columnas con porcentaje y descripción de cada opción
 */
export function EcoDistribucionCard({
  reporte,
  showIndice = false,
  title,
  description,
  className,
}: Props) {
  const dist = distribucionGlobal(reporte);
  const favPct = favorablesPct(dist);

  return (
    <SectionCard
      title={title ?? "Distribución global de respuestas"}
      description={
        description ??
        `${favPct.toFixed(0)}% de respuestas favorables (Op1 + Op2)`
      }
      className={className}
      action={
        showIndice ? (
          <div className="flex items-baseline gap-2 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 px-3 py-1.5">
            <span className="text-xs text-[var(--color-accent-teal)] uppercase tracking-wider">
              Índice
            </span>
            <span className="text-lg font-semibold tabular-nums text-[var(--color-accent-teal)]">
              {reporte.indiceGlobal}%
            </span>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <EcoDistribucionBar dist={dist} height={32} />
        <EcoDistribucionLegend />
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-[var(--color-border-subtle)]">
          {(
            [
              ["op1", "Op. 1", "Totalmente de acuerdo"],
              ["op2", "Op. 2", "De acuerdo"],
              ["op3", "Op. 3", "En desacuerdo"],
              ["op4", "Op. 4", "Totalmente en desacuerdo"],
            ] as const
          ).map(([k, label, desc]) => (
            <div key={k} className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                {label}
              </p>
              <p className="text-2xl font-semibold tabular-nums text-[var(--color-text)] mt-1">
                {dist[k].toFixed(0)}%
              </p>
              <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5 line-clamp-1">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
