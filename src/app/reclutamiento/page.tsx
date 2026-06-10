import { Suspense } from "react";
import { Briefcase, Building2, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { FunnelChart } from "@/components/funnel-chart";
import { VacantesTableServer } from "@/components/vacantes-table-server";
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

  // Tabla base: vacantes creadas en 2026 ordenadas por fecha desc
  const vacantes2026 = vacantes
    .filter(isVacante2026)
    .sort((a, b) => (b.fecha_creacion ?? "").localeCompare(a.fecha_creacion ?? ""));

  // Split por estatus
  const abiertas = vacantes2026.filter((v) =>
    /en\s*proceso/i.test(v.estatus ?? ""),
  );
  const standby = vacantes2026.filter((v) =>
    /standby/i.test(v.estatus ?? ""),
  );
  const cerradas = vacantes2026.filter((v) =>
    /cerrada|cubierta|cancelada/i.test(v.estatus ?? ""),
  );

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
        title="Abiertas — En Proceso"
        description={`${abiertas.length} vacantes activamente en reclutamiento`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-teal)]">
            <PlayCircle className="h-4 w-4" />
            En proceso
          </span>
        }
      >
        <VacantesTableServer
          vacantes={abiertas}
          badgeTone="teal"
          emptyMessage="No hay vacantes 2026 activamente en reclutamiento."
        />
      </SectionCard>

      <SectionCard
        title="Standby"
        description={`${standby.length} vacantes pausadas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-yellow)]">
            <PauseCircle className="h-4 w-4" />
            Pausadas
          </span>
        }
      >
        <VacantesTableServer
          vacantes={standby}
          badgeTone="amber"
          emptyMessage="No hay vacantes 2026 en standby."
        />
      </SectionCard>

      <SectionCard
        title="Cerradas"
        description={`${cerradas.length} vacantes cubiertas o canceladas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
            <CheckCircle2 className="h-4 w-4" />
            Concluidas
          </span>
        }
      >
        <VacantesTableServer
          vacantes={cerradas}
          badgeTone="gray"
          emptyMessage="No hay vacantes 2026 cerradas todavía."
        />
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
