# Les Apéros Filles — proposition de création de l'app

**Pour :** Marguerite
**De :** Baptiste Castiglione
**Date :** avril 2026

---

## Préambule

Salut Marguerite,

Je me suis permis de poser les bases du projet ce week-end parce que j'avais
trop d'idées en tête et j'avais envie de te montrer concrètement comment
j'imagine **Les Apéros Filles** plutôt que de simplement t'envoyer des
slides. Ce document résume la vision, la structure, les pages, les
fonctionnalités clés, la tech et les intégrations nécessaires.

L'app mobile a déjà une base solide (navigation, onboarding, écrans
principaux, prototype d'algorithme de recommandation, flux de paiement
mocké). Ce n'est **pas** une app finie : il reste clairement du back-end à
monter, les intégrations tierces à brancher, les trois environnements à
provisionner, les rôles back-office à implémenter, et toute la partie test
+ déploiement. J'ai cadré le reste en **3 semaines de travail** avec un
périmètre clair, et je te propose un forfait à **6 000 € TTC**.

Tu me diras si la vision te parle — on peut tout revoir ensemble.

---

## 1 — Vision produit

### Le concept

**Les Apéros Filles** est une app mobile qui réunit des femmes autour
d'événements en petit comité (apéros, ateliers, sport, talks, bien-être,
sorties) dans 5 villes : **Lyon, Marseille, Toulouse, Montpellier, Rennes**.
On bascule vers un modèle avec abonnement qui apporte des prix réduits, des
avantages chez des partenaires locaux, et l'accès à l'annuaire des membres.

### Ce qu'on cherche à créer

- Un sentiment de **petit club privé** — pas un réseau social, pas un
  Meetup anonyme.
- Une **expérience éditoriale** chaude (typo Playfair, palette Amalfi
  terracotta/crème) — pas un design "SaaS" ou AI-pattern.
- Un **algorithme de sélection d'événements** qui apprend ce que la fille
  aime et lui propose la bonne sortie, pas la liste brute.
- Un modèle économique clair : **inscription à l'événement (paiement à
  l'unité)** + **abonnement récurrent** pour les prix membres et les bons
  plans partenaires.

### Trois profils côté utilisatrice

- **Membre découverte** (gratuit) : accès à la navigation, 1 événement par
  mois au prix plein, pas d'accès aux bons plans, pas d'annuaire.
- **Membre du club** (9,99 €/mois) : accès illimité aux prix membres, aux
  bons plans partenaires, à l'annuaire.
- **Membre fidèle** (après 6 mois d'abonnement continu) : même accès, mais
  le statut est reconnu dans l'app (badge, traitement visuel distinct).

---

## 2 — Parcours utilisatrice et user stories

### 2.1 Onboarding

- Je découvre l'app via une vidéo d'accueil en boucle et un message chaleureux.
- Je choisis ma ville (5 villes), mon âge, mes centres d'intérêt parmi :
  Apéro, Sport, Atelier créatif, Talk, Bien-être, Gastronomie, Sortie
  (choix visuel type grosses cards photo).
- Je crée mon profil (prénom, âge, bio courte, photo, Instagram optionnel).

### 2.2 Découverte et engagement (feed + discover)

- **Accueil** : je vois un feed personnalisé de mes prochains rendez-vous
  dans ma ville, classés par pertinence par un algorithme de
  recommandation (détails §5). Deux onglets : "À venir" / "Passés".
- **Discover** : je parcours l'offre complète dans la ville de mon choix, je
  filtre par catégorie, je cherche par mot-clé.
- Je **bookmark** des événements qui m'intéressent (avec un cœur) et je peux
  les retrouver depuis mes favoris.

### 2.3 Fiche événement et inscription

- J'ouvre la page d'un événement : photo en grand, countdown ("Dans 3 jours",
  "Demain", "Dans 5h", "En cours"), titre, date/heure, adresse (avec carte
  cliquable qui ouvre Maps), météo prévue, liste des participantes, description.
- Je peux **contacter l'organisatrice**, **partager** via le share-sheet
  natif, **sauvegarder**.
- Je m'inscris : si gratuite j'ai déjà utilisé mon event du mois → paywall,
  sinon → feuille de paiement Stripe.
- Une fois inscrite, mon ticket (QR code) est accessible directement sur la
  page de l'événement — pas besoin d'un wallet séparé.

### 2.4 Abonnement

- Sur toutes les surfaces où je suis limitée, je vois une invitation à
  rejoindre le club (card cream chaleureuse, non-agressive).
- Depuis mon profil, le bouton "Mon abonnement" ouvre un bottom-sheet avec
  mon statut (actif/inactif), la date du prochain prélèvement, un accès au
  changement de formule et à la résiliation.
- Paiement récurrent géré par **Stripe Subscriptions** (carte, SEPA,
  Apple Pay, Google Pay).

### 2.5 Bons plans (partenaires locaux)

- Je vois une sélection éditoriale d'adresses dans ma ville : cafés,
  ateliers, restaurants, bien-être, fleuristes, librairies.
- Une **card "coup de cœur"** met en avant le partenaire du moment.
- Filtres par catégorie (icônes Café, Apéro, Restaurant, Bien-être, Mode &
  Déco, Atelier, Fleurs, Librairie).
- Si je suis membre, je débloque un QR code à présenter en boutique.

### 2.6 Les filles (annuaire)

- Uniquement pour les membres : je découvre les profils des autres
  participantes de ma ville, je peux aller voir leur profil détaillé.
- La page est en preview pour les non-membres (CTA paywall).

### 2.7 Mon profil

- Photo, prénom, âge, ville, statut (membre du club/fidèle).
- Parcours : niveau de fidélité basé sur le nombre d'événements participés
  (5 paliers : Nouvelle venue → Ambassadrice).
- Statistiques : événements, filles rencontrées, membre depuis.
- Favoris, centres d'intérêt, paramètres, gestion de l'abonnement,
  déconnexion.

---

## 3 — Structure de l'app (5 onglets)

| Onglet | Contenu |
|---|---|
| **Accueil** | Feed personnalisé, notifications, prochains rendez-vous |
| **Discover** | Catalogue complet par ville, filtres, recherche |
| **Bons plans** | Sélection partenaires, filtres catégorie, QR réservé membres |
| **Filles** | Annuaire des membres (gated) |
| **Profil** | Identité, parcours, favoris, paramètres, abonnement |

Chaque page d'onglet commence par un **hero éditorial** (gros titre Playfair
avec accent italique terracotta, sous-titre discret). Pas de blocs colorés,
pas d'icônes en rond coloré — l'ADN est magazine chaleureux.

---

## 4 — Personas côté back-office

Trois types de comptes avec des droits distincts, gérés via un système
**RBAC (Role-Based Access Control)**. Tous se connectent via **Sanity CMS**
(3 comptes, 3 workspaces, 3 niveaux de permissions) pour piloter le contenu,
et via un back-office custom pour les statistiques financières.

### 4.1 Propriétaire (toi)

Droits **complets** sur toutes les villes :
- Création et édition des événements (toutes villes).
- Gestion des partenaires (toutes villes).
- Tableau de bord financier (CA abonnement, CA événements, rétention).
- Gestion des formules d'abonnement (prix, tiers, features).
- Modification des utilisatrices (ajustement manuel de tier, suspension).
- Accès à toutes les stats et analytics.

### 4.2 Manageuse de ville

Droits **limités à sa ville** :
- Création et édition des événements **de sa ville uniquement**.
- Gestion des partenaires **de sa ville**.
- Lecture des stats de sa ville (nombre d'inscriptions, taux de
  remplissage, CA).
- Pas d'accès à la partie financière globale, pas d'accès aux autres
  villes.

### 4.3 Modérateur

Droits **transverses et uniquement en modération** :
- Gestion des signalements sur les profils.
- Masquage / suspension temporaire d'utilisatrices.
- Accès lecture sur les profils et les messages signalés.
- Aucun droit de création / édition de contenu.

### 4.4 Gouvernance

- Chaque action sensible (suspension, modification de tier, remboursement)
  est **loguée** (audit trail) dans une table dédiée.
- Validation à deux niveaux pour les actions destructives (ex. suppression
  d'un événement avec inscrites → manageuse demande, propriétaire valide).
- **MFA obligatoire** sur les comptes propriétaire et modérateur.

---

## 5 — Algorithme de recommandation

L'onglet Accueil affiche un feed **personnalisé**, pas une liste
chronologique. L'algorithme est un **content-based recommender** léger,
basé sur une combinaison linéaire de signaux — le même pattern que les
grandes libs open-source (Mahout, LensKit, LightFM) utilisent pour le
cold-start.

### 5.1 Signaux pris en compte

- Les **centres d'intérêt** déclarés à l'onboarding.
- Les **likes / bookmarks** sur des events.
- Les **events passés** auxquels la fille a participé.
- Les **events consultés** dans Discover (signal de curiosité).
- Le **cercle social** dérivé des events partagés avec d'autres filles.
- La **proximité géographique** (ville) et **temporelle** (< 14 jours).
- L'**urgence** (taux de remplissage).

### 5.2 Pondérations

Chaque signal a un poids transparent, ajustable depuis un seul endroit :

| Signal | Poids |
|---|---|
| Intérêt déclaré | 3 |
| Event passé (même catégorie) | 2 |
| Bookmark (même catégorie) | 1,5 |
| Event vu sur Discover | 0,5 |
| Ville match | +2 |
| Amie inscrite sur l'event | +0,8 |
| Dans les 14 jours | +1 |
| < 30 % de places restantes | +0,5 |
| Déjà inscrite / bookmarkée | +100 (remontée garantie) |

Les événements où la fille est déjà engagée remontent toujours en tête ; le
reste est une vraie sélection.

### 5.3 Pourquoi ce choix

- **Zéro dépendance ML** → démarre dès le jour 1 sans attendre d'avoir de
  la donnée.
- **100 % transparent** → on peut expliquer à la fille pourquoi un event
  remonte (« parce que tu aimes les apéros + Camille y va »).
- **Évolutif** → on peut ajouter du collaborative filtering plus tard sans
  changer l'API côté front.

### 5.4 Roadmap algo (post-V1)

- Explications dans l'UI ("Pour toi parce que…").
- Decay temporel sur les anciens signaux.
- Diversity re-rank (pas 5 apéros à la suite dans le feed).
- Collaborative filtering hybride quand on a assez de traces.

---

## 6 — Architecture technique

### 6.1 App mobile

- **Expo / React Native** — une seule codebase iOS + Android + web.
- **Expo Router** pour la navigation typée.
- **Zustand** pour l'état applicatif (léger, testable).
- **TypeScript strict** + `noUncheckedIndexedAccess`.
- Typographies **Playfair Display** (display) + **Inter** (UI).
- Animations **Reanimated v3** sur le UI thread.
- Vidéos en boucle (onboarding) via **expo-av**.

### 6.2 Back-end

- **Node.js** (Fastify ou NestJS), **API REST** typée avec Zod.
- **PostgreSQL** (via Supabase ou Neon) avec migrations versionnées.
- **Auth** via email magic link + OAuth (Google, Apple).
- **RBAC** maison (tables roles + permissions, vérifications côté API).
- **S3-compatible storage** (Cloudflare R2 ou AWS S3) pour les assets.
- **Jobs asynchrones** (BullMQ + Redis) pour les emails, notifications,
  recalculs de recommandations en background.
- **Webhooks Stripe** pour la synchro des abonnements.

### 6.3 Trois environnements

| Environnement | Usage | URL type |
|---|---|---|
| **Dev** | Développement local + previews branches | `dev.aperosfilles.app` |
| **Staging** | Pré-prod, tests, recette Marguerite | `staging.aperosfilles.app` |
| **Production** | Vrais utilisateurs | `app.aperosfilles.app` |

- Chaque environnement a sa propre base de données, ses propres clés
  Stripe (test/test/live), ses propres workspaces Sanity/Brevo.
- **CI/CD via GitHub Actions** : sur push `main` → déploiement auto
  staging ; sur tag `v*` → déploiement production avec validation manuelle.
- **Monitoring Sentry** sur les trois environnements (erreurs front +
  back).

---

## 7 — Intégrations tierces

### 7.1 Sanity CMS (gestion de contenu)

- **3 workspaces** (un par rôle) avec schémas partagés mais permissions
  distinctes.
- Types de contenus : **Événement**, **Ville**, **Partenaire**, **Catégorie
  d'intérêt**, **Loyalty tier**, **Page éditoriale** (ex. page À propos).
- Studio customisé aux couleurs de l'app pour que Marguerite et les
  manageuses ne soient pas dépaysées.
- Publication via l'API GROQ → cache CDN côté front.

### 7.2 Brevo (emails & notifications)

- **Transactionnel** : confirmation d'inscription, reçu de paiement,
  rappel J-2 avant l'événement, confirmation d'abonnement, relance
  résiliation.
- **Templates** responsive aux couleurs de l'app.
- **Automation** : onboarding drip (J+0 bienvenue, J+3 découvre ta ville,
  J+7 première invitation à un event).
- **Newsletter** bi-mensuelle (sélection éditoriale) — pilotée depuis
  Brevo avec synchro des listes Sanity.
- **SMS** optionnel pour les rappels J-1 sur les events payants
  (engagement supérieur).

### 7.3 Stripe (paiements)

- **Stripe Subscriptions** pour l'abonnement mensuel (9,99 €).
- **Stripe Checkout** pour les tickets à l'unité.
- **Stripe Customer Portal** pour que la fille puisse gérer sa carte, son
  historique, résilier seule.
- **Webhooks** pour mettre à jour le tier de l'utilisatrice en temps réel
  (paiement réussi, paiement échoué, résiliation).
- Apple Pay / Google Pay activés pour le checkout.

### 7.4 Maps

- **Mapbox** (plus joli que Google Maps pour notre DA) pour les cards
  statiques dans la fiche événement.
- Ouverture native des applications de navigation côté device (Apple
  Maps, Google Maps, Waze) quand la fille clique sur l'adresse.

### 7.5 Autres

- **Sentry** — monitoring erreurs.
- **Plausible** (ou Mixpanel pour les events produit) — analytics.
- **Cloudflare** — CDN + protection.
- **Expo EAS** — builds + updates OTA (pas besoin de repasser par les
  stores pour les hotfix).

---

## 8 — Back-office (administration)

Un back-office web dédié, hébergé sur `admin.aperosfilles.app`, accessible
aux 3 rôles avec des vues adaptées.

### 8.1 Propriétaire

- **Dashboard** : CA abonnement mensuel, CA événements, nouvelles inscrites,
  churn, top villes.
- **Gestion financière** : remboursements, ajustements manuels.
- **Gestion des tiers** : changer la grille tarifaire sans toucher au code.
- **Centre d'équipe** : inviter / retirer des manageuses et des
  modérateurs.

### 8.2 Manageuse de ville

- **Mes événements** : création, édition, annulation, duplication.
- **Mes partenaires** : création, édition, activation / désactivation.
- **Mon dashboard ville** : inscrites, taux de remplissage, top events.
- **Export CSV** de la liste des inscrites pour la logistique.

### 8.3 Modérateur

- **File de signalements** : traiter, résoudre, classer sans suite.
- **Historique des suspensions** : actions passées et justifications.
- **Recherche utilisatrice** pour consultation.

---

## 9 — Planning : 3 sprints d'une semaine

### Semaine 1 — Fondations (Sprint 1)

**Objectif : toute l'infra est prête, l'app tourne en staging avec des
données mock.**

- Setup repos (app, api, cms, admin) + CI/CD GitHub Actions.
- Provisionnement 3 environnements (Supabase, Vercel, S3, Sentry, Brevo,
  Sanity).
- Schéma base de données + migrations initiales.
- Auth + RBAC (3 rôles).
- Sanity CMS : 3 workspaces + schémas + permissions.
- Design system finalisé + charte graphique appliquée.
- App mobile : squelette de navigation + onboarding fonctionnel.

### Semaine 2 — Cœur applicatif (Sprint 2)

**Objectif : une fille peut s'inscrire, découvrir un event, payer, avoir
son ticket.**

- Écrans Accueil, Discover, Event detail, Profil (version complète).
- Intégration Stripe (abonnement + tickets) avec webhooks.
- Feed personnalisé branché sur l'algorithme de recommandation.
- Brevo : templates transactionnels + premières automations.
- Back-office propriétaire : création d'events, gestion partenaires,
  dashboard financier.
- Tests automatisés sur les flows critiques (inscription, paiement,
  abonnement).

### Semaine 3 — Extension, modération, prod (Sprint 3)

**Objectif : l'app est complète, testée, déployée en prod.**

- Page Bons Plans + QR code des partenaires.
- Page Filles (annuaire gated).
- Back-office manageuse de ville + modérateur.
- File de signalements + audit log.
- Newsletter Brevo + drip d'onboarding.
- Analytics produit.
- QA complète (appareils iOS / Android / web).
- Soumission **TestFlight** + **Play Console internal testing**.
- Déploiement production + passage des DNS.
- Documentation utilisateur (guide Marguerite + guide manageuses).

---

## 10 — Pricing

### Forfait complet "Les Apéros Filles V1"

| Poste | HT |
|---|---|
| Architecture + 3 environnements + CI/CD | 800 € |
| App mobile (iOS / Android / web) | 1 600 € |
| Back-end API + base de données + RBAC | 1 200 € |
| Back-office (propriétaire, manageuse, modérateur) | 800 € |
| Intégrations Stripe, Brevo, Sanity, Mapbox | 400 € |
| QA, déploiement, documentation | 200 € |
| **Total HT** | **5 000 €** |
| **TVA (20 %)** | **1 000 €** |
| **Total TTC** | **6 000 €** |

Paiement en trois fois :
- **2 000 € TTC** à la signature (sprint 1).
- **2 000 € TTC** à la livraison staging en fin de sprint 2.
- **2 000 € TTC** à la livraison production en fin de sprint 3.

### Ce qui est inclus

- L'app mobile iOS + Android + web en une seule codebase.
- Le back-end complet + l'API.
- Les 3 back-offices (propriétaire, manageuse, modérateur).
- Les 3 environnements (dev / staging / prod) avec CI/CD.
- L'intégration de tous les services tiers listés.
- La mise en ligne sur l'App Store et le Play Store (je prends en charge
  les soumissions).
- La documentation utilisateur.
- **1 mois de garantie** post-livraison (correction de bugs sans frais).

### Ce qui n'est pas inclus

- Les **abonnements aux services tiers** (Stripe prend sa commission sur
  les ventes, Brevo/Sanity/Sentry/Supabase ont leurs propres plans — je te
  conseille de partir sur le tier gratuit ou premier tier payant pour la
  V1, comptez ~50-80 €/mois combinés pour démarrer).
- Les **frais de compte développeur** Apple (99 $/an) et Google (25 $ une
  fois) — à ouvrir à ton nom.
- Le **design illustrations / photos / vidéos** additionnels si on veut
  remplacer les stocks par du contenu propre.
- La **maintenance mensuelle** après le mois de garantie — on peut voir
  pour un contrat séparé si tu veux que je continue à m'occuper de l'app
  (~400 €/mois pour garder la stack à jour + petits correctifs).
- Les **nouvelles fonctionnalités hors du scope de ce document** — tout
  ajout significatif fait l'objet d'un devis complémentaire.

---

## 11 — Pour conclure

J'ai vraiment eu du plaisir à poser les premières briques ce week-end. La
direction artistique, l'algorithme de reco, la structure des pages, tout me
paraît cohérent avec ce que tu m'as décrit — chaleureux, éditorial, pensé
pour des vraies femmes et pas pour une feuille Excel.

Il reste du boulot — surtout tout ce qui n'est pas visible à l'œil nu
(back-end, rôles, intégrations, environnements). **3 semaines full-time**,
c'est tenable mais serré : ça suppose qu'on valide ensemble le périmètre de
ce document et qu'on évite les allers-retours sur le design pendant le
sprint 1.

Je suis dispo pour qu'on en parle quand tu veux.

À très vite,
**Baptiste**
