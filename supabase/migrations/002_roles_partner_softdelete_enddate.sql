-- Luna — Migration 002
-- Aligne le schéma sur le modèle arbitré dans CLAUDE.md :
--   1. rôles : enum `role` -> deux booléens indépendants is_primary / is_partner
--   2. liaison partenaire mutuelle par code (remplace les invitations par email)
--   3. soft-delete + préférences (visibilité fertilité, notifications)
--   4. period_logs : date de fin de règles
-- Migration additive : on modifie l'existant sans réécrire 001.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Rôles : is_primary / is_partner
-- ───────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists is_primary boolean not null default false,
  add column if not exists is_partner boolean not null default false;

-- Reprise des données existantes depuis l'ancien enum role
update public.profiles set is_primary = true  where role = 'primary';
update public.profiles set is_partner = true  where role = 'partner';

alter table public.profiles drop column if exists role;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Soft-delete + préférences (subtask « Soft-delete + préférences »)
-- ───────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists deactivated_at timestamptz,
  add column if not exists fertility_visible_to_partner boolean not null default false,
  add column if not exists notification_prefs jsonb not null default '{
    "period_upcoming_d2": true,
    "period_upcoming_d1": true,
    "period_day_j": true,
    "period_end_reminder": true
  }'::jsonb;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. period_logs : date de fin nullable (subtask « end_date »)
-- ───────────────────────────────────────────────────────────────────────────
alter table public.period_logs
  add column if not exists end_date date;

alter table public.period_logs
  add constraint period_logs_end_after_start
  check (end_date is null or end_date >= start_date);

-- ───────────────────────────────────────────────────────────────────────────
-- 4. Liaison partenaire mutuelle par code (subtask « Lien partenaire mutuel »)
-- ───────────────────────────────────────────────────────────────────────────
-- L'ancienne table d'invitations par email n'a plus lieu d'être.
drop table if exists public.partner_invitations;

-- Un code court, partagé manuellement, consommé par l'autre compte.
create table if not exists public.partner_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  created_by uuid references public.profiles(id) on delete cascade not null,
  consumed_by uuid references public.profiles(id) on delete set null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

alter table public.partner_links enable row level security;

-- Le créateur gère ses propres codes ; celui qui consomme voit le code qu'il a saisi.
create policy "own links" on public.partner_links for all
  using (auth.uid() = created_by);
create policy "consumer reads link" on public.partner_links for select
  using (auth.uid() = consumed_by);

-- Consommer un code : pose partner_linked_id des deux côtés (mutuel).
create or replace function public.redeem_partner_code(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_link public.partner_links%rowtype;
  v_me uuid := auth.uid();
begin
  select * into v_link
  from public.partner_links
  where code = upper(p_code)
    and consumed_by is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Code invalide ou expiré';
  end if;

  if v_link.created_by = v_me then
    raise exception 'Impossible de lier son propre code';
  end if;

  update public.partner_links
    set consumed_by = v_me, consumed_at = now()
    where id = v_link.id;

  -- Liaison mutuelle des deux profils.
  update public.profiles set partner_linked_id = v_link.created_by where id = v_me;
  update public.profiles set partner_linked_id = v_me where id = v_link.created_by;
end;
$$;

-- Délier unilatéralement : effet immédiat des deux côtés, comptes intacts.
create or replace function public.unlink_partner()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_partner uuid;
begin
  select partner_linked_id into v_partner from public.profiles where id = v_me;

  update public.profiles set partner_linked_id = null where id = v_me;
  if v_partner is not null then
    update public.profiles set partner_linked_id = null where id = v_partner;
  end if;
end;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 5. Trigger de création de profil : initialise les flags depuis le choix d'inscription
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, is_primary, is_partner)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'is_primary')::boolean, true),
    coalesce((new.raw_user_meta_data->>'is_partner')::boolean, false)
  );
  return new;
end;
$$;
