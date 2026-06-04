import Image from "next/image";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Logo de SIMCO con fallback a wordmark de texto.
 *
 * Para usar el logo real:
 *   1. Guarda el archivo como `public/simco-logo.svg` (preferido) o `.png`
 *   2. Opcionalmente, una versión blanca para fondo oscuro: `simco-logo-white.svg`
 *
 * El componente detecta automáticamente cuál existe.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

function findLogo(): { src: string; format: "svg" | "png" } | null {
  try {
    const files = readdirSync(PUBLIC_DIR);
    // Prefer white variant for dark background
    const candidates = [
      "simco-logo-white.svg",
      "simco-logo-light.svg",
      "simco-logo.svg",
      "simco-logo-white.png",
      "simco-logo.png",
    ];
    for (const c of candidates) {
      if (files.includes(c)) {
        const ext = c.endsWith(".svg") ? "svg" : "png";
        return { src: `/${c}`, format: ext };
      }
    }
  } catch {
    /* dir doesn't exist */
  }
  return null;
}

interface SimcoLogoProps {
  /** Height in px. Width auto-scales. */
  height?: number;
  /** Show "RH" subtitle next to the logo. */
  showSubtitle?: boolean;
}

export function SimcoLogo({ height = 28, showSubtitle = true }: SimcoLogoProps) {
  const logo = findLogo();

  if (logo) {
    return (
      <div className="flex items-center gap-3">
        <Image
          src={logo.src}
          alt="SIMCO"
          height={height}
          width={height * 3}
          className="w-auto"
          style={{ height }}
          priority
          unoptimized={logo.format === "svg"}
        />
        {showSubtitle && (
          <div className="border-l border-[var(--color-border)] pl-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent-teal)]">
              Dashboard RH
            </p>
            <p className="text-[9px] text-[var(--color-text-dim)] mt-0.5">
              Vista CEO
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback wordmark
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
        SIMCO
      </h1>
      {showSubtitle && (
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent-teal)]">
          Dashboard RH
        </p>
      )}
    </div>
  );
}
