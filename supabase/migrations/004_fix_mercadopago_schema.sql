-- Remover campos legados do Stripe
alter table public.profiles drop column if exists stripe_customer_id;

-- Garantir campos para Mercado Pago
alter table public.profiles 
  add column if not exists mercadopago_customer_id text,
  add column if not exists mercadopago_subscription_id text;

-- Melhorar tabela de assinaturas para recorrência
alter table public.subscriptions
  add column if not exists mercadopago_plan_id text,
  add column if not exists mercadopago_subscription_id text,
  add column if not exists cancellation_reason text,
  add column if not exists paused_at timestamptz;

-- Tabela para log de auditoria de segurança (Pilar 1)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  resource text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Apenas admins ou o próprio usuário (se permitido) podem ver seus logs
create policy "Usuário vê seus próprios logs de auditoria"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- Criar índices para performance
create index if not exists idx_subscriptions_mp_id on public.subscriptions(mercadopago_subscription_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
