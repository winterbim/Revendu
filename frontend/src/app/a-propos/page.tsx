import Link from "next/link";
import type { Metadata } from "next";
import { TrendingUp, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos – Revendu",
  description: "Découvrez Revendu, l'outil de suivi de profit et d'alertes fiscales DAC7 pour les revendeurs français.",
};

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:underline text-sm mb-8 inline-block">
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold text-white mb-4">À propos de Revendu</h1>
      <p className="text-lg text-gray-400 mb-10">
        L&apos;outil indispensable pour les revendeurs français qui veulent garder le contrôle
        sur leurs profits et leur fiscalité.
      </p>

      <section className="space-y-8 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Notre mission</h2>
          <p>
            Depuis 2024, la directive européenne DAC7 impose aux plateformes de revente (Vinted,
            Leboncoin, eBay, Vestiaire Collective) de déclarer à l&apos;administration fiscale les
            vendeurs dépassant certains seuils : 30 transactions ou 2&nbsp;000&nbsp;€ de recettes
            brutes par an.
          </p>
          <p className="mt-3">
            Revendu est né d&apos;un constat simple : la plupart des revendeurs n&apos;ont aucune
            visibilité sur leur situation fiscale et découvrent trop tard qu&apos;ils ont dépassé
            les seuils. Notre mission est de leur donner les outils pour anticiper, suivre
            et optimiser leurs ventes en toute sérénité.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 my-10">
          {[
            {
              icon: TrendingUp,
              title: "Suivi en temps réel",
              desc: "Visualisez vos profits nets, article par article, plateforme par plateforme.",
            },
            {
              icon: Shield,
              title: "Alertes DAC7",
              desc: "Soyez prévenu avant d'atteindre les seuils de déclaration fiscale.",
            },
            {
              icon: Zap,
              title: "Import automatique",
              desc: "Connectez Gmail pour importer vos ventes depuis Vinted, Leboncoin et plus.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <Icon className="h-8 w-8 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Qui sommes-nous ?</h2>
          <p>
            Revendu est développé par une équipe passionnée de tech et de commerce en ligne,
            basée en France. Nous sommes nous-mêmes revendeurs et nous avons créé l&apos;outil
            que nous aurions aimé avoir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
          <p>
            Une question, une suggestion ? Écrivez-nous à{" "}
            <a href="mailto:contact@revendu.fr" className="text-indigo-400 hover:underline">
              contact@revendu.fr
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
