# Luna — Contexte projet

App mobile de suivi du cycle menstruel, orientée bien-être et implication du partenaire.
Ton humain et bienveillant, **jamais clinique**. Ce n'est **pas** une app médicale.

> Ce fichier est la source de vérité. En cas de conflit avec
> `resources/luna_brief_claude_code.html` (brief d'origine), **ce fichier gagne** :
> le brief a été écrit avant les arbitrages ci-dessous et est obsolète sur le
> backend (.NET abandonné), le calcul de phase, et les notifications.

## Règle de code impérative

**Toujours la variante la moins complexe qui fait le travail.** Simple mais durable :
on ne veut pas refactorer toute l'architecture dans 6 mois. TypeScript strict, pas de
`any`. 1 fichier `.tsx` par écran, hooks par domaine, styles colocalisés
(`Composant.styles.ts`). Pas de logique métier dans les composants.

## Stack (arbitrée cette session)

- **Frontend** : React Native + Expo + TypeScript
- **Backend** : **Supabase seul** (Postgres managé + Auth + RLS). Pas de .NET.
- **Logique serveur** : **Supabase Edge Functions** (Deno/TS) + `pg_cron` — uniquement
  pour ce qui ne peut pas tourner côté client (notifications planifiées, plus tard
  validation d'achat). Tout le reste reste client-side.
- **Calcul de phase** : **côté client** (`src/lib/cycleEngine.ts`) pour l'UI offline.
  La même logique est rejouée côté Edge Function pour planifier les notifications.
- **Offline-first** : les données de cycle marchent 100% hors-ligne (persistance locale
  + sync Supabase). Seul le contenu en ligne (recettes, etc.) se dégrade gracieusement.
- **Cible** : iOS + Android simultané. Beta via TestFlight (iOS) + APK/Firebase (Android).

## Connexion Supabase

- **Projet** : ref `uxkbulnhwsznruvugxoh` (`https://uxkbulnhwsznruvugxoh.supabase.co`),
  repo GitHub `bwbhub/HelpHer` connecté côté Supabase.
- **Variables** (jamais committées, voir `.env.example`) :
  `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (clé *publishable*
  `sb_publishable_…`). Le client est dans `src/lib/supabase.ts`.
- **CLI** : `supabase` est en devDependency → `npx supabase …`. `supabase/config.toml`
  versionne la config locale (Postgres 17).
- **Appliquer les migrations** : `npx supabase db push` (link requis : access token +
  mot de passe DB) **ou** coller le SQL dans le SQL Editor du dashboard. Les fichiers
  `supabase/migrations/00X_*.sql` restent la source de vérité — toujours une nouvelle
  migration additive plutôt que réécrire une existante déjà appliquée.

## Modèle de rôles

Deux booléens indépendants sur le profil, **pas** un enum `role` :
- `is_primary` — suit son propre cycle
- `is_partner` — consulte le cycle d'un partenaire lié

Un utilisateur peut être l'un, l'autre, ou **les deux** (ex. deux femmes en couple :
chacune primary ET partner de l'autre). Un homme partenaire = `is_partner` seul.
Le choix se fait **à l'inscription** (1er écran : primary / partner / les deux).

## Liaison partenaire

- Relation entre deux comptes, **non gravée** dans le compte.
- Établie via un **code** généré dans l'app (partagé manuellement), saisi par l'autre.
- **Unlink unilatéral** : un seul côté suffit, effet immédiat, les deux comptes restent
  intacts. Re-liaison libre (ruptures, nouveau partenaire) sans recréer de compte.

## Visibilité des données

- Donnée **cœur = cycle uniquement** (phase, jour, logs de règles). Le reste (journal,
  humeur, énergie) est **optionnel**, jamais requis.
- Partenaire voit **toujours** : phase + jour du cycle.
- Primary peut débloquer en réglages : **fenêtre de fertilité** (off par défaut).
- Journal : visibilité **par note** (`is_private`).

## Moteur de cycle (adaptatif)

Part des moyennes utilisateur, puis **se corrige** depuis les dates réelles loggées
(début + fin de règles). Repli = 5 jours si fin non confirmée. Jour 1 = 1er jour des
règles. Wording **jamais assertif** ("autour du", "environ", "devrait"). Pas de score
de fiabilité affiché.

## Notifications (must-have MVP)

Les deux côtés (primary & partner) reçoivent, chacun configurable indépendamment :
- D-2 / D-1 : "ton cycle arrive bientôt"
- Jour J : "tes règles ont commencé ? Logge-le"
- ~durée moyenne après : "c'est terminé ? Renseigne la date de fin" → clôt le cycle,
  recalcule. Relance gentiment tant que non confirmé.

Nice-to-have (post-MVP) : suggestions contenu (recettes, activités, sport, planning).

## Auth & compte

- Email + mot de passe, **Apple Sign-In**, **Google Sign-In** (Apple obligatoire sur
  iOS dès qu'on propose Google).
- Suppression = **choix utilisateur** : soft-delete (anonymisation + réactivation) OU
  hard-delete. Actions **individuelles** : supprimer/délier un compte ne touche jamais
  le partenaire (juste unlink).

## i18n

Français en priorité, **anglais dès le MVP** (structure i18n déjà en place,
`src/i18n/fr.json`). Extraire tous les strings hardcodés des composants.

## Monétisation

Pas de paywall MVP. Éventuel achat unique à bas prix plus tard, pas d'abonnement.

## Navigation

Bottom nav flottante arrondie, ordre fixe : Phase · Rituels · Nourish · Journal.

## État du code (audit)

Voir les tickets ClickUp (liste HELPHER). En résumé : design system, 4 écrans et
auth email existent ; les écrans sont désormais branchés sur `AppDataProvider`
(couche de données). Le schéma a été migré vers `is_primary`/`is_partner`, codes de
liaison partenaire mutuels, soft-delete et `period_logs.end_date` (migration
`002_*.sql`). Restent à construire : onboarding / liaison côté app / notifications /
réglages / offline.
