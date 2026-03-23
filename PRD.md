# Revendu — Product Requirements Document

**Version** : 1.0
**Date** : 2026-03-16
**Statut** : Actif

---

## 1. Vision produit

**Revendu** est un tracker de profit et d'alerte fiscale pour les revendeurs français sur Vinted, Leboncoin, eBay et Vestiaire Collective.

**Problème** : Depuis janvier 2024 (directive DAC7), ces plateformes transmettent automatiquement les données de vente à la DGFIP dès que l'utilisateur dépasse **30 transactions** ou **2 000 € de recettes brutes** par an. La majorité des revendeurs n'ont aucun outil pour suivre leur proximité de ces seuils, ni calculer leur bénéfice net réel.

**Solution** : Une application web simple, conçue pour des non-comptables, qui centralise les achats/ventes, calcule automatiquement le bénéfice net par article, et envoie des alertes graduées avant que les seuils fiscaux ne soient atteints.

**Tagline** : *Suivez vos ventes, maîtrisez vos impôts.*

---

## 2. Utilisateurs cibles

### Persona principal — "La revendeuse semi-pro"
- Femme, 25–40 ans, revend régulièrement sur Vinted
- 50–200 articles vendus/an, CA entre 1 000 € et 5 000 €
- Peur du redressement fiscal, ne comprend pas les règles DAC7
- N'utilise pas de logiciel comptable
- Budget : accepte €5–9/mois si ça lui évite un problème fiscal

### Persona secondaire — "Le revendeur sneakers/vintage"
- Homme, 20–35 ans, achète pour revendre (flipping)
- Marges élevées, volume moyen
- Cherche à optimiser son profit net par article
- Multi-plateforme : eBay + Vinted + Vestiaire

---

## 3. Fonctionnalités — MVP (v1.0)

### 3.1 Authentification
- [x] Inscription (email + mot de passe + nom)
- [x] Connexion avec JWT (access 30min + refresh 7j httpOnly cookie)
- [x] Déconnexion
- [x] Route /me protégée

### 3.2 Gestion des articles
- [x] Ajouter un article acheté (nom, plateforme, prix d'achat, date)
- [x] Marquer comme vendu (prix de vente, frais plateforme, frais port, date)
- [x] Modifier un article
- [x] Supprimer un article
- [x] Filtrer par plateforme / statut / année
- [x] Export CSV pour déclaration fiscale

### 3.3 Dashboard
- [x] Bénéfice net total (année en cours)
- [x] Recettes brutes totales
- [x] Nombre d'articles vendus / en stock
- [x] Répartition du profit par plateforme (graphe)
- [x] 5 dernières ventes

### 3.4 Alertes seuils DAC7
- [x] Jauge transactions : X / 30 (couleur selon proximité)
- [x] Jauge recettes brutes : X€ / 2 000€
- [x] Bannière d'alerte contextuelle (safe / warning / danger / exceeded)
- [x] Page explicative DAC7 en français clair

---

## 4. Fonctionnalités — v1.1 (post-MVP)

- [ ] Notifications email automatiques (alertes 70%, 85%, 100%)
- [ ] Import CSV Vinted (parsing des exports natifs)
- [ ] Connexion OAuth Google
- [ ] Historique annuel multi-années
- [ ] Mode "estimation impôts" (calcul BNC simplifié)
- [ ] Application mobile (React Native ou PWA)
- [ ] Intégration API Vinted non-officielle (scraping légal)

---

## 5. Modèle de revenus

| Plan | Prix | Inclus |
|------|------|--------|
| Gratuit | €0 | 20 articles/an, dashboard basique |
| Solo | €7/mois (€59/an) | Illimité, alertes email, export CSV |
| Pro | €12/mois (€99/an) | Multi-compte, API access, support prioritaire |

**Projection 6 mois** : 500 utilisateurs Solo = **€3 500 MRR**
**Projection 12 mois** : 2 000 utilisateurs Solo = **€14 000 MRR**

---

## 6. SEO & Acquisition

### Mots-clés cibles (France)
| Mot-clé | Volume estimé | Intention |
|---------|---------------|-----------|
| "vinted impots 2024" | 18 000/mois | Informationnel → transactionnel |
| "seuil fiscal vinted" | 5 400/mois | Transactionnel |
| "tracker profit vinted" | 1 200/mois | Transactionnel fort |
| "déclaration vinted leboncoin" | 9 000/mois | Informationnel |
| "dac7 revendeur france" | 3 600/mois | Informationnel |
| "calculer bénéfice vinted" | 2 400/mois | Transactionnel |

### Contenu SEO à créer (blog)
1. "DAC7 : ce que Vinted transmet vraiment au fisc en 2024"
2. "Comment calculer son bénéfice net sur Vinted (frais compris)"
3. "Seuil 2 000 € Vinted : que se passe-t-il si vous dépassez ?"
4. "Vinted vs Leboncoin : quelle plateforme est la plus rentable ?"
5. "Comment déclarer ses revenus Vinted aux impôts 2025"

### Canaux d'acquisition
1. **SEO organique** — articles de blog ciblant les intentions de recherche DAC7
2. **Reddit/Forum** — réponses utiles sur r/france, r/vinted_france, forums impôts
3. **TikTok/Instagram** — contenu court "Tu savais que Vinted transmet tes données au fisc ?"
4. **Bouche à oreille** — partage naturel entre revendeurs (groupes Facebook Vinted)

---

## 7. Architecture technique

### Backend
- Python 3.11 / FastAPI (async)
- PostgreSQL 15 + SQLAlchemy 2.0 async
- Alembic (migrations)
- JWT authentication (access + refresh tokens)
- Rate limiting (slowapi)

### Frontend
- Next.js 14+ App Router / TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (visualisation)
- SWR (data fetching)
- Dark mode par défaut

### Infrastructure (cible production)
- Backend : Railway ou Render (€7/mois)
- Frontend : Vercel (gratuit tier)
- DB : Neon PostgreSQL serverless (gratuit tier → €19/mois)
- Total infra : < €30/mois pour 1 000 utilisateurs

---

## 8. Métriques de succès

| Métrique | Objectif J+30 | Objectif J+90 | Objectif J+180 |
|----------|---------------|---------------|----------------|
| Inscriptions | 200 | 800 | 3 000 |
| Utilisateurs actifs/mois | 80 | 400 | 1 500 |
| Conversion freemium → payant | — | 8% | 15% |
| MRR | €0 | €500 | €3 500 |
| NPS | — | >40 | >55 |

---

## 9. Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Vinted intègre un tracker natif | Faible | Élevé | Différenciation multi-plateforme + export fiscal FR |
| Changement réglementation DAC7 | Faible | Moyen | Veille légale + contenu SEO adaptatif |
| Coût acquisition trop élevé | Moyen | Élevé | SEO organique first, 0 paid ads en MVP |
| Faible willingness-to-pay | Moyen | Élevé | Freemium avec limite douce + onboarding sur la peur fiscale |
