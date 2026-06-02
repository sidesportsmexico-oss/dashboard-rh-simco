import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reclutamiento</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Vacantes abiertas y etapas del proceso de selección
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Vacantes totales"
          value={resumen.total}
          icon={<Briefcase className="h-4 w-4" />}
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
        description={`${vacantes.length} registros`}
      >
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-3 font-medium">Vacante</th>
                <th className="px-6 py-3 font-medium">Puesto</th>
                <th className="px-6 py-3 font-medium">Sucursal</th>
                <th className="px-6 py-3 font-medium">Contratación</th>
                <th className="px-6 py-3 font-medium">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {vacantes.slice(0, 50).map((v) => (
                <tr
                  key={v.vacante_id}
                  className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-6 py-3 font-medium">{v.nombre}</td>
                  <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                    {v.puesto}
                  </td>
                  <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                    {v.sucursal}
                  </td>
                  <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                    {v.contratacion}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">
                      {v.estatus || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vacantes.length > 50 && (
            <p className="px-6 py-3 text-xs text-zinc-500">
              Mostrando primeras 50 de {vacantes.length}. Paginación pendiente.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Cargando…</div>}>
      <ReclutamientoContent />
    </Suspense>
  );
}
