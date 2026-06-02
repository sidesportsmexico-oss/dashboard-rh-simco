import { Suspense } from "react";
import { Target, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import {
  getComparativoDesempeno,
  resumenProcesos,
  type ProcesoDesempeno,
} from "@/lib/potentor/desempeno";

export const revalidate = 600;

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Evaluación 360
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Comparativo 2025 vs 2026 — fuente: <code>/desempeno/working_process_by_date</code>
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Endpoint provisional — pendiente confirmar con Potentor
          </p>
          <p className="text-amber-800 dark:text-amber-300 mt-1">
            La spec de Potentor no expone un endpoint llamado &quot;360&quot;.
            Estamos usando <code>/desempeno/working_process_by_date</code>,
            que es el único endpoint con parámetro <code>year</code>. Esto puede
            traer procesos de desempeño en general, no solo 360. Pendiente
            confirmación.
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
          tone={err2026 ? "danger" : "default"}
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
            <p className="text-xs text-red-600 font-mono">{err2025}</p>
          ) : procs2025.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin procesos registrados</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {procs2025.slice(0, 10).map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <span>{p.nombre ?? `Proceso ${p.proceso_id ?? i}`}</span>
                  <span className="text-zinc-500">{p.estatus ?? "—"}</span>
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
            <p className="text-xs text-red-600 font-mono">{err2026}</p>
          ) : procs2026.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin procesos registrados</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {procs2026.slice(0, 10).map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <span>{p.nombre ?? `Proceso ${p.proceso_id ?? i}`}</span>
                  <span className="text-zinc-500">{p.estatus ?? "—"}</span>
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
    <Suspense fallback={<div className="text-sm text-zinc-500">Cargando…</div>}>
      <Content />
    </Suspense>
  );
}
