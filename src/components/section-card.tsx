import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6",
        "transition-all hover:border-[var(--color-border)]/80",
        className,
      )}
    >
      <header className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[var(--color-text)]">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[var(--color-text-dim)] mt-1">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
