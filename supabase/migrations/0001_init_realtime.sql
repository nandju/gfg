-- GRACE's Family Games · Realtime multiplayer MVP schema
-- Tables: game_rooms, room_players, game_events
-- Realtime publication enabled on all three.
-- No auth: anonymous players identified by client-generated UUIDs.
-- Permissive RLS policies for MVP (no permanent data, rooms expire).

create extension if not exists "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.game_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  game_type text not null,
  status text not null default 'lobby',
  host_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  current_round integer not null default 1,
  current_screen text,
  game_state jsonb not null default '{}'::jsonb,
  max_players integer not null default 12,
  is_locked boolean not null default false
);

create index if not exists game_rooms_code_idx on public.game_rooms (code);
create index if not exists game_rooms_updated_idx on public.game_rooms (updated_at);

create table if not exists public.room_players (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  player_id text not null,
  player_name text not null,
  score integer not null default 0,
  eliminated boolean not null default false,
  team text,
  role text,
  connected boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, player_id)
);

create index if not exists room_players_room_idx on public.room_players (room_id);

create table if not exists public.game_events (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_events_room_idx on public.game_events (room_id, created_at desc);

-- ── Auto-update updated_at ──────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_game_rooms_updated on public.game_rooms;
create trigger trg_game_rooms_updated
  before update on public.game_rooms
  for each row execute function public.set_updated_at();

drop trigger if exists trg_room_players_updated on public.room_players;
create trigger trg_room_players_updated
  before update on public.room_players
  for each row execute function public.set_updated_at();

-- ── RLS (permissive MVP, no auth) ───────────────────────────────────────────

alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.game_events enable row level security;

drop policy if exists "anon all game_rooms" on public.game_rooms;
create policy "anon all game_rooms" on public.game_rooms
  for all to anon using (true) with check (true);

drop policy if exists "anon all room_players" on public.room_players;
create policy "anon all room_players" on public.room_players
  for all to anon using (true) with check (true);

drop policy if exists "anon all game_events" on public.game_events;
create policy "anon all game_events" on public.game_events
  for all to anon using (true) with check (true);

-- ── Realtime publication ────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.game_events;

-- ── Cleanup helper (call manually or via cron) ──────────────────────────────

create or replace function public.cleanup_stale_rooms(max_age_minutes integer default 180)
returns void language sql as $$
  delete from public.game_rooms
  where updated_at < now() - make_interval(mins => max_age_minutes);
$$;
