"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: { dimension: string; score: number; fullMark: number }[];
}

export function EcoRadarChart({ data }: Props) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
          <PolarGrid stroke="#3a4555" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#a0aec0", fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            angle={90}
            tick={{ fill: "#7a8fa8", fontSize: 10 }}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1420",
              border: "1px solid #3a4555",
              borderRadius: 8,
              fontSize: 12,
              color: "#e8edf5",
            }}
            labelStyle={{ color: "#a0aec0" }}
            formatter={(v) => [`${Number(v).toFixed(0)}%`, "Score"]}
          />
          <Radar
            name="ECO"
            dataKey="score"
            stroke="#00d4aa"
            fill="#00d4aa"
            fillOpacity={0.28}
            strokeWidth={2}
            dot={{ r: 4, fill: "#00d4aa", strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
