-- Luna — Migration 003
-- Marqueur de complétion de l'onboarding. Non-null = l'utilisateur a fini le
-- flux multi-étapes (rôle + setup cycle / présentation partenaire). Sert au
-- navigator à router vers l'onboarding tant que c'est null.
alter table public.profiles
  add column if not exists onboarded_at timestamptz;
