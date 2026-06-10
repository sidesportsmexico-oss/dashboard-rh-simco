"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PipelineMensualPunto } from "@/lib/potentor/reclutamiento";

interface Props {
  data: PipelineMensualPunto[];
}

const COLORS = {
  enProceso: "#00d4aa",
  standby: "#fbbf24",
  cerrada: "#3a4555",
};

export function PipelineMensualChart({ data }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2737"
            vertical={false}
          />
          <XAxis
            dataKey="mes"
            stroke="#7a8fa8"
            fontSize={11}
            tick={{ fill: "#7a8fa8" }}
          />
          <YAxis
            stroke="#7a8fa8"
            fontSize={11}
            allowDecimals={false}
            tick={{ fill: "#7a8fa8" }}
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
            labelStyle={{ color: "#a0aec0", fontWeight: 600 }}
            itemStyle={{ color: "#e8edf5" }}
            formatter={(v) => `${Number(v)} vacantes`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a0aec0", paddingTop: 8 }}
            iconType="circle"
          />
          <Bar
            dataKey="enProceso"
            name="En Proceso"
            stackId="a"
            fill={COLORS.enProceso}
          />
          <Bar
            dataKey="standby"
            name="Standby"
            stackId="a"
            fill={COLORS.standby}
          />
          <Bar
            dataKey="cerrada"
            name="Cerrada"
            stackId="a"
            fill={COLORS.cerrada}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
