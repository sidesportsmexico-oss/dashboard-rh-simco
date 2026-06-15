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

interface Props {
  data: {
    mes: string;
    sucursales: number;
    corporativo: number;
  }[];
}

export function RotacionMesChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" vertical={false} />
          <XAxis dataKey="mes" stroke="#7a8fa8" fontSize={11} tick={{ fill: "#7a8fa8" }} />
          <YAxis stroke="#7a8fa8" fontSize={11} allowDecimals={false} tick={{ fill: "#7a8fa8" }} />
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
            formatter={(v) => `${Number(v)} bajas`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a0aec0", paddingTop: 8 }}
            iconType="circle"
          />
          <Bar
            dataKey="sucursales"
            name="Sucursales"
            stackId="a"
            fill="#fb923c"
          />
          <Bar
            dataKey="corporativo"
            name="Corporativo"
            stackId="a"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
