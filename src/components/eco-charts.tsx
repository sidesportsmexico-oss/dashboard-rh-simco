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
  Cell,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0f1420",
  border: "1px solid #3a4555",
  borderRadius: 8,
  fontSize: 12,
  color: "#e8edf5",
};
const axisStyle = { fill: "#7a8fa8", fontSize: 11 };

// Paleta por encuesta — 1 color por id
export const ENCUESTA_COLOR: Record<string, string> = {
  eco_2024_2: "#7a8fa8", // gris azulado — histórica
  eco_2025_simco: "#00d4aa", // teal — corporativo, signature
  eco_2025_concepts: "#fb923c", // orange — operativo
};

// ============== COMPARATIVO DE SCORES (1 barra por encuesta) ==============

export function EcoScoreComparativoChart({
  data,
}: {
  data: { id: string; nombre: string; promedioIp: number | null }[];
}) {
  const rows = data.map((d) => ({
    name: d.nombre,
    score: d.promedioIp ?? 0,
    color: ENCUESTA_COLOR[d.id] ?? "#7a8fa8",
  }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" vertical={false} />
          <XAxis dataKey="name" stroke="#7a8fa8" tick={axisStyle} />
          <YAxis
            domain={[0, 100]}
            stroke="#7a8fa8"
            tick={axisStyle}
            label={{
              value: "Score / 100",
              angle: -90,
              position: "insideLeft",
              fill: "#7a8fa8",
              fontSize: 11,
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 170, 0.06)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#a0aec0" }}
            formatter={(v) => [Number(v).toFixed(1), "Score promedio"]}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {rows.map((r, i) => (
              <Cell key={i} fill={r.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============== DISTRIBUCIÓN DE SCORES (3 series superpuestas) ==============

export function EcoDistribucionPorEncuestaChart({
  data,
}: {
  data: {
    range: string;
    encuestas: { id: string; nombre: string; count: number }[];
  }[];
}) {
  // Transform to wide format for recharts
  const ids = data[0]?.encuestas.map((e) => e.id) ?? [];
  const nombres = Object.fromEntries(
    data[0]?.encuestas.map((e) => [e.id, e.nombre]) ?? [],
  );
  const rows = data.map((d) => {
    const out: Record<string, string | number> = { range: d.range };
    for (const e of d.encuestas) out[e.id] = e.count;
    return out;
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
          {ids.map((id) => (
            <Bar
              key={id}
              dataKey={id}
              name={nombres[id]}
              fill={ENCUESTA_COLOR[id] ?? "#7a8fa8"}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============== TASA DE RESPUESTA POR ENCUESTA ==============

export function EcoTasaRespuestaChart({
  data,
}: {
  data: {
    id: string;
    nombre: string;
    respondieron: number;
    total: number;
    tasaRespuesta: number;
  }[];
}) {
  const rows = data.map((d) => ({
    name: d.nombre,
    respondieron: d.respondieron,
    pendientes: Math.max(d.total - d.respondieron, 0),
    color: ENCUESTA_COLOR[d.id] ?? "#7a8fa8",
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2737" horizontal={false} />
          <XAxis type="number" stroke="#7a8fa8" tick={axisStyle} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#7a8fa8"
            tick={axisStyle}
            width={160}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 170, 0.06)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#a0aec0" }}
          />
          <Bar dataKey="respondieron" name="Respondieron" stackId="t" radius={[0, 0, 0, 0]}>
            {rows.map((r, i) => (
              <Cell key={i} fill={r.color} />
            ))}
          </Bar>
          <Bar
            dataKey="pendientes"
            name="No respondieron"
            stackId="t"
            fill="#3a4555"
            radius={[0, 4, 4, 0]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a0aec0", paddingTop: 8 }}
            iconType="circle"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
