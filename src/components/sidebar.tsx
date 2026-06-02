"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  Target,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/reclutamiento", label: "Reclutamiento", icon: Briefcase },
  { href: "/headcount", label: "Head Count", icon: Users },
  { href: "/eco", label: "ECO", icon: ClipboardList },
  {
    href: "/evaluacion-360",
    label: "Evaluación 360",
    icon: Target,
    badge: "Pendiente API",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex flex-col flex-1 min-h-0 px-4 py-6">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-semibold tracking-tight">SIMCO · RH</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Vista ejecutiva — CEO
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
          <p className="text-[11px] text-zinc-400 px-2">
            Fuente: Potentor API · v1
          </p>
        </div>
      </div>
    </aside>
  );
}
