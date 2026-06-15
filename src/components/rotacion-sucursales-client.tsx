"use client";

import { useState, useMemo } from "react";
import { BajasTable } from "@/components/bajas-table";
import type { BajaSucursal } from "@/lib/bajas/types";

const TABS = [
  { id: "general", label: "General", filter: null },
  { id: "mulligans", label: "Mulligans", filter: "Mulligans" },
  { id: "batbox", label: "Batbox", filter: "Batbox" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  bajas: BajaSucursal[];
}

export function RotacionSucursalesClient({ bajas }: Props) {
  const [tab, setTab] = useState<TabId>("general");

  const filtradas = useMemo(() => {
    const def = TABS.find((t) => t.id === tab);
    if (!def?.filter) return bajas;
    const target = def.filter.toLowerCase();
    return bajas.filter(
      (b) => (b.sucursal ?? "").toLowerCase().trim() === target,
    );
  }, [bajas, tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border-subtle)] pb-2">
        {TABS.map((t) => {
          const count = t.filter
            ? bajas.filter(
                (b) =>
                  (b.sucursal ?? "").toLowerCase().trim() ===
                  t.filter!.toLowerCase(),
              ).length
            : bajas.length;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border bg-[var(--color-accent-teal)]/15 border-[var(--color-accent-teal)]/40 text-[var(--color-accent-teal)] cursor-pointer transition-all"
                  : "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
              }
            >
              {t.label}
              <span
                className={
                  active
                    ? "tabular-nums rounded-full bg-[var(--color-accent-teal)]/25 px-1.5 py-0 text-[10px]"
                    : "tabular-nums rounded-full bg-[var(--color-bg-elevated)] px-1.5 py-0 text-[10px]"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <BajasTable
        bajas={filtradas}
        modo="sucursal"
        emptyMessage="Sin bajas en esta categoría."
      />
    </div>
  );
}
