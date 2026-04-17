# Les Apéro Filles — Application Mobile V2

## Contexte

Tu développes le prototype fonctionnel de l'application mobile Les Apéro Filles, un service communautaire pour femmes qui organise des événements (apéros, sport, ateliers, talks) dans 5 villes en France (Lyon, Marseille, Toulouse, Montpellier, Rennes). L'app compte 3 900+ adhérentes et 200+ partenaires.

Ce prototype doit être **fonctionnel et réutilisable** — le code servira de base pour la vraie app. Pas de throwaway code.

---

## Stack Technique

- **Framework** : React Native + Expo (SDK 51+)
- **Langage** : TypeScript (strict mode)
- **Navigation** : Expo Router (file-based routing)
- **State** : Zustand pour le state global
- **UI** : Composants custom avec le design system ci-dessous (pas de lib UI externe)
- **Icônes** : lucide-react-native
- **Animations** : react-native-reanimated pour les micro-interactions
- **Fonts** : expo-font avec PlayfairDisplay (titres) + Inter (body)

### Structure du projet

```
app/
├── (auth)/
│   ├── onboarding.tsx
│   ├── login.tsx
│   └── subscribe.tsx
├── (tabs)/
│   ├── _layout.tsx          # Bottom tab navigator avec animations
│   ├── index.tsx            # Accueil (hub perso)
│   ├── discover.tsx         # Discover (catalogue events)
│   ├── wallet.tsx           # Bons Plans (wallet cards)
│   ├── filles.tsx           # Annuaire adhérentes
│   └── profile.tsx          # Profil perso
├── event/
│   └── [id].tsx             # Page événement détaillée (style Luma)
├── fille/
│   └── [id].tsx             # Fiche profil adhérente
├── _layout.tsx              # Root layout
└── +not-found.tsx

components/
├── ui/
│   ├── GlassCard.tsx
│   ├── PillTag.tsx
│   ├── Avatar.tsx
│   ├── AvatarStack.tsx
│   ├── Button.tsx
│   ├── IconButton.tsx
│   ├── SearchBar.tsx
│   ├── BottomSheet.tsx
│   └── QRCode.tsx
├── events/
│   ├── EventCard.tsx        # Card dans le Discover
│   ├── EventHero.tsx        # Hero visuel style Luma
│   ├── EventActions.tsx     # Rangée Mon Ticket / Contact / Partager / Plus
│   ├── AttendeesList.tsx    # Section "Qui vient ?"
│   └── TicketSheet.tsx      # Bottom sheet avec QR code du ticket
├── wallet/
│   ├── WalletCard.tsx       # Carte empilée (ticket ou bon plan)
│   └── WalletStack.tsx      # Stack de cartes animée
├── filles/
│   ├── FilleCard.tsx        # Card dans l'annuaire
│   └── FilleProfile.tsx     # Profil avec stats
├── home/
│   ├── DailyBoost.tsx       # Phrase de motivation
│   ├── MyEvents.tsx         # Toggle Upcoming/Past
│   └── BookmarksList.tsx    # Events sauvegardés
├── onboarding/
│   ├── WelcomeStep.tsx
│   ├── CityStep.tsx
│   ├── AgeStep.tsx
│   └── InterestsStep.tsx
└── layout/
    ├── TabBar.tsx           # Bottom nav custom avec animations
    └── Header.tsx           # Header avec cloche notif + avatar

constants/
├── colors.ts
├── typography.ts
└── spacing.ts

stores/
├── useAuthStore.ts          # Auth state + membership tier
├── useEventsStore.ts        # Events data + bookmarks
├── useWalletStore.ts        # Tickets + bons plans
└── useProfileStore.ts       # User profile + stats

types/
├── event.ts
├── user.ts
├── wallet.ts
└── partner.ts

data/
└── mock.ts                  # Données mock réalistes (events, users, partners)
```

---

## Design System

### Couleurs

```typescript
// constants/colors.ts
export const Colors = {
  // Brand
  orange: '#E8734A',
  peach: '#F4A261',
  terracotta: '#C65D3E',
  
  // Backgrounds
  cream: '#FFF8F0',
  warmWhite: '#FFFDF9',
  blush: '#F9E4D4',
  lightPeach: '#FDDCB5',
  
  // Text
  darkBrown: '#5C2E0E',
  brown: '#8B7355',
  muted: '#A0917E',
  
  // Glass
  glass: 'rgba(255, 248, 240, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassShadow: '0 8px 32px rgba(232, 115, 74, 0.12)',
  
  // Semantic
  success: '#4CAF50',
  warning: '#E8734A',
  danger: '#E85D4A',
  
  // Membership tiers (subtil, pas de badge)
  tierFree: '#A0917E',      // gris-brun neutre
  tierMember: '#E8734A',    // orange LAF
  tierFaithful: '#C65D3E',  // terracotta (6 mois+)
} as const;
```

### Glassmorphism

Tous les cards, modales et surfaces utilisent le glassmorphism :

```typescript
// Style de base pour GlassCard
{
  backgroundColor: 'rgba(255, 248, 240, 0.55)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.4)',
  // Sur iOS : utiliser BlurView d'expo-blur
  // Sur Android : fallback avec backgroundColor semi-transparent
  shadowColor: '#E8734A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 32,
  elevation: 8,
}
```

### Typographie

```typescript
// constants/typography.ts
export const Typography = {
  h1: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: 'PlayfairDisplay-SemiBold', fontSize: 18, lineHeight: 24 },
  body: { fontFamily: 'Inter-Regular', fontSize: 15, lineHeight: 22 },
  bodyBold: { fontFamily: 'Inter-SemiBold', fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: 'Inter-Medium', fontSize: 13, lineHeight: 18 },
  small: { fontFamily: 'Inter-Medium', fontSize: 11, lineHeight: 16 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
} as const;
```

### Spacing & Radius

```typescript
export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const Radius = { sm: 12, md: 16, lg: 20, xl: 24, full: 9999 };
```

### Icônes

Utiliser exclusivement `lucide-react-native`. Toujours : `strokeWidth={1.8}` par défaut, `size={22}` pour la nav, `size={18}` dans le contenu, `size={14}` inline avec du texte.

### Animations (react-native-reanimated)

**Bottom Tab Bar** : bounce élastique au changement d'onglet (withSpring, damping: 12, stiffness: 150). Dot indicateur au-dessus de l'onglet actif avec animation de scale. Fond arrondi derrière l'icône active avec fade.

**Cards** : scale down à 0.97 au press (withTiming, 150ms). Fade + slide-up au chargement (staggered, 100ms entre chaque card).

**Onboarding** : transition slide horizontale entre les étapes. Scale up à 1.03 sur la sélection d'un choix.

**Bookmark** : petit bounce du cœur/signet au tap.

---

## Modèle Freemium — 3 états utilisateur

### État 1 : Free (non-abonnée)

L'utilisatrice a créé un compte (passé l'onboarding) mais n'a pas d'abonnement.

**Ce qu'elle voit :**
- Accueil : daily boost visible, mais "Mes événements" montre un état vide avec CTA "Découvre les événements"
- Discover : elle voit TOUS les events avec les infos (titre, date, lieu, catégorie, prix PLEIN) mais PAS la section "Qui vient ?" (floutée avec un overlay "Réservé aux membres"). Elle peut s'inscrire à **1 event par mois max** au prix plein
- Bons Plans : elle voit les cartes partenaires mais les QR codes sont remplacés par un lock avec "Deviens membre pour débloquer"
- Filles : elle voit la liste mais ne peut pas accéder aux profils détaillés (tap → paywall)
- Profil : basique, pas de stats, pas de bookmarks, CTA "Passe au niveau supérieur" bien visible

**CTA récurrents (pas agressifs, élégants) :**
- Banner discret en haut du Discover : "Rejoins le club pour profiter de prix réduits et d'avantages exclusifs"
- Quand elle essaie d'accéder à un contenu verrouillé → écran d'abonnement

### État 2 : Écran d'abonnement (Paywall)

Écran dédié accessible depuis : le CTA du profil, les contenus verrouillés, l'onboarding post-inscription.

**Structure :**
- Titre : "Rejoins ta bande de copines"
- Sous-titre : "Événements à prix réduits, bons plans exclusifs, et une communauté qui te ressemble"
- 3 cards d'abonnement côte à côte (horizontalement scrollables ou en colonne) :

```
┌─────────────────┐
│   1 MOIS        │
│   14,99€/mois   │
│   Sans engage-  │
│   ment           │
│   [Choisir]     │
└─────────────────┘

┌─────────────────┐  ← mise en avant (border orange, badge "Populaire")
│   3 MOIS        │
│   11,99€/mois   │
│   Soit 35,97€   │
│   Économise 20% │
│   [Choisir]     │
└─────────────────┘

┌─────────────────┐
│   6 MOIS        │
│   9,99€/mois    │
│   Soit 59,94€   │
│   Économise 33% │
│   [Choisir]     │
└─────────────────┘
```

- Dessous : liste des avantages avec icônes Lucide (Check) :
  - Accès illimité aux événements à prix réduits
  - Bons plans et réductions partenaires
  - Annuaire complet des adhérentes
  - Notifications prioritaires
  - Système de fidélité

- En bas : "Déjà un compte ? Se connecter" et les conditions (CGV, politique d'annulation)
- Le paiement passe par Stripe (pas d'in-app purchase pour le proto)

### État 3 : Membre (abonnée)

Expérience complète, tout est débloqué. Les prix des events sont affichés en "prix membre" avec l'ancien prix barré à côté. Les QR codes des bons plans sont actifs. L'annuaire Filles est accessible. Le profil montre les stats et les bookmarks.

### État 4 (optionnel, subtil) : Membre fidèle (6 mois+)

Pas d'écran différent, juste une nuance visuelle subtile : l'anneau autour de l'avatar dans l'annuaire est en terracotta au lieu d'orange. C'est tout. Les filles qui sont membres depuis longtemps se distinguent naturellement sans badge explicite.

---

## Données Mock

Crée un fichier `data/mock.ts` avec des données réalistes LAF :

### Events (12 minimum, variés)

```typescript
type Event = {
  id: string;
  title: string;
  category: 'Apéro' | 'Sport' | 'Atelier créatif' | 'Talk' | 'Bien-être' | 'Gastronomie' | 'Sortie';
  date: string;          // ISO date
  time: string;          // "19h30"
  location: string;      // "Le Comptoir, Lyon 2e"
  city: 'Lyon' | 'Marseille' | 'Toulouse' | 'Montpellier' | 'Rennes';
  priceFull: number;     // prix non-membre en euros
  priceMember: number;   // prix membre en euros
  spots: number;         // places restantes
  totalSpots: number;
  description: string;
  attendees: User[];     // adhérentes inscrites
  imageGradient: string; // gradient de fallback (pas de vraies images dans le proto)
  isBookmarked: boolean;
};
```

**Exemples d'events à inclure :**
- Apéro Galentines — Le Comptoir, Lyon 2e — 19h30 — 15€ / 10€ membre
- Morning Run — Parc de la Tête d'Or, Lyon — 9h00 — 5€ / Gratuit membre
- Atelier Céramique — L'Atelier des Sens, Lyon 7e — 14h00 — 45€ / 35€ membre
- Comedy Club — Le Rideau Rouge, Lyon 1er — 20h30 — 28€ / 22€ membre
- Talk Self-Confiance — Espace Co, Lyon 3e — 18h30 — 12€ / 8€ membre
- P'tit Déj Book Club — Café Mokxa, Lyon 1er — 10h00 — 19€ / 14€ membre
- Apéro Rooftop — Le Skybar, Marseille — 19h00 — 18€ / 12€ membre
- Yoga Sunset — Plage du Prado, Marseille — 18h00 — 10€ / Gratuit membre
- Brunch Créatif — La Maison Rose, Toulouse — 11h00 — 25€ / 18€ membre
- Soirée Quiz — Le Dubliners, Rennes — 20h00 — 8€ / 5€ membre
- Atelier Cocktails — Le Shake, Montpellier — 19h30 — 30€ / 22€ membre
- Rando Découverte — Pic Saint-Loup, Montpellier — 9h00 — 8€ / Gratuit membre

### Users (20 minimum)

```typescript
type User = {
  id: string;
  firstName: string;
  age: number;
  city: string;
  bio: string;
  instagram: string;
  phone: string;
  memberSince: string;   // "mars 2024"
  eventsAttended: number;
  girlsMet: number;
  tier: 'free' | 'member' | 'faithful';  // faithful = 6 mois+
  avatarGradient: string; // gradient pour l'avatar (pas de vraies photos)
};
```

Utilise des prénoms féminins français réalistes : Marie, Sophie, Léa, Camille, Emma, Julie, Lisa, Agathe, Clara, Manon, Inès, Pauline, Charlotte, Amandine, Lucie, Sarah, Zoé, Anaïs, Marine, Eva.

### Partners (6 minimum)

```typescript
type Partner = {
  id: string;
  name: string;
  category: string;      // "Restaurant", "Bien-être", "Shopping", etc.
  offer: string;          // "-15% sur l'addition", "1 cocktail offert", etc.
  city: string;
  validUntil: string;
  gradient: string;       // gradient de la carte
};
```

---

## Sprint 1 — Fondations (semaine 1)

### Objectifs
- [ ] Init projet Expo + TypeScript + Expo Router
- [ ] Design system complet (Colors, Typography, Spacing, tous les composants UI)
- [ ] GlassCard, PillTag, Avatar, AvatarStack, Button, IconButton
- [ ] Bottom Tab Bar custom avec animations Reanimated (bounce, dot, fond actif)
- [ ] Header commun (titre page + cloche notif avec badge + avatar user)
- [ ] Onboarding complet (4 écrans : Welcome → Ville → Âge → Intérêts)
- [ ] Store Zustand pour auth (tier: free/member/faithful)
- [ ] Écran d'abonnement (paywall) avec les 3 formules
- [ ] Accueil : Daily Boost + Mes Événements (toggle Upcoming/Past) + Bookmarks
- [ ] Données mock complètes

### Critères de validation Sprint 1
- L'onboarding est fluide et animé
- La navigation entre les 5 onglets fonctionne avec les animations
- L'accueil affiche les données mock
- Le switch free/member change l'affichage (pour le dev, un toggle dans le profil)

---

## Sprint 2 — Événements (semaine 2)

### Objectifs
- [ ] Écran Discover : liste d'events avec filtres par catégorie (pills scrollables horizontalement) + SearchBar
- [ ] EventCard : visuel gradient, catégorie, titre, date/heure, lieu, prix (prix barré si membre), avatars inscrits, places restantes, bouton bookmark
- [ ] Page Événement [id] style Luma :
  - Hero avec gradient + catégorie + titre
  - Card date flottante en haut à droite
  - Infos (heure, tarif, lieu avec lien map)
  - Rangée d'actions : Mon Ticket / Contact / Partager / Plus (icônes Lucide dans des carrés arrondis gris)
  - Section "Qui vient ?" avec AvatarStack + liste de prénoms dans des pills
  - Indicateur places restantes avec code couleur
  - CTA fixe en bas "Je m'inscris" → état "Inscrite ✓"
  - Badge "Going" vert quand inscrite (comme Luma)
- [ ] Bottom sheet ticket : QR code + nom event + date + lieu (apparaît au tap sur "Mon Ticket")
- [ ] Gestion bookmark : toggle sauvegarde, sync avec store, visible dans Accueil
- [ ] Comportement Free vs Member :
  - Free : prix plein affiché, section "Qui vient ?" floutée avec overlay paywall, limite 1 event/mois
  - Member : prix réduit (ancien prix barré), tout visible

### Critères de validation Sprint 2
- On peut naviguer Discover → Event → Inscription → Ticket
- Les bookmarks se retrouvent dans l'Accueil
- La différence Free/Member est clairement visible

---

## Sprint 3 — Communauté & Wallet (semaine 3)

### Objectifs
- [ ] Onglet Bons Plans (Wallet) :
  - Stack de cartes empilées avec animation (drag/swipe pour explorer)
  - Deux sections : "Mes Tickets" (events où je suis inscrite) et "Mes Bons Plans" (partenaires)
  - Chaque carte : gradient, logo/nom partenaire, description offre, QR code
  - Tap sur carte → agrandit en plein écran avec QR code lisible
  - Free : cartes visibles mais QR codes verrouillés (lock icon)
- [ ] Onglet Filles (Annuaire) :
  - SearchBar en haut
  - Liste de cards avec : avatar (anneau coloré selon tier, subtil), prénom, âge, bio courte
  - Tap → Fiche profil :
    - Avatar grand + prénom + ville
    - Bio
    - Stats : X événements, X filles rencontrées, membre depuis
    - Instagram + téléphone
  - Free : liste visible mais tap → paywall
- [ ] Écran Profil :
  - Avatar + prénom + ville
  - Section "Mes stats" (events participés, filles rencontrées, membre depuis)
  - Section "Événements sauvegardés" (bookmarks)
  - Système de fidélité (version simple : jauge de progression avec paliers)
  - Bouton "Gérer mon abonnement"
  - Paramètres (notifications, ville, déconnexion)
  - Si Free : CTA "Passe au niveau supérieur" prominent
- [ ] Toggle dev : dans le profil, un switch caché (long press sur la version) pour basculer entre free/member/faithful — utile pour la démo

### Critères de validation Sprint 3
- Le wallet affiche les tickets et bons plans de manière élégante
- L'annuaire montre les profils avec les stats
- Le profil est complet avec les bookmarks
- Le toggle free/member/faithful change l'expérience sur TOUS les écrans

---

## Règles de développement

### Code Quality
- TypeScript strict, pas de `any`
- Chaque composant dans son propre fichier
- Props typées avec des interfaces
- Pas de styles inline dans les composants — utiliser StyleSheet.create
- Extraire les constantes magiques dans les fichiers constants/

### Performance
- Utiliser FlatList (pas ScrollView) pour les listes
- Memoizer les composants lourds avec React.memo
- Les animations doivent tourner sur le UI thread (useAnimatedStyle, pas setState)

### Accessibilité
- Tous les touchables ont un accessibilityLabel
- Les contrastes de texte respectent WCAG AA minimum
- Les tailles de touch targets sont de 44px minimum

### Convention de nommage
- Fichiers composants : PascalCase.tsx
- Fichiers utilitaires : camelCase.ts
- Dossiers : kebab-case (sauf app/ qui suit la convention Expo Router)
- Types : PascalCase avec suffixe si nécessaire (EventType, UserProfile)

---

## Ce qui est hors scope du prototype

- Vrai backend (tout est en mock local)
- Paiement Stripe réel
- Vraies notifications push
- Upload de photos
- Chat / messagerie
- Modération
- Backoffice admin
- Tests automatisés (on les ajoutera après validation du proto)
- Deep linking
- Internationalisation (tout est en français)
