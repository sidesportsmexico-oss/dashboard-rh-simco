"use client";

import Image from "next/image";

interface Props {
  nombre: string;
  puesto: string;
  /** Numeral en letra ("Primer", "Segundo", "Cuarto", "Décimo", …) */
  aniversarioTexto: string;
  fotoUrl: string | null;
  variante: "dark" | "light";
}

/**
 * Template de aniversario — 2 variantes (dark/light).
 * Réplica del diseño en Google Slides:
 *  - Logos Batbox / SIMCO / Mulligan's arriba en fila
 *  - Foto B&W del festejado a la izquierda
 *  - "N° ANIVERSARIO" grande a la derecha (verde teal + blanco/negro)
 *  - Nombre grande (partido en primer/resto de palabras con colores alternos)
 *  - Puesto
 *  - Frase "Más que un aniversario, una historia que continúa"
 *  - Ilustración de personas celebrando abajo
 */
export function TemplateAniversario({
  nombre,
  puesto,
  aniversarioTexto,
  fotoUrl,
  variante,
}: Props) {
  const bg = variante === "dark" ? "#000" : "#fff";
  const fg = variante === "dark" ? "#fff" : "#111";
  const teal = "#00d4aa";
  const logoInvert = variante === "dark" ? "" : "invert(1)";

  const partes = nombre.trim().split(/\s+/);
  const primerNombre = partes[0] ?? "";
  const restoNombre = partes.slice(1).join(" ");

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: bg,
        position: "relative",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: fg,
        overflow: "hidden",
      }}
    >
      {/* Logos header.
          Assets originales son NEGRO puro. Sobre fondo negro necesitan invert(1);
          sobre fondo blanco quedan tal cual.
          SIMCO ya viene con transparencia y color propio, solo invertimos en light. */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 100px",
        }}
      >
        <div style={{ position: "relative", width: 220, height: 70 }}>
          <Image
            src={
              variante === "dark"
                ? "/comunicados/logo-batbox-blanco.png"
                : "/comunicados/logo-batbox-negro.png"
            }
            alt="Batbox"
            fill
            style={{ objectFit: "contain" }}
            unoptimized
            priority
          />
        </div>
        <div style={{ position: "relative", width: 150, height: 70 }}>
          <Image
            src="/Logo-SIMCO-TRANSP.png"
            alt="SIMCO"
            fill
            style={{
              objectFit: "contain",
              filter: variante === "light" ? "invert(1)" : "",
            }}
            unoptimized
            priority
          />
        </div>
        <div style={{ position: "relative", width: 240, height: 70 }}>
          <Image
            src="/comunicados/logo-mulligans.png"
            alt="Mulligans"
            fill
            style={{
              objectFit: "contain",
              filter: variante === "dark" ? "invert(1)" : "",
            }}
            unoptimized
            priority
          />
        </div>
      </div>

      {/* Foto B&W a la izquierda */}
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 90,
          width: 380,
          height: 500,
          borderRadius: 36,
          overflow: "hidden",
          background: variante === "dark" ? "#111" : "#f5f5f5",
          boxShadow:
            variante === "light" ? "0 6px 22px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: variante === "dark" ? "#555" : "#bbb",
              fontSize: 22,
              padding: 24,
              textAlign: "center",
            }}
          >
            📷 Foto del festejado
          </div>
        )}
      </div>

      {/* Bloque texto derecha */}
      <div
        style={{
          position: "absolute",
          top: 200,
          right: 90,
          width: 490,
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1,
            color: teal,
            letterSpacing: "-0.01em",
          }}
        >
          {aniversarioTexto.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 62,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1,
            marginTop: 6,
            color: fg,
            letterSpacing: "-0.01em",
          }}
        >
          ANIVERSARIO
        </div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 40,
            letterSpacing: "-0.01em",
          }}
        >
          <div style={{ color: fg }}>{primerNombre.toUpperCase()}</div>
          {restoNombre && (
            <div style={{ color: teal, marginTop: 4 }}>
              {restoNombre.toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 26,
            marginTop: 40,
            fontWeight: 500,
            color: fg,
            letterSpacing: "0.03em",
          }}
        >
          {puesto.toUpperCase()}
        </div>

        <div
          style={{
            fontSize: 20,
            fontStyle: "italic",
            marginTop: 20,
            color: variante === "dark" ? "#ccc" : "#333",
            letterSpacing: "0.02em",
            lineHeight: 1.4,
            maxWidth: 460,
          }}
        >
          MÁS QUE UN ANIVERSARIO, UNA HISTORIA
          <br />
          QUE CONTINÚA.
        </div>
      </div>

      {/* Ilustración celebración abajo — la PNG ya trae transparencia real
          y colores propios (traje azul, camisa blanca, corbata roja, etc.),
          así que no aplicamos filter en ninguna variante. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 300,
        }}
      >
        <Image
          src="/comunicados/celebration.png"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center bottom",
          }}
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
