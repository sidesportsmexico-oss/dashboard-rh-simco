import { Suspense } from "react";
import { Briefcase, Building2 } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { FunnelChart } from "@/components/funnel-chart";
import {
  getVacantes,
  resumenVacantes,
  buildFunnelDesdeVacantes,
  isVacante2026,
} from "@/lib/potentor/reclutamiento";

export const revalidate = 600;

async function ReclutamientoContent() {
  let vacantes;
  try {
    vacantes = await getVacantes();
  } catch (err) {
    return (
      <ErrorBanner
        title="No se pudo cargar Reclutamiento"
        detail={err instanceof Error ? err.message : String(err)}
      />
    );
  }

  const resumen = resumenVacantes(vacantes);
  const funnel = buildFunnelDesdeVacantes(vacantes);

  // El listado de la tabla muestra solo las vacantes creadas en 2026
  // (fecha_creacion real desde que Potentor lo agregó al endpoint).
  const vacantesTabla = vacantes
    .filter(isVacante2026)
    .sort((a, b) => (b.fecha_creacion ?? "").localeCompare(a.fecha_creacion ?? ""));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reclutamiento"
        subtitle="Vacantes creadas en 2026 · filtradas por fecha_creacion real"
        tags={["Vista CEO", "SIMCO"]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Vacantes 2026"
          value={resumen.vacantes2026}
          hint="Creadas este año"
          icon={<Briefcase className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          label="2026 abiertas"
          value={resumen.abiertas2026}
          hint={`${resumen.vacantes2026 - resumen.abiertas2026} ya cerradas`}
          tone="warning"
        />
        <KpiCard
          label="Sucursales con 2026"
          value={resumen.porSucursal2026.size}
          icon={<Building2 className="h-4 w-4" />}
          tone="blue"
        />
        <KpiCard
          label="Histórico SIMCO"
          value={resumen.total}
          hint="Todas las vacantes en el sistema"
        />
      </div>

      <SectionCard
        title="Distribución histórica por estatus"
        description="Universo completo de vacantes SIMCO (Cerrada · Standby · En Proceso)"
      >
        <FunnelChart data={funnel} />
      </SectionCard>

      <SectionCard
        title="Vacantes creadas en 2026"
        description={`${vacantesTabla.length} registros · ordenadas por fecha (más recientes primero)`}
      >
        {vacantesTabla.length === 0 ? (
          <p className="text-sm text-[var(--color-text-dim)] py-4">
            No hay vacantes en proceso de reclutamiento en este momento.
          </p>
        ) : (
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
                {vacantesTabla.slice(0, 50).map((v) => {
                  const isClosed = /cerrada|cubierta|cancelada/i.test(v.estatus ?? "");
                  return (
                    <tr
                      key={v.vacante_id}
                      className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-[var(--color-text)]">
                        {v.nombre}
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
                        <span
                          className={
                            isClosed
                              ? "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-dim)]"
                              : "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 px-2.5 py-0.5 text-xs text-[var(--color-accent-teal)]"
                          }
                        >
                          <span
                            className={
                              isClosed
                                ? "h-1.5 w-1.5 rounded-full bg-[var(--color-text-dim)]"
                                : "h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)]"
                            }
                          />
                          {v.estatus || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {vacantesTabla.length > 50 && (
              <p className="px-6 py-3 text-xs text-[var(--color-text-dim)]">
                Mostrando primeras 50 de {vacantesTabla.length}. Paginación pendiente.
              </p>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-[var(--color-text-dim)]">Cargando…</div>
      }
    >
      <ReclutamientoContent />
    </Suspense>
  );
}
