"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface FunnelChartProps {
  data: { estatus: string; count: number }[];
}

// Side Sports palette
const COLORS = [
  "#00d4aa", // teal — primary
  "#38bdf8", // sky blue
  "#6366f1", // indigo
  "#a78bfa", // purple
  "#fb923c", // orange
  "#fbbf24", // yellow
];

export function FunnelChart({ data }: FunnelChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-dim)]">
        Sin datos
      </div>
    );
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 24 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2737"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#7a8fa8"
            fontSize={11}
            tick={{ fill: "#7a8fa8" }}
          />
          <YAxis
            type="category"
            dataKey="estatus"
            stroke="#7a8fa8"
            fontSize={11}
            width={120}
            tick={{ fill: "#a0aec0" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 170, 0.06)" }}
            contentStyle={{
              backgroundColor: "#0f1420",
              border: "1px solid #3a4555",
              borderRadius: 8,
              fontSize: 12,
              color: "#e8edf5",
            }}
            labelStyle={{ color: "#a0aec0" }}
            itemStyle={{ color: "#e8edf5" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
