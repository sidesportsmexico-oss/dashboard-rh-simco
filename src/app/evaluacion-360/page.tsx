import { Suspense } from "react";
import { Target, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { PageHeader } from "@/components/page-header";
import {
  getComparativoDesempeno,
  resumenProcesos,
  type ProcesoDesempeno,
} from "@/lib/potentor/desempeno";

export const revalidate = 120;

function isOk(v: unknown): v is ProcesoDesempeno[] {
  return Array.isArray(v);
}

async function Content() {
  const comp = await getComparativoDesempeno();

  const procs2025 = isOk(comp.year2025) ? comp.year2025 : [];
  const procs2026 = isOk(comp.year2026) ? comp.year2026 : [];
  const err2025 = !isOk(comp.year2025) ? comp.year2025.error : null;
  const err2026 = !isOk(comp.year2026) ? comp.year2026.error : null;

  const r25 = resumenProcesos(procs2025);
  const r26 = resumenProcesos(procs2026);
  const delta = r26.colaboradores - r25.colaboradores;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Evaluación 360"
        subtitle="Comparativo 2025 vs 2026 · /desempeno/working_process_by_date"
        tags={["Vista CEO", "Provisional"]}
      />

      <div className="rounded-xl border border-[var(--color-accent-orange)]/30 bg-[var(--color-accent-orange)]/5 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-[var(--color-accent-orange)] shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[var(--color-accent-orange-warm)]">
            Endpoint provisional — pendiente confirmar con Potentor
          </p>
          <p className="text-[var(--color-text-muted)] mt-1">
            La spec no expone un endpoint llamado &quot;360&quot;. Usamos{" "}
            <code className="text-[var(--color-accent-teal)]">
              /desempeno/working_process_by_date
            </code>{" "}
            (único endpoint con parámetro <code>year</code>). Puede traer todos
            los procesos de desempeño, no solo 360.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Procesos 2025"
          value={r25.total}
          hint={err2025 ? "Error al cargar" : `${r25.colaboradores} colaboradores`}
          tone={err2025 ? "danger" : "default"}
        />
        <KpiCard
          label="Procesos 2026"
          value={r26.total}
          hint={err2026 ? "Error al cargar" : `${r26.colaboradores} colaboradores`}
          tone={err2026 ? "danger" : "teal"}
          icon={<Target className="h-4 w-4" />}
        />
        <KpiCard
          label="Δ Colaboradores"
          value={delta > 0 ? `+${delta}` : delta}
          hint="2026 vs 2025"
          tone={delta > 0 ? "success" : delta < 0 ? "warning" : "default"}
        />
        <KpiCard
          label="Promedio calif. 2026"
          value={r26.promedioCalif !== null ? r26.promedioCalif.toFixed(1) : "—"}
          hint={
            r25.promedioCalif !== null
              ? `2025: ${r25.promedioCalif.toFixed(1)}`
              : "Sin datos 2025"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Procesos 2025"
          description={err2025 ?? `${procs2025.length} encontrados`}
        >
          {err2025 ? (
            <p className="text-xs text-[var(--color-accent-red)] font-mono break-all">
              {err2025}
            </p>
          ) : procs2025.length === 0 ? (
            <p className="text-sm text-[var(--color-text-dim)]">
              Sin procesos registrados
            </p>
          ) : (
            <ul className="space-y-1">
              {procs2025.slice(0, 10).map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between py-2 text-sm border-b border-[var(--color-border-subtle)] last:border-0"
                >
                  <span className="text-[var(--color-text)]">
                    {p.nombre ?? `Proceso ${p.proceso_id ?? i}`}
                  </span>
                  <span className="text-[var(--color-text-dim)]">
                    {p.estatus ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Procesos 2026"
          description={err2026 ?? `${procs2026.length} encontrados`}
        >
          {err2026 ? (
            <p className="text-xs text-[var(--color-accent-red)] font-mono break-all">
              {err2026}
            </p>
          ) : procs2026.length === 0 ? (
            <p className="text-sm text-[var(--color-text-dim)]">
              Sin procesos registrados
            </p>
          ) : (
            <ul className="space-y-1">
              {procs2026.slice(0, 10).map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between py-2 text-sm border-b border-[var(--color-border-subtle)] last:border-0"
                >
                  <span className="text-[var(--color-text)]">
                    {p.nombre ?? `Proceso ${p.proceso_id ?? i}`}
                  </span>
                  <span className="text-[var(--color-text-dim)]">
                    {p.estatus ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
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
