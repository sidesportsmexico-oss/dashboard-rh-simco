"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/components/modal";
import { EcoDistribucionBar } from "@/components/eco-distribucion-bar";
import { colorByScore } from "@/lib/eco/helpers";
import type { EcoMacrodimension } from "@/lib/eco/types";

/**
 * Card de macro-dimensión clickeable. Al hacer click, abre modal con
 * sub-dimensiones y sus preguntas (con distribución Op1-Op4 stacked bar).
 */
export function EcoMacroCard({ macro }: { macro: EcoMacrodimension }) {
  const [open, setOpen] = useState(false);
  const color = colorByScore(macro.score);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-3 cursor-pointer transition-all hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent-teal)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-teal)]"
        style={{
          boxShadow: `0 0 24px -16px ${color}`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] line-clamp-2">
            {macro.nombre}
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--color-text-dim)] group-hover:text-[var(--color-accent-teal)] transition-colors shrink-0" />
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-4xl font-semibold tabular-nums"
            style={{ color }}
          >
            {macro.score}
          </span>
          <span className="text-sm text-[var(--color-text-dim)]">%</span>
        </div>
        <div className="text-[11px] text-[var(--color-text-dim)]">
          {macro.subdimensiones.length} sub-dimensiones ·{" "}
          {macro.subdimensiones.reduce((acc, s) => acc + s.items.length, 0)}{" "}
          preguntas
        </div>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={macro.nombre}
        subtitle={`Score ${macro.score}% · ${macro.subdimensiones.length} sub-dimensiones`}
        size="xl"
      >
        <div className="space-y-6">
          {macro.subdimensiones.map((sub) => (
            <section key={sub.nombre} className="space-y-3">
              <header className="flex items-baseline justify-between gap-3 pb-2 border-b border-[var(--color-border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {sub.nombre}
                </h3>
                <span
                  className="text-base font-semibold tabular-nums"
                  style={{ color: colorByScore(sub.score) }}
                >
                  {sub.score}%
                </span>
              </header>
              <ul className="space-y-3">
                {sub.items.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs text-[var(--color-text-muted)] leading-snug">
                        {item.texto}
                      </p>
                      <span
                        className="text-xs font-semibold tabular-nums shrink-0"
                        style={{ color: colorByScore(item.score) }}
                      >
                        {item.score.toFixed(1)}%
                      </span>
                    </div>
                    <EcoDistribucionBar
                      dist={item.dist}
                      showLabels
                      height={6}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Modal>
    </>
  );
}
