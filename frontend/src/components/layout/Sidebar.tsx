"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Bell,
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileDown,
  
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { dashboardApi, paymentsApi, type StatsResponse } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/ventes", label: "Mes ventes", icon: ShoppingBag },
  { href: "/sync", label: "Connecter mes comptes", icon: RefreshCw },
  { href: "/alertes", label: "Alertes fiscales", icon: Bell },
  { href: "/export", label: "Rapports & Export", icon: FileDown },
];

// ─── DAC7 Mini Widget ─────────────────────────────────────────────────────────

function DAC7Widget({ onClose }: { onClose?: () => void }) {
  const year = new Date().getFullYear();
  const { data: stats } = useSWR<StatsResponse>(
    `/api/v1/dashboard/stats?year=${year}`,
    () => dashboardApi.stats(year),
    { refreshInterval: 60_000 }
  );

  const alertLevel = stats?.alert_level ?? "safe";
  const txPct = stats
    ? Math.min((stats.threshold_transactions.current / stats.threshold_transactions.max) * 100, 100)
    : 0;
  const revPct = stats
    ? Math.min((stats.threshold_receipts.current / stats.threshold_receipts.max) * 100, 100)
    : 0;
  const maxPct = Math.max(txPct, revPct);

  const alertStyles = {
    safe: {
      container: "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
      icon: "bg-emerald-500/15 text-emerald-400",
      bar: "bg-emerald-500",
      text: "text-emerald-300",
      Icon: CheckCircle2,
    },
    warning: {
      container: "border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/12",
      icon: "bg-amber-500/15 text-amber-400",
      bar: "bg-amber-500",
      text: "text-amber-300",
      Icon: AlertTriangle,
    },
    danger: {
      container: "border-red-500/25 bg-red-500/8 hover:bg-red-500/12",
      icon: "bg-red-500/15 text-red-400",
      bar: "bg-red-500",
      text: "text-red-300",
      Icon: AlertTriangle,
    },
    exceeded: {
      container: "border-red-500/40 bg-red-500/12 hover:bg-red-500/15",
      icon: "bg-red-500/20 text-red-400",
      bar: "bg-red-500",
      text: "text-red-300",
      Icon: AlertTriangle,
    },
  }[alertLevel];

  const labelMap = {
    safe: "Seuils DAC7 — OK",
    warning: "Attention — Seuil à 70%",
    danger: "Danger — Seuil à 85%",
    exceeded: "Seuil DAC7 dépassé !",
  }[alertLevel];

  return (
    <Link
      href="/alertes"
      onClick={onClose}
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border px-3 py-3 transition-all",
        alertStyles.container
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", alertStyles.icon)}>
          <alertStyles.Icon
            className={cn(
              "h-3.5 w-3.5",
              alertLevel === "exceeded" && "animate-pulse"
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-semibold", alertStyles.text)}>{labelMap}</p>
          {stats ? (
            <p className="text-[10px] text-muted-foreground">
              {stats.threshold_transactions.current}/{stats.threshold_transactions.max} tx ·{" "}
              {Math.round((stats.threshold_receipts.current / stats.threshold_receipts.max) * 100)}% recettes
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">Chargement…</p>
          )}
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", alertStyles.bar)}
          style={{ width: `${maxPct}%` }}
        />
      </div>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full flex-col bg-card/95 border-r border-white/5 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={onClose}
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Revendu
          </span>
        </Link>
      </div>

      <Separator className="opacity-20" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/70 group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live DAC7 widget */}
      <div className="px-3 pb-3">
        <DAC7Widget onClose={onClose} />
      </div>

      <Separator className="opacity-20" />

      {/* User footer */}
      <div className="px-3 py-4 space-y-2">
        {user && (
          <>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-xs font-bold text-indigo-300 shrink-0 border border-indigo-500/20">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate text-foreground">
                    {user.full_name}
                  </p>
                  {user.plan === "pro" && (
                    <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 shrink-0">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            {user.plan === "free" && (
              <button
                type="button"
                onClick={async () => {
                  onClose?.();
                  try {
                    const { checkout_url } = await paymentsApi.createCheckout();
                    window.location.href = checkout_url;
                  } catch {
                    alert("Erreur lors de la création du paiement.");
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                  "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-300",
                  "hover:from-indigo-500/30 hover:to-violet-500/30 hover:border-indigo-500/40"
                )}
              >
                <span>Passer à Pro</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}

        {/* Pricing link for all users */}
        <Link
          href="/pricing"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="flex-1">{user?.plan === "pro" ? "Plans & Tarifs" : "Voir les plans"}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </aside>
  );
}
