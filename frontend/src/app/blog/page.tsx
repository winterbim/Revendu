"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Clock, Eye } from "lucide-react";

const articles = [
  {
    slug: "dac7-vinted-guide-2026",
    title: "DAC7 et Vinted en 2026 : tout ce que vous devez savoir",
    description:
      "La directive DAC7 oblige Vinted à transmettre vos données au fisc. Seuils, conséquences, comment se protéger — le guide complet.",
    date: "24 mars 2026",
    readTime: "8 min",
    tag: "Fiscalité",
  },
  {
    slug: "calculer-profit-vinted",
    title: "Comment calculer son vrai profit sur Vinted (frais inclus)",
    description:
      "Le prix de vente n'est pas votre profit. Découvrez la vraie formule avec tous les frais Vinted, et combien vous gagnez réellement.",
    date: "Bientôt",
    readTime: "6 min",
    tag: "Guide",
    upcoming: true,
  },
  {
    slug: "erreurs-revendeurs-vinted",
    title: "5 erreurs fiscales que font 90% des revendeurs Vinted",
    description:
      "Ne pas suivre ses ventes, confondre CA et profit, ignorer DAC7... Les erreurs les plus courantes et comment les éviter.",
    date: "Bientôt",
    readTime: "5 min",
    tag: "Conseils",
    upcoming: true,
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Revendu</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Tarifs
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Blog Revendu
          </h1>
          <p className="text-lg text-muted-foreground">
            Guides, conseils et actualités fiscales pour les revendeurs en ligne.
          </p>
        </div>

        <div className="space-y-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={article.upcoming ? "#" : `/blog/${article.slug}`}
              className={`block rounded-2xl border border-white/6 bg-card p-6 transition-all ${
                article.upcoming
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-indigo-500/30 hover:bg-card/80 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                      {article.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{article.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{article.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">{article.date}</p>
                </div>
                {!article.upcoming && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <div className="border-t border-white/5 bg-muted/5 py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Suivez vos seuils DAC7 gratuitement
          </h2>
          <p className="text-muted-foreground mb-6">
            Revendu calcule votre profit réel et vous alerte avant de dépasser les seuils fiscaux.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
          >
            Créer mon compte gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
