import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "30 ventes sur Vinted : que se passe-t-il avec les impôts ? | Revendu",
  description:
    "Vous approchez des 30 ventes sur Vinted ? Découvrez ce qui se passe concrètement : transmission DGFIP, imposition, et comment anticiper le seuil DAC7.",
  keywords: [
    "30 ventes vinted", "seuil vinted", "vinted 30 ventes impots",
    "dac7 30 transactions", "limite vente vinted", "vinted déclaration impots",
    "seuil dac7 vinted", "vinted fisc 30 ventes",
  ],
  openGraph: {
    title: "30 ventes sur Vinted : que se passe-t-il ?",
    description: "Le seuil de 30 ventes DAC7 expliqué simplement. Ce qui arrive vraiment.",
    type: "article",
    publishedTime: "2026-03-24",
  },
  alternates: {
    canonical: "https://revendu.vercel.app/blog/30-ventes-vinted-que-se-passe-t-il",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
