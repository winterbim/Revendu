import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://revendu.fr"
  ),
  title: {
    default:
      "Revendu – Tracker de profit Vinted & Leboncoin | Seuil fiscal DAC7",
    template: "%s | Revendu",
  },
  description:
    "Suivez vos ventes Vinted, Leboncoin et eBay. Calculez votre bénéfice net et recevez des alertes avant d'atteindre le seuil fiscal DAC7 (2 000 € / 30 transactions). Gratuit pour commencer.",
  keywords: [
    "vinted tracker profit",
    "suivi ventes vinted",
    "seuil fiscal vinted",
    "DAC7 revendeur",
    "leboncoin profit",
    "impôts vinted 2024",
    "tracker revendeur france",
    "calcul bénéfice vinted",
    "déclaration impôts ventes en ligne",
  ],
  authors: [{ name: "Revendu" }],
  creator: "Revendu",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://revendu.fr",
    siteName: "Revendu",
    title: "Revendu – Tracker de profit pour revendeurs Vinted et Leboncoin",
    description:
      "Depuis janvier 2024, Vinted transmet vos données au fisc au-delà de 2 000 €. Revendu vous aide à suivre vos profits et à rester dans les clous.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Revendu – Tracker de profit pour revendeurs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revendu – Tracker de profit Vinted & Leboncoin",
    description:
      "Suivez vos ventes et maîtrisez votre fiscalité. Alertes DAC7 en temps réel.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
