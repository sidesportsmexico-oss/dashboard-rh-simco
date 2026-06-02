import { AlertCircle } from "lucide-react";

export function ErrorBanner({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4 flex gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-900 dark:text-red-200">
          {title}
        </p>
        {detail && (
          <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-mono">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
