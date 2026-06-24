"use client";

import { useState, useMemo } from "react";
import { LogOut, TrendingDown, UserMinus, UserX, Activity } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { BajasTable } from "@/components/bajas-table";
import { RotacionSucursalesClient } from "@/components/rotacion-sucursales-client";
import { RotacionMesChart } from "@/components/rotacion-mes-chart";
import { bajasSucursales, bajasCorporativo } from "@/data/bajas-2026";
import {
  resumenBajas,
  filtrarPorAnio,
  filtrarPorAnios,
  bajasPorMes,
  topMotivos,
  indiceRotacion,
} from "@/lib/bajas/helpers";
type Periodo = "ambos" | "2025" | "2026";

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: "ambos", label: "2025 + 2026" },
  { id: "2025", label: "2025" },
  { id: "2026", label: "2026" },
];

interface Props {
  plantillaCorp: number;
  plantillaSuc: number;
}

/**
 * Sección Rotación dentro de /headcount.
 *
 * Es un client component para soportar filtro de periodo (tabs 2025/2026/Ambos).
 * Las bajas vienen de un import estático (Google Sheet capturado al TS),
 * las plantillas las inyecta el server desde Potentor.
 *
 * El chart "Bajas mensuales · 2025 vs 2026" siempre es comparativo y no
 * se ve afectado por el filtro de periodo — es una vista de comparación
 * que pierde sentido si filtras a un solo año.
 */
export function RotacionClient({ plantillaCorp, plantillaSuc }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>("ambos");

  // Bajas para el periodo seleccionado
  const { allSuc, allCorp, esAmbos, yearSel } = useMemo(() => {
    if (periodo === "ambos") {
      return {
        allSuc: filtrarPorAnios(bajasSucursales, [2025, 2026]),
        allCorp: filtrarPorAnios(bajasCorporativo, [2025, 2026]),
        esAmbos: true as const,
        yearSel: null,
      };
    }
    const y = Number(periodo);
    return {
      allSuc: filtrarPorAnio(bajasSucursales, y),
      allCorp: filtrarPorAnio(bajasCorporativo, y),
      esAmbos: false as const,
      yearSel: y,
    };
  }, [periodo]);

  const todasBajas = useMemo(() => [...allSuc, ...allCorp], [allSuc, allCorp]);
  const resTotal = useMemo(() => resumenBajas(todasBajas), [todasBajas]);
  const top5Motivos = useMemo(() => topMotivos(todasBajas, 5), [todasBajas]);

  // KPI principal: dependiendo del periodo, "Bajas YTD" o "Bajas del periodo"
  const total2025 = useMemo(
    () => filtrarPorAnio(bajasSucursales, 2025).length + filtrarPorAnio(bajasCorporativo, 2025).length,
    [],
  );
  const total2026 = useMemo(
    () => filtrarPorAnio(bajasSucursales, 2026).length + filtrarPorAnio(bajasCorporativo, 2026).length,
    [],
  );

  // Para el "Bajas YTD" card variamos el subtítulo según selección
  const bajasMainCard = useMemo(() => {
    if (esAmbos) {
      return {
        label: "Bajas 2026 YTD",
        value: total2026,
        hint: `vs ${total2025} en 2025`,
        progress: {
          pct:
            total2025 + total2026 > 0
              ? (total2026 / (total2025 + total2026)) * 100
              : 0,
          primaryLabel: `${total2026} en 2026`,
          secondaryLabel: `${total2025} en 2025`,
        },
      };
    }
    const otroAnio = yearSel === 2026 ? 2025 : 2026;
    const otroCount = otroAnio === 2025 ? total2025 : total2026;
    return {
      label: `Bajas ${yearSel}`,
      value: yearSel === 2025 ? total2025 : total2026,
      hint: `vs ${otroCount} en ${otroAnio}`,
      progress: undefined,
    };
  }, [esAmbos, yearSel, total2025, total2026]);

  // Índices por empresa del periodo seleccionado.
  // Ambos y 2026 muestran 2026 YTD (más reciente). 2025 muestra año completo.
  // Sin comparativo cruzado per CEO 2026-06-24 — comparar YTD vs año
  // completo era engañoso.
  const { corpRotActual, sucRotActual, indiceHint } = useMemo(() => {
    const corp2025 = filtrarPorAnio(bajasCorporativo, 2025);
    const corp2026 = filtrarPorAnio(bajasCorporativo, 2026);
    const suc2025 = filtrarPorAnio(bajasSucursales, 2025);
    const suc2026 = filtrarPorAnio(bajasSucursales, 2026);

    if (esAmbos || yearSel === 2026) {
      return {
        corpRotActual: indiceRotacion(corp2026.length, plantillaCorp),
        sucRotActual: indiceRotacion(suc2026.length, plantillaSuc),
        indiceHint: "2026 YTD",
      };
    }
    return {
      corpRotActual: indiceRotacion(corp2025.length, plantillaCorp),
      sucRotActual: indiceRotacion(suc2025.length, plantillaSuc),
      indiceHint: "2025",
    };
  }, [esAmbos, yearSel, plantillaCorp, plantillaSuc]);

  // Chart siempre comparativo 2025 vs 2026 (no se filtra)
  const chartData = useMemo(() => {
    const mesesSuc25 = bajasPorMes(bajasSucursales, 2025);
    const mesesCorp25 = bajasPorMes(bajasCorporativo, 2025);
    const mesesSuc26 = bajasPorMes(bajasSucursales, 2026);
    const mesesCorp26 = bajasPorMes(bajasCorporativo, 2026);
    return mesesSuc25.map((m, i) => ({
      mes: m.mes,
      bajas2025: m.count + mesesCorp25[i].count,
      bajas2026: mesesSuc26[i].count + mesesCorp26[i].count,
    }));
  }, []);

  const periodoLabel = esAmbos ? "2025+2026" : String(yearSel);

  return (
    <section className="space-y-6 pt-2">
      <header className="border-t border-[var(--color-border-subtle)] pt-8">
        <div className="flex items-center gap-3 mb-1">
          <LogOut className="h-5 w-5 text-[var(--color-accent-orange)]" />
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Rotación
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-dim)]">
          Bajas de SIMCO (Sucursales · Corporativo) — fuente: Google Sheets
          &ldquo;Bajas SIMCO&rdquo;
        </p>

        {/* Tabs de periodo */}
        <div className="flex flex-wrap gap-2 mt-4">
          {PERIODOS.map((p) => {
            const active = periodo === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodo(p.id)}
                className={
                  active
                    ? "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border bg-[var(--color-accent-teal)]/15 border-[var(--color-accent-teal)]/40 text-[var(--color-accent-teal)] cursor-pointer transition-all"
                    : "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] cursor-pointer transition-all"
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label={bajasMainCard.label}
          value={bajasMainCard.value}
          hint={bajasMainCard.hint}
          tone="warning"
          icon={<UserMinus className="h-4 w-4" />}
          progress={bajasMainCard.progress}
        />
        <KpiCard
          label="Bajas Voluntarias"
          value={resTotal.voluntarias}
          hint={`${Math.round(resTotal.pctVoluntarias)}% del periodo ${periodoLabel}`}
          tone="default"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          label="Bajas Involuntarias"
          value={resTotal.involuntarias}
          hint={`${Math.round(100 - resTotal.pctVoluntarias)}% del periodo ${periodoLabel}`}
          tone="danger"
          icon={<UserX className="h-4 w-4" />}
        />
      </div>

      {/* Índices de Rotación separados por empresa.
          Solicitud del CEO 2026-06-24: solo mostrar índice del periodo
          seleccionado, sin comparativo de año completo (engañoso porque
          2026 va YTD vs 2025 con 12 meses). Si quieren YoY hay que
          construir comparativo YTD vs mismo periodo 2025 explícito. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Índice Rotación · SIMCO Corporativo"
          value={`${corpRotActual.toFixed(1)}%`}
          hint={`${indiceHint} · plantilla ${plantillaCorp}`}
          tone={
            corpRotActual > 25
              ? "danger"
              : corpRotActual > 15
                ? "warning"
                : "success"
          }
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          label="Índice Rotación · CONCEPTS Sucursales"
          value={`${sucRotActual.toFixed(1)}%`}
          hint={`${indiceHint} · plantilla ${plantillaSuc}`}
          tone={
            sucRotActual > 40
              ? "danger"
              : sucRotActual > 25
                ? "warning"
                : "success"
          }
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Sub-KPIs: desglose bajas Sucursales vs Corporativo del periodo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-accent-orange)] font-medium">
              Bajas Sucursales · {periodoLabel}
            </p>
            <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)] mt-1">
              {allSuc.length}
            </p>
            <p className="text-[11px] text-[var(--color-text-dim)] mt-1">
              {esAmbos
                ? `${filtrarPorAnio(bajasSucursales, 2025).length} en 2025 · ${filtrarPorAnio(bajasSucursales, 2026).length} en 2026`
                : `Año ${yearSel}`}
            </p>
          </div>
          <UserMinus className="h-6 w-6 text-[var(--color-accent-orange)] opacity-60" />
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-accent-blue)] font-medium">
              Bajas Corporativo · {periodoLabel}
            </p>
            <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)] mt-1">
              {allCorp.length}
            </p>
            <p className="text-[11px] text-[var(--color-text-dim)] mt-1">
              {esAmbos
                ? `${filtrarPorAnio(bajasCorporativo, 2025).length} en 2025 · ${filtrarPorAnio(bajasCorporativo, 2026).length} en 2026`
                : `Año ${yearSel}`}
            </p>
          </div>
          <UserMinus className="h-6 w-6 text-[var(--color-accent-blue)] opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Bajas mensuales · 2025 vs 2026"
          description={`Comparativo mensual (fijo) · plantilla SIMCO ${plantillaCorp} · CONCEPTS ${plantillaSuc}`}
          className="lg:col-span-2"
        >
          <RotacionMesChart data={chartData} />
        </SectionCard>

        <SectionCard
          title="Top 5 motivos"
          description={`Periodo ${periodoLabel}`}
        >
          <ul className="space-y-2">
            {top5Motivos.length === 0 && (
              <li className="text-sm text-[var(--color-text-dim)]">
                Sin motivos registrados
              </li>
            )}
            {top5Motivos.map((m, i) => (
              <li
                key={m.motivo}
                className="flex items-center justify-between gap-3 py-1.5 border-b border-[var(--color-border-subtle)] last:border-0 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-bg-elevated)] text-[10px] tabular-nums text-[var(--color-text-dim)]">
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-text)] truncate">
                    {m.motivo}
                  </span>
                </div>
                <span className="shrink-0 flex items-center gap-2">
                  <span
                    className={
                      m.tipo === "voluntaria"
                        ? "inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-yellow)]"
                        : "inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-red)]"
                    }
                  />
                  <span className="font-medium tabular-nums text-[var(--color-text)]">
                    {m.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Bajas Corporativo (primero per CEO 2026-06-15) */}
      <SectionCard
        title={`Bajas Corporativo · ${periodoLabel}`}
        description={`${allCorp.length} bajas en el periodo`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-blue)]">
            <UserMinus className="h-4 w-4" />
            Corporativo
          </span>
        }
      >
        <BajasTable
          bajas={allCorp}
          modo="departamento"
          emptyMessage={`Sin bajas corporativo registradas en ${periodoLabel}.`}
        />
      </SectionCard>

      {/* Bajas Sucursales con tabs */}
      <SectionCard
        title={`Bajas Sucursales · ${periodoLabel}`}
        description={`${allSuc.length} bajas en el periodo · filtra por sucursal con las pestañas`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-orange)]">
            <UserMinus className="h-4 w-4" />
            Operativo
          </span>
        }
      >
        <RotacionSucursalesClient bajas={allSuc} />
      </SectionCard>

      <div className="text-[10px] text-[var(--color-text-dim)] italic text-right">
        Captura del Google Sheet al 2026-06-11 · filtro de periodo activo:{" "}
        {periodoLabel} · Índices = bajas por empresa / plantilla por empresa
        (Potentor: departamento &ldquo;Sucursales&rdquo; → CONCEPTS, resto →
        SIMCO)
      </div>
    </section>
  );
}
