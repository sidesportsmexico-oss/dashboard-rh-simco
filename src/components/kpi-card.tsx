import { cn, formatNumber } from "@/lib/utils";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: number | string | null | undefined;
  hint?: string;
  trend?: { delta: number; suffix?: string };
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = "default",
  className,
}: KpiCardProps) {
  const toneClasses = {
    default: "border-zinc-200 dark:border-zinc-800",
    success: "border-emerald-200 dark:border-emerald-900",
    warning: "border-amber-200 dark:border-amber-900",
    danger: "border-red-200 dark:border-red-900",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-zinc-950 p-5 flex flex-col gap-3",
        toneClasses,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </p>
        {icon && (
          <span className="text-zinc-400 dark:text-zinc-600">{icon}</span>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {typeof value === "number" ? formatNumber(value) : (value ?? "—")}
      </p>
      <div className="flex items-center justify-between text-xs">
        {hint && (
          <span className="text-zinc-500 dark:text-zinc-400">{hint}</span>
        )}
        {trend && (
          <span
            className={cn(
              "font-medium",
              trend.delta > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : trend.delta < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-500",
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
