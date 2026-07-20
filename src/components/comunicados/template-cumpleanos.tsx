"use client";

import Image from "next/image";

interface Props {
  nombre: string;
  puesto: string;
  fechaCumple: string; // "03 DE JULIO"
  fotoUrl: string | null;
}

/**
 * Template de comunicado de cumpleaños — fondo blanco.
 * Réplica del diseño en Google Slides:
 *  - Globos oro/rosa/negro a la izquierda (con confeti)
 *  - "Happy Birthday" script en teal arriba
 *  - Foto B&W del festejado a la derecha (con esquinas redondeadas)
 *  - Nombre + puesto + fecha abajo
 *  - Footer con logos Mulligan's / SIMCO / Batbox
 *
 * Renderiza a 1080x1080 (Instagram / square) — proporción del diseño original.
 * html-to-image lo captura tal cual.
 */
export function TemplateCumpleanos({ nombre, puesto, fechaCumple, fotoUrl }: Props) {
  // Split nombre en primer palabra vs resto para color diferencial
  const partes = nombre.trim().split(/\s+/);
  const primerNombre = partes[0] ?? "";
  const restoNombre = partes.slice(1).join(" ");

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: "#ffffff",
        position: "relative",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#111",
        overflow: "hidden",
      }}
    >
      {/* Globos a la izquierda */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 400,
          height: 900,
        }}
      >
        <Image
          src="/comunicados/balloons.png"
          alt=""
          fill
          style={{ objectFit: "contain", objectPosition: "left top" }}
          unoptimized
          priority
        />
      </div>

      {/* "Happy Birthday" texto arriba a la derecha */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 80,
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#000",
            letterSpacing: "0.02em",
          }}
        >
          Happy
        </span>
        <div style={{ position: "relative", width: 340, height: 130 }}>
          <Image
            src="/comunicados/birthday-script.png"
            alt="Birthday"
            fill
            style={{ objectFit: "contain" }}
            unoptimized
            priority
          />
        </div>
      </div>

      {/* Foto B&W a la derecha */}
      <div
        style={{
          position: "absolute",
          top: 250,
          right: 130,
          width: 440,
          height: 540,
          borderRadius: 40,
          overflow: "hidden",
          background: "#f5f5f5",
          boxShadow: "0 6px 22px rgba(0,0,0,0.08)",
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
              color: "#bbb",
              fontSize: 22,
              padding: 24,
              textAlign: "center",
            }}
          >
            📷 Foto del festejado
          </div>
        )}
      </div>

      {/* Nombre + puesto + fecha abajo */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 180,
          textAlign: "right",
          maxWidth: 600,
        }}
      >
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: "0.02em",
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: "#000" }}>{primerNombre.toUpperCase()}</span>
          {restoNombre && (
            <>
              {" "}
              <span style={{ color: "#00d4aa" }}>{restoNombre.toUpperCase()}</span>
            </>
          )}
        </div>
        <div
          style={{
            fontSize: 26,
            fontStyle: "italic",
            marginTop: 18,
            color: "#333",
          }}
        >
          {puesto.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 12,
            fontWeight: 700,
            color: "#333",
            letterSpacing: "0.02em",
          }}
        >
          {fechaCumple.toUpperCase()}
        </div>
      </div>

      {/* Footer con logos (fondo negro → logos invertidos a blanco) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 130,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 80px",
          background: "#000",
        }}
      >
        <div style={{ position: "relative", width: 220, height: 60 }}>
          <Image
            src="/comunicados/logo-mulligans.png"
            alt="Mulligans"
            fill
            style={{ objectFit: "contain", filter: "invert(1)" }}
            unoptimized
          />
        </div>
        <div style={{ position: "relative", width: 150, height: 70 }}>
          <Image
            src="/Logo-SIMCO-TRANSP.png"
            alt="SIMCO"
            fill
            style={{ objectFit: "contain" }}
            unoptimized
          />
        </div>
        <div style={{ position: "relative", width: 220, height: 70 }}>
          <Image
            src="/comunicados/logo-batbox-blanco.png"
            alt="Batbox"
            fill
            style={{ objectFit: "contain" }}
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
