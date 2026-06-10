import type { Vacante } from "@/lib/potentor/types";

interface Props {
  vacantes: Vacante[];
  /** Color del badge de estatus: teal (activa), amber (standby), gray (cerrada). */
  badgeTone: "teal" | "amber" | "gray";
  emptyMessage?: string;
}

/**
 * Tabla de vacantes — server component, renderiza el listado con columnas
 * Vacante / Puesto / Sucursal / Fecha creación / Estatus. Las primeras 50
 * filas, con paginación pendiente.
 */
export function VacantesTableServer({
  vacantes,
  badgeTone,
  emptyMessage = "No hay vacantes en esta categoría.",
}: Props) {
  if (vacantes.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-dim)] py-4">{emptyMessage}</p>
    );
  }

  const badgeClasses =
    badgeTone === "teal"
      ? "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 px-2.5 py-0.5 text-xs text-[var(--color-accent-teal)]"
      : badgeTone === "amber"
        ? "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-yellow)]/10 border border-[var(--color-accent-yellow)]/35 px-2.5 py-0.5 text-xs text-[var(--color-accent-yellow)]"
        : "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-dim)]";

  const dotClasses =
    badgeTone === "teal"
      ? "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)]"
      : badgeTone === "amber"
        ? "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-yellow)]"
        : "h-1.5 w-1.5 rounded-full bg-[var(--color-text-dim)]";

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
            <th className="px-6 py-3 font-medium">Vacante</th>
            <th className="px-6 py-3 font-medium">Puesto</th>
            <th className="px-6 py-3 font-medium">Sucursal</th>
            <th className="px-6 py-3 font-medium">Fecha creación</th>
            <th className="px-6 py-3 font-medium">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {vacantes.slice(0, 50).map((v) => (
            <tr
              key={v.vacante_id}
              className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
            >
              <td className="px-6 py-3 font-medium text-[var(--color-text)]">
                {v.link ? (
                  <a
                    href={v.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--color-accent-teal)] hover:underline"
                  >
                    {v.nombre}
                  </a>
                ) : (
                  v.nombre
                )}
              </td>
              <td className="px-6 py-3 text-[var(--color-text-muted)]">
                {v.puesto}
              </td>
              <td className="px-6 py-3 text-[var(--color-text-muted)]">
                {v.sucursal}
              </td>
              <td className="px-6 py-3 text-[var(--color-text-muted)] tabular-nums text-xs">
                {v.fecha_creacion || "—"}
              </td>
              <td className="px-6 py-3">
                <span className={badgeClasses}>
                  <span className={dotClasses} />
                  {v.estatus || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {vacantes.length > 50 && (
        <p className="px-6 py-3 text-xs text-[var(--color-text-dim)]">
          Mostrando primeras 50 de {vacantes.length}. Paginación pendiente.
        </p>
      )}
    </div>
  );
}
