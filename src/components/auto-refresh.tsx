"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Indicador + auto-refresh transparente del dashboard.
 *
 * Comportamiento:
 *  - Cada `intervalMs` (default 60s) invalida la cache de Potentor vía
 *    /api/refresh y re-renderiza las Server Components con router.refresh().
 *  - Solo refresca cuando la pestaña está visible (ahorra requests si el
 *    usuario tiene el dashboard en background).
 *  - Muestra "Actualizado hace Xs" con tic 1 seg para feedback visible.
 *  - Click manual fuerza refresh inmediato.
 *
 * La key del endpoint se hardcodea aquí — no es secreto crítico (el endpoint
 * solo invalida cache, no muta nada). Vercel rate-limit protege de abuso.
 */
const REFRESH_KEY = "simco-refresh-2026";
const DEFAULT_INTERVAL_MS = 60_000;

export function AutoRefresh({
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  // Set initial timestamp client-side para evitar mismatch SSR.
  useEffect(() => {
    setLastRefresh(Date.now());
  }, []);

  const doRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetch(`/api/refresh?key=${REFRESH_KEY}`, {
        cache: "no-store",
      });
      router.refresh();
      setLastRefresh(Date.now());
    } catch {
      // Silencioso — no queremos romper la UI por un fail de refresh
    } finally {
      setRefreshing(false);
    }
  }, [router, refreshing]);

  // Auto-refresh cuando la pestaña está visible
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        doRefresh();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, doRefresh]);

  // Tic 1 seg para que el contador "hace Xs" avance
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Refresh cuando vuelve a foco después de >2 min
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== "visible") return;
      if (!lastRefresh) return;
      const since = Date.now() - lastRefresh;
      if (since > 2 * 60_000) doRefresh();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [doRefresh, lastRefresh]);

  const ago = lastRefresh
    ? Math.floor((Date.now() - lastRefresh) / 1000)
    : null;

  const agoLabel =
    ago === null
      ? "—"
      : ago < 5
        ? "ahora"
        : ago < 60
          ? `hace ${ago}s`
          : ago < 3600
            ? `hace ${Math.floor(ago / 60)}m`
            : `hace ${Math.floor(ago / 3600)}h`;

  // tick variable es solo para forzar re-render con nuevo Date.now()
  void tick;

  return (
    <button
      type="button"
      onClick={doRefresh}
      disabled={refreshing}
      aria-label="Refrescar datos del dashboard"
      title="Click para refrescar manualmente"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full
                 border border-[var(--color-border)] bg-[var(--color-bg-card)]/95 backdrop-blur
                 px-3 py-2 text-xs text-[var(--color-text-muted)]
                 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]
                 hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)]
                 hover:border-[var(--color-accent-teal)]/40
                 disabled:opacity-60 disabled:cursor-not-allowed
                 transition-all cursor-pointer
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-teal)]"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${
          refreshing
            ? "animate-spin text-[var(--color-accent-teal)]"
            : "text-[var(--color-text-dim)]"
        }`}
      />
      <span className="tabular-nums">
        {refreshing ? "Actualizando…" : `Actualizado ${agoLabel}`}
      </span>
    </button>
  );
}
