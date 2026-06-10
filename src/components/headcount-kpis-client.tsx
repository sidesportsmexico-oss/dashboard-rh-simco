"use client";

import { Users, Briefcase } from "lucide-react";
import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { Modal } from "@/components/modal";
import {
  OrganigramaTree,
  JerarquiasResumen,
  VacantesTableModal,
} from "@/components/organigrama-tree";
import type { OrgNode, Jerarquia } from "@/lib/potentor/organigrama";

/** Shape mínimo que necesita la tabla del modal — evita serializar HTML pesado al cliente. */
export interface VacanteSlim {
  vacante_id: string;
  nombre: string;
  puesto: string;
  sucursal: string;
  fecha_creacion: string;
  estatus: string;
  link?: string;
}

interface Props {
  posiciones: number;
  hintPosiciones: string;
  vacantes2026: number;
  hintVacantes: string;
  jerarquias: Jerarquia[];
  organigrama: OrgNode[];
  vacantes: VacanteSlim[];
}

export function HeadcountKpisClient({
  posiciones,
  hintPosiciones,
  vacantes2026,
  hintVacantes,
  jerarquias,
  organigrama,
  vacantes,
}: Props) {
  const [open, setOpen] = useState<"posiciones" | "vacantes" | null>(null);

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
        />
        <ClickableBigCard
          label="Vacantes 2026"
          value={vacantes2026}
          hint={hintVacantes}
          icon={<Briefcase className="h-5 w-5" />}
          accent="orange"
          onClick={() => setOpen("vacantes")}
        />
      </div>

      <Modal
        open={open === "posiciones"}
        onClose={() => setOpen(null)}
        title="Organigrama SIMCO"
        subtitle={`Posiciones por nivel jerárquico · ${posiciones} empleados en plantilla`}
        size="xl"
      >
        <JerarquiasResumen jerarquias={jerarquias} />
        <div className="border-t border-[var(--color-border-subtle)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-baseline justify-between">
            <span>Árbol organizacional</span>
            <span className="text-xs font-normal text-[var(--color-text-dim)]">
              Click en chevron para expandir/colapsar
            </span>
          </h3>
          <OrganigramaTree nodos={organigrama} defaultExpandLevel={2} />
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
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent: "teal" | "orange";
  onClick: () => void;
}) {
  const styles =
    accent === "teal"
      ? {
          border: "border-[var(--color-accent-teal)]/30",
          glow: "shadow-[0_0_36px_-18px_var(--color-accent-teal)]",
          accentColor: "text-[var(--color-accent-teal)]",
          valueColor: "text-[var(--color-text)]",
          hintColor: "text-[var(--color-text-dim)]",
        }
      : {
          border: "border-[var(--color-accent-orange)]/30",
          glow: "shadow-[0_0_36px_-18px_var(--color-accent-orange)]",
          accentColor: "text-[var(--color-accent-orange)]",
          valueColor: "text-[var(--color-text)]",
          hintColor: "text-[var(--color-accent-orange)]/70",
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
