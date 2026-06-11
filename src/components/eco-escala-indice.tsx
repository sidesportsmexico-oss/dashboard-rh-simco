/**
 * Mini-escala visual que ubica un score 0-100 dentro de las 5 zonas
 * estándar de clima organizacional. Incluye la zona "activa" resaltada
 * y un puntero ▼ que marca el valor exacto.
 */

interface Banda {
  /** Límite superior exclusivo (la última banda es ≤100). */
  hasta: number;
  label: string;
  shortLabel: string;
  color: string;
  zonaTexto: string;
}

const BANDAS: Banda[] = [
  {
    hasta: 60,
    label: "Crítico",
    shortLabel: "Crít.",
    color: "var(--color-accent-red)",
    zonaTexto: "Intervención urgente",
  },
  {
    hasta: 70,
    label: "Aceptable",
    shortLabel: "Acept.",
    color: "var(--color-accent-orange)",
    zonaTexto: "Focos de atención",
  },
  {
    hasta: 80,
    label: "Bueno",
    shortLabel: "Bueno",
    color: "var(--color-accent-yellow)",
    zonaTexto: "Clima sano con oportunidades de mejora",
  },
  {
    hasta: 90,
    label: "Muy bueno",
    shortLabel: "MB",
    color: "var(--color-accent-blue)",
    zonaTexto: "Clima maduro",
  },
  {
    hasta: 101,
    label: "Excelente",
    shortLabel: "Exc.",
    color: "var(--color-accent-teal)",
    zonaTexto: "Best-in-class",
  },
];

function bandaActual(valor: number): Banda {
  return BANDAS.find((b) => valor < b.hasta) ?? BANDAS[BANDAS.length - 1];
}

export function EcoEscalaIndice({ valor }: { valor: number }) {
  const activa = bandaActual(valor);
  const indiceActiva = BANDAS.indexOf(activa);
  const valorClamped = Math.max(0, Math.min(100, valor));

  return (
    <div className="w-full max-w-xs">
      {/* Etiqueta de zona activa */}
      <div className="text-center mb-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold"
          style={{
            color: activa.color,
            backgroundColor: `color-mix(in srgb, ${activa.color} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${activa.color} 35%, transparent)`,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: activa.color }}
          />
          Zona {activa.label}
        </span>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-1.5 italic">
          {activa.zonaTexto}
        </p>
      </div>

      {/* Barra con las 5 zonas */}
      <div className="relative h-2 flex rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
        {BANDAS.map((b, i) => (
          <div
            key={i}
            className="h-full transition-all"
            style={{
              width:
                i === BANDAS.length - 1
                  ? `${100 - (i === 0 ? 0 : BANDAS[i - 1].hasta)}%`
                  : `${b.hasta - (i === 0 ? 0 : BANDAS[i - 1].hasta)}%`,
              backgroundColor:
                i === indiceActiva
                  ? b.color
                  : `color-mix(in srgb, ${b.color} 28%, transparent)`,
            }}
          />
        ))}
        {/* Puntero del valor actual */}
        <div
          className="absolute top-0 -translate-x-1/2 -translate-y-[1px] flex flex-col items-center"
          style={{ left: `${valorClamped}%` }}
        >
          <div
            className="h-3 w-[2px]"
            style={{ backgroundColor: "var(--color-text)" }}
          />
        </div>
      </div>

      {/* Etiquetas de cada banda */}
      <div className="flex justify-between text-[9px] mt-1.5 text-[var(--color-text-dim)]">
        {BANDAS.map((b, i) => (
          <span
            key={i}
            className={
              i === indiceActiva
                ? "font-semibold text-[var(--color-text)]"
                : ""
            }
            style={i === indiceActiva ? { color: b.color } : {}}
          >
            {b.shortLabel}
          </span>
        ))}
      </div>
    </div>
  );
}
