-- ============================================================
-- Mercado Pago Integration — Vitrine.ai
-- ============================================================

-- Adicionar colunas para Mercado Pago na tabela profiles
alter table public.profiles 
  add column if not exists mercadopago_customer_id text,
  add column if not exists mercadopago_subscription_id text,
  drop column if exists stripe_customer_id;

-- Criar tabela de pagamentos (histórico)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mercadopago_payment_id text unique,
  mercadopago_preference_id text,
  status text not null default 'pending' 
    check (status in ('pending', 'approved', 'failed', 'refunded')),
  amount numeric(10, 2) not null,
  plan text not null check (plan in ('essential', 'pro', 'agency')),
  billing_cycle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Usuário vê seus próprios pagamentos"
  on public.payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Criar tabela de assinaturas (subscriptions)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  mercadopago_subscription_id text unique,
  plan text not null check (plan in ('free', 'essential', 'pro', 'agency')),
  status text not null default 'active'
    check (status in ('active', 'paused', 'cancelled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Usuário vê sua própria assinatura"
  on public.subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índices para performance
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_mercadopago_id on public.payments(mercadopago_payment_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_mp_id on public.subscriptions(mercadopago_subscription_id);
