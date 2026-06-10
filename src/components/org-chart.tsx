"use client";

import { ChevronDown, ChevronUp, UserX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { OrgNode } from "@/lib/potentor/organigrama";
import { toTitleCase } from "@/lib/utils";

interface OrgChartProps {
  nodos: OrgNode[];
  /** Profundidad inicial expandida (0 = solo raíz, 2 = raíz + 2 niveles). */
  defaultExpandDepth?: number;
}

/**
 * Organigrama visual estilo infografía: cards conectadas por líneas, layout
 * top-down, CEO destacado, vacantes con borde naranja punteado.
 *
 * Toda la familia está envuelta en overflow-x-auto para árboles anchos —
 * y auto-scroll horizontal al centro cuando se monta (donde está el CEO).
 */
export function OrgChart({ nodos, defaultExpandDepth = 2 }: OrgChartProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Pequeño delay para que el browser termine de medir el contenido renderizado
    const id = setTimeout(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) {
        el.scrollLeft = maxScroll / 2;
      }
    }, 50);
    return () => clearTimeout(id);
  }, [nodos]);

  if (nodos.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-dim)]">
        Organigrama vacío
      </p>
    );
  }
  return (
    <div ref={scrollerRef} className="overflow-x-auto pb-6">
      <div className="min-w-fit mx-auto py-2 px-4">
        {nodos.map((n) => (
          <OrgChartNode key={n.clave} nodo={n} depth={0} defaultExpandDepth={defaultExpandDepth} />
        ))}
      </div>
    </div>
  );
}

function OrgChartNode({
  nodo,
  depth,
  defaultExpandDepth,
}: {
  nodo: OrgNode;
  depth: number;
  defaultExpandDepth: number;
}) {
  const [expanded, setExpanded] = useState(depth < defaultExpandDepth);
  const hasChildren = nodo.hijos.length > 0;

  return (
    <div className="flex flex-col items-center min-w-fit">
      <OrgChartCard
        nodo={nodo}
        depth={depth}
        hasChildren={hasChildren}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />

      {hasChildren && expanded && (
        <>
          {/* Vertical line from card to children row */}
          <div className="w-px h-7 bg-[var(--color-border)]" aria-hidden />

          {/* Children row + horizontal connector */}
          <div className="flex items-start gap-6 px-2">
            {nodo.hijos.map((h, i) => {
              const isFirst = i === 0;
              const isLast = i === nodo.hijos.length - 1;
              const single = nodo.hijos.length === 1;
              return (
                <div
                  key={h.clave}
                  className="relative flex flex-col items-center"
                >
                  {/* Horizontal connector (top half / left-right depending on position) */}
                  {!single && (
                    <div
                      className={`absolute top-0 h-px bg-[var(--color-border)] ${
                        isFirst
                          ? "left-1/2 right-0"
                          : isLast
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                      }`}
                      aria-hidden
                    />
                  )}
                  {/* Vertical line from horizontal connector down to card */}
                  <div className="w-px h-7 bg-[var(--color-border)]" aria-hidden />
                  <OrgChartNode
                    nodo={h}
                    depth={depth + 1}
                    defaultExpandDepth={defaultExpandDepth}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** Una posición es vacante si el empleado está vacío o es exactamente "N/A". */
function esVacante(empleado: string): boolean {
  const trimmed = (empleado ?? "").trim();
  if (!trimmed) return true;
  return /^n\s*\/?\s*a$/i.test(trimmed);
}

function OrgChartCard({
  nodo,
  depth,
  hasChildren,
  expanded,
  onToggle,
}: {
  nodo: OrgNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isVacante = esVacante(nodo.empleado);
  const isRoot = depth === 0;
  const initials = getInitials(nodo.empleado);

  const cardClasses = `
    relative flex flex-col items-center text-center
    rounded-xl px-3 py-3 min-w-[160px] max-w-[180px]
    border bg-[var(--color-bg-card)]
    transition-all
    ${
      isRoot
        ? "border-[var(--color-accent-teal)]/45 shadow-[0_0_28px_-12px_var(--color-accent-teal)]"
        : depth === 1
          ? "border-[var(--color-accent-blue)]/30"
          : "border-[var(--color-border)]"
    }
    ${
      isVacante
        ? "!border-dashed !border-[var(--color-accent-orange)]/55 bg-[var(--color-accent-orange)]/5"
        : ""
    }
  `;

  const avatarClasses = isVacante
    ? "bg-[var(--color-accent-orange)]/20 text-[var(--color-accent-orange)] border-2 border-dashed border-[var(--color-accent-orange)]/50"
    : isRoot
      ? "bg-[var(--color-accent-teal)] text-[var(--color-bg-base)]"
      : depth === 1
        ? "bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)]"
        : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]";

  return (
    <div className={cardClasses}>
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold mb-2 ${avatarClasses}`}
      >
        {isVacante ? <UserX className="h-4 w-4" /> : initials}
      </div>
      <p className="text-[10px] tracking-tight font-semibold text-[var(--color-text-dim)] leading-tight line-clamp-2">
        {toTitleCase(nodo.puesto)}
      </p>
      <p
        className={`text-xs font-medium mt-1.5 leading-tight line-clamp-2 ${
          isVacante
            ? "text-[var(--color-accent-orange)] italic"
            : "text-[var(--color-text)]"
        }`}
      >
        {isVacante ? "Vacante" : toTitleCase(nodo.empleado)}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-wide">
          {nodo.clave}
        </span>
        {hasChildren && (
          <span className="text-[9px] font-medium text-[var(--color-text-dim)]">
            · {countAllChildren(nodo)} reportes
          </span>
        )}
      </div>

      {/* Toggle expand/collapse */}
      {hasChildren && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Colapsar subordinados" : "Expandir subordinados"}
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10
                     rounded-full p-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]
                     text-[var(--color-text-dim)] hover:text-[var(--color-text)]
                     hover:bg-[var(--color-bg-card)] transition-colors cursor-pointer
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-teal)]"
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const cleaned = (name ?? "").trim();
  if (esVacante(cleaned)) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Primer letra de primer nombre + primera letra del último apellido
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function countAllChildren(nodo: OrgNode): number {
  let total = 0;
  for (const h of nodo.hijos) {
    total += 1 + countAllChildren(h);
  }
  return total;
}
