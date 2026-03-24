"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowLeft, ArrowRight, Clock } from "lucide-react";

export default function TrenteVentesVinted() {
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
            <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">Fiscalité</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> 5 min de lecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            30 ventes sur Vinted : que se passe-t-il avec les impôts ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Vous approchez de la 30ème vente sur Vinted et vous vous demandez ce qui va se passer ?
            Voici exactement ce que la loi prévoit, ce que Vinted transmet, et si vous allez payer des impôts.
          </p>
        </div>

        <article className="prose prose-invert prose-lg max-w-none">

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Le seuil des 30 ventes : c&apos;est quoi exactement ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La <strong className="text-foreground">directive européenne DAC7</strong>, en vigueur depuis le 1er janvier 2024,
              impose aux plateformes de vente en ligne un seuil de déclaration :
            </p>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 my-6 not-prose text-center">
              <p className="text-5xl font-black text-amber-400 mb-2">30</p>
              <p className="text-lg text-muted-foreground">ventes sur une même plateforme en un an</p>
              <p className="text-sm text-amber-300 mt-2">= transmission automatique de vos données à la DGFIP</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 my-6 not-prose">
              <p className="text-sm text-red-200">
                <strong>Important :</strong> Il existe un second seuil de <strong>2 000€ de recettes brutes</strong>.
                Les deux sont indépendants — il suffit d&apos;en dépasser <strong>un seul</strong> pour déclencher la transmission.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Que se passe-t-il concrètement à la 30ème vente ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Quand vous atteignez 30 ventes sur Vinted dans une année civile :
            </p>
            <div className="space-y-4 my-6 not-prose">
              {[
                { step: "1", title: "Vinted enregistre le dépassement", desc: "La plateforme note automatiquement que vous avez franchi le seuil." },
                { step: "2", title: "Vos données sont collectées", desc: "Nom, prénom, adresse, IBAN, nombre de ventes, montant total — tout est compilé." },
                { step: "3", title: "Transmission à la DGFIP", desc: "En janvier de l'année suivante, Vinted transmet toutes ces informations aux impôts français." },
                { step: "4", title: "La DGFIP reçoit votre dossier", desc: "L'administration fiscale a maintenant accès à votre historique de ventes." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 rounded-xl border border-white/6 bg-card p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-base font-bold text-amber-400 shrink-0">{item.step}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Est-ce que je vais payer des impôts ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              <strong className="text-emerald-400">Pas forcément.</strong> La transmission de données n&apos;entraîne pas
              automatiquement une imposition. Tout dépend de votre situation :
            </p>

            <div className="space-y-4 my-6 not-prose">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h4 className="text-base font-bold text-emerald-400 mb-2">Cas 1 : Vous videz votre placard</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Vous revendez des vêtements que vous avez portés, à un prix inférieur à ce que vous les avez achetés.
                </p>
                <p className="text-sm font-semibold text-emerald-400">→ Aucun impôt à payer. Aucune déclaration nécessaire.</p>
                <p className="text-xs text-muted-foreground mt-2">C&apos;est le cas de 80% des vendeurs Vinted.</p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h4 className="text-base font-bold text-amber-400 mb-2">Cas 2 : Vous faites de l&apos;achat-revente</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Vous achetez des articles en friperie/déstockage pour les revendre plus cher sur Vinted.
                </p>
                <p className="text-sm font-semibold text-amber-400">→ Les bénéfices sont imposables (régime BIC).</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Vous devez déclarer le <strong>bénéfice</strong> (vente - achat - frais), pas le chiffre d&apos;affaires.
                  Sous le seuil micro-BIC (77 700€), vous bénéficiez d&apos;un abattement de 50%.
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <h4 className="text-base font-bold text-red-400 mb-2">Cas 3 : Activité régulière et significative</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Vous vendez de manière régulière avec l&apos;intention de faire du profit (100+ ventes/an, stock dédié, etc.)
                </p>
                <p className="text-sm font-semibold text-red-400">→ Vous devez créer un statut (auto-entrepreneur) et déclarer.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Comment savoir où j&apos;en suis ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Le problème : <strong className="text-foreground">Vinted ne vous montre pas votre progression vers le seuil</strong>.
              Vous n&apos;avez aucun compteur, aucune alerte. Vous découvrez que vous avez dépassé quand c&apos;est trop tard.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              C&apos;est pour ça que <strong className="text-foreground">Revendu</strong> existe. Le tableau de bord vous montre en temps réel :
            </p>
            <div className="grid grid-cols-2 gap-4 my-6 not-prose">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
                <p className="text-2xl font-black text-indigo-400">24/30</p>
                <p className="text-xs text-muted-foreground mt-1">Transactions</p>
                <div className="mt-2 h-3 rounded-full bg-white/5">
                  <div className="h-3 rounded-full bg-amber-500" style={{ width: "80%" }} />
                </div>
                <p className="text-xs text-amber-400 mt-1">80% — Attention</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <p className="text-2xl font-black text-emerald-400">1 240€</p>
                <p className="text-xs text-muted-foreground mt-1">Recettes / 2 000€</p>
                <div className="mt-2 h-3 rounded-full bg-white/5">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: "62%" }} />
                </div>
                <p className="text-xs text-emerald-400 mt-1">62% — Safe</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Que faire si je suis proche du seuil ?</h2>
            <div className="space-y-3 my-6 not-prose">
              {[
                { title: "Ne paniquez pas", desc: "Dépasser 30 ventes ne signifie pas que vous paierez des impôts. Si vous revendez vos affaires à perte, vous ne devez rien." },
                { title: "Gardez vos preuves d'achat", desc: "Factures, tickets de caisse, captures d'écran — tout ce qui prouve le prix d'achat initial." },
                { title: "Calculez votre profit réel", desc: "Si vous vendez à perte (achat 50€, vente 20€), vous n'avez rien à craindre." },
                { title: "Ralentissez si nécessaire", desc: "Si vous êtes en achat-revente et proche du seuil, vous pouvez choisir de reporter certaines ventes à l'année suivante." },
                { title: "Utilisez un outil de suivi", desc: "Revendu vous montre exactement où vous en êtes et vous alerte avant de dépasser." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/6 bg-card p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">✓ {item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Questions fréquentes</h2>

            <div className="space-y-4 my-6 not-prose">
              {[
                { q: "Les 30 ventes comptent-elles les annulations ?", a: "Non. Seules les ventes finalisées (paiement reçu) sont comptabilisées." },
                { q: "Si je vends sur Vinted ET Leboncoin, ça cumule ?", a: "Non. Chaque plateforme compte séparément. 20 ventes Vinted + 20 Leboncoin = aucun seuil dépassé." },
                { q: "Les ventes de l'année dernière comptent ?", a: "Non. Le compteur repart à zéro chaque 1er janvier." },
                { q: "Vinted me prévient quand j'approche du seuil ?", a: "Non. Vinted ne fournit aucune alerte. C'est pour ça que Revendu existe." },
                { q: "Je peux vendre 29 articles et m'arrêter ?", a: "Oui, c'est une stratégie valable. Mais surveillez aussi le seuil de 2 000€ de recettes." },
              ].map((item) => (
                <div key={item.q} className="rounded-xl border border-white/6 bg-card p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">{item.q}</p>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

        </article>

        {/* CTA */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Suivez vos seuils DAC7 en temps réel</h3>
          <p className="text-muted-foreground mb-6">Ne vous faites pas surprendre. Revendu vous alerte avant de dépasser.</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-lg shadow-indigo-500/20">
            Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">Gratuit · Sans engagement · Aucune carte requise</p>
        </div>

        {/* Related */}
        <div className="mt-10 p-6 rounded-2xl border border-white/6 bg-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Articles liés</h3>
          <div className="space-y-3">
            <Link href="/blog/dac7-vinted-guide-2026" className="block text-sm text-indigo-400 hover:text-indigo-300 transition">
              → DAC7 et Vinted en 2026 : tout ce que vous devez savoir
            </Link>
            <Link href="/blog/calculer-profit-vinted" className="block text-sm text-indigo-400 hover:text-indigo-300 transition">
              → Comment calculer son vrai profit sur Vinted (frais inclus)
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
