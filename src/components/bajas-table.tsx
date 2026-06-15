"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BajaSucursal, BajaCorporativo } from "@/lib/bajas/types";
import { esVoluntaria } from "@/lib/bajas/helpers";

interface Props {
  bajas: (BajaSucursal | BajaCorporativo)[];
  /** Si "sucursal" muestra columna Sucursal. Si "departamento", Depto. */
  modo: "sucursal" | "departamento";
  emptyMessage?: string;
  /** Cuántas filas por página (default 10). */
  pageSize?: number;
}

function esBajaSucursal(b: BajaSucursal | BajaCorporativo): b is BajaSucursal {
  return "sucursal" in b;
}

export function BajasTable({
  bajas,
  modo,
  emptyMessage = "Sin bajas en esta categoría.",
  pageSize = 10,
}: Props) {
  const [page, setPage] = useState(1);
  const total = bajas.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset al cambiar el dataset (e.g. switch de tab).
  useEffect(() => {
    setPage(1);
  }, [total]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return bajas.slice(start, start + pageSize);
  }, [bajas, page, pageSize]);

  if (total === 0) {
    return (
      <p className="text-sm text-[var(--color-text-dim)] py-4">{emptyMessage}</p>
    );
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Puesto</th>
              <th className="px-6 py-3 font-medium">
                {modo === "sucursal" ? "Sucursal" : "Departamento"}
              </th>
              <th className="px-6 py-3 font-medium">Ingreso</th>
              <th className="px-6 py-3 font-medium">Salida</th>
              <th className="px-6 py-3 font-medium">Tiempo</th>
              <th className="px-6 py-3 font-medium">Motivo</th>
              <th className="px-6 py-3 font-medium">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((b, i) => {
              const voluntaria = esVoluntaria(b);
              const motivo =
                b.motivo_voluntaria?.trim() ||
                b.motivo_involuntaria?.trim() ||
                "—";
              const lugar = esBajaSucursal(b) ? b.sucursal : b.departamento;
              return (
                <tr
                  key={`${b.nombre}-${b.fecha_salida}-${i}`}
                  className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                >
                  <td className="px-6 py-2.5 font-medium text-[var(--color-text)]">
                    {b.nombre}
                  </td>
                  <td className="px-6 py-2.5 text-[var(--color-text-muted)]">
                    {b.puesto || "—"}
                  </td>
                  <td className="px-6 py-2.5 text-[var(--color-text-muted)]">
                    {lugar || "—"}
                  </td>
                  <td className="px-6 py-2.5 text-[var(--color-text-dim)] tabular-nums text-xs">
                    {b.fecha_ingreso || "—"}
                  </td>
                  <td className="px-6 py-2.5 text-[var(--color-text-dim)] tabular-nums text-xs">
                    {b.fecha_salida || "—"}
                  </td>
                  <td className="px-6 py-2.5 text-[var(--color-text-muted)] text-xs">
                    {b.tiempo || "—"}
                  </td>
                  <td className="px-6 py-2.5 text-[var(--color-text-muted)] text-xs max-w-[200px] truncate">
                    {motivo}
                  </td>
                  <td className="px-6 py-2.5">
                    <span
                      className={
                        voluntaria
                          ? "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-yellow)]/10 border border-[var(--color-accent-yellow)]/35 px-2.5 py-0.5 text-xs text-[var(--color-accent-yellow)]"
                          : "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/35 px-2.5 py-0.5 text-xs text-[var(--color-accent-red)]"
                      }
                    >
                      <span
                        className={
                          voluntaria
                            ? "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-yellow)]"
                            : "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-red)]"
                        }
                      />
                      {voluntaria ? "Voluntaria" : "Involuntaria"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between gap-3 px-6 pt-1 text-xs text-[var(--color-text-dim)]">
          <span className="tabular-nums">
            Mostrando <span className="text-[var(--color-text-muted)]">{start}-{end}</span> de{" "}
            <span className="text-[var(--color-text-muted)]">{total}</span>
          </span>
          <Pager
            page={page}
            totalPages={totalPages}
            onChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Controles de paginación: ‹ Prev · 1 2 … N · Next ›
 * Compacto, con números clickeables y elipsis cuando son muchas.
 */
function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = compactPages(page, totalPages);
  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="px-1 text-[var(--color-text-dim)] select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={
              p === page
                ? "inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-md border border-[var(--color-accent-teal)]/40 bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] text-xs font-medium tabular-nums cursor-pointer"
                : "inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] text-xs tabular-nums cursor-pointer transition-colors"
            }
            aria-current={p === page ? "page" : undefined}
            aria-label={`Página ${p}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}

/**
 * Devuelve secuencia compacta: [1, ..., page-1, page, page+1, ..., total]
 * Con elipsis cuando hay saltos. Siempre incluye 1 y total.
 */
function compactPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
