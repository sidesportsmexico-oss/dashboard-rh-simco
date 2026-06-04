import { AlertCircle } from "lucide-react";

export function ErrorBanner({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-accent-red)]/35 bg-[var(--color-accent-red)]/5 p-4 flex gap-3">
      <AlertCircle className="h-5 w-5 text-[var(--color-accent-red)] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-[var(--color-accent-red-soft)]">
          {title}
        </p>
        {detail && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono break-all">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
