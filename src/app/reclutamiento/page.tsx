import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { FunnelChart } from "@/components/funnel-chart";
import {
  getVacantes,
  resumenVacantes,
  buildFunnelDesdeVacantes,
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

  // Tabla: excluir Standby (el CEO no las considera vigentes para el listado).
  // KPIs y funnel mantienen la vista completa para no perder contexto.
  const vacantesTabla = vacantes.filter(
    (v) => !/standby/i.test(v.estatus ?? ""),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reclutamiento"
        subtitle="Vacantes abiertas y etapas del proceso de selección"
        tags={["Pipeline 2026", "Potentor /reclutamiento"]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Vacantes totales"
          value={resumen.total}
          icon={<Briefcase className="h-4 w-4" />}
          tone="teal"
        />
        <KpiCard
          label="Vacantes abiertas"
          value={resumen.abiertas}
          hint={`${resumen.total - resumen.abiertas} cerradas/canceladas`}
          tone="warning"
        />
        <KpiCard
          label="Sucursales con vacantes"
          value={resumen.porSucursal.size}
          tone="blue"
        />
      </div>

      <SectionCard
        title="Pipeline por estatus"
        description="Distribución de vacantes según su etapa actual"
      >
        <FunnelChart data={funnel} />
      </SectionCard>

      <SectionCard
        title="Listado de vacantes"
        description={`${vacantesTabla.length} registros (excluye Standby)`}
      >
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
                <th className="px-6 py-3 font-medium">Vacante</th>
                <th className="px-6 py-3 font-medium">Puesto</th>
                <th className="px-6 py-3 font-medium">Sucursal</th>
                <th className="px-6 py-3 font-medium">Contratación</th>
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
                    {v.contratacion}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-muted)]">
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
