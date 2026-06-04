"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type {
  MonthlyTrendPoint,
  AreaComparison,
  DistribucionBucket,
} from "@/lib/potentor/diagnostico";

const COLOR_A = "#7a8fa8"; // 2025 — muted blueish gray
const COLOR_B = "#00d4aa"; // 2026 — teal accent

const tooltipStyle = {
  backgroundColor: "#0f1420",
  border: "1px solid #3a4555",
  borderRadius: 8,
  fontSize: 12,
  color: "#e8edf5",
};
const axisStyle = { fill: "#7a8fa8", fontSize: 11 };

// ============== TENDENCIA MENSUAL ==============

export function EcoTendenciaMensualChart({
  data,
  yearA,
  yearB,
}: {
  data: MonthlyTrendPoint[];
  yearA: number;
  yearB: number;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" />
          <XAxis dataKey="month" stroke="#7a8fa8" tick={axisStyle} />
          <YAxis
            domain={[0, 100]}
            stroke="#7a8fa8"
            tick={axisStyle}
            label={{
              value: "Índice de Percepción",
              angle: -90,
              position: "insideLeft",
              fill: "#7a8fa8",
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#a0aec0" }}
            formatter={(value, name) => {
              if (value === null || value === undefined)
                return ["Sin respuestas", String(name)];
              return [Number(value).toFixed(1), String(name)];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a0aec0", paddingTop: 8 }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="yearA"
            name={String(yearA)}
            stroke={COLOR_A}
            strokeWidth={2}
            dot={{ r: 3, fill: COLOR_A }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="yearB"
            name={String(yearB)}
            stroke={COLOR_B}
            strokeWidth={2.5}
            dot={{ r: 4, fill: COLOR_B }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============== COMPARATIVO POR ÁREA ==============

export function EcoAreaComparisonChart({
  data,
  yearA,
  yearB,
}: {
  data: AreaComparison[];
  yearA: number;
  yearB: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-dim)]">
        Sin áreas con respuestas en ambos años
      </div>
    );
  }
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#7a8fa8" tick={axisStyle} />
          <YAxis
            type="category"
            dataKey="area"
            stroke="#7a8fa8"
            tick={axisStyle}
            width={180}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 170, 0.06)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#a0aec0" }}
            formatter={(v) =>
              v === null || v === undefined ? "Sin datos" : Number(v).toFixed(1)
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a0aec0", paddingTop: 8 }}
            iconType="circle"
          />
          <Bar
            dataKey="yearA"
            name={String(yearA)}
            fill={COLOR_A}
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="yearB"
            name={String(yearB)}
            fill={COLOR_B}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============== DISTRIBUCIÓN DE SCORES ==============

export function EcoDistribucionChart({
  data,
  yearA,
  yearB,
}: {
  data: DistribucionBucket[];
  yearA: number;
  yearB: number;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" vertical={false} />
          <XAxis dataKey="range" stroke="#7a8fa8" tick={axisStyle} />
          <YAxis stroke="#7a8fa8" tick={axisStyle} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 170, 0.06)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#a0aec0" }}
            formatter={(v) => `${Number(v)} respuestas`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a0aec0", paddingTop: 8 }}
            iconType="circle"
          />
          <Bar
            dataKey="yearA"
            name={String(yearA)}
            fill={COLOR_A}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="yearB"
            name={String(yearB)}
            fill={COLOR_B}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============== DELTA POR ÁREA (TIPO "WATERFALL" HORIZONTAL) ==============

export function EcoDeltaAreaChart({ data }: { data: AreaComparison[] }) {
  const filtered = data.filter((d) => d.delta !== null) as (AreaComparison & {
    delta: number;
  })[];
  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-[var(--color-text-dim)]">
        Sin áreas comparables
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filtered}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" horizontal={false} />
          <XAxis type="number" stroke="#7a8fa8" tick={axisStyle} />
          <YAxis
            type="category"
            dataKey="area"
            stroke="#7a8fa8"
            tick={axisStyle}
            width={180}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 170, 0.06)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#a0aec0" }}
            formatter={(v) => {
              const n = Number(v);
              return `${n > 0 ? "+" : ""}${n.toFixed(1)} pts`;
            }}
          />
          <Bar dataKey="delta" radius={[0, 4, 4, 0]}>
            {filtered.map((d, i) => (
              <Cell
                key={i}
                fill={d.delta >= 0 ? COLOR_B : "#ff5050"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
