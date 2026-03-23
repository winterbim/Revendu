import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation – Revendu",
};

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:underline text-sm mb-8 inline-block">
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : 23 mars 2026</p>

      <section className="space-y-6 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">1. Objet</h2>
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation
            du service Revendu, accessible à l&apos;adresse revendu.fr. Revendu est un outil de suivi de
            bénéfices et d&apos;alertes fiscales DAC7 destiné aux revendeurs français opérant sur des
            plateformes telles que Vinted, Leboncoin, eBay et Vestiaire Collective.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">2. Acceptation des conditions</h2>
          <p>
            En créant un compte sur Revendu, l&apos;utilisateur accepte sans réserve les présentes CGU.
            Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser le service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">3. Description du service</h2>
          <p>
            Revendu propose un plan gratuit et un plan payant (Pro à 4&nbsp;€/mois). Le plan gratuit
            permet de gérer jusqu&apos;à 50 articles avec des fonctionnalités de base. Le plan Pro offre
            un accès illimité aux articles, exports PDF, synchronisation Gmail et analytiques avancées.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">4. Compte utilisateur</h2>
          <p>
            L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de l&apos;inscription et
            à maintenir la confidentialité de ses identifiants. Toute activité réalisée depuis son
            compte est sous sa responsabilité.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">5. Données fiscales</h2>
          <p>
            Revendu fournit des estimations indicatives concernant les seuils DAC7 (30 transactions
            ou 2&nbsp;000&nbsp;€ de recettes brutes par an). Ces informations ne constituent en aucun cas
            un conseil fiscal. L&apos;utilisateur reste seul responsable de ses obligations déclaratives
            auprès de l&apos;administration fiscale.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">6. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du site (textes, graphismes, logiciels, bases de données) sont
            protégés par le droit de la propriété intellectuelle. Toute reproduction non autorisée
            est interdite.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">7. Résiliation</h2>
          <p>
            L&apos;utilisateur peut supprimer son compte à tout moment. Revendu se réserve le droit de
            suspendre ou supprimer un compte en cas de violation des présentes CGU.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">8. Limitation de responsabilité</h2>
          <p>
            Revendu ne saurait être tenu responsable des dommages directs ou indirects résultant
            de l&apos;utilisation du service, notamment en cas d&apos;erreur dans le calcul des seuils
            fiscaux ou d&apos;indisponibilité temporaire du service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">9. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige sera soumis à la
            compétence des tribunaux français.
          </p>
        </div>
      </section>
    </main>
  );
}
