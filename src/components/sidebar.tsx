"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  Target,
  Mail,
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
  { href: "/evaluacion-360", label: "Evaluación 360", icon: Target },
  { href: "/comunicados", label: "Comunicados", icon: Mail },
];

export function Sidebar({ logo }: { logo: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30
                 border-r border-[var(--color-border-subtle)]
                 bg-[var(--color-bg-card)]/70 backdrop-blur-xl"
    >
      <div className="flex flex-col flex-1 min-h-0 px-5 py-6">
        <div className="mb-10">{logo}</div>

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
                  "group relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]/50 hover:text-[var(--color-text)]",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[var(--color-accent-teal)]" />
                )}
                <span className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--color-accent-teal)]"
                        : "text-[var(--color-text-dim)] group-hover:text-[var(--color-text-muted)]",
                    )}
                  />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[9px] uppercase tracking-wider rounded-full bg-[var(--color-accent-orange)]/15 text-[var(--color-accent-orange)] px-2 py-0.5 font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-5 mt-5 border-t border-[var(--color-border-subtle)] space-y-2">
          <div className="flex items-center gap-2 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)] animate-pulse" />
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
              Conectado
            </p>
          </div>
          <p className="text-[10px] text-[var(--color-text-dim)] px-2">
            Fuente: Potentor API · v1
          </p>
        </div>
      </div>
    </aside>
  );
}
