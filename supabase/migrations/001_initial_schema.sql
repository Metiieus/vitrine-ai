-- ============================================================
-- Vitrine.ai — Schema inicial
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  plan text not null default 'free' check (plan in ('free', 'essential', 'pro', 'agency')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuário vê e edita o próprio perfil"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cria perfil automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- businesses
-- ============================================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  google_account_id text,
  google_location_id text,
  name text not null,
  category text,
  address text,
  city text,
  state text,
  phone text,
  website text,
  google_rating numeric(3,1),
  total_reviews integer,
  last_audit_at timestamptz,
  audit_score integer check (audit_score between 0 and 100),
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "Usuário gerencia seus negócios"
  on public.businesses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- audits
-- ============================================================
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  details jsonb,
  tasks jsonb,
  created_at timestamptz not null default now()
);

alter table public.audits enable row level security;

create policy "Usuário vê auditorias dos seus negócios"
  on public.audits for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = audits.business_id and b.user_id = auth.uid()
    )
  );

-- ============================================================
-- reviews
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  google_review_id text unique,
  author_name text,
  rating integer check (rating between 1 and 5),
  text text,
  ai_response text,
  response_status text not null default 'pending'
    check (response_status in ('pending', 'generated', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Usuário gerencia reviews dos seus negócios"
  on public.reviews for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = reviews.business_id and b.user_id = auth.uid()
    )
  );

-- ============================================================
-- google_posts
-- ============================================================
create table public.google_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  content text not null,
  image_url text,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.google_posts enable row level security;

create policy "Usuário gerencia posts dos seus negócios"
  on public.google_posts for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = google_posts.business_id and b.user_id = auth.uid()
    )
  );

-- ============================================================
-- geo_checks
-- ============================================================
create table public.geo_checks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  query text not null,
  ai_platform text not null
    check (ai_platform in ('chatgpt', 'gemini', 'perplexity', 'ai_overviews')),
  found boolean not null default false,
  position integer,
  snippet text,
  checked_at timestamptz not null default now()
);

alter table public.geo_checks enable row level security;

create policy "Usuário vê GEO checks dos seus negócios"
  on public.geo_checks for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = geo_checks.business_id and b.user_id = auth.uid()
    )
  );

-- ============================================================
-- insights
-- ============================================================
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  period_start date,
  period_end date,
  searches integer,
  views integer,
  calls integer,
  direction_requests integer,
  website_clicks integer,
  created_at timestamptz not null default now()
);

alter table public.insights enable row level security;

create policy "Usuário vê insights dos seus negócios"
  on public.insights for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = insights.business_id and b.user_id = auth.uid()
    )
  );

-- ============================================================
-- Índices para performance
-- ============================================================
create index idx_businesses_user_id on public.businesses(user_id);
create index idx_audits_business_id on public.audits(business_id);
create index idx_reviews_business_id on public.reviews(business_id);
create index idx_reviews_status on public.reviews(response_status);
create index idx_google_posts_business_id on public.google_posts(business_id);
create index idx_geo_checks_business_id on public.geo_checks(business_id);
create index idx_geo_checks_platform on public.geo_checks(ai_platform);
create index idx_insights_business_id on public.insights(business_id);
