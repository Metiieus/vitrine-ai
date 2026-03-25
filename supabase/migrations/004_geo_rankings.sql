-- ============================================================
-- geo_rankings — Armazenar rankings por localização geográfica
-- ============================================================

create table public.geo_rankings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  keyword text not null,
  grid_row integer not null check (grid_row between 0 and 6),
  grid_col integer not null check (grid_col between 0 and 6),
  rank integer check (rank between 1 and 20),
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  neighborhood text,
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.geo_rankings enable row level security;

create policy "Usuário vê rankings dos seus negócios"
  on public.geo_rankings for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = geo_rankings.business_id and b.user_id = auth.uid()
    )
  );

-- Índices para performance
create index idx_geo_rankings_business_id on public.geo_rankings(business_id);
create index idx_geo_rankings_keyword on public.geo_rankings(keyword);
create index idx_geo_rankings_grid on public.geo_rankings(grid_row, grid_col);
