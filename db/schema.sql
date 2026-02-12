-- Cricket Auction Dashboard schema (Supabase / Postgres)

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  purse_total numeric(12,2) not null default 0,
  purse_remaining numeric(12,2) not null default 0,
  players_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper')),
  photo_url text,
  base_price numeric(12,2) not null,
  status text not null default 'Available' check (status in ('Available', 'Sold', 'Unsold')),
  sold_price numeric(12,2),
  sold_team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique references public.players(id) on delete cascade,
  starting_price numeric(12,2) not null,
  current_bid numeric(12,2),
  current_team_id uuid references public.teams(id) on delete set null,
  status text not null default 'Live' check (status in ('Live', 'Closed')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  bid_amount numeric(12,2) not null,
  bid_time timestamptz not null default now()
);

create index if not exists idx_players_status on public.players(status);
create index if not exists idx_players_role on public.players(role);
create index if not exists idx_auctions_status on public.auctions(status);
create index if not exists idx_bids_auction_id on public.bids(auction_id);
create index if not exists idx_bids_bid_time on public.bids(bid_time desc);
