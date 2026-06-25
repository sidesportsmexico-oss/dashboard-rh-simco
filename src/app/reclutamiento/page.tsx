import { Suspense } from "react";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import { ReclutamientoClient } from "@/components/reclutamiento-client";
import { getVacantes } from "@/lib/potentor/reclutamiento";

export const revalidate = 60;

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reclutamiento"
        subtitle="Vacantes SIMCO · filtra por año con los tabs"
        tags={["Vista CEO", "SIMCO"]}
      />

      <ReclutamientoClient vacantes={vacantes} />
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
