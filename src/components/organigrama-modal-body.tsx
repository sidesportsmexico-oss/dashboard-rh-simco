"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import {
  JerarquiasResumen,
  EmpleadosPorJerarquiaTable,
} from "@/components/organigrama-tree";
import { OrgChart } from "@/components/org-chart";
import type { OrgNode, Jerarquia } from "@/lib/potentor/organigrama";
import type { EmpleadoSlim } from "@/lib/potentor/headcount";

interface Props {
  jerarquias: Jerarquia[];
  organigrama: OrgNode[];
  empleados: EmpleadoSlim[];
}

/**
 * Body completo del modal "Organigrama SIMCO" — extraído para reuso
 * entre /overview (KpiCardClickable) y /headcount (HeadcountKpisClient).
 *
 * Maneja internamente:
 *  - JerarquiasResumen con onSelect callback → abre nested modal
 *  - Modal anidado con tabla de personas filtrada por jerarquía
 *  - OrgChart estructural
 */
export function OrganigramaModalBody({
  jerarquias,
  organigrama,
  empleados,
}: Props) {
  const [jerarquiaSel, setJerarquiaSel] = useState<string | null>(null);

  const empleadosFiltrados =
    jerarquiaSel == null
      ? []
      : empleados.filter(
          (e) => e.jerarquia.toUpperCase() === jerarquiaSel.toUpperCase(),
        );

  return (
    <>
      <JerarquiasResumen
        jerarquias={jerarquias}
        onSelect={(j) => setJerarquiaSel(j)}
      />
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

      <Modal
        open={jerarquiaSel != null}
        onClose={() => setJerarquiaSel(null)}
        title={`Jerarquía · ${jerarquiaSel ?? ""}`}
        subtitle={`${empleadosFiltrados.length} persona${empleadosFiltrados.length === 1 ? "" : "s"} ocupando este nivel`}
        size="xl"
      >
        <EmpleadosPorJerarquiaTable empleados={empleadosFiltrados} />
      </Modal>
    </>
  );
}
