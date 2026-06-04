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
  isVacanteEnReclutamiento,
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

  // El listado de la tabla solo muestra las vacantes 2026 (En Proceso).
  // El CEO no quiere ver Cerradas ni Standby en la tabla principal.
  const vacantesTabla = vacantes.filter(isVacanteEnReclutamiento);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reclutamiento"
        subtitle="Vacantes activamente en reclutamiento · 2026"
        tags={["Vista CEO", "SIMCO", "Potentor /reclutamiento"]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Vacantes 2026"
          value={resumen.enReclutamiento}
          hint="Activamente en reclutamiento"
          icon={<Briefcase className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          label="Sucursales reclutando"
          value={resumen.porSucursal2026.size}
          icon={<Building2 className="h-4 w-4" />}
          tone="blue"
        />
        <KpiCard
          label="Histórico SIMCO"
          value={resumen.total}
          hint={`${resumen.total - resumen.enReclutamiento} entre Cerradas y Standby`}
        />
      </div>

      <SectionCard
        title="Distribución histórica por estatus"
        description="Universo completo de vacantes SIMCO (Cerrada · Standby · En Proceso)"
      >
        <FunnelChart data={funnel} />
      </SectionCard>

      <SectionCard
        title="Vacantes 2026 en reclutamiento"
        description={`${vacantesTabla.length} registros activos`}
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
                  <th className="px-6 py-3 font-medium">Localidad</th>
                  <th className="px-6 py-3 font-medium">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {vacantesTabla.slice(0, 50).map((v) => (
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
                    <td className="px-6 py-3 text-[var(--color-text-muted)]">
                      {v.localidad || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 px-2.5 py-0.5 text-xs text-[var(--color-accent-teal)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)]" />
                        {v.estatus || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
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
