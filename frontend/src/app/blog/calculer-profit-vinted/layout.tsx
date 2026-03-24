import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment calculer son vrai profit sur Vinted (frais inclus) | Revendu",
  description:
    "Le prix de vente n'est pas votre profit. Découvrez la vraie formule avec tous les frais Vinted (5%, protection acheteur, port) et combien vous gagnez réellement par vente.",
  keywords: [
    "calculer profit vinted", "frais vinted vendeur", "commission vinted",
    "combien gagne vinted", "frais vinted 2026", "profit vente vinted",
    "vinted rentable", "marge vinted", "frais plateforme vinted",
  ],
  openGraph: {
    title: "Comment calculer son vrai profit sur Vinted",
    description: "25€ de vente ≠ 25€ de profit. La vraie formule avec tous les frais.",
    type: "article",
    publishedTime: "2026-03-24",
  },
  alternates: {
    canonical: "https://revendu.vercel.app/blog/calculer-profit-vinted",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
