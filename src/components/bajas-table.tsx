import type { BajaSucursal, BajaCorporativo } from "@/lib/bajas/types";
import { esVoluntaria } from "@/lib/bajas/helpers";

interface Props {
  bajas: (BajaSucursal | BajaCorporativo)[];
  /** Si true, muestra columna Sucursal. Si false, muestra Departamento. */
  modo: "sucursal" | "departamento";
  emptyMessage?: string;
}

function esBajaSucursal(b: BajaSucursal | BajaCorporativo): b is BajaSucursal {
  return "sucursal" in b;
}

export function BajasTable({
  bajas,
  modo,
  emptyMessage = "Sin bajas en esta categoría.",
}: Props) {
  if (bajas.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-dim)] py-4">
        {emptyMessage}
      </p>
    );
  }

  return (
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
          {bajas.slice(0, 100).map((b, i) => {
            const voluntaria = esVoluntaria(b);
            const motivo =
              b.motivo_voluntaria?.trim() || b.motivo_involuntaria?.trim() || "—";
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
      {bajas.length > 100 && (
        <p className="px-6 py-3 text-xs text-[var(--color-text-dim)]">
          Mostrando primeras 100 de {bajas.length}. Paginación pendiente.
        </p>
      )}
    </div>
  );
}
