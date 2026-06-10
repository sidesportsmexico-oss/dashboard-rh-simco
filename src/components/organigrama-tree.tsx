"use client";

import { ChevronRight, User, UserX } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { OrgNode } from "@/lib/potentor/organigrama";

interface OrgTreeProps {
  nodos: OrgNode[];
  /** Profundidad inicial expandida (todos los nodos por debajo se colapsan). */
  defaultExpandLevel?: number;
}

export function OrganigramaTree({
  nodos,
  defaultExpandLevel = 2,
}: OrgTreeProps) {
  return (
    <ul className="space-y-1">
      {nodos.map((n) => (
        <OrgNodeItem
          key={n.clave}
          nodo={n}
          depth={0}
          defaultExpandLevel={defaultExpandLevel}
        />
      ))}
    </ul>
  );
}

function OrgNodeItem({
  nodo,
  depth,
  defaultExpandLevel,
}: {
  nodo: OrgNode;
  depth: number;
  defaultExpandLevel: number;
}) {
  const [open, setOpen] = useState(depth < defaultExpandLevel);
  const hasChildren = nodo.hijos.length > 0;
  const isVacante = !nodo.empleado || /n\/?a/i.test(nodo.empleado);

  return (
    <li>
      <div
        className="group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-[var(--color-bg-elevated)] transition-colors"
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-sm p-0.5 hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)]"
            aria-label={open ? "Colapsar" : "Expandir"}
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${
                open ? "rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="shrink-0">
          {isVacante ? (
            <UserX className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
          ) : (
            <User className="h-3.5 w-3.5 text-[var(--color-accent-teal)]" />
          )}
        </span>
        <span className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-medium text-[var(--color-text)] uppercase tracking-tight">
            {nodo.puesto}
          </span>
          <span
            className={`text-xs ${
              isVacante
                ? "text-[var(--color-accent-orange)] italic"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {isVacante ? "Vacante" : nodo.empleado}
          </span>
        </span>
        <span className="shrink-0 text-[10px] font-mono text-[var(--color-text-dim)]">
          {nodo.clave}
        </span>
      </div>
      {hasChildren && open && (
        <ul>
          {nodo.hijos.map((h) => (
            <OrgNodeItem
              key={h.clave}
              nodo={h}
              depth={depth + 1}
              defaultExpandLevel={defaultExpandLevel}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Card de resumen por nivel jerárquico para el modal de Posiciones. */
export function JerarquiasResumen({
  jerarquias,
}: {
  jerarquias: { nombre: string; orden: string; cantidad_puestos: number }[];
}) {
  const ordered = [...jerarquias].sort(
    (a, b) => Number(a.orden) - Number(b.orden),
  );
  const total = ordered.reduce((acc, j) => acc + (j.cantidad_puestos ?? 0), 0);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {ordered.map((j) => {
        const pct = total > 0 ? (j.cantidad_puestos / total) * 100 : 0;
        return (
          <div
            key={j.nombre}
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/40 p-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] truncate">
                {j.nombre}
              </span>
              <span className="text-lg font-semibold tabular-nums text-[var(--color-text)]">
                {j.cantidad_puestos}
              </span>
            </div>
            <div className="mt-2 h-1 bg-[var(--color-bg-base)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent-teal)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface VacantesTableProps {
  vacantes: {
    vacante_id: string;
    nombre: string;
    puesto: string;
    sucursal: string;
    fecha_creacion: string;
    estatus: string;
    link?: string;
  }[];
}

/** Tabla de vacantes para el modal. */
export function VacantesTableModal({ vacantes }: VacantesTableProps) {
  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
            <th className="px-6 py-3 font-medium">Vacante</th>
            <th className="px-6 py-3 font-medium">Puesto</th>
            <th className="px-6 py-3 font-medium">Fecha</th>
            <th className="px-6 py-3 font-medium">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {vacantes.map((v) => {
            const closed = /cerrada|cubierta|cancelada/i.test(v.estatus ?? "");
            return (
              <tr
                key={v.vacante_id}
                className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-elevated)]/40 transition-colors"
              >
                <td className="px-6 py-2.5 font-medium text-[var(--color-text)]">
                  {v.link ? (
                    <a
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[var(--color-accent-teal)]"
                    >
                      {v.nombre}
                    </a>
                  ) : (
                    v.nombre
                  )}
                </td>
                <td className="px-6 py-2.5 text-[var(--color-text-muted)]">
                  {v.puesto}
                </td>
                <td className="px-6 py-2.5 text-[var(--color-text-dim)] tabular-nums text-xs">
                  {v.fecha_creacion}
                </td>
                <td className="px-6 py-2.5">
                  <Badge closed={closed}>{v.estatus || "—"}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ closed, children }: { closed: boolean; children: ReactNode }) {
  return (
    <span
      className={
        closed
          ? "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-dim)]"
          : "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 px-2.5 py-0.5 text-xs text-[var(--color-accent-teal)]"
      }
    >
      <span
        className={
          closed
            ? "h-1.5 w-1.5 rounded-full bg-[var(--color-text-dim)]"
            : "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)]"
        }
      />
      {children}
    </span>
  );
}
