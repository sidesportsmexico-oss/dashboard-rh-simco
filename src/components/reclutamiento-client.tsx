"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { FunnelChart } from "@/components/funnel-chart";
import { VacantesTableServer } from "@/components/vacantes-table-server";
import { buildFunnelDesdeVacantes } from "@/lib/potentor/reclutamiento";
import type { Vacante } from "@/lib/potentor/types";

type Periodo = "ambos" | "2025" | "2026";

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: "ambos", label: "2025 + 2026" },
  { id: "2025", label: "2025" },
  { id: "2026", label: "2026" },
];

interface Props {
  vacantes: Vacante[];
}

/**
 * Sección /reclutamiento (client) con filtro de periodo.
 *
 * Mismo patrón de tabs que la sección Rotación: el periodo aplica a
 * KPIs, funnel y a las 3 tablas (En Proceso · Standby · Cerradas).
 * No hay periodo "Histórico" / "Todos" porque las vacantes del
 * sistema datan desde 2022 y el dashboard del CEO se enfoca 2025+.
 */
export function ReclutamientoClient({ vacantes }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>("ambos");

  const { filtradas, periodoLabel } = useMemo(() => {
    if (periodo === "ambos") {
      return {
        filtradas: vacantes.filter((v) => {
          const y = (v.fecha_creacion ?? "").slice(0, 4);
          return y === "2025" || y === "2026";
        }),
        periodoLabel: "2025+2026",
      };
    }
    return {
      filtradas: vacantes.filter((v) =>
        (v.fecha_creacion ?? "").startsWith(periodo),
      ),
      periodoLabel: periodo,
    };
  }, [vacantes, periodo]);

  // Sort por fecha desc
  const filtradasOrdenadas = useMemo(
    () =>
      [...filtradas].sort((a, b) =>
        (b.fecha_creacion ?? "").localeCompare(a.fecha_creacion ?? ""),
      ),
    [filtradas],
  );

  // Splits por estatus
  const abiertas = useMemo(
    () =>
      filtradasOrdenadas.filter((v) => /en\s*proceso/i.test(v.estatus ?? "")),
    [filtradasOrdenadas],
  );
  const standby = useMemo(
    () => filtradasOrdenadas.filter((v) => /standby/i.test(v.estatus ?? "")),
    [filtradasOrdenadas],
  );
  const cerradas = useMemo(
    () =>
      filtradasOrdenadas.filter((v) =>
        /cerrada|cubierta|cancelada/i.test(v.estatus ?? ""),
      ),
    [filtradasOrdenadas],
  );

  // KPIs del periodo
  const totalPeriodo = filtradas.length;
  const cerradasCount = cerradas.length;
  const abiertasTotal = totalPeriodo - cerradasCount;
  const sucursalesUnicas = useMemo(() => {
    const s = new Set<string>();
    for (const v of filtradas) {
      s.add(v.sucursal || "Sin sucursal");
    }
    return s.size;
  }, [filtradas]);

  // Funnel del periodo
  const funnel = useMemo(
    () => buildFunnelDesdeVacantes(filtradas),
    [filtradas],
  );

  return (
    <div className="space-y-8">
      {/* Tabs de periodo */}
      <div className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => {
          const active = periodo === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodo(p.id)}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border bg-[var(--color-accent-teal)]/15 border-[var(--color-accent-teal)]/40 text-[var(--color-accent-teal)] cursor-pointer transition-all"
                  : "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label={`Vacantes ${periodoLabel}`}
          value={totalPeriodo}
          hint="Creadas en el periodo"
          icon={<Briefcase className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          label={`Abiertas ${periodoLabel}`}
          value={abiertasTotal}
          hint={`${cerradasCount} ya cerradas`}
          tone="warning"
        />
        <KpiCard
          label="Sucursales con vacantes"
          value={sucursalesUnicas}
          hint={`En el periodo ${periodoLabel}`}
          icon={<Building2 className="h-4 w-4" />}
          tone="blue"
        />
        <KpiCard
          label="Histórico SIMCO"
          value={vacantes.length}
          hint="Todas las vacantes (sin filtro)"
        />
      </div>

      <SectionCard
        title={`Distribución por estatus · ${periodoLabel}`}
        description={`Universo del periodo (${totalPeriodo} vacantes) · Cerrada · Standby · En Proceso`}
      >
        <FunnelChart data={funnel} />
      </SectionCard>

      <SectionCard
        title={`Abiertas · En Proceso (${periodoLabel})`}
        description={`${abiertas.length} vacantes activamente en reclutamiento`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-teal)]">
            <PlayCircle className="h-4 w-4" />
            En proceso
          </span>
        }
      >
        <VacantesTableServer
          vacantes={abiertas}
          badgeTone="teal"
          emptyMessage={`No hay vacantes ${periodoLabel} activamente en reclutamiento.`}
        />
      </SectionCard>

      <SectionCard
        title={`Standby · ${periodoLabel}`}
        description={`${standby.length} vacantes pausadas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-yellow)]">
            <PauseCircle className="h-4 w-4" />
            Pausadas
          </span>
        }
      >
        <VacantesTableServer
          vacantes={standby}
          badgeTone="amber"
          emptyMessage={`No hay vacantes ${periodoLabel} en standby.`}
        />
      </SectionCard>

      <SectionCard
        title={`Cerradas · ${periodoLabel}`}
        description={`${cerradas.length} vacantes cubiertas o canceladas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
            <CheckCircle2 className="h-4 w-4" />
            Concluidas
          </span>
        }
      >
        <VacantesTableServer
          vacantes={cerradas}
          badgeTone="gray"
          emptyMessage={`No hay vacantes ${periodoLabel} cerradas todavía.`}
        />
      </SectionCard>
    </div>
  );
}
