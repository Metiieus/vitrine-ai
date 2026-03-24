-- ============================================================
-- Vitrine.ai — Google OAuth connections
-- ============================================================

-- Armazena tokens OAuth por usuário (um por conta Google)
create table public.google_connections (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  google_account_id  text,           -- ex: "accounts/12345678"
  google_email       text,           -- email da conta Google conectada
  access_token_enc   text not null,  -- AES-256-GCM encrypted
  refresh_token_enc  text,           -- AES-256-GCM encrypted
  token_expires_at   timestamptz,
  scopes             text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id)    -- um usuário = uma conexão Google por vez
);

alter table public.google_connections enable row level security;

create policy "Usuário vê e edita sua própria conexão Google"
  on public.google_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Adiciona FK de businesses para a conexão Google
alter table public.businesses
  add column if not exists google_connection_id uuid
    references public.google_connections(id) on delete set null;

-- Índice para lookup rápido
create index if not exists idx_google_connections_user_id
  on public.google_connections(user_id);
