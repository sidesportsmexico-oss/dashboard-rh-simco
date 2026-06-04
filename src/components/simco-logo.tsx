import Image from "next/image";
import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Logo de SIMCO con auto-detección + fallback a wordmark de texto.
 *
 * Detecta cualquier archivo en /public que contenga "simco" en el nombre
 * (case-insensitive) con extensión .svg / .png / .webp / .jpg. Prefiere
 * SVG, luego PNG, luego el resto. Si hay variante "white"/"light" en el
 * nombre, esa se prefiere (mejor para fondo oscuro).
 *
 * Para usar otro logo: simplemente reemplaza el archivo en /public.
 */

const PUBLIC_DIR = join(process.cwd(), "public");
const IMAGE_RE = /\.(svg|png|webp|jpg|jpeg)$/i;
const SIMCO_RE = /simco/i;

function rankFile(name: string): number {
  let score = 0;
  if (/\.svg$/i.test(name)) score += 100;
  else if (/\.png$/i.test(name)) score += 80;
  else if (/\.webp$/i.test(name)) score += 60;
  else score += 40;
  if (/white|light/i.test(name)) score += 10; // fondo oscuro → prefiere claro
  if (/transp/i.test(name)) score += 5; // transparente generalmente OK
  return score;
}

function findLogo(): { src: string; isSvg: boolean } | null {
  try {
    const files = readdirSync(PUBLIC_DIR)
      .filter((f) => SIMCO_RE.test(f) && IMAGE_RE.test(f))
      .sort((a, b) => rankFile(b) - rankFile(a));
    if (files.length === 0) return null;
    const best = files[0];
    return {
      src: `/${encodeURIComponent(best)}`,
      isSvg: /\.svg$/i.test(best),
    };
  } catch {
    return null;
  }
}

interface SimcoLogoProps {
  /** Height in px. Width auto-scales by aspect. */
  height?: number;
  /** Show "Dashboard RH / Vista CEO" subtitle next to the logo. */
  showSubtitle?: boolean;
}

export function SimcoLogo({ height = 36, showSubtitle = true }: SimcoLogoProps) {
  const logo = findLogo();

  if (logo) {
    return (
      <div className="flex items-center gap-3">
        <Image
          src={logo.src}
          alt="SIMCO"
          height={height}
          width={height * 4} // ample width; objectFit contain will scale properly
          className="h-auto w-auto max-h-[--logo-h] object-contain object-left"
          style={
            { "--logo-h": `${height}px`, maxHeight: height } as React.CSSProperties
          }
          priority
          unoptimized={logo.isSvg}
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
