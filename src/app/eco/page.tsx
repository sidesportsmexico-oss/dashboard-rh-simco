import { Suspense } from "react";
import {
  ClipboardList,
  AlertTriangle,
  Lock,
  Globe,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import { ErrorBanner } from "@/components/error-banner";
import { PageHeader } from "@/components/page-header";
import {
  EcoScoreComparativoChart,
  EcoDistribucionPorEncuestaChart,
  ENCUESTA_COLOR,
} from "@/components/eco-charts";
import {
  getEcoResultados,
  compararEncuestas,
  type EncuestaResumen,
} from "@/lib/potentor/diagnostico";
import { cn, formatPercent } from "@/lib/utils";

export const revalidate = 120;

// Metadata de las 3 encuestas que el CEO ve en la UI de Potentor.
// La data viene de la pantalla /diagnostico_clima_organizacional manualmente
// hasta que Potentor exponga el endpoint correcto.
const ENCUESTAS_UI = [
  {
    id: "eco_2025_simco",
    titulo: "ECO 2025 SIMCo",
    tipo: "Privada" as const,
    audiencia: "Corporativo",
    participantes: 47,
    periodo: "01 - 12 Sep 2025",
    avance: 0.87,
    estatus: "TERMINADO",
  },
  {
    id: "eco_2025_concepts",
    titulo: "ECO 2025 CONCEPTS",
    tipo: "Pública" as const,
    audiencia: "Operativo (Batbox + Mulligans)",
    participantes: 52,
    periodo: "01 - 08 Sep 2025",
    avance: null,
    estatus: "TERMINADO",
  },
  {
    id: "eco_2024_2",
    titulo: "ECO 2024 (2)",
    tipo: "Privada" as const,
    audiencia: "Mixto",
    participantes: 91,
    periodo: "01 - 04 Nov 2024",
    avance: 0,
    estatus: "TERMINADO",
  },
];

async function Content() {
  let resp;
  try {
    resp = await getEcoResultados();
  } catch (err) {
    return (
      <ErrorBanner
        title="No se pudo cargar el endpoint de diagnóstico"
        detail={err instanceof Error ? err.message : String(err)}
      />
    );
  }

  const rows = resp.data ?? [];
  const ipResumenes = compararEncuestas(rows);

  // Datos para charts del Índice de Potencial
  const scoreComparativo = ipResumenes.map((e) => ({
    id: e.def.id,
    nombre: e.def.nombre,
    promedioIp: e.promedioIp,
  }));

  const distRows = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    encuestas: ipResumenes.map((e) => ({
      id: e.def.id,
      nombre: e.def.nombre,
      count: e.distribucion[i] ?? 0,
    })),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Diagnóstico de Clima Organizacional"
        subtitle="Encuestas ECO registradas en SIMCO · pendiente integración endpoint correcto"
        tags={["Vista CEO", "SIMCO + CONCEPTS"]}
      />

      {/* BANNER explicando el gap actual */}
      <div className="rounded-xl border border-[var(--color-accent-orange)]/40 bg-[var(--color-accent-orange)]/5 p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-[var(--color-accent-orange)] shrink-0 mt-0.5" />
        <div className="text-sm space-y-2">
          <p className="font-medium text-[var(--color-accent-orange-warm)]">
            Encuestas ECO pendientes de integración vía API
          </p>
          <p className="text-[var(--color-text-muted)]">
            El API de Potentor (<code>/diagnostico/lista_ip</code>) devuelve
            datos de <strong>Índice de Potencial</strong> (evaluaciones per-empleado),
            no de Clima Organizacional. Las 3 encuestas ECO listadas abajo
            existen en la UI de Potentor pero no están expuestas vía API.
          </p>
          <p className="text-[var(--color-text-muted)]">
            <strong>Solicitud enviada a Potentor:</strong> exponer endpoint
            para resultados de encuestas ECO (score por encuesta, breakdown
            por dimensión). Mientras llega, mostramos abajo (a) metadata de
            las 3 encuestas registradas y (b) los datos de Índice de Potencial
            que sí están disponibles.
          </p>
        </div>
      </div>

      {/* SECCIÓN 1 — Encuestas ECO registradas (metadata desde UI) */}
      <SectionCard
        title="Encuestas ECO registradas"
        description="3 ediciones aplicadas según el módulo de Potentor"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ENCUESTAS_UI.map((e) => (
            <EncuestaUICard key={e.id} encuesta={e} />
          ))}
        </div>
      </SectionCard>

      {/* SECCIÓN 2 — Índice de Potencial (lo que SÍ tenemos del API) */}
      <div className="pt-4 border-t border-[var(--color-border-subtle)]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text)] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-accent-teal)]" />
            Índice de Potencial (IP)
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
            Métrica distinta a ECO — evalúa potencial de cada colaborador
            sobre 100. Fuente:{" "}
            <code>/diagnostico/lista_ip</code>. Segmentamos por
            audiencia/año para dar una vista comparativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ipResumenes.map((e) => (
            <IpCard key={e.def.id} resumen={e} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SectionCard
            title="IP promedio por segmento"
            description="Comparativo del Índice de Potencial entre las 3 segmentaciones"
          >
            <EcoScoreComparativoChart data={scoreComparativo} />
          </SectionCard>

          <SectionCard
            title="Distribución de scores IP"
            description="Cuántos colaboradores en cada rango (0-100)"
          >
            <EcoDistribucionPorEncuestaChart data={distRows} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function EncuestaUICard({
  encuesta,
}: {
  encuesta: (typeof ENCUESTAS_UI)[number];
}) {
  const color = ENCUESTA_COLOR[encuesta.id] ?? "#7a8fa8";
  const Icon = encuesta.tipo === "Pública" ? Globe : Lock;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ color }}
          >
            {encuesta.audiencia}
          </p>
          <h3 className="text-base font-semibold text-[var(--color-text)] mt-1">
            {encuesta.titulo}
          </h3>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold"
          style={{
            color: "#0a0e1a",
            backgroundColor: "#00d4aa",
          }}
        >
          <CheckCircle2 className="h-3 w-3" />
          {encuesta.estatus}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px]">
            Tipo
          </dt>
          <dd className="text-[var(--color-text)] mt-1 flex items-center gap-1.5">
            <Icon className="h-3 w-3 text-[var(--color-text-muted)]" />
            {encuesta.tipo}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px]">
            Participantes
          </dt>
          <dd className="text-[var(--color-text)] mt-1 font-semibold tabular-nums">
            {encuesta.participantes}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px]">
            Periodo de aplicación
          </dt>
          <dd className="text-[var(--color-text)] mt-1 tabular-nums">
            {encuesta.periodo}
          </dd>
        </div>
        {encuesta.avance !== null && (
          <div className="col-span-2">
            <dt className="text-[var(--color-text-dim)] uppercase tracking-wider text-[10px]">
              Avance
            </dt>
            <dd className="mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${encuesta.avance * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-xs tabular-nums text-[var(--color-text)]">
                  {(encuesta.avance * 100).toFixed(0)}%
                </span>
              </div>
            </dd>
          </div>
        )}
      </dl>

      <p className="text-[10px] text-[var(--color-text-dim)] italic pt-2 border-t border-[var(--color-border-subtle)]">
        Resultados detallados pendientes — esperando endpoint API
      </p>
    </div>
  );
}

function IpCard({ resumen }: { resumen: EncuestaResumen }) {
  const color = ENCUESTA_COLOR[resumen.def.id] ?? "#7a8fa8";
  return (
    <div
      className="rounded-xl border bg-[var(--color-bg-card)] p-5 flex flex-col gap-3"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ color }}
          >
            {resumen.def.audiencia}
          </p>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mt-1">
            IP {resumen.def.nombre.replace("ECO ", "")}
          </h3>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-semibold tracking-tight tabular-nums text-[var(--color-text)]">
          {resumen.promedioIp !== null ? resumen.promedioIp.toFixed(1) : "—"}
        </p>
        <p className="text-xs text-[var(--color-text-dim)]">/ 100</p>
      </div>
      <p className="text-xs text-[var(--color-text-dim)]">
        n = {resumen.respondieron} colaboradores
        {resumen.total > resumen.respondieron && (
          <span> (de {resumen.total} evaluados)</span>
        )}
      </p>
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
