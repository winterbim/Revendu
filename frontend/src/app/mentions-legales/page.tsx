import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales – Revendu",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:underline text-sm mb-8 inline-block">
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Mentions Légales</h1>

      <section className="space-y-6 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Éditeur du site</h2>
          <p>
            Revendu<br />
            [Votre nom ou raison sociale]<br />
            [Adresse du siège social]<br />
            Email : contact@revendu.fr
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Directeur de la publication</h2>
          <p>[Votre nom complet]</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Hébergeur</h2>
          <p>
            <strong>Frontend :</strong> Vercel Inc. – 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            <strong>Backend :</strong> Railway Corp. – San Francisco, CA, États-Unis<br />
            <strong>Base de données :</strong> PostgreSQL hébergé par Railway
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu du site Revendu (textes, graphismes, logos, icônes, images,
            logiciels) est protégé par les lois françaises et internationales relatives à la
            propriété intellectuelle. Toute reproduction, même partielle, est interdite sans
            autorisation préalable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Données personnelles</h2>
          <p>
            Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au
            Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit
            d&apos;accès, de rectification et de suppression de vos données. Consultez notre{" "}
            <Link href="/confidentialite" className="text-indigo-400 hover:underline">
              politique de confidentialité
            </Link>{" "}
            pour plus d&apos;informations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Cookies</h2>
          <p>
            Ce site utilise uniquement des cookies techniques nécessaires au bon fonctionnement
            du service. Aucun cookie publicitaire n&apos;est utilisé.
          </p>
        </div>
      </section>
    </main>
  );
}
