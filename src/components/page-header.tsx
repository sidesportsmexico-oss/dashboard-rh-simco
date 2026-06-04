import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Extra meta items shown to the right (chips, period selectors, etc.) */
  actions?: React.ReactNode;
  /** Tags shown below the subtitle (e.g. ["Vista CEO", "Potentor API"]) */
  tags?: string[];
  /** Show the "Actualizado hoy" live indicator. */
  liveIndicator?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  tags = [],
  liveIndicator = true,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8", className)}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--color-text-dim)]">
        {tags.map((t, i) => (
          <span key={t} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--color-border)]">·</span>}
            <span>{t}</span>
          </span>
        ))}
        {liveIndicator && (
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--color-border)]">·</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)] animate-pulse" />
              <span>Actualizado hoy</span>
            </span>
          </span>
        )}
      </div>
    </header>
  );
}
