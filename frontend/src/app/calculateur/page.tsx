"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Share2, Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";

const PLATFORMS = [
  { id: "vinted", name: "Vinted", fee: 0.05, fixed: 0.70, color: "#09B1BA" },
  { id: "leboncoin", name: "Leboncoin", fee: 0, fixed: 0, color: "#F56B2A" },
  { id: "ebay", name: "eBay", fee: 0.08, fixed: 0, color: "#E53238" },
  { id: "vestiaire", name: "Vestiaire Collective", fee: 0.20, fixed: 0, color: "#1A1A2E" },
];

export default function CalculateurPage() {
  const [salePrice, setSalePrice] = useState<string>("25");
  const [purchasePrice, setPurchasePrice] = useState<string>("12");
  const [shippingCost, setShippingCost] = useState<string>("3.49");
  const [platform, setPlatform] = useState("vinted");
  const [totalSales, setTotalSales] = useState<string>("15");
  const [totalRevenue, setTotalRevenue] = useState<string>("850");

  const results = useMemo(() => {
    const sale = parseFloat(salePrice) || 0;
    const purchase = parseFloat(purchasePrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const plat = PLATFORMS.find((p) => p.id === platform)!;

    const platformFee = sale * plat.fee + plat.fixed;
    const profit = sale - purchase - platformFee - shipping;
    const margin = sale > 0 ? (profit / sale) * 100 : 0;

    const sales = parseInt(totalSales) || 0;
    const revenue = parseFloat(totalRevenue) || 0;
    const salesPct = Math.min((sales / 30) * 100, 100);
    const revenuePct = Math.min((revenue / 2000) * 100, 100);
    const maxPct = Math.max(salesPct, revenuePct);

    let alertLevel: "safe" | "warning" | "danger" | "exceeded" = "safe";
    if (maxPct >= 100) alertLevel = "exceeded";
    else if (maxPct >= 85) alertLevel = "danger";
    else if (maxPct >= 70) alertLevel = "warning";

    return { sale, purchase, shipping, platformFee, profit, margin, sales, revenue, salesPct, revenuePct, maxPct, alertLevel, platName: plat.name };
  }, [salePrice, purchasePrice, shippingCost, platform, totalSales, totalRevenue]);

  const alertConfig = {
    safe: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Zone sûre", icon: <CheckCircle2 className="h-5 w-5" /> },
    warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Attention", icon: <AlertTriangle className="h-5 w-5" /> },
    danger: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Danger", icon: <AlertTriangle className="h-5 w-5" /> },
    exceeded: { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", label: "Seuil dépassé", icon: <AlertTriangle className="h-5 w-5" /> },
  }[results.alertLevel];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Revendu</span>
          </Link>
          <Link href="/register" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition">
            Créer un compte gratuit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300 border border-indigo-500/20 mb-4">
            <Calculator className="h-4 w-4" />
            Outil gratuit — aucune inscription requise
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Calculateur de profit Vinted
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculez votre vrai profit en 10 secondes. Frais de plateforme, port, protection — tout est déduit.
            Vérifiez aussi vos seuils fiscaux DAC7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Input */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/6 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Détails de la vente</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Plateforme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          platform === p.id
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                            : "border-white/10 bg-white/4 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Prix de vente (€)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-foreground text-lg font-semibold focus:border-indigo-500 focus:outline-none transition"
                    placeholder="25.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Prix d&apos;achat (€)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-foreground text-lg font-semibold focus:border-indigo-500 focus:outline-none transition"
                    placeholder="12.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Frais de port (€)</label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-foreground text-lg font-semibold focus:border-indigo-500 focus:outline-none transition"
                    placeholder="3.49"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* DAC7 Section */}
            <div className="rounded-2xl border border-white/6 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Vos seuils DAC7 (année en cours)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Nombre de ventes cette année</label>
                  <input
                    type="number"
                    value={totalSales}
                    onChange={(e) => setTotalSales(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-foreground font-semibold focus:border-indigo-500 focus:outline-none transition"
                    placeholder="15"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Recettes brutes totales (€)</label>
                  <input
                    type="number"
                    value={totalRevenue}
                    onChange={(e) => setTotalRevenue(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-foreground font-semibold focus:border-indigo-500 focus:outline-none transition"
                    placeholder="850"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {/* Profit Result */}
            <div className="rounded-2xl border border-white/6 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Votre profit réel</h2>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Prix de vente", value: results.sale.toFixed(2), color: "text-foreground" },
                  { label: "Prix d'achat", value: `- ${results.purchase.toFixed(2)}`, color: "text-red-400" },
                  { label: `Frais ${results.platName}`, value: `- ${results.platformFee.toFixed(2)}`, color: "text-red-400" },
                  { label: "Frais de port", value: `- ${results.shipping.toFixed(2)}`, color: "text-red-400" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.color}`}>{row.value} €</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t-2 border-white/10">
                <span className="text-lg font-bold text-foreground">Profit net</span>
                <span className={`text-3xl font-black ${results.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {results.profit.toFixed(2)} €
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Marge : <span className={results.margin >= 0 ? "text-emerald-400" : "text-red-400"}>{results.margin.toFixed(1)}%</span> du prix de vente
              </p>
            </div>

            {/* DAC7 Result */}
            <div className="rounded-2xl border border-white/6 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Statut DAC7</h2>

              <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold mb-4 ${alertConfig.bg} ${alertConfig.color}`}>
                {alertConfig.icon}
                {alertConfig.label} — {results.maxPct.toFixed(0)}%
              </div>

              {/* Transactions gauge */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className={results.salesPct >= 85 ? "text-red-400 font-semibold" : results.salesPct >= 70 ? "text-amber-400" : "text-emerald-400"}>
                    {results.sales} / 30
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      results.salesPct >= 85 ? "bg-red-500" : results.salesPct >= 70 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(results.salesPct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Revenue gauge */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Recettes brutes</span>
                  <span className={results.revenuePct >= 85 ? "text-red-400 font-semibold" : results.revenuePct >= 70 ? "text-amber-400" : "text-emerald-400"}>
                    {results.revenue.toFixed(0)} € / 2 000 €
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      results.revenuePct >= 85 ? "bg-red-500" : results.revenuePct >= 70 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(results.revenuePct, 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Si l&apos;un des deux seuils dépasse 100%, la plateforme transmet vos données à la DGFIP.
              </p>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-6 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">Suivez tout automatiquement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez un compte gratuit pour suivre toutes vos ventes, calculer votre profit réel,
                et recevoir des alertes DAC7 en temps réel.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-lg shadow-indigo-500/20"
              >
                Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Share */}
            <div className="rounded-2xl border border-white/6 bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Cet outil t&apos;a été utile ?</p>
              <div className="flex justify-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("J'ai calculé mon vrai profit Vinted avec cet outil gratuit 👀\n\n25€ de vente = seulement 7,56€ de vrai profit...\n\nCalculez le vôtre →")}&url=${encodeURIComponent("https://revendu.vercel.app/calculateur")}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
                >
                  Partager sur X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://revendu.vercel.app/calculateur")}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
                >
                  Partager sur Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Comment fonctionne ce calculateur ?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ce calculateur gratuit déduit automatiquement tous les frais de votre vente en ligne :
            commission de la plateforme, frais fixes (protection acheteur sur Vinted), et frais de port.
            Le résultat est votre <strong className="text-foreground">profit net réel</strong> — ce que vous gagnez vraiment.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Il intègre aussi un simulateur <strong className="text-foreground">DAC7</strong> qui vous montre
            votre progression vers les seuils de déclaration fiscale (30 transactions ou 2 000€ de recettes brutes par an).
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/blog/dac7-vinted-guide-2026" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
              → Guide complet DAC7
            </Link>
            <Link href="/blog/calculer-profit-vinted" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
              → Détail des frais Vinted
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
