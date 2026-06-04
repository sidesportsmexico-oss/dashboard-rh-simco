import { cn, formatNumber } from "@/lib/utils";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: number | string | null | undefined;
  hint?: string;
  trend?: { delta: number; suffix?: string };
  icon?: ReactNode;
  tone?: "default" | "teal" | "blue" | "warning" | "danger" | "success";
  className?: string;
}

const TONES = {
  default: {
    border: "border-[var(--color-border)]",
    accent: "text-[var(--color-text-dim)]",
    glow: "",
  },
  teal: {
    border: "border-[var(--color-accent-teal)]/30",
    accent: "text-[var(--color-accent-teal)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-teal)]",
  },
  blue: {
    border: "border-[var(--color-accent-blue)]/30",
    accent: "text-[var(--color-accent-blue)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-blue)]",
  },
  success: {
    border: "border-[var(--color-accent-teal)]/30",
    accent: "text-[var(--color-accent-teal)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-teal)]",
  },
  warning: {
    border: "border-[var(--color-accent-orange)]/35",
    accent: "text-[var(--color-accent-orange)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-orange)]",
  },
  danger: {
    border: "border-[var(--color-accent-red)]/35",
    accent: "text-[var(--color-accent-red)]",
    glow: "shadow-[0_0_24px_-12px_var(--color-accent-red)]",
  },
} as const;

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = "default",
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

      <div className="flex items-center justify-between text-xs gap-2">
        {hint && (
          <span className="text-[var(--color-text-dim)] truncate">{hint}</span>
        )}
        {trend && (
          <span
            className={cn(
              "font-medium tabular-nums",
              trend.delta > 0
                ? "text-[var(--color-accent-teal)]"
                : trend.delta < 0
                  ? "text-[var(--color-accent-red)]"
                  : "text-[var(--color-text-dim)]",
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
