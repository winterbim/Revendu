import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité – Revendu",
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:underline text-sm mb-8 inline-block">
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité</h1>
      <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : 23 mars 2026</p>

      <section className="space-y-6 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles est Revendu, service édité par
            [Votre nom ou raison sociale], dont le siège social est situé à [adresse].
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">2. Données collectées</h2>
          <p>
            Nous collectons les données suivantes : adresse email, nom complet, données relatives
            à vos transactions de revente (prix d&apos;achat, prix de vente, frais de plateforme,
            frais de port). Si vous utilisez la synchronisation Gmail, nous accédons en lecture
            seule à vos emails de confirmation de vente.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">3. Finalité du traitement</h2>
          <p>
            Vos données sont utilisées pour : fournir le service de suivi de bénéfices, calculer
            les seuils DAC7, générer des rapports d&apos;export, et améliorer le service. Nous ne
            vendons jamais vos données à des tiers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">4. Base légale</h2>
          <p>
            Le traitement de vos données repose sur l&apos;exécution du contrat (fourniture du service)
            et votre consentement explicite pour la synchronisation Gmail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">5. Durée de conservation</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas de suppression
            de compte, vos données sont effacées dans un délai de 30 jours.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">6. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :
            chiffrement des mots de passe (bcrypt), communications HTTPS, tokens JWT à durée
            limitée, isolation des données entre utilisateurs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">7. Vos droits (RGPD)</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de
            suppression, de portabilité et d&apos;opposition sur vos données personnelles. Pour
            exercer ces droits, contactez-nous à : contact@revendu.fr.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">8. Cookies</h2>
          <p>
            Revendu utilise uniquement des cookies techniques nécessaires au fonctionnement du
            service (token de rafraîchissement httpOnly). Aucun cookie publicitaire ou de
            tracking n&apos;est utilisé.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">9. Sous-traitants</h2>
          <p>
            Nos sous-traitants incluent : Vercel (hébergement frontend), Railway (hébergement
            backend), Stripe (paiement), Google (synchronisation Gmail). Tous sont conformes au RGPD.
          </p>
        </div>
      </section>
    </main>
  );
}
