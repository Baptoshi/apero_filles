# Moteur de recommandations — doc technique

> Emplacement : `utils/recommendations.ts`
> Consommé par : `app/(tabs)/index.tsx` (onglet **À venir**)
> Dépendances : aucune (pure functions, zéro lib ML)

---

## 1. Objectif

Transformer l'onglet **À venir** de la page d'accueil en un feed personnalisé : au lieu d'une simple liste chronologique des événements auxquels la fille s'est inscrite, on affiche **les événements qui lui ressemblent**, classés par pertinence.

Les signaux pris en compte :

- ses **centres d'intérêt déclarés** à l'onboarding ;
- ses **likes / bookmarks** ;
- les **événements passés** auxquels elle a participé ;
- les événements qu'elle a **ouverts sur Discover** (signal de curiosité) ;
- les amies qu'elle **rencontre régulièrement** (graphe social léger, dérivé des events partagés) ;
- la **proximité géographique** (sa ville) et **temporelle** (dans les 14 jours) ;
- l'**urgence** (places restantes).

Les événements auxquels elle est **déjà engagée** (inscrite ou bookmarkée) sont toujours hoistés en tête du feed.

---

## 2. Pourquoi cet algo (et pas un autre)

On utilise un **recommandeur content-based léger**, implémenté comme une combinaison linéaire de features. C'est le pattern *cold-start* standard documenté dans la littérature et utilisé comme fallback par les grosses libs open-source (Mahout, LensKit, LightFM, Surprise) quand il n'y a pas encore assez de données pour entraîner un modèle de factorisation matricielle.

Références :

- Ricci, Rokach, Shapira, *Recommender Systems Handbook*, Springer 2011 — chapitre 3 « Content-Based Recommender Systems ».
- Aggarwal, *Recommender Systems: The Textbook*, Springer 2016 — chapitre 4.

**Ce qu'on gagne** :

- ✅ Zéro dépendance externe (pas de bump de la bundle-size Expo).
- ✅ Pure functions → triviales à unit-tester, déterministes.
- ✅ Transparent → on peut tracer chaque point du score, expliquer à la fille pourquoi un event remonte.
- ✅ Marche dès le premier jour même sans historique (cold-start).

**Ce qu'on perd** :

- ❌ Pas de collaborative filtering à la Spotify (« des filles comme toi ont aussi aimé… »).
- ❌ Les poids sont fixés à la main — donc ajustables mais pas appris automatiquement.

Pour un prototype à 5 villes et ~15 events, c'est largement suffisant. Quand la base grossit et qu'on a des vraies traces d'interaction, on pourra faire évoluer vers du CF hybride sans changer l'API publique (`rankEvents`).

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          app/(tabs)/index.tsx                   │
│                                                                 │
│   Home → onglet « À venir »                                     │
│   Appelle rankEvents(candidats, ctx)                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    utils/recommendations.ts                     │
│                                                                 │
│   1. buildTasteProfile(ctx)   → Map<category, weight>           │
│   2. scoreEvent(event, taste) → number                          │
│   3. rankEvents(candidates)   → Event[] triés                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     stores/useEventsStore.ts                    │
│                                                                 │
│   Source de vérité :                                            │
│     - events           : catalogue                              │
│     - bookmarks        : Set<eventId>                           │
│     - registrations    : Map<eventId, ISOdate>                  │
│     - viewed           : Set<eventId>  ← nouveau                │
└─────────────────────────────────────────────────────────────────┘
```

**Flux d'écriture du signal `viewed`** :

```
User ouvre un event (Discover, Home, deep link)
   └─▶ app/event/[id].tsx
         └─▶ useEffect → markViewed(event.id)
               └─▶ useEventsStore.viewed.add(event.id)
```

---

## 4. Signaux & poids

Définis dans `RECO_WEIGHTS` (export de `utils/recommendations.ts`). **C'est l'unique endroit à modifier pour retuner le feed.**

### 4.1 Signaux qui construisent le profil de goût

Chaque interaction ajoute un poids à la catégorie concernée.

| Signal | Poids | Rationnel |
|---|---|---|
| `declaredInterest` | **3** | Intention explicite — la fille a coché elle-même à l'onboarding. Plus fort que tout signal implicite. |
| `attendedCategory` | **2** | Elle y est vraiment allée. Truth comportementale. |
| `bookmarkCategory` | **1.5** | Like / intention d'y aller — plus faible que d'avoir assisté. |
| `viewedCategory` | **0.5** | Simple consultation sur Discover — signal de curiosité, facilement bruité. |

Un même event qui coche plusieurs cases (ex. déclaré + bookmarké + vu) cumule les poids → emphase naturelle sans tuning manuel.

### 4.2 Bonus contextuels appliqués par event

| Signal | Poids | Condition |
|---|---|---|
| `cityMatch` | **+2** | L'event est dans la ville de la fille. |
| `friendAttending` | **+0.8 / amie** | Pour chaque amie (voir §5) déjà inscrite à l'event. |
| `soonBoost` | **+1** | L'event a lieu dans les **14 jours**. |
| `urgencyBoost` | **+0.5** | Moins de **30 %** de places restantes. |
| `commitment` | **+100** | Elle est déjà inscrite, attendee, ou a bookmarké l'event. |

Le `commitment` très élevé garantit que **le feed personnel passe toujours avant les recommandations**. C'est ce qui évite qu'un event qu'elle a déjà payé se retrouve en 4ème position sous des suggestions.

---

## 5. Graphe social léger : `buildFriendIds`

La fille a un cercle implicite : les filles avec qui elle a partagé des events. Ce graphe est recalculé à la volée depuis ses events passés + bookmarkés :

```ts
function buildFriendIds(userId, events) {
  const friends = new Set<string>();
  for (const event of events) {
    for (const attendee of event.attendees) {
      if (attendee.id !== userId) friends.add(attendee.id);
    }
  }
  return friends;
}
```

Puis au scoring, le `friendAttending` additionne `+0.8` par amie présente sur l'event candidat. Un event avec 3 copines déjà inscrites gagne donc **+2.4** — souvent assez pour le remonter devant un event neutre.

---

## 6. Formule de scoring complète

```
score(event) =
    tasteProfile[event.category]            // ∈ [0, +∞[
  + (event.city == user.city    ? +2 : 0)
  + committed ? +100 : 0
  + nbFriendsAttending × 0.8
  + inNext14Days  ? +1   : 0
  + spotsLeft < 30% ? +0.5 : 0
```

**Tri** : par score décroissant. En cas d'égalité, par date ascendante (les events les plus proches d'abord).

---

## 7. Points de consommation

### 7.1 Construire le contexte (côté Home)

```ts
// app/(tabs)/index.tsx
const upcoming = rankEvents(upcomingCandidates, {
  user,
  interests: user.interests,
  attendedEvents: pastAttended,
  bookmarkedEvents,
  viewedEvents,
  committedIds,
  friendIds,
});
```

Le `useMemo` qui englobe ce calcul dépend de `[events, user, registrations, bookmarks, viewed]` → dès qu'un signal change (un bookmark toggled, un event ouvert), le feed se re-classe automatiquement.

### 7.2 Écrire le signal `viewed`

```ts
// app/event/[id].tsx
const markViewed = useEventsStore((s) => s.markViewed);
useEffect(() => {
  markViewed(event.id);
}, [event.id, markViewed]);
```

L'action `markViewed` est **idempotente** (`Set.add` → no-op si déjà dedans), donc aucun souci à l'appeler à chaque mount.

---

## 8. Edge cases & performance

- **Cold-start total** (nouvelle utilisatrice, aucun signal) : le taste profile est vide, `taste[category] = 0`. Le classement retombe sur les bonus contextuels (ville, proximité, urgence). Le feed reste donc cohérent.
- **Aucun event en ville** : la page Home filtre les candidats sur `event.city === user.city`. Si la ville n'a pas d'events upcoming, la liste est vide — c'est géré par le `ListEmptyComponent`.
- **Performance** : complexité `O(candidats × amies + candidats × interactions)`. Sur le dataset actuel (~15 events, <50 interactions) c'est sub-ms. Pas besoin de memoization au niveau du scoring.
- **Déterminisme** : `scoreEvent` accepte un paramètre `ctx.now?: number` pour fixer `Date.now()` dans les tests (sinon il utilise l'horloge système).

---

## 9. Comment ajuster le feed

### 9.1 Modifier le comportement général

Un seul endroit : `RECO_WEIGHTS` dans `utils/recommendations.ts`. Exemple — rendre le feed plus « social » :

```ts
export const RECO_WEIGHTS = {
  // …
  friendAttending: 2.0,  // était 0.8
  // …
} as const;
```

### 9.2 Ajouter un nouveau signal

1. Ajouter une entrée dans `RECO_WEIGHTS`.
2. Ajouter le champ correspondant dans `RecommendationContext` (ex. `openedNotifications: readonly Event[]`).
3. Étendre `buildTasteProfile` si c'est un signal de catégorie, sinon étendre `scoreEvent` si c'est un bonus contextuel.
4. Brancher la source côté Home dans le `useMemo`.

Exemple — signal « a cliqué sur la notif de l'event » :

```ts
// RECO_WEIGHTS
notificationClick: 1.2,

// scoreEvent
if (ctx.notificationClickIds.has(event.id)) {
  score += RECO_WEIGHTS.notificationClick;
}
```

### 9.3 Désactiver un signal temporairement

Mettre son poids à `0` — pas besoin de supprimer la branche, ça garde la liste des signaux documentée.

---

## 10. Tester

Toutes les fonctions exportées sont pures. Tests typiques à ajouter dans `__tests__/recommendations.test.ts` :

```ts
describe('buildTasteProfile', () => {
  it('cumule les poids d\'une catégorie vue sous plusieurs signaux', () => {
    const profile = buildTasteProfile({
      user: mockUser,
      interests: ['Apéro'],              // +3
      bookmarkedEvents: [aperoEvent],    // +1.5
      attendedEvents: [aperoEvent],      // +2
      viewedEvents: [aperoEvent],        // +0.5
      committedIds: new Set(),
      friendIds: new Set(),
    });
    expect(profile.get('Apéro')).toBe(7);
  });
});

describe('scoreEvent', () => {
  it('hoist toujours un event committed au-dessus de tout', () => {
    const committed = scoreEvent(event, taste, { ...ctx, committedIds: new Set([event.id]) });
    const free     = scoreEvent(event, taste, ctx);
    expect(committed).toBeGreaterThan(free + 50);
  });

  it('est déterministe avec un `now` injecté', () => {
    const now = new Date('2026-04-19').getTime();
    expect(scoreEvent(event, taste, { ...ctx, now }))
      .toBe(scoreEvent(event, taste, { ...ctx, now }));
  });
});
```

---

## 11. Roadmap

Une fois qu'on aura assez de données réelles :

- **Item-item CF** (event A souvent booké avec event B) en fallback du content-based.
- **Decay temporel** sur les signaux anciens (`attendedCategory` d'il y a 2 ans doit peser moins qu'un bookmark de la semaine).
- **Diversity re-rank** : éviter que 5 apéros remontent d'affilée — on inter-cale par catégorie sur le top-N.
- **Explanation strings** : exposer `scoreEvent` version verbose qui retourne la décomposition → afficher « Parce que tu aimes les apéros + 2 copines y vont » en dessous de la card (façon Netflix).
- **Poids appris** : entraîner les poids par descente de gradient sur un proxy (clicks / conversions) quand on a suffisamment d'interactions.

Aucune de ces évolutions ne casse l'API actuelle — on garde `rankEvents(candidates, ctx)` comme point d'entrée stable.
