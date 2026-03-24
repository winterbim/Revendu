"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowLeft, ArrowRight, Clock, Share2 } from "lucide-react";
import type { Metadata } from "next";

export default function DAC7VintedGuide() {
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
          <Link
            href="/register"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
          >
            Commencer gratuitement
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition">
          <ArrowLeft className="h-4 w-4" /> Retour au blog
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
              Fiscalité
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> 8 min de lecture
            </span>
            <span className="text-xs text-muted-foreground">24 mars 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            DAC7 et Vinted en 2026 : tout ce que vous devez savoir sur vos obligations fiscales
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Depuis janvier 2024, la directive européenne DAC7 oblige les plateformes comme Vinted
            à transmettre vos données de ventes aux autorités fiscales. Voici tout ce que vous devez
            savoir pour éviter les mauvaises surprises.
          </p>
        </div>

        {/* Article */}
        <article className="prose prose-invert prose-lg max-w-none">
          {/* TOC */}
          <div className="rounded-2xl border border-white/6 bg-card p-6 mb-10 not-prose">
            <h3 className="text-sm font-semibold text-foreground mb-3">Sommaire</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#quest-ce-que-dac7" className="hover:text-indigo-400 transition">1. Qu&apos;est-ce que la directive DAC7 ?</a></li>
              <li><a href="#seuils" className="hover:text-indigo-400 transition">2. Les seuils qui déclenchent la transmission</a></li>
              <li><a href="#plateformes" className="hover:text-indigo-400 transition">3. Quelles plateformes sont concernées ?</a></li>
              <li><a href="#donnees-transmises" className="hover:text-indigo-400 transition">4. Quelles données sont transmises ?</a></li>
              <li><a href="#impots" className="hover:text-indigo-400 transition">5. Allez-vous payer des impôts ?</a></li>
              <li><a href="#se-proteger" className="hover:text-indigo-400 transition">6. Comment se protéger et anticiper</a></li>
              <li><a href="#erreurs" className="hover:text-indigo-400 transition">7. Les erreurs à ne pas commettre</a></li>
              <li><a href="#outils" className="hover:text-indigo-400 transition">8. Les outils pour suivre vos seuils</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <section id="quest-ce-que-dac7">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              1. Qu&apos;est-ce que la directive DAC7 ?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La <strong className="text-foreground">directive DAC7</strong> (Directive on Administrative Cooperation 7) est une
              réglementation européenne entrée en vigueur le <strong className="text-foreground">1er janvier 2024</strong>. Elle
              oblige toutes les plateformes de vente en ligne à collecter et transmettre
              les informations sur les vendeurs aux administrations fiscales de chaque pays.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              En France, c&apos;est la <strong className="text-foreground">DGFIP</strong> (Direction Générale des Finances Publiques)
              qui reçoit ces données. Concrètement, si vous vendez sur Vinted, Leboncoin, eBay
              ou Vestiaire Collective et que vous dépassez certains seuils, la plateforme est
              <strong className="text-foreground"> légalement obligée</strong> de transmettre vos informations.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 my-6 not-prose">
              <p className="text-sm text-amber-200">
                <strong>Important :</strong> Ce n&apos;est pas un choix de Vinted. C&apos;est une obligation
                légale européenne. Toutes les plateformes de l&apos;UE sont concernées sans exception.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="seuils">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              2. Les seuils qui déclenchent la transmission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La transmission n&apos;est pas automatique pour tout le monde. Elle se déclenche si vous
              dépassez <strong className="text-foreground">l&apos;un ou l&apos;autre</strong> de ces deux seuils sur une année civile :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 text-center">
                <p className="text-4xl font-black text-indigo-400 mb-2">30</p>
                <p className="text-sm text-muted-foreground">transactions par an</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                <p className="text-4xl font-black text-emerald-400 mb-2">2 000 €</p>
                <p className="text-sm text-muted-foreground">de recettes brutes par an</p>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 my-6 not-prose">
              <p className="text-sm text-red-200">
                <strong>Attention :</strong> C&apos;est bien <strong>OU</strong> et non <strong>ET</strong>.
                Il suffit de dépasser <strong>un seul</strong> des deux seuils pour que vos données
                soient transmises. 30 ventes à 10€ = transmission. 10 ventes à 250€ = transmission aussi.
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Les <strong className="text-foreground">recettes brutes</strong> correspondent au prix de vente total,
              avant déduction des frais de plateforme et des frais de port. C&apos;est ce que l&apos;acheteur paie,
              pas ce que vous recevez sur votre compte.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">
              Les seuils sont-ils cumulés entre plateformes ?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-emerald-400">Non.</strong> Chaque plateforme compte séparément.
              Si vous avez 20 ventes sur Vinted et 20 ventes sur Leboncoin, vous n&apos;avez pas
              dépassé le seuil de 30 sur aucune des deux plateformes. Chacune fait son propre calcul.
            </p>
          </section>

          {/* Section 3 */}
          <section id="plateformes">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              3. Quelles plateformes sont concernées ?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Toutes les plateformes de vente entre particuliers opérant dans l&apos;Union Européenne :
            </p>
            <div className="grid grid-cols-2 gap-3 my-6 not-prose">
              {["Vinted", "Leboncoin", "eBay", "Vestiaire Collective", "Amazon Marketplace", "Etsy", "Depop", "Back Market"].map((p) => (
                <div key={p} className="rounded-lg border border-white/6 bg-card px-4 py-3 text-sm text-foreground font-medium">
                  {p}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Mais aussi les plateformes de location (Airbnb, Abritel) et de services (Uber, Deliveroo).
              DAC7 couvre toutes les « plateformes numériques » au sens large.
            </p>
          </section>

          {/* Section 4 */}
          <section id="donnees-transmises">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              4. Quelles données sont transmises à la DGFIP ?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Voici les informations exactes que la plateforme communique :
            </p>
            <ul className="space-y-2 my-4 not-prose">
              {[
                "Votre nom, prénom et date de naissance",
                "Votre adresse postale",
                "Votre numéro fiscal (NIF) ou numéro de TVA",
                "Votre numéro de compte bancaire (IBAN)",
                "Le nombre total de transactions réalisées",
                "Le montant total des recettes brutes perçues",
                "Les frais et commissions retenus par la plateforme",
                "Le détail par trimestre",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5 */}
          <section id="impots">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              5. Allez-vous payer des impôts ?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Transmission ≠ imposition.</strong> Ce n&apos;est pas parce que
              Vinted transmet vos données que vous allez automatiquement payer des impôts.
              Tout dépend de votre situation :
            </p>

            <div className="space-y-4 my-6 not-prose">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h4 className="text-sm font-bold text-emerald-400 mb-2">Vous revendez vos effets personnels à perte</h4>
                <p className="text-sm text-muted-foreground">
                  Vous avez acheté un manteau 80€ et le revendez 30€ ? <strong className="text-foreground">Aucun impôt</strong>.
                  La revente d&apos;effets personnels à un prix inférieur au prix d&apos;achat n&apos;est pas imposable.
                  C&apos;est le cas de la grande majorité des vendeurs Vinted.
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h4 className="text-sm font-bold text-amber-400 mb-2">Vous faites de l&apos;achat-revente avec bénéfice</h4>
                <p className="text-sm text-muted-foreground">
                  Vous achetez des articles pour les revendre plus cher ? Les bénéfices sont <strong className="text-foreground">imposables
                  au titre des BIC</strong> (Bénéfices Industriels et Commerciaux). Vous devez les déclarer
                  dans votre déclaration de revenus.
                </p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <h4 className="text-sm font-bold text-red-400 mb-2">Vous vendez des objets de valeur à plus de 5 000€</h4>
                <p className="text-sm text-muted-foreground">
                  La vente d&apos;un objet de valeur (bijoux, œuvre d&apos;art, collection) à plus de 5 000€
                  est soumise à la <strong className="text-foreground">taxe sur les métaux précieux</strong> ou à la
                  <strong className="text-foreground"> taxe sur les plus-values</strong> (19% + prélèvements sociaux).
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 my-6 not-prose">
              <p className="text-sm text-indigo-200">
                <strong>Le point clé :</strong> Vous devez pouvoir <strong>prouver</strong> vos prix d&apos;achat.
                Gardez vos factures, tickets de caisse, captures d&apos;écran de commandes.
                Sans preuve, le fisc peut considérer que tout est du bénéfice.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="se-proteger">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              6. Comment se protéger et anticiper
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La meilleure protection, c&apos;est l&apos;anticipation. Voici les actions concrètes à mettre en place :
            </p>

            <div className="space-y-3 my-6 not-prose">
              {[
                { num: "1", title: "Comptez vos ventes", desc: "Suivez le nombre exact de transactions par plateforme, mois par mois." },
                { num: "2", title: "Calculez votre vrai profit", desc: "Prix de vente - prix d'achat - frais plateforme - frais de port = profit réel." },
                { num: "3", title: "Gardez vos preuves d'achat", desc: "Factures, tickets, captures d'écran. Le fisc vous demandera de prouver vos achats." },
                { num: "4", title: "Surveillez vos seuils", desc: "Sachez exactement où vous en êtes par rapport aux seuils de 30 ventes et 2 000€." },
                { num: "5", title: "Anticipez la déclaration", desc: "Si vous êtes en achat-revente, préparez votre déclaration BIC à l'avance." },
              ].map((item) => (
                <div key={item.num} className="flex gap-4 rounded-xl border border-white/6 bg-card p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-bold text-indigo-400 shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7 */}
          <section id="erreurs">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              7. Les erreurs à ne pas commettre
            </h2>

            <div className="space-y-3 my-6 not-prose">
              {[
                { error: "Confondre chiffre d'affaires et profit", fix: "Votre CA sur Vinted n'est PAS votre bénéfice. Le fisc le sait aussi." },
                { error: "Ne pas garder ses justificatifs d'achat", fix: "Sans preuve d'achat, le fisc peut considérer 100% de la vente comme du bénéfice." },
                { error: "Ignorer les seuils DAC7", fix: "\"Je ne savais pas\" n'est pas une excuse valable auprès de l'administration." },
                { error: "Paniquer et arrêter de vendre", fix: "DAC7 ≠ imposition automatique. Si vous revendez à perte, vous ne payez rien." },
                { error: "Ne pas déclarer ses bénéfices d'achat-revente", fix: "Si vous achetez pour revendre avec profit, c'est imposable. Point." },
              ].map((item) => (
                <div key={item.error} className="rounded-xl border border-red-500/10 bg-card p-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">❌ {item.error}</p>
                  <p className="text-sm text-muted-foreground">→ {item.fix}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8 */}
          <section id="outils">
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              8. Suivez vos seuils DAC7 gratuitement avec Revendu
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Plutôt que de tout suivre manuellement dans un tableur,
              <strong className="text-foreground"> Revendu</strong> calcule automatiquement :
            </p>
            <ul className="space-y-2 my-4 not-prose">
              {[
                "Votre profit net réel sur chaque vente (prix - achat - frais - port)",
                "Votre progression vers les seuils DAC7 (transactions + recettes)",
                "Des alertes visuelles : vert (safe) → orange (attention) → rouge (danger)",
                "Un export CSV prêt pour votre déclaration d'impôts",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Compatible avec <strong className="text-foreground">Vinted, Leboncoin, eBay et Vestiaire Collective</strong>.
              100% gratuit pour commencer, aucune carte bancaire requise.
            </p>
          </section>
        </article>

        {/* CTA Box */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Vérifiez votre situation DAC7 en 2 minutes
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Créez votre compte gratuit, ajoutez vos ventes, et visualisez immédiatement
            votre progression vers les seuils fiscaux.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-lg shadow-indigo-500/20"
          >
            Créer mon compte gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            Gratuit · Sans engagement · Aucune carte requise
          </p>
        </div>

        {/* Back */}
        <div className="mt-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>
        </div>
      </main>
    </div>
  );
}
