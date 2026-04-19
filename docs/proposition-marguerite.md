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

Pour le détail du modèle d'abonnement (freemium + engagements 1 / 3 / 6
mois), voir la section **§ 3 bis** ci-dessous — je te propose une version
revisitée que j'ai eu l'occasion de peaufiner ce week-end.

---

## 2 — Parcours utilisatrice et user stories

### 2.1 Arrivée et authentification

- **Écran d'accueil** : vidéo en boucle (ambiance apéro entre copines) avec
  une baseline éditoriale chaleureuse et un CTA unique.
- **Écran d'auth — smart, à la Tinder** :
  - Trois boutons empilés : **Google**, **Apple**, **Email** (logos
    officiels respectant les brand guidelines).
  - Pas de toggle "Créer un compte / Se connecter" en amont — on ne
    demande pas à la fille de choisir avant de savoir si elle a déjà un
    compte.
  - Si elle choisit Google ou Apple : OAuth natif, le backend détecte
    existant vs nouveau et branche automatiquement.
  - Si elle choisit Email : on lui demande son email → on vérifie en
    coulisses si un compte existe → on adapte le message suivant
    (`Ravie de te revoir, Marguerite` vs `Crée ton mot de passe`).
- La connexion sociale est la voie par défaut (moins de friction, meilleur
  taux de conversion).

### 2.2 Onboarding (sign-up uniquement)

Une fois le compte créé, on collecte en 4 étapes courtes :

1. **Prénom** (requis) et **nom** (facultatif).
2. **Ville** parmi les 5 villes (carte visuelle avec description
   éditoriale).
3. **Tranche d'âge**.
4. **Centres d'intérêt** parmi les 7 catégories (Apéro, Sport, Atelier
   créatif, Talk, Bien-être, Gastronomie, Sortie) — choix visuel via
   grosses cards photo.

Barre de progression affichée uniquement sur ces 4 étapes pour que
l'onboarding reste rapide et perçu comme tel.

### 2.3 Découverte et engagement (feed + discover)

- **Accueil** : je vois un feed personnalisé de mes prochains rendez-vous
  dans ma ville, classés par pertinence par un algorithme de
  recommandation (détails §5). Deux onglets : "À venir" / "Passés".
- **Discover** : je parcours l'offre complète dans la ville de mon choix, je
  filtre par catégorie, je cherche par mot-clé.
- Je **bookmark** des événements qui m'intéressent (avec un cœur) et je peux
  les retrouver depuis mes favoris.

### 2.4 Fiche événement et inscription

- J'ouvre la page d'un événement : photo en grand, countdown ("Dans 3 jours",
  "Demain", "Dans 5h", "En cours"), titre, date/heure, adresse (avec carte
  cliquable qui ouvre Maps), météo prévue, liste des participantes, description.
- Je peux **contacter l'organisatrice**, **partager** via le share-sheet
  natif, **sauvegarder**.
- Je m'inscris : si gratuite j'ai déjà utilisé mon event du mois → paywall,
  sinon → feuille de paiement Stripe.
- Une fois inscrite, mon ticket (QR code) est accessible directement sur la
  page de l'événement — pas besoin d'un wallet séparé.

### 2.5 Abonnement

- Sur toutes les surfaces où je suis limitée, je vois une invitation à
  rejoindre le club (card cream chaleureuse, non-agressive).
- Depuis mon profil, le bouton "Mon abonnement" ouvre un bottom-sheet avec
  mon statut (actif/inactif), la date du prochain prélèvement, un accès au
  changement de formule et à la résiliation.
- Paiement récurrent géré par **Stripe Subscriptions** (carte, SEPA,
  Apple Pay, Google Pay).

### 2.6 Bons plans (partenaires locaux)

- Je vois une sélection éditoriale d'adresses dans ma ville : cafés,
  ateliers, restaurants, bien-être, fleuristes, librairies.
- Une **card "coup de cœur"** met en avant le partenaire du moment.
- Filtres par catégorie (icônes Café, Apéro, Restaurant, Bien-être, Mode &
  Déco, Atelier, Fleurs, Librairie).
- Si je suis membre, je débloque un QR code à présenter en boutique.

### 2.7 Les filles (annuaire)

- Uniquement pour les membres : je découvre les profils des autres
  participantes de ma ville, je peux aller voir leur profil détaillé.
- La page est en preview pour les non-membres (CTA paywall).

### 2.8 Mon profil

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

## 3 bis — Modèle d'abonnement revisité (suggestion)

> Je me suis permis de repenser le modèle économique. Tout est discutable
> — on peut revenir à un abonnement mensuel simple si tu préfères.

### Pourquoi un freemium + engagements longs ?

Deux raisons business :

1. **Adhérence.** Quelqu'un qui s'engage sur 3 ou 6 mois est statistiquement
   beaucoup plus fidèle que quelqu'un qui résilie mensuellement. On lisse
   le churn et on construit une vraie communauté, pas une liste d'inscrites
   volatiles.
2. **Trésorerie.** Les formules longues encaissent cash à la signature. 6
   mois payés d'avance = 6 mois de CA disponibles pour payer les lieux,
   rémunérer les manageuses de ville, faire de l'acquisition. C'est ce qui
   différencie un business qui peut investir d'un business qui court
   après les prélèvements mensuels.

### Le freemium — Membre découverte (gratuit)

Objectif : permettre à une fille de **goûter** à l'app sans barrière, tout
en lui donnant envie de passer payante.

**Ce qu'elle obtient** :

- Accès à l'app complète (navigation, découverte, profil).
- **1 événement par mois** au prix plein.
- Lecture de la sélection "Bons Plans" (**QR code verrouillé**).
- Preview de l'annuaire (**profils détaillés verrouillés**).
- Notifications basiques (nouvel event dans sa ville).
- Feed recommandé personnalisé.

**Ce qui est limité / gated** :

- Deuxième event du mois → paywall.
- Pas de QR code partenaire actif.
- Pas d'accès aux profils individuels des autres filles.
- Pas de priorité sur les events populaires.
- Pas d'events privés / exclusifs.

### Les formules payantes — trois portes d'entrée au club

Trois formules nommées comme trois moments d'une même histoire :
découvrir, rencontrer, s'entourer. Même périmètre de fonctionnalités dans
les trois cas — seule la durée d'engagement et le prix au mois changent.

| Formule | Promesse | Durée | Prix / mois | Facturation | Économie |
|---|---|---|---|---|---|
| **L'Étincelle ✨** | Pour découvrir le concept | 1 mois | 18,90 € | 18,90 € / mois | — |
| **Le Lien 🧡** | Pour rencontrer ta prochaine acolyte | 3 mois | 15,50 € | **46,50 € tous les 3 mois** | **−18 %** |
| **La Bande 👯** | Pour te constituer ton gang de copines | 6 mois | 12,50 € | **75 € tous les 6 mois** | **−34 %** |

Encaissement **en une fois** pour Le Lien et La Bande (trésorerie
immédiate pour ta société, meilleur deal au mois pour la fille).

**Ce que déverrouille n'importe quelle formule payante** :

- Accès **illimité** aux événements (au prix membre).
- **Prix membres** : −30 à −50 % par rapport au prix plein selon l'event.
- **Tous les QR codes partenaires actifs** (Café Mokxa, Yoga Village,
  Atelier Sézane, Le Skybar, La Maison Rose…).
- **Annuaire complet** : accès aux profils détaillés des membres de la
  ville, avec leur bio, leurs centres d'intérêt.
- **Priorité d'inscription** (fenêtre de 48h avant ouverture au public sur
  les events populaires).
- Newsletter éditoriale bi-mensuelle.
- Notifications prioritaires sur les nouvelles annonces.

### Bonus fidélité — Membre fidèle

Après **6 mois d'abonnement cumulé**, la fille passe automatiquement en
statut "Fidèle" :

- **Badge fidélité** visible sur son profil et dans l'annuaire.
- **Événements exclusifs** "privés fidèles" une fois par trimestre.
- **Early access** sur les partenaires premium (nouveaux spots, soirées
  spéciales).
- **Cadeau d'anniversaire** d'abonnement (partenariat local ou goodies).

Ce statut n'a pas de surcoût — il récompense simplement la fidélité et
crée une mécanique d'aspiration saine pour les nouvelles inscrites.

### Tableau comparatif rapide

| | **Découverte** (0 €) | **Club** (à partir de 12,50 €/mois) | **Fidèle** (après 6 mois) |
|---|---|---|---|
| Navigation, discover, feed reco | ✅ | ✅ | ✅ |
| Bookmarks, favoris | ✅ | ✅ | ✅ |
| Events / mois | 1 | Illimité | Illimité |
| Prix membre sur les events | ❌ | ✅ | ✅ |
| QR partenaires | ❌ | ✅ | ✅ |
| Annuaire complet | ❌ | ✅ | ✅ |
| Priorité d'inscription | ❌ | ✅ | ✅ |
| Newsletter éditoriale | ❌ | ✅ | ✅ |
| Events exclusifs | ❌ | ❌ | ✅ |
| Badge fidélité | ❌ | ❌ | ✅ |
| Cadeau d'anniversaire | ❌ | ❌ | ✅ |

### Dans l'app, concrètement

- Les **trois formules** s'affichent ensemble sur l'écran d'abonnement,
  avec **La Bande** mise en avant ("le plus choisi", économie −34 %
  soulignée).
- La **résiliation** est possible en un clic depuis le profil (on n'est
  pas là pour retenir les filles contre leur gré — ça protège la marque).
- Les relances de fin d'engagement pour Le Lien et La Bande sont gérées
  automatiquement via **Brevo** (email J-7, J-2, J-0 avec proposition de
  renouvellement).

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

## 5 — L'intelligence derrière le feed

### C'est le cœur de l'app

Tous les produits concurrents (Meetup, Facebook Events, Eventbrite) te
proposent une **liste**. Un calendrier. Un flux chronologique. Résultat :
la fille scrolle, abandonne, et ne revient pas.

Sur **Les Apéros Filles**, l'écran d'accueil n'est pas une liste — c'est
une **sélection**. Un feed où chaque event qui remonte est là parce qu'on
a une vraie raison de penser qu'il va te plaire. C'est ce qui transforme
l'app d'un catalogue en un **petit concierge personnel**.

C'est ce qui va faire qu'une fille revient tous les jours plutôt qu'une
fois par mois — et c'est ce qui va justifier son abonnement.

### Ce que l'app apprend de toi

Sans jamais poser la question directement, l'app construit au fil du temps
un **profil de goût** pour chaque fille. Elle écoute ce qu'on lui dit
clairement, ce qu'on fait sans y penser, et ce qu'on laisse deviner.

- **Ce que tu as coché à l'onboarding** — tes centres d'intérêt déclarés.
  C'est le point de départ, mais c'est loin d'être le seul signal.
- **Ce que tu regardes** — chaque event que tu ouvres, même sans
  t'inscrire, compte comme un "hmm, ça m'intrigue".
- **Ce que tu sauvegardes** — un bookmark, c'est une intention qui n'est
  pas encore passée à l'action, mais qui compte fort.
- **Ce à quoi tu vas** — les events auxquels tu es vraiment allée sont le
  signal le plus fort : tu as voté avec tes pieds.
- **Avec qui tu y vas** — si Camille, Léa et Sophie y vont, le feed
  comprend que c'est ton cercle, et propose la prochaine sortie où elles
  seront aussi.
- **Où tu es** — les events de ta ville remontent, pas ceux d'ailleurs.
- **Quand ça se passe** — un event imminent avec peu de places est
  mécaniquement plus pertinent qu'un event dans trois mois.

Chaque geste que fait la fille nourrit l'intelligence du feed, **en
arrière-plan**. Elle n'a jamais l'impression d'être questionnée ou
surveillée — juste d'avoir une app qui "la comprend".

### Ce que ça produit concrètement

Deux exemples pour illustrer :

> **Exemple 1 — Léa, 26 ans, Lyon.**
> Elle s'est inscrite en cochant "Atelier créatif" et "Bien-être". Depuis,
> elle a assisté à 2 ateliers céramique, bookmarqué un yoga rooftop, et
> passé 30 secondes sur la page d'un apéro galentines.
>
> Son feed ce lundi matin : d'abord un atelier parfum qui vient d'ouvrir
> (match parfait sur "Atelier créatif" + 3 filles de sa liste y vont),
> puis un yoga sunset (catégorie bookmarquée + places limitées), et enfin
> un apéro rooftop à Lyon (signal faible mais son amie Camille y va).

> **Exemple 2 — Marguerite, 32 ans, Rennes.**
> Abonnée depuis 4 mois, elle va surtout à des talks et des apéros. Elle
> n'a jamais fait de sport.
>
> Son feed ne lui proposera jamais un running à 7h du matin comme
> premier event — même si le running est disponible à Rennes. L'app a
> compris qu'elle préfère les ambiances feutrées. Le sport peut
> apparaître plus bas, comme une ouverture discrète, jamais comme le
> premier choix.

### Comment c'est construit

Sans entrer dans les détails tech : on a un **score** calculé pour chaque
event à chaque rafraîchissement. Ce score additionne tous les signaux
ci-dessus (intérêts déclarés, historique, cercle social, géographie,
proximité temporelle, urgence). Le feed est trié par score décroissant.

Trois principes ont guidé le design :

1. **Transparent** — on peut expliquer à chaque fille pourquoi un event
   remonte (« parce que tu aimes les apéros et que Camille y va »). Dans
   la V2, on l'affichera sous la card.
2. **Robuste dès le jour 1** — le système fonctionne même pour une
   nouvelle inscrite sans historique (elle a ses intérêts déclarés + sa
   ville, c'est déjà assez). Pas besoin d'attendre d'avoir des données.
3. **Évolutif** — le moteur est conçu pour qu'on puisse l'enrichir sans
   tout refaire. Quand on aura 10 000 filles sur l'app et des vraies
   traces de comportement, on branchera des signaux plus sophistiqués
   (« des filles qui te ressemblent ont aussi aimé… ») sans rien casser
   côté front.

### Pourquoi c'est essentiel pour le business

Un feed personnalisé **change directement trois indicateurs clés** :

- **Le taux de clic** → la fille ouvre plus de fiches events, donc
  découvre plus de choses, donc s'inscrit plus.
- **La rétention** → elle revient tous les jours parce qu'à chaque visite
  le feed est frais et pertinent (vs. une liste statique qui ne change
  pas).
- **La conversion à l'abonnement** → dès qu'elle comprend que le feed la
  "connaît", elle n'a plus envie de tester une autre app. C'est le
  **moat** de Les Apéros Filles.

C'est aussi ce qui justifie le prix membre : **on paye pour être dans un
club qui nous comprend**, pas pour accéder à une liste qu'on pourrait
consulter ailleurs gratuitement.

### Roadmap après la V1

- **Explications dans l'UI** — petite ligne sous chaque card : « Pour toi
  parce que tu aimes les apéros + 2 copines y vont ».
- **Vieillissement naturel** des anciens signaux — une activité d'il y a
  deux ans ne pèse pas comme un bookmark de la semaine dernière.
- **Diversité du feed** — éviter mécaniquement cinq apéros à la suite.
- **Filtrage collaboratif** — quand on aura assez de filles, on ajoutera
  « les filles qui te ressemblent ont aimé ça aussi ».

Toutes ces évolutions se branchent sans recasser l'existant.

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

### 7.1 Authentification (Google, Apple, Email)

Un vrai système d'auth production-ready, pas un formulaire basique.

- **Google Sign-In** via `expo-auth-session` + Google Identity Services.
  OAuth natif iOS / Android, fallback redirect sur web. Les logos
  officiels Google sont déjà intégrés dans l'app (SVG multicolore
  respectant les brand guidelines).
- **Sign in with Apple** — **obligatoire sur iOS** dès lors qu'on propose
  Google ou Facebook (App Store Review Guidelines §4.8). Logo Apple
  officiel intégré.
- **Email / mot de passe** classique, avec possibilité d'ajouter un
  **magic link** (lien sans mot de passe envoyé par email via Brevo).
- **Détection intelligente des comptes existants** ("welcome back") — au
  lieu de demander à la fille de choisir entre "Créer un compte" / "Se
  connecter", on vérifie en coulisses si l'email qu'elle entre est connu
  et on adapte la suite. Zéro friction, UX à la Tinder / Uber.
- **Récupération de mot de passe** via email (Brevo).
- **Sessions JWT** sécurisées, refresh token côté backend, rotation
  automatique.
- Option de **liaison multi-providers** : une fille qui s'est inscrite via
  Google peut plus tard lier son email / Apple sans perdre son compte.

### 7.2 Sanity CMS (gestion de contenu)

- **3 workspaces** (un par rôle) avec schémas partagés mais permissions
  distinctes.
- Types de contenus : **Événement**, **Ville**, **Partenaire**, **Catégorie
  d'intérêt**, **Loyalty tier**, **Page éditoriale** (ex. page À propos).
- Studio customisé aux couleurs de l'app pour que Marguerite et les
  manageuses ne soient pas dépaysées.
- Publication via l'API GROQ → cache CDN côté front.

### 7.3 Brevo (emails & notifications)

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

### 7.4 Stripe (paiements)

- **Stripe Subscriptions** pour l'abonnement mensuel (9,99 €).
- **Stripe Checkout** pour les tickets à l'unité.
- **Stripe Customer Portal** pour que la fille puisse gérer sa carte, son
  historique, résilier seule.
- **Webhooks** pour mettre à jour le tier de l'utilisatrice en temps réel
  (paiement réussi, paiement échoué, résiliation).
- Apple Pay / Google Pay activés pour le checkout.

### 7.5 Maps

- **Mapbox** (plus joli que Google Maps pour notre DA) pour les cards
  statiques dans la fiche événement.
- Ouverture native des applications de navigation côté device (Apple
  Maps, Google Maps, Waze) quand la fille clique sur l'adresse.

### 7.6 Autres

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

## 9 — Planning : 3 sprints, 3 jalons

Chaque semaine correspond à un sprint **et** à un jalon de livraison. Le
paiement suit les jalons — tu ne payes rien tant que le livrable n'est
pas entre tes mains.

### Vue d'ensemble

| Jalon | Quand | Livrable observable | Paiement |
|---|---|---|---|
| **M1 — Kickoff & fondations** | Signature → fin S1 | Infra + staging accessible | 2 000 € TTC |
| **M2 — Cœur applicatif** | Fin S2 | App fonctionnelle en staging | 2 000 € TTC |
| **M3 — Mise en production** | Fin S3 | App en production + stores | 2 000 € TTC |
| **Total** | 3 semaines | — | **6 000 € TTC** |

### Sprint 1 (semaine 1) — Fondations

**Objectif :** toute l'infra est prête, l'app tourne en staging avec des
données mock.

- Setup des repos (app, api, cms, admin) + CI/CD GitHub Actions.
- Provisionnement des 3 environnements (Supabase, Vercel, S3, Sentry,
  Brevo, Sanity).
- Schéma de la base de données + migrations initiales.
- Auth (Google + Apple + Email avec détection smart) + RBAC (3 rôles).
- Sanity CMS : 3 workspaces + schémas + permissions.
- Design system finalisé + charte graphique appliquée côté front.
- App mobile : squelette de navigation + onboarding fonctionnel.

**Livrable M1 — Kickoff & fondations.** À la fin du sprint, tu peux
ouvrir l'app en staging, t'inscrire avec Google / Apple / email, et
naviguer la coquille des 5 onglets.

### Sprint 2 (semaine 2) — Cœur applicatif

**Objectif :** une fille peut découvrir un event, s'inscrire, payer,
avoir son ticket. Un abonnement peut être souscrit.

- Écrans complets Accueil, Discover, Event detail, Profil.
- Intégration Stripe : paiements unitaires + abonnements mensuels / 3
  mois / 6 mois avec webhooks.
- Feed personnalisé branché sur l'algorithme de recommandation.
- Brevo : templates transactionnels (inscription, paiement, rappel J-2)
  + premières automations.
- Back-office propriétaire : création d'events, gestion des partenaires,
  dashboard financier de base.
- Tests automatisés sur les flows critiques (inscription, paiement,
  abonnement, résiliation).

**Livrable M2 — Cœur applicatif en staging.** Tu peux jouer un parcours
complet en condition réelle sur staging (hors stores), avec des clés
Stripe de test. Recette possible avant de déclencher la prod.

### Sprint 3 (semaine 3) — Extension, modération, prod

**Objectif :** l'app est complète, QA passée, déployée en production,
disponible sur les stores.

- Page Bons Plans + QR code partenaires débloqués pour les abonnées.
- Page Filles (annuaire gated).
- Back-office manageuse de ville + modérateur.
- File de signalements + audit log sur les actions sensibles.
- Newsletter Brevo + drip d'onboarding (J+0, J+3, J+7).
- Analytics produit (événements clés : inscription, paiement, abonnement).
- QA complète sur iOS, Android, web.
- Soumission **TestFlight** (iOS) + **Play Console internal testing**.
- Déploiement production + passage des DNS.
- Documentation utilisateur (guide Marguerite + guide manageuses).

**Livrable M3 — Mise en production.** L'app est accessible à tes
premières utilisatrices. La docu est remise. Le mois de garantie démarre
ici.

---

## 10 — Pricing

> Ce pricing concerne le **développement de l'app**. Il est distinct du
> modèle d'abonnement côté utilisatrices décrit en § 3 bis.

### Détail du forfait — « Les Apéros Filles V1 »

| Poste | HT |
|---|---|
| Architecture + 3 environnements + CI/CD | 800 € |
| App mobile (iOS / Android / web, une codebase) | 1 600 € |
| Back-end API + base de données + RBAC | 1 200 € |
| Back-office (propriétaire, manageuse, modérateur) | 800 € |
| Intégrations Stripe, Brevo, Sanity, Mapbox, Auth | 400 € |
| QA, déploiement, documentation | 200 € |
| **Total HT** | **5 000 €** |
| **TVA (20 %)** | **1 000 €** |
| **Total TTC** | **6 000 €** |

### Échéancier de paiement — aligné sur les jalons

Les paiements suivent les jalons du § 9. Chaque versement est déclenché
par la **validation formelle** du livrable correspondant.

| Versement | Déclenché par | Montant TTC |
|---|---|---|
| Acompte | Signature du devis → **M1 Kickoff** | 2 000 € |
| Intermédiaire | Validation **M2 Cœur applicatif** (recette staging) | 2 000 € |
| Solde | Validation **M3 Mise en production** | 2 000 € |
| **Total** | | **6 000 €** |

Facture émise à chaque jalon, paiement sous 7 jours après validation.
En cas de non-validation d'un livrable à l'échéance, on se réunit pour
identifier le blocage — aucune sanction, on partage la responsabilité de
la recette.

### Ce qui est inclus

- L'app mobile iOS + Android + web en une seule codebase.
- Le back-end complet + l'API.
- Les 3 back-offices (propriétaire, manageuse de ville, modérateur).
- Les 3 environnements (dev / staging / prod) avec CI/CD GitHub Actions.
- L'intégration de tous les services tiers listés au § 7.
- L'auth complète (Google, Apple, Email, welcome-back intelligent).
- Le moteur de recommandation tel que décrit au § 5.
- La mise en ligne sur l'App Store et le Play Store (soumissions à ma
  charge, sous réserve que les comptes développeurs soient ouverts).
- La documentation utilisateur (guides propriétaire + manageuse).
- **1 mois de garantie** post-production (correction de bugs sans frais).

### Ce qui n'est pas inclus

- Les **abonnements aux services tiers** (Brevo, Sanity, Sentry,
  Supabase, Cloudflare…) — compter ~50 à 80 €/mois combinés pour la V1
  sur les tiers gratuit / first-paid.
- Les **commissions Stripe** sur les ventes (2,5 % + 0,25 € par transaction
  CB en France, à jour 2026).
- Les **frais des comptes développeurs** Apple (99 $/an) et Google
  Play (25 $ une fois) — à ouvrir à ton nom.
- Le **contenu propre** : photos, vidéos, illustrations personnalisées.
  On part sur des stocks Unsplash pour la V1, remplaçables plus tard.
- La **maintenance mensuelle** après le mois de garantie : un contrat
  séparé peut être mis en place (~400 €/mois pour garder la stack à jour,
  traiter les petits correctifs, assurer un temps de réponse défini).
- Les **nouvelles fonctionnalités hors du scope de ce document** : tout
  ajout significatif fait l'objet d'un devis complémentaire.

### Conditions

- Devis valable 30 jours à compter de la date d'émission.
- Démarrage sous 7 jours après signature + réception de l'acompte.
- Travaillé en pseudo full-time pendant 3 semaines consécutives.
- Communication quotidienne (courts points async) + un call hebdo de
  30 min pour valider les livrables.
- Code poussé sur un repo **GitHub** dont tu auras l'accès dès le
  premier commit.

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
