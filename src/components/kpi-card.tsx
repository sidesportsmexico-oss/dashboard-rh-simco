import { cn, formatNumber } from "@/lib/utils";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: number | string | null | undefined;
  hint?: string;
  /**
   * Indicador de tendencia (+/- delta).
   * Por default, delta positivo = verde (mejora), negativo = rojo (peor).
   * Para KPIs donde bajar es bueno (rotación, churn, errores), pasa
   * `inverse: true` y los colores se invierten.
   */
  trend?: { delta: number; suffix?: string; inverse?: boolean };
  icon?: ReactNode;
  tone?: "default" | "teal" | "blue" | "warning" | "danger" | "success";
  /** Barra de progreso compacta. Si está definida, se renderiza entre el valor y el hint. */
  progress?: {
    pct: number;
    primaryLabel: string;
    secondaryLabel?: string;
  };
  className?: string;
}

const TONES = {
  default: {
    border: "border-[var(--color-border)]",
    accent: "text-[var(--color-text-dim)]",
    glow: "",
    barFill: "bg-[var(--color-text-dim)]",
  },
  teal: {
    border: "border-[var(--color-accent-teal)]/30",
    accent: "text-[var(--color-accent-teal)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-teal)]",
    barFill: "bg-[var(--color-accent-teal)]",
  },
  blue: {
    border: "border-[var(--color-accent-blue)]/30",
    accent: "text-[var(--color-accent-blue)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-blue)]",
    barFill: "bg-[var(--color-accent-blue)]",
  },
  success: {
    border: "border-[var(--color-accent-teal)]/30",
    accent: "text-[var(--color-accent-teal)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-teal)]",
    barFill: "bg-[var(--color-accent-teal)]",
  },
  warning: {
    border: "border-[var(--color-accent-orange)]/35",
    accent: "text-[var(--color-accent-orange)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-orange)]",
    barFill: "bg-[var(--color-accent-orange)]",
  },
  danger: {
    border: "border-[var(--color-accent-red)]/35",
    accent: "text-[var(--color-accent-red)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-red)]",
    barFill: "bg-[var(--color-accent-red)]",
  },
} as const;

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = "default",
  progress,
  className,
}: KpiCardProps) {
  const t = TONES[tone];

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-[var(--color-bg-card)] p-5 flex flex-col gap-3 transition-all",
        "hover:bg-[var(--color-bg-elevated)]",
        t.border,
        t.glow,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-[0.12em]">
          {label}
        </p>
        {icon && <span className={cn("transition-colors", t.accent)}>{icon}</span>}
      </div>

      <p
        className={cn(
          "text-3xl font-semibold tracking-tight tabular-nums",
          "text-[var(--color-text)]",
        )}
      >
        {typeof value === "number" ? formatNumber(value) : (value ?? "—")}
      </p>

      {progress && (
        <div className="space-y-1">
          <div className="h-1 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                t.barFill,
              )}
              style={{ width: `${Math.min(Math.max(progress.pct, 0), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] tabular-nums">
            <span className={cn("font-medium", t.accent)}>
              {progress.primaryLabel}
            </span>
            {progress.secondaryLabel && (
              <span className="text-[var(--color-text-dim)]">
                {progress.secondaryLabel}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs gap-2">
        {hint && (
          <span className="text-[var(--color-text-dim)] truncate">{hint}</span>
        )}
        {trend && (
          <span
            className={cn(
              "font-medium tabular-nums",
              (() => {
                const good = trend.inverse ? trend.delta < 0 : trend.delta > 0;
                const bad = trend.inverse ? trend.delta > 0 : trend.delta < 0;
                if (good) return "text-[var(--color-accent-teal)]";
                if (bad) return "text-[var(--color-accent-red)]";
                return "text-[var(--color-text-dim)]";
              })(),
            )}
          >
            {trend.delta > 0 ? "+" : ""}
            {trend.delta}
            {trend.suffix ?? ""}
          </span>
        )}
      </div>
    </div>
  );
}
