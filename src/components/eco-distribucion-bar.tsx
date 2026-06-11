"use client";

import type { DistribucionOps } from "@/lib/eco/types";

const OP_LABELS = {
  op1: "Totalmente de acuerdo",
  op2: "De acuerdo",
  op3: "En desacuerdo",
  op4: "Totalmente en desacuerdo",
} as const;

const OP_COLORS = {
  op1: "#00d4aa",
  op2: "#38bdf8",
  op3: "#fb923c",
  op4: "#ff5050",
} as const;

/** Barra apilada con la distribución Op1-Op4 (suma 100%). */
export function EcoDistribucionBar({
  dist,
  showLabels = false,
  height = 8,
}: {
  dist: DistribucionOps;
  showLabels?: boolean;
  height?: number;
}) {
  const total = dist.op1 + dist.op2 + dist.op3 + dist.op4;
  const safe = total > 0 ? total : 100;
  return (
    <div className="w-full">
      <div
        className="flex w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]"
        style={{ height }}
      >
        {(["op1", "op2", "op3", "op4"] as const).map((k) => (
          <div
            key={k}
            className="h-full transition-all"
            style={{
              width: `${(dist[k] / safe) * 100}%`,
              backgroundColor: OP_COLORS[k],
            }}
            aria-label={`${OP_LABELS[k]}: ${dist[k].toFixed(1)}%`}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex justify-between text-[10px] mt-1.5 tabular-nums">
          {(["op1", "op2", "op3", "op4"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: OP_COLORS[k] }}
              />
              <span className="text-[var(--color-text-dim)]">
                {dist[k].toFixed(0)}%
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function EcoDistribucionLegend() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      {(["op1", "op2", "op3", "op4"] as const).map((k) => (
        <div key={k} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: OP_COLORS[k] }}
          />
          <span className="text-[var(--color-text-muted)] truncate">
            {OP_LABELS[k]}
          </span>
        </div>
      ))}
    </div>
  );
}
