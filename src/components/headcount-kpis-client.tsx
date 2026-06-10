"use client";

import { Users, Briefcase } from "lucide-react";
import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { Modal } from "@/components/modal";
import {
  JerarquiasResumen,
  VacantesTableModal,
} from "@/components/organigrama-tree";
import { OrgChart } from "@/components/org-chart";
import type { OrgNode, Jerarquia } from "@/lib/potentor/organigrama";

/** Shape mínimo que necesita la tabla del modal — evita serializar HTML pesado al cliente. */
export interface VacanteSlim {
  vacante_id: string;
  nombre: string;
  puesto: string;
  sucursal: string;
  fecha_creacion: string;
  fecha_cierre?: string | null;
  estatus: string;
  link?: string;
}

interface Props {
  posiciones: number;
  hintPosiciones: string;
  /** % de cobertura de plantilla (0-100) — ocupadas / (ocupadas + abiertas). */
  coberturaPct: number;
  /** Vacantes 2026 abiertas (no cerradas). Para mostrar el desglose. */
  vacantesAbiertas: number;
  vacantes2026: number;
  hintVacantes: string;
  /** Vacantes 2026 cerradas. Para el desglose abiertas/cerradas en la card. */
  vacantesCerradas: number;
  jerarquias: Jerarquia[];
  organigrama: OrgNode[];
  vacantes: VacanteSlim[];
}

export function HeadcountKpisClient({
  posiciones,
  hintPosiciones,
  coberturaPct,
  vacantesAbiertas,
  vacantes2026,
  hintVacantes,
  vacantesCerradas,
  jerarquias,
  organigrama,
  vacantes,
}: Props) {
  const [open, setOpen] = useState<"posiciones" | "vacantes" | null>(null);

  const pctAbiertas =
    vacantes2026 > 0
      ? Math.round((vacantesAbiertas / vacantes2026) * 100)
      : 0;
  const pctCerradas =
    vacantes2026 > 0 ? Math.round((vacantesCerradas / vacantes2026) * 100) : 0;
  const estructuraTotal = posiciones + vacantesAbiertas;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClickableBigCard
          label="Posiciones SIMCO"
          value={posiciones}
          hint={hintPosiciones}
          icon={<Users className="h-5 w-5" />}
          accent="teal"
          onClick={() => setOpen("posiciones")}
          progress={{
            pct: coberturaPct,
            primaryLabel: `${coberturaPct}% cobertura`,
            secondaryLabel: `${posiciones} / ${estructuraTotal} ocupadas`,
          }}
        />
        <ClickableBigCard
          label="Vacantes 2026"
          value={vacantes2026}
          hint={hintVacantes}
          icon={<Briefcase className="h-5 w-5" />}
          accent="orange"
          onClick={() => setOpen("vacantes")}
          progress={{
            pct: pctAbiertas,
            primaryLabel: `${pctAbiertas}% abiertas`,
            secondaryLabel: `${pctCerradas}% cerradas`,
          }}
        />
      </div>

      <Modal
        open={open === "posiciones"}
        onClose={() => setOpen(null)}
        title="Organigrama SIMCO"
        subtitle={`Posiciones por nivel jerárquico · ${posiciones} empleados en plantilla`}
        size="full"
      >
        <JerarquiasResumen jerarquias={jerarquias} />
        <div className="border-t border-[var(--color-border-subtle)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 flex items-baseline justify-between">
            <span>Estructura organizacional</span>
            <span className="text-xs font-normal text-[var(--color-text-dim)]">
              Click en cualquier card con chevron para expandir reportes
            </span>
          </h3>
          <p className="text-xs text-[var(--color-text-dim)] mb-5">
            CEO destacado en teal · vacantes en naranja punteado
          </p>
          <OrgChart nodos={organigrama} defaultExpandDepth={2} />
        </div>
      </Modal>

      <Modal
        open={open === "vacantes"}
        onClose={() => setOpen(null)}
        title="Vacantes creadas en 2026"
        subtitle={`${vacantes.length} registros · ordenadas por fecha`}
        size="xl"
      >
        {vacantes.length === 0 ? (
          <p className="text-sm text-[var(--color-text-dim)] py-4">
            No hay vacantes registradas con fecha de creación en 2026.
          </p>
        ) : (
          <VacantesTableModal vacantes={vacantes} />
        )}
      </Modal>
    </>
  );
}

function ClickableBigCard({
  label,
  value,
  hint,
  icon,
  accent,
  onClick,
  progress,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent: "teal" | "orange";
  onClick: () => void;
  progress?: {
    pct: number;
    primaryLabel: string;
    secondaryLabel?: string;
  };
}) {
  const styles =
    accent === "teal"
      ? {
          border: "border-[var(--color-accent-teal)]/30",
          glow: "shadow-[0_0_36px_-18px_var(--color-accent-teal)]",
          accentColor: "text-[var(--color-accent-teal)]",
          valueColor: "text-[var(--color-text)]",
          hintColor: "text-[var(--color-text-dim)]",
          barFill: "bg-[var(--color-accent-teal)]",
        }
      : {
          border: "border-[var(--color-accent-orange)]/30",
          glow: "shadow-[0_0_36px_-18px_var(--color-accent-orange)]",
          accentColor: "text-[var(--color-accent-orange)]",
          valueColor: "text-[var(--color-text)]",
          hintColor: "text-[var(--color-accent-orange)]/70",
          barFill: "bg-[var(--color-accent-orange)]",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left rounded-2xl border bg-[var(--color-bg-card)] p-8 flex flex-col gap-4 transition-all cursor-pointer hover:bg-[var(--color-bg-elevated)] hover:scale-[1.005] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-teal)] ${styles.border} ${styles.glow}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-medium uppercase tracking-[0.18em] ${styles.accentColor}`}
        >
          {label}
        </span>
        <span className={styles.accentColor}>{icon}</span>
      </div>
      <p
        className={`text-6xl font-semibold tracking-tight tabular-nums ${styles.valueColor}`}
      >
        {formatNumber(value)}
      </p>

      {progress && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${styles.barFill}`}
              style={{ width: `${Math.min(Math.max(progress.pct, 0), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] tabular-nums">
            <span className={`font-medium ${styles.accentColor}`}>
              {progress.primaryLabel}
            </span>
            {progress.secondaryLabel && (
              <span className="text-[var(--color-text-dim)]">
                {progress.secondaryLabel}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs ${styles.hintColor}`}>{hint}</p>
        <span
          className={`text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${styles.accentColor}`}
        >
          Ver detalle →
        </span>
      </div>
    </button>
  );
}
