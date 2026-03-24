"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowLeft, ArrowRight, Clock } from "lucide-react";

export default function CalculerProfitVinted() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Revendu</span>
          </Link>
          <Link href="/register" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition">
            Commencer gratuitement
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition">
          <ArrowLeft className="h-4 w-4" /> Retour au blog
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">Guide</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> 6 min de lecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            Comment calculer son vrai profit sur Vinted (avec tous les frais)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Le prix de vente affiché n&apos;est pas votre profit. Entre les frais Vinted, la protection acheteur
            et les frais de port, la réalité est souvent très différente. Voici comment calculer ce que vous
            gagnez vraiment.
          </p>
        </div>

        <article className="prose prose-invert prose-lg max-w-none">

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">La formule du profit réel</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Votre <strong className="text-foreground">profit net</strong> sur une vente Vinted se calcule ainsi :
            </p>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 my-6 not-prose text-center">
              <p className="text-lg text-muted-foreground mb-2">Profit net =</p>
              <p className="text-xl font-bold text-foreground">
                Prix de vente <span className="text-red-400">- Prix d&apos;achat</span> <span className="text-red-400">- Frais Vinted</span> <span className="text-red-400">- Protection acheteur</span> <span className="text-red-400">- Frais de port</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Exemple concret : une vente à 25€</h2>
            <div className="rounded-2xl border border-white/6 bg-card p-6 my-6 not-prose">
              <div className="space-y-3">
                {[
                  { label: "Prix de vente", value: "25,00 €", color: "text-foreground" },
                  { label: "Prix d'achat (en friperie)", value: "- 12,00 €", color: "text-red-400" },
                  { label: "Commission Vinted (5%)", value: "- 1,25 €", color: "text-red-400" },
                  { label: "Protection acheteur", value: "- 0,70 €", color: "text-red-400" },
                  { label: "Frais de port (Mondial Relay)", value: "- 3,49 €", color: "text-red-400" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-white/10">
                  <span className="text-base font-bold text-foreground">Profit réel</span>
                  <span className="text-2xl font-black text-emerald-400">7,56 €</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Soit <strong className="text-amber-400">30% du prix de vente</strong>, pas 100%.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Détail de tous les frais Vinted</h2>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">1. Commission Vinted : 5% du prix de vente</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vinted prélève une commission de <strong className="text-foreground">5% sur chaque vente</strong>.
              Sur un article vendu 25€, cela représente 1,25€. Sur 50€, c&apos;est 2,50€.
              C&apos;est automatique et non négociable.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">2. Protection acheteur : 0,70€ fixe</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              En plus des 5%, Vinted ajoute <strong className="text-foreground">0,70€ de frais de protection acheteur</strong>.
              C&apos;est un montant fixe par transaction, quel que soit le prix de l&apos;article.
              Sur les petits prix (5-10€), c&apos;est proportionnellement énorme.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">3. Frais de port : 2,99€ à 6,99€</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Les frais de port dépendent du transporteur et du poids :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 not-prose">
              {[
                { carrier: "Mondial Relay", price: "2,99 - 4,99€", note: "Le moins cher" },
                { carrier: "Colissimo", price: "4,49 - 6,99€", note: "Plus rapide" },
                { carrier: "Chronopost", price: "5,99 - 8,99€", note: "Express" },
                { carrier: "Point Relais", price: "3,49 - 5,49€", note: "Courant" },
              ].map((c) => (
                <div key={c.carrier} className="rounded-lg border border-white/6 bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">{c.carrier}</p>
                  <p className="text-sm text-indigo-400">{c.price}</p>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 my-6 not-prose">
              <p className="text-sm text-amber-200">
                <strong>Attention :</strong> Si vous proposez la livraison gratuite pour attirer les acheteurs,
                les frais de port sont à <strong>votre charge</strong> — ils réduisent directement votre profit.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Comparatif : frais par plateforme</h2>
            <div className="overflow-x-auto my-6 not-prose">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-muted-foreground font-medium">Plateforme</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Commission</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Sur une vente à 25€</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Profit (achat 12€)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Leboncoin", fee: "0%", on25: "0€", profit: "13,00€", color: "text-emerald-400" },
                    { name: "eBay", fee: "~8%", on25: "2,00€", profit: "7,51€", color: "text-amber-400" },
                    { name: "Vinted", fee: "5% + 0,70€", on25: "1,95€", profit: "7,56€", color: "text-amber-400" },
                    { name: "Vestiaire Collective", fee: "15-25%", on25: "5,00€", profit: "4,51€", color: "text-red-400" },
                  ].map((p) => (
                    <tr key={p.name} className="border-b border-white/5">
                      <td className="py-3 text-foreground font-medium">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.fee}</td>
                      <td className="py-3 text-muted-foreground">{p.on25}</td>
                      <td className={`py-3 font-semibold ${p.color}`}>{p.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">* Hors frais de port (3,49€ déduits pour Vinted/eBay/Vestiaire)</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Le piège de la rentabilité</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Beaucoup de revendeurs pensent être rentables parce qu&apos;ils regardent leur solde Vinted.
              Mais le solde Vinted montre les <strong className="text-foreground">recettes brutes</strong>, pas le profit.
            </p>
            <div className="grid grid-cols-2 gap-4 my-6 not-prose">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                <p className="text-3xl font-black text-red-400 mb-1">847€</p>
                <p className="text-sm text-muted-foreground">Ce que tu vois sur Vinted</p>
                <p className="text-xs text-red-400 mt-1">Recettes brutes</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                <p className="text-3xl font-black text-emerald-400 mb-1">312€</p>
                <p className="text-sm text-muted-foreground">Ce que tu gagnes vraiment</p>
                <p className="text-xs text-emerald-400 mt-1">Profit net réel</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Soit <strong className="text-amber-400">63% de différence</strong>. Et c&apos;est le montant brut (847€) que
              DAC7 utilise pour le seuil de 2 000€, pas votre profit réel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Automatiser le calcul avec Revendu</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Plutôt que de calculer manuellement chaque vente, <strong className="text-foreground">Revendu</strong> le fait
              automatiquement. Vous entrez le prix de vente et le prix d&apos;achat, et l&apos;outil calcule :
            </p>
            <ul className="space-y-2 my-4 not-prose">
              {[
                "Le profit net exact (en déduisant tous les frais)",
                "Le total cumulé par mois et par an",
                "La répartition par plateforme",
                "Votre progression vers les seuils DAC7",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-emerald-400 mt-0.5">✓</span>{item}
                </li>
              ))}
            </ul>
          </section>
        </article>

        {/* CTA */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Calculez votre vrai profit gratuitement</h3>
          <p className="text-muted-foreground mb-6">2 minutes pour créer votre compte. Aucune carte bancaire.</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-lg shadow-indigo-500/20">
            Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="mt-10 p-6 rounded-2xl border border-white/6 bg-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Articles liés</h3>
          <div className="space-y-3">
            <Link href="/blog/dac7-vinted-guide-2026" className="block text-sm text-indigo-400 hover:text-indigo-300 transition">
              → DAC7 et Vinted en 2026 : tout ce que vous devez savoir
            </Link>
            <Link href="/blog/30-ventes-vinted-que-se-passe-t-il" className="block text-sm text-indigo-400 hover:text-indigo-300 transition">
              → 30 ventes sur Vinted : que se passe-t-il avec les impôts ?
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>
        </div>
      </main>
    </div>
  );
}
