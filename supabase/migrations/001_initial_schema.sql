-- Luna — Schéma initial
-- Supabase PostgreSQL avec Row Level Security

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'primary' check (role in ('primary', 'partner')),
  name text,
  partner_linked_id uuid references public.profiles(id),
  fertility_tracking_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "partner read" on public.profiles for select using (auth.uid() = partner_linked_id);

-- Paramètres du cycle
create table public.cycle_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  last_period_start date not null,
  average_cycle_length integer not null default 28 check (average_cycle_length between 21 and 40),
  average_period_length integer not null default 5 check (average_period_length between 2 and 10),
  updated_at timestamptz not null default now()
);

alter table public.cycle_settings enable row level security;
create policy "own cycle settings" on public.cycle_settings for all using (auth.uid() = user_id);

-- Log des règles
create table public.period_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  start_date date not null,
  created_at timestamptz not null default now()
);

alter table public.period_logs enable row level security;
create policy "own period logs" on public.period_logs for all using (auth.uid() = user_id);

-- Journal
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_private boolean not null default false,
  phase text check (phase in ('winter', 'spring', 'summer', 'autumn')),
  created_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;
create policy "own entries" on public.journal_entries for all using (auth.uid() = user_id);
create policy "partner shared entries" on public.journal_entries for select using (
  is_private = false
  and exists (
    select 1 from public.profiles p where p.id = user_id and p.partner_linked_id = auth.uid()
  )
);

-- Invitations partenaire
create table public.partner_invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid references public.profiles(id) on delete cascade not null,
  invited_email text not null,
  token text not null unique default gen_random_uuid()::text,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

alter table public.partner_invitations enable row level security;
create policy "own invitations" on public.partner_invitations for all using (auth.uid() = inviter_id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'primary'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
