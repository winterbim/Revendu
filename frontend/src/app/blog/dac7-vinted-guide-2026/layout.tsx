import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DAC7 et Vinted en 2026 : guide complet des obligations fiscales | Revendu",
  description:
    "La directive DAC7 oblige Vinted à transmettre vos données au fisc. Seuils de 30 ventes ou 2 000€, données transmises, imposition — le guide complet pour les revendeurs.",
  keywords: [
    "DAC7", "Vinted", "impôts", "fiscalité", "revendeur", "Leboncoin", "eBay",
    "déclaration", "DGFIP", "seuils", "30 ventes", "2000 euros",
    "vinted impots 2026", "dac7 vinted", "vinted fisc",
  ],
  openGraph: {
    title: "DAC7 et Vinted en 2026 : tout ce que vous devez savoir",
    description:
      "30 ventes ou 2 000€ de recettes = Vinted transmet tout au fisc. Le guide complet pour comprendre vos obligations.",
    type: "article",
    publishedTime: "2026-03-24",
    authors: ["Revendu"],
    siteName: "Revendu",
  },
  twitter: {
    card: "summary_large_image",
    title: "DAC7 et Vinted en 2026 : guide complet",
    description: "30 ventes ou 2 000€ = Vinted transmet tout au fisc. Guide complet.",
  },
  alternates: {
    canonical: "https://revendu.vercel.app/blog/dac7-vinted-guide-2026",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
