"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Anchura del modal: "md" | "lg" | "xl" | "full" */
  size?: "md" | "lg" | "xl" | "full";
}

const SIZES = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-[90vw]",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "lg",
}: ModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock scroll cuando está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 pointer-events-none">
        <div
          className={`pointer-events-auto w-full ${SIZES[size]} max-h-[88vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl shadow-black/50`}
        >
          {/* Header */}
          <header className="flex items-start justify-between gap-4 p-6 border-b border-[var(--color-border-subtle)]">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[var(--color-text-dim)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
