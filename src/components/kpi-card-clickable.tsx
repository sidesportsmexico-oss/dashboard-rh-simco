"use client";

import { useState, type ReactNode } from "react";
import { KpiCard } from "@/components/kpi-card";
import { Modal } from "@/components/modal";

interface KpiCardClickableProps {
  label: string;
  value: number | string | null | undefined;
  hint?: string;
  trend?: { delta: number; suffix?: string };
  icon?: ReactNode;
  tone?: "default" | "teal" | "blue" | "warning" | "danger" | "success";
  modalTitle: string;
  modalSubtitle?: string;
  modalSize?: "md" | "lg" | "xl" | "full";
  children: ReactNode; // contenido del modal
}

/**
 * Wrap de KpiCard con click handler + modal. Server components pasan el contenido
 * del modal como children; OrganigramaTree, VacantesTableModal, etc. son client
 * components y funcionan dentro.
 */
export function KpiCardClickable({
  modalTitle,
  modalSubtitle,
  modalSize = "xl",
  children,
  ...kpiProps
}: KpiCardClickableProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-teal)] rounded-xl group"
        aria-haspopup="dialog"
      >
        <KpiCard {...kpiProps} className="group-hover:scale-[1.01] transition-transform" />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={modalTitle}
        subtitle={modalSubtitle}
        size={modalSize}
      >
        {children}
      </Modal>
    </>
  );
}
