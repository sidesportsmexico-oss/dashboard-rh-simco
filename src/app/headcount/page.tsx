import { Suspense } from "react";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { formatNumber } from "@/lib/utils";
import {
  getHeadcountReporte,
  resumenHeadcount,
} from "@/lib/potentor/headcount";
import {
  getVacantes,
  resumenVacantes,
  isVacante2026,
} from "@/lib/potentor/reclutamiento";
import {
  getJerarquias,
  getOrganigrama,
} from "@/lib/potentor/organigrama";
import { HeadcountKpisClient } from "@/components/headcount-kpis-client";

export const revalidate = 600;

async function Content() {
  const [hcRes, vacRes, jerRes, orgRes] = await Promise.allSettled([
    getHeadcountReporte(),
    getVacantes(),
    getJerarquias(),
    getOrganigrama(),
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
  const jerarquias = jerRes.status === "fulfilled" ? jerRes.value : [];
  const organigrama = orgRes.status === "fulfilled" ? orgRes.value : [];

  const hcResumen = resumenHeadcount(headcount);
  const vacResumen = resumenVacantes(vacantes);

  const vacantesAbiertas2026 = vacResumen.abiertas2026;
  const totalEstructura = hcResumen.total + vacantesAbiertas2026;
  const cobertura =
    totalEstructura > 0 ? (hcResumen.total / totalEstructura) * 100 : 0;

  // Las vacantes 2026 ordenadas por fecha desc para el modal
  const vacantes2026List = vacantes
    .filter(isVacante2026)
    .sort((a, b) => (b.fecha_creacion ?? "").localeCompare(a.fecha_creacion ?? ""));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Head Count"
        subtitle="Posiciones dentro de SIMCO y vacantes abiertas"
        tags={["Vista CEO", "Potentor /headcount"]}
      />

      <HeadcountKpisClient
        posiciones={hcResumen.total}
        hintPosiciones="Plantilla actual"
        vacantes2026={vacResumen.vacantes2026}
        hintVacantes={`${vacantesAbiertas2026} abiertas · ${vacResumen.vacantes2026 - vacantesAbiertas2026} cerradas`}
        jerarquias={jerarquias}
        organigrama={organigrama}
        vacantes={vacantes2026List}
      />

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
