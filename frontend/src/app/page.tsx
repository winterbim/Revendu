import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  TrendingUp,
  Bell,
  FileText,
  Shield,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Zap,
  Star,
  Package,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Revendu – Tracker de profit pour revendeurs Vinted et Leboncoin",
  description:
    "Suivez vos ventes Vinted, Leboncoin et eBay. Calculez votre bénéfice net et recevez des alertes avant d'atteindre le seuil fiscal DAC7. Gratuit pour commencer.",
};

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-all group-hover:scale-105 group-hover:shadow-indigo-500/50">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Revendu</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Fonctionnalités", href: "#features" },
            { label: "DAC7", href: "#dac7" },
            { label: "Tarifs", href: "/pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            Commencer
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-16 pb-24 aurora-bg">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Aurora orbs */}
      <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[100px] pointer-events-none animate-glow-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-emerald-500/6 blur-[80px] pointer-events-none animate-glow-pulse delay-400" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 text-center">
        {/* Animated badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 mb-10 animate-fade-up">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">
            Alertes DAC7 en temps réel
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-6 animate-fade-up delay-100">
          Revendu —
          <br />
          <span className="text-gradient-animate">
            Ventes trackées,
          </span>
          <br />
          <span className="text-foreground/90">fisc maîtrisé.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up delay-200">
          Depuis 2024, Vinted transmet vos données au fisc au-delà de{" "}
          <span className="text-foreground font-semibold">2 000 €</span>.
          Revendu vous protège — en temps réel.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-up delay-300">
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all active:scale-[0.97]"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-foreground hover:bg-white/10 hover:border-white/20 transition-all"
          >
            Voir les fonctionnalités
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>

        {/* Social proof mini */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up delay-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Gratuit pour commencer
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Aucune CB requise
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Données chiffrées · RGPD
          </span>
        </div>

        {/* Mock dashboard */}
        <div className="relative mt-20 mx-auto max-w-4xl animate-fade-up delay-500">
          {/* Floating stat cards */}
          <div className="absolute -left-4 top-16 z-20 hidden lg:flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-card/90 px-4 py-3 shadow-2xl backdrop-blur-xl animate-float">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bénéfice net</p>
              <p className="text-sm font-bold text-emerald-400">+842 €</p>
            </div>
          </div>

          <div className="absolute -right-4 top-8 z-20 hidden lg:flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-card/90 px-4 py-3 shadow-2xl backdrop-blur-xl animate-float delay-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <Bell className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seuil transactions</p>
              <p className="text-sm font-bold text-amber-400">23 / 30 — 77%</p>
            </div>
          </div>

          <div className="absolute -right-4 bottom-20 z-20 hidden lg:flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-card/90 px-4 py-3 shadow-2xl backdrop-blur-xl animate-float delay-700">
            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-xs font-semibold text-indigo-300">Alerte envoyée</p>
              <p className="text-[10px] text-muted-foreground">Seuil à 77% atteint</p>
            </div>
          </div>

          {/* Browser frame */}
          <div className="rounded-2xl border border-white/8 bg-card shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden glow-indigo">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-muted/40 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/50" />
              <div className="h-3 w-3 rounded-full bg-amber-400/50" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/50" />
              <div className="mx-4 flex-1 max-w-xs">
                <div className="h-5 rounded-md bg-muted/60 flex items-center justify-center gap-1.5">
                  <Shield className="h-2.5 w-2.5 text-emerald-400" />
                  <span className="text-[10px] text-muted-foreground">app.revendu.fr/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-5 space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Bénéfice net", value: "+842 €", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
                  { label: "Recettes brutes", value: "1 380 €", color: "text-foreground", bg: "bg-muted/30 border-border" },
                  { label: "Articles vendus", value: "23", color: "text-foreground", bg: "bg-muted/30 border-border" },
                  { label: "En stock", value: "7", color: "text-indigo-400", bg: "bg-indigo-500/8 border-indigo-500/15" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-xl border p-3 ${stat.bg}`}
                  >
                    <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* DAC7 thresholds */}
              <div className="rounded-xl border border-white/6 bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Seuils DAC7 — 2024
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Attention
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Transactions", pct: 77, current: "23", max: "30", color: "bg-amber-500", textColor: "text-amber-400" },
                    { label: "Recettes brutes", pct: 69, current: "1 380 €", max: "2 000 €", color: "bg-emerald-500", textColor: "text-emerald-400" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center text-[10px] mb-1.5">
                        <span className="text-foreground/80 font-medium">{item.label}</span>
                        <span className={`${item.textColor} font-semibold`}>
                          {item.current} / {item.max} ({item.pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features — Bento Grid ────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-sm pointer-events-none opacity-50" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 mb-6 backdrop-blur-sm">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tout ce dont vous avez besoin
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Simple.{" "}
            <span className="text-gradient">Précis. Rassurant.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Conçu pour les revendeurs qui veulent garder le contrôle
            sans prise de tête.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {/* Large card — spans 2 cols */}
          <div className="lg:col-span-2 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/8 via-card to-card p-7 spotlight-card group">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Suivi des profits en temps réel
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ajoutez vos achats et ventes sur toutes les plateformes.
                  Revendu calcule automatiquement votre bénéfice net après
                  déduction des frais et commissions.
                </p>
              </div>
            </div>

            {/* Inline mini-preview */}
            <div className="rounded-xl border border-white/5 bg-background/60 p-4 space-y-2.5">
              {[
                { name: "Air Max 90", platform: "Vinted", buy: "45 €", sell: "72 €", profit: "+27 €", color: "text-emerald-400" },
                { name: "iPhone 13", platform: "Leboncoin", buy: "380 €", sell: "450 €", profit: "+70 €", color: "text-emerald-400" },
                { name: "Veste Zara", platform: "Vestiaire", buy: "25 €", sell: "22 €", profit: "-3 €", color: "text-red-400" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                      <Package className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-muted-foreground/60">{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{item.buy} → {item.sell}</span>
                    <span className={`font-bold w-12 text-right ${item.color}`}>{item.profit}</span>
                  </div>
                </div>
              ))}
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {["Vinted", "Leboncoin", "eBay", "Vestiaire", "Autres"].map((p) => (
                <li key={p} className="rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3 py-1 text-xs font-medium text-indigo-300">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* DAC7 alert card */}
          <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/8 via-card to-card p-7 spotlight-card group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20 mb-5 group-hover:scale-105 transition-transform">
              <Bell className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Alerte seuil DAC7
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Recevez des alertes avant d'atteindre les seuils de 30 transactions
              ou 2 000 €. Ne soyez plus pris par surprise.
            </p>

            {/* Alert levels visual */}
            <div className="space-y-2">
              {[
                { label: "safe", pct: 60, color: "bg-emerald-500", text: "text-emerald-400" },
                { label: "warning", pct: 75, color: "bg-amber-500", text: "text-amber-400" },
                { label: "danger", pct: 90, color: "bg-red-500", text: "text-red-400" },
              ].map((level) => (
                <div key={level.label} className="flex items-center gap-3 text-xs">
                  <span className={`w-14 text-right font-medium ${level.text} capitalize`}>{level.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5">
                    <div className={`h-full ${level.color} rounded-full`} style={{ width: `${level.pct}%` }} />
                  </div>
                  <span className="text-muted-foreground/60 w-8">{level.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export card */}
          <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/8 via-card to-card p-7 spotlight-card group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20 mb-5 group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Export déclaration
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Générez un rapport annuel prêt pour votre expert-comptable ou
              votre déclaration de revenus.
            </p>
            <ul className="space-y-2">
              {[
                "Rapport PDF ou CSV annoté",
                "Récapitulatif par plateforme",
                "Compatible formats DGFIP",
              ].map((bullet) => (
                <li key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy card */}
          <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/8 via-card to-card p-7 spotlight-card group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20 mb-5 group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Sécurité & confidentialité
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Vos données financières sont chiffrées, hébergées en Europe
              et ne sont jamais partagées.
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Chiffrement AES-256", ok: true },
                { label: "Hébergement UE", ok: true },
                { label: "RGPD conforme", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DAC7 Explainer ───────────────────────────────────────────────────────────

function DAC7Explainer() {
  return (
    <section id="dac7" className="py-28 bg-muted/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
      <div className="absolute top-1/2 left-0 h-[400px] w-[400px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left explanation */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/8 px-4 py-1.5 mb-8">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Ce que dit la loi DAC7
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Depuis 2024, Vinted
              <br />
              <span className="text-gradient">parle à votre fisc</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
              La directive européenne DAC7 impose aux plateformes comme Vinted,
              Leboncoin et eBay de transmettre vos données de vente au DGFIP
              si vous dépassez l'un de ces deux seuils annuels :
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  threshold: "30 transactions / an",
                  desc: "Articles vendus dans l'année, toutes plateformes confondues",
                  color: "border-indigo-500/30 bg-indigo-500/8",
                  badge: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
                  icon: "🔢",
                },
                {
                  threshold: "2 000 € de recettes brutes",
                  desc: "Montant encaissé, avant déduction de vos coûts",
                  color: "border-emerald-500/30 bg-emerald-500/8",
                  badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
                  icon: "💶",
                },
              ].map((item) => (
                <div key={item.threshold} className={`rounded-xl border p-5 ${item.color}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-lg font-bold text-foreground">{item.threshold}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-9">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/50 bg-card/60 p-5 text-sm text-muted-foreground backdrop-blur-sm">
              <strong className="text-foreground">Bon à savoir :</strong> être transmis au fisc
              ne signifie pas forcément payer des impôts. C'est le bénéfice net
              (revente − achat − frais) qui est imposable, pas le montant brut.
            </div>
          </div>

          {/* Right timeline */}
          <div className="space-y-3">
            {[
              {
                step: "01",
                title: "Vous dépassez un seuil",
                desc: "30 transactions ou 2 000 € de recettes dans l'année",
                icon: "📊",
                color: "border-border/60 bg-card/40",
                accent: "text-muted-foreground",
              },
              {
                step: "02",
                title: "La plateforme notifie le DGFIP",
                desc: "Automatiquement, sans action de votre part",
                icon: "📤",
                color: "border-amber-500/25 bg-amber-500/5",
                accent: "text-amber-400",
              },
              {
                step: "03",
                title: "Votre déclaration est pré-remplie",
                desc: "Les revenus apparaissent dans votre espace impots.gouv.fr",
                icon: "📋",
                color: "border-blue-500/25 bg-blue-500/5",
                accent: "text-blue-400",
              },
              {
                step: "04",
                title: "Vous déclarez (et prouvez vos coûts)",
                desc: "Seul le bénéfice net est taxable. Gardez vos justificatifs.",
                icon: "✅",
                color: "border-emerald-500/25 bg-emerald-500/5",
                accent: "text-emerald-400",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex gap-4 rounded-xl border p-5 transition-all hover:scale-[1.01] hover:border-primary/30 ${item.color}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-lg">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${item.accent}`}>{item.step}</span>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof ─────────────────────────────────────────────────────────────

function SocialProof() {
  const testimonials = [
    {
      name: "Sarah M.",
      handle: "@sarah_vinted",
      platform: "Vinted",
      avatar: "SM",
      avatarGradient: "from-violet-500 to-indigo-500",
      text: "J'avais zéro idée que je m'approchais des 30 transactions. Revendu m'a alertée à 25. Absolument indispensable.",
      rating: 5,
    },
    {
      name: "Thomas K.",
      handle: "@tk_resell",
      platform: "Leboncoin & eBay",
      avatar: "TK",
      avatarGradient: "from-indigo-500 to-cyan-500",
      text: "Interface ultra propre, j'ai migré tous mes suivis Excel ici en 10 minutes. Le calcul des frais Vinted est automatique.",
      rating: 5,
    },
    {
      name: "Julie D.",
      handle: "@julie_secondhand",
      platform: "Vestiaire Collective",
      avatar: "JD",
      avatarGradient: "from-emerald-500 to-teal-500",
      text: "Enfin un outil fait pour les revendeurs français. La page d'explication DAC7 m'a économisé 2h de recherches.",
      rating: 5,
    },
  ];

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-sm pointer-events-none opacity-30" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {[
            { value: "4 200+", label: "Revendeurs actifs", gradient: "from-indigo-400 to-violet-400" },
            { value: "127 k€", label: "Profits suivis", gradient: "from-emerald-400 to-teal-400" },
            { value: "98%", label: "Satisfaction", gradient: "from-amber-400 to-orange-400" },
            { value: "<2 min", label: "Pour commencer", gradient: "from-indigo-400 to-emerald-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <p className={`text-4xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform inline-block`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            Ils font confiance à Revendu
          </h2>
          <p className="text-muted-foreground text-lg">
            Des revendeurs comme vous, sur toutes les plateformes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/6 bg-card/60 p-7 backdrop-blur-sm spotlight-card"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.handle} · {t.platform}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none animate-glow-pulse" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-4 py-1.5 mb-8">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
            Simple et transparent
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Gratuit pour commencer
        </h2>
        <p className="text-xl text-muted-foreground mb-16">
          Pas de carte bleue, pas de surprise.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-white/8 bg-card/80 p-8 text-left backdrop-blur-sm">
            <div className="mb-7">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Gratuit</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-foreground">0€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
            </div>
            <ul className="space-y-3.5 mb-8">
              {[
                "Jusqu'à 50 articles",
                "Suivi 2 plateformes",
                "Alertes DAC7 incluses",
                "Export CSV",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-foreground hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Pro — spotlight */}
          <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/12 via-card to-card p-8 text-left overflow-hidden">
            {/* Spotlight */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            {/* Popular badge */}
            <div className="absolute top-5 right-5">
              <span className="rounded-full bg-gradient-to-r from-indigo-500/30 to-violet-500/30 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                Populaire
              </span>
            </div>

            <div className="relative mb-7">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Pro</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-foreground">4€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
            </div>
            <ul className="relative space-y-3.5 mb-8">
              {[
                "Articles illimités",
                "Toutes les plateformes",
                "Alertes email & push",
                "Export PDF + CSV",
                "Historique illimité",
                "Support prioritaire",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="relative block w-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              Essayer Pro gratuitement
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 aurora-bg p-12 sm:p-20 text-center">
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 mb-8">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Rejoignez 4 200 revendeurs
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5 tracking-tight">
              Prenez le contrôle de
              <br />
              <span className="text-gradient-animate">votre fiscalité revendeur</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
              Ne laissez plus Vinted avoir une longueur d'avance sur votre fisc.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all active:scale-[0.97]"
            >
              Commencer gratuitement — c'est immédiat
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-5 text-sm text-muted-foreground">
              Sans carte bleue · Données chiffrées · Supprimable à tout moment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Revendu</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Le tracker de profit pour revendeurs français. DAC7 simplifié.
            </p>
          </div>

          {[
            {
              title: "Produit",
              links: [
                { label: "Fonctionnalités", href: "#features" },
                { label: "Tarifs", href: "#pricing" },
                { label: "DAC7 expliqué", href: "#dac7" },
                { label: "Changelog", href: "#" },
              ],
            },
            {
              title: "Légal",
              links: [
                { label: "Confidentialité", href: "/confidentialite" },
                { label: "CGU", href: "/cgu" },
                { label: "Mentions légales", href: "/mentions-legales" },
              ],
            },
            {
              title: "Contact",
              links: [
                { label: "À propos", href: "/a-propos" },
                { label: "Contact", href: "mailto:hello@revendu.fr" },
                { label: "Twitter", href: "https://twitter.com/revendu_fr" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Revendu. Fait avec ❤️ en France.
            Non affilié à Vinted, Leboncoin ou eBay.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Données hébergées en Europe · RGPD conforme</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Features />
      <DAC7Explainer />
      <SocialProof />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
