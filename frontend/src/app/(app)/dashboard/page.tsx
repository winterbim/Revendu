"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { TrendingUp, DollarSign, ShoppingCart, Package, ArrowUpRight, Sparkles, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ThresholdGauge } from "@/components/dashboard/ThresholdGauge";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { SankeyChart } from "@/components/dashboard/SankeyChart";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { formatEuro } from "@/lib/utils";
import { dashboardApi, paymentsApi, type StatsResponse, type Item } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSidebar } from "../sidebar-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function YearSelector({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-1 py-1">
      <button
        type="button"
        onClick={() => onChange(year - 1)}
        disabled={year <= 2020}
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Année précédente"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[3rem] text-center text-sm font-semibold text-foreground tabular-nums">
        {year}
      </span>
      <button
        type="button"
        onClick={() => onChange(year + 1)}
        disabled={year >= currentYear}
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Année suivante"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function WelcomeBanner({
  user,
  stats,
  year,
}: {
  user: { full_name: string } | null;
  stats?: StatsResponse;
  year: number;
}) {
  const firstName = user?.full_name.split(" ")[0] ?? "Revendeur";
  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? "Bonne nuit"
      : hour < 12
      ? "Bonjour"
      : hour < 18
      ? "Bon après-midi"
      : "Bonsoir";

  const alertLevel = stats?.alert_level ?? "safe";
  const alertConfig = {
    safe: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "✅", msg: "Vos seuils DAC7 sont sûrs" },
    warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "⚠️", msg: "Attention — 70% du seuil DAC7 atteint" },
    danger: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: "🔴", msg: "Danger — 85% du seuil DAC7 atteint" },
    exceeded: { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: "🚨", msg: "Seuil DAC7 dépassé — déclaration requise" },
  }[alertLevel];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-br from-indigo-500/8 via-card to-card p-6 aurora-bg">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300/80">{greeting},</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Vue d&apos;ensemble de vos ventes {year}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {stats && (
            <div className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${alertConfig.bg} ${alertConfig.color}`}>
              <span>{alertConfig.icon}</span>
              <span>{alertConfig.msg}</span>
            </div>
          )}
          <Link
            href="/ventes"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/90 px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            Ajouter une vente
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProFeatureOverlay({ isAvailable }: { isAvailable: boolean }) {
  if (isAvailable) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Lock className="h-6 w-6 text-amber-400" />
        <p className="text-xs font-semibold text-white">Réservé à Revendu Pro</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { openSidebar } = useSidebar();
  const { user } = useAuth();
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: stats, isLoading: statsLoading } = useSWR<StatsResponse>(
    `/api/v1/dashboard/stats?year=${year}`,
    () => dashboardApi.stats(year)
  );

  const { data: recentSales, isLoading: salesLoading } = useSWR<Item[]>(
    `/api/v1/dashboard/recent-sales?year=${year}`,
    () => dashboardApi.recentSales(year)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Tableau de bord"
        subtitle={<YearSelector year={year} onChange={setYear} />}
        onMenuClick={openSidebar}
      />

      <div className="flex-1 p-4 md:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Onboarding wizard for new users */}
        <OnboardingWizard />

        {/* Welcome banner */}
        <WelcomeBanner user={user} stats={stats} year={year} />

        {/* Upgrade banner for free users */}
        {user?.plan === "free" && (
          <button
            type="button"
            onClick={async () => {
              try {
                const { checkout_url } = await paymentsApi.createCheckout();
                window.location.href = checkout_url;
              } catch {
                alert("Erreur lors de la création du paiement. Veuillez réessayer.");
              }
            }}
            className="w-full flex items-center justify-between gap-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-4 hover:border-indigo-500/50 hover:from-indigo-500/15 hover:to-violet-500/15 transition-all text-left"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Lock className="h-5 w-5 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Débloquez des fonctionnalités avancées</p>
                <p className="text-xs text-muted-foreground">Export PDF, synchronisation Gmail, breakdown par plateforme et bien plus avec Revendu Pro</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 shrink-0 hover:bg-indigo-500/30">
              Passer à Pro →
            </span>
          </button>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Bénéfice net"
            value={stats ? formatEuro(stats.total_profit) : "—"}
            subtitle={`Année ${year}`}
            icon={TrendingUp}
            variant={stats ? (stats.total_profit >= 0 ? "profit" : "danger") : "default"}
            loading={statsLoading}
          />
          <StatsCard
            title="Recettes brutes"
            value={stats ? formatEuro(stats.gross_receipts) : "—"}
            subtitle="Total des ventes (DAC7)"
            icon={DollarSign}
            variant="indigo"
            loading={statsLoading}
          />
          <StatsCard
            title="Articles vendus"
            value={stats ? String(stats.total_sold_items) : "—"}
            subtitle={`${stats?.threshold_transactions.current ?? 0} / 30 transactions DAC7`}
            icon={ShoppingCart}
            variant="default"
            loading={statsLoading}
          />
          <StatsCard
            title="Bénéfice moyen"
            value={stats ? formatEuro(stats.avg_profit_per_item) : "—"}
            subtitle="Par article vendu"
            icon={Package}
            variant="default"
            loading={statsLoading}
          />
        </div>

        {/* Threshold gauges */}
        <ThresholdGauge
          transactionsCount={stats?.threshold_transactions.current ?? 0}
          transactionsMax={stats?.threshold_transactions.max ?? 30}
          grossRevenue={stats?.threshold_receipts.current ?? 0}
          revenueMax={stats?.threshold_receipts.max ?? 2000}
          alertLevel={stats?.alert_level ?? "safe"}
          loading={statsLoading}
        />

        {/* Charts + Recent sales */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="relative">
            <PlatformChart
              data={stats?.platform_breakdown ?? []}
              loading={statsLoading}
            />
            <ProFeatureOverlay isAvailable={stats?.is_pro ?? false} />
          </div>
          <RecentSales
            items={recentSales ?? []}
            loading={salesLoading}
          />
        </div>

        {/* Sankey — flux financier */}
        <div className="rounded-xl border border-white/6 bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Flux financier — Analyse Sankey
          </h2>
          <div style={{ height: 320 }}>
            <div className="relative">
              <SankeyChart stats={stats} loading={statsLoading} />
              <ProFeatureOverlay isAvailable={stats?.is_pro ?? false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
