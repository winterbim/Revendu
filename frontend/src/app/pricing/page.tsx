"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { paymentsApi } from "@/lib/api";
import type { Metadata } from "next";
import {
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Zap,
  FileText,
  Shield,
  Mail,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Pro Checkout Button ─────────────────────────────────────────────────────

function ProCheckoutButton() {
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch {
    // Auth context not available (public page without AuthProvider)
    user = null;
  }
  const [loading, setLoading] = useState(false);

  if (user) {
    // Utilisateur connecté → lancer le checkout Stripe directement
    return (
      <Button
        className="w-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30"
        size="lg"
        disabled={loading || user.plan !== "free"}
        onClick={async () => {
          setLoading(true);
          try {
            const { checkout_url } = await paymentsApi.createCheckout();
            window.location.href = checkout_url;
          } catch {
            alert("Erreur lors de la création du paiement. Veuillez réessayer.");
            setLoading(false);
          }
        }}
      >
        {loading ? "Redirection vers Stripe..." : user.plan === "free" ? "Passer à Pro maintenant" : "Déjà abonné ✓"}
      </Button>
    );
  }

  // Utilisateur non connecté → inscription
  return (
    <Button
      asChild
      className="w-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30"
      size="lg"
    >
      <Link href="/register">Essayer Pro gratuitement</Link>
    </Button>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-all group-hover:scale-105 group-hover:shadow-indigo-500/50">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Revendu
          </span>
        </Link>

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

// ─── Hero ──────────────────────────────────────────────────────────────────────

function PricingHero() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 mb-6">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Tarification transparente
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground mb-6">
          Des tarifs pour
          <br />
          <span className="text-gradient">tous les revendeurs</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Commencez gratuitement, passez à Pro quand vous êtes prêt.
          Aucune surprise, aucun engagement.
        </p>
      </div>
    </section>
  );
}

// ─── Plans ─────────────────────────────────────────────────────────────────────

function PricingPlans() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Gratuit */}
          <Card className="border-white/8 relative flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">Gratuit</CardTitle>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-foreground">0€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Parfait pour commencer
              </p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-6">
              <ul className="space-y-3.5">
                {[
                  {
                    feature: "Jusqu'à 50 articles",
                    icon: true,
                  },
                  {
                    feature: "Suivi 2 plateformes",
                    icon: true,
                  },
                  {
                    feature: "Alertes DAC7 incluses",
                    icon: true,
                  },
                  {
                    feature: "Calcul profit automatique",
                    icon: true,
                  },
                  {
                    feature: "Export CSV",
                    icon: true,
                  },
                  {
                    feature: "Rapports PDF",
                    icon: false,
                    disabled: true,
                  },
                  {
                    feature: "Import Gmail",
                    icon: false,
                    disabled: true,
                  },
                  {
                    feature: "Support prioritaire",
                    icon: false,
                    disabled: true,
                  },
                ].map((item) => (
                  <li
                    key={item.feature}
                    className={`flex items-center gap-3 text-sm ${
                      item.disabled ? "text-muted-foreground/50" : "text-muted-foreground"
                    }`}
                  >
                    {item.icon ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/20 shrink-0" />
                    )}
                    {item.feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex flex-col gap-3 mt-auto">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Link href="/register">Commencer gratuitement</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Aucune carte bleue requise
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pro — spotlight */}
          <div className="relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1 text-xs font-bold">
              Populaire
            </Badge>
            <Card className="border-primary/40 bg-gradient-to-b from-primary/12 via-card to-card relative overflow-hidden h-full flex flex-col">
              {/* Spotlight */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl">Pro</CardTitle>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold text-foreground">4€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Pour les revendeurs sérieux
                </p>
              </CardHeader>

              <CardContent className="relative flex-1 flex flex-col space-y-6">
                <ul className="space-y-3.5">
                  {[
                    {
                      feature: "Articles illimités",
                      icon: true,
                    },
                    {
                      feature: "Toutes les plateformes",
                      icon: true,
                    },
                    {
                      feature: "Alertes DAC7 incluses",
                      icon: true,
                    },
                    {
                      feature: "Calcul profit automatique",
                      icon: true,
                    },
                    {
                      feature: "Export CSV",
                      icon: true,
                    },
                    {
                      feature: "Rapports PDF",
                      icon: true,
                    },
                    {
                      feature: "Import Gmail automatique",
                      icon: true,
                    },
                    {
                      feature: "Support prioritaire par email",
                      icon: true,
                    },
                  ].map((item) => (
                    <li
                      key={item.feature}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {item.feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 flex flex-col gap-3 mt-auto">
                  <ProCheckoutButton />
                  <p className="text-xs text-muted-foreground text-center">
                    Accès complet pendant 7 jours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Comparison ──────────────────────────────────────────────────────────

function Comparison() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-muted/5">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Comparaison détaillée
          </h2>
          <p className="text-lg text-muted-foreground">
            Voir toutes les différences entre les plans
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-4 px-4 font-semibold text-foreground">
                  Fonctionnalité
                </th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">
                  Gratuit
                </th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  category: "Articles",
                  items: [
                    { name: "Limite d'articles", free: "50", pro: "Illimité" },
                    { name: "Platforms supportées", free: "2", pro: "Toutes (5)" },
                  ],
                },
                {
                  category: "Alertes & Suivi",
                  items: [
                    { name: "Alertes DAC7", free: "✓", pro: "✓" },
                    { name: "Alertes email", free: "—", pro: "✓" },
                    { name: "Alertes push", free: "—", pro: "✓" },
                  ],
                },
                {
                  category: "Export & Rapports",
                  items: [
                    { name: "Export CSV", free: "✓", pro: "✓" },
                    { name: "Export PDF", free: "—", pro: "✓" },
                    { name: "Rapports avancés", free: "—", pro: "✓" },
                  ],
                },
                {
                  category: "Intégrations",
                  items: [
                    { name: "Import Gmail", free: "—", pro: "✓" },
                    { name: "Sync automatique", free: "—", pro: "✓" },
                  ],
                },
                {
                  category: "Support",
                  items: [
                    { name: "Support", free: "FAQ", pro: "Email prioritaire" },
                    { name: "Accès à la communauté", free: "—", pro: "✓" },
                  ],
                },
              ].map((section) => (
                <React.Fragment key={section.category}>
                  <tr className="border-b border-white/5">
                    <td
                      colSpan={3}
                      className="py-3 px-4 font-semibold text-foreground bg-muted/20"
                    >
                      {section.category}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr key={item.name} className="border-b border-white/5">
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {item.free}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {item.pro}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Puis-je changer de plan à tout moment?",
              a: "Oui! Vous pouvez passer de Gratuit à Pro (ou inversement) à tout moment. Les changements s'appliquent immédiatement.",
            },
            {
              q: "Comment fonctionne l'essai gratuit du plan Pro?",
              a: "Vous bénéficiez de 7 jours d'accès complet à Pro après votre inscription. Après cela, vous pouvez continuer en Gratuit ou vous abonner à Pro (4€/mois).",
            },
            {
              q: "Faut-il une carte bleue pour le plan Gratuit?",
              a: "Non, le plan Gratuit est 100% gratuit et ne nécessite aucune carte. Vous pouvez utiliser Revendu indéfiniment sans frais.",
            },
            {
              q: "Que se passe-t-il si je dépasse 50 articles en plan Gratuit?",
              a: "Une alerte vous prévient. Vous devez supprimer des articles ou passer à Pro pour continuer à en ajouter.",
            },
            {
              q: "Puis-je importer mes anciennes ventes?",
              a: "Oui! Vous pouvez importer vos données via CSV (Gratuit) ou laisser Revendu les récupérer de Gmail (Pro, avec sync automatique).",
            },
            {
              q: "Quelle est votre politique de confidentialité?",
              a: "Vos données sont chiffrées, hébergées en Europe, et ne sont jamais vendues. Nous respectons le RGPD à 100%.",
            },
          ].map((item, idx) => (
            <Card key={idx} className="border-white/8">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2">
                  {item.q}
                </h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-12 sm:p-16 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              Prêt à commencer?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Rejoignez 4 200+ revendeurs qui font confiance à Revendu pour
              suivre leurs profits et maîtriser leur fiscalité.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-br from-indigo-500 to-violet-600 px-8"
              >
                <Link href="/register">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8"
              >
                <Link href="/">En savoir plus</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
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
    <footer className="border-t border-white/5 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Revendu. Fait avec ❤️ en France.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <PricingHero />
      <PricingPlans />
      <Comparison />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
