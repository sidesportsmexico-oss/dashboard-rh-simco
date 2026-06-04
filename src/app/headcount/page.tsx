import { Suspense } from "react";
import { Users, Briefcase } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { formatNumber } from "@/lib/utils";
import {
  getHeadcountReporte,
  resumenHeadcount,
} from "@/lib/potentor/headcount";
import { getVacantes, resumenVacantes } from "@/lib/potentor/reclutamiento";

export const revalidate = 600;

async function Content() {
  const [hcRes, vacRes] = await Promise.allSettled([
    getHeadcountReporte(),
    getVacantes(),
  ]);

  if (hcRes.status === "rejected") {
    return (
      <ErrorBanner
        title="No se pudo cargar Head Count"
        detail={String(hcRes.reason)}
      />
    );
  }

  const headcount = hcRes.value;
  const vacantes = vacRes.status === "fulfilled" ? vacRes.value : [];
  const hcResumen = resumenHeadcount(headcount);
  const vacResumen = resumenVacantes(vacantes);

  // Para cobertura: usamos las vacantes 2026 (En Proceso) como "abiertas" reales.
  // Standby no son posiciones que estemos buscando ocupar ahora.
  const vacantesAbiertas2026 = vacResumen.enReclutamiento;
  const totalEstructura = hcResumen.total + vacantesAbiertas2026;
  const cobertura =
    totalEstructura > 0 ? (hcResumen.total / totalEstructura) * 100 : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Head Count"
        subtitle="Posiciones dentro de SIMCO y vacantes abiertas"
        tags={["Vista CEO", "Potentor /headcount"]}
      />

      {/* Dos KPIs grandes lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl border border-[var(--color-accent-teal)]/25 bg-[var(--color-bg-card)] p-8 flex flex-col gap-4
                        shadow-[0_0_36px_-18px_var(--color-accent-teal)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Posiciones SIMCO
            </span>
            <Users className="h-5 w-5 text-[var(--color-accent-teal)]" />
          </div>
          <p className="text-6xl font-semibold tracking-tight tabular-nums text-[var(--color-text)]">
            {formatNumber(hcResumen.total)}
          </p>
          <p className="text-xs text-[var(--color-text-dim)]">
            Total de posiciones registradas en la compañía
          </p>
        </div>

        <div
          className="rounded-2xl border border-[var(--color-accent-orange)]/30 bg-[var(--color-bg-card)] p-8 flex flex-col gap-4
                        shadow-[0_0_36px_-18px_var(--color-accent-orange)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent-orange)]">
              Vacantes 2026
            </span>
            <Briefcase className="h-5 w-5 text-[var(--color-accent-orange)]" />
          </div>
          <p className="text-6xl font-semibold tracking-tight tabular-nums text-[var(--color-text)]">
            {formatNumber(vacantesAbiertas2026)}
          </p>
          <p className="text-xs text-[var(--color-text-dim)]">
            Activamente en reclutamiento ahora
          </p>
        </div>
      </div>

      <SectionCard
        title="Cobertura de plantilla"
        description="Posiciones ocupadas vs estructura total (ocupadas + abiertas)"
      >
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="h-3 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-accent-blue)]"
                style={{ width: `${cobertura}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-dim)] mt-2 tabular-nums">
              <span>{formatNumber(hcResumen.total)} ocupadas</span>
              <span>{formatNumber(vacantesAbiertas2026)} en reclutamiento</span>
            </div>
          </div>
          <div className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
            {totalEstructura > 0 ? `${Math.round(cobertura)}%` : "—"}
          </div>
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
      <Content />
    </Suspense>
  );
}
