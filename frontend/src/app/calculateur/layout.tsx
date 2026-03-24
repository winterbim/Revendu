import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculateur de profit Vinted gratuit — frais, DAC7, profit net | Revendu",
  description:
    "Calculez votre vrai profit sur Vinted en 10 secondes. Frais de plateforme, port, protection acheteur — tout est déduit automatiquement. Vérifiez aussi vos seuils DAC7.",
  keywords: [
    "calculateur profit vinted", "simulateur vinted", "frais vinted calculateur",
    "combien je gagne vinted", "profit vinted calcul", "calculer gain vinted",
    "outil gratuit vinted", "vinted frais vendeur calcul",
  ],
  openGraph: {
    title: "Calculateur de profit Vinted — Gratuit",
    description: "Calculez votre vrai profit en 10 secondes. Frais inclus.",
  },
  alternates: {
    canonical: "https://revendu.vercel.app/calculateur",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
